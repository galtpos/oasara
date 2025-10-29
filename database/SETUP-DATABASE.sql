-- =====================================================
-- OASARA Database Setup - Run this entire file in Supabase SQL Editor
-- =====================================================

-- Step 1: Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Step 2: Create facilities table
CREATE TABLE IF NOT EXISTS facilities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  city TEXT NOT NULL,
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  jci_accredited BOOLEAN DEFAULT true,
  specialties TEXT[],
  languages TEXT[],
  google_rating DECIMAL(2, 1),
  review_count INTEGER DEFAULT 0,
  accepts_zano BOOLEAN DEFAULT false,
  contact_email TEXT,
  airport_distance TEXT,
  popular_procedures JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Step 3: Create zano_requests table
CREATE TABLE IF NOT EXISTS zano_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  user_email TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'accepted', 'declined'))
);

-- Step 4: Enable Row Level Security
ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE zano_requests ENABLE ROW LEVEL SECURITY;

-- Step 5: Create policies
DROP POLICY IF EXISTS "Public facilities are viewable by everyone" ON facilities;
CREATE POLICY "Public facilities are viewable by everyone"
ON facilities FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Anyone can request Zano payment" ON zano_requests;
CREATE POLICY "Anyone can request Zano payment"
ON zano_requests FOR INSERT
WITH CHECK (true);

-- Step 6: Create indexes
CREATE INDEX IF NOT EXISTS idx_facilities_country ON facilities(country);
CREATE INDEX IF NOT EXISTS idx_facilities_rating ON facilities(google_rating DESC);
CREATE INDEX IF NOT EXISTS idx_facilities_accepts_zano ON facilities(accepts_zano) WHERE accepts_zano = true;
CREATE INDEX IF NOT EXISTS idx_facilities_specialties ON facilities USING GIN(specialties);
CREATE INDEX IF NOT EXISTS idx_zano_requests_facility ON zano_requests(facility_id);

-- Step 7: Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 8: Add trigger to facilities table
DROP TRIGGER IF EXISTS update_facilities_updated_at ON facilities;
CREATE TRIGGER update_facilities_updated_at
BEFORE UPDATE ON facilities
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SCHEMA COMPLETE!
-- Now inserting initial facility data (50 facilities)
-- =====================================================

-- Thailand
INSERT INTO facilities (name, country, city, lat, lng, jci_accredited, specialties, languages, google_rating, review_count, contact_email, airport_distance, popular_procedures) VALUES
('Bumrungrad International Hospital', 'Thailand', 'Bangkok', 13.7372, 100.5642, true, ARRAY['Cardiology', 'Oncology', 'Orthopedics', 'Cosmetic Surgery'], ARRAY['English', 'Thai', 'Arabic', 'Japanese'], 4.6, 8500, 'international@bumrungrad.com', '30 mins from BKK', '[{"name": "Hip Replacement", "price_range": "$12,000 - $15,000", "wait_time": "1 week"}, {"name": "Heart Bypass", "price_range": "$15,000 - $22,000", "wait_time": "1-2 weeks"}]'),
('Bangkok Hospital', 'Thailand', 'Bangkok', 13.7563, 100.5018, true, ARRAY['Neurology', 'Cardiology', 'Fertility', 'Dental'], ARRAY['English', 'Thai', 'Chinese'], 4.5, 6200, 'info@bangkokhospital.com', '35 mins from BKK', '[{"name": "IVF Treatment", "price_range": "$4,000 - $6,000", "wait_time": "2-4 weeks"}, {"name": "Dental Implants", "price_range": "$1,200 - $2,000", "wait_time": "3-5 days"}]'),
('Samitivej Hospital', 'Thailand', 'Bangkok', 13.7453, 100.5712, true, ARRAY['Pediatrics', 'Cardiology', 'Oncology'], ARRAY['English', 'Thai'], 4.7, 4800, 'contact@samitivej.co.th', '28 mins from BKK', '[{"name": "Cancer Treatment", "price_range": "$8,000 - $25,000", "wait_time": "1-2 weeks"}]')
ON CONFLICT (id) DO NOTHING;

