-- Migration to extend user_inquiries table for guest inquiries
-- Allows non-registered users to contact facilities

-- Add columns for guest inquiries (sender info when not logged in)
ALTER TABLE user_inquiries
  ADD COLUMN IF NOT EXISTS sender_name TEXT,
  ADD COLUMN IF NOT EXISTS sender_email TEXT,
  ADD COLUMN IF NOT EXISTS sender_phone TEXT,
  ADD COLUMN IF NOT EXISTS preferred_contact TEXT DEFAULT 'email' CHECK (preferred_contact IN ('email', 'phone', 'whatsapp')),
  ADD COLUMN IF NOT EXISTS ip_address TEXT,
  ADD COLUMN IF NOT EXISTS user_agent TEXT,
  ADD COLUMN IF NOT EXISTS facility_notified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS seeker_confirmed BOOLEAN DEFAULT false;

-- Update status enum to include 'pending' for new inquiries
ALTER TABLE user_inquiries
  DROP CONSTRAINT IF EXISTS user_inquiries_status_check;

ALTER TABLE user_inquiries
  ADD CONSTRAINT user_inquiries_status_check
  CHECK (status IN ('pending', 'sent', 'viewed', 'replied', 'closed'));

-- Make user_id nullable for guest inquiries
ALTER TABLE user_inquiries
  ALTER COLUMN user_id DROP NOT NULL;

-- Add index for sender_email to find guest inquiries
CREATE INDEX IF NOT EXISTS idx_user_inquiries_sender_email
  ON user_inquiries(sender_email)
  WHERE sender_email IS NOT NULL;

-- Update RLS policies to allow guest inquiries
DROP POLICY IF EXISTS "Users can create inquiries" ON user_inquiries;
DROP POLICY IF EXISTS "Anyone can create guest inquiries" ON user_inquiries;

-- Allow anyone to create inquiries (for guest users)
CREATE POLICY "Anyone can create inquiries"
  ON user_inquiries FOR INSERT
  WITH CHECK (true);

-- Allow service role to manage all inquiries
DROP POLICY IF EXISTS "Service role can manage inquiries" ON user_inquiries;
CREATE POLICY "Service role full access"
  ON user_inquiries FOR ALL
  USING (true);

-- Comment on columns
COMMENT ON COLUMN user_inquiries.sender_name IS 'Name of sender for guest inquiries';
COMMENT ON COLUMN user_inquiries.sender_email IS 'Email of sender for guest inquiries';
COMMENT ON COLUMN user_inquiries.sender_phone IS 'Phone of sender (optional)';
COMMENT ON COLUMN user_inquiries.preferred_contact IS 'Preferred contact method: email, phone, or whatsapp';
COMMENT ON COLUMN user_inquiries.facility_notified IS 'Whether facility was notified via email';
COMMENT ON COLUMN user_inquiries.seeker_confirmed IS 'Whether seeker received confirmation email';
