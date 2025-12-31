-- Journey Sharing System Migration
-- Enables journey owners to share with family members (Owner/Viewer roles)
-- Includes invitation system, access control, and activity logging for HIPAA compliance

-- Journey Collaborators Table
-- Stores invitations and access permissions for shared journeys
CREATE TABLE IF NOT EXISTS journey_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journey_id UUID REFERENCES patient_journeys(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL, -- Store email for pending invitations
  role TEXT NOT NULL CHECK (role IN ('owner', 'viewer')),
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  invited_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  accepted_at TIMESTAMPTZ,
  invitation_token UUID DEFAULT gen_random_uuid() UNIQUE, -- For invitation links
  token_expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'), -- Invitation expires in 7 days
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'revoked')),
  UNIQUE(journey_id, email) -- One invitation per email per journey
);

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_journey_collaborators_journey_id ON journey_collaborators(journey_id);
CREATE INDEX IF NOT EXISTS idx_journey_collaborators_user_id ON journey_collaborators(user_id);
CREATE INDEX IF NOT EXISTS idx_journey_collaborators_email ON journey_collaborators(email);
CREATE INDEX IF NOT EXISTS idx_journey_collaborators_token ON journey_collaborators(invitation_token);
CREATE INDEX IF NOT EXISTS idx_journey_collaborators_status ON journey_collaborators(status);

-- Journey Access Log Table
-- Tracks all access and actions for HIPAA compliance and security audit
CREATE TABLE IF NOT EXISTS journey_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journey_id UUID REFERENCES patient_journeys(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL, -- 'view', 'invite_sent', 'invite_accepted', 'invite_declined', 'access_revoked', 'note_added', 'facility_added'
  details JSONB, -- Additional context (e.g., {"invited_email": "user@example.com"})
  timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  ip_address TEXT,
  user_agent TEXT
);

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_journey_access_log_journey_id ON journey_access_log(journey_id);
CREATE INDEX IF NOT EXISTS idx_journey_access_log_user_id ON journey_access_log(user_id);
CREATE INDEX IF NOT EXISTS idx_journey_access_log_timestamp ON journey_access_log(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_journey_access_log_action ON journey_access_log(action);

-- Helper Functions

-- Check if user has access to a journey (owner or collaborator)
CREATE OR REPLACE FUNCTION has_journey_access(p_journey_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    -- User is the journey owner
    SELECT 1 FROM patient_journeys
    WHERE id = p_journey_id AND user_id = p_user_id
  ) OR EXISTS (
    -- User is an accepted collaborator
    SELECT 1 FROM journey_collaborators
    WHERE journey_id = p_journey_id
      AND user_id = p_user_id
      AND status = 'accepted'
  );
$$;

-- Check if user is the journey owner
CREATE OR REPLACE FUNCTION is_journey_owner(p_journey_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM patient_journeys
    WHERE id = p_journey_id AND user_id = p_user_id
  );
$$;

-- Get user's role for a journey (owner, viewer, or null)
CREATE OR REPLACE FUNCTION get_journey_role(p_journey_id UUID, p_user_id UUID)
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT
    CASE
      WHEN EXISTS (
        SELECT 1 FROM patient_journeys
        WHERE id = p_journey_id AND user_id = p_user_id
      ) THEN 'owner'
      WHEN EXISTS (
        SELECT 1 FROM journey_collaborators
        WHERE journey_id = p_journey_id
          AND user_id = p_user_id
          AND status = 'accepted'
      ) THEN (
        SELECT role FROM journey_collaborators
        WHERE journey_id = p_journey_id
          AND user_id = p_user_id
          AND status = 'accepted'
        LIMIT 1
      )
      ELSE NULL
    END;
$$;

-- Log journey access (for HIPAA compliance)
CREATE OR REPLACE FUNCTION log_journey_access(
  p_journey_id UUID,
  p_user_id UUID,
  p_action TEXT,
  p_details JSONB DEFAULT NULL,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
AS $$
  INSERT INTO journey_access_log (journey_id, user_id, action, details, ip_address, user_agent)
  VALUES (p_journey_id, p_user_id, p_action, p_details, p_ip_address, p_user_agent)
  RETURNING id;
$$;

-- RLS Policies for journey_collaborators

ALTER TABLE journey_collaborators ENABLE ROW LEVEL SECURITY;

-- Journey owners can view all collaborators for their journeys
CREATE POLICY "Journey owners can view collaborators"
  ON journey_collaborators FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM patient_journeys
      WHERE patient_journeys.id = journey_collaborators.journey_id
      AND patient_journeys.user_id = auth.uid()
    )
  );

-- Journey owners can invite collaborators
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

-- Journey owners can update collaborator invitations (revoke, resend)
CREATE POLICY "Journey owners can update collaborators"
  ON journey_collaborators FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM patient_journeys
      WHERE patient_journeys.id = journey_collaborators.journey_id
      AND patient_journeys.user_id = auth.uid()
    )
  );

-- Journey owners can delete collaborators (revoke access)
CREATE POLICY "Journey owners can delete collaborators"
  ON journey_collaborators FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM patient_journeys
      WHERE patient_journeys.id = journey_collaborators.journey_id
      AND patient_journeys.user_id = auth.uid()
    )
  );

-- Invited users can view their own pending invitations
CREATE POLICY "Users can view their pending invitations"
  ON journey_collaborators FOR SELECT
  USING (
    user_id = auth.uid() OR
    (email = (SELECT email FROM auth.users WHERE id = auth.uid()) AND status = 'pending')
  );