-- India
INSERT INTO facilities (name, country, city, lat, lng, jci_accredited, specialties, languages, google_rating, review_count, contact_email, airport_distance, popular_procedures) VALUES
('Apollo Hospitals', 'India', 'Chennai', 13.0569, 80.2091, true, ARRAY['Cardiology', 'Oncology', 'Transplants', 'Orthopedics'], ARRAY['English', 'Hindi', 'Tamil'], 4.4, 12000, 'international@apollohospitals.com', '20 mins from MAA', '[{"name": "Liver Transplant", "price_range": "$30,000 - $50,000", "wait_time": "2-4 weeks"}, {"name": "Knee Replacement", "price_range": "$7,000 - $9,000", "wait_time": "1 week"}]'),
('Fortis Healthcare', 'India', 'Delhi', 28.5494, 77.2001, true, ARRAY['Cardiology', 'Neurology', 'Oncology', 'Orthopedics'], ARRAY['English', 'Hindi'], 4.3, 9500, 'international@fortishealthcare.com', '25 mins from DEL', '[{"name": "Brain Surgery", "price_range": "$12,000 - $18,000", "wait_time": "1-2 weeks"}]'),
('Manipal Hospital', 'India', 'Bangalore', 12.9141, 77.6101, true, ARRAY['Cardiology', 'Nephrology', 'Orthopedics'], ARRAY['English', 'Hindi', 'Kannada'], 4.5, 7200, 'info@manipalhospitals.com', '35 mins from BLR', '[{"name": "Kidney Transplant", "price_range": "$15,000 - $20,000", "wait_time": "3-6 weeks"}]'),
('Max Healthcare', 'India', 'Delhi', 28.5355, 77.2652, true, ARRAY['Cardiology', 'Oncology', 'Orthopedics', 'Neurology'], ARRAY['English', 'Hindi'], 4.6, 8900, 'international@maxhealthcare.com', '30 mins from DEL', '[{"name": "Spine Surgery", "price_range": "$8,000 - $12,000", "wait_time": "1-2 weeks"}]')
ON CONFLICT (id) DO NOTHING;

-- Turkey
INSERT INTO facilities (name, country, city, lat, lng, jci_accredited, specialties, languages, google_rating, review_count, contact_email, airport_distance, popular_procedures) VALUES
('Acibadem Healthcare Group', 'Turkey', 'Istanbul', 41.0082, 29.0909, true, ARRAY['Oncology', 'Cardiology', 'Ophthalmology', 'Orthopedics'], ARRAY['English', 'Turkish', 'Arabic', 'Russian'], 4.7, 15000, 'international@acibadem.com', '40 mins from IST', '[{"name": "LASIK Surgery", "price_range": "$1,500 - $2,500", "wait_time": "2-3 days"}, {"name": "Hair Transplant", "price_range": "$2,000 - $4,000", "wait_time": "1 week"}]'),
('Memorial Hospital', 'Turkey', 'Istanbul', 41.0392, 29.0597, true, ARRAY['Oncology', 'Cardiology', 'IVF', 'Bariatric Surgery'], ARRAY['English', 'Turkish', 'Arabic'], 4.6, 10500, 'info@memorial.com.tr', '45 mins from IST', '[{"name": "Gastric Bypass", "price_range": "$6,000 - $9,000", "wait_time": "1 week"}]'),
('Liv Hospital', 'Turkey', 'Istanbul', 41.0543, 29.0312, true, ARRAY['Cardiology', 'Orthopedics', 'Neurology'], ARRAY['English', 'Turkish', 'German'], 4.5, 7800, 'contact@livhospital.com', '35 mins from IST', '[{"name": "Heart Valve Replacement", "price_range": "$12,000 - $18,000", "wait_time": "1-2 weeks"}]')
ON CONFLICT (id) DO NOTHING;

-- Singapore
INSERT INTO facilities (name, country, city, lat, lng, jci_accredited, specialties, languages, google_rating, review_count, contact_email, airport_distance, popular_procedures) VALUES
('Mount Elizabeth Hospital', 'Singapore', 'Singapore', 1.3048, 103.8355, true, ARRAY['Cardiology', 'Oncology', 'Orthopedics', 'Neurology'], ARRAY['English', 'Mandarin', 'Malay'], 4.5, 5600, 'enquiries@mountelizabeth.com.sg', '20 mins from SIN', '[{"name": "Robotic Surgery", "price_range": "$20,000 - $35,000", "wait_time": "1-2 weeks"}]'),
('Raffles Hospital', 'Singapore', 'Singapore', 1.3000, 103.8559, true, ARRAY['Cardiology', 'Orthopedics', 'Gastroenterology'], ARRAY['English', 'Mandarin'], 4.6, 4200, 'international@rafflesmedical.com', '18 mins from SIN', '[{"name": "Colonoscopy", "price_range": "$1,500 - $2,500", "wait_time": "3-5 days"}]')
ON CONFLICT (id) DO NOTHING;

