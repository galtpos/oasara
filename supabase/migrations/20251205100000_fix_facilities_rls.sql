-- Fix facilities RLS to allow public read access
-- This is critical for the public site to work

-- Ensure RLS is enabled
ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists (to avoid conflict)
DROP POLICY IF EXISTS "Public can read facilities" ON facilities;
DROP POLICY IF EXISTS "Anyone can read facilities" ON facilities;
DROP POLICY IF EXISTS "facilities_public_read" ON facilities;

-- Create policy for public read access
CREATE POLICY "Anyone can read facilities" ON facilities
  FOR SELECT
  USING (true);
