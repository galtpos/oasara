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
# Focus on high-engagement viral content with videos
SEARCH_QUERIES = [
    # Video content - most viral
    'hospital bill has:video -is:retweet lang:en',
    'medical bill has:video -is:retweet lang:en',
    'healthcare cost has:video -is:retweet lang:en',
    'insurance denied has:video -is:retweet lang:en',
    
    # High-engagement text/image content  
    'hospital bill -is:retweet lang:en min_faves:100',
    'medical bill ridiculous -is:retweet lang:en min_faves:100',
    'insurance denied claim -is:retweet lang:en min_faves:100',
    'medical debt -is:retweet lang:en min_faves:100',
    'healthcare bankruptcy -is:retweet lang:en min_faves:50',
    
    # Medical tourism success stories
    'medical tourism saved -is:retweet lang:en',
    'surgery mexico cheaper -is:retweet lang:en',
    'dental work abroad -is:retweet lang:en',
    'treatment thailand -is:retweet lang:en',
    
    # Viral bill shock content
    '"$100,000" hospital -is:retweet lang:en',
    '"$50,000" medical -is:retweet lang:en',
    'itemized bill hospital -is:retweet lang:en',
]

# Minimum engagement for different content types
MIN_LIKES_VIDEO = 50      # Videos are valuable even with lower engagement
MIN_LIKES_IMAGE = 100     # Images need more engagement
MIN_LIKES_TEXT = 200      # Text-only needs to be very viral


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
        Now includes video URL extraction
        """
        tweets = []
        
        try:
            # Search recent tweets (last 7 days)
            # Added 'variants' to get video download URLs
            response = self.client.search_recent_tweets(
                query=query,
                max_results=min(limit, 100),
                tweet_fields=['created_at', 'public_metrics', 'author_id', 'text', 'attachments'],
                expansions=['author_id', 'attachments.media_keys'],
                media_fields=['url', 'preview_image_url', 'type', 'variants', 'duration_ms']
            )
            
            if not response.data:
                return []
            
            # Build lookup for users and media
            users = {u.id: u for u in (response.includes.get('users', []) or [])}
            media_lookup = {m.media_key: m for m in (response.includes.get('media', []) or [])}
            
            for tweet in response.data:
                user = users.get(tweet.author_id)
                
                # Get media URLs - now handles videos
                media_urls = []
                video_url = None
                has_video = False
                
                if hasattr(tweet, 'attachments') and tweet.attachments:
                    media_keys = tweet.attachments.get('media_keys', [])
                    for key in media_keys:
                        if key in media_lookup:
                            m = media_lookup[key]
                            
                            # Check if it's a video
                            if hasattr(m, 'type') and m.type == 'video':
                                has_video = True
                                # Get highest quality video variant
                                if hasattr(m, 'variants') and m.variants:
                                    # Sort by bitrate, get highest
                                    video_variants = [v for v in m.variants if v.get('content_type') == 'video/mp4']
                                    if video_variants:
                                        best = max(video_variants, key=lambda x: x.get('bit_rate', 0))
                                        video_url = best.get('url')
                                # Also get preview image as thumbnail
                                if hasattr(m, 'preview_image_url') and m.preview_image_url:
                                    media_urls.append(m.preview_image_url)
                            else:
                                # Regular image
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
                    'video_url': video_url,
                    'has_video': has_video,
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
        """Download images and upload to storage"""
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
                print(f"Error downloading image: {e}")
        
        return uploaded_urls
    
    def _download_video(self, video_url: str, tweet_id: str) -> Optional[str]:
        """Download video from Twitter and upload to storage"""
        if not video_url:
            return None
            
        try:
            # Twitter video URLs have query params, clean them for filename
            print(f"    📹 Downloading video for tweet {tweet_id}...")
            
            response = requests.get(video_url, timeout=120, stream=True)
            if response.status_code == 200:
                # Get video content
                video_content = response.content
                filename = f"twitter_{tweet_id}.mp4"
                
                # Upload to storage (NAS first, then Supabase if under limit)
                result = self.storage.upload_media(
                    file_data=video_content,
                    filename=filename,
                    source='twitter',
                    content_type='video/mp4'
                )
                
                if result.get('public_url'):
                    print(f"    ✅ Video uploaded: {result['public_url'][:60]}...")
                    return result['public_url']
                elif result.get('nas_path'):
                    # Construct tunnel URL for NAS-stored videos
                    tunnel_url = f"https://oasara-media.daylightfreedom.net/{result['nas_path']}"
                    print(f"    ✅ Video on NAS: {tunnel_url[:60]}...")
                    return tunnel_url
                    
        except requests.Timeout:
            print(f"    ⚠️ Video download timed out for {tweet_id}")
        except Exception as e:
            print(f"    ❌ Error downloading video: {e}")
        
        return None
    
    def run_full_scrape(self, tweets_per_query: int = 50) -> List[Dict[str, Any]]:
        """Run full Twitter scrape with engagement-based filtering"""
        all_tweets = []
        video_count = 0
        
        print("=" * 60)
        print("OASARA TWITTER SCRAPER - DATA LIBERATION PHASE 3")
        print("Filtering for viral content (videos, high engagement)")
        print("=" * 60)
        
        for query in SEARCH_QUERIES:
            print(f"\nSearching: '{query[:50]}...'")
            tweets = self._search_tweets(query, tweets_per_query)
            print(f"  Found {len(tweets)} tweets")
            
            for tweet in tweets:
                # Skip duplicates
                if self.storage.story_exists(tweet['url']):
                    continue
                
                # Engagement-based filtering (different thresholds by content type)
                has_video = tweet.get('has_video', False)
                has_images = len(tweet.get('media_urls', [])) > 0
                likes = tweet['likes']
                
                if has_video:
                    if likes < MIN_LIKES_VIDEO:
                        continue
                elif has_images:
                    if likes < MIN_LIKES_IMAGE:
                        continue
                else:
                    if likes < MIN_LIKES_TEXT:
                        continue
                
                print(f"  📝 Tweet {tweet['id']}: {likes} likes {'📹' if has_video else '🖼️' if has_images else '📄'}")
                
                # Download video if present
                if has_video and tweet.get('video_url'):
                    tweet['uploaded_video'] = self._download_video(
                        tweet['video_url'],
                        tweet['id']
                    )
                    if tweet['uploaded_video']:
                        video_count += 1
                else:
                    tweet['uploaded_video'] = None
                
                # Download images if present
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
        print(f"  📹 Videos: {video_count}")
        print(f"  🖼️ Images: {sum(1 for t in unique_tweets if t.get('uploaded_media'))}")
        print(f"{'=' * 60}")
        
        # Save raw data
        output_file = self.output_dir / f"twitter_raw_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(output_file, 'w') as f:
            json.dump(unique_tweets, f, indent=2, default=str)
        print(f"Raw data saved to: {output_file}")
        
        return unique_tweets
    
    def extract_and_save(self, tweets: List[Dict[str, Any]]) -> int:
        """Extract structured data and save to database with relevance filtering"""
        saved_count = 0
        rejected_count = 0
        
        print(f"\nExtracting and saving {len(tweets)} tweets...")
        print("(AI will filter out non-healthcare content)")
        
        for tweet in tqdm(tweets, desc="AI Extraction"):
            try:
                # Skip if too short
                if len(tweet['text']) < 50:
                    continue
                
                # Build content for AI
                full_content = f"Tweet by @{tweet['author_username']}:\n\n{tweet['text']}"
                full_content += f"\n\nEngagement: {tweet['likes']} likes, {tweet['retweets']} retweets"
                
                # Extract with relevance checking
                extracted = extract_story_data(
                    content=full_content,
                    source='twitter',
                    source_url=tweet['url'],
                    attached_images=tweet.get('uploaded_media', [])
                )
                
                # Check if rejected for relevance
                if extracted.get('rejected'):
                    rejected_count += 1
                    continue
                
                if 'error' in extracted:
                    continue
                
                slug = self._generate_slug(extracted.get('title', tweet['text'][:50]))
                
                # Validate story_type
                story_type = extracted.get('story_type', 'horror')
                if story_type not in ['horror', 'success', 'comparison']:
                    story_type = 'horror'
                
                story_record = {
                    'title': extracted.get('title', tweet['text'][:100]),
                    'slug': slug,
                    'content': extracted.get('content', tweet['text']),
                    'summary': extracted.get('summary', tweet['text'][:200]),
                    'story_type': story_type,
                    'procedure_type': extracted.get('procedure'),
                    'cost_us': extracted.get('cost_us'),
                    'cost_abroad': extracted.get('cost_abroad'),
                    'images': tweet.get('uploaded_media', []),
                    'video_url': tweet.get('uploaded_video'),  # Include video!
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
        print(f"❌ Rejected {rejected_count} non-healthcare tweets")
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
