-- Add INSERT policy to facilities table
-- Run this in Supabase SQL Editor to allow data imports

DROP POLICY IF EXISTS "Allow public facility inserts" ON facilities;
CREATE POLICY "Allow public facility inserts"
ON facilities FOR INSERT
WITH CHECK (true);
