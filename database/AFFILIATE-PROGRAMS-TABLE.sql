-- OASARA Affiliate Programs Management Table
-- Run this against your Supabase database

-- Affiliate Programs table
CREATE TABLE IF NOT EXISTS affiliate_programs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Service Information
  service_name TEXT NOT NULL,
  service_slug TEXT UNIQUE NOT NULL,
  website_url TEXT NOT NULL,
  logo_url TEXT,
  description TEXT,

  -- Pricing Information
  price_display TEXT,  -- e.g., "$399", "$39.99/mo"
  price_type TEXT CHECK (price_type IN ('one_time', 'subscription', 'per_document', 'free')),

  -- Service Details
  category TEXT DEFAULT 'legal_services' CHECK (category IN ('legal_services', 'trust_services', 'estate_planning', 'other')),
  features JSONB DEFAULT '[]',  -- Array of feature strings
  pros JSONB DEFAULT '[]',
  cons JSONB DEFAULT '[]',
  rating DECIMAL(2,1) CHECK (rating >= 0 AND rating <= 5),

  -- Affiliate Program Details
  has_affiliate_program BOOLEAN DEFAULT false,
  affiliate_network TEXT,  -- e.g., 'CJ Affiliate', 'Impact', 'Awin', 'Direct'
  commission_rate TEXT,    -- e.g., '15%', '$50 per sale', '30% recurring'
  cookie_duration TEXT,    -- e.g., '30 days', '120 days'
  affiliate_signup_url TEXT,
  affiliate_id TEXT,       -- Your affiliate ID once signed up
  affiliate_link TEXT,     -- Your tracked affiliate link

  -- Status & Tracking
  is_active BOOLEAN DEFAULT true,
  signup_status TEXT DEFAULT 'not_started' CHECK (signup_status IN ('not_started', 'pending', 'approved', 'rejected')),
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  total_commission DECIMAL(10,2) DEFAULT 0,

  -- Notes
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE affiliate_programs ENABLE ROW LEVEL SECURITY;

-- Policies for affiliate_programs
-- Anyone can read active affiliate programs (for display on site)
CREATE POLICY "Anyone can read active affiliates" ON affiliate_programs
  FOR SELECT USING (is_active = true);

-- Admins can do everything
CREATE POLICY "Admins can manage affiliates" ON affiliate_programs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.user_type = 'admin'
    )
  );

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_affiliate_programs_slug ON affiliate_programs(service_slug);
CREATE INDEX IF NOT EXISTS idx_affiliate_programs_category ON affiliate_programs(category);
CREATE INDEX IF NOT EXISTS idx_affiliate_programs_active ON affiliate_programs(is_active);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_affiliate_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-updating updated_at
DROP TRIGGER IF EXISTS trigger_affiliate_updated_at ON affiliate_programs;
CREATE TRIGGER trigger_affiliate_updated_at
  BEFORE UPDATE ON affiliate_programs
  FOR EACH ROW
  EXECUTE FUNCTION update_affiliate_updated_at();

-- Function to increment click count
CREATE OR REPLACE FUNCTION increment_affiliate_click(program_slug TEXT)
RETURNS void AS $$
BEGIN
  UPDATE affiliate_programs
  SET clicks = clicks + 1
  WHERE service_slug = program_slug;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert initial data for the legal services
