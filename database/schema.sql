-- OASARA Medical Marketplace Database Schema
-- Supabase PostgreSQL Database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Facilities table - stores all JCI-certified medical facilities
CREATE TABLE facilities (
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

-- Zano requests tracking - tracks when users request Zano payment option
CREATE TABLE zano_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  user_email TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'accepted', 'declined'))
);

-- Enable Row Level Security
ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE zano_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access to facilities
CREATE POLICY "Public facilities are viewable by everyone"
ON facilities FOR SELECT
USING (true);

-- Create policies for zano_requests (public can insert, only authenticated can view)
CREATE POLICY "Anyone can request Zano payment"
ON zano_requests FOR INSERT
WITH CHECK (true);

-- Create indexes for better query performance
CREATE INDEX idx_facilities_country ON facilities(country);
CREATE INDEX idx_facilities_rating ON facilities(google_rating DESC);
CREATE INDEX idx_facilities_accepts_zano ON facilities(accepts_zano) WHERE accepts_zano = true;
CREATE INDEX idx_facilities_specialties ON facilities USING GIN(specialties);
CREATE INDEX idx_zano_requests_facility ON zano_requests(facility_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger to facilities table
CREATE TRIGGER update_facilities_updated_at
BEFORE UPDATE ON facilities
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Sample popular_procedures JSONB structure:
-- [
--   {
--     "name": "Cardiac Bypass (CABG)",
--     "price_range": "$3,500 - $8,000",
--     "wait_time": "1-2 weeks"
--   }
-- ]
