#!/usr/bin/env python3
"""
Retroactive Story Analysis Script
Re-evaluates existing stories against OASARA Advisory Board criteria
Flags non-compliant stories for removal

Usage:
    python analyze_stories.py                    # Analyze all stories, report only
    python analyze_stories.py --flag             # Flag non-compliant as 'rejected'
    python analyze_stories.py --delete           # Actually delete non-compliant stories
    python analyze_stories.py --limit 50         # Analyze only 50 stories
    python analyze_stories.py --status pending   # Only analyze pending stories
"""
import os
import sys
import json
import argparse
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, List
from dotenv import load_dotenv
from tqdm import tqdm

# Add parent to path for utils
sys.path.insert(0, str(Path(__file__).parent.parent))

from utils.ai_extractor import check_relevance
from supabase import create_client

load_dotenv()

# Initialize Supabase client
supabase_url = os.getenv('SUPABASE_URL')
supabase_key = os.getenv('SUPABASE_SERVICE_KEY')

if not supabase_url or not supabase_key:
    print("ERROR: SUPABASE_URL and SUPABASE_SERVICE_KEY required in .env")
    sys.exit(1)

supabase = create_client(supabase_url, supabase_key)


def get_stories(status: str = None, limit: int = None, is_scraped: bool = True) -> List[Dict[str, Any]]:
    """Fetch stories from database"""
    query = supabase.table('stories').select('*')

    if is_scraped:
        query = query.eq('is_scraped', True)

    if status:
        query = query.eq('status', status)

    query = query.order('created_at', desc=True)

    if limit:
        query = query.limit(limit)

    result = query.execute()
    return result.data or []


def analyze_story(story: Dict[str, Any]) -> Dict[str, Any]:
    """
    Analyze a single story against OASARA criteria

    Returns:
        Dict with 'decision', 'story_id', 'title', 'source_platform'
    """
    # Combine title and content for analysis
    content = f"{story.get('title', '')}\n\n{story.get('content', '')}"

    if story.get('summary'):
        content += f"\n\nSummary: {story['summary']}"

    if story.get('cost_us'):
        content += f"\n\nUS Cost: ${story['cost_us']}"

    if story.get('cost_abroad'):
        content += f"\n\nAbroad Cost: ${story['cost_abroad']}"

    decision = check_relevance(content)

    return {
        'story_id': story['id'],
        'title': story.get('title', 'Untitled')[:80],
        'source_platform': story.get('source_platform', 'unknown'),
        'source_url': story.get('source_url', ''),
        'decision': decision,
        'story_type': story.get('story_type', 'unknown'),
        'current_status': story.get('status', 'unknown'),
    }


def flag_story(story_id: str, status: str = 'rejected') -> bool:
    """Update story status to flagged/rejected"""
    try:
        supabase.table('stories').update({
            'status': status,
            'moderation_notes': f'Flagged by retroactive analysis on {datetime.now().isoformat()}'
        }).eq('id', story_id).execute()
        return True
    except Exception as e:
        print(f"Error flagging story {story_id}: {e}")
        return False


def delete_story(story_id: str) -> bool:
    """Delete a story from database"""
    try:
        supabase.table('stories').delete().eq('id', story_id).execute()
        return True
    except Exception as e:
        print(f"Error deleting story {story_id}: {e}")
        return False


def generate_report(results: List[Dict[str, Any]], output_file: str = None) -> Dict[str, Any]:
    """Generate compliance report"""
    total = len(results)
    accepted = [r for r in results if r['decision'] == 'ACCEPT']
    rejected = [r for r in results if r['decision'] == 'REJECT']
    review = [r for r in results if r['decision'] == 'REVIEW_NEEDED']

    # Group by source platform
    by_platform = {}
    for r in results:
        platform = r['source_platform']
        if platform not in by_platform:
            by_platform[platform] = {'accept': 0, 'reject': 0, 'review': 0}
        by_platform[platform][r['decision'].lower().replace('_needed', '')] += 1

    report = {
        'analyzed_at': datetime.now().isoformat(),
        'total_stories': total,
        'accepted': len(accepted),
        'rejected': len(rejected),
        'review_needed': len(review),
        'compliance_rate': f"{(len(accepted) / total * 100):.1f}%" if total > 0 else "N/A",
        'by_platform': by_platform,
        'rejected_stories': [
            {
                'id': r['story_id'],
                'title': r['title'],
                'source': r['source_platform'],
                'url': r['source_url'],
            }
            for r in rejected
        ],
        'review_needed_stories': [
            {
                'id': r['story_id'],
                'title': r['title'],
                'source': r['source_platform'],
            }
            for r in review
        ],
    }

    if output_file:
        with open(output_file, 'w') as f:
            json.dump(report, f, indent=2)
        print(f"\nReport saved to: {output_file}")

    return report


