-- Migration: Add columns for scraped story data
-- Phase 3: Data Liberation

-- Add columns for scraped content metadata
ALTER TABLE stories ADD COLUMN IF NOT EXISTS source_platform TEXT;
ALTER TABLE stories ADD COLUMN IF NOT EXISTS is_scraped BOOLEAN DEFAULT FALSE;
ALTER TABLE stories ADD COLUMN IF NOT EXISTS viral_score INTEGER DEFAULT 5;
ALTER TABLE stories ADD COLUMN IF NOT EXISTS key_quote TEXT;
ALTER TABLE stories ADD COLUMN IF NOT EXISTS emotional_tags TEXT[] DEFAULT '{}';
ALTER TABLE stories ADD COLUMN IF NOT EXISTS issues TEXT[] DEFAULT '{}';

-- Reddit-specific
ALTER TABLE stories ADD COLUMN IF NOT EXISTS reddit_score INTEGER;
ALTER TABLE stories ADD COLUMN IF NOT EXISTS reddit_comments INTEGER;
ALTER TABLE stories ADD COLUMN IF NOT EXISTS subreddit TEXT;

-- Twitter-specific
ALTER TABLE stories ADD COLUMN IF NOT EXISTS twitter_likes INTEGER;
ALTER TABLE stories ADD COLUMN IF NOT EXISTS twitter_retweets INTEGER;
ALTER TABLE stories ADD COLUMN IF NOT EXISTS twitter_username TEXT;

-- GoFundMe-specific
ALTER TABLE stories ADD COLUMN IF NOT EXISTS gofundme_goal NUMERIC;
ALTER TABLE stories ADD COLUMN IF NOT EXISTS gofundme_raised NUMERIC;

-- YouTube-specific
ALTER TABLE stories ADD COLUMN IF NOT EXISTS youtube_channel TEXT;
ALTER TABLE stories ADD COLUMN IF NOT EXISTS youtube_views INTEGER;
ALTER TABLE stories ADD COLUMN IF NOT EXISTS youtube_duration INTEGER;

-- OCR data from bill images
ALTER TABLE stories ADD COLUMN IF NOT EXISTS ocr_text TEXT;
ALTER TABLE stories ADD COLUMN IF NOT EXISTS ocr_amounts NUMERIC[] DEFAULT '{}';

-- Insurance details
ALTER TABLE stories ADD COLUMN IF NOT EXISTS insurance_involved BOOLEAN DEFAULT FALSE;
ALTER TABLE stories ADD COLUMN IF NOT EXISTS insurance_denied BOOLEAN DEFAULT FALSE;

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_stories_source_platform ON stories(source_platform);
CREATE INDEX IF NOT EXISTS idx_stories_is_scraped ON stories(is_scraped);
CREATE INDEX IF NOT EXISTS idx_stories_viral_score ON stories(viral_score DESC);
CREATE INDEX IF NOT EXISTS idx_stories_story_type ON stories(story_type);
CREATE INDEX IF NOT EXISTS idx_stories_emotional_tags ON stories USING GIN(emotional_tags);
CREATE INDEX IF NOT EXISTS idx_stories_issues ON stories USING GIN(issues);

-- Full-text search index on content
CREATE INDEX IF NOT EXISTS idx_stories_content_fts ON stories USING GIN(to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(content, '')));

COMMENT ON COLUMN stories.source_platform IS 'Original platform: reddit, twitter, gofundme, youtube, user_submitted';
COMMENT ON COLUMN stories.is_scraped IS 'True if story was scraped vs user-submitted';
COMMENT ON COLUMN stories.viral_score IS 'Virality potential 1-10';
COMMENT ON COLUMN stories.key_quote IS 'Most shareable quote from the story';
COMMENT ON COLUMN stories.emotional_tags IS 'Array of emotions: anger, shock, relief, gratitude, frustration, hope';
COMMENT ON COLUMN stories.issues IS 'Array of issues: denied_coverage, surprise_bill, price_gouging, medical_debt, bankruptcy';

