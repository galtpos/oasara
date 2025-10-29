-- Fix Row Level Security to allow updates to facilities table
-- Run this in Supabase SQL Editor

-- Drop existing UPDATE policy if it exists
DROP POLICY IF EXISTS "Allow public facility updates" ON facilities;

-- Create new UPDATE policy that allows all updates
CREATE POLICY "Allow public facility updates"
ON facilities FOR UPDATE
USING (true)
WITH CHECK (true);

-- Verify policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd
FROM pg_policies
WHERE tablename = 'facilities';
