-- Add CASCADE DELETE to journey-related tables
-- This ensures when a journey is deleted, all related data is automatically removed

-- First drop existing foreign key constraints if they exist
ALTER TABLE journey_facilities
DROP CONSTRAINT IF EXISTS journey_facilities_journey_id_fkey;

ALTER TABLE journey_notes
DROP CONSTRAINT IF EXISTS journey_notes_journey_id_fkey;

ALTER TABLE journey_collaborators
DROP CONSTRAINT IF EXISTS journey_collaborators_journey_id_fkey;

-- Re-add with CASCADE
ALTER TABLE journey_facilities
ADD CONSTRAINT journey_facilities_journey_id_fkey
FOREIGN KEY (journey_id) REFERENCES patient_journeys(id) ON DELETE CASCADE;

ALTER TABLE journey_notes
ADD CONSTRAINT journey_notes_journey_id_fkey
FOREIGN KEY (journey_id) REFERENCES patient_journeys(id) ON DELETE CASCADE;

ALTER TABLE journey_collaborators
ADD CONSTRAINT journey_collaborators_journey_id_fkey
FOREIGN KEY (journey_id) REFERENCES patient_journeys(id) ON DELETE CASCADE;
