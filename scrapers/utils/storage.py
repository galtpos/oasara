"""
Cloudflare R2 + Supabase Storage Client
Handles all media uploads for scraped content
"""
import os
import boto3
import hashlib
import mimetypes
from typing import Optional, Dict, Any
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()


class StorageClient:
    """Unified storage client for R2 (scraped) and Supabase (user uploads)"""
    
    def __init__(self):
        # Cloudflare R2 (S3-compatible)
        self.r2 = boto3.client(
            's3',
            endpoint_url=f"https://{os.getenv('R2_ACCOUNT_ID')}.r2.cloudflarestorage.com",
            aws_access_key_id=os.getenv('R2_ACCESS_KEY_ID'),
            aws_secret_access_key=os.getenv('R2_SECRET_ACCESS_KEY'),
            region_name='auto'
        )
        self.r2_bucket = os.getenv('R2_BUCKET_NAME', 'oasara-scraped-media')
        self.r2_public_url = os.getenv('R2_PUBLIC_URL')
        
        # Supabase
        self.supabase: Client = create_client(
            os.getenv('SUPABASE_URL'),
            os.getenv('SUPABASE_SERVICE_KEY')
        )
        
        # Local NAS path
        self.nas_path = os.getenv('NAS_MOUNT_PATH')
        self.nas_enabled = os.getenv('NAS_SYNC_ENABLED', 'false').lower() == 'true'
    
    def _generate_key(self, source: str, content_type: str, original_filename: str) -> str:
        """Generate a unique storage key based on source and content"""
        ext = Path(original_filename).suffix or mimetypes.guess_extension(content_type) or ''
        content_hash = hashlib.md5(original_filename.encode()).hexdigest()[:8]
        return f"{source}/{content_type.split('/')[0]}s/{content_hash}{ext}"
    
    def upload_to_r2(
        self,
        file_path: str,
        source: str,
        content_type: Optional[str] = None,
        metadata: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """
        Upload a file to Cloudflare R2
        
        Args:
            file_path: Local path to the file
            source: Source identifier (reddit, twitter, youtube, etc.)
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
        
        extra_args = {
            'ContentType': content_type,
            'Metadata': metadata or {}
        }
        
        # Upload to R2
        self.r2.upload_file(
            str(path),
            self.r2_bucket,
            key,
            ExtraArgs=extra_args
        )
        
        file_size = path.stat().st_size
        
        return {
            'key': key,
            'public_url': f"{self.r2_public_url}/{key}",
            'size': file_size,
            'content_type': content_type,
            'bucket': 'r2'
        }
    
    def upload_bytes_to_r2(
        self,
        data: bytes,
        filename: str,
        source: str,
        content_type: str,
        metadata: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """Upload bytes directly to R2 without saving to disk first"""
        key = self._generate_key(source, content_type, filename)
        
        self.r2.put_object(
            Bucket=self.r2_bucket,
            Key=key,
            Body=data,
            ContentType=content_type,
            Metadata=metadata or {}
        )
        
        return {
            'key': key,
            'public_url': f"{self.r2_public_url}/{key}",
            'size': len(data),
            'content_type': content_type,
            'bucket': 'r2'
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


# Singleton instance
_storage_client = None

def get_storage() -> StorageClient:
    global _storage_client
    if _storage_client is None:
        _storage_client = StorageClient()
    return _storage_client

