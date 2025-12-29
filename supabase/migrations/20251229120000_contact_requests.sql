-- Contact Requests Table
-- Stores facility contact requests from patients in their journey
CREATE TABLE IF NOT EXISTS contact_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journey_id UUID REFERENCES patient_journeys(id) ON DELETE CASCADE,
  facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  user_phone TEXT,
  message TEXT,
  procedure_type TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'responded', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_contact_requests_journey_id ON contact_requests(journey_id);
CREATE INDEX IF NOT EXISTS idx_contact_requests_facility_id ON contact_requests(facility_id);
CREATE INDEX IF NOT EXISTS idx_contact_requests_user_email ON contact_requests(user_email);
CREATE INDEX IF NOT EXISTS idx_contact_requests_status ON contact_requests(status);
CREATE INDEX IF NOT EXISTS idx_contact_requests_created_at ON contact_requests(created_at DESC);

-- RLS Policies
ALTER TABLE contact_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own contact requests
CREATE POLICY "Users can view own contact requests"
  ON contact_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM patient_journeys
      WHERE patient_journeys.id = contact_requests.journey_id
      AND patient_journeys.user_id = auth.uid()
    )
  );

-- Users can create contact requests for their own journeys
CREATE POLICY "Users can create contact requests in own journeys"
  ON contact_requests FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM patient_journeys
      WHERE patient_journeys.id = contact_requests.journey_id
      AND patient_journeys.user_id = auth.uid()
    )
  );

-- Users can update their own contact requests
CREATE POLICY "Users can update own contact requests"
  ON contact_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM patient_journeys
      WHERE patient_journeys.id = contact_requests.journey_id
      AND patient_journeys.user_id = auth.uid()
    )
  );

-- Admins can view all contact requests
CREATE POLICY "Admins can view all contact requests"
  ON contact_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.user_type = 'admin'
    )
  );

-- Admins can update contact request status
CREATE POLICY "Admins can update contact requests"
  ON contact_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.user_type = 'admin'
    )
  );

-- Grant access to authenticated users
GRANT SELECT, INSERT, UPDATE ON contact_requests TO authenticated;

-- Add updated_at trigger
CREATE TRIGGER update_contact_requests_timestamp
  BEFORE UPDATE ON contact_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_patient_journey_updated_at();

-- Table comment for documentation
COMMENT ON TABLE contact_requests IS 'Patient contact requests to facilities during their journey';
