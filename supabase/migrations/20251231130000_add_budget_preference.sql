-- Add budget_preference column for qualitative budget selection
-- Options: save_most, balanced, quality_first, no_preference
ALTER TABLE patient_journeys 
ADD COLUMN IF NOT EXISTS budget_preference text;

-- Make budget columns nullable (they may not have been before)
ALTER TABLE patient_journeys 
ALTER COLUMN budget_min DROP NOT NULL,
ALTER COLUMN budget_max DROP NOT NULL;

COMMENT ON COLUMN patient_journeys.budget_preference IS 'User preference: save_most (cheapest), balanced (value), quality_first (best regardless of cost), no_preference (show all)';
