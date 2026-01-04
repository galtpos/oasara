-- Allow anonymous story submissions
-- Migration: 20260103000002_anonymous_story_policy.sql

-- Add policy to allow anonymous story creation (author_id = null)
DROP POLICY IF EXISTS "Anyone can create anonymous stories" ON stories;

CREATE POLICY "Anyone can create anonymous stories"
  ON stories FOR INSERT
  WITH CHECK (author_id IS NULL);

