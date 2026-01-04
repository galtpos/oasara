"""
Reddit Healthcare Stories Scraper
Uses Reddit JSON API (no auth required) + Pushshift archive
"""
import os
import re
import time
import json
import requests
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from pathlib import Path
from dotenv import load_dotenv
from tqdm import tqdm

# Add parent to path for utils
import sys
sys.path.insert(0, str(Path(__file__).parent.parent))

from utils.storage import get_storage
from utils.ai_extractor import extract_story_data

load_dotenv()

# Subreddits to scrape (healthcare focused)
SUBREDDITS = [
    'HealthInsurance',
    'healthcare',
    'medicaltourism',
    'personalfinance',
    'povertyfinance',
    'medical_advice',
    'dentistry',
    'PlasticSurgery',
    'offmychest',
    'TrueOffMyChest',
    'tifu',
    'NoStupidQuestions',
    'AskReddit',
]

# Search queries for finding relevant posts
SEARCH_QUERIES = [
    # Medical bills
    'hospital bill',
    'medical bill',
    'ER bill',
    'ambulance bill',
    'surgery bill',
    'itemized bill',
    '$50000 hospital',
    '$100000 medical',
    
    # Insurance problems
    'insurance denied',
    'insurance claim denied',
    'prior authorization',
    'health insurance nightmare',
    
    # Medical debt
    'medical debt',
    'medical bankruptcy',
    'hospital debt',
    'medical collections',
    
    # Medical tourism
    'medical tourism',
    'surgery mexico',
    'dental mexico',
    'surgery abroad',
    'treatment thailand',
    'surgery costa rica',
    'dental tijuana',
    'saved thousands surgery abroad',
    
    # Prescription costs
    'insulin cost',
    'prescription expensive',
    'drug prices',
    
    # Dental
    'dental bill',
    'root canal cost',
    'dental work abroad',
]

# Headers to mimic browser
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
}


