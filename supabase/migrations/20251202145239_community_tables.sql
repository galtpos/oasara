-- =========================================
-- OASARA COMMUNITY TABLES
-- Comments and Activity Feed
-- =========================================

-- =========================================
-- 1. FACILITY COMMENTS TABLE
-- =========================================

CREATE TABLE IF NOT EXISTS facility_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) >= 10 AND char_length(content) <= 2000),
  parent_id UUID REFERENCES facility_comments(id) ON DELETE CASCADE, -- For threaded replies
  upvotes INTEGER DEFAULT 0,
  is_edited BOOLEAN DEFAULT false,
  is_hidden BOOLEAN DEFAULT false, -- For moderation
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for comments
CREATE INDEX IF NOT EXISTS idx_comments_facility ON facility_comments(facility_id);
CREATE INDEX IF NOT EXISTS idx_comments_user ON facility_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON facility_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_created ON facility_comments(created_at DESC);

-- =========================================
-- 2. COMMENT UPVOTES TABLE (prevent double voting)
-- =========================================

CREATE TABLE IF NOT EXISTS comment_upvotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES facility_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(comment_id, user_id)
);

-- Index for upvotes
CREATE INDEX IF NOT EXISTS idx_upvotes_comment ON comment_upvotes(comment_id);
CREATE INDEX IF NOT EXISTS idx_upvotes_user ON comment_upvotes(user_id);

-- =========================================
-- 3. ACTIVITY FEED TABLE
-- =========================================

CREATE TABLE IF NOT EXISTS activity_feed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('comment', 'signup', 'facility_save', 'question', 'upvote')),
  target_type TEXT CHECK (target_type IN ('facility', 'trust_law', 'comment', 'user')),
  target_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  is_public BOOLEAN DEFAULT true, -- User can opt out of activity visibility
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for activity feed
CREATE INDEX IF NOT EXISTS idx_activity_created ON activity_feed(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_type ON activity_feed(activity_type);
CREATE INDEX IF NOT EXISTS idx_activity_user ON activity_feed(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_public ON activity_feed(is_public) WHERE is_public = true;

-- =========================================
-- 4. SAVED FACILITIES TABLE (if not exists)
-- =========================================

CREATE TABLE IF NOT EXISTS saved_facilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, facility_id)
);

-- Index for saved facilities
CREATE INDEX IF NOT EXISTS idx_saved_user ON saved_facilities(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_facility ON saved_facilities(facility_id);

-- =========================================
-- 5. ROW LEVEL SECURITY POLICIES
-- =========================================

-- Enable RLS
ALTER TABLE facility_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_upvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_facilities ENABLE ROW LEVEL SECURITY;

-- FACILITY COMMENTS POLICIES
-- Anyone can read non-hidden comments
CREATE POLICY "Comments are viewable by everyone"
  ON facility_comments FOR SELECT
  USING (is_hidden = false);

-- Authenticated users can create comments
CREATE POLICY "Authenticated users can create comments"
  ON facility_comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own comments
CREATE POLICY "Users can update own comments"
  ON facility_comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete own comments"
  ON facility_comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins can do anything with comments
CREATE POLICY "Admins can manage all comments"
  ON facility_comments FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- COMMENT UPVOTES POLICIES
-- Anyone can read upvotes
CREATE POLICY "Upvotes are viewable by everyone"
  ON comment_upvotes FOR SELECT
  USING (true);

-- Authenticated users can create upvotes
CREATE POLICY "Authenticated users can upvote"
  ON comment_upvotes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can remove their own upvotes
CREATE POLICY "Users can remove own upvotes"
  ON comment_upvotes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ACTIVITY FEED POLICIES
-- Anyone can read public activities
CREATE POLICY "Public activities are viewable by everyone"
  ON activity_feed FOR SELECT
  USING (is_public = true OR user_id = auth.uid());

-- System can insert activities (via service role)
CREATE POLICY "Service role can insert activities"
  ON activity_feed FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- SAVED FACILITIES POLICIES
-- Users can only see their own saved facilities
CREATE POLICY "Users can view own saved facilities"
  ON saved_facilities FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can save facilities
CREATE POLICY "Users can save facilities"
  ON saved_facilities FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own saved facilities
CREATE POLICY "Users can unsave facilities"
  ON saved_facilities FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- =========================================
-- 6. FUNCTIONS AND TRIGGERS
-- =========================================

-- Function to update comment count in upvotes
CREATE OR REPLACE FUNCTION update_comment_upvotes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE facility_comments
    SET upvotes = upvotes + 1
    WHERE id = NEW.comment_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE facility_comments
    SET upvotes = upvotes - 1
    WHERE id = OLD.comment_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for upvote counting
DROP TRIGGER IF EXISTS on_upvote_change ON comment_upvotes;
CREATE TRIGGER on_upvote_change
  AFTER INSERT OR DELETE ON comment_upvotes
  FOR EACH ROW
  EXECUTE FUNCTION update_comment_upvotes();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  NEW.is_edited = true;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for comment updates
DROP TRIGGER IF EXISTS on_comment_update ON facility_comments;
CREATE TRIGGER on_comment_update
  BEFORE UPDATE OF content ON facility_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Function to create activity on comment
CREATE OR REPLACE FUNCTION create_comment_activity()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO activity_feed (user_id, activity_type, target_type, target_id, metadata)
  VALUES (
    NEW.user_id,
    'comment',
    'facility',
    NEW.facility_id,
    jsonb_build_object(
      'comment_id', NEW.id,
      'preview', substring(NEW.content from 1 for 100)
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for comment activity
DROP TRIGGER IF EXISTS on_comment_create ON facility_comments;
CREATE TRIGGER on_comment_create
  AFTER INSERT ON facility_comments
  FOR EACH ROW
  EXECUTE FUNCTION create_comment_activity();

-- =========================================
-- 7. VIEWS FOR EASY QUERYING
-- =========================================

-- View for comments with user info
CREATE OR REPLACE VIEW comments_with_users AS
SELECT
  c.*,
  u.name as user_name,
  u.avatar_url as user_avatar,
  f.name as facility_name,
  f.city as facility_city,
  f.country as facility_country
FROM facility_comments c
LEFT JOIN user_profiles u ON c.user_id = u.id
LEFT JOIN facilities f ON c.facility_id = f.id
WHERE c.is_hidden = false;

-- View for recent public activity
CREATE OR REPLACE VIEW recent_activity AS
SELECT
  a.*,
  u.name as user_name,
  CASE
    WHEN a.activity_type = 'comment' THEN 'commented on a facility'
    WHEN a.activity_type = 'signup' THEN 'joined the Oasis'
    WHEN a.activity_type = 'facility_save' THEN 'saved a facility'
    WHEN a.activity_type = 'upvote' THEN 'upvoted a comment'
    ELSE 'took an action'
  END as activity_description
FROM activity_feed a
LEFT JOIN user_profiles u ON a.user_id = u.id
WHERE a.is_public = true
ORDER BY a.created_at DESC;

-- =========================================
-- DEPLOYMENT NOTES
-- =========================================
-- Run this SQL in Supabase SQL Editor or via CLI:
-- psql "postgresql://..." -f database/COMMUNITY-TABLES.sql
--
-- After running, verify:
-- 1. Tables created: facility_comments, comment_upvotes, activity_feed, saved_facilities
-- 2. RLS enabled on all tables
-- 3. Policies created for each table
-- 4. Triggers and functions working
