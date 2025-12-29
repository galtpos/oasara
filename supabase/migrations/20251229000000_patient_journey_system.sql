-- Patient Journey Management System Migration
-- Enables patients to research, compare, and manage their medical tourism journey

-- Patient Journeys Table (Core)
-- Stores the main journey data including procedure type, budget, timeline, and wizard responses
CREATE TABLE IF NOT EXISTS patient_journeys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  procedure_type TEXT NOT NULL,
  budget_min INTEGER,
  budget_max INTEGER,
  timeline TEXT CHECK (timeline IN ('urgent', 'soon', 'flexible')),
  priority_factors JSONB, -- { "price": 5, "reputation": 4, "wait_time": 3 }
  concerns TEXT[], -- ["language", "recovery", "travel"]
  wizard_responses JSONB, -- Full wizard Q&A for reference
  status TEXT DEFAULT 'researching' CHECK (status IN ('researching', 'comparing', 'decided', 'booked', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_patient_journeys_user_id ON patient_journeys(user_id);
CREATE INDEX IF NOT EXISTS idx_patient_journeys_procedure_type ON patient_journeys(procedure_type);
CREATE INDEX IF NOT EXISTS idx_patient_journeys_status ON patient_journeys(status);
CREATE INDEX IF NOT EXISTS idx_patient_journeys_created_at ON patient_journeys(created_at DESC);

-- Journey Facilities (Shortlist)
-- Tracks which facilities a patient has added to their comparison shortlist
CREATE TABLE IF NOT EXISTS journey_facilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journey_id UUID REFERENCES patient_journeys(id) ON DELETE CASCADE,
  facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
  notes TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(journey_id, facility_id)
);

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_journey_facilities_journey_id ON journey_facilities(journey_id);
CREATE INDEX IF NOT EXISTS idx_journey_facilities_facility_id ON journey_facilities(facility_id);
CREATE INDEX IF NOT EXISTS idx_journey_facilities_added_at ON journey_facilities(added_at DESC);

-- Journey Notes (Personal Research)
-- Stores patient's personal notes, questions, and research findings
CREATE TABLE IF NOT EXISTS journey_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journey_id UUID REFERENCES patient_journeys(id) ON DELETE CASCADE,
  note_type TEXT DEFAULT 'general' CHECK (note_type IN ('general', 'question', 'research', 'concern', 'todo')),
  content TEXT NOT NULL,
  related_facility_id UUID REFERENCES facilities(id) ON DELETE SET NULL,
  completed BOOLEAN DEFAULT FALSE, -- For todo items
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_journey_notes_journey_id ON journey_notes(journey_id);
CREATE INDEX IF NOT EXISTS idx_journey_notes_note_type ON journey_notes(note_type);
CREATE INDEX IF NOT EXISTS idx_journey_notes_created_at ON journey_notes(created_at DESC);

-- Helper Functions

-- Get active journey for a user (most recent)
CREATE OR REPLACE FUNCTION get_active_journey(p_user_id UUID)
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT id
  FROM patient_journeys
  WHERE user_id = p_user_id
  AND status IN ('researching', 'comparing', 'decided')
  ORDER BY created_at DESC
  LIMIT 1;
$$;

-- Count facilities in shortlist
CREATE OR REPLACE FUNCTION get_shortlist_count(p_journey_id UUID)
RETURNS INT
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COUNT(*)::INT
  FROM journey_facilities
  WHERE journey_id = p_journey_id;
$$;

-- Get journey completion percentage (0-100)
CREATE OR REPLACE FUNCTION get_journey_progress(p_journey_id UUID)
RETURNS INT
LANGUAGE sql
SECURITY DEFINER
AS $$
  WITH progress_data AS (
    SELECT
      CASE WHEN procedure_type IS NOT NULL THEN 20 ELSE 0 END +
      CASE WHEN budget_min IS NOT NULL THEN 20 ELSE 0 END +
      CASE WHEN (SELECT COUNT(*) FROM journey_facilities WHERE journey_id = p_journey_id) >= 3 THEN 30 ELSE 0 END +
      CASE WHEN (SELECT COUNT(*) FROM journey_notes WHERE journey_id = p_journey_id) >= 5 THEN 15 ELSE 0 END +
      CASE WHEN status = 'decided' OR status = 'booked' THEN 15 ELSE 0 END AS progress
    FROM patient_journeys
    WHERE id = p_journey_id
  )
  SELECT progress::INT FROM progress_data;
$$;

-- RLS Policies

-- Patient Journeys: Users can only access their own journeys
ALTER TABLE patient_journeys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own journeys"
  ON patient_journeys FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own journeys"
  ON patient_journeys FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own journeys"
  ON patient_journeys FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own journeys"
  ON patient_journeys FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all journeys"
  ON patient_journeys FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.user_type = 'admin'
    )
  );

