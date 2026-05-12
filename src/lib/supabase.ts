import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || ''
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || ''

// Singleton pattern to prevent multiple GoTrueClient instances
let supabaseInstance: SupabaseClient | null = null;

// Validate environment variables on load
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '[OASARA] Missing Supabase configuration!\n' +
    'Required environment variables:\n' +
    '  - REACT_APP_SUPABASE_URL: ' + (supabaseUrl ? 'SET' : 'MISSING') + '\n' +
    '  - REACT_APP_SUPABASE_ANON_KEY: ' + (supabaseAnonKey ? 'SET' : 'MISSING') + '\n' +
    'Set these in Netlify dashboard: Site settings > Build & deploy > Environment variables'
  );
}

function getSupabaseClient(): SupabaseClient {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('[OASARA] Supabase client initialized with missing credentials - API calls will fail');
  }

  // storageKey namespaces this client's localStorage away from the ecosystem
  // auth client (uefznzzkrzqxgxxwslox). detectSessionInUrl: false because only
  // the ecosystem auth client should consume the URL hash on /auth/confirm —
  // otherwise this client races, grabs the FreedomForge JWT first, and stores
  // it under the wrong storageKey so the ecosystem hook never sees a session.
  // Unified Auth Board 2026-05-11.
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
      storageKey: 'sb-oasara-per-site-auth',
    }
  });

  return supabaseInstance;
}

export const supabase = getSupabaseClient();

// Federated CRUD helper. Routes through Oasara's federated-data-proxy Edge
// Function, which validates the FF JWT and forces user_id to the verified
// subject. Ops: insert | select | update | delete | upsert | list. Per
// Unified Auth Board Session 2 (2026-05-12) Option C contract.
const __ECO_AUTH_KEY = 'sb-uefznzzkrzqxgxxwslox-auth-token';
function __readEcoSession(): any {
  try {
    if (typeof window === 'undefined') return null;
    const raw = window.localStorage.getItem(__ECO_AUTH_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (!s?.access_token || !s?.user) return null;
    if (s.expires_at && s.expires_at * 1000 < Date.now()) return null;
    return s;
  } catch { return null; }
}

export async function callBridge(
  op: 'insert' | 'select' | 'update' | 'delete' | 'upsert' | 'list',
  table: string,
  payload: Record<string, any> = {},
): Promise<{ data: any; error: { message: string; detail?: string } | null }> {
  const sess = __readEcoSession();
  if (!sess?.access_token) {
    return { data: null, error: { message: 'Must be authenticated' } };
  }
  try {
    const resp = await fetch(`${supabaseUrl}/functions/v1/federated-data-proxy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sess.access_token}`,
      },
      body: JSON.stringify({ table, op, ...payload }),
    });
    const body = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      return { data: null, error: { message: body.error || `Bridge ${resp.status}`, detail: body.detail } };
    }
    return { data: body, error: null };
  } catch (e: any) {
    return { data: null, error: { message: e?.message || 'Bridge fetch failed' } };
  }
}

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
  intel?: FacilityIntel
}

// Facility intel (oasara_facility_intel table)
// Admin-only fields (coordinator_name, coordinator_email, coordinator_role,
// whatsapp, outreach_draft) MUST NOT be rendered on patient-facing surfaces.
export interface FacilityIntel {
  facility_id: string
  coordinator_name?: string
  coordinator_email?: string
  coordinator_role?: string
  whatsapp?: string
  languages?: string[]
  international_program_summary?: string
  published_pricing?: string[]
  response_signal?: string
  outreach_draft?: string
  intel_quality_score?: number
  created_at?: string
  updated_at?: string
}

export interface ZanoRequest {
  id: string
  facility_id: string
  requested_at: string
  user_email?: string
  status: 'pending' | 'contacted' | 'accepted' | 'declined'
}

// Wallet Education Types
export interface SovereigntyCredential {
  id: string
  user_id: string
  credential_type: string
  level: number
  name: string
  earned_at: string
  verification_method?: string
  verification_data?: Record<string, unknown>
  source_site: string
}

export interface FusdFaucetClaim {
  id: string
  user_id: string
  wallet_address: string
  amount_usd: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
  tx_hash?: string
  claimed_at: string
  processed_at?: string
}

export interface WalletEducationProgress {
  id: string
  user_id: string
  video_id: string
  completed: boolean
  watched_seconds: number
  total_seconds?: number
  completed_at?: string
}

