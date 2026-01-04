"""
Supabase Storage Client for Scraped Media
Uses Supabase Storage (not R2) - R2 setup documented for future

DGX Services:
- OCR: http://10.0.0.20:8002 (EasyOCR)
- VLM: http://10.0.0.20:8111 (DeepSeek-VL2)
- Whisper: Available on DGX via continuous_transcriber
"""
import os
import hashlib
import mimetypes
import requests
from typing import Optional, Dict, Any, List
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

# DGX Service endpoints
DGX_OCR_URL = os.getenv('DGX_OCR_URL', 'http://10.0.0.20:8002')
DGX_VLM_URL = os.getenv('DGX_VLM_URL', 'http://10.0.0.20:8111')


class StorageClient:
    """Unified storage client using Supabase Storage for all media"""
    
    def __init__(self):
        # Supabase
        supabase_url = os.getenv('SUPABASE_URL')
        supabase_key = os.getenv('SUPABASE_SERVICE_KEY')
        
        if not supabase_url or not supabase_key:
            raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_KEY required in .env")
        
        self.supabase: Client = create_client(supabase_url, supabase_key)
        self.bucket_name = 'scraped-media'
        
        # Local NAS path
        self.nas_path = os.getenv('NAS_MOUNT_PATH')
        self.nas_enabled = os.getenv('NAS_SYNC_ENABLED', 'false').lower() == 'true'
        
        # Ensure bucket exists
        self._ensure_bucket()
    
    def _ensure_bucket(self):
        """Create scraped-media bucket if it doesn't exist"""
        try:
            buckets = self.supabase.storage.list_buckets()
            bucket_names = [b.name for b in buckets]
            if self.bucket_name not in bucket_names:
                self.supabase.storage.create_bucket(
                    self.bucket_name,
                    options={'public': True}
                )
                print(f"Created bucket: {self.bucket_name}")
        except Exception as e:
            print(f"Bucket check/create error (may already exist): {e}")
    
    def _generate_key(self, source: str, content_type: str, original_filename: str) -> str:
        """Generate a unique storage key based on source and content"""
        ext = Path(original_filename).suffix or mimetypes.guess_extension(content_type) or ''
        content_hash = hashlib.md5(original_filename.encode()).hexdigest()[:8]
        media_type = content_type.split('/')[0] if '/' in content_type else 'file'
        return f"{source}/{media_type}s/{content_hash}{ext}"
    
    def upload_file(
        self,
        file_path: str,
        source: str,
        content_type: Optional[str] = None,
        metadata: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """
        Upload a file to Supabase Storage
        
        Args:
            file_path: Local path to the file
            source: Source identifier (reddit, twitter, youtube, gofundme)
            content_type: MIME type (auto-detected if not provided)
            metadata: Additional metadata to store
            
        Returns:
            Dict with public_url, key, and size
        """
        path = Path(file_path)
        if not content_type:
            content_type, _ = mimetypes.guess_type(str(path))
            content_type = content_type or 'application/octet-stream'
        
        key = self._generate_key(source, content_type, path.name)
        
        with open(path, 'rb') as f:
            file_data = f.read()
        
        # Upload to Supabase Storage
        self.supabase.storage.from_(self.bucket_name).upload(
            path=key,
            file=file_data,
            file_options={'content-type': content_type}
        )
        
        # Get public URL
        public_url = self.supabase.storage.from_(self.bucket_name).get_public_url(key)
        file_size = path.stat().st_size
        
        return {
            'key': key,
            'public_url': public_url,
            'size': file_size,
            'content_type': content_type,
            'bucket': 'supabase'
        }
    
    def upload_bytes(
        self,
        data: bytes,
        filename: str,
        source: str,
        content_type: str,
        metadata: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """Upload bytes directly to Supabase Storage"""
        key = self._generate_key(source, content_type, filename)
        
        self.supabase.storage.from_(self.bucket_name).upload(
            path=key,
            file=data,
            file_options={'content-type': content_type}
        )
        
        public_url = self.supabase.storage.from_(self.bucket_name).get_public_url(key)
        
        return {
            'key': key,
            'public_url': public_url,
            'size': len(data),
            'content_type': content_type,
            'bucket': 'supabase'
        }
    
    def save_to_nas(self, file_path: str, relative_path: str) -> Optional[str]:
        """
        Save a copy to NAS (if enabled and mounted)
        
        Args:
            file_path: Local file to copy
            relative_path: Path within NAS storage
            
        Returns:
            NAS path or None if not enabled/available
        """
        if not self.nas_enabled or not self.nas_path:
            return None
        
        nas_full_path = Path(self.nas_path) / relative_path
        
        if not Path(self.nas_path).exists():
            print(f"Warning: NAS not mounted at {self.nas_path}")
            return None
        
        # Create directory structure
        nas_full_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Copy file
        import shutil
        shutil.copy2(file_path, nas_full_path)
        
        return str(nas_full_path)
    
    def insert_story(self, story_data: Dict[str, Any]) -> Dict[str, Any]:
        """Insert a scraped story into Supabase"""
        result = self.supabase.table('stories').insert(story_data).execute()
        return result.data[0] if result.data else {}
    
    def story_exists(self, source_url: str) -> bool:
        """Check if a story from this URL already exists (deduplication)"""
        result = self.supabase.table('stories').select('id').eq('source_url', source_url).execute()
        return len(result.data) > 0
    
    def get_stats(self) -> Dict[str, int]:
        """Get current scraping stats"""
        stories = self.supabase.table('stories').select('id', count='exact').execute()
        return {
            'total_stories': stories.count or 0
        }


class DGXServices:
    """Client for DGX Spark services (OCR, VLM, Whisper)"""
    
    def __init__(self):
        self.ocr_url = DGX_OCR_URL
        self.vlm_url = DGX_VLM_URL
    
    def ocr_image(self, image_path: str, timeout: int = 60) -> Dict[str, Any]:
        """
        Run OCR on an image using DGX EasyOCR server
        
        Args:
            image_path: Path to image file
            timeout: Request timeout in seconds
            
        Returns:
            Dict with 'text' and 'confidence'
        """
        try:
            with open(image_path, 'rb') as f:
                files = {'file': (Path(image_path).name, f, 'image/jpeg')}
                response = requests.post(
                    f"{self.ocr_url}/ocr",
                    files=files,
                    timeout=timeout
                )
            
            if response.status_code == 200:
                return response.json()
            else:
                return {'text': '', 'error': f"OCR failed: {response.status_code}"}
        except requests.exceptions.ConnectionError:
            return {'text': '', 'error': 'DGX OCR server not reachable'}
        except Exception as e:
            return {'text': '', 'error': str(e)}
    
    def caption_image(self, image_path: str, prompt: str = "Describe this image in detail.", timeout: int = 30) -> Dict[str, Any]:
        """
        Generate caption for image using DeepSeek-VL2 on DGX
        
        Args:
            image_path: Path to image file
            prompt: Prompt for the VLM
            timeout: Request timeout in seconds
            
        Returns:
            Dict with 'caption'
        """
        try:
            import base64
            with open(image_path, 'rb') as f:
                image_b64 = base64.b64encode(f.read()).decode()
            
            response = requests.post(
                f"{self.vlm_url}/v1/chat/completions",
                json={
                    "model": "deepseek-ai/deepseek-vl2-tiny",
                    "messages": [
                        {
                            "role": "user",
                            "content": [
                                {"type": "text", "text": prompt},
                                {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{image_b64}"}}
                            ]
                        }
                    ],
                    "max_tokens": 500
                },
                timeout=timeout
            )
            
            if response.status_code == 200:
                data = response.json()
                caption = data.get('choices', [{}])[0].get('message', {}).get('content', '')
                return {'caption': caption}
            else:
                return {'caption': '', 'error': f"VLM failed: {response.status_code}"}
        except requests.exceptions.ConnectionError:
            return {'caption': '', 'error': 'DGX VLM server not reachable'}
        except Exception as e:
            return {'caption': '', 'error': str(e)}
    
    def check_health(self) -> Dict[str, bool]:
        """Check if DGX services are available"""
        health = {'ocr': False, 'vlm': False}
        
        try:
            r = requests.get(f"{self.ocr_url}/health", timeout=5)
            health['ocr'] = r.status_code == 200
        except:
            pass
        
        try:
            r = requests.get(f"{self.vlm_url}/health", timeout=5)
            health['vlm'] = r.status_code == 200
        except:
            pass
        
        return health


# Singleton instances
_storage_client = None
_dgx_services = None

def get_storage() -> StorageClient:
    global _storage_client
    if _storage_client is None:
        _storage_client = StorageClient()
    return _storage_client

def get_dgx() -> DGXServices:
    global _dgx_services
    if _dgx_services is None:
        _dgx_services = DGXServices()
    return _dgx_services
