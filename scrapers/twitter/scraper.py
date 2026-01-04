"""
Twitter/X Healthcare Stories Scraper
Uses Tweepy with official API
"""
import os
import re
import json
import time
import requests
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from pathlib import Path
import tweepy
from dotenv import load_dotenv
from tqdm import tqdm

# Add parent to path for utils
import sys
sys.path.insert(0, str(Path(__file__).parent.parent))

from utils.storage import get_storage
from utils.ai_extractor import extract_story_data

load_dotenv()

# Search queries for finding viral healthcare content
SEARCH_QUERIES = [
    'hospital bill -is:retweet lang:en',
    'medical bill ridiculous -is:retweet lang:en',
    'insurance denied claim -is:retweet lang:en',
    'medical debt -is:retweet lang:en',
    'healthcare america expensive -is:retweet lang:en',
    'medical tourism saved -is:retweet lang:en',
    'surgery mexico -is:retweet lang:en',
    'dental work abroad -is:retweet lang:en',
]


class TwitterScraper:
    def __init__(self):
        self.storage = get_storage()
        self.scraped_count = 0
        self.output_dir = Path(__file__).parent / 'output'
        self.output_dir.mkdir(exist_ok=True)
        
        # Initialize Tweepy client
        self.bearer_token = os.getenv('X_BEARER_TOKEN')
        self.api_key = os.getenv('X_API_KEY')
        self.api_secret = os.getenv('X_API_SECRET')
        self.access_token = os.getenv('X_ACCESS_TOKEN')
        self.access_secret = os.getenv('X_ACCESS_SECRET')
        
        if not self.bearer_token:
            raise ValueError("X_BEARER_TOKEN not set in environment")
        
        # Use v2 client
        self.client = tweepy.Client(
            bearer_token=self.bearer_token,
            consumer_key=self.api_key,
            consumer_secret=self.api_secret,
            access_token=self.access_token,
            access_token_secret=self.access_secret,
            wait_on_rate_limit=True
        )
    
    def _search_tweets(self, query: str, limit: int = 50) -> List[Dict[str, Any]]:
        """
        Search for tweets using Twitter API v2
        """
        tweets = []
        
        try:
            # Search recent tweets (last 7 days)
            response = self.client.search_recent_tweets(
                query=query,
                max_results=min(limit, 100),
                tweet_fields=['created_at', 'public_metrics', 'author_id', 'text', 'attachments'],
                expansions=['author_id', 'attachments.media_keys'],
                media_fields=['url', 'preview_image_url', 'type']
            )
            
            if not response.data:
                return []
            
            # Build lookup for users and media
            users = {u.id: u for u in (response.includes.get('users', []) or [])}
            media_lookup = {m.media_key: m for m in (response.includes.get('media', []) or [])}
            
            for tweet in response.data:
                user = users.get(tweet.author_id)
                
                # Get media URLs
                media_urls = []
                if hasattr(tweet, 'attachments') and tweet.attachments:
                    media_keys = tweet.attachments.get('media_keys', [])
                    for key in media_keys:
                        if key in media_lookup:
                            m = media_lookup[key]
                            if hasattr(m, 'url') and m.url:
                                media_urls.append(m.url)
                            elif hasattr(m, 'preview_image_url') and m.preview_image_url:
                                media_urls.append(m.preview_image_url)
                
                tweets.append({
                    'id': str(tweet.id),
                    'text': tweet.text,
                    'author_id': str(tweet.author_id),
                    'author_username': user.username if user else 'unknown',
                    'author_name': user.name if user else 'Unknown',
                    'created_at': tweet.created_at.isoformat() if tweet.created_at else None,
                    'likes': tweet.public_metrics.get('like_count', 0) if tweet.public_metrics else 0,
                    'retweets': tweet.public_metrics.get('retweet_count', 0) if tweet.public_metrics else 0,
                    'replies': tweet.public_metrics.get('reply_count', 0) if tweet.public_metrics else 0,
                    'media_urls': media_urls,
                    'url': f"https://twitter.com/{user.username if user else 'i'}/status/{tweet.id}",
                    'search_query': query,
                })
                
        except tweepy.TooManyRequests:
            print(f"Rate limited, waiting...")
            time.sleep(60)
        except Exception as e:
            print(f"Error searching tweets for '{query[:30]}...': {e}")
        
        return tweets
    
    def _download_media(self, media_urls: List[str], tweet_id: str) -> List[str]:
        """Download media and upload to storage"""
        uploaded_urls = []
        
        for i, url in enumerate(media_urls[:4]):
            try:
                response = requests.get(url, timeout=30)
                if response.status_code == 200:
                    content_type = response.headers.get('content-type', 'image/jpeg')
                    ext = '.jpg' if 'jpeg' in content_type else '.png' if 'png' in content_type else '.jpg'
                    filename = f"twitter_{tweet_id}_{i}{ext}"
                    
                    result = self.storage.upload_bytes_to_supabase(
                        data=response.content,
                        filename=filename,
                        source='twitter',
                        content_type=content_type
                    )
                    if 'public_url' in result:
                        uploaded_urls.append(result['public_url'])
            except Exception as e:
                print(f"Error downloading media: {e}")
        
        return uploaded_urls
    
    def run_full_scrape(self, tweets_per_query: int = 50) -> List[Dict[str, Any]]:
        """Run full Twitter scrape"""
        all_tweets = []
        
        print("=" * 60)
        print("OASARA TWITTER SCRAPER - DATA LIBERATION PHASE 3")
        print("=" * 60)
        
        for query in SEARCH_QUERIES:
            print(f"\nSearching: '{query[:50]}...'")
            tweets = self._search_tweets(query, tweets_per_query)
            print(f"  Found {len(tweets)} tweets")
            
            for tweet in tweets:
                # Skip duplicates
                if self.storage.story_exists(tweet['url']):
                    continue
                
                # Only include high-engagement tweets
                if tweet['likes'] < 5:
                    continue
                
                # Download media if present
                if tweet['media_urls']:
                    tweet['uploaded_media'] = self._download_media(
                        tweet['media_urls'], 
                        tweet['id']
                    )
                else:
                    tweet['uploaded_media'] = []
                
                all_tweets.append(tweet)
            
            time.sleep(2)  # Rate limiting
        
        # Deduplicate
        seen_ids = set()
        unique_tweets = []
        for t in all_tweets:
            if t['id'] not in seen_ids:
                seen_ids.add(t['id'])
                unique_tweets.append(t)
        
        print(f"\n{'=' * 60}")
        print(f"SCRAPE COMPLETE: {len(unique_tweets)} unique tweets")
        print(f"{'=' * 60}")
        
        # Save raw data
        output_file = self.output_dir / f"twitter_raw_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(output_file, 'w') as f:
            json.dump(unique_tweets, f, indent=2, default=str)
        print(f"Raw data saved to: {output_file}")
        
        return unique_tweets
    
    def extract_and_save(self, tweets: List[Dict[str, Any]]) -> int:
        """Extract structured data and save to database"""
        saved_count = 0
        
        print(f"\nExtracting and saving {len(tweets)} tweets...")
        
        for tweet in tqdm(tweets, desc="AI Extraction"):
            try:
                # Skip if too short
                if len(tweet['text']) < 50:
                    continue
                
                # Build content for AI
                full_content = f"Tweet by @{tweet['author_username']}:\n\n{tweet['text']}"
                full_content += f"\n\nEngagement: {tweet['likes']} likes, {tweet['retweets']} retweets"
                
                extracted = extract_story_data(
                    content=full_content,
                    source='twitter',
                    source_url=tweet['url'],
                    attached_images=tweet.get('uploaded_media', [])
                )
                
                if 'error' in extracted:
                    continue
                
                slug = self._generate_slug(extracted.get('title', tweet['text'][:50]))
                
                story_record = {
                    'title': extracted.get('title', tweet['text'][:100]),
                    'slug': slug,
                    'content': extracted.get('content', tweet['text']),
                    'summary': extracted.get('summary', tweet['text'][:200]),
                    'story_type': extracted.get('story_type', 'horror'),
                    'procedure_type': extracted.get('procedure'),
                    'cost_us': extracted.get('cost_us'),
                    'cost_abroad': extracted.get('cost_abroad'),
                    'images': tweet.get('uploaded_media', []),
                    'source_url': tweet['url'],
                    'source_platform': 'twitter',
                    'status': 'pending',
                    'is_scraped': True,
                    'issues': extracted.get('issues', []),
                }
                
                self.storage.insert_story(story_record)
                saved_count += 1
                
                time.sleep(1)
                
            except Exception as e:
                print(f"Error saving tweet {tweet['id']}: {e}")
        
        print(f"\n✅ Saved {saved_count} stories to database")
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
    scraper = TwitterScraper()
    
    tweets = scraper.run_full_scrape(tweets_per_query=50)
    
    if tweets:
        saved = scraper.extract_and_save(tweets)
        print(f"\n🎉 Twitter scrape complete! {saved} stories added.")
    else:
        print("\n⚠️ No tweets found to process.")


if __name__ == '__main__':
    main()