def print_summary(report: Dict[str, Any]):
    """Print summary to console"""
    print("\n" + "=" * 60)
    print("OASARA STORY COMPLIANCE REPORT")
    print("=" * 60)
    print(f"Analyzed at: {report['analyzed_at']}")
    print(f"\nTotal Stories Analyzed: {report['total_stories']}")
    print(f"  ✅ ACCEPTED: {report['accepted']}")
    print(f"  ❌ REJECTED: {report['rejected']}")
    print(f"  ⚠️  REVIEW NEEDED: {report['review_needed']}")
    print(f"\nCompliance Rate: {report['compliance_rate']}")

    print("\nBy Platform:")
    for platform, counts in report['by_platform'].items():
        print(f"  {platform}: ✅{counts['accept']} ❌{counts['reject']} ⚠️{counts['review']}")

    if report['rejected_stories']:
        print(f"\n❌ REJECTED STORIES ({len(report['rejected_stories'])}):")
        for story in report['rejected_stories'][:10]:
            print(f"  - {story['title'][:60]}...")
            print(f"    Source: {story['source']}, ID: {story['id'][:8]}...")
        if len(report['rejected_stories']) > 10:
            print(f"  ... and {len(report['rejected_stories']) - 10} more")

    print("=" * 60)


def main():
    parser = argparse.ArgumentParser(
        description='Retroactive Story Analysis - OASARA Advisory Board Criteria',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
    python analyze_stories.py                    # Analyze all, report only
    python analyze_stories.py --flag             # Flag non-compliant stories
    python analyze_stories.py --delete           # Delete non-compliant stories
    python analyze_stories.py --limit 50         # Analyze 50 stories
    python analyze_stories.py --status pending   # Only pending stories
        """
    )

    parser.add_argument('--flag', action='store_true',
                        help='Flag non-compliant stories as rejected')
    parser.add_argument('--delete', action='store_true',
                        help='Delete non-compliant stories (DANGEROUS)')
    parser.add_argument('--limit', type=int, default=None,
                        help='Limit number of stories to analyze')
    parser.add_argument('--status', type=str, default=None,
                        choices=['pending', 'published', 'draft', 'hidden'],
                        help='Only analyze stories with this status')
    parser.add_argument('--include-user', action='store_true',
                        help='Include user-submitted stories (not just scraped)')
    parser.add_argument('--output', type=str, default=None,
                        help='Output report to JSON file')
    parser.add_argument('--dry-run', action='store_true',
                        help='Show what would be done without making changes')

    args = parser.parse_args()

    if args.delete and not args.dry_run:
        confirm = input("⚠️  WARNING: This will DELETE stories. Type 'DELETE' to confirm: ")
        if confirm != 'DELETE':
            print("Aborted.")
            sys.exit(0)

    print("Fetching stories from database...")
    stories = get_stories(
        status=args.status,
        limit=args.limit,
        is_scraped=not args.include_user
    )

    if not stories:
        print("No stories found matching criteria.")
        sys.exit(0)

    print(f"Found {len(stories)} stories to analyze.\n")

    results = []
    for story in tqdm(stories, desc="Analyzing stories"):
        result = analyze_story(story)
        results.append(result)

        # Rate limiting for Claude API
        import time
        time.sleep(1)

    # Generate report
    output_file = args.output or f"compliance_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    report = generate_report(results, output_file)
    print_summary(report)

    # Take action on rejected stories
    if args.flag or args.delete:
        rejected = [r for r in results if r['decision'] == 'REJECT']

        if not rejected:
            print("\nNo stories to flag/delete.")
            return

        action = 'delete' if args.delete else 'flag'
        print(f"\n{'[DRY RUN] Would ' if args.dry_run else ''}Preparing to {action} {len(rejected)} non-compliant stories...")

        for r in tqdm(rejected, desc=f"{'Would ' if args.dry_run else ''}{action.capitalize()}ing"):
            if args.dry_run:
                continue

            if args.delete:
                delete_story(r['story_id'])
            else:
                flag_story(r['story_id'])

        if not args.dry_run:
            print(f"\n✅ {action.capitalize()}ed {len(rejected)} non-compliant stories.")
        else:
            print(f"\n[DRY RUN] Would have {action}ed {len(rejected)} stories.")


if __name__ == '__main__':
    main()
