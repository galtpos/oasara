-- OASARA WEEK 2 MIGRATIONS - RUN THIS IN SUPABASE SQL EDITOR NOW
-- https://supabase.com/dashboard/project/whklrclzrtijneqdjmiy/sql/new

-- ============================================
-- MIGRATION 1: Contact Requests Table
-- ============================================

CREATE TABLE IF NOT EXISTS contact_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journey_id UUID REFERENCES patient_journeys(id) ON DELETE CASCADE,
  facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE NOT NULL,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  user_phone TEXT,
  message TEXT NOT NULL,
  procedure_type TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'replied', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  sent_at TIMESTAMPTZ,
  replied_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_contact_requests_journey_id ON contact_requests(journey_id);
CREATE INDEX IF NOT EXISTS idx_contact_requests_facility_id ON contact_requests(facility_id);
CREATE INDEX IF NOT EXISTS idx_contact_requests_status ON contact_requests(status);
CREATE INDEX IF NOT EXISTS idx_contact_requests_created_at ON contact_requests(created_at DESC);

ALTER TABLE contact_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own contact requests"
  ON contact_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM patient_journeys
      WHERE patient_journeys.id = contact_requests.journey_id
      AND patient_journeys.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create contact requests"
  ON contact_requests FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM patient_journeys
      WHERE patient_journeys.id = contact_requests.journey_id
      AND patient_journeys.user_id = auth.uid()
    )
  );

GRANT SELECT, INSERT, UPDATE ON contact_requests TO authenticated;

-- ============================================
-- MIGRATION 2: Journey Sharing System
-- ============================================

CREATE TABLE IF NOT EXISTS journey_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journey_id UUID REFERENCES patient_journeys(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'viewer')),
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  invited_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  accepted_at TIMESTAMPTZ,
  invitation_token UUID DEFAULT gen_random_uuid() UNIQUE,
  token_expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'revoked')),
  UNIQUE(journey_id, email)
);

CREATE INDEX IF NOT EXISTS idx_journey_collaborators_journey_id ON journey_collaborators(journey_id);
CREATE INDEX IF NOT EXISTS idx_journey_collaborators_user_id ON journey_collaborators(user_id);
CREATE INDEX IF NOT EXISTS idx_journey_collaborators_email ON journey_collaborators(email);
CREATE INDEX IF NOT EXISTS idx_journey_collaborators_token ON journey_collaborators(invitation_token);
CREATE INDEX IF NOT EXISTS idx_journey_collaborators_status ON journey_collaborators(status);

CREATE TABLE IF NOT EXISTS journey_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journey_id UUID REFERENCES patient_journeys(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  details JSONB,
  timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  ip_address TEXT,
  user_agent TEXT
);

CREATE INDEX IF NOT EXISTS idx_journey_access_log_journey_id ON journey_access_log(journey_id);
CREATE INDEX IF NOT EXISTS idx_journey_access_log_user_id ON journey_access_log(user_id);
CREATE INDEX IF NOT EXISTS idx_journey_access_log_timestamp ON journey_access_log(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_journey_access_log_action ON journey_access_log(action);

ALTER TABLE journey_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE journey_access_log ENABLE ROW LEVEL SECURITY;

-- Helper functions
CREATE OR REPLACE FUNCTION has_journey_access(p_journey_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM patient_journeys
    WHERE id = p_journey_id AND user_id = p_user_id
  ) OR EXISTS (
    SELECT 1 FROM journey_collaborators
    WHERE journey_id = p_journey_id
      AND user_id = p_user_id
      AND status = 'accepted'
  );
$$;

-- RLS policies
CREATE POLICY "Journey owners can view collaborators"
  ON journey_collaborators FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM patient_journeys
      WHERE patient_journeys.id = journey_collaborators.journey_id
      AND patient_journeys.user_id = auth.uid()
    )
  );

CREATE POLICY "Journey owners can invite collaborators"
  ON journey_collaborators FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM patient_journeys
      WHERE patient_journeys.id = journey_collaborators.journey_id
      AND patient_journeys.user_id = auth.uid()
    )
    AND invited_by = auth.uid()
  );

CREATE POLICY "System can insert access logs"
  ON journey_access_log FOR INSERT
  WITH CHECK (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON journey_collaborators TO authenticated;
GRANT SELECT, INSERT ON journey_access_log TO authenticated;
GRANT EXECUTE ON FUNCTION has_journey_access(UUID, UUID) TO authenticated;

-- Done! Refresh oasara.com and all features will appear.
