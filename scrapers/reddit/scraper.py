"""
Reddit Healthcare Stories Scraper
Scrapes medical bill horror stories and medical tourism testimonials from Reddit
"""
import os
import re
import time
import json
import requests
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from pathlib import Path
import praw
from dotenv import load_dotenv
from tqdm import tqdm

# Add parent to path for utils
import sys
sys.path.insert(0, str(Path(__file__).parent.parent))

from utils.storage import get_storage
from utils.ai_extractor import extract_story_data

load_dotenv()

# Subreddits to scrape
SUBREDDITS = [
    # Medical bills / healthcare costs
    'HealthInsurance',
    'personalfinance',  # Filter for medical debt posts
    'povertyfinance',   # Filter for medical debt posts
    'medical_advice',
    'healthcare',
    'Insurance',
    
    # Medical tourism
    'medicaltourism',
    'dentistry',        # Filter for abroad posts
    'PlasticSurgery',   # Filter for abroad posts
    
    # Horror stories
    'tifu',             # Filter for medical
    'offmychest',       # Filter for medical
    'TrueOffMyChest',   # Filter for medical
]

# Search queries for finding relevant posts
SEARCH_QUERIES = [
    # Horror stories
    'medical bill',
    'hospital bill',
    'emergency room bill',
    'insurance denied',
    'surprise bill',
    'medical debt',
    'medical bankruptcy',
    'can\'t afford treatment',
    'healthcare nightmare',
    '$50000 bill',
    '$100000 bill',
    'itemized bill shock',
    
    # Medical tourism
    'surgery abroad',
    'dental work mexico',
    'medical tourism',
    'treatment in thailand',
    'hospital india',
    'cheaper overseas',
    'flew to another country for surgery',
    
    # Comparisons
    'paid X in US vs Y abroad',
    'saved thousands going abroad',
]

# Keywords to filter posts
MUST_HAVE_KEYWORDS = [
    'bill', 'cost', 'paid', 'insurance', 'hospital', 'doctor',
    'surgery', 'treatment', 'medical', 'healthcare', 'debt',
    'denied', 'coverage', 'abroad', 'mexico', 'thailand', 'india',
    'turkey', 'costa rica', 'colombia', 'dental', 'procedure'
]


