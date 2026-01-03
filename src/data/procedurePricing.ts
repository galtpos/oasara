/**
 * Reference Pricing Data for Medical Tourism Procedures
 * 
 * Sources:
 * - Medical Tourism Packages (2024-2025)
 * - Patients Beyond Borders
 * - S3E1: Healthcare's Hostage Crisis EXPOSED
 * - Industry research (Perplexity, 2025)
 * 
 * Note: These are ESTIMATED RANGES. Actual prices vary by facility,
 * surgeon, complexity, and inclusions. Always contact facility for quotes.
 */

export interface ProcedurePricing {
  procedure: string;
  category: string;
  usLow: number;
  usHigh: number;
  countries: {
    [country: string]: {
      low: number;
      high: number;
    };
  };
}

export const PROCEDURE_PRICING: ProcedurePricing[] = [
  // ORTHOPEDIC
  {
    procedure: 'Knee Replacement',
    category: 'Orthopedic',
    usLow: 35000,
    usHigh: 65000,
    countries: {
      'Mexico': { low: 9000, high: 15000 },
      'Thailand': { low: 12000, high: 18000 },
      'India': { low: 7000, high: 12000 },
      'Colombia': { low: 9000, high: 14000 },
      'Costa Rica': { low: 15000, high: 22000 },
      'Turkey': { low: 8000, high: 14000 },
      'Singapore': { low: 15000, high: 25000 },
    }
  },
  {
    procedure: 'Hip Replacement',
    category: 'Orthopedic',
    usLow: 40000,
    usHigh: 80000,
    countries: {
      'Mexico': { low: 8000, high: 13000 },
      'Thailand': { low: 12000, high: 18000 },
      'India': { low: 7000, high: 11000 },
      'Colombia': { low: 9000, high: 14000 },
      'Costa Rica': { low: 12000, high: 18000 },
      'Turkey': { low: 8000, high: 14000 },
      'Singapore': { low: 14000, high: 22000 },
    }
  },
  {
    procedure: 'Spinal Fusion',
    category: 'Orthopedic',
    usLow: 80000,
    usHigh: 150000,
    countries: {
      'Mexico': { low: 15000, high: 25000 },
      'Thailand': { low: 18000, high: 30000 },
      'India': { low: 8000, high: 15000 },
      'Turkey': { low: 12000, high: 22000 },
    }
  },
  {
    procedure: 'ACL Repair',
    category: 'Orthopedic',
    usLow: 20000,
    usHigh: 50000,
    countries: {
      'Mexico': { low: 6000, high: 10000 },
      'Thailand': { low: 7000, high: 12000 },
      'India': { low: 5000, high: 9000 },
      'Colombia': { low: 6000, high: 11000 },
    }
  },

  // CARDIAC
  {
    procedure: 'Heart Bypass',
    category: 'Cardiac',
    usLow: 70000,
    usHigh: 200000,
    countries: {
      'India': { low: 5000, high: 10000 },
      'Thailand': { low: 15000, high: 25000 },
      'Mexico': { low: 25000, high: 35000 },
      'Costa Rica': { low: 25000, high: 35000 },
      'Turkey': { low: 12000, high: 20000 },
    }
  },
  {
    procedure: 'Heart Valve Replacement',
    category: 'Cardiac',
    usLow: 80000,
    usHigh: 200000,
    countries: {
      'India': { low: 8000, high: 15000 },
      'Thailand': { low: 18000, high: 30000 },
      'Turkey': { low: 15000, high: 25000 },
    }
  },
  {
    procedure: 'Angioplasty',
    category: 'Cardiac',
    usLow: 30000,
    usHigh: 60000,
    countries: {
      'India': { low: 4000, high: 8000 },
      'Thailand': { low: 8000, high: 15000 },
      'Mexico': { low: 10000, high: 18000 },
    }
  },

  // DENTAL
  {
    procedure: 'Dental Implants',
    category: 'Dental',
    usLow: 3000,
    usHigh: 5000,
    countries: {
      'Mexico': { low: 800, high: 1500 },
      'Thailand': { low: 1000, high: 2000 },
      'India': { low: 800, high: 1200 },
      'Colombia': { low: 700, high: 1200 },
      'Costa Rica': { low: 900, high: 1500 },
      'Turkey': { low: 500, high: 1000 },
      'Hungary': { low: 800, high: 1400 },
    }
  },
  {
    procedure: 'Full Mouth Restoration',
    category: 'Dental',
    usLow: 40000,
    usHigh: 80000,
    countries: {
      'Mexico': { low: 8000, high: 15000 },
      'Thailand': { low: 12000, high: 20000 },
      'India': { low: 6000, high: 12000 },
      'Hungary': { low: 10000, high: 18000 },
      'Turkey': { low: 8000, high: 14000 },
    }
  },
  {
    procedure: 'Dental Veneers',
    category: 'Dental',
    usLow: 1000,
    usHigh: 2500,
    countries: {
      'Mexico': { low: 300, high: 500 },
      'Thailand': { low: 350, high: 600 },
      'Turkey': { low: 250, high: 450 },
      'Colombia': { low: 300, high: 500 },
    }
  },
  {
    procedure: 'Root Canal',
    category: 'Dental',
    usLow: 1000,
    usHigh: 1500,
    countries: {
      'Mexico': { low: 150, high: 300 },
      'Thailand': { low: 200, high: 400 },
      'India': { low: 100, high: 200 },
    }
  },

  // COSMETIC
  {
    procedure: 'Breast Augmentation',
    category: 'Cosmetic',
    usLow: 6000,
    usHigh: 12000,
    countries: {
      'Mexico': { low: 3000, high: 5000 },
      'Thailand': { low: 3500, high: 5500 },
      'Colombia': { low: 2500, high: 4500 },
      'Turkey': { low: 3000, high: 5000 },
      'South Korea': { low: 4000, high: 7000 },
    }
  },
  {
    procedure: 'Tummy Tuck',
    category: 'Cosmetic',
    usLow: 8000,
    usHigh: 15000,
    countries: {
      'Mexico': { low: 4000, high: 6000 },
      'Thailand': { low: 4500, high: 7000 },
      'Colombia': { low: 3500, high: 5500 },
      'Turkey': { low: 3500, high: 5500 },
    }
  },
  {
    procedure: 'Liposuction',
    category: 'Cosmetic',
    usLow: 5000,
    usHigh: 11000,
    countries: {
      'Mexico': { low: 2500, high: 4500 },
      'Thailand': { low: 3000, high: 5000 },
      'Colombia': { low: 2000, high: 4000 },
      'Turkey': { low: 2500, high: 4500 },
    }
  },
  {
    procedure: 'Facelift',
    category: 'Cosmetic',
    usLow: 12000,
    usHigh: 25000,
    countries: {
      'Mexico': { low: 5000, high: 8000 },
      'Thailand': { low: 5000, high: 9000 },
      'South Korea': { low: 6000, high: 10000 },
      'Turkey': { low: 4500, high: 8000 },
    }
  },
  {
    procedure: 'Rhinoplasty',
    category: 'Cosmetic',
    usLow: 6000,
    usHigh: 15000,
    countries: {
      'Mexico': { low: 2500, high: 4500 },
      'Thailand': { low: 2400, high: 4000 },
      'India': { low: 2000, high: 3500 },
      'Turkey': { low: 2500, high: 4000 },
      'South Korea': { low: 4000, high: 7000 },
      'Costa Rica': { low: 3500, high: 5000 },
    }
  },
  {
    procedure: 'Hair Transplant',
    category: 'Cosmetic',
    usLow: 10000,
    usHigh: 25000,
    countries: {
      'Turkey': { low: 2000, high: 4000 },
      'India': { low: 1500, high: 3000 },
      'Thailand': { low: 3000, high: 5000 },
      'Mexico': { low: 3500, high: 6000 },
    }
  },

  // BARIATRIC
  {
    procedure: 'Gastric Sleeve',
    category: 'Bariatric',
    usLow: 15000,
    usHigh: 25000,
    countries: {
      'Mexico': { low: 4000, high: 7000 },
      'Thailand': { low: 8000, high: 12000 },
      'India': { low: 5000, high: 8000 },
      'Turkey': { low: 4500, high: 7500 },
      'Colombia': { low: 5000, high: 8000 },
    }
  },
  {
    procedure: 'Gastric Bypass',
    category: 'Bariatric',
    usLow: 20000,
    usHigh: 35000,
    countries: {
      'Mexico': { low: 6000, high: 10000 },
      'Thailand': { low: 10000, high: 16000 },
      'India': { low: 6000, high: 10000 },
      'Turkey': { low: 6000, high: 10000 },
    }
  },

  // EYE
  {
    procedure: 'LASIK',
    category: 'Eye',
    usLow: 3000,
    usHigh: 5000,
    countries: {
      'Turkey': { low: 800, high: 1500 },
      'Thailand': { low: 1000, high: 2000 },
      'India': { low: 500, high: 1000 },
      'Mexico': { low: 1000, high: 2000 },
    }
  },
  {
    procedure: 'Cataract Surgery',
    category: 'Eye',
    usLow: 3500,
    usHigh: 7000,
    countries: {
      'India': { low: 800, high: 1500 },
      'Thailand': { low: 1500, high: 2500 },
      'Mexico': { low: 1500, high: 2500 },
    }
  },

  // FERTILITY
  {
    procedure: 'IVF',
    category: 'Fertility',
    usLow: 12000,
    usHigh: 20000,
    countries: {
      'Mexico': { low: 5000, high: 8000 },
      'Thailand': { low: 6000, high: 10000 },
      'India': { low: 4000, high: 7000 },
      'Czech Republic': { low: 4000, high: 7000 },
      'Spain': { low: 5000, high: 9000 },
    }
  },

  // ONCOLOGY
  {
    procedure: 'Cancer Treatment',
    category: 'Oncology',
    usLow: 50000,
    usHigh: 200000,
    countries: {
      'India': { low: 8000, high: 30000 },
      'Thailand': { low: 15000, high: 50000 },
      'Turkey': { low: 12000, high: 40000 },
      'Mexico': { low: 15000, high: 45000 },
    }
  },
];