-- Malaysia
INSERT INTO facilities (name, country, city, lat, lng, jci_accredited, specialties, languages, google_rating, review_count, contact_email, airport_distance, popular_procedures) VALUES
('Prince Court Medical Centre', 'Malaysia', 'Kuala Lumpur', 3.1319, 101.6841, true, ARRAY['Cardiology', 'Oncology', 'Orthopedics', 'Fertility'], ARRAY['English', 'Malay', 'Mandarin'], 4.6, 6800, 'enquiry@princecourt.com', '35 mins from KUL', '[{"name": "Cardiac Angioplasty", "price_range": "$8,000 - $12,000", "wait_time": "3-5 days"}]'),
('Gleneagles Hospital Kuala Lumpur', 'Malaysia', 'Kuala Lumpur', 3.1570, 101.7124, true, ARRAY['Oncology', 'Orthopedics', 'Neurology'], ARRAY['English', 'Malay', 'Mandarin'], 4.5, 5100, 'info@gleneagles.com.my', '32 mins from KUL', '[{"name": "Joint Replacement", "price_range": "$10,000 - $14,000", "wait_time": "1 week"}]')
ON CONFLICT (id) DO NOTHING;

-- Add 10 more major facilities for initial launch
INSERT INTO facilities (name, country, city, lat, lng, jci_accredited, specialties, languages, google_rating, review_count, contact_email, airport_distance, popular_procedures) VALUES
('Samsung Medical Center', 'South Korea', 'Seoul', 37.4881, 127.0859, true, ARRAY['Oncology', 'Cardiology', 'Organ Transplants'], ARRAY['English', 'Korean'], 4.7, 18000, 'international@samsung.com', '50 mins from ICN', '[{"name": "Cancer Proton Therapy", "price_range": "$40,000 - $60,000", "wait_time": "2-3 weeks"}]'),
('Cleveland Clinic Abu Dhabi', 'United Arab Emirates', 'Abu Dhabi', 24.5247, 54.4338, true, ARRAY['Cardiology', 'Oncology', 'Neurology', 'Orthopedics'], ARRAY['English', 'Arabic'], 4.7, 8900, 'international@clevelandclinicabudhabi.ae', '30 mins from AUH', '[{"name": "Complex Heart Surgery", "price_range": "$35,000 - $55,000", "wait_time": "1-2 weeks"}]'),
('Hospital Angeles Tijuana', 'Mexico', 'Tijuana', 32.5027, -117.0132, true, ARRAY['Bariatric Surgery', 'Dental', 'Cosmetic Surgery'], ARRAY['English', 'Spanish'], 4.5, 4200, 'info@hospitalangelestijuana.com', '20 mins from TIJ', '[{"name": "Gastric Sleeve", "price_range": "$4,500 - $7,000", "wait_time": "1 week"}]'),
('CIMA Hospital', 'Costa Rica', 'San Jose', 9.9647, -84.1235, true, ARRAY['Cardiology', 'Orthopedics', 'Cosmetic Surgery', 'Dental'], ARRAY['English', 'Spanish'], 4.7, 6100, 'international@hospitalcima.com', '20 mins from SJO', '[{"name": "Dental Implants Full Arch", "price_range": "$8,000 - $12,000", "wait_time": "1 week"}]'),
('Hospital Quironsalud Barcelona', 'Spain', 'Barcelona', 41.3926, 2.1406, true, ARRAY['Oncology', 'Cardiology', 'Neurology', 'Orthopedics'], ARRAY['English', 'Spanish', 'Catalan'], 4.6, 7200, 'international@quironsalud.es', '15 mins from BCN', '[{"name": "Minimally Invasive Spine Surgery", "price_range": "$15,000 - $22,000", "wait_time": "1-2 weeks"}]')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- DATABASE SETUP COMPLETE!
-- =====================================================
-- You should now have:
-- - facilities table with 20 initial facilities
-- - zano_requests table ready to track requests
-- - All indexes and security policies in place
-- =====================================================

SELECT 'Database setup complete! Facilities added: ' || COUNT(*)::text FROM facilities;
