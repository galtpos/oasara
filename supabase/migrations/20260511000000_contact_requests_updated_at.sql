-- Restore updated_at column + trigger on contact_requests.
-- Original 20251229120000 migration declared this column + a trigger referencing
-- update_patient_journey_updated_at(), but that function did not exist in this
-- project at apply time, so the column + trigger were never created.
-- Netlify function contact-facility.ts has been silently failing its post-send
-- UPDATE on every call as a result; all rows stayed status='pending'.

ALTER TABLE contact_requests
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE OR REPLACE FUNCTION update_contact_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_contact_requests_timestamp ON contact_requests;

CREATE TRIGGER update_contact_requests_timestamp
  BEFORE UPDATE ON contact_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_contact_requests_updated_at();