// Lookup helpers
export function findProcedurePricing(procedureName: string): ProcedurePricing | undefined {
  const searchTerm = procedureName.toLowerCase().trim();
  
  return PROCEDURE_PRICING.find(p => {
    const procLower = p.procedure.toLowerCase();
    return procLower.includes(searchTerm) || searchTerm.includes(procLower);
  });
}

export function getPricingForCountry(
  procedureName: string, 
  country: string
): { low: number; high: number; usLow: number; usHigh: number; savings: string } | null {
  const pricing = findProcedurePricing(procedureName);
  if (!pricing) return null;
  
  // Normalize country name
  const countryLower = country.toLowerCase();
  const countryEntry = Object.entries(pricing.countries).find(([c]) => 
    c.toLowerCase() === countryLower || 
    countryLower.includes(c.toLowerCase()) ||
    c.toLowerCase().includes(countryLower)
  );
  
  if (!countryEntry) return null;
  
  const [, range] = countryEntry;
  const avgUs = (pricing.usLow + pricing.usHigh) / 2;
  const avgAbroad = (range.low + range.high) / 2;
  const savingsPercent = Math.round(((avgUs - avgAbroad) / avgUs) * 100);
  
  return {
    low: range.low,
    high: range.high,
    usLow: pricing.usLow,
    usHigh: pricing.usHigh,
    savings: `${savingsPercent}%`
  };
}

export function formatPriceRange(low: number, high: number): string {
  return `$${low.toLocaleString()} - $${high.toLocaleString()}`;
}

export function getEstimatedPricing(procedureName: string, country?: string): string {
  const pricing = findProcedurePricing(procedureName);
  if (!pricing) return '';
  
  if (country) {
    const countryPricing = getPricingForCountry(procedureName, country);
    if (countryPricing) {
      return `${formatPriceRange(countryPricing.low, countryPricing.high)} (saves ${countryPricing.savings} vs. US)`;
    }
  }
  
  // Return lowest available price across all countries
  const allPrices = Object.values(pricing.countries);
  const minLow = Math.min(...allPrices.map(p => p.low));
  const maxHigh = Math.max(...allPrices.map(p => p.high));
  
  return `${formatPriceRange(minLow, maxHigh)} abroad vs. ${formatPriceRange(pricing.usLow, pricing.usHigh)} US`;
}


