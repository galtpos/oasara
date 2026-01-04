"""
Twitter/X Healthcare Stories Scraper
Uses snscrape for public data (no API key required) + official API for media
"""
import os
import re
import json
import time
import requests
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from pathlib import Path
import subprocess
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
    # Viral bill shock
    '"hospital bill" ($10000 OR $20000 OR $50000 OR $100000)',
    '"medical bill" shocked',
    '"emergency room" bill ridiculous',
    '"insurance denied" my claim',
    '"surprise bill"',
    '"medical debt" story',
    '"healthcare in america"',
    '"this is what healthcare costs"',
    
    # Medical tourism success
    '"dental work" mexico saved',
    '"surgery" abroad "saved thousands"',
    '"medical tourism" experience',
    '"flew to" surgery (mexico OR thailand OR turkey OR colombia)',
    
    # Viral threads
    '"thread" healthcare costs',
    '"🧵" medical bill',
    
    # Comparisons
    '"in the US" vs abroad medical',
    '"paid $" "would have cost"',
]

# Accounts that frequently post healthcare horror stories
KEY_ACCOUNTS = [
    'MorePerfectUS',      # Healthcare advocacy
    'WendellPotter',      # Former insurance exec turned whistleblower
    'HealthCareCost',     # Healthcare costs
    'PatientRights',      # Patient advocacy
    'MedicalBillHell',    # Medical bill stories
]


