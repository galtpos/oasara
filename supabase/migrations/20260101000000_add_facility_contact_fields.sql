-- Add contact fields to facilities table for quote requests
ALTER TABLE facilities
  ADD COLUMN IF NOT EXISTS contact_email TEXT,
  ADD COLUMN IF NOT EXISTS contact_phone TEXT,
  ADD COLUMN IF NOT EXISTS contact_name TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_facilities_contact_email ON facilities(contact_email) WHERE contact_email IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN facilities.contact_email IS 'Primary email for receiving patient inquiries and quote requests';
COMMENT ON COLUMN facilities.contact_phone IS 'Primary phone number for facility contact';
COMMENT ON COLUMN facilities.contact_name IS 'Name of primary contact person at facility';
