"""
GoFundMe Medical Campaigns Scraper
Scrapes medical fundraising campaigns showing healthcare costs and desperation
"""
import os
import re
import json
import time
import requests
from datetime import datetime
from typing import List, Dict, Any, Optional
from pathlib import Path
from bs4 import BeautifulSoup
from dotenv import load_dotenv
from tqdm import tqdm

# Add parent to path for utils
import sys
sys.path.insert(0, str(Path(__file__).parent.parent))

from utils.storage import get_storage
from utils.ai_extractor import extract_story_data

load_dotenv()

# Search terms for medical campaigns
SEARCH_TERMS = [
    'medical bills',
    'hospital bills',
    'surgery costs',
    'cancer treatment',
    'chemotherapy costs',
    'emergency surgery',
    'medical debt',
    'insurance denied',
    'insurance won\'t cover',
    'can\'t afford treatment',
    'help with medical',
    'life saving surgery',
    'transplant costs',
    'out of pocket medical',
]

# Categories on GoFundMe
MEDICAL_CATEGORIES = [
    'medical',
    'medical-illness-healing',
    'accidents-emergencies',
]


class GoFundMeScraper:
    def __init__(self):
        self.storage = get_storage()
        self.output_dir = Path(__file__).parent / 'output'
        self.output_dir.mkdir(exist_ok=True)
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
        })
    
    def _search_campaigns(self, query: str, limit: int = 50) -> List[Dict[str, Any]]:
        """
        Search GoFundMe for campaigns
        Note: GoFundMe doesn't have a public API, so we scrape search results
        """
        campaigns = []
        
        # GoFundMe search URL
        search_url = f"https://www.gofundme.com/s"
        params = {
            'q': query,
            'country': 'US',
        }
        
        try:
            response = self.session.get(search_url, params=params, timeout=30)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.text, 'lxml')
            
            # Find campaign cards (structure may change)
            # GoFundMe uses React, so we look for data in script tags or rendered HTML
            campaign_links = soup.find_all('a', href=re.compile(r'/f/[a-zA-Z0-9-]+'))
            
            seen_urls = set()
            for link in campaign_links[:limit]:
                href = link.get('href', '')
                if not href or href in seen_urls:
                    continue
                
                full_url = f"https://www.gofundme.com{href}" if href.startswith('/') else href
                seen_urls.add(href)
                
                campaigns.append({
                    'url': full_url,
                    'search_query': query,
                })
            
        except Exception as e:
            print(f"Error searching GoFundMe for '{query}': {e}")
        
        return campaigns
    
    def _scrape_campaign(self, url: str) -> Optional[Dict[str, Any]]:
        """
        Scrape a single GoFundMe campaign page
        """
        try:
            response = self.session.get(url, timeout=30)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.text, 'lxml')
            
            # Extract campaign data
            # Title
            title_elem = soup.find('h1', class_=re.compile(r'campaign-title|heading'))
            title = title_elem.get_text(strip=True) if title_elem else ''
            
            if not title:
                # Try meta tag
                og_title = soup.find('meta', property='og:title')
                title = og_title.get('content', '') if og_title else ''
            
            # Description/story
            story_elem = soup.find('div', class_=re.compile(r'story|description|campaign-description'))
            story = story_elem.get_text(strip=True, separator='\n') if story_elem else ''
            
            if not story:
                # Try finding in meta
                og_desc = soup.find('meta', property='og:description')
                story = og_desc.get('content', '') if og_desc else ''
            
            # Goal and raised amounts
            goal_amount = None
            raised_amount = None
            
            # Look for monetary values
            money_pattern = r'\$[\d,]+(?:\.\d{2})?'
            money_matches = re.findall(money_pattern, response.text)
            
            if money_matches:
                # Usually first is raised, second is goal
                for match in money_matches:
                    val = int(re.sub(r'[^\d]', '', match))
                    if val > 0:
                        if raised_amount is None:
                            raised_amount = val
                        elif goal_amount is None:
                            goal_amount = val
                            break
            
            # Extract images
            images = []
            
            # Campaign main image
            og_image = soup.find('meta', property='og:image')
            if og_image and og_image.get('content'):
                images.append(og_image['content'])
            
            # Gallery images
            gallery_imgs = soup.find_all('img', src=re.compile(r'gofundme|d2g8igdw02'))
            for img in gallery_imgs:
                src = img.get('src', '')
                if src and 'avatar' not in src.lower() and src not in images:
                    images.append(src)
            
            # Check for duplicate
            if self.storage.story_exists(url):
                return None
            
            # Download images to R2
            uploaded_images = []
            campaign_id = url.split('/')[-1]
            
            for img_url in images[:5]:
                try:
                    img_response = self.session.get(img_url, timeout=30)
                    if img_response.status_code == 200:
                        content_type = img_response.headers.get('content-type', 'image/jpeg')
                        ext = '.jpg' if 'jpeg' in content_type else '.png'
                        filename = f"gofundme_{campaign_id}_{len(uploaded_images)}{ext}"
                        
                        result = self.storage.upload_bytes_to_r2(
                            data=img_response.content,
                            filename=filename,
                            source='gofundme',
                            content_type=content_type,
                            metadata={'source_url': url}
                        )
                        uploaded_images.append(result['public_url'])
                except:
                    pass
            
            return {
                'id': campaign_id,
                'url': url,
                'title': title,
                'content': story,
                'goal_amount': goal_amount,
                'raised_amount': raised_amount,
                'images': uploaded_images,
                'original_images': images,
                'source': 'gofundme',
                'source_url': url,
                'scraped_at': datetime.now().isoformat(),
            }
            
        except Exception as e:
            print(f"Error scraping campaign {url}: {e}")
            return None
    
    def run_full_scrape(self, campaigns_per_term: int = 20) -> List[Dict[str, Any]]:
        """Run full GoFundMe scrape"""
        all_campaigns = []
        campaign_urls = []
        
        print("=" * 60)
        print("OASARA GOFUNDME SCRAPER - DATA LIBERATION PHASE 3")
        print("=" * 60)
        
        # Collect campaign URLs from searches
        for term in SEARCH_TERMS:
            print(f"\nSearching: '{term}'")
            campaigns = self._search_campaigns(term, campaigns_per_term)
            campaign_urls.extend(campaigns)
            print(f"  Found {len(campaigns)} campaigns")
            time.sleep(2)
        
        # Deduplicate URLs
        seen_urls = set()
        unique_campaigns = []
        for c in campaign_urls:
            if c['url'] not in seen_urls:
                seen_urls.add(c['url'])
                unique_campaigns.append(c)
        
        print(f"\n{len(unique_campaigns)} unique campaigns to scrape")
        
        # Scrape each campaign
        for campaign in tqdm(unique_campaigns, desc="Scraping campaigns"):
            data = self._scrape_campaign(campaign['url'])
            if data:
                data['search_query'] = campaign.get('search_query', '')
                all_campaigns.append(data)
            time.sleep(1.5)  # Be nice to their servers
        
        print(f"\n{'=' * 60}")
        print(f"SCRAPE COMPLETE: {len(all_campaigns)} campaigns scraped")
        print(f"{'=' * 60}")
        
        # Save raw data
        output_file = self.output_dir / f"gofundme_raw_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(output_file, 'w') as f:
            json.dump(all_campaigns, f, indent=2, default=str)
        print(f"Raw data saved to: {output_file}")
        
        return all_campaigns
    
    def extract_and_save(self, campaigns: List[Dict[str, Any]]) -> int:
        """Extract structured data and save to database"""
        saved_count = 0
        
        print(f"\nExtracting and saving {len(campaigns)} campaigns...")
        
        for campaign in tqdm(campaigns, desc="AI Extraction"):
            try:
                # Combine title and content for AI
                full_content = f"{campaign['title']}\n\n{campaign['content']}"
                
                if campaign.get('goal_amount'):
                    full_content += f"\n\nGoal: ${campaign['goal_amount']:,}"
                if campaign.get('raised_amount'):
                    full_content += f"\nRaised: ${campaign['raised_amount']:,}"
                
                extracted = extract_story_data(
                    content=full_content,
                    source='gofundme',
                    source_url=campaign['url'],
                    attached_images=campaign.get('images', [])
                )
                
                if 'error' in extracted:
                    continue
                
                slug = self._generate_slug(extracted.get('title', campaign['title']))
                
                story_record = {
                    'title': extracted.get('title', campaign['title'][:100]),
                    'slug': slug,
                    'content': extracted.get('content', campaign['content']),
                    'summary': extracted.get('summary', ''),
                    'story_type': 'horror',  # GoFundMe campaigns are usually horror stories
                    'procedure_type': extracted.get('procedure'),
                    'cost_us': extracted.get('cost_us') or campaign.get('goal_amount'),
                    'cost_abroad': extracted.get('cost_abroad'),
                    'country_abroad': extracted.get('country_abroad'),
                    'facility_name': extracted.get('facility_abroad'),
                    'images': extracted.get('images', []),
                    'source_url': campaign['url'],
                    'source_platform': 'gofundme',
                    'status': 'pending',
                    'is_scraped': True,
                    'emotional_tags': extracted.get('emotional_tags', ['desperation']),
                    'issues': extracted.get('issues', ['medical_debt']),
                    'viral_score': extracted.get('viral_score', 6),
                    'key_quote': extracted.get('key_quote'),
                    'gofundme_goal': campaign.get('goal_amount'),
                    'gofundme_raised': campaign.get('raised_amount'),
                }
                
                self.storage.insert_story(story_record)
                saved_count += 1
                
                time.sleep(2)
                
            except Exception as e:
                print(f"Error saving campaign {campaign['id']}: {e}")
        
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
    scraper = GoFundMeScraper()
    
    campaigns = scraper.run_full_scrape(campaigns_per_term=20)
    
    if campaigns:
        saved = scraper.extract_and_save(campaigns)
        print(f"\n🎉 GoFundMe scrape complete! {saved} stories added.")
    else:
        print("\n⚠️ No campaigns found to process.")


if __name__ == '__main__':
    main()

