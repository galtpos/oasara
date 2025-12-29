-- Row Level Security (RLS) Policies for Patient Journeys
-- Implements Thomas Ptacek's recommendation: Server-side validation

-- Enable RLS on patient_journeys table
ALTER TABLE patient_journeys ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read their own journeys
CREATE POLICY "Users can view own journeys"
  ON patient_journeys
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own journeys with validation
CREATE POLICY "Users can create own journeys with validation"
  ON patient_journeys
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND budget_min >= 0
    AND budget_max >= 0
    AND budget_min <= budget_max
    AND budget_max <= 1000000
    AND LENGTH(procedure_type) >= 3
    AND status IN ('researching', 'comparing', 'decided', 'booked', 'completed')
  );

-- Policy: Users can update their own journeys with validation
CREATE POLICY "Users can update own journeys with validation"
  ON patient_journeys
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND budget_min >= 0
    AND budget_max >= 0
    AND budget_min <= budget_max
    AND budget_max <= 1000000
    AND LENGTH(procedure_type) >= 3
    AND status IN ('researching', 'comparing', 'decided', 'booked', 'completed')
  );

-- Policy: Users can delete their own journeys
CREATE POLICY "Users can delete own journeys"
  ON patient_journeys
  FOR DELETE
  USING (auth.uid() = user_id);

-- Enable RLS on journey_shortlists table (if exists)
ALTER TABLE journey_shortlists ENABLE ROW LEVEL SECURITY;

-- Policy: Users can manage their own shortlists
CREATE POLICY "Users can manage own shortlists"
  ON journey_shortlists
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM patient_journeys
      WHERE patient_journeys.id = journey_shortlists.journey_id
      AND patient_journeys.user_id = auth.uid()
    )
  );

-- Enable RLS on journey_notes table (if exists)
ALTER TABLE journey_notes ENABLE ROW LEVEL SECURITY;

-- Policy: Users can manage their own notes
CREATE POLICY "Users can manage own notes"
  ON journey_notes
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM patient_journeys
      WHERE patient_journeys.id = journey_notes.journey_id
      AND patient_journeys.user_id = auth.uid()
    )
  );

-- Add check constraints for extra validation layer
ALTER TABLE patient_journeys
  ADD CONSTRAINT budget_min_positive CHECK (budget_min >= 0),
  ADD CONSTRAINT budget_max_positive CHECK (budget_max >= 0),
  ADD CONSTRAINT budget_min_less_than_max CHECK (budget_min <= budget_max),
  ADD CONSTRAINT budget_max_reasonable CHECK (budget_max <= 1000000),
  ADD CONSTRAINT procedure_type_length CHECK (LENGTH(procedure_type) >= 3);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_patient_journeys_user_id ON patient_journeys(user_id);
CREATE INDEX IF NOT EXISTS idx_patient_journeys_status ON patient_journeys(status);
