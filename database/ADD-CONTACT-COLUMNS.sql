-- Add website and contact information columns to facilities table
-- Run this in Supabase SQL Editor

-- Add website column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_name = 'facilities' AND column_name = 'website'
  ) THEN
    ALTER TABLE facilities ADD COLUMN website TEXT;
  END IF;
END $$;

-- Add phone column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_name = 'facilities' AND column_name = 'phone'
  ) THEN
    ALTER TABLE facilities ADD COLUMN phone TEXT;
  END IF;
END $$;

-- Add google_maps_url column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_name = 'facilities' AND column_name = 'google_maps_url'
  ) THEN
    ALTER TABLE facilities ADD COLUMN google_maps_url TEXT;
  END IF;
END $$;

-- Add google_place_id column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_name = 'facilities' AND column_name = 'google_place_id'
  ) THEN
    ALTER TABLE facilities ADD COLUMN google_place_id TEXT;
  END IF;
END $$;

-- Add contact_verified column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_name = 'facilities' AND column_name = 'contact_verified'
  ) THEN
    ALTER TABLE facilities ADD COLUMN contact_verified BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Add contact_email column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_name = 'facilities' AND column_name = 'contact_email_primary'
  ) THEN
    ALTER TABLE facilities ADD COLUMN contact_email_primary TEXT;
  END IF;
END $$;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_facilities_website ON facilities(website) WHERE website IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_facilities_phone ON facilities(phone) WHERE phone IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_facilities_place_id ON facilities(google_place_id) WHERE google_place_id IS NOT NULL;

-- Show current state
SELECT
  COUNT(*) as total_facilities,
  COUNT(website) as with_website,
  COUNT(phone) as with_phone,
  COUNT(CASE WHEN website IS NOT NULL AND phone IS NOT NULL THEN 1 END) as with_both
FROM facilities;
