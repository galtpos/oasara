// Hospital Transparency API
// Fetches US hospital data from OwnNothing.org's Supabase database

import { ownNothingSupabase } from './ownNothingSupabase';
import type {
  Hospital,
  HospitalMapItem,
  HospitalDetail,
  HospitalFilters,
  MapBounds,
  CaptureTier,
} from '../types/hospital';

const SUPABASE_PAGE_SIZE = 1000;
const MAX_HOSPITALS_FOR_MAP = 2000; // Limit to prevent browser freeze

/**
 * Fetch hospitals for map display with optional filtering
 * Limited to MAX_HOSPITALS_FOR_MAP to prevent browser freeze on slower machines
 */
export async function getHospitalsForMap(
  filters?: Partial<HospitalFilters>,
  bounds?: MapBounds
): Promise<HospitalMapItem[]> {
  const allHospitals: HospitalMapItem[] = [];
  let offset = 0;
  let hasMore = true;
  let iterationCount = 0;
  const maxIterations = Math.ceil(MAX_HOSPITALS_FOR_MAP / SUPABASE_PAGE_SIZE);

  while (hasMore && iterationCount < maxIterations) {
    iterationCount++;
    let query = ownNothingSupabase
      .from('hospital_map_view')
      .select('*')
      .not('latitude', 'is', null)
      .not('longitude', 'is', null);

    // Apply geographic bounds if provided
    if (bounds) {
      query = query
        .gte('latitude', bounds.south)
        .lte('latitude', bounds.north)
        .gte('longitude', bounds.west)
        .lte('longitude', bounds.east);
    }

    // Apply filters
    if (filters) {
      if (filters.states && filters.states.length > 0) {
        query = query.in('state', filters.states);
      }

      if (filters.hospitalTypes && filters.hospitalTypes.length > 0) {
        query = query.in('hospital_type', filters.hospitalTypes);
      }

      if (filters.ownershipTypes && filters.ownershipTypes.length > 0) {
        query = query.in('ownership_type', filters.ownershipTypes);
      }

      if (filters.captureTiers && filters.captureTiers.length > 0) {
        query = query.in('capture_tier', filters.captureTiers);
      }

      if (filters.emergencyServicesOnly) {
        query = query.eq('emergency_services', true);
      }

      if (filters.mrfPublishedOnly) {
        query = query.eq('mrf_published', true);
      }

      if (filters.minBedCount !== null && filters.minBedCount !== undefined) {
        query = query.gte('bed_count', filters.minBedCount);
      }

      if (filters.maxBedCount !== null && filters.maxBedCount !== undefined) {
        query = query.lte('bed_count', filters.maxBedCount);
      }

      if (filters.searchQuery) {
        query = query.or(
          `name.ilike.%${filters.searchQuery}%,city.ilike.%${filters.searchQuery}%,zip.ilike.${filters.searchQuery}%`
        );
      }
    }

    query = query.range(offset, offset + SUPABASE_PAGE_SIZE - 1);

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching hospitals for map:', error);
      throw error;
    }

    if (data && data.length > 0) {
      allHospitals.push(...(data as HospitalMapItem[]));
      offset += SUPABASE_PAGE_SIZE;
      hasMore = data.length === SUPABASE_PAGE_SIZE;
    } else {
      hasMore = false;
    }
  }

  return allHospitals;
}

/**
 * Fetch full hospital detail by ID
 */
