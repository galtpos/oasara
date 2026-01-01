-- Fix timeline constraint to include 'planning' instead of 'soon'
-- The onboarding chatbot uses: 'urgent', 'flexible', 'planning'

-- Drop the old constraint
ALTER TABLE patient_journeys DROP CONSTRAINT IF EXISTS patient_journeys_timeline_check;

-- Add new constraint with correct values
ALTER TABLE patient_journeys ADD CONSTRAINT patient_journeys_timeline_check
  CHECK (timeline IN ('urgent', 'soon', 'flexible', 'planning'));

-- Update any existing 'soon' to 'flexible' for consistency
UPDATE patient_journeys SET timeline = 'flexible' WHERE timeline = 'soon';
