-- OASARA Database Schema Updates for Deep Data Enrichment
-- Run this after the base schema.sql to add tables for doctors, pricing, packages, and testimonials

-- Doctors table - stores doctor profiles scraped from facility websites
CREATE TABLE IF NOT EXISTS doctors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  title TEXT,
  specialty TEXT,
  qualifications TEXT,
  languages TEXT[],
  years_experience INTEGER,
  procedures_performed INTEGER,
  image_url TEXT,
  bio TEXT,
  email TEXT,
  phone TEXT,
  profile_url TEXT,
  source TEXT DEFAULT 'web-scraping',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Procedure pricing table - stores actual pricing data from websites
CREATE TABLE IF NOT EXISTS procedure_pricing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
  procedure_name TEXT NOT NULL,
  price DECIMAL(10, 2),
  currency TEXT DEFAULT 'USD',
  price_type TEXT DEFAULT 'starting_from',
  price_min DECIMAL(10, 2),
  price_max DECIMAL(10, 2),
  description TEXT,
  last_verified TIMESTAMP WITH TIME ZONE,
  source TEXT DEFAULT 'web-scraping',
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Facility packages table - stores all-inclusive package deals
CREATE TABLE IF NOT EXISTS facility_packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
  package_name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2),
  currency TEXT DEFAULT 'USD',
  included_services TEXT,
  duration_days INTEGER,
  valid_until DATE,
  source TEXT DEFAULT 'web-scraping',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Testimonials table - stores patient reviews and success stories
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
  patient_name TEXT,
  procedure TEXT,
  rating DECIMAL(3, 2),
  review_text TEXT,
  review_date DATE,
  verified BOOLEAN DEFAULT false,
  source TEXT DEFAULT 'website',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Success metrics table - stores facility statistics and achievements
CREATE TABLE IF NOT EXISTS success_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL, -- e.g., 'successful_surgeries', 'patients_treated', 'years_experience', 'success_rate'
  metric_value TEXT NOT NULL, -- Store as text to handle various formats (numbers, percentages, etc.)
  description TEXT,
  source_url TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(facility_id, metric_type)
);

-- AI extracted data table - stores structured data extracted via AI (GPT-4 Vision, Claude, etc.)
CREATE TABLE IF NOT EXISTS ai_extracted_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
  extraction_method TEXT, -- 'gpt-4-vision', 'claude-vision', 'manual', etc.
  extracted_data JSONB, -- Flexible JSON structure for various extraction results
  extraction_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  screenshot_url TEXT,
  confidence_score DECIMAL(3, 2), -- 0.00 to 1.00
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add enrichment status columns to facilities table
ALTER TABLE facilities
  ADD COLUMN IF NOT EXISTS data_enriched BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS enriched_date TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS enrichment_status TEXT,
  ADD COLUMN IF NOT EXISTS enrichment_last_attempt TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS doctors_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS pricing_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS packages_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS testimonials_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS has_verified_pricing BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS actual_pricing JSONB,
  ADD COLUMN IF NOT EXISTS ai_extracted_data JSONB,
  ADD COLUMN IF NOT EXISTS extraction_method TEXT,
  ADD COLUMN IF NOT EXISTS extraction_date TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS success_metrics JSONB;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_doctors_facility ON doctors(facility_id);
CREATE INDEX IF NOT EXISTS idx_doctors_specialty ON doctors(specialty);
CREATE INDEX IF NOT EXISTS idx_pricing_facility ON procedure_pricing(facility_id);
CREATE INDEX IF NOT EXISTS idx_pricing_procedure ON procedure_pricing(procedure_name);
CREATE INDEX IF NOT EXISTS idx_packages_facility ON facility_packages(facility_id);
CREATE INDEX IF NOT EXISTS idx_testimonials_facility ON testimonials(facility_id);
CREATE INDEX IF NOT EXISTS idx_testimonials_rating ON testimonials(rating);
CREATE INDEX IF NOT EXISTS idx_metrics_facility ON success_metrics(facility_id);
CREATE INDEX IF NOT EXISTS idx_ai_data_facility ON ai_extracted_data(facility_id);
CREATE INDEX IF NOT EXISTS idx_facilities_enriched ON facilities(data_enriched) WHERE data_enriched = true;

-- Enable Row Level Security on new tables
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE procedure_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE facility_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE success_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_extracted_data ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Public doctors are viewable by everyone"
ON doctors FOR SELECT
USING (true);

CREATE POLICY "Public pricing is viewable by everyone"
ON procedure_pricing FOR SELECT
USING (true);

CREATE POLICY "Public packages are viewable by everyone"
ON facility_packages FOR SELECT
USING (true);

CREATE POLICY "Public testimonials are viewable by everyone"
ON testimonials FOR SELECT
USING (true);

CREATE POLICY "Public metrics are viewable by everyone"
ON success_metrics FOR SELECT
USING (true);

CREATE POLICY "Public AI data is viewable by everyone"
ON ai_extracted_data FOR SELECT
USING (true);

-- Create updated_at trigger for new tables
CREATE TRIGGER update_doctors_updated_at
BEFORE UPDATE ON doctors
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pricing_updated_at
BEFORE UPDATE ON procedure_pricing
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_packages_updated_at
BEFORE UPDATE ON facility_packages
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_metrics_updated_at
BEFORE UPDATE ON success_metrics
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

