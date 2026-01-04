-- Create storage bucket for story images and videos
-- Migration: 20260103000001_story_images_bucket.sql

-- Create the bucket for story images (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'story-images',
  'story-images',
  true, -- public access
  52428800, -- 50MB file size limit (for videos)
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/quicktime', 'video/webm', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Drop policies if they exist and recreate them
DROP POLICY IF EXISTS "Public read access for story images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload story images" ON storage.objects;

-- Enable public read access
CREATE POLICY "Public read access for story images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'story-images');

-- Allow anyone to upload (for anonymous story submissions)
CREATE POLICY "Anyone can upload story images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'story-images');
