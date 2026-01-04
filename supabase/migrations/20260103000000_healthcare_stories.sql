-- Healthcare Stories Community Platform
-- Migration: 20260103000000_healthcare_stories.sql
-- Purpose: Create tables for viral story sharing platform

-- Enable pgvector extension for semantic search
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================
-- STORIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES auth.users ON DELETE SET NULL,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  summary TEXT, -- AI-generated summary for cards/previews
  
  -- Story classification
  story_type TEXT NOT NULL CHECK (story_type IN ('horror', 'success', 'comparison')),
  
  -- Taxonomy (multi-dimensional tagging)
  issues TEXT[] DEFAULT '{}', -- billing, insurance_denial, bankruptcy, wait_time, quality, medical_tourism
  procedure TEXT, -- dental, cardiac, orthopedic, cosmetic, etc.
  location_us_state TEXT, -- for horror stories
  location_country TEXT, -- for medical tourism stories
  
  -- Cost data (for comparisons)
  cost_us NUMERIC, -- what they paid/were billed in US
  cost_abroad NUMERIC, -- what they paid abroad
  savings_percent NUMERIC, -- calculated savings
  
  -- Author identity (per-story choice)
  verification_level TEXT DEFAULT 'anonymous' CHECK (verification_level IN ('anonymous', 'email_verified', 'identity_verified', 'document_verified')),
  display_name TEXT, -- how author wants to be shown
  show_location BOOLEAN DEFAULT false, -- show author's general location
  author_location TEXT, -- city/state if shown
  
  -- Media
  images TEXT[] DEFAULT '{}', -- array of storage URLs
  video_url TEXT,
  video_transcript TEXT,
  bill_images TEXT[] DEFAULT '{}', -- specifically for bill/receipt images
  
  -- Metrics (denormalized for performance)
  view_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  reaction_counts JSONB DEFAULT '{"heart": 0, "me_too": 0, "outraged": 0, "inspiring": 0, "shared": 0}',
  
  -- Viral kit
  share_card_url TEXT, -- generated share card image
  twitter_thread TEXT, -- generated thread content
  
  -- Moderation & featuring
  status TEXT DEFAULT 'pending' CHECK (status IN ('draft', 'pending', 'published', 'hidden', 'featured')),
  is_featured BOOLEAN DEFAULT false,
  featured_at TIMESTAMPTZ,
  moderation_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  published_at TIMESTAMPTZ
);

-- Indexes for common queries
CREATE INDEX idx_stories_status ON stories(status);
CREATE INDEX idx_stories_story_type ON stories(story_type);
CREATE INDEX idx_stories_procedure ON stories(procedure);
CREATE INDEX idx_stories_author ON stories(author_id);
CREATE INDEX idx_stories_created ON stories(created_at DESC);
CREATE INDEX idx_stories_published ON stories(published_at DESC) WHERE status = 'published';
CREATE INDEX idx_stories_featured ON stories(featured_at DESC) WHERE is_featured = true;
CREATE INDEX idx_stories_issues ON stories USING GIN(issues);

-- ============================================
-- STORY REACTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS story_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES stories ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  session_id TEXT, -- for anonymous reactions (fingerprint or session)
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('heart', 'me_too', 'outraged', 'inspiring', 'shared')),
  created_at TIMESTAMPTZ DEFAULT now(),
  
  -- One reaction per type per user (or session)
  UNIQUE(story_id, user_id, reaction_type),
  UNIQUE(story_id, session_id, reaction_type)
);

CREATE INDEX idx_reactions_story ON story_reactions(story_id);
CREATE INDEX idx_reactions_user ON story_reactions(user_id);

-- ============================================
-- STORY COMMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS story_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES stories ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users ON DELETE SET NULL,
  parent_id UUID REFERENCES story_comments ON DELETE CASCADE, -- for threading
  
  content TEXT NOT NULL,
  display_name TEXT, -- how commenter wants to appear
  
  -- Moderation
  is_pinned BOOLEAN DEFAULT false,
  is_hidden BOOLEAN DEFAULT false,
  is_author_reply BOOLEAN DEFAULT false, -- story author's response
  
  -- Metrics
  like_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_comments_story ON story_comments(story_id);
CREATE INDEX idx_comments_parent ON story_comments(parent_id);
CREATE INDEX idx_comments_author ON story_comments(author_id);

-- ============================================
-- STORY VECTORS TABLE (for semantic search)
-- ============================================
CREATE TABLE IF NOT EXISTS story_vectors (
  story_id UUID PRIMARY KEY REFERENCES stories ON DELETE CASCADE,
  embedding vector(384), -- all-MiniLM-L6-v2 dimension
  content_hash TEXT, -- to detect when re-embedding needed
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- STORY SHARES TABLE (track viral spread)
-- ============================================
CREATE TABLE IF NOT EXISTS story_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES stories ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users,
  
  platform TEXT NOT NULL, -- twitter, facebook, linkedin, tiktok, instagram, copy, email
  share_type TEXT, -- card, thread, carousel, video, link
  
  -- UTM tracking
  utm_campaign TEXT,
  utm_source TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_shares_story ON story_shares(story_id);
CREATE INDEX idx_shares_platform ON story_shares(platform);

-- ============================================
-- AUTHOR BADGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS author_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  badge_type TEXT NOT NULL CHECK (badge_type IN ('first_story', 'verified_contributor', 'viral_story', 'impact_maker', 'movement_builder')),
  
  -- Context for the badge
  story_id UUID REFERENCES stories, -- which story earned it (if applicable)
  threshold_value INTEGER, -- e.g., 100 for viral, 10 for impact_maker
  
  awarded_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(user_id, badge_type)
);

