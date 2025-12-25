-- Enable RLS on affiliate_programs if not already enabled
ALTER TABLE IF EXISTS affiliate_programs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow anonymous read access" ON affiliate_programs;
DROP POLICY IF EXISTS "affiliate_programs_read" ON affiliate_programs;

-- Allow anyone to read affiliate programs
CREATE POLICY "affiliate_programs_public_read" ON affiliate_programs
  FOR SELECT
  USING (true);
