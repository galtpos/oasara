"""
YouTube Medical Tourism & Healthcare Stories Scraper
Uses yt-dlp for video downloads and Whisper for transcription
"""
import os
import re
import json
import time
import subprocess
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

# Search queries for YouTube
SEARCH_QUERIES = [
    # Medical tourism testimonials
    'medical tourism experience',
    'dental work mexico vlog',
    'surgery abroad testimonial',
    'got surgery in thailand',
    'dental implants mexico cost',
    'plastic surgery colombia experience',
    'hair transplant turkey vlog',
    'lasik eye surgery abroad',
    
    # Healthcare horror stories
    'hospital bill shock',
    'medical bill reaction',
    'insurance denied my claim story',
    'healthcare in america is broken',
    'ER bill outrageous',
    'medical debt story',
    'cancer treatment cost america',
    
    # Comparison videos
    'US healthcare vs other countries',
    'medical costs comparison',
    'why I left america for healthcare',
]

# Channels that cover medical tourism / healthcare costs
KEY_CHANNELS = [
    'TheMedicalTourist',
    'Dr. Aventura',  # Medical tourism channel
    'Healthcare Triage',
    'Second Opinion Doctor',
]


class YouTubeScraper:
    def __init__(self):
        self.storage = get_storage()
        
        # Primary storage on NAS - NO TEMP FILES
        self.nas_base = Path(os.getenv('NAS_MOUNT_PATH', '/mnt/nas/oasara'))
        self.output_dir = self.nas_base / 'scraped' / 'youtube'
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.videos_dir = self.output_dir / 'videos'
        self.videos_dir.mkdir(exist_ok=True)
        self.thumbnails_dir = self.output_dir / 'thumbnails'
        self.thumbnails_dir.mkdir(exist_ok=True)
        self.transcripts_dir = self.output_dir / 'transcripts'
        self.transcripts_dir.mkdir(exist_ok=True)
        
        self.whisper_model = os.getenv('WHISPER_MODEL', 'large-v3')  # Use best model on DGX
        
        print(f"📁 Saving all content to NAS: {self.output_dir}")
    
    def _run_ytdlp_search(self, query: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Search YouTube using yt-dlp"""
        videos = []
        
        try:
            cmd = [
                'yt-dlp',
                '--flat-playlist',
                '--dump-json',
                f'ytsearch{limit}:{query}'
            ]
            
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=120
            )
            
            if result.returncode != 0:
                print(f"yt-dlp error: {result.stderr[:200]}")
                return []
            
            for line in result.stdout.strip().split('\n'):
                if line:
                    try:
                        video = json.loads(line)
                        videos.append({
                            'id': video.get('id'),
                            'title': video.get('title'),
                            'url': f"https://www.youtube.com/watch?v={video.get('id')}",
                            'duration': video.get('duration'),
                            'view_count': video.get('view_count', 0),
                            'channel': video.get('channel') or video.get('uploader'),
                            'search_query': query,
                        })
                    except json.JSONDecodeError:
                        continue
            
        except subprocess.TimeoutExpired:
            print(f"Timeout for query: {query}")
        except FileNotFoundError:
            print("yt-dlp not installed. Install with: pip install yt-dlp")
        except Exception as e:
            print(f"Error running yt-dlp: {e}")
        
        return videos
    
    def _download_video(self, video_id: str) -> Optional[Dict[str, Any]]:
        """
        Download FULL VIDEO directly to NAS - no temp files
        Returns paths to downloaded files
        """
        # Organize files by type on NAS
        video_path = self.videos_dir / f"{video_id}.mp4"
        thumb_path = self.thumbnails_dir / f"{video_id}.jpg"
        transcript_path = self.transcripts_dir / f"{video_id}.srt"
        info_path = self.output_dir / 'metadata' / f"{video_id}.json"
        info_path.parent.mkdir(exist_ok=True)
        
        try:
            # Download FULL VIDEO directly to NAS
            cmd = [
                'yt-dlp',
                '-f', 'bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/best[height<=1080][ext=mp4]/best',
                '--merge-output-format', 'mp4',
                '--write-thumbnail',
                '--convert-thumbnails', 'jpg',
                '--write-info-json',
                '--write-auto-sub',
                '--sub-lang', 'en',
                '--convert-subs', 'srt',
                # Save directly to NAS paths
                '-o', str(video_path),
                '--write-thumbnail', '-o', f'thumbnail:{thumb_path}',
                '--write-info-json', '-o', f'infojson:{info_path}',
                '--write-subs', '-o', f'subtitle:{transcript_path}',
                f'https://www.youtube.com/watch?v={video_id}'
            ]
            
            print(f"📥 Downloading {video_id} to NAS...")
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=600  # 10 min for large videos
            )
            
            if result.returncode != 0:
                print(f"Download error for {video_id}: {result.stderr[:500]}")
                return None
            
            # Verify files exist on NAS
            files = {}
            if video_path.exists():
                files['video'] = str(video_path)
                size_mb = video_path.stat().st_size / 1024 / 1024
                print(f"✅ Video saved: {size_mb:.1f}MB")
            
            # Find thumbnail (yt-dlp may add suffix)
            for ext in ['.jpg', '.webp', '.png']:
                thumb_check = self.thumbnails_dir / f"{video_id}{ext}"
                if thumb_check.exists():
                    files['thumbnail'] = str(thumb_check)
                    break
            
            # Check for subtitles
            for srt_file in self.transcripts_dir.glob(f"{video_id}*.srt"):
                files['subtitles'] = str(srt_file)
                break
            
            # Check for info json
            for json_file in (self.output_dir / 'metadata').glob(f"{video_id}*.json"):
                files['info'] = str(json_file)
                break
            
            return files
            
        except subprocess.TimeoutExpired:
            print(f"⏱️ Download timeout for {video_id}")
            return None
        except Exception as e:
            print(f"❌ Error downloading {video_id}: {e}")
            return None
    
    def _transcribe_audio(self, audio_path: str) -> Optional[str]:
        """
        Transcribe audio using Whisper
        Falls back to auto-subs if available
        """
        try:
            import whisper
            
            print(f"Transcribing with Whisper ({self.whisper_model})...")
            model = whisper.load_model(self.whisper_model)
            result = model.transcribe(audio_path)
            
            return result['text']
            
        except ImportError:
            print("Whisper not installed. Install with: pip install openai-whisper")
            return None
        except Exception as e:
            print(f"Transcription error: {e}")
            return None
    
    def _read_subtitles(self, srt_path: str) -> str:
        """Read and clean SRT subtitle file"""
        try:
            with open(srt_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Remove timestamps and numbers
            lines = []
            for line in content.split('\n'):
                # Skip timestamp lines and numbers
                if re.match(r'^\d+$', line.strip()):
                    continue
                if re.match(r'^\d{2}:\d{2}:\d{2}', line):
                    continue
                if line.strip():
                    # Remove HTML tags
                    line = re.sub(r'<[^>]+>', '', line)
                    lines.append(line.strip())
            
            return ' '.join(lines)
            
        except Exception as e:
            print(f"Error reading subtitles: {e}")
            return ''
    
    def _get_nas_url(self, file_path: str) -> str:
        """
        Get NAS file URL. Files are already on NAS - no upload needed.
        Returns the NAS path which can be served via nginx or Synology web station.
        """
        # Convert NAS path to web-accessible URL
        nas_web_base = os.getenv('NAS_WEB_URL', 'http://10.0.0.30:5000/oasara')
        relative_path = str(Path(file_path)).replace(str(self.nas_base), '')
        return f"{nas_web_base}{relative_path}"
    
    def _upload_to_supabase(self, file_path: str, video_id: str, file_type: str) -> Optional[str]:
        """
        Upload file to Supabase Storage for CDN access.
        Files are already saved on NAS - this is for web delivery.
        """
        try:
            file_size = Path(file_path).stat().st_size
            max_size = int(os.getenv('MAX_UPLOAD_SIZE_MB', '500')) * 1024 * 1024
            
            if file_size > max_size:
                print(f"⚠️ File too large for Supabase ({file_size / 1024 / 1024:.1f}MB) - using NAS URL")
                return self._get_nas_url(file_path)
            
            ext = Path(file_path).suffix
            if file_type == 'video':
                content_type = 'video/mp4'
            elif file_type == 'thumbnail':
                content_type = 'image/jpeg' if ext == '.jpg' else 'image/webp' if ext == '.webp' else 'image/png'
            else:
                content_type = 'application/octet-stream'
            
            result = self.storage.upload_file(
                file_path=file_path,
                source='youtube',
                content_type=content_type
            )
            
            return result['public_url']
            
        except Exception as e:
            print(f"⚠️ Supabase upload failed, using NAS URL: {e}")
            return self._get_nas_url(file_path)
    
    def process_video(self, video: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Full video processing pipeline:
        1. Download audio + thumbnail
        2. Get transcript (auto-subs or Whisper)
        3. Upload to R2
        4. Return processed data
        """
        video_id = video['id']
        
        # Check for duplicate
        source_url = f"https://www.youtube.com/watch?v={video_id}"
        if self.storage.story_exists(source_url):
            return None
        
        # Download
        files = self._download_video(video_id)
        if not files:
            return None
        
        # Get transcript
        transcript = ''
        if files.get('subtitles'):
            transcript = self._read_subtitles(files['subtitles'])
        
        if not transcript and files.get('audio'):
            transcript = self._transcribe_audio(files['audio'])
        
        if not transcript:
            print(f"No transcript available for {video_id}")
            return None
        
        # Get URLs for files (already on NAS, optionally upload to Supabase CDN)
        thumbnail_url = None
        if files.get('thumbnail'):
            thumbnail_url = self._upload_to_supabase(files['thumbnail'], video_id, 'thumbnail')
        
        # Video stays on NAS (too large for Supabase), get NAS URL
        video_url = None
        nas_video_path = None
        if files.get('video'):
            nas_video_path = files['video']
            video_url = self._get_nas_url(files['video'])
            print(f"📹 Video on NAS: {nas_video_path}")
        
        # Read video info
        info = {}
        if files.get('info'):
            with open(files['info'], 'r') as f:
                info = json.load(f)
        
        return {
            'id': video_id,
            'title': video.get('title') or info.get('title', ''),
            'content': transcript,
            'description': info.get('description', ''),
            'source_url': source_url,
            'source': 'youtube',
            'channel': video.get('channel') or info.get('channel', ''),
            'duration': video.get('duration') or info.get('duration'),
            'view_count': video.get('view_count') or info.get('view_count', 0),
            'images': [thumbnail_url] if thumbnail_url else [],
            'video_url': video_url,  # Web-accessible URL
            'nas_video_path': nas_video_path,  # Actual file on NAS
            'nas_thumbnail_path': files.get('thumbnail'),
            'nas_transcript_path': files.get('subtitles'),
            'youtube_url': source_url,
            'search_query': video.get('search_query', ''),
            'processed_at': datetime.now().isoformat(),
        }
    
    def run_full_scrape(self, videos_per_query: int = 5) -> List[Dict[str, Any]]:
        """Run full YouTube scrape"""
        all_videos = []
        video_queue = []
        
        print("=" * 60)
        print("OASARA YOUTUBE SCRAPER - DATA LIBERATION PHASE 3")
        print("=" * 60)
        
        # Search for videos
        for query in SEARCH_QUERIES:
            print(f"\nSearching: '{query}'")
            videos = self._run_ytdlp_search(query, videos_per_query)
            video_queue.extend(videos)
            print(f"  Found {len(videos)} videos")
            time.sleep(1)
        
        # Deduplicate
        seen_ids = set()
        unique_videos = []
        for v in video_queue:
            if v['id'] and v['id'] not in seen_ids:
                seen_ids.add(v['id'])
                unique_videos.append(v)
        
        # Sort by view count (prioritize popular videos)
        unique_videos.sort(key=lambda x: x.get('view_count', 0) or 0, reverse=True)
        
        # Limit to top 100 for processing
        unique_videos = unique_videos[:100]
        
        print(f"\n{len(unique_videos)} unique videos to process")
        
        # Process each video
        for video in tqdm(unique_videos, desc="Processing videos"):
            processed = self.process_video(video)
            if processed:
                all_videos.append(processed)
            time.sleep(2)  # Rate limiting
        
        print(f"\n{'=' * 60}")
        print(f"SCRAPE COMPLETE: {len(all_videos)} videos processed")
        print(f"{'=' * 60}")
        
        # Save raw data
        output_file = self.output_dir / f"youtube_raw_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(output_file, 'w') as f:
            json.dump(all_videos, f, indent=2, default=str)
        print(f"Raw data saved to: {output_file}")
        
        return all_videos
    
    def extract_and_save(self, videos: List[Dict[str, Any]]) -> int:
        """Extract structured data and save to database"""
        saved_count = 0
        
        print(f"\nExtracting and saving {len(videos)} videos...")
        
        for video in tqdm(videos, desc="AI Extraction"):
            try:
                # Combine title, description, and transcript
                full_content = f"Title: {video['title']}\n\n"
                if video.get('description'):
                    full_content += f"Description: {video['description'][:500]}\n\n"
                full_content += f"Transcript:\n{video['content'][:8000]}"
                
                extracted = extract_story_data(
                    content=full_content,
                    source='youtube',
                    source_url=video['source_url'],
                    attached_images=video.get('images', [])
                )
                
                if 'error' in extracted:
                    continue
                
                slug = self._generate_slug(extracted.get('title', video['title']))
                
                story_record = {
                    'title': extracted.get('title', video['title'][:100]),
                    'slug': slug,
                    'content': extracted.get('content', video['content'][:5000]),
                    'summary': extracted.get('summary', ''),
                    'story_type': extracted.get('story_type', 'success'),  # YouTube often has success stories
                    'procedure_type': extracted.get('procedure'),
                    'cost_us': extracted.get('cost_us'),
                    'cost_abroad': extracted.get('cost_abroad'),
                    'country_abroad': extracted.get('country_abroad'),
                    'facility_name': extracted.get('facility_abroad'),
                    'images': extracted.get('images', []),
                    'source_url': video['source_url'],
                    'source_platform': 'youtube',
                    'status': 'pending',
                    'is_scraped': True,
                    'emotional_tags': extracted.get('emotional_tags', []),
                    'issues': extracted.get('issues', []),
                    'viral_score': extracted.get('viral_score', 5),
                    'key_quote': extracted.get('key_quote'),
                    # Video-specific fields
                    'video_url': video.get('video_url'),  # ACTUAL VIDEO FILE
                    'video_thumbnail_url': video.get('images', [None])[0],
                    'video_transcript': video.get('content', '')[:10000],
                    'media_urls': [video.get('video_url')] if video.get('video_url') else [],
                }
                
                self.storage.insert_story(story_record)
                saved_count += 1
                
                time.sleep(2)
                
            except Exception as e:
                print(f"Error saving video {video['id']}: {e}")
        
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
    scraper = YouTubeScraper()
    
    videos = scraper.run_full_scrape(videos_per_query=5)
    
    if videos:
        saved = scraper.extract_and_save(videos)
        print(f"\n🎉 YouTube scrape complete! {saved} stories added.")
    else:
        print("\n⚠️ No videos found to process.")


if __name__ == '__main__':
    main()

