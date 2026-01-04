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

-- Enable public read access
CREATE POLICY IF NOT EXISTS "Public read access for story images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'story-images');

-- Allow authenticated users to upload
CREATE POLICY IF NOT EXISTS "Authenticated users can upload story images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'story-images');

-- Allow anonymous uploads for story submissions
CREATE POLICY IF NOT EXISTS "Anyone can upload story images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'story-images');

