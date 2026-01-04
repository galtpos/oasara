-- Add missing columns for scraper data

-- Source URL for deduplication
ALTER TABLE stories ADD COLUMN IF NOT EXISTS source_url TEXT;
CREATE INDEX IF NOT EXISTS idx_stories_source_url ON stories(source_url);

-- Video thumbnail and media URLs
ALTER TABLE stories ADD COLUMN IF NOT EXISTS video_thumbnail_url TEXT;
ALTER TABLE stories ADD COLUMN IF NOT EXISTS media_urls TEXT[] DEFAULT '{}';

-- NAS paths for local storage reference
ALTER TABLE stories ADD COLUMN IF NOT EXISTS nas_video_path TEXT;
ALTER TABLE stories ADD COLUMN IF NOT EXISTS nas_thumbnail_path TEXT;

-- Facility and country info for medical tourism stories
ALTER TABLE stories ADD COLUMN IF NOT EXISTS country_abroad TEXT;
ALTER TABLE stories ADD COLUMN IF NOT EXISTS facility_name TEXT;
ALTER TABLE stories ADD COLUMN IF NOT EXISTS procedure_type TEXT;

COMMENT ON COLUMN stories.source_url IS 'Original URL where story was scraped from (for deduplication)';
COMMENT ON COLUMN stories.media_urls IS 'Array of media URLs (images, videos) associated with the story';
COMMENT ON COLUMN stories.nas_video_path IS 'Local NAS path to video file';

