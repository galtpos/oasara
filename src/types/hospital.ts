// US Hospital Transparency Database Types
// Data sourced from OwnNothing.org hospital transparency database

export type CaptureTier = 'TRANSPARENT' | 'OPAQUE' | 'CAPTURED' | 'PREDATORY';

export interface Hospital {
  id: string;
  cms_ccn: string;
  name: string;
  address: string | null;
  city: string;
  state: string;
  zip: string | null;
  county: string | null;
  latitude: number | null;
  longitude: number | null;
  hospital_type: string | null;
  ownership_type: string | null;
  bed_count: number | null;
  emergency_services: boolean;
  website_url: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface HospitalCompliance {
  id: string;
  hospital_id: string;
  mrf_published: boolean;
  mrf_url: string | null;
  mrf_format: string | null;
  mrf_last_updated: string | null;
  mrf_accessible: boolean;
  mrf_complete: boolean;
  consumer_tool_available: boolean;
  consumer_tool_url: string | null;
  shoppable_services_count: number;
  cms_warning_letter: boolean;
  cms_penalty_count: number;
  cms_penalty_total: number;
  overall_compliance_score: number | null;
  last_verified: string | null;
  verified_by: string | null;
  verification_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface HospitalTerms {
  id: string;
  hospital_id: string;
  document_type: string | null;
  document_url: string | null;
  document_date: string | null;
  arbitration_required: boolean | null;
  arbitration_clause_text: string | null;
  class_action_waiver: boolean | null;
  liability_waivers: string[] | null;
  lien_rights_claimed: boolean | null;
  assignment_of_benefits: boolean | null;
  balance_billing_allowed: boolean | null;
  worst_clause: string | null;
  worst_clause_category: string | null;
  plain_language_summary: string | null;
  terms_severity_score: number | null;
  ai_analyzed: boolean;
  ai_model: string | null;
  ai_confidence: number | null;
  human_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface HospitalScores {
  id: string;
  hospital_id: string;
  price_opacity_score: number | null;
  terms_capture_score: number | null;
  billing_practices_score: number | null;
  compliance_failure_score: number | null;
  total_capture_score: number | null;
  capture_tier: CaptureTier | null;
  score_version: number;
  last_calculated: string;
  created_at: string;
  updated_at: string;
}

export interface HospitalReport {
  id: string;
  hospital_id: string;
  anon_user_id: string | null;
  report_type: 'billing_issue' | 'transparency_violation' | 'terms_complaint' | 'positive' | 'other';
  description: string;
  estimated_bill: number | null;
  actual_bill: number | null;
  insurance_type: string | null;
  date_of_service: string | null;
  moderation_status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

// Combined view for map display
export interface HospitalMapItem {
  id: string;
  cms_ccn: string;
  name: string;
  city: string;
  state: string;
  zip: string | null;
  latitude: number;
  longitude: number;
  hospital_type: string | null;
  ownership_type: string | null;
  bed_count: number | null;
  emergency_services: boolean;
  total_capture_score: number | null;
  capture_tier: CaptureTier | null;
  mrf_published: boolean | null;
  consumer_tool_available: boolean | null;
}

// Full hospital detail with all related data
export interface HospitalDetail extends Hospital {
  compliance: HospitalCompliance | null;
  terms: HospitalTerms | null;
  scores: HospitalScores | null;
  reports: HospitalReport[];
}

// Filter options for map
export interface HospitalFilters {
  states: string[];
  hospitalTypes: string[];
  ownershipTypes: string[];
  captureTiers: CaptureTier[];
  emergencyServicesOnly: boolean;
  mrfPublishedOnly: boolean;
  minBedCount: number | null;
  maxBedCount: number | null;
  searchQuery: string;
}

// Map bounds for viewport queries
export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

// Procedure pricing types
export interface Procedure {
  id: string;
  code: string;
  code_type: string;
  description: string;
  common_name: string | null;
  category: string | null;
  is_shoppable: boolean;
}

export interface HospitalPrice {
  id: string;
  hospital_id: string;
  procedure_id: string;
  hospital_name: string;
  city: string;
  state: string;
  zip: string | null;
  gross_charge: number | null;
  discounted_cash_price: number | null;
  min_negotiated_rate: number | null;
  max_negotiated_rate: number | null;
  capture_tier: CaptureTier | null;
  // From procedure join
  description?: string;
  common_name?: string | null;
  code?: string;
}

// Tier configuration for display - adapted to Oasara palette
export const CAPTURE_TIER_CONFIG: Record<CaptureTier, {
  label: string;
  color: string;
  bgClass: string;
  borderClass: string;
  description: string;
}> = {
  TRANSPARENT: {
    label: 'Transparent',
    color: '#22c55e',
    bgClass: 'bg-green-50',
    borderClass: 'border-green-500',
    description: 'Actually complying with price transparency rules',
  },
  OPAQUE: {
    label: 'Opaque',
    color: '#D4B86A', // Oasara gold
    bgClass: 'bg-gold-50',
    borderClass: 'border-gold-500',
    description: 'Minimal compliance, hard to find information',
  },
  CAPTURED: {
    label: 'Captured',
    color: '#f97316',
    bgClass: 'bg-orange-50',
    borderClass: 'border-orange-500',
    description: 'Actively hiding pricing information',
  },
  PREDATORY: {
    label: 'Predatory',
    color: '#ef4444',
    bgClass: 'bg-red-50',
    borderClass: 'border-red-500',
    description: 'Maximum patient capture, significant risk',
  },
};

// Hospital type display mapping
export const HOSPITAL_TYPE_LABELS: Record<string, string> = {
  'Acute Care': 'Acute Care Hospital',
  'Critical Access': 'Critical Access Hospital',
  "Children's": "Children's Hospital",
  'Psychiatric': 'Psychiatric Hospital',
  'DOD Acute Care': 'DOD Hospital',
};

// Ownership type display mapping
export const OWNERSHIP_TYPE_LABELS: Record<string, string> = {
  'Government - Federal': 'Federal Government',
  'Government - State': 'State Government',
  'Government - Local': 'Local Government',
  'Government - Hospital District or Authority': 'Hospital District',
  'Proprietary': 'For-Profit',
  'Voluntary non-profit - Private': 'Private Non-Profit',
  'Voluntary non-profit - Church': 'Church-Affiliated Non-Profit',
  'Voluntary non-profit - Other': 'Other Non-Profit',
};

// US State codes and names
export const US_STATES: Record<string, string> = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas',
  CA: 'California', CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware',
  FL: 'Florida', GA: 'Georgia', HI: 'Hawaii', ID: 'Idaho',
  IL: 'Illinois', IN: 'Indiana', IA: 'Iowa', KS: 'Kansas',
  KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland',
  MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi',
  MO: 'Missouri', MT: 'Montana', NE: 'Nebraska', NV: 'Nevada',
  NH: 'New Hampshire', NJ: 'New Jersey', NM: 'New Mexico', NY: 'New York',
  NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio', OK: 'Oklahoma',
  OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina',
  SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah',
  VT: 'Vermont', VA: 'Virginia', WA: 'Washington', WV: 'West Virginia',
  WI: 'Wisconsin', WY: 'Wyoming', DC: 'District of Columbia',
  PR: 'Puerto Rico', VI: 'US Virgin Islands', GU: 'Guam',
};