export async function getHospitalDetail(hospitalId: string): Promise<HospitalDetail | null> {
  // Fetch hospital base data
  const { data: hospital, error: hospitalError } = await ownNothingSupabase
    .from('hospitals')
    .select('*')
    .eq('id', hospitalId)
    .single();

  if (hospitalError) {
    console.error('Error fetching hospital:', hospitalError);
    throw hospitalError;
  }

  if (!hospital) {
    return null;
  }

  // Fetch related data in parallel
  const [complianceRes, termsRes, scoresRes, reportsRes] = await Promise.all([
    ownNothingSupabase
      .from('hospital_compliance')
      .select('*')
      .eq('hospital_id', hospitalId)
      .single(),
    ownNothingSupabase
      .from('hospital_terms')
      .select('*')
      .eq('hospital_id', hospitalId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single(),
    ownNothingSupabase
      .from('hospital_scores')
      .select('*')
      .eq('hospital_id', hospitalId)
      .single(),
    ownNothingSupabase
      .from('hospital_reports')
      .select('*')
      .eq('hospital_id', hospitalId)
      .eq('moderation_status', 'approved')
      .order('created_at', { ascending: false })
      .limit(10),
  ]);

  return {
    ...hospital,
    compliance: complianceRes.data || null,
    terms: termsRes.data || null,
    scores: scoresRes.data || null,
    reports: reportsRes.data || [],
  } as HospitalDetail;
}

/**
 * Search hospitals by name, city, or zip
 */
export async function searchHospitals(
  query: string,
  limit: number = 20
): Promise<Hospital[]> {
  if (!query || query.length < 2) {
    return [];
  }

  const { data, error } = await ownNothingSupabase
    .from('hospitals')
    .select('*')
    .or(
      `name.ilike.%${query}%,city.ilike.%${query}%,zip.ilike.${query}%`
    )
    .order('name')
    .limit(limit);

  if (error) {
    console.error('Error searching hospitals:', error);
    throw error;
  }

  return (data || []) as Hospital[];
}

/**
 * Get hospital statistics for dashboard
 */
export async function getHospitalStats(): Promise<{
  totalHospitals: number;
  byTier: Record<CaptureTier, number>;
  mrfPublished: number;
  withConsumerTool: number;
}> {
  // Get total count
  const { count: totalCount } = await ownNothingSupabase
    .from('hospitals')
    .select('id', { count: 'exact', head: true });

  // Get counts by capture tier
  const { data: tierData } = await ownNothingSupabase
    .from('hospital_scores')
    .select('capture_tier');

  const byTier: Record<CaptureTier, number> = {
    TRANSPARENT: 0,
    OPAQUE: 0,
    CAPTURED: 0,
    PREDATORY: 0,
  };

  tierData?.forEach((row) => {
    if (row.capture_tier && row.capture_tier in byTier) {
      byTier[row.capture_tier as CaptureTier]++;
    }
  });

  // Get MRF published count
  const { count: mrfCount } = await ownNothingSupabase
    .from('hospital_compliance')
    .select('id', { count: 'exact', head: true })
    .eq('mrf_published', true);

  // Get consumer tool count
  const { count: consumerToolCount } = await ownNothingSupabase
    .from('hospital_compliance')
    .select('id', { count: 'exact', head: true })
    .eq('consumer_tool_available', true);

  return {
    totalHospitals: totalCount || 0,
    byTier,
    mrfPublished: mrfCount || 0,
    withConsumerTool: consumerToolCount || 0,
  };
}

/**
 * Get distinct filter options from database
 */
export async function getFilterOptions(): Promise<{
  states: string[];
  hospitalTypes: string[];
  ownershipTypes: string[];
}> {
  const states = new Set<string>();
  const hospitalTypes = new Set<string>();
  const ownershipTypes = new Set<string>();

  let offset = 0;
  let hasMore = true;
  let iterationCount = 0;
  const maxIterations = 10; // Safety limit

  while (hasMore && iterationCount < maxIterations) {
    iterationCount++;
    const { data } = await ownNothingSupabase
      .from('hospitals')
      .select('state, hospital_type, ownership_type')
      .range(offset, offset + SUPABASE_PAGE_SIZE - 1);

    if (!data || data.length === 0) {
      hasMore = false;
      break;
    }

    data.forEach((row) => {
      if (row.state) states.add(row.state);
      if (row.hospital_type) hospitalTypes.add(row.hospital_type);
      if (row.ownership_type) ownershipTypes.add(row.ownership_type);
    });

    offset += SUPABASE_PAGE_SIZE;
    hasMore = data.length === SUPABASE_PAGE_SIZE;
  }

  return {
    states: [...states].sort(),
    hospitalTypes: [...hospitalTypes].sort(),
    ownershipTypes: [...ownershipTypes].sort(),
  };
}

/**
 * Submit a hospital report
 */
export async function submitHospitalReport(report: {
  hospital_id: string;
  report_type: 'billing_issue' | 'transparency_violation' | 'terms_complaint' | 'positive' | 'other';
  description: string;
  estimated_bill?: number;
  actual_bill?: number;
}): Promise<{ success: boolean; error?: string }> {
  const { error } = await ownNothingSupabase.from('hospital_reports').insert({
    ...report,
    moderation_status: 'pending',
  });

  if (error) {
    console.error('Error submitting hospital report:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}