class RedditScraper:
    def __init__(self):
        self.reddit = praw.Reddit(
            client_id=os.getenv('REDDIT_CLIENT_ID'),
            client_secret=os.getenv('REDDIT_CLIENT_SECRET'),
            user_agent=os.getenv('REDDIT_USER_AGENT', 'OasaraHealthcareScraper/1.0')
        )
        self.storage = get_storage()
        self.scraped_count = 0
        self.output_dir = Path(__file__).parent / 'output'
        self.output_dir.mkdir(exist_ok=True)
    
    def _is_relevant(self, text: str) -> bool:
        """Check if post contains relevant keywords"""
        text_lower = text.lower()
        return any(kw in text_lower for kw in MUST_HAVE_KEYWORDS)
    
    def _has_dollar_amount(self, text: str) -> bool:
        """Check if post mentions a dollar amount (likely has cost data)"""
        # Match patterns like $1000, $1,000, 1000 dollars, etc.
        patterns = [
            r'\$[\d,]+',
            r'[\d,]+ dollars',
            r'[\d,]+k',
        ]
        return any(re.search(p, text, re.IGNORECASE) for p in patterns)
    
    def _extract_images(self, submission) -> List[str]:
        """Extract image URLs from a Reddit submission"""
        images = []
        
        # Direct image link
        if hasattr(submission, 'url') and submission.url:
            if any(ext in submission.url.lower() for ext in ['.jpg', '.jpeg', '.png', '.gif', '.webp']):
                images.append(submission.url)
        
        # Reddit gallery
        if hasattr(submission, 'is_gallery') and submission.is_gallery:
            if hasattr(submission, 'media_metadata') and submission.media_metadata:
                for item in submission.media_metadata.values():
                    if 's' in item and 'u' in item['s']:
                        # Reddit encodes URLs, need to decode
                        url = item['s']['u'].replace('&amp;', '&')
                        images.append(url)
        
        # Preview images
        if hasattr(submission, 'preview') and submission.preview:
            try:
                preview_images = submission.preview.get('images', [])
                for img in preview_images:
                    if 'source' in img and 'url' in img['source']:
                        url = img['source']['url'].replace('&amp;', '&')
                        images.append(url)
            except:
                pass
        
        return list(set(images))  # Dedupe
    
    def _download_image(self, url: str, submission_id: str) -> Optional[Dict[str, Any]]:
        """Download an image and upload to R2"""
        try:
            response = requests.get(url, timeout=30, headers={
                'User-Agent': 'Mozilla/5.0 (compatible; OasaraScraper/1.0)'
            })
            response.raise_for_status()
            
            # Determine content type
            content_type = response.headers.get('content-type', 'image/jpeg')
            
            # Generate filename
            ext = '.jpg'
            if 'png' in content_type:
                ext = '.png'
            elif 'gif' in content_type:
                ext = '.gif'
            elif 'webp' in content_type:
                ext = '.webp'
            
            filename = f"reddit_{submission_id}_{hash(url) % 10000}{ext}"
            
            # Upload to R2
            result = self.storage.upload_bytes_to_r2(
                data=response.content,
                filename=filename,
                source='reddit',
                content_type=content_type,
                metadata={
                    'source_url': url,
                    'submission_id': submission_id
                }
            )
            
            return result
            
        except Exception as e:
            print(f"Failed to download image {url}: {e}")
            return None
    
    def scrape_subreddit(
        self,
        subreddit_name: str,
        limit: int = 100,
        time_filter: str = 'year'
    ) -> List[Dict[str, Any]]:
        """
        Scrape posts from a subreddit
        
        Args:
            subreddit_name: Name of subreddit
            limit: Max posts to fetch
            time_filter: 'hour', 'day', 'week', 'month', 'year', 'all'
            
        Returns:
            List of scraped post data
        """
        subreddit = self.reddit.subreddit(subreddit_name)
        posts = []
        
        print(f"\nScraping r/{subreddit_name}...")
        
        try:
            # Get top posts
            for submission in tqdm(subreddit.top(time_filter=time_filter, limit=limit), 
                                   desc=f"r/{subreddit_name}", total=limit):
                # Combine title and selftext
                full_text = f"{submission.title}\n\n{submission.selftext}"
                
                # Filter for relevance
                if not self._is_relevant(full_text):
                    continue
                
                # Prioritize posts with dollar amounts
                has_costs = self._has_dollar_amount(full_text)
                
                # Extract images
                images = self._extract_images(submission)
                
                # Download images to R2
                uploaded_images = []
                for img_url in images[:5]:  # Max 5 images per post
                    result = self._download_image(img_url, submission.id)
                    if result:
                        uploaded_images.append(result['public_url'])
                
                # Check for duplicates
                source_url = f"https://reddit.com{submission.permalink}"
                if self.storage.story_exists(source_url):
                    print(f"Skipping duplicate: {source_url}")
                    continue
                
                post_data = {
                    'id': submission.id,
                    'subreddit': subreddit_name,
                    'title': submission.title,
                    'content': full_text,
                    'score': submission.score,
                    'num_comments': submission.num_comments,
                    'created_utc': datetime.fromtimestamp(submission.created_utc).isoformat(),
                    'source_url': source_url,
                    'source': 'reddit',
                    'has_costs': has_costs,
                    'images': uploaded_images,
                    'original_images': images,
                }
                
                posts.append(post_data)
                self.scraped_count += 1
                
                # Rate limiting
                time.sleep(0.5)
                
        except Exception as e:
            print(f"Error scraping r/{subreddit_name}: {e}")
        
        return posts
    
    def search_reddit(self, query: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Search all of Reddit for a query"""
        posts = []
        
        print(f"\nSearching Reddit for: '{query}'")
        
        try:
            for submission in tqdm(self.reddit.subreddit('all').search(
                query, 
                sort='relevance', 
                time_filter='year',
                limit=limit
            ), desc=f"Search: {query[:30]}", total=limit):
                
                full_text = f"{submission.title}\n\n{submission.selftext}"
                
                if not self._is_relevant(full_text):
                    continue
                
                images = self._extract_images(submission)
                
                # Download images
                uploaded_images = []
                for img_url in images[:3]:
                    result = self._download_image(img_url, submission.id)
                    if result:
                        uploaded_images.append(result['public_url'])
                
                source_url = f"https://reddit.com{submission.permalink}"
                if self.storage.story_exists(source_url):
                    continue
                
                post_data = {
                    'id': submission.id,
                    'subreddit': submission.subreddit.display_name,
                    'title': submission.title,
                    'content': full_text,
                    'score': submission.score,
                    'num_comments': submission.num_comments,
                    'created_utc': datetime.fromtimestamp(submission.created_utc).isoformat(),
                    'source_url': source_url,
                    'source': 'reddit',
                    'has_costs': self._has_dollar_amount(full_text),
                    'images': uploaded_images,
                    'search_query': query,
                }
                
                posts.append(post_data)
                self.scraped_count += 1
                
                time.sleep(0.5)
                
        except Exception as e:
            print(f"Error searching for '{query}': {e}")
        
        return posts
    
    def run_full_scrape(self, subreddit_limit: int = 100, search_limit: int = 50) -> List[Dict[str, Any]]:
        """Run a full scrape of all configured sources"""
        all_posts = []
        
        print("=" * 60)
        print("OASARA REDDIT SCRAPER - DATA LIBERATION PHASE 3")
        print("=" * 60)
        
        # Scrape each subreddit
        for subreddit in SUBREDDITS:
            posts = self.scrape_subreddit(subreddit, limit=subreddit_limit)
            all_posts.extend(posts)
            print(f"  Found {len(posts)} relevant posts")
        
        # Run search queries
        for query in SEARCH_QUERIES:
            posts = self.search_reddit(query, limit=search_limit)
            all_posts.extend(posts)
            print(f"  Found {len(posts)} relevant posts")
        
        # Deduplicate by submission ID
        seen_ids = set()
        unique_posts = []
        for post in all_posts:
            if post['id'] not in seen_ids:
                seen_ids.add(post['id'])
                unique_posts.append(post)
        
        print(f"\n{'=' * 60}")
        print(f"SCRAPE COMPLETE: {len(unique_posts)} unique posts found")
        print(f"{'=' * 60}")
        
        # Save raw data locally
        output_file = self.output_dir / f"reddit_raw_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(output_file, 'w') as f:
            json.dump(unique_posts, f, indent=2)
        print(f"Raw data saved to: {output_file}")
        
        return unique_posts
    
    def extract_and_save(self, posts: List[Dict[str, Any]]) -> int:
        """Extract structured data and save to database"""
        saved_count = 0
        
        print(f"\nExtracting and saving {len(posts)} posts...")
        
        for post in tqdm(posts, desc="AI Extraction"):
            try:
                # Extract structured data using Claude
                extracted = extract_story_data(
                    content=post['content'],
                    source='reddit',
                    source_url=post['source_url'],
                    attached_images=post.get('images', [])
                )
                
                if 'error' in extracted:
                    print(f"Extraction error for {post['id']}: {extracted['error']}")
                    continue
                
                # Add Reddit-specific metadata
                extracted['reddit_score'] = post.get('score', 0)
                extracted['reddit_comments'] = post.get('num_comments', 0)
                extracted['subreddit'] = post.get('subreddit', '')
                
                # Map to database schema
                story_record = {
                    'title': extracted.get('title', post['title'][:100]),
                    'slug': self._generate_slug(extracted.get('title', post['title'])),
                    'content': extracted.get('content', post['content']),
                    'summary': extracted.get('summary', ''),
                    'story_type': extracted.get('story_type', 'horror'),
                    'procedure_type': extracted.get('procedure'),
                    'cost_us': extracted.get('cost_us'),
                    'cost_abroad': extracted.get('cost_abroad'),
                    'country_abroad': extracted.get('country_abroad'),
                    'facility_name': extracted.get('facility_abroad'),
                    'images': extracted.get('images', []),
                    'source_url': post['source_url'],
                    'source_platform': 'reddit',
                    'status': 'pending',  # Requires review
                    'is_scraped': True,
                    'emotional_tags': extracted.get('emotional_tags', []),
                    'issues': extracted.get('issues', []),
                    'viral_score': extracted.get('viral_score', 5),
                    'key_quote': extracted.get('key_quote'),
                    'insurance_involved': extracted.get('insurance_involved', False),
                    'insurance_denied': extracted.get('insurance_denied', False),
                }
                
                # Save to database
                self.storage.insert_story(story_record)
                saved_count += 1
                
                # Rate limiting for Claude API
                time.sleep(2)
                
            except Exception as e:
                print(f"Error saving post {post['id']}: {e}")
        
        print(f"\n✅ Saved {saved_count} stories to database")
        return saved_count
    
    def _generate_slug(self, title: str) -> str:
        """Generate URL-friendly slug from title"""
        import re
        slug = title.lower()
        slug = re.sub(r'[^a-z0-9\s-]', '', slug)
        slug = re.sub(r'[\s_]+', '-', slug)
        slug = re.sub(r'-+', '-', slug)
        slug = slug.strip('-')[:80]
        # Add timestamp for uniqueness
        slug = f"{slug}-{int(time.time()) % 100000}"
        return slug


def main():
    """Main entry point for Reddit scraper"""
    scraper = RedditScraper()
    
    # Run full scrape
    posts = scraper.run_full_scrape(
        subreddit_limit=50,   # 50 posts per subreddit
        search_limit=30       # 30 posts per search query
    )
    
    # Extract and save to database
    if posts:
        saved = scraper.extract_and_save(posts)
        print(f"\n🎉 Reddit scrape complete! {saved} stories added to database.")
    else:
        print("\n⚠️ No posts found to process.")


if __name__ == '__main__':
    main()

