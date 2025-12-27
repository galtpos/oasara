-- Wallet Education Credentials Migration
-- Adds sovereignty credentials and FUSD faucet tracking for wallet education

-- Sovereignty Credentials Table
-- Tracks user progress through wallet education levels
CREATE TABLE IF NOT EXISTS sovereignty_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  credential_type TEXT NOT NULL DEFAULT 'money_sovereignty',
  level INT NOT NULL CHECK (level >= 1 AND level <= 5),
  name TEXT NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  verification_method TEXT, -- 'video_completion', 'quiz', 'transaction'
  verification_data JSONB, -- { videos_watched: [], quiz_score: 100, tx_hash: '...' }
  source_site TEXT DEFAULT 'oasara',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, credential_type, level)
);

-- Create index for fast lookups by user
CREATE INDEX IF NOT EXISTS idx_sovereignty_credentials_user_id ON sovereignty_credentials(user_id);
CREATE INDEX IF NOT EXISTS idx_sovereignty_credentials_level ON sovereignty_credentials(level);

-- FUSD Faucet Claims Table
-- Tracks the $5 FUSD incentive for first 100 users
CREATE TABLE IF NOT EXISTS fusd_faucet_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  amount_usd DECIMAL(10, 2) DEFAULT 5.00,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  tx_hash TEXT,
  claimed_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create index for counting claims
CREATE INDEX IF NOT EXISTS idx_fusd_faucet_claims_status ON fusd_faucet_claims(status);

-- Video Progress Table
-- Tracks which videos each user has completed
CREATE TABLE IF NOT EXISTS wallet_education_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id TEXT NOT NULL, -- e.g., '01_why_patient', '02_why_provider'
  completed BOOLEAN DEFAULT FALSE,
  watched_seconds INT DEFAULT 0,
  total_seconds INT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, video_id)
);

CREATE INDEX IF NOT EXISTS idx_wallet_education_progress_user_id ON wallet_education_progress(user_id);

-- Function to count faucet claims
CREATE OR REPLACE FUNCTION get_faucet_claims_count()
RETURNS INT
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COUNT(*)::INT FROM fusd_faucet_claims WHERE status != 'failed';
$$;

-- Function to check if faucet is available (under 100 claims)
CREATE OR REPLACE FUNCTION is_faucet_available()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT (SELECT COUNT(*) FROM fusd_faucet_claims WHERE status != 'failed') < 100;
$$;

-- Function to get user's credential level
CREATE OR REPLACE FUNCTION get_user_credential_level(p_user_id UUID)
RETURNS INT
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COALESCE(MAX(level), 0)::INT
  FROM sovereignty_credentials
  WHERE user_id = p_user_id AND credential_type = 'money_sovereignty';
$$;

-- RLS Policies

-- Sovereignty Credentials: Users can read their own, admins can read all
ALTER TABLE sovereignty_credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own credentials"
  ON sovereignty_credentials FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own credentials"
  ON sovereignty_credentials FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all credentials"
  ON sovereignty_credentials FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- FUSD Faucet Claims: Users can read their own, admins can manage
ALTER TABLE fusd_faucet_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own faucet claims"
  ON fusd_faucet_claims FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can claim faucet once"
  ON fusd_faucet_claims FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND NOT EXISTS (SELECT 1 FROM fusd_faucet_claims WHERE user_id = auth.uid())
    AND (SELECT COUNT(*) FROM fusd_faucet_claims WHERE status != 'failed') < 100
  );

CREATE POLICY "Admins can manage faucet claims"
  ON fusd_faucet_claims FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Video Progress: Users can manage their own progress
ALTER TABLE wallet_education_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own progress"
  ON wallet_education_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON wallet_education_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can modify own progress"
  ON wallet_education_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- Grant access to anon and authenticated roles
GRANT SELECT ON sovereignty_credentials TO anon, authenticated;
GRANT INSERT ON sovereignty_credentials TO authenticated;
GRANT SELECT ON fusd_faucet_claims TO anon, authenticated;
GRANT INSERT ON fusd_faucet_claims TO authenticated;
GRANT SELECT, INSERT, UPDATE ON wallet_education_progress TO authenticated;
GRANT EXECUTE ON FUNCTION get_faucet_claims_count() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION is_faucet_available() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_user_credential_level(UUID) TO authenticated;

-- Add updated_at trigger for wallet_education_progress
CREATE OR REPLACE FUNCTION update_wallet_education_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_wallet_education_progress_timestamp
  BEFORE UPDATE ON wallet_education_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_wallet_education_progress_updated_at();

COMMENT ON TABLE sovereignty_credentials IS 'Tracks user progress through wallet education credential levels';
COMMENT ON TABLE fusd_faucet_claims IS 'Tracks $5 FUSD incentive claims for first 100 users';
COMMENT ON TABLE wallet_education_progress IS 'Tracks video completion progress for each user';
