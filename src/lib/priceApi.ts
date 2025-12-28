// Price Comparison API
// Search and compare US hospital procedure prices
// Data from OwnNothing.org's hospital transparency database

import { ownNothingSupabase } from './ownNothingSupabase';
import type { Procedure, HospitalPrice } from '../types/hospital';

export interface PriceSearchParams {
  procedureCode?: string;
  procedureId?: string;
  searchQuery?: string;
  state?: string;
  nearLat?: number;
  nearLng?: number;
  radiusMiles?: number;
  limit?: number;
  sortBy?: 'cash_price' | 'gross_charge' | 'distance';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Get all available procedures
 */
export async function getProcedures(): Promise<Procedure[]> {
  const { data, error } = await ownNothingSupabase
    .from('procedures')
    .select('*')
    .eq('is_shoppable', true)
    .order('category')
    .order('common_name');

  if (error) {
    console.error('Error fetching procedures:', error);
    throw error;
  }

  return data || [];
}

/**
 * Get procedures grouped by category
 */
export async function getProceduresByCategory(): Promise<Record<string, Procedure[]>> {
  const procedures = await getProcedures();

  const byCategory: Record<string, Procedure[]> = {};
  procedures.forEach(proc => {
    const cat = proc.category || 'Other';
    if (!byCategory[cat]) {
      byCategory[cat] = [];
    }
    byCategory[cat].push(proc);
  });

  return byCategory;
}

/**
 * Search for procedure prices
 */
export async function searchPrices(params: PriceSearchParams): Promise<HospitalPrice[]> {
  let query = ownNothingSupabase
    .from('price_comparison_view')
    .select('*');

  // Filter by procedure
  if (params.procedureId) {
    query = query.eq('procedure_id', params.procedureId);
  } else if (params.procedureCode) {
    query = query.eq('code', params.procedureCode);
  }

  // Filter by state
  if (params.state) {
    query = query.eq('state', params.state);
  }

  // Geographic filtering (bounding box approximation)
  if (params.nearLat && params.nearLng && params.radiusMiles) {
    const latDelta = params.radiusMiles / 69;
    const lngDelta = params.radiusMiles / (69 * Math.cos(params.nearLat * (Math.PI / 180)));

    query = query
      .gte('latitude', params.nearLat - latDelta)
      .lte('latitude', params.nearLat + latDelta)
      .gte('longitude', params.nearLng - lngDelta)
      .lte('longitude', params.nearLng + lngDelta);
  }

  // Sorting
  if (params.sortBy === 'cash_price') {
    query = query.order('discounted_cash_price', {
      ascending: params.sortOrder !== 'desc',
      nullsFirst: false
    });
  } else if (params.sortBy === 'gross_charge') {
    query = query.order('gross_charge', {
      ascending: params.sortOrder !== 'desc',
      nullsFirst: false
    });
  } else {
    // Default: sort by cash price ascending
    query = query.order('discounted_cash_price', { ascending: true, nullsFirst: false });
  }

  // Limit
  query = query.limit(params.limit || 50);

  const { data, error } = await query;

  if (error) {
    console.error('Error searching prices:', error);
    throw error;
  }

  return data || [];
}

/**
 * Get prices for a specific hospital
 */
export async function getHospitalPrices(hospitalId: string): Promise<HospitalPrice[]> {
  const { data, error } = await ownNothingSupabase
    .from('price_comparison_view')
    .select('*')
    .eq('hospital_id', hospitalId)
    .order('category')
    .order('common_name');

  if (error) {
    console.error('Error fetching hospital prices:', error);
    throw error;
  }

  return data || [];
}

/**
 * Get price statistics across all hospitals
 */
export async function getPriceStats(): Promise<{
  totalPricesIndexed: number;
  hospitalsWithPricing: number;
  proceduresCovered: number;
}> {
  // Get counts
  const { count: priceCount } = await ownNothingSupabase
    .from('hospital_pricing')
    .select('id', { count: 'exact', head: true });

  const { data: hospitalData } = await ownNothingSupabase
    .from('hospital_pricing')
    .select('hospital_id');

  const uniqueHospitals = new Set(hospitalData?.map(d => d.hospital_id) || []);

  const { data: procData } = await ownNothingSupabase
    .from('hospital_pricing')
    .select('procedure_id');

  const uniqueProcs = new Set(procData?.map(d => d.procedure_id) || []);

  return {
    totalPricesIndexed: priceCount || 0,
    hospitalsWithPricing: uniqueHospitals.size,
    proceduresCovered: uniqueProcs.size,
  };
}

/**
 * Format price for display
 */
export function formatPrice(price: number | null): string {
  if (price === null || price === undefined) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Calculate potential savings from price list
 */
export function calculateSavings(prices: HospitalPrice[]): {
  lowestCash: number | null;
  highestCash: number | null;
  potentialSavings: number | null;
  savingsPercent: number | null;
} {
  const cashPrices = prices
    .map(p => p.discounted_cash_price)
    .filter((p): p is number => p !== null && p > 0)
    .sort((a, b) => a - b);

  if (cashPrices.length < 2) {
    return {
      lowestCash: cashPrices[0] || null,
      highestCash: cashPrices[cashPrices.length - 1] || null,
      potentialSavings: null,
      savingsPercent: null,
    };
  }

  const lowest = cashPrices[0];
  const highest = cashPrices[cashPrices.length - 1];
  const savings = highest - lowest;
  const percent = Math.round((savings / highest) * 100);

  return {
    lowestCash: lowest,
    highestCash: highest,
    potentialSavings: savings,
    savingsPercent: percent,
  };
}
