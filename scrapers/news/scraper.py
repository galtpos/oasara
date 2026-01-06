"""
News Article Scraper for Healthcare Stories
Scrapes medical bill/healthcare horror stories from news sources

Sources:
- NPR Health
- Kaiser Health News (KFF Health News)
- ProPublica Healthcare
- Local news medical bill stories via Google News
- CNN Health
- NBC News Health
"""
import os
import re
import json
import time
import requests
from datetime import datetime
from typing import List, Dict, Any, Optional
from pathlib import Path
from dotenv import load_dotenv
from tqdm import tqdm
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse

# Add parent to path for utils
import sys
sys.path.insert(0, str(Path(__file__).parent.parent))

from utils.storage import get_storage
from utils.ai_extractor import extract_story_data

load_dotenv(override=True)

# News sources and their search/RSS endpoints
NEWS_SOURCES = {
    'kff': {
        'name': 'KFF Health News',
        'search_url': 'https://kffhealthnews.org/?s={query}',
        'base_url': 'https://kffhealthnews.org',
    },
    'npr': {
        'name': 'NPR Health',
        'search_url': 'https://www.npr.org/search?query={query}&page=1',
        'base_url': 'https://www.npr.org',
    },
    'propublica': {
        'name': 'ProPublica',
        'search_url': 'https://www.propublica.org/search?q={query}',
        'base_url': 'https://www.propublica.org',
    },
}

# Search queries for finding healthcare stories
SEARCH_QUERIES = [
    # Medical bills
    'medical bill shock',
    'hospital bill surprise',
    'emergency room bill',
    'medical debt bankruptcy',
    'itemized hospital bill',
    'healthcare costs crisis',

    # Insurance issues
    'insurance denied coverage',
    'prior authorization denied',
    'health insurance nightmare',
    'claim denied treatment',

    # Medical tourism
    'medical tourism saves',
    'surgery abroad cost',
    'dental work mexico',
    'healthcare overseas',

    # Specific procedures
    'insulin cost crisis',
    'cancer treatment cost',
    'ambulance bill shock',
]

# Google News search (returns multiple sources)
GOOGLE_NEWS_QUERIES = [
    'site:kffhealthnews.org medical bill',
    'site:npr.org medical debt',
    'site:propublica.org hospital charges',
    '"medical bill" thousands dollars',
    '"hospital charged" insurance',
    '"medical tourism" saved money',
]

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
}