CREATE INDEX idx_badges_user ON author_badges(user_id);

-- ============================================
-- AUTHOR STATS TABLE (aggregated metrics)
-- ============================================
CREATE TABLE IF NOT EXISTS author_stats (
  user_id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  
  story_count INTEGER DEFAULT 0,
  total_views INTEGER DEFAULT 0,
  total_shares INTEGER DEFAULT 0,
  total_reactions JSONB DEFAULT '{"heart": 0, "me_too": 0, "outraged": 0, "inspiring": 0, "shared": 0}',
  pledges_influenced INTEGER DEFAULT 0, -- tracked when pledge happens after viewing story
  
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Stories: public read for published, author can manage own
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published stories are viewable by everyone"
  ON stories FOR SELECT
  USING (status IN ('published', 'featured'));

CREATE POLICY "Authors can view their own stories"
  ON stories FOR SELECT
  USING (auth.uid() = author_id);

CREATE POLICY "Authenticated users can create stories"
  ON stories FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their own stories"
  ON stories FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete their own stories"
  ON stories FOR DELETE
  USING (auth.uid() = author_id);

-- Reactions: anyone can read, authenticated can create
ALTER TABLE story_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reactions are viewable by everyone"
  ON story_reactions FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can add reactions"
  ON story_reactions FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can remove their own reactions"
  ON story_reactions FOR DELETE
  USING (auth.uid() = user_id);

-- Comments: public read for non-hidden, authenticated can create
ALTER TABLE story_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Visible comments are viewable by everyone"
  ON story_comments FOR SELECT
  USING (is_hidden = false);

CREATE POLICY "Authenticated users can create comments"
  ON story_comments FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their own comments"
  ON story_comments FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete their own comments"
  ON story_comments FOR DELETE
  USING (auth.uid() = author_id);

-- Shares: insert only (tracking), no read for privacy
ALTER TABLE story_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can log a share"
  ON story_shares FOR INSERT
  WITH CHECK (true);

-- Badges and stats: users see their own
ALTER TABLE author_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE author_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own badges"
  ON author_badges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Badges are publicly viewable"
  ON author_badges FOR SELECT
  USING (true);

CREATE POLICY "Users can view their own stats"
  ON author_stats FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-generate slug from title
CREATE OR REPLACE FUNCTION generate_story_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := lower(regexp_replace(NEW.title, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || substr(NEW.id::text, 1, 8);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_story_slug
  BEFORE INSERT ON stories
  FOR EACH ROW
  EXECUTE FUNCTION generate_story_slug();

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_story_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_story_timestamp
  BEFORE UPDATE ON stories
  FOR EACH ROW
  EXECUTE FUNCTION update_story_timestamp();

-- Update reaction counts on stories (denormalized)
CREATE OR REPLACE FUNCTION update_story_reaction_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE stories
    SET reaction_counts = jsonb_set(
      reaction_counts,
      ARRAY[NEW.reaction_type],
      to_jsonb(COALESCE((reaction_counts->>NEW.reaction_type)::int, 0) + 1)
    )
    WHERE id = NEW.story_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE stories
    SET reaction_counts = jsonb_set(
      reaction_counts,
      ARRAY[OLD.reaction_type],
      to_jsonb(GREATEST(COALESCE((reaction_counts->>OLD.reaction_type)::int, 0) - 1, 0))
    )
    WHERE id = OLD.story_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_reaction_counts
  AFTER INSERT OR DELETE ON story_reactions
  FOR EACH ROW
  EXECUTE FUNCTION update_story_reaction_counts();

-- Update comment count on stories
CREATE OR REPLACE FUNCTION update_story_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE stories SET comment_count = comment_count + 1 WHERE id = NEW.story_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE stories SET comment_count = GREATEST(comment_count - 1, 0) WHERE id = OLD.story_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_comment_count
  AFTER INSERT OR DELETE ON story_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_story_comment_count();

-- Update share count
CREATE OR REPLACE FUNCTION update_story_share_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE stories SET share_count = share_count + 1 WHERE id = NEW.story_id;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_share_count
  AFTER INSERT ON story_shares
  FOR EACH ROW
  EXECUTE FUNCTION update_story_share_count();

-- ============================================
-- SEED DATA: Example story types for reference
-- ============================================
COMMENT ON TABLE stories IS 'Healthcare stories shared by users - horror stories, success stories, and comparisons';
COMMENT ON COLUMN stories.story_type IS 'horror = US system nightmare, success = medical tourism win, comparison = before/after';
COMMENT ON COLUMN stories.issues IS 'Array of issue tags: billing, insurance_denial, bankruptcy, wait_time, quality, medical_tourism';
COMMENT ON COLUMN stories.verification_level IS 'anonymous, email_verified, identity_verified, document_verified';

