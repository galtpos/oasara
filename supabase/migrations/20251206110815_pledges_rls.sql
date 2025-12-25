-- Enable RLS on pledges if not already enabled
ALTER TABLE IF EXISTS pledges ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "pledges_public_read" ON pledges;
DROP POLICY IF EXISTS "pledges_insert" ON pledges;

-- Allow anyone to read pledges
CREATE POLICY "pledges_public_read" ON pledges FOR SELECT USING (true);

-- Allow anyone to insert pledges
CREATE POLICY "pledges_public_insert" ON pledges FOR INSERT WITH CHECK (true);