-- Journey Facilities: Users can only access facilities in their own journeys
ALTER TABLE journey_facilities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own journey facilities"
  ON journey_facilities FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM patient_journeys
      WHERE patient_journeys.id = journey_facilities.journey_id
      AND patient_journeys.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add facilities to own journeys"
  ON journey_facilities FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM patient_journeys
      WHERE patient_journeys.id = journey_facilities.journey_id
      AND patient_journeys.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update facilities in own journeys"
  ON journey_facilities FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM patient_journeys
      WHERE patient_journeys.id = journey_facilities.journey_id
      AND patient_journeys.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can remove facilities from own journeys"
  ON journey_facilities FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM patient_journeys
      WHERE patient_journeys.id = journey_facilities.journey_id
      AND patient_journeys.user_id = auth.uid()
    )
  );

-- Journey Notes: Users can only access notes in their own journeys
ALTER TABLE journey_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own journey notes"
  ON journey_notes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM patient_journeys
      WHERE patient_journeys.id = journey_notes.journey_id
      AND patient_journeys.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create notes in own journeys"
  ON journey_notes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM patient_journeys
      WHERE patient_journeys.id = journey_notes.journey_id
      AND patient_journeys.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update notes in own journeys"
  ON journey_notes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM patient_journeys
      WHERE patient_journeys.id = journey_notes.journey_id
      AND patient_journeys.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete notes in own journeys"
  ON journey_notes FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM patient_journeys
      WHERE patient_journeys.id = journey_notes.journey_id
      AND patient_journeys.user_id = auth.uid()
    )
  );

-- Grant access to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON patient_journeys TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON journey_facilities TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON journey_notes TO authenticated;
GRANT EXECUTE ON FUNCTION get_active_journey(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_shortlist_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_journey_progress(UUID) TO authenticated;

-- Add updated_at triggers
CREATE OR REPLACE FUNCTION update_patient_journey_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_patient_journeys_timestamp
  BEFORE UPDATE ON patient_journeys
  FOR EACH ROW
  EXECUTE FUNCTION update_patient_journey_updated_at();

CREATE TRIGGER update_journey_notes_timestamp
  BEFORE UPDATE ON journey_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_patient_journey_updated_at();

-- Table comments for documentation
COMMENT ON TABLE patient_journeys IS 'Core patient journey data including procedure type, budget, timeline, and wizard responses';
COMMENT ON TABLE journey_facilities IS 'Patient shortlist of facilities for comparison';
COMMENT ON TABLE journey_notes IS 'Personal notes, questions, and research findings for each journey';
COMMENT ON FUNCTION get_active_journey(UUID) IS 'Returns the most recent active journey ID for a user';
COMMENT ON FUNCTION get_shortlist_count(UUID) IS 'Returns the number of facilities in a journey shortlist';
COMMENT ON FUNCTION get_journey_progress(UUID) IS 'Calculates journey completion percentage (0-100)';
