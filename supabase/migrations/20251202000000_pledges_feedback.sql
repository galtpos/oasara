-- OASARA Pledges and Feedback Tables
-- Run this against your Supabase database

-- Pledges table
CREATE TABLE IF NOT EXISTS pledges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT,
  name TEXT,
  pledge_type TEXT NOT NULL CHECK (pledge_type IN ('medical_trust', 'cancel_insurance', 'try_medical_tourism')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(email, pledge_type) -- Prevent duplicate pledges from same email
);

-- Feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT,
  name TEXT,
  category TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('general', 'bug', 'feature', 'data', 'facility')),
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'responded', 'resolved')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE pledges ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Policies for pledges
-- Anyone can insert pledges (anonymous access)
CREATE POLICY "Anyone can insert pledges" ON pledges
  FOR INSERT WITH CHECK (true);

-- Anyone can read pledge counts (for display)
CREATE POLICY "Anyone can read pledges" ON pledges
  FOR SELECT USING (true);

-- Policies for feedback
-- Anyone can insert feedback (anonymous access)
CREATE POLICY "Anyone can insert feedback" ON feedback
  FOR INSERT WITH CHECK (true);

-- Only admins can read feedback (optional - remove if you want public)
-- CREATE POLICY "Admins can read feedback" ON feedback
--   FOR SELECT USING (auth.uid() IN (SELECT id FROM user_profiles WHERE user_type = 'admin'));

-- For now, allow public read for simplicity
CREATE POLICY "Anyone can read feedback" ON feedback
  FOR SELECT USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_pledges_type ON pledges(pledge_type);
CREATE INDEX IF NOT EXISTS idx_pledges_email ON pledges(email);
CREATE INDEX IF NOT EXISTS idx_feedback_category ON feedback(category);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback(status);
CREATE INDEX IF NOT EXISTS idx_feedback_created ON feedback(created_at DESC);