-- Invited users can accept/decline their invitations
CREATE POLICY "Users can accept/decline invitations"
  ON journey_collaborators FOR UPDATE
  USING (
    user_id = auth.uid() OR
    (email = (SELECT email FROM auth.users WHERE id = auth.uid()) AND status = 'pending')
  )
  WITH CHECK (
    user_id = auth.uid() OR
    (email = (SELECT email FROM auth.users WHERE id = auth.uid()))
  );

-- RLS Policies for journey_access_log

ALTER TABLE journey_access_log ENABLE ROW LEVEL SECURITY;

-- Journey owners can view all access logs
CREATE POLICY "Journey owners can view access logs"
  ON journey_access_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM patient_journeys
      WHERE patient_journeys.id = journey_access_log.journey_id
      AND patient_journeys.user_id = auth.uid()
    )
  );

-- System can insert access logs (via security definer function)
CREATE POLICY "System can insert access logs"
  ON journey_access_log FOR INSERT
  WITH CHECK (true);

-- Update RLS policies for patient_journeys to include collaborators

-- Drop existing policies that need modification
DROP POLICY IF EXISTS "Users can view own journeys" ON patient_journeys;
DROP POLICY IF EXISTS "Users can update own journeys" ON patient_journeys;

-- Recreate with collaborator access
CREATE POLICY "Users can view own journeys and shared journeys"
  ON patient_journeys FOR SELECT
  USING (
    auth.uid() = user_id OR
    has_journey_access(id, auth.uid()) OR
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.user_type = 'admin'
    )
  );

CREATE POLICY "Journey owners can update journeys"
  ON patient_journeys FOR UPDATE
  USING (auth.uid() = user_id);

-- Update RLS policies for journey_facilities to include collaborators

DROP POLICY IF EXISTS "Users can view own journey facilities" ON journey_facilities;
DROP POLICY IF EXISTS "Users can add facilities to own journeys" ON journey_facilities;
DROP POLICY IF EXISTS "Users can update facilities in own journeys" ON journey_facilities;
DROP POLICY IF EXISTS "Users can remove facilities from own journeys" ON journey_facilities;

-- Recreate with collaborator access
CREATE POLICY "Users can view journey facilities"
  ON journey_facilities FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM patient_journeys
      WHERE patient_journeys.id = journey_facilities.journey_id
      AND (patient_journeys.user_id = auth.uid() OR has_journey_access(patient_journeys.id, auth.uid()))
    )
  );

CREATE POLICY "Journey owners can add facilities"
  ON journey_facilities FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM patient_journeys
      WHERE patient_journeys.id = journey_facilities.journey_id
      AND patient_journeys.user_id = auth.uid()
    )
  );

CREATE POLICY "Journey owners can update facilities"
  ON journey_facilities FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM patient_journeys
      WHERE patient_journeys.id = journey_facilities.journey_id
      AND patient_journeys.user_id = auth.uid()
    )
  );

CREATE POLICY "Journey owners can remove facilities"
  ON journey_facilities FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM patient_journeys
      WHERE patient_journeys.id = journey_facilities.journey_id
      AND patient_journeys.user_id = auth.uid()
    )
  );

-- Update RLS policies for journey_notes to include collaborators

DROP POLICY IF EXISTS "Users can view own journey notes" ON journey_notes;
DROP POLICY IF EXISTS "Users can create notes in own journeys" ON journey_notes;
DROP POLICY IF EXISTS "Users can update notes in own journeys" ON journey_notes;
DROP POLICY IF EXISTS "Users can delete notes in own journeys" ON journey_notes;

-- Recreate with collaborator access (viewers can see notes but not edit)
CREATE POLICY "Users can view journey notes"
  ON journey_notes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM patient_journeys
      WHERE patient_journeys.id = journey_notes.journey_id
      AND (patient_journeys.user_id = auth.uid() OR has_journey_access(patient_journeys.id, auth.uid()))
    )
  );

CREATE POLICY "Journey owners can create notes"
  ON journey_notes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM patient_journeys
      WHERE patient_journeys.id = journey_notes.journey_id
      AND patient_journeys.user_id = auth.uid()
    )
  );

CREATE POLICY "Journey owners can update notes"
  ON journey_notes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM patient_journeys
      WHERE patient_journeys.id = journey_notes.journey_id
      AND patient_journeys.user_id = auth.uid()
    )
  );

CREATE POLICY "Journey owners can delete notes"
  ON journey_notes FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM patient_journeys
      WHERE patient_journeys.id = journey_notes.journey_id
      AND patient_journeys.user_id = auth.uid()
    )
  );

-- Grant access to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON journey_collaborators TO authenticated;
GRANT SELECT, INSERT ON journey_access_log TO authenticated;
GRANT EXECUTE ON FUNCTION has_journey_access(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_journey_owner(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_journey_role(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION log_journey_access(UUID, UUID, TEXT, JSONB, TEXT, TEXT) TO authenticated;

-- Table comments for documentation
COMMENT ON TABLE journey_collaborators IS 'Stores journey sharing invitations and access permissions (Owner/Viewer roles)';
COMMENT ON TABLE journey_access_log IS 'HIPAA-compliant audit log of all journey access and actions';
COMMENT ON FUNCTION has_journey_access(UUID, UUID) IS 'Returns true if user is journey owner or accepted collaborator';
COMMENT ON FUNCTION is_journey_owner(UUID, UUID) IS 'Returns true if user is the journey owner';
COMMENT ON FUNCTION get_journey_role(UUID, UUID) IS 'Returns user role for journey: owner, viewer, or null';
COMMENT ON FUNCTION log_journey_access(UUID, UUID, TEXT, JSONB, TEXT, TEXT) IS 'Logs journey access for HIPAA compliance audit trail';
