-- Fix feedback table schema for BountyBoard
-- Add missing columns and update category constraint

-- Add missing columns if they don't exist
ALTER TABLE feedback
  ADD COLUMN IF NOT EXISTS accepted BOOLEAN DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS bounty_paid BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS admin_response TEXT,
  ADD COLUMN IF NOT EXISTS wallet_address TEXT;

-- Drop the old category constraint and add new one with 'ux'
ALTER TABLE feedback DROP CONSTRAINT IF EXISTS feedback_category_check;
ALTER TABLE feedback ADD CONSTRAINT feedback_category_check
  CHECK (category IN ('general', 'bug', 'feature', 'data', 'facility', 'ux'));

-- Create index on accepted for filtering
CREATE INDEX IF NOT EXISTS idx_feedback_accepted ON feedback(accepted);
