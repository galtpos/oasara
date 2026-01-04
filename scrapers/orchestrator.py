#!/usr/bin/env python3
"""
Oasara Data Liberation Orchestrator
Runs all scrapers and coordinates the full data pipeline

Phase 3: Pre-populate stories with real healthcare horror stories
Advisory Board: Julian Assange, Kim Dotcom, Roger Ver, Ross Ulbricht
"""
import os
import sys
import json
import time
import argparse
import subprocess
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, List, Optional
from dataclasses import dataclass, asdict
from dotenv import load_dotenv

load_dotenv()

# Add scrapers to path
SCRAPERS_DIR = Path(__file__).parent
sys.path.insert(0, str(SCRAPERS_DIR))

from utils.storage import get_storage
from processing.ocr_redaction import BillProcessor


@dataclass
class ScraperResult:
    """Result from a scraper run"""
    scraper: str
    posts_found: int
    stories_saved: int
    images_uploaded: int
    videos_processed: int
    errors: int
    duration_seconds: float
    started_at: str
    completed_at: str


class Orchestrator:
    """
    Coordinates all scrapers and processing pipelines
    """
    
    def __init__(self, dry_run: bool = False, verbose: bool = True):
        self.dry_run = dry_run
        self.verbose = verbose
        self.storage = get_storage()
        self.results: List[ScraperResult] = []
        self.output_dir = SCRAPERS_DIR / 'output'
        self.output_dir.mkdir(exist_ok=True)
        self.logs_dir = SCRAPERS_DIR / 'logs'
        self.logs_dir.mkdir(exist_ok=True)
    
    def log(self, message: str, level: str = 'INFO'):
        """Log with timestamp"""
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        log_line = f"[{timestamp}] [{level}] {message}"
        if self.verbose:
            print(log_line)
        
        # Also write to log file
        log_file = self.logs_dir / f"orchestrator_{datetime.now().strftime('%Y%m%d')}.log"
        with open(log_file, 'a') as f:
            f.write(log_line + '\n')
    
    def run_scraper(self, scraper_name: str, **kwargs) -> Optional[ScraperResult]:
        """
        Run a single scraper
        """
        self.log(f"Starting {scraper_name} scraper...")
        start_time = datetime.now()
        
        try:
            if scraper_name == 'reddit':
                from reddit.scraper import RedditScraper
                scraper = RedditScraper()
                posts = scraper.run_full_scrape(
                    subreddit_limit=kwargs.get('limit', 50),
                    search_limit=kwargs.get('search_limit', 30)
                )
                saved = scraper.extract_and_save(posts) if posts else 0
                
            elif scraper_name == 'twitter':
                from twitter.scraper import TwitterScraper
                scraper = TwitterScraper()
                posts = scraper.run_full_scrape(
                    query_limit=kwargs.get('limit', 50),
                    account_limit=kwargs.get('account_limit', 30)
                )
                saved = scraper.extract_and_save(posts) if posts else 0
                
            elif scraper_name == 'gofundme':
                from gofundme.scraper import GoFundMeScraper
                scraper = GoFundMeScraper()
                campaigns = scraper.run_full_scrape(
                    campaigns_per_term=kwargs.get('limit', 20)
                )
                saved = scraper.extract_and_save(campaigns) if campaigns else 0
                posts = campaigns
                
            elif scraper_name == 'youtube':
                from youtube.scraper import YouTubeScraper
                scraper = YouTubeScraper()
                videos = scraper.run_full_scrape(
                    videos_per_query=kwargs.get('limit', 5)
                )
                saved = scraper.extract_and_save(videos) if videos else 0
                posts = videos
                
            else:
                self.log(f"Unknown scraper: {scraper_name}", level='ERROR')
                return None
            
            end_time = datetime.now()
            duration = (end_time - start_time).total_seconds()
            
            result = ScraperResult(
                scraper=scraper_name,
                posts_found=len(posts) if posts else 0,
                stories_saved=saved,
                images_uploaded=sum(len(p.get('images', [])) for p in posts) if posts else 0,
                videos_processed=len(posts) if scraper_name == 'youtube' and posts else 0,
                errors=0,
                duration_seconds=duration,
                started_at=start_time.isoformat(),
                completed_at=end_time.isoformat(),
            )
            
            self.results.append(result)
            self.log(f"Completed {scraper_name}: {saved} stories saved in {duration:.1f}s")
            
            return result
            
        except Exception as e:
            self.log(f"Error running {scraper_name}: {e}", level='ERROR')
            import traceback
            traceback.print_exc()
            return None
    
    def run_all(
        self,
        scrapers: Optional[List[str]] = None,
        limit: int = 50
    ) -> Dict[str, Any]:
        """
        Run all scrapers (or specified subset)
        """
        if scrapers is None:
            scrapers = ['reddit', 'twitter', 'gofundme', 'youtube']
        
        self.log("=" * 60)
        self.log("OASARA DATA LIBERATION - PHASE 3")
        self.log("Pre-populating stories with real healthcare content")
        self.log("=" * 60)
        
        overall_start = datetime.now()
        
        for scraper in scrapers:
            if self.dry_run:
                self.log(f"[DRY RUN] Would run {scraper} scraper")
            else:
                self.run_scraper(scraper, limit=limit)
                # Small delay between scrapers
                time.sleep(5)
        
        overall_end = datetime.now()
        total_duration = (overall_end - overall_start).total_seconds()
        
        # Generate summary
        summary = self._generate_summary(total_duration)
        
        # Save results
        results_file = self.output_dir / f"scrape_results_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(results_file, 'w') as f:
            json.dump(summary, f, indent=2, default=str)
        
        self.log(f"\nResults saved to: {results_file}")
        
        return summary
    
    def _generate_summary(self, total_duration: float) -> Dict[str, Any]:
        """Generate summary of all scraper runs"""
        total_posts = sum(r.posts_found for r in self.results)
        total_saved = sum(r.stories_saved for r in self.results)
        total_images = sum(r.images_uploaded for r in self.results)
        total_videos = sum(r.videos_processed for r in self.results)
        total_errors = sum(r.errors for r in self.results)
        
        summary = {
            'completed_at': datetime.now().isoformat(),
            'total_duration_seconds': total_duration,
            'total_posts_found': total_posts,
            'total_stories_saved': total_saved,
            'total_images_uploaded': total_images,
            'total_videos_processed': total_videos,
            'total_errors': total_errors,
            'scrapers': [asdict(r) for r in self.results],
        }
        
        self.log("\n" + "=" * 60)
        self.log("SCRAPE SUMMARY")
        self.log("=" * 60)
        self.log(f"Total posts found: {total_posts}")
        self.log(f"Total stories saved: {total_saved}")
        self.log(f"Total images uploaded: {total_images}")
        self.log(f"Total videos processed: {total_videos}")
        self.log(f"Total duration: {total_duration/60:.1f} minutes")
        self.log("=" * 60)
        
        return summary
    
    def process_pending_ocr(self, limit: int = 100):
        """
        Run OCR on stories with images but no extracted text
        """
        self.log("Processing pending OCR tasks...")
        
        # Get stories with images but no OCR data
        result = self.storage.supabase.table('stories').select('*').not_.is_('images', 'null').is_('ocr_text', 'null').limit(limit).execute()
        
        if not result.data:
            self.log("No pending OCR tasks")
            return
        
        processor = BillProcessor()
        processed = 0
        
        for story in result.data:
            try:
                from processing.ocr_redaction import process_story_images
                updated_story = process_story_images(story)
                
                # Update in database
                self.storage.supabase.table('stories').update({
                    'ocr_text': updated_story.get('ocr_text'),
                    'ocr_amounts': updated_story.get('ocr_amounts'),
                    'cost_us': updated_story.get('cost_us'),
                }).eq('id', story['id']).execute()
                
                processed += 1
                
            except Exception as e:
                self.log(f"OCR error for story {story['id']}: {e}", level='ERROR')
        
        self.log(f"Processed OCR for {processed} stories")
    
    def sync_to_nas(self):
        """
        Sync R2 bucket to NAS using rclone
        """
        nas_path = os.getenv('NAS_MOUNT_PATH')
        if not nas_path:
            self.log("NAS_MOUNT_PATH not configured, skipping sync")
            return
        
        if not Path(nas_path).exists():
            self.log(f"NAS not mounted at {nas_path}, skipping sync")
            return
        
        self.log("Syncing to NAS...")
        
        try:
            # Run rclone sync
            cmd = [
                'rclone', 'sync',
                f"r2:{os.getenv('R2_BUCKET_NAME')}",
                nas_path,
                '--transfers', '10',
                '--checkers', '20',
                '--progress',
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=3600)
            
            if result.returncode == 0:
                self.log("NAS sync complete")
            else:
                self.log(f"NAS sync error: {result.stderr}", level='ERROR')
                
        except FileNotFoundError:
            self.log("rclone not installed. Install from: https://rclone.org/install/", level='ERROR')
        except subprocess.TimeoutExpired:
            self.log("NAS sync timeout (1 hour)", level='ERROR')
        except Exception as e:
            self.log(f"NAS sync error: {e}", level='ERROR')
    
    def get_stats(self) -> Dict[str, Any]:
        """Get current database stats"""
        stats = self.storage.get_stats()
        
        # Get breakdown by source
        by_source = self.storage.supabase.table('stories').select('source_platform', count='exact').execute()
        
        return {
            **stats,
            'timestamp': datetime.now().isoformat(),
        }