class RedditScraper:
    def __init__(self):
        self.storage = get_storage()
        self.scraped_count = 0
        self.output_dir = Path(__file__).parent / 'output'
        self.output_dir.mkdir(exist_ok=True)
        self.session = requests.Session()
        self.session.headers.update(HEADERS)
    
    def _fetch_subreddit_json(self, subreddit: str, sort: str = 'top', time: str = 'year', limit: int = 100) -> List[Dict]:
        """Fetch posts from subreddit using JSON API"""
        posts = []
        after = None
        
        while len(posts) < limit:
            url = f"https://www.reddit.com/r/{subreddit}/{sort}.json"
            params = {
                't': time,
                'limit': min(100, limit - len(posts)),
            }
            if after:
                params['after'] = after
            
            try:
                resp = self.session.get(url, params=params, timeout=30)
                if resp.status_code == 429:
                    print(f"  Rate limited, waiting 60s...")
                    time.sleep(60)
                    continue
                resp.raise_for_status()
                data = resp.json()
                
                children = data.get('data', {}).get('children', [])
                if not children:
                    break
                
                for child in children:
                    post = child.get('data', {})
                    posts.append(post)
                
                after = data.get('data', {}).get('after')
                if not after:
                    break
                
                time.sleep(2)  # Rate limiting
                
            except Exception as e:
                print(f"  Error fetching r/{subreddit}: {e}")
                break
        
        return posts
    
    def _search_reddit_json(self, query: str, limit: int = 50) -> List[Dict]:
        """Search Reddit using JSON API"""
        posts = []
        after = None
        
        while len(posts) < limit:
            url = "https://www.reddit.com/search.json"
            params = {
                'q': query,
                'sort': 'relevance',
                't': 'year',
                'limit': min(100, limit - len(posts)),
                'type': 'link',
            }
            if after:
                params['after'] = after
            
            try:
                resp = self.session.get(url, params=params, timeout=30)
                if resp.status_code == 429:
                    print(f"  Rate limited, waiting 60s...")
                    time.sleep(60)
                    continue
                resp.raise_for_status()
                data = resp.json()
                
                children = data.get('data', {}).get('children', [])
                if not children:
                    break
                
                for child in children:
                    post = child.get('data', {})
                    posts.append(post)
                
                after = data.get('data', {}).get('after')
                if not after:
                    break
                
                time.sleep(2)
                
            except Exception as e:
                print(f"  Error searching '{query[:30]}': {e}")
                break
        
        return posts
    
    def _is_relevant(self, text: str) -> bool:
        """Quick relevance check before AI filter"""
        text_lower = text.lower()
        keywords = [
            'bill', 'cost', 'paid', 'insurance', 'hospital', 'doctor',
            'surgery', 'treatment', 'medical', 'healthcare', 'debt',
            'denied', 'coverage', 'abroad', 'mexico', 'thailand',
            'dental', 'procedure', 'prescription', 'insulin'
        ]
        return any(kw in text_lower for kw in keywords)
    
    def _extract_images(self, post: Dict) -> List[str]:
        """Extract image URLs from post data"""
        images = []
        
        # Direct image URL
        url = post.get('url', '')
        if any(ext in url.lower() for ext in ['.jpg', '.jpeg', '.png', '.gif', '.webp']):
            images.append(url)
        
        # Gallery
        if post.get('is_gallery') and post.get('media_metadata'):
            for item in post['media_metadata'].values():
                if 's' in item and 'u' in item['s']:
                    img_url = item['s']['u'].replace('&amp;', '&')
                    images.append(img_url)
        
        # Preview images
        preview = post.get('preview', {})
        if preview and 'images' in preview:
            for img in preview['images']:
                if 'source' in img and 'url' in img['source']:
                    img_url = img['source']['url'].replace('&amp;', '&')
                    images.append(img_url)
        
        return list(set(images))[:5]  # Max 5, dedupe
    
    def _download_image(self, url: str, post_id: str) -> Optional[str]:
        """Download image and upload to storage"""
        try:
            resp = self.session.get(url, timeout=30)
            if resp.status_code != 200:
                return None
            
            content_type = resp.headers.get('content-type', 'image/jpeg')
            ext = '.jpg'
            if 'png' in content_type:
                ext = '.png'
            elif 'gif' in content_type:
                ext = '.gif'
            elif 'webp' in content_type:
                ext = '.webp'
            
            filename = f"reddit_{post_id}_{hash(url) % 10000}{ext}"
            
            result = self.storage.upload_bytes(
                data=resp.content,
                filename=filename,
                source='reddit',
                content_type=content_type
            )
            
            return result.get('public_url')
            
        except Exception as e:
            print(f"  Error downloading image: {e}")
            return None
    
    def run_full_scrape(self, subreddit_limit: int = 50, search_limit: int = 30) -> List[Dict[str, Any]]:
        """Run full Reddit scrape"""
        all_posts = []
        
        print("=" * 60)
        print("OASARA REDDIT SCRAPER - DATA LIBERATION PHASE 3")
        print("Using Reddit JSON API (no auth required)")
        print("=" * 60)
        
        # Scrape subreddits
        for subreddit in SUBREDDITS:
            print(f"\nScraping r/{subreddit}...")
            raw_posts = self._fetch_subreddit_json(subreddit, limit=subreddit_limit)
            
            relevant = 0
            for post in raw_posts:
                # Build full text
                title = post.get('title', '')
                selftext = post.get('selftext', '')
                full_text = f"{title}\n\n{selftext}"
                
                # Quick relevance check
                if not self._is_relevant(full_text):
                    continue
                
                # Skip very short posts
                if len(full_text) < 100:
                    continue
                
                # Check for duplicates
                source_url = f"https://reddit.com{post.get('permalink', '')}"
                if self.storage.story_exists(source_url):
                    continue
                
                # Extract and download images
                images = self._extract_images(post)
                uploaded_images = []
                for img_url in images[:3]:
                    result = self._download_image(img_url, post.get('id', 'unknown'))
                    if result:
                        uploaded_images.append(result)
                
                post_data = {
                    'id': post.get('id'),
                    'subreddit': subreddit,
                    'title': title,
                    'content': full_text,
                    'score': post.get('score', 0),
                    'num_comments': post.get('num_comments', 0),
                    'created_utc': datetime.fromtimestamp(post.get('created_utc', 0)).isoformat(),
                    'source_url': source_url,
                    'source': 'reddit',
                    'images': uploaded_images,
                }
                
                all_posts.append(post_data)
                relevant += 1
            
            print(f"  Found {relevant} relevant posts")
            time.sleep(3)  # Be nice to Reddit
        
        # Run search queries
        for query in SEARCH_QUERIES:
            print(f"\nSearching: '{query}'...")
            raw_posts = self._search_reddit_json(query, limit=search_limit)
            
            relevant = 0
            for post in raw_posts:
                title = post.get('title', '')
                selftext = post.get('selftext', '')
                full_text = f"{title}\n\n{selftext}"
                
                if not self._is_relevant(full_text):
                    continue
                
                if len(full_text) < 100:
                    continue
                
                source_url = f"https://reddit.com{post.get('permalink', '')}"
                if self.storage.story_exists(source_url):
                    continue
                
                # Check if already in all_posts
                if any(p['id'] == post.get('id') for p in all_posts):
                    continue
                
                images = self._extract_images(post)
                uploaded_images = []
                for img_url in images[:3]:
                    result = self._download_image(img_url, post.get('id', 'unknown'))
                    if result:
                        uploaded_images.append(result)
                
                post_data = {
                    'id': post.get('id'),
                    'subreddit': post.get('subreddit', 'unknown'),
                    'title': title,
                    'content': full_text,
                    'score': post.get('score', 0),
                    'num_comments': post.get('num_comments', 0),
                    'created_utc': datetime.fromtimestamp(post.get('created_utc', 0)).isoformat(),
                    'source_url': source_url,
                    'source': 'reddit',
                    'images': uploaded_images,
                    'search_query': query,
                }
                
                all_posts.append(post_data)
                relevant += 1
            
            print(f"  Found {relevant} relevant posts")
            time.sleep(3)
        
        # Deduplicate
        seen_ids = set()
        unique_posts = []
        for post in all_posts:
            if post['id'] not in seen_ids:
                seen_ids.add(post['id'])
                unique_posts.append(post)
        
        print(f"\n{'=' * 60}")
        print(f"SCRAPE COMPLETE: {len(unique_posts)} unique posts")
        print(f"{'=' * 60}")
        
        # Save raw data
        output_file = self.output_dir / f"reddit_raw_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(output_file, 'w') as f:
            json.dump(unique_posts, f, indent=2, default=str)
        print(f"Raw data saved to: {output_file}")
        
        return unique_posts
    
    def extract_and_save(self, posts: List[Dict[str, Any]]) -> int:
        """Extract structured data with AI and save to database"""
        saved_count = 0
        rejected_count = 0
        
        print(f"\nExtracting and saving {len(posts)} posts...")
        print("(AI will filter out non-healthcare content)")
        
        for post in tqdm(posts, desc="AI Extraction"):
            try:
                # Extract with AI (includes relevance check)
                extracted = extract_story_data(
                    content=post['content'],
                    source='reddit',
                    source_url=post['source_url'],
                    attached_images=post.get('images', [])
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
                
                # Build story record
                story_record = {
                    'title': extracted.get('title', post['title'][:100]),
                    'slug': self._generate_slug(extracted.get('title', post['title'])),
                    'content': extracted.get('content', post['content']),
                    'summary': extracted.get('summary', ''),
                    'story_type': story_type,
                    'procedure_type': extracted.get('procedure'),
                    'cost_us': extracted.get('cost_us'),
                    'cost_abroad': extracted.get('cost_abroad'),
                    'country_abroad': extracted.get('country_abroad'),
                    'facility_name': extracted.get('facility_abroad'),
                    'images': post.get('images', []),
                    'source_url': post['source_url'],
                    'source_platform': 'reddit',
                    'status': 'pending',
                    'is_scraped': True,
                    'issues': extracted.get('issues', []),
                }
                
                self.storage.insert_story(story_record)
                saved_count += 1
                
                time.sleep(1)  # Rate limiting for Claude
                
            except Exception as e:
                print(f"Error saving post {post['id']}: {e}")
        
        print(f"\n✅ Saved {saved_count} stories to database")
        print(f"❌ Rejected {rejected_count} non-healthcare posts")
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
    scraper = RedditScraper()
    
    posts = scraper.run_full_scrape(
        subreddit_limit=100,
        search_limit=50
    )
    
    if posts:
        saved = scraper.extract_and_save(posts)
        print(f"\n🎉 Reddit scrape complete! {saved} stories added.")
    else:
        print("\n⚠️ No posts found to process.")


if __name__ == '__main__':
    main()
