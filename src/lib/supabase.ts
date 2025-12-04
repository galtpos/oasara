import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Enriched data types
export interface Doctor {
  id: string
  facility_id: string
  name: string
  title?: string
  specialty?: string
  qualifications?: string
  languages?: string[]
  years_experience?: number
  procedures_performed?: number
  image_url?: string
  bio?: string
  email?: string
  phone?: string
  profile_url?: string
  source?: string
  created_at?: string
  updated_at?: string
}

export interface ProcedurePricing {
  id: string
  facility_id: string
  procedure_name: string
  price?: number
  currency?: string
  price_type?: string
  price_min?: number
  price_max?: number
  description?: string
  last_verified?: string
  source?: string
  verified?: boolean
  created_at?: string
  updated_at?: string
}

export interface Testimonial {
  id: string
  facility_id: string
  patient_name?: string
  procedure?: string
  rating?: number
  review_text?: string
  review_date?: string
  verified?: boolean
  source?: string
  created_at?: string
}

// Facility types
export interface Facility {
  id: string
  name: string
  country: string
  city: string
  lat: number
  lng: number
  jci_accredited: boolean
  specialties: string[]
  languages: string[]
  google_rating: number
  review_count: number
  accepts_zano: boolean
  contact_email: string
  airport_distance: string
  popular_procedures: {
    name: string
    price_range: string
    wait_time: string
  }[]
  website?: string
  phone?: string
  google_maps_url?: string
  google_place_id?: string
  contact_verified?: boolean
  contact_email_primary?: string
  created_at?: string
  updated_at?: string
  // Enriched data relations
  doctors?: Doctor[]
  procedure_pricing?: ProcedurePricing[]
  testimonials?: Testimonial[]
}

export interface ZanoRequest {
  id: string
  facility_id: string
  requested_at: string
  user_email?: string
  status: 'pending' | 'contacted' | 'accepted' | 'declined'
}

// Fetch all facilities
export async function getFacilities(filters?: {
  country?: string
  specialty?: string
  acceptsZano?: boolean
}) {
  let query = supabase
    .from('facilities')
    .select(`
      *,
      doctors (*),
      procedure_pricing (*),
      testimonials (*)
    `)
    .order('google_rating', { ascending: false })

  if (filters?.country) {
    query = query.eq('country', filters.country)
  }

  if (filters?.specialty) {
    query = query.contains('specialties', [filters.specialty])
  }

  if (filters?.acceptsZano !== undefined) {
    query = query.eq('accepts_zano', filters.acceptsZano)
  }

  const { data, error } = await query

  if (error) throw error
  return data as Facility[]
}

// Get a single facility by ID with enriched data
export async function getFacility(id: string) {
  const { data, error } = await supabase
    .from('facilities')
    .select(`
      *,
      doctors (*),
      procedure_pricing (*),
      testimonials (*)
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Facility
}

// Get enriched data counts for a facility
export async function getFacilityEnrichmentCounts(id: string) {
  const { count: doctorsCount } = await supabase
    .from('doctors')
    .select('*', { count: 'exact', head: true })
    .eq('facility_id', id)

  const { count: pricingCount } = await supabase
    .from('procedure_pricing')
    .select('*', { count: 'exact', head: true })
    .eq('facility_id', id)

  const { count: testimonialsCount } = await supabase
    .from('testimonials')
    .select('*', { count: 'exact', head: true })
    .eq('facility_id', id)

  return {
    doctors: doctorsCount || 0,
    pricing: pricingCount || 0,
    testimonials: testimonialsCount || 0
  }
}

// Search facilities by name or procedure
export async function searchFacilities(searchTerm: string) {
  const { data, error } = await supabase
    .from('facilities')
    .select('*')
    .or(`name.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%`)
    .order('google_rating', { ascending: false })

  if (error) throw error
  return data as Facility[]
}

// Track Zano payment requests
export async function requestZanoPayment(facilityId: string, userEmail?: string) {
  const { data, error } = await supabase
    .from('zano_requests')
    .insert([{
      facility_id: facilityId,
      user_email: userEmail,
      status: 'pending'
    }])
    .select()

  if (error) throw error
  return data
}

// Get unique countries from facilities
export async function getCountries() {
  const { data, error } = await supabase
    .from('facilities')
    .select('country')
    .order('country')

  if (error) throw error

  const uniqueCountries = Array.from(new Set(data.map(f => f.country)))
  return uniqueCountries
}

// Get unique specialties from facilities
export async function getSpecialties() {
  const { data, error } = await supabase
    .from('facilities')
    .select('specialties')

  if (error) throw error

  const allSpecialties = data.flatMap(f => f.specialties || [])
  const uniqueSpecialties = Array.from(new Set(allSpecialties)).sort()
  return uniqueSpecialties
}