def main():
    """CLI entry point"""
    parser = argparse.ArgumentParser(
        description='Oasara Data Liberation Orchestrator',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python orchestrator.py --all                    # Run all scrapers
  python orchestrator.py --scrapers reddit twitter # Run specific scrapers
  python orchestrator.py --limit 100              # Increase per-source limit
  python orchestrator.py --ocr                    # Process pending OCR
  python orchestrator.py --sync                   # Sync to NAS
  python orchestrator.py --stats                  # Show current stats
  python orchestrator.py --dry-run                # Preview without running
        """
    )
    
    parser.add_argument('--all', action='store_true', help='Run all scrapers')
    parser.add_argument('--scrapers', nargs='+', choices=['reddit', 'twitter', 'gofundme', 'youtube'],
                        help='Specific scrapers to run')
    parser.add_argument('--limit', type=int, default=50, help='Posts per source (default: 50)')
    parser.add_argument('--ocr', action='store_true', help='Process pending OCR tasks')
    parser.add_argument('--sync', action='store_true', help='Sync R2 to NAS')
    parser.add_argument('--stats', action='store_true', help='Show current stats')
    parser.add_argument('--dry-run', action='store_true', help='Preview without running')
    parser.add_argument('--quiet', action='store_true', help='Reduce output')
    
    args = parser.parse_args()
    
    orchestrator = Orchestrator(dry_run=args.dry_run, verbose=not args.quiet)
    
    if args.stats:
        stats = orchestrator.get_stats()
        print(json.dumps(stats, indent=2))
        return
    
    if args.all:
        orchestrator.run_all(limit=args.limit)
    elif args.scrapers:
        orchestrator.run_all(scrapers=args.scrapers, limit=args.limit)
    
    if args.ocr:
        orchestrator.process_pending_ocr()
    
    if args.sync:
        orchestrator.sync_to_nas()
    
    if not any([args.all, args.scrapers, args.ocr, args.sync, args.stats]):
        parser.print_help()


if __name__ == '__main__':
    main()