class NewsScraper:
    def __init__(self):
        self.storage = get_storage()
        self.scraped_count = 0
        self.output_dir = Path(__file__).parent / 'output'
        self.output_dir.mkdir(exist_ok=True)
        self.session = requests.Session()
        self.session.headers.update(HEADERS)

    def _fetch_page(self, url: str, timeout: int = 30) -> Optional[BeautifulSoup]:
        """Fetch and parse a web page"""
        try:
            resp = self.session.get(url, timeout=timeout)
            if resp.status_code == 200:
                return BeautifulSoup(resp.text, 'html.parser')
            else:
                print(f"  HTTP {resp.status_code} for {url}")
                return None
        except Exception as e:
            print(f"  Error fetching {url}: {e}")
            return None

    def _search_google_news(self, query: str, limit: int = 10) -> List[Dict[str, str]]:
        """Search Google News for healthcare articles"""
        articles = []

        # Use DuckDuckGo HTML search (more reliable than Google)
        search_url = f"https://html.duckduckgo.com/html/?q={query.replace(' ', '+')}"

        try:
            soup = self._fetch_page(search_url)
            if not soup:
                return articles

            # Extract results
            results = soup.select('.result__a')
            for result in results[:limit]:
                href = result.get('href', '')
                title = result.get_text(strip=True)

                # Skip non-article links
                if not href or 'duckduckgo' in href:
                    continue

                # Extract actual URL from DDG redirect
                if 'uddg=' in href:
                    import urllib.parse
                    parsed = urllib.parse.parse_qs(urllib.parse.urlparse(href).query)
                    href = parsed.get('uddg', [href])[0]

                articles.append({
                    'url': href,
                    'title': title,
                    'query': query,
                })

        except Exception as e:
            print(f"  Error searching '{query}': {e}")

        return articles

    def _search_kff(self, query: str, limit: int = 10) -> List[Dict[str, str]]:
        """Search KFF Health News"""
        articles = []
        search_url = NEWS_SOURCES['kff']['search_url'].format(query=query.replace(' ', '+'))

        soup = self._fetch_page(search_url)
        if not soup:
            return articles

        # KFF search results
        results = soup.select('article a, .entry-title a, h2 a')
        seen_urls = set()

        for result in results:
            href = result.get('href', '')
            title = result.get_text(strip=True)

            if not href or href in seen_urls:
                continue
            if not href.startswith('http'):
                href = urljoin(NEWS_SOURCES['kff']['base_url'], href)
            if 'kffhealthnews.org' not in href:
                continue

            seen_urls.add(href)
            articles.append({
                'url': href,
                'title': title,
                'source': 'kff',
                'query': query,
            })

            if len(articles) >= limit:
                break

        return articles

    def _search_npr(self, query: str, limit: int = 10) -> List[Dict[str, str]]:
        """Search NPR Health"""
        articles = []
        search_url = f"https://www.npr.org/search?query={query.replace(' ', '+')}&page=1"

        soup = self._fetch_page(search_url)
        if not soup:
            return articles

        # NPR search results
        results = soup.select('article a, .title a, h2 a')
        seen_urls = set()

        for result in results:
            href = result.get('href', '')
            title = result.get_text(strip=True)

            if not href or href in seen_urls or len(title) < 10:
                continue
            if not href.startswith('http'):
                href = urljoin('https://www.npr.org', href)
            if 'npr.org' not in href:
                continue

            seen_urls.add(href)
            articles.append({
                'url': href,
                'title': title,
                'source': 'npr',
                'query': query,
            })

            if len(articles) >= limit:
                break

        return articles

    def _extract_article(self, url: str) -> Optional[Dict[str, Any]]:
        """Extract article content from a news URL"""
        # Check for duplicate first
        if self.storage.story_exists(url):
            return None

        soup = self._fetch_page(url)
        if not soup:
            return None

        # Extract title
        title = ''
        for selector in ['h1', 'meta[property="og:title"]', '.headline', '.entry-title']:
            elem = soup.select_one(selector)
            if elem:
                title = elem.get('content') if elem.name == 'meta' else elem.get_text(strip=True)
                if title:
                    break

        if not title:
            return None

        # Extract content
        content = ''

        # Try common article body selectors
        body_selectors = [
            'article .story-text',
            'article .entry-content',
            '.article-body',
            '.story-body',
            '.post-content',
            '.article__body',
            'article p',
            '.content p',
        ]

        for selector in body_selectors:
            paragraphs = soup.select(selector)
            if paragraphs:
                content = '\n\n'.join(p.get_text(strip=True) for p in paragraphs if len(p.get_text(strip=True)) > 30)
                if len(content) > 200:
                    break

        if len(content) < 100:
            # Fallback: get all paragraphs from main content
            main = soup.select_one('main, article, .content, .post')
            if main:
                paragraphs = main.find_all('p')
                content = '\n\n'.join(p.get_text(strip=True) for p in paragraphs if len(p.get_text(strip=True)) > 30)

        if len(content) < 100:
            return None

        # Extract images
        images = []
        og_image = soup.select_one('meta[property="og:image"]')
        if og_image:
            img_url = og_image.get('content')
            if img_url:
                images.append(img_url)

        # Article images
        for img in soup.select('article img, .article-body img, .story-body img')[:3]:
            src = img.get('src') or img.get('data-src')
            if src and src not in images:
                if not src.startswith('http'):
                    src = urljoin(url, src)
                images.append(src)

        # Extract publish date
        publish_date = None
        date_selectors = [
            'meta[property="article:published_time"]',
            'time[datetime]',
            '.publish-date',
            '.date',
        ]
        for selector in date_selectors:
            elem = soup.select_one(selector)
            if elem:
                date_str = elem.get('content') or elem.get('datetime') or elem.get_text(strip=True)
                if date_str:
                    publish_date = date_str
                    break

        # Extract author
        author = ''
        author_selectors = [
            'meta[name="author"]',
            '.author',
            '.byline',
            '[rel="author"]',
        ]
        for selector in author_selectors:
            elem = soup.select_one(selector)
            if elem:
                author = elem.get('content') or elem.get_text(strip=True)
                if author:
                    break

        # Determine source from URL
        domain = urlparse(url).netloc.lower()
        source_name = 'News'
        if 'kff' in domain or 'kaiser' in domain:
            source_name = 'KFF Health News'
        elif 'npr' in domain:
            source_name = 'NPR'
        elif 'propublica' in domain:
            source_name = 'ProPublica'
        elif 'cnn' in domain:
            source_name = 'CNN'
        elif 'nbc' in domain:
            source_name = 'NBC News'

        return {
            'url': url,
            'title': title,
            'content': content,
            'images': images[:5],
            'author': author,
            'publish_date': publish_date,
            'source_name': source_name,
            'source': 'news',
            'scraped_at': datetime.now().isoformat(),
        }

    def _is_healthcare_relevant(self, text: str) -> bool:
        """Quick relevance check for healthcare content"""
        text_lower = text.lower()
        keywords = [
            'bill', 'cost', 'hospital', 'insurance', 'medical', 'healthcare',
            'debt', 'denied', 'coverage', 'surgery', 'treatment', 'patient',
            'doctor', 'prescription', 'ambulance', 'emergency', 'diagnosis',
            'premium', 'deductible', 'copay', 'claim', 'itemized'
        ]
        return sum(1 for kw in keywords if kw in text_lower) >= 3

    def run_full_scrape(self, articles_per_query: int = 5) -> List[Dict[str, Any]]:
        """Run full news scrape across all sources"""
        all_articles = []
        article_urls = []

        print("=" * 60)
        print("OASARA NEWS SCRAPER - DATA LIBERATION PHASE 3")
        print("=" * 60)

        # Search KFF Health News
        print("\n📰 Searching KFF Health News...")
        for query in SEARCH_QUERIES[:8]:  # Limit queries per source
            print(f"  Query: '{query}'")
            results = self._search_kff(query, articles_per_query)
            article_urls.extend(results)
            print(f"    Found {len(results)} articles")
            time.sleep(1)

        # Search NPR
        print("\n📰 Searching NPR Health...")
        for query in SEARCH_QUERIES[:8]:
            print(f"  Query: '{query}'")
            results = self._search_npr(query, articles_per_query)
            article_urls.extend(results)
            print(f"    Found {len(results)} articles")
            time.sleep(1)

        # Search via DuckDuckGo for broader coverage
        print("\n📰 Searching news via DuckDuckGo...")
        for query in GOOGLE_NEWS_QUERIES:
            print(f"  Query: '{query}'")
            results = self._search_google_news(query, articles_per_query)
            article_urls.extend(results)
            print(f"    Found {len(results)} articles")
            time.sleep(2)

        # Deduplicate URLs
        seen_urls = set()
        unique_articles = []
        for article in article_urls:
            url = article['url']
            # Normalize URL
            url = url.split('?')[0].rstrip('/')
            if url not in seen_urls:
                seen_urls.add(url)
                unique_articles.append(article)

        print(f"\n{len(unique_articles)} unique articles to scrape")

        # Scrape each article
        for article in tqdm(unique_articles, desc="Extracting articles"):
            data = self._extract_article(article['url'])
            if data:
                # Quick relevance check
                full_text = f"{data['title']} {data['content']}"
                if self._is_healthcare_relevant(full_text):
                    data['search_query'] = article.get('query', '')
                    all_articles.append(data)
            time.sleep(1.5)

        print(f"\n{'=' * 60}")
        print(f"SCRAPE COMPLETE: {len(all_articles)} relevant articles")
        print(f"{'=' * 60}")

        # Save raw data
        output_file = self.output_dir / f"news_raw_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(output_file, 'w') as f:
            json.dump(all_articles, f, indent=2, default=str)
        print(f"Raw data saved to: {output_file}")

        return all_articles

    def extract_and_save(self, articles: List[Dict[str, Any]]) -> int:
        """Extract structured data with AI and save to database"""
        saved_count = 0
        rejected_count = 0

        print(f"\nExtracting and saving {len(articles)} articles...")
        print("(AI will filter and structure content)")

        for article in tqdm(articles, desc="AI Extraction"):
            try:
                # Skip if already exists
                if self.storage.story_exists(article['url']):
                    continue

                # Combine for AI extraction
                full_content = f"{article['title']}\n\n{article['content']}"

                extracted = extract_story_data(
                    content=full_content,
                    source='news',
                    source_url=article['url'],
                    attached_images=article.get('images', [])
                )

                # Check if rejected for relevance
                if extracted.get('rejected'):
                    rejected_count += 1
                    continue

                if 'error' in extracted:
                    continue

                # Validate story_type
                story_type = extracted.get('story_type', 'horror')
                if story_type not in ['horror', 'success', 'comparison']:
                    story_type = 'horror'

                slug = self._generate_slug(extracted.get('title', article['title']))

                # Build story record
                story_record = {
                    'title': extracted.get('title', article['title'][:100]),
                    'slug': slug,
                    'content': extracted.get('content', article['content']),
                    'summary': extracted.get('summary', ''),
                    'story_type': story_type,
                    'procedure_type': extracted.get('procedure'),
                    'cost_us': extracted.get('cost_us'),
                    'cost_abroad': extracted.get('cost_abroad'),
                    'country_abroad': extracted.get('country_abroad'),
                    'images': article.get('images', [])[:3],
                    'source_url': article['url'],
                    'source_platform': 'news',
                    'status': 'pending',
                    'is_scraped': True,
                    'issues': extracted.get('issues', []),
                }

                self.storage.insert_story(story_record)
                saved_count += 1

                time.sleep(1)  # Rate limiting for Claude API

            except Exception as e:
                print(f"Error saving article {article.get('url', 'unknown')}: {e}")

        print(f"\n✅ Saved {saved_count} stories to database")
        print(f"❌ Rejected {rejected_count} non-healthcare articles")
        return saved_count

    def _generate_slug(self, title: str) -> str:
        """Generate URL-friendly slug"""
        slug = title.lower()
        slug = re.sub(r'[^a-z0-9\s-]', '', slug)
        slug = re.sub(r'[\s_]+', '-', slug)
        slug = re.sub(r'-+', '-', slug)
        slug = slug.strip('-')[:80]
        slug = f"{slug}-{int(time.time()) % 100000}"
        return slug


def main():
    """Main entry point"""
    scraper = NewsScraper()

    articles = scraper.run_full_scrape(articles_per_query=5)

    if articles:
        saved = scraper.extract_and_save(articles)
        print(f"\n🎉 News scrape complete! {saved} stories added.")
    else:
        print("\n⚠️ No articles found to process.")


if __name__ == '__main__':
    main()
