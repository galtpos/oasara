-- Create reviews table for facility reviews
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  patient_email VARCHAR(255) NOT NULL, -- For verification only, not displayed
  rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  procedure VARCHAR(255) NOT NULL,
  treatment_date DATE NOT NULL,
  review_date TIMESTAMP DEFAULT NOW(),
  title VARCHAR(255) NOT NULL,
  review TEXT NOT NULL CHECK (LENGTH(review) >= 50),
  verified BOOLEAN DEFAULT FALSE,
  helpful_count INTEGER DEFAULT 0,
  response_from_facility TEXT,
  patient_name VARCHAR(255), -- Display name (can be anonymous)
  patient_photo VARCHAR(500), -- Optional photo URL
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for facility lookups
CREATE INDEX IF NOT EXISTS idx_reviews_facility_id ON reviews(facility_id);

-- Create index for verified reviews
CREATE INDEX IF NOT EXISTS idx_reviews_verified ON reviews(verified) WHERE verified = TRUE;

-- Create index for review date
CREATE INDEX IF NOT EXISTS idx_reviews_date ON reviews(review_date DESC);

-- Enable Row Level Security
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read verified reviews
CREATE POLICY "Anyone can view verified reviews"
  ON reviews
  FOR SELECT
  USING (verified = TRUE);

-- Policy: Authenticated users can submit reviews
CREATE POLICY "Authenticated users can submit reviews"
  ON reviews
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Policy: Facilities can respond to their reviews
CREATE POLICY "Facilities can respond to their reviews"
  ON reviews
  FOR UPDATE
  USING (auth.uid()::TEXT = facility_id::TEXT)
  WITH CHECK (auth.uid()::TEXT = facility_id::TEXT);

-- Function to update helpful_count
CREATE OR REPLACE FUNCTION increment_helpful_count(review_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE reviews
  SET helpful_count = helpful_count + 1
  WHERE id = review_id;
END;
$$;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_reviews_updated_at();
