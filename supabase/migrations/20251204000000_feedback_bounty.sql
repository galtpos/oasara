-- Add bounty tracking to feedback table
-- $20 fUSD bounty for accepted feedback

-- Add new columns for bounty system
ALTER TABLE feedback
ADD COLUMN IF NOT EXISTS accepted BOOLEAN DEFAULT NULL,
ADD COLUMN IF NOT EXISTS bounty_paid BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS admin_response TEXT,
ADD COLUMN IF NOT EXISTS wallet_address TEXT,
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE;

-- Update status check constraint to include 'accepted' and 'rejected'
ALTER TABLE feedback DROP CONSTRAINT IF EXISTS feedback_status_check;
ALTER TABLE feedback ADD CONSTRAINT feedback_status_check
  CHECK (status IN ('new', 'read', 'responded', 'resolved', 'accepted', 'rejected'));

-- Index for finding unpaid bounties
CREATE INDEX IF NOT EXISTS idx_feedback_bounty ON feedback(accepted, bounty_paid) WHERE accepted = true;

-- Policy for admins to update feedback (you'll need to set this up properly)
CREATE POLICY "Admins can update feedback" ON feedback
  FOR UPDATE USING (true);