// Credential level names
export const CREDENTIAL_LEVELS: Record<number, string> = {
  1: 'Key Holder',
  2: 'Self-Custodian',
  3: 'Sovereign Transactor',
  4: 'Privacy Holder',
  5: 'Financially Sovereign'
}

// Fetch all facilities
export async function getFacilities(filters?: {
  country?: string
  specialty?: string
  acceptsZano?: boolean
}) {
  // Simple query without joins - more reliable for public access
  let query = supabase
    .from('facilities')
    .select('*')
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

  if (error) {
    return []
  }
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

// Get a facility plus its enrichment intel row (oasara_facility_intel).
// Returns the same Facility shape with an optional `intel` field. Absent intel
// rows degrade silently so the facility page renders normally.
export async function getFacilityWithIntel(id: string): Promise<Facility> {
  const facility = await getFacility(id)

  const { data: intelData, error: intelError } = await supabase
    .from('oasara_facility_intel')
    .select('*')
    .eq('facility_id', id)
    .maybeSingle()

  if (intelError || !intelData) {
    return facility
  }

  return { ...facility, intel: intelData as FacilityIntel }
}

// Get enriched data counts for a facility
export async function getFacilityEnrichmentCounts(id: string) {
  try {
    const [doctorsRes, pricingRes, testimonialsRes] = await Promise.all([
      supabase.from('doctors').select('*', { count: 'exact', head: true }).eq('facility_id', id),
      supabase.from('procedure_pricing').select('*', { count: 'exact', head: true }).eq('facility_id', id),
      supabase.from('testimonials').select('*', { count: 'exact', head: true }).eq('facility_id', id)
    ])

    return {
      doctors: doctorsRes.count || 0,
      pricing: pricingRes.count || 0,
      testimonials: testimonialsRes.count || 0
    }
  } catch {
    return { doctors: 0, pricing: 0, testimonials: 0 }
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

// ============================================
// Wallet Education Functions
// ============================================

// Get user's video progress
export async function getVideoProgress(userId: string) {
  const { data, error } = await supabase
    .from('wallet_education_progress')
    .select('*')
    .eq('user_id', userId)

  if (error) throw error
  return data as WalletEducationProgress[]
}

// Update video progress through federated bridge — composite (user_id,video_id)
// conflict resolution is passed explicitly to the proxy.
export async function updateVideoProgress(
  _userId: string,
  videoId: string,
  watchedSeconds: number,
  totalSeconds: number,
  completed: boolean
) {
  const { data, error } = await callBridge('upsert', 'wallet_education_progress', {
    data: {
      video_id: videoId,
      watched_seconds: watchedSeconds,
      total_seconds: totalSeconds,
      completed,
      completed_at: completed ? new Date().toISOString() : null,
    },
    onConflict: 'user_id,video_id',
  });

  if (error) throw new Error(error.message);
  return data
}

// Get user's credentials
export async function getUserCredentials(userId: string) {
  const { data, error } = await supabase
    .from('sovereignty_credentials')
    .select('*')
    .eq('user_id', userId)
    .order('level', { ascending: true })

  if (error) throw error
  return data as SovereigntyCredential[]
}

// Issue a credential
export async function issueCredential(
  userId: string,
  level: number,
  verificationMethod: string,
  verificationData?: Record<string, unknown>
) {
  const name = CREDENTIAL_LEVELS[level] || `Level ${level}`

  const { data, error } = await supabase
    .from('sovereignty_credentials')
    .upsert({
      user_id: userId,
      credential_type: 'money_sovereignty',
      level,
      name,
      verification_method: verificationMethod,
      verification_data: verificationData,
      source_site: 'oasara'
    }, { onConflict: 'user_id,credential_type,level' })
    .select()

  if (error) throw error
  return data
}

// Get faucet status
export async function getFaucetStatus() {
  const { data, error } = await supabase
    .rpc('get_faucet_claims_count')

  if (error) {
    return { claimed: 0, remaining: 100, available: true }
  }

  const claimed = data || 0
  return {
    claimed,
    remaining: Math.max(0, 100 - claimed),
    available: claimed < 100
  }
}

// Claim FUSD from faucet
export async function claimFaucet(userId: string, walletAddress: string) {
  const { data, error } = await supabase
    .from('fusd_faucet_claims')
    .insert({
      user_id: userId,
      wallet_address: walletAddress,
      amount_usd: 5.00,
      status: 'pending'
    })
    .select()

  if (error) throw error
  return data
}

// Check if user has claimed faucet
export async function hasClaimedFaucet(userId: string) {
  const { data, error } = await supabase
    .from('fusd_faucet_claims')
    .select('id')
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return !!data
}
