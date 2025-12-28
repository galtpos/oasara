/**
 * US Hospital Price API Client
 *
 * Fetches US hospital transparency data from OwnNothing.org
 * Used for "Save X% vs US" comparisons in facility views
 */

const OWNNOTHING_API = 'https://ownnothing.org/.netlify/functions/us-prices';

// Response types from OwnNothing API
export interface USProcedure {
  code: string;
  code_type: string;
  name: string;
  category: string;
}

export interface USPriceStats {
  hospital_count: number;
  cash_price: {
    min: number | null;
    max: number | null;
    average: number | null;
    median: number | null;
  };
  gross_charge: {
    min: number | null;
    max: number | null;
    average: number | null;
  };
  transparent_hospitals_percent: number;
}

export interface USHospitalPrice {
  name: string;
  city: string;
  state: string;
  cash_price: number | null;
  gross_charge: number | null;
  tier: 'TRANSPARENT' | 'OPAQUE' | 'CAPTURED' | 'PREDATORY';
}

export interface USPriceResponse {
  success: boolean;
  procedure: USProcedure;
  us_prices: USPriceStats;
  hospitals: USHospitalPrice[];
  source: string;
  disclaimer: string;
  error?: string;
}

export interface USProcedureList {
  success: boolean;
  procedure_count: number;
  procedures: Record<string, { code: string; code_type: string; name: string }[]>;
}

export interface USStats {
  success: boolean;
  stats: {
    total_prices_indexed: number;
    hospitals_with_pricing: number;
    procedures_covered: number;
    compliant_hospitals_percent: number;
    data_source: string;
    last_updated: string;
  };
}

/**
 * Get US prices for a specific CPT code
 */
export async function getUSPricesByCode(cptCode: string): Promise<USPriceResponse | null> {
  try {
    const res = await fetch(`${OWNNOTHING_API}?code=${cptCode}`);
    if (!res.ok) return null;

    const data = await res.json();
    return data.success ? data : null;
  } catch {
    return null;
  }
}

/**
 * Get US prices by procedure name search
 */
export async function getUSPricesByName(procedureName: string): Promise<USPriceResponse | null> {
  try {
    const res = await fetch(`${OWNNOTHING_API}?procedure=${encodeURIComponent(procedureName)}`);
    if (!res.ok) return null;

    const data = await res.json();
    return data.success ? data : null;
  } catch {
    return null;
  }
}

/**
 * Get list of all available procedures
 */
export async function getUSProcedures(): Promise<USProcedureList | null> {
  try {
    const res = await fetch(`${OWNNOTHING_API}?list=procedures`);
    if (!res.ok) return null;

    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Get overall US price transparency stats
 */
export async function getUSStats(): Promise<USStats | null> {
  try {
    const res = await fetch(`${OWNNOTHING_API}?stats=true`);
    if (!res.ok) return null;

    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Calculate savings compared to US average
 */
export function calculateSavingsVsUS(
  oasaraPrice: number,
  usAverage: number | null
): { savings: number; percent: number } | null {
  if (!usAverage || usAverage <= 0 || oasaraPrice <= 0) return null;

  const savings = usAverage - oasaraPrice;
  const percent = Math.round((savings / usAverage) * 100);

  return { savings, percent };
}

/**
 * Format price for display
 */
export function formatUSPrice(price: number | null): string {
  if (price === null || price === undefined) return 'N/A';
  return `$${price.toLocaleString()}`;
}

/**
 * Get tier color class for Oasara palette
 */
export function getTierColorClass(tier: USHospitalPrice['tier']): string {
  switch (tier) {
    case 'TRANSPARENT':
      return 'text-green-600 bg-green-50';
    case 'OPAQUE':
      return 'text-gold-600 bg-gold-50';
    case 'CAPTURED':
      return 'text-orange-600 bg-orange-50';
    case 'PREDATORY':
      return 'text-red-600 bg-red-50';
    default:
      return 'text-sage-600 bg-sage-50';
  }
}

/**
 * Get tier description
 */
export function getTierDescription(tier: USHospitalPrice['tier']): string {
  switch (tier) {
    case 'TRANSPARENT':
      return 'Full price disclosure';
    case 'OPAQUE':
      return 'Partial price disclosure';
    case 'CAPTURED':
      return 'Hidden pricing, arbitration required';
    case 'PREDATORY':
      return 'No prices, surprise billing risk';
    default:
      return 'Unknown compliance status';
  }
}