class TwitterScraper:
    def __init__(self):
        self.storage = get_storage()
        self.scraped_count = 0
        self.output_dir = Path(__file__).parent / 'output'
        self.output_dir.mkdir(exist_ok=True)
        
        # Bearer token for media downloads (optional)
        self.bearer_token = os.getenv('TWITTER_BEARER_TOKEN')
    
    def _run_snscrape(self, query: str, limit: int = 100) -> List[Dict[str, Any]]:
        """
        Run snscrape to get tweets
        Uses subprocess since snscrape CLI is more reliable
        """
        tweets = []
        
        try:
            # Build snscrape command
            cmd = [
                'snscrape',
                '--jsonl',
                '--max-results', str(limit),
                'twitter-search',
                f'{query} lang:en'
            ]
            
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=120
            )
            
            if result.returncode != 0:
                print(f"snscrape error: {result.stderr}")
                return []
            
            # Parse JSONL output
            for line in result.stdout.strip().split('\n'):
                if line:
                    try:
                        tweet = json.loads(line)
                        tweets.append(tweet)
                    except json.JSONDecodeError:
                        continue
            
        except subprocess.TimeoutExpired:
            print(f"Timeout for query: {query}")
        except FileNotFoundError:
            print("snscrape not installed. Install with: pip install snscrape")
        except Exception as e:
            print(f"Error running snscrape: {e}")
        
        return tweets
    
    def _extract_media_urls(self, tweet: Dict[str, Any]) -> List[str]:
        """Extract media URLs from snscrape tweet object"""
        urls = []
        
        # Check for media in the tweet
        if 'media' in tweet and tweet['media']:
            for media in tweet['media']:
                if media.get('_type') == 'snscrape.modules.twitter.Photo':
                    urls.append(media.get('fullUrl') or media.get('previewUrl', ''))
                elif media.get('_type') == 'snscrape.modules.twitter.Video':
                    # Get highest quality video variant
                    variants = media.get('variants', [])
                    video_variants = [v for v in variants if v.get('contentType') == 'video/mp4']
                    if video_variants:
                        # Sort by bitrate, get highest
                        video_variants.sort(key=lambda x: x.get('bitrate', 0), reverse=True)
                        urls.append(video_variants[0].get('url', ''))
        
        return [u for u in urls if u]
    
    def _download_media(self, url: str, tweet_id: str) -> Optional[Dict[str, Any]]:
        """Download media and upload to R2"""
        try:
            response = requests.get(url, timeout=60, headers={
                'User-Agent': 'Mozilla/5.0 (compatible; OasaraScraper/1.0)'
            })
            response.raise_for_status()
            
            content_type = response.headers.get('content-type', 'image/jpeg')
            
            # Determine extension
            if 'video' in content_type:
                ext = '.mp4'
            elif 'png' in content_type:
                ext = '.png'
            elif 'gif' in content_type:
                ext = '.gif'
            else:
                ext = '.jpg'
            
            filename = f"twitter_{tweet_id}_{hash(url) % 10000}{ext}"
            
            result = self.storage.upload_bytes_to_r2(
                data=response.content,
                filename=filename,
                source='twitter',
                content_type=content_type,
                metadata={
                    'source_url': url,
                    'tweet_id': tweet_id
                }
            )
            
            return result
            
        except Exception as e:
            print(f"Failed to download media {url[:50]}: {e}")
            return None
    
    def _has_cost_data(self, text: str) -> bool:
        """Check if tweet mentions dollar amounts"""
        patterns = [
            r'\$[\d,]+',
            r'[\d,]+\s*dollars',
            r'[\d,]+k',
        ]
        return any(re.search(p, text, re.IGNORECASE) for p in patterns)
    
    def _calculate_virality(self, tweet: Dict[str, Any]) -> int:
        """Calculate virality score based on engagement"""
        likes = tweet.get('likeCount', 0) or 0
        retweets = tweet.get('retweetCount', 0) or 0
        replies = tweet.get('replyCount', 0) or 0
        quotes = tweet.get('quoteCount', 0) or 0
        
        # Weighted engagement score
        engagement = likes + (retweets * 3) + (replies * 2) + (quotes * 2)
        
        if engagement > 10000:
            return 10
        elif engagement > 5000:
            return 9
        elif engagement > 1000:
            return 8
        elif engagement > 500:
            return 7
        elif engagement > 100:
            return 6
        elif engagement > 50:
            return 5
        else:
            return 4
    
    def scrape_query(self, query: str, limit: int = 100) -> List[Dict[str, Any]]:
        """Scrape tweets matching a query"""
        print(f"\nSearching Twitter: '{query[:50]}...'")
        
        raw_tweets = self._run_snscrape(query, limit)
        processed = []
        
        for tweet in tqdm(raw_tweets, desc="Processing tweets"):
            try:
                tweet_id = str(tweet.get('id', ''))
                content = tweet.get('rawContent', '') or tweet.get('content', '')
                
                if not content or len(content) < 50:
                    continue
                
                # Get tweet URL
                source_url = tweet.get('url', f"https://twitter.com/i/status/{tweet_id}")
                
                # Check for duplicate
                if self.storage.story_exists(source_url):
                    continue
                
                # Extract and download media
                media_urls = self._extract_media_urls(tweet)
                uploaded_media = []
                
                for media_url in media_urls[:4]:  # Max 4 media items
                    result = self._download_media(media_url, tweet_id)
                    if result:
                        uploaded_media.append(result['public_url'])
                
                # Build tweet data
                tweet_data = {
                    'id': tweet_id,
                    'content': content,
                    'username': tweet.get('user', {}).get('username', ''),
                    'display_name': tweet.get('user', {}).get('displayname', ''),
                    'created_at': tweet.get('date', ''),
                    'source_url': source_url,
                    'source': 'twitter',
                    'likes': tweet.get('likeCount', 0),
                    'retweets': tweet.get('retweetCount', 0),
                    'replies': tweet.get('replyCount', 0),
                    'quotes': tweet.get('quoteCount', 0),
                    'has_costs': self._has_cost_data(content),
                    'images': uploaded_media,
                    'original_media': media_urls,
                    'virality_score': self._calculate_virality(tweet),
                    'search_query': query,
                }
                
                processed.append(tweet_data)
                self.scraped_count += 1
                
            except Exception as e:
                print(f"Error processing tweet: {e}")
                continue
        
        return processed
    
    def scrape_account(self, username: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Scrape tweets from a specific account"""
        query = f"from:{username}"
        return self.scrape_query(query, limit)
    
    def run_full_scrape(self, query_limit: int = 50, account_limit: int = 30) -> List[Dict[str, Any]]:
        """Run full Twitter scrape"""
        all_tweets = []
        
        print("=" * 60)
        print("OASARA TWITTER SCRAPER - DATA LIBERATION PHASE 3")
        print("=" * 60)
        
        # Search queries
        for query in SEARCH_QUERIES:
            tweets = self.scrape_query(query, query_limit)
            all_tweets.extend(tweets)
            print(f"  Found {len(tweets)} tweets")
            time.sleep(2)  # Rate limiting
        
        # Key accounts
        for account in KEY_ACCOUNTS:
            tweets = self.scrape_account(account, account_limit)
            all_tweets.extend(tweets)
            print(f"  Found {len(tweets)} tweets from @{account}")
            time.sleep(2)
        
        # Deduplicate
        seen_ids = set()
        unique_tweets = []
        for tweet in all_tweets:
            if tweet['id'] not in seen_ids:
                seen_ids.add(tweet['id'])
                unique_tweets.append(tweet)
        
        # Sort by virality
        unique_tweets.sort(key=lambda x: x.get('virality_score', 0), reverse=True)
        
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
                extracted = extract_story_data(
                    content=tweet['content'],
                    source='twitter',
                    source_url=tweet['source_url'],
                    attached_images=tweet.get('images', [])
                )
                
                if 'error' in extracted:
                    continue
                
                # Generate slug
                slug = self._generate_slug(extracted.get('title', tweet['content'][:50]))
                
                story_record = {
                    'title': extracted.get('title', tweet['content'][:100]),
                    'slug': slug,
                    'content': extracted.get('content', tweet['content']),
                    'summary': extracted.get('summary', ''),
                    'story_type': extracted.get('story_type', 'horror'),
                    'procedure_type': extracted.get('procedure'),
                    'cost_us': extracted.get('cost_us'),
                    'cost_abroad': extracted.get('cost_abroad'),
                    'country_abroad': extracted.get('country_abroad'),
                    'facility_name': extracted.get('facility_abroad'),
                    'images': extracted.get('images', []),
                    'source_url': tweet['source_url'],
                    'source_platform': 'twitter',
                    'status': 'pending',
                    'is_scraped': True,
                    'emotional_tags': extracted.get('emotional_tags', []),
                    'issues': extracted.get('issues', []),
                    'viral_score': tweet.get('virality_score', 5),
                    'key_quote': extracted.get('key_quote'),
                    'twitter_likes': tweet.get('likes', 0),
                    'twitter_retweets': tweet.get('retweets', 0),
                    'twitter_username': tweet.get('username', ''),
                }
                
                self.storage.insert_story(story_record)
                saved_count += 1
                
                time.sleep(2)  # Claude rate limiting
                
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
    
    tweets = scraper.run_full_scrape(
        query_limit=50,
        account_limit=30
    )
    
    if tweets:
        saved = scraper.extract_and_save(tweets)
        print(f"\n🎉 Twitter scrape complete! {saved} stories added.")
    else:
        print("\n⚠️ No tweets found to process.")


if __name__ == '__main__':
    main()