INSERT INTO affiliate_programs (
  service_name, service_slug, website_url, description, price_display, price_type,
  category, features, pros, cons, rating,
  has_affiliate_program, affiliate_network, commission_rate, cookie_duration, affiliate_signup_url
) VALUES
(
  'LegalZoom',
  'legalzoom',
  'https://www.legalzoom.com',
  'Industry leader with comprehensive legal document services and optional attorney assistance.',
  '$399',
  'one_time',
  'legal_services',
  '["Living Trust documents", "Pour-over will included", "Transfer deed preparation", "Attorney review available", "30-day money-back guarantee"]',
  '["Most recognized brand", "Comprehensive packages", "Attorney support available", "Strong customer service"]',
  '["Higher prices than competitors", "Add-ons can increase cost", "Processing can take time"]',
  4.3,
  true,
  'CJ Affiliate',
  '15%',
  '30 days',
  'https://www.cj.com/advertiser/legalzoom'
),
(
  'Rocket Lawyer',
  'rocket-lawyer',
  'https://www.rocketlawyer.com',
  'Subscription-based service with unlimited document access and attorney consultations.',
  '$39.99/mo',
  'subscription',
  'legal_services',
  '["Unlimited legal documents", "Attorney Q&A included", "Document defense included", "Free trial available", "Cancel anytime"]',
  '["Unlimited documents for subscribers", "Attorney access included", "Very flexible", "Good for multiple legal needs"]',
  '["Subscription model not for everyone", "Must cancel to avoid charges", "Less specialized for trusts"]',
  4.2,
  true,
  'Direct',
  '30%',
  '30 days',
  'https://www.rocketlawyer.com/affiliates'
),
(
  'Trust & Will',
  'trust-and-will',
  'https://trustandwill.com',
  'Modern, user-friendly platform specifically designed for estate planning.',
  '$599',
  'one_time',
  'trust_services',
  '["Trust-based estate plan", "Unlimited updates for 1 year", "Guardian designation", "HIPAA authorization", "State-specific documents"]',
  '["Modern, intuitive interface", "Estate planning focused", "Excellent user experience", "Free updates for one year"]',
  '["Higher starting price", "Limited attorney integration", "Newer company"]',
  4.7,
  true,
  'Impact',
  '10%',
  '30 days',
  'https://trustandwill.com/partners'
),
(
  'Nolo WillMaker',
  'nolo-willmaker',
  'https://www.nolo.com/products/willmaker',
  'Software-based solution from trusted legal publisher with comprehensive guides.',
  '$149',
  'one_time',
  'legal_services',
  '["Desktop software", "Living trust included", "Extensive legal guidance", "One-time purchase", "No internet required"]',
  '["One-time purchase", "Very affordable", "Extensive legal education", "Works offline"]',
  '["Software interface dated", "No attorney support", "Manual updates required"]',
  4.0,
  true,
  'Awin/CJ',
  '15-35% tiered',
  '120 days',
  'https://www.awin.com/us/publisher-terms'
),
(
  'Gentreo',
  'gentreo',
  'https://www.gentreo.com',
  'Digital vault service with estate planning documents and secure storage.',
  '$150 first year',
  'subscription',
  'estate_planning',
  '["Digital vault storage", "Living will included", "Power of attorney", "Easy updates", "Family sharing"]',
  '["Digital storage included", "Easy to update documents", "Family sharing features", "Good for ongoing management"]',
  '["Annual fee required", "Less comprehensive", "Smaller company"]',
  4.4,
  true,
  'Direct',
  'Contact for rates',
  'Unknown',
  'https://www.gentreo.com/affiliate-program'
),
(
  'TotalLegal',
  'totallegal',
  'https://www.totallegal.com',
  'Budget-friendly option for basic legal documents.',
  '$19.95/doc',
  'per_document',
  'legal_services',
  '["Pay per document", "Basic living trust", "Simple interface", "No subscription", "Quick completion"]',
  '["Very affordable per document", "No commitment", "Good for simple needs"]',
  '["Basic documents only", "Limited guidance", "No attorney support", "Less comprehensive"]',
  3.8,
  false,
  NULL,
  NULL,
  NULL,
  NULL
),
(
  'FreeWill',
  'freewill',
  'https://www.freewill.com',
  'Free basic documents, funded by nonprofit partnerships. Great for simple needs.',
  'Free',
  'free',
  'estate_planning',
  '["Free basic will", "Advance directive", "Power of attorney", "Nonprofit supported", "Quick and easy"]',
  '["Completely free for basic documents", "Simple and fast", "Good for straightforward situations"]',
  '["Limited to basic documents", "No trust creation", "Nonprofit referral focus", "May not suit complex needs"]',
  4.6,
  false,
  NULL,
  NULL,
  NULL,
  NULL
)
ON CONFLICT (service_slug) DO NOTHING;
