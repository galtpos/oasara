// Medical Trust Laws - Type Definitions

export interface CriterionScore {
  score: number; // 1-10 scale
  summary: string;
  details: string;
}

export interface SelfSettledTrustsCriterion extends CriterionScore {
  allowed: boolean;
}

export interface StatuteOfLimitationsCriterion extends CriterionScore {
  years: number | null; // null = no limit or varies
}

export interface TaxTreatmentCriterion extends CriterionScore {
  hasStateTax: boolean;
  incomeRate?: string;
}

export interface StateTrustLaw {
  state: string;
  stateCode: string; // Two-letter code (e.g., "SD", "NV")
  overallScore: number; // 1-10 favorability
  tier: 'top' | 'favorable' | 'moderate' | 'limited'; // Quick categorization
  lastUpdated: string; // ISO date string
  sourceUrls: string[];
  highlights: string[]; // Key points for quick scanning
  criteria: {
    assetProtection: CriterionScore;
    selfSettledTrusts: SelfSettledTrustsCriterion;
    statuteOfLimitations: StatuteOfLimitationsCriterion;
    domesticForeignRules: CriterionScore;
    taxTreatment: TaxTreatmentCriterion;
    spendthriftProvisions: CriterionScore;
    privacyProtections: CriterionScore;
    healthcareSpecific: CriterionScore;
  };
}

export type CriteriaKey = keyof StateTrustLaw['criteria'];

export const CRITERIA_LABELS: Record<CriteriaKey, { label: string; description: string }> = {
  assetProtection: {
    label: 'Asset Protection',
    description: 'Strength of laws protecting trust assets from creditors'
  },
  selfSettledTrusts: {
    label: 'Self-Settled Trusts',
    description: 'Whether the grantor can also be a beneficiary (DAPT)'
  },
  statuteOfLimitations: {
    label: 'Statute of Limitations',
    description: 'Time limit for creditors to challenge trust transfers'
  },
  domesticForeignRules: {
    label: 'Domestic/Foreign Rules',
    description: 'Flexibility with out-of-state and international trust matters'
  },
  taxTreatment: {
    label: 'Tax Treatment',
    description: 'State income tax treatment of trust income and assets'
  },
  spendthriftProvisions: {
    label: 'Spendthrift Provisions',
    description: 'Protections preventing beneficiaries from assigning interests'
  },
  privacyProtections: {
    label: 'Privacy Protections',
    description: 'Confidentiality of trust documents and proceedings'
  },
  healthcareSpecific: {
    label: 'Healthcare Provisions',
    description: 'Special provisions for medical and healthcare trusts'
  }
};

// Color scale helper
export const getScoreColor = (score: number): string => {
  if (score >= 8) return '#16a34a'; // green-600
  if (score >= 6) return '#84cc16'; // lime-500
  if (score >= 4) return '#eab308'; // yellow-500
  if (score >= 2) return '#f97316'; // orange-500
  return '#ef4444'; // red-500
};

export const getScoreGradient = (score: number): string => {
  if (score >= 8) return 'from-emerald-500 to-emerald-600';
  if (score >= 6) return 'from-lime-500 to-lime-600';
  if (score >= 4) return 'from-yellow-500 to-yellow-600';
  if (score >= 2) return 'from-orange-500 to-orange-600';
  return 'from-red-500 to-red-600';
};

export const getTierLabel = (tier: StateTrustLaw['tier']): string => {
  switch (tier) {
    case 'top': return 'Top Tier';
    case 'favorable': return 'Favorable';
    case 'moderate': return 'Moderate';
    case 'limited': return 'Limited';
  }
};

export const getTierColor = (tier: StateTrustLaw['tier']): string => {
  switch (tier) {
    case 'top': return 'bg-emerald-500';
    case 'favorable': return 'bg-lime-500';
    case 'moderate': return 'bg-yellow-500';
    case 'limited': return 'bg-orange-500';
  }
};

