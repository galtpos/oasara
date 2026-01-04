"""
GoFundMe Medical Campaigns Scraper
Uses Playwright for JavaScript-rendered pages
"""
import os
import re
import json
import time
import asyncio
from datetime import datetime
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

# Search terms for medical campaigns
SEARCH_TERMS = [
    'medical bills',
    'hospital bills', 
    'cancer treatment',
    'surgery costs',
    'medical debt',
    'insurance denied',
    'emergency surgery',
    'chemotherapy',
]


class GoFundMeScraper:
    def __init__(self):
        self.storage = get_storage()
        self.output_dir = Path(__file__).parent / 'output'
        self.output_dir.mkdir(exist_ok=True)
        self.browser = None
        self.context = None
    
    async def _init_browser(self):
        """Initialize Playwright browser"""
        from playwright.async_api import async_playwright
        
        self.playwright = await async_playwright().start()
        self.browser = await self.playwright.chromium.launch(
            headless=True,
            args=['--no-sandbox', '--disable-setuid-sandbox']
        )
        self.context = await self.browser.new_context(
            user_agent='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            viewport={'width': 1280, 'height': 720}
        )
    
    async def _close_browser(self):
        """Close browser"""
        if self.context:
            await self.context.close()
        if self.browser:
            await self.browser.close()
        if self.playwright:
            await self.playwright.stop()
    
    async def _search_campaigns(self, query: str, limit: int = 20) -> List[Dict[str, Any]]:
        """Search GoFundMe for campaigns using Playwright"""
        campaigns = []
        
        try:
            page = await self.context.new_page()
            
            # Navigate to search
            search_url = f"https://www.gofundme.com/s?q={query.replace(' ', '+')}"
            await page.goto(search_url, wait_until='networkidle', timeout=30000)
            
            # Wait for results to load
            await page.wait_for_timeout(3000)
            
            # Scroll to load more results
            for _ in range(3):
                await page.evaluate('window.scrollTo(0, document.body.scrollHeight)')
                await page.wait_for_timeout(1500)
            
            # Extract campaign links
            links = await page.query_selector_all('a[href*="/f/"]')
            
            seen_urls = set()
            for link in links[:limit]:
                href = await link.get_attribute('href')
                if not href or href in seen_urls:
                    continue
                
                full_url = f"https://www.gofundme.com{href}" if href.startswith('/') else href
                
                # Skip non-campaign links
                if '/f/' not in full_url or 'sign-up' in full_url or 'create' in full_url:
                    continue
                
                seen_urls.add(full_url)
                campaigns.append({
                    'url': full_url,
                    'search_query': query,
                })
            
            await page.close()
            
        except Exception as e:
            print(f"Error searching GoFundMe for '{query}': {e}")
        
        return campaigns
    
    async def _scrape_campaign(self, url: str) -> Optional[Dict[str, Any]]:
        """Scrape a single GoFundMe campaign page"""
        try:
            # Check for duplicate first
            if self.storage.story_exists(url):
                return None
            
            page = await self.context.new_page()
            await page.goto(url, wait_until='networkidle', timeout=30000)
            await page.wait_for_timeout(2000)
            
            # Extract title
            title = ''
            title_elem = await page.query_selector('h1')
            if title_elem:
                title = await title_elem.inner_text()
            
            if not title:
                # Try og:title
                og_title = await page.query_selector('meta[property="og:title"]')
                if og_title:
                    title = await og_title.get_attribute('content') or ''
            
            # Extract story content
            story = ''
            story_elem = await page.query_selector('[class*="story"], [class*="description"], .campaign-description')
            if story_elem:
                story = await story_elem.inner_text()
            
            if not story:
                # Try getting all paragraphs in main content
                paragraphs = await page.query_selector_all('main p, article p')
                story_parts = []
                for p in paragraphs[:10]:
                    text = await p.inner_text()
                    if len(text) > 20:
                        story_parts.append(text)
                story = '\n\n'.join(story_parts)
            
            # Extract amounts from the page
            goal_amount = None
            raised_amount = None
            
            # Look for progress bar or amount displays
            page_text = await page.content()
            money_matches = re.findall(r'\$[\d,]+(?:\.\d{2})?', page_text)
            
            amounts = []
            for match in money_matches:
                try:
                    val = int(re.sub(r'[^\d]', '', match))
                    if 100 < val < 10000000:  # Reasonable range
                        amounts.append(val)
                except:
                    pass
            
            # Usually: raised first, then goal
            if amounts:
                raised_amount = amounts[0] if len(amounts) > 0 else None
                goal_amount = amounts[1] if len(amounts) > 1 else None
            
            # Extract images
            images = []
            og_image = await page.query_selector('meta[property="og:image"]')
            if og_image:
                img_url = await og_image.get_attribute('content')
                if img_url:
                    images.append(img_url)
            
            # Gallery images
            gallery_imgs = await page.query_selector_all('img[src*="gofundme"], img[src*="d2g8igdw02"]')
            for img in gallery_imgs[:5]:
                src = await img.get_attribute('src')
                if src and 'avatar' not in src.lower() and src not in images:
                    images.append(src)
            
            await page.close()
            
            # Skip if no meaningful content
            if not title or len(story) < 50:
                return None
            
            campaign_id = url.split('/')[-1]
            
            return {
                'id': campaign_id,
                'url': url,
                'title': title,
                'content': story,
                'goal_amount': goal_amount,
                'raised_amount': raised_amount,
                'images': images,
                'source': 'gofundme',
                'source_url': url,
                'scraped_at': datetime.now().isoformat(),
            }
            
        except Exception as e:
            print(f"Error scraping campaign {url}: {e}")
            return None
    
    async def run_full_scrape(self, campaigns_per_term: int = 15) -> List[Dict[str, Any]]:
        """Run full GoFundMe scrape"""
        all_campaigns = []
        campaign_urls = []
        
        print("=" * 60)
        print("OASARA GOFUNDME SCRAPER - DATA LIBERATION PHASE 3")
        print("=" * 60)
        
        await self._init_browser()
        
        try:
            # Collect campaign URLs from searches
            for term in SEARCH_TERMS:
                print(f"\nSearching: '{term}'")
                campaigns = await self._search_campaigns(term, campaigns_per_term)
                campaign_urls.extend(campaigns)
                print(f"  Found {len(campaigns)} campaigns")
                await asyncio.sleep(2)
            
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
                data = await self._scrape_campaign(campaign['url'])
                if data:
                    data['search_query'] = campaign.get('search_query', '')
                    all_campaigns.append(data)
                await asyncio.sleep(1.5)
            
        finally:
            await self._close_browser()
        
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
                    full_content += f"\n\nGoFundMe Goal: ${campaign['goal_amount']:,}"
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
                    'story_type': 'horror',  # GoFundMe = horror stories
                    'procedure_type': extracted.get('procedure'),
                    'cost_us': extracted.get('cost_us') or campaign.get('goal_amount'),
                    'cost_abroad': extracted.get('cost_abroad'),
                    'images': campaign.get('images', [])[:3],
                    'source_url': campaign['url'],
                    'source_platform': 'gofundme',
                    'status': 'pending',
                    'is_scraped': True,
                    'issues': extracted.get('issues', ['medical_debt']),
                }
                
                self.storage.insert_story(story_record)
                saved_count += 1
                
                time.sleep(1)
                
            except Exception as e:
                print(f"Error saving campaign {campaign.get('id', 'unknown')}: {e}")
        
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


async def main_async():
    """Async main entry point"""
    scraper = GoFundMeScraper()
    
    campaigns = await scraper.run_full_scrape(campaigns_per_term=15)
    
    if campaigns:
        saved = scraper.extract_and_save(campaigns)
        print(f"\n🎉 GoFundMe scrape complete! {saved} stories added.")
    else:
        print("\n⚠️ No campaigns found to process.")


def main():
    """Main entry point"""
    asyncio.run(main_async())


if __name__ == '__main__':
    main()
