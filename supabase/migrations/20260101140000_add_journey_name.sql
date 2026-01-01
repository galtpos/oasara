-- Add name column to patient_journeys for user-friendly journey identification
ALTER TABLE patient_journeys ADD COLUMN IF NOT EXISTS name TEXT;

-- Set default names for existing journeys based on procedure_type
UPDATE patient_journeys
SET name = COALESCE(
  procedure_type,
  'My Healthcare Journey'
)
WHERE name IS NULL;

COMMENT ON COLUMN patient_journeys.name IS 'User-friendly name for the journey (e.g., "Mom''s Knee Surgery", "Dental Work 2026")';
