-- OASARA User Authentication System
-- Database schema for user accounts, profiles, and email confirmation
-- Based on DaylightFreedom pattern with Resend email integration

-- ============================================================================
-- EXTENSIONS
-- ============================================================================

-- Note: gen_random_uuid() is built-in to PostgreSQL 13+, no extension needed

-- ============================================================================
-- USER PROFILES (extends Supabase auth.users)
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  user_type TEXT CHECK (user_type IN ('patient', 'facility_rep', 'admin')) DEFAULT 'patient',
  facility_id UUID REFERENCES facilities(id), -- For facility representatives
  avatar_url TEXT,
  phone TEXT,
  country TEXT,
  bio TEXT,
  preferences JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- PENDING EMAIL CONFIRMATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS pending_email_confirmations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  name TEXT,
  confirmation_token TEXT UNIQUE NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  confirmed BOOLEAN DEFAULT false,
  confirmed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP + INTERVAL '24 hours')
);

-- ============================================================================
-- SAVED FACILITIES (user favorites)
-- ============================================================================

CREATE TABLE IF NOT EXISTS saved_facilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
  notes TEXT,
  procedures_interested TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, facility_id)
);

-- ============================================================================
-- USER INQUIRIES (contact history with facilities)
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
  procedure_interest TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'viewed', 'replied', 'closed')),
  facility_response TEXT,
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- FACILITY CLAIMS (for facility representatives)
-- ============================================================================

CREATE TABLE IF NOT EXISTS facility_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  verification_document_url TEXT,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(facility_id, user_id)
);

-- ============================================================================
-- USER NOTIFICATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'inquiry_response', 'facility_update', 'system', etc.
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_type ON user_profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_pending_confirmations_token ON pending_email_confirmations(confirmation_token);
CREATE INDEX IF NOT EXISTS idx_pending_confirmations_email ON pending_email_confirmations(email);
CREATE INDEX IF NOT EXISTS idx_pending_confirmations_expires ON pending_email_confirmations(expires_at);
CREATE INDEX IF NOT EXISTS idx_saved_facilities_user ON saved_facilities(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_facilities_facility ON saved_facilities(facility_id);
CREATE INDEX IF NOT EXISTS idx_user_inquiries_user ON user_inquiries(user_id);
CREATE INDEX IF NOT EXISTS idx_user_inquiries_facility ON user_inquiries(facility_id);
CREATE INDEX IF NOT EXISTS idx_user_inquiries_status ON user_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_facility_claims_facility ON facility_claims(facility_id);
CREATE INDEX IF NOT EXISTS idx_facility_claims_status ON facility_claims(status);
CREATE INDEX IF NOT EXISTS idx_user_notifications_user ON user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_read ON user_notifications(read) WHERE read = false;

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_email_confirmations ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE facility_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Public can view facility rep profiles"
  ON user_profiles FOR SELECT
  USING (user_type = 'facility_rep');

-- Pending Confirmations Policies
CREATE POLICY "Anyone can create pending confirmations"
  ON pending_email_confirmations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can manage confirmations"
  ON pending_email_confirmations FOR ALL
  USING (true);

-- Saved Facilities Policies
CREATE POLICY "Users can view their own saved facilities"
  ON saved_facilities FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add saved facilities"
  ON saved_facilities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their saved facilities"
  ON saved_facilities FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their saved facilities"
  ON saved_facilities FOR DELETE
  USING (auth.uid() = user_id);

-- User Inquiries Policies
CREATE POLICY "Users can view their own inquiries"
  ON user_inquiries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create inquiries"
  ON user_inquiries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Facility reps can view inquiries to their facilities"
  ON user_inquiries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.facility_id = user_inquiries.facility_id
      AND user_profiles.user_type = 'facility_rep'
    )
  );

CREATE POLICY "Facility reps can respond to inquiries"
  ON user_inquiries FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.facility_id = user_inquiries.facility_id
      AND user_profiles.user_type = 'facility_rep'
    )
  );

-- Facility Claims Policies
CREATE POLICY "Users can view their own claims"
  ON facility_claims FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create claims"
  ON facility_claims FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all claims"
  ON facility_claims FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.user_type = 'admin'
    )
  );

-- User Notifications Policies
CREATE POLICY "Users can view their own notifications"
  ON user_notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON user_notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_saved_facilities_updated_at ON saved_facilities;
CREATE TRIGGER update_saved_facilities_updated_at
  BEFORE UPDATE ON saved_facilities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_inquiries_updated_at ON user_inquiries;
CREATE TRIGGER update_user_inquiries_updated_at
  BEFORE UPDATE ON user_inquiries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_facility_claims_updated_at ON facility_claims;
CREATE TRIGGER update_facility_claims_updated_at
  BEFORE UPDATE ON facility_claims
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to clean up expired confirmations
CREATE OR REPLACE FUNCTION cleanup_expired_confirmations()
RETURNS void AS $$
BEGIN
  DELETE FROM pending_email_confirmations
  WHERE expires_at < CURRENT_TIMESTAMP
  AND confirmed = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- Create admin user profile (if auth user exists)
-- You'll need to create the auth user first through Supabase dashboard

-- Example: INSERT INTO user_profiles (id, email, name, user_type)
-- VALUES ('your-auth-user-id', 'admin@oasara.com', 'Admin User', 'admin');

-- ============================================================================
-- NOTES
-- ============================================================================

-- To use this schema:
-- 1. Run this SQL in Supabase SQL Editor
-- 2. Set up Supabase Edge Functions for email sending (send-confirmation-email, confirm-email)
-- 3. Configure RESEND_API_KEY in Supabase Edge Function secrets
-- 4. Build React components for signup/login
-- 5. Test email confirmation flow

-- Cleanup expired confirmations daily (set up as cron job in Supabase):
-- SELECT cleanup_expired_confirmations();
