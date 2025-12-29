// Shared procedure database extracted from Treatment Guides
// Used by: Homepage Calculator, Treatment Guides, Facility Search

export interface ProcedureData {
  id: string;
  name: string;
  category: 'dental' | 'cosmetic' | 'cardiac' | 'orthopedic' | 'ivf' | 'eye' | 'stem-cell' | 'bariatric' | 'cancer' | 'wellness';
  categoryTitle: string;
  usaCost: string;
  usaCostMin: number; // For calculations
  usaCostMax: number;
  usaCostAvg: number;
  savings: string;
  description?: string;
  bestFor?: string;
  searchAliases?: string[]; // Common typos and alternate names
  globalCosts: Array<{
    country: string;
    cost: string;
    costMin: number;
    costMax: number;
    costAvg: number;
    city: string;
    note?: string;
  }>;
}

// Helper to parse cost strings for global costs
function parseGlobalCost(costStr: string): { costMin: number; costMax: number; costAvg: number } {
  const cleaned = costStr.replace(/\$/g, '').replace(/,/g, '');
  if (cleaned.includes('-')) {
    const [min, max] = cleaned.split('-').map(Number);
    return { costMin: min, costMax: max, costAvg: (min + max) / 2 };
  }
  const value = Number(cleaned);
  return { costMin: value, costMax: value, costAvg: value };
}

// Helper to parse cost strings for US costs
function parseUSCost(costStr: string): { usaCostMin: number; usaCostMax: number; usaCostAvg: number } {
  const cleaned = costStr.replace(/\$/g, '').replace(/,/g, '');
  if (cleaned.includes('-')) {
    const [min, max] = cleaned.split('-').map(Number);
    return { usaCostMin: min, usaCostMax: max, usaCostAvg: (min + max) / 2 };
  }
  const value = Number(cleaned);
  return { usaCostMin: value, usaCostMax: value, usaCostAvg: value };
}

export const procedures: ProcedureData[] = [
  // DENTAL & COSMETIC
  {
    id: 'full-mouth-restoration',
    name: 'Full Mouth Restoration',
    category: 'dental',
    categoryTitle: 'Dental & Cosmetic',
    usaCost: '$60,000',
    ...parseUSCost('$60,000'),
    savings: '80-85%',
    description: 'Complete dental reconstruction including implants, crowns, and cosmetic work.',
    bestFor: 'Los Algodones, Mexico - "Molar City" with 350+ dentists for 5,400 residents. Same-day return possible from Arizona.',
    globalCosts: [
      { country: 'Mexico', cost: '$8,000-12,000', ...parseGlobalCost('$8,000-12,000'), city: 'Los Algodones' },
      { country: 'Costa Rica', cost: '$10,000-15,000', ...parseGlobalCost('$10,000-15,000'), city: 'San José' },
      { country: 'Hungary', cost: '$9,000-13,000', ...parseGlobalCost('$9,000-13,000'), city: 'Budapest' },
      { country: 'Thailand', cost: '$12,000-18,000', ...parseGlobalCost('$12,000-18,000'), city: 'Bangkok' },
    ],
  },
  {
    id: 'all-on-4-implants',
    name: 'All-on-4 Implants',
    category: 'dental',
    categoryTitle: 'Dental & Cosmetic',
    usaCost: '$50,000',
    ...parseUSCost('$50,000'),
    savings: '75-83%',
    globalCosts: [
      { country: 'Mexico', cost: '$8,500', ...parseGlobalCost('$8,500'), city: 'Tijuana' },
      { country: 'Costa Rica', cost: '$12,000', ...parseGlobalCost('$12,000'), city: 'San José' },
      { country: 'Turkey', cost: '$9,000', ...parseGlobalCost('$9,000'), city: 'Istanbul' },
    ],
  },
  {
    id: 'dental-crown',
    name: 'Single Dental Crown',
    category: 'dental',
    categoryTitle: 'Dental & Cosmetic',
    usaCost: '$2,000',
    ...parseUSCost('$2,000'),
    savings: '87%',
    globalCosts: [
      { country: 'Mexico', cost: '$250', ...parseGlobalCost('$250'), city: 'Los Algodones' },
      { country: 'Costa Rica', cost: '$350', ...parseGlobalCost('$350'), city: 'San José' },
      { country: 'Hungary', cost: '$300', ...parseGlobalCost('$300'), city: 'Budapest' },
    ],
  },

  // COSMETIC SURGERY
  {
    id: 'bbl',
    name: 'Brazilian Butt Lift (BBL)',
    category: 'cosmetic',
    categoryTitle: 'Cosmetic Surgery',
    usaCost: '$12,000-15,000',
    ...parseUSCost('$12,000-15,000'),
    savings: '60-75%',
    globalCosts: [
      { country: 'Brazil', cost: '$4,500', ...parseGlobalCost('$4,500'), city: 'São Paulo', note: 'Where it was invented' },
      { country: 'Colombia', cost: '$4,000', ...parseGlobalCost('$4,000'), city: 'Medellín' },
      { country: 'Mexico', cost: '$5,500', ...parseGlobalCost('$5,500'), city: 'Tijuana' },
      { country: 'Dominican Republic', cost: '$3,500', ...parseGlobalCost('$3,500'), city: 'Santo Domingo' },
    ],
  },
  {
    id: 'hair-transplant',
    name: 'Hair Transplant (FUE)',
    category: 'cosmetic',
    categoryTitle: 'Cosmetic Surgery',
    usaCost: '$15,000-25,000',
    ...parseUSCost('$15,000-25,000'),
    savings: '80-90%',
    globalCosts: [
      { country: 'Turkey', cost: '$2,500-4,000', ...parseGlobalCost('$2,500-4,000'), city: 'Istanbul', note: 'World leader - 50x more procedures than US surgeons' },
      { country: 'India', cost: '$2,000', ...parseGlobalCost('$2,000'), city: 'Mumbai' },
      { country: 'Thailand', cost: '$3,500', ...parseGlobalCost('$3,500'), city: 'Bangkok' },
    ],
  },
  {
    id: 'facelift',
    name: 'Facelift',
    category: 'cosmetic',
    categoryTitle: 'Cosmetic Surgery',
    usaCost: '$20,000',
    ...parseUSCost('$20,000'),
    savings: '50-70%',
    globalCosts: [
      { country: 'South Korea', cost: '$6,000', ...parseGlobalCost('$6,000'), city: 'Seoul' },
      { country: 'Thailand', cost: '$8,000', ...parseGlobalCost('$8,000'), city: 'Bangkok' },
      { country: 'Mexico', cost: '$7,500', ...parseGlobalCost('$7,500'), city: 'Guadalajara' },
    ],
  },

  // CARDIAC SURGERY
  {
    id: 'heart-bypass',
    name: 'Heart Bypass (CABG)',
    category: 'cardiac',
    categoryTitle: 'Cardiac Surgery',
    usaCost: '$123,000',
    ...parseUSCost('$123,000'),
    savings: '85-94%',
    description: 'Coronary artery bypass graft surgery to restore blood flow to the heart.',
    bestFor: 'Dr. Devi Shetty\'s Narayana Health in Bangalore performs 30 heart surgeries daily with higher success rates than Cleveland Clinic at 1/15th the cost.',
    globalCosts: [
      { country: 'India', cost: '$7,900', ...parseGlobalCost('$7,900'), city: 'Bangalore', note: 'Narayana Health - 30 surgeries/day, 98.5% success rate' },
      { country: 'Thailand', cost: '$15,000', ...parseGlobalCost('$15,000'), city: 'Bangkok' },
      { country: 'Turkey', cost: '$11,000', ...parseGlobalCost('$11,000'), city: 'Istanbul' },
      { country: 'Mexico', cost: '$27,000', ...parseGlobalCost('$27,000'), city: 'Guadalajara' },
    ],
  },
  {
    id: 'heart-valve',
    name: 'Heart Valve Replacement',
    category: 'cardiac',
    categoryTitle: 'Cardiac Surgery',
    usaCost: '$170,000',
    ...parseUSCost('$170,000'),
    savings: '88-94%',
    globalCosts: [
      { country: 'India', cost: '$9,500', ...parseGlobalCost('$9,500'), city: 'Chennai' },
      { country: 'Thailand', cost: '$18,000', ...parseGlobalCost('$18,000'), city: 'Bangkok' },
      { country: 'Singapore', cost: '$32,000', ...parseGlobalCost('$32,000'), city: 'Singapore' },
    ],
  },
  {
    id: 'angioplasty',
    name: 'Angioplasty',
    category: 'cardiac',
    categoryTitle: 'Cardiac Surgery',
    usaCost: '$57,000',
    ...parseUSCost('$57,000'),
    savings: '84-94%',
    globalCosts: [
      { country: 'India', cost: '$3,300', ...parseGlobalCost('$3,300'), city: 'Delhi' },
      { country: 'Mexico', cost: '$9,500', ...parseGlobalCost('$9,500'), city: 'Monterrey' },
      { country: 'Malaysia', cost: '$6,800', ...parseGlobalCost('$6,800'), city: 'Kuala Lumpur' },
    ],
  },

  // ORTHOPEDIC SURGERY
  {
    id: 'hip-replacement',
    name: 'Hip Replacement',
    category: 'orthopedic',
    categoryTitle: 'Orthopedic Surgery',
    usaCost: '$40,364',
    ...parseUSCost('$40,364'),
    savings: '70-83%',
    description: 'Complete hip replacement surgery with implant, hospital stay, and physiotherapy included.',
    bestFor: 'Professional athletes frequently travel abroad for faster scheduling, superior stem cell options (FDA-banned in US), and more aggressive rehabilitation protocols.',
    globalCosts: [
      { country: 'India', cost: '$7,000', ...parseGlobalCost('$7,000'), city: 'Delhi' },
      { country: 'Mexico', cost: '$13,000', ...parseGlobalCost('$13,000'), city: 'Cancun' },
      { country: 'Thailand', cost: '$12,000', ...parseGlobalCost('$12,000'), city: 'Bangkok' },
      { country: 'Malaysia', cost: '$8,500', ...parseGlobalCost('$8,500'), city: 'Kuala Lumpur' },
    ],
  },
  {
    id: 'knee-replacement',
    name: 'Knee Replacement',
    category: 'orthopedic',
    categoryTitle: 'Orthopedic Surgery',
    usaCost: '$35,000',
    ...parseUSCost('$35,000'),
    savings: '75-81%',
    globalCosts: [
      { country: 'India', cost: '$6,600', ...parseGlobalCost('$6,600'), city: 'Mumbai' },
      { country: 'Malaysia', cost: '$7,500', ...parseGlobalCost('$7,500'), city: 'Penang' },
      { country: 'Colombia', cost: '$8,900', ...parseGlobalCost('$8,900'), city: 'Bogotá' },
    ],
  },
  {
    id: 'spinal-fusion',
    name: 'Spinal Fusion',
    category: 'orthopedic',
    categoryTitle: 'Orthopedic Surgery',
    usaCost: '$110,000',
    ...parseUSCost('$110,000'),
    savings: '85-91%',
    globalCosts: [
      { country: 'India', cost: '$10,000', ...parseGlobalCost('$10,000'), city: 'Chennai' },
      { country: 'Thailand', cost: '$17,000', ...parseGlobalCost('$17,000'), city: 'Bangkok' },
      { country: 'Turkey', cost: '$15,000', ...parseGlobalCost('$15,000'), city: 'Istanbul' },
    ],
  },

  // FERTILITY & IVF
  {
    id: 'ivf-cycle',
    name: 'IVF Cycle',
    category: 'ivf',
    categoryTitle: 'Fertility & IVF',
    usaCost: '$15,000-30,000',
    ...parseUSCost('$15,000-30,000'),
    savings: '70-90%',
    description: 'Complete IVF cycle including medications, monitoring, retrieval, and transfer.',
    bestFor: 'Czech Republic offers the highest success rates in Europe (45% under 35) with anonymous egg donation database and no waiting lists.',
    globalCosts: [
      { country: 'Czech Republic', cost: '$3,000', ...parseGlobalCost('$3,000'), city: 'Prague', note: '45% success rate under 35 vs USA 35%' },
      { country: 'Spain', cost: '$4,500-6,500', ...parseGlobalCost('$4,500-6,500'), city: 'Barcelona' },
      { country: 'Greece', cost: '$3,500', ...parseGlobalCost('$3,500'), city: 'Athens' },
      { country: 'Mexico', cost: '$4,900', ...parseGlobalCost('$4,900'), city: 'Cancun' },
      { country: 'India', cost: '$2,500', ...parseGlobalCost('$2,500'), city: 'Mumbai' },
    ],
  },
  {
    id: 'gender-selection-ivf',
    name: 'Gender Selection IVF',
    category: 'ivf',
    categoryTitle: 'Fertility & IVF',
    usaCost: '$20,000+',
    usaCostMin: 20000,
    usaCostMax: 30000,
    usaCostAvg: 25000,
    savings: '65-75%',
    globalCosts: [
      { country: 'Mexico', cost: '$7,000', ...parseGlobalCost('$7,000'), city: 'Guadalajara', note: 'Legal' },
      { country: 'Cyprus', cost: '$8,000', ...parseGlobalCost('$8,000'), city: 'Nicosia', note: 'Legal' },
    ],
  },
  {
    id: 'egg-donation',
    name: 'Egg Donation Cycle',
    category: 'ivf',
    categoryTitle: 'Fertility & IVF',
    usaCost: '$30,000-50,000',
    ...parseUSCost('$30,000-50,000'),
    savings: '80-90%',
    globalCosts: [
      { country: 'Spain', cost: '$8,000', ...parseGlobalCost('$8,000'), city: 'Madrid', note: '#1 globally - 50,000 procedures/year' },
      { country: 'Czech Republic', cost: '$4,500', ...parseGlobalCost('$4,500'), city: 'Prague', note: 'Anonymous only' },
      { country: 'Greece', cost: '$5,000', ...parseGlobalCost('$5,000'), city: 'Athens', note: 'Known or anonymous' },
    ],
  },

  // EYE SURGERY
  {
    id: 'lasik',
    name: 'LASIK Eye Surgery',
    category: 'eye',
    categoryTitle: 'Eye Surgery',
    usaCost: '$4,000-6,000',
    ...parseUSCost('$4,000-6,000'),
    savings: '70-85%',
    searchAliases: ['lasic', 'lasek', 'laser eye surgery', 'vision correction'],
    description: 'Laser-assisted in situ keratomileusis for vision correction.',
    bestFor: 'South Korea has most advanced LASIK technology with bladeless femtosecond lasers. Thailand combines expertise with medical vacation packages.',
    globalCosts: [
      { country: 'South Korea', cost: '$900-1,200', ...parseGlobalCost('$900-1,200'), city: 'Seoul', note: 'Most advanced tech' },
      { country: 'Thailand', cost: '$1,000-1,500', ...parseGlobalCost('$1,000-1,500'), city: 'Bangkok' },
      { country: 'India', cost: '$600-800', ...parseGlobalCost('$600-800'), city: 'Delhi' },
      { country: 'Mexico', cost: '$1,200', ...parseGlobalCost('$1,200'), city: 'Tijuana' },
    ],
  },
  {
    id: 'cataract-surgery',
    name: 'Cataract Surgery',
    category: 'eye',
    categoryTitle: 'Eye Surgery',
    usaCost: '$3,500-5,000',
    ...parseUSCost('$3,500-5,000'),
    savings: '75-85%',
    searchAliases: ['cataracts', 'lens replacement'],
    globalCosts: [
      { country: 'India', cost: '$800', ...parseGlobalCost('$800'), city: 'Mumbai', note: 'Aravind Eye Care - 500k surgeries/year' },
      { country: 'Thailand', cost: '$1,200', ...parseGlobalCost('$1,200'), city: 'Bangkok' },
      { country: 'Costa Rica', cost: '$1,500', ...parseGlobalCost('$1,500'), city: 'San José' },
    ],
  },
  {
    id: 'prk',
    name: 'PRK (Photorefractive Keratectomy)',
    category: 'eye',
    categoryTitle: 'Eye Surgery',
    usaCost: '$3,500-5,000',
    ...parseUSCost('$3,500-5,000'),
    savings: '70-80%',
    searchAliases: ['prk surgery', 'photorefractive'],
    globalCosts: [
      { country: 'South Korea', cost: '$800-1,000', ...parseGlobalCost('$800-1,000'), city: 'Seoul' },
      { country: 'Thailand', cost: '$900', ...parseGlobalCost('$900'), city: 'Bangkok' },
      { country: 'India', cost: '$500', ...parseGlobalCost('$500'), city: 'Chennai' },
    ],
  },

  // STEM CELL THERAPY
  {
    id: 'stem-cell-knee',
    name: 'Stem Cell Therapy for Knee',
    category: 'stem-cell',
    categoryTitle: 'Stem Cell Therapy',
    usaCost: '$5,000-10,000',
    ...parseUSCost('$5,000-10,000'),
    savings: '60-80%',
    searchAliases: ['stem cells', 'regenerative medicine', 'knee stem cell'],
    description: 'Mesenchymal stem cell injections for knee osteoarthritis and cartilage repair.',
    bestFor: 'Panama offers expanded umbilical cord MSC protocols FDA-banned in US. Mexico provides affordable same-passage cells with no wait.',
    globalCosts: [
      { country: 'Panama', cost: '$2,500-4,000', ...parseGlobalCost('$2,500-4,000'), city: 'Panama City', note: 'Expanded MSC protocols' },
      { country: 'Mexico', cost: '$3,000-5,000', ...parseGlobalCost('$3,000-5,000'), city: 'Tijuana' },
      { country: 'Colombia', cost: '$2,000', ...parseGlobalCost('$2,000'), city: 'Medellín' },
    ],
  },
  {
    id: 'stem-cell-anti-aging',
    name: 'Stem Cell Anti-Aging Therapy',
    category: 'stem-cell',
    categoryTitle: 'Stem Cell Therapy',
    usaCost: '$15,000-30,000',
    ...parseUSCost('$15,000-30,000'),
    savings: '60-75%',
    searchAliases: ['stem cell longevity', 'regenerative aging', 'youth therapy'],
    description: 'Full-body stem cell infusions for systemic rejuvenation and longevity.',
    bestFor: 'Panama and Switzerland lead in longevity protocols with wealthy clientele. Dubai offers luxury medical tourism packages.',
    globalCosts: [
      { country: 'Panama', cost: '$8,000-12,000', ...parseGlobalCost('$8,000-12,000'), city: 'Panama City' },
      { country: 'Switzerland', cost: '$12,000-18,000', ...parseGlobalCost('$12,000-18,000'), city: 'Zurich', note: 'Premium longevity clinics' },
      { country: 'Dubai', cost: '$10,000-15,000', ...parseGlobalCost('$10,000-15,000'), city: 'Dubai' },
    ],
  },
  {
    id: 'stem-cell-arthritis',
    name: 'Stem Cell Therapy for Arthritis',
    category: 'stem-cell',
    categoryTitle: 'Stem Cell Therapy',
    usaCost: '$7,000-12,000',
    ...parseUSCost('$7,000-12,000'),
    savings: '65-80%',
    searchAliases: ['arthritis stem cell', 'joint regeneration'],
    globalCosts: [
      { country: 'Mexico', cost: '$2,500-4,000', ...parseGlobalCost('$2,500-4,000'), city: 'Guadalajara' },
      { country: 'Colombia', cost: '$2,000-3,000', ...parseGlobalCost('$2,000-3,000'), city: 'Bogotá' },
      { country: 'Panama', cost: '$3,500', ...parseGlobalCost('$3,500'), city: 'Panama City' },
    ],
  },

  // BARIATRIC SURGERY
  {
    id: 'gastric-sleeve',
    name: 'Gastric Sleeve (VSG)',
    category: 'bariatric',
    categoryTitle: 'Bariatric Surgery',
    usaCost: '$17,000-26,000',
    ...parseUSCost('$17,000-26,000'),
    savings: '75-85%',
    searchAliases: ['sleeve gastrectomy', 'vsg', 'weight loss surgery'],
    description: 'Vertical sleeve gastrectomy for significant weight loss.',
    bestFor: 'Mexico dominates bariatric tourism with 40% of global market. Tijuana surgeons perform 100+ sleeves monthly with all-inclusive packages.',
    globalCosts: [
      { country: 'Mexico', cost: '$4,500-6,000', ...parseGlobalCost('$4,500-6,000'), city: 'Tijuana', note: '40% of global bariatric market' },
      { country: 'Turkey', cost: '$5,000-7,000', ...parseGlobalCost('$5,000-7,000'), city: 'Istanbul' },
      { country: 'Colombia', cost: '$5,500', ...parseGlobalCost('$5,500'), city: 'Barranquilla' },
    ],
  },
  {
    id: 'gastric-bypass',
    name: 'Gastric Bypass (RYGB)',
    category: 'bariatric',
    categoryTitle: 'Bariatric Surgery',
    usaCost: '$23,000-35,000',
    ...parseUSCost('$23,000-35,000'),
    savings: '75-85%',
    searchAliases: ['rygb', 'roux-en-y', 'bypass surgery'],
    globalCosts: [
      { country: 'Mexico', cost: '$6,000-8,000', ...parseGlobalCost('$6,000-8,000'), city: 'Tijuana' },
      { country: 'Turkey', cost: '$7,000-9,000', ...parseGlobalCost('$7,000-9,000'), city: 'Istanbul' },
      { country: 'India', cost: '$5,500', ...parseGlobalCost('$5,500'), city: 'Mumbai' },
    ],
  },
  {
    id: 'lap-band',
    name: 'Lap Band Surgery',
    category: 'bariatric',
    categoryTitle: 'Bariatric Surgery',
    usaCost: '$14,000-18,000',
    ...parseUSCost('$14,000-18,000'),
    savings: '70-80%',
    searchAliases: ['gastric band', 'adjustable band'],
    globalCosts: [
      { country: 'Mexico', cost: '$3,500-5,000', ...parseGlobalCost('$3,500-5,000'), city: 'Monterrey' },
      { country: 'Costa Rica', cost: '$6,000', ...parseGlobalCost('$6,000'), city: 'San José' },
    ],
  },

  // MORE COSMETIC
  {
    id: 'breast-augmentation',
    name: 'Breast Augmentation',
    category: 'cosmetic',
    categoryTitle: 'Cosmetic Surgery',
    usaCost: '$6,000-12,000',
    ...parseUSCost('$6,000-12,000'),
    savings: '60-75%',
    searchAliases: ['breast implants', 'boob job', 'augmentation'],
    globalCosts: [
      { country: 'Thailand', cost: '$3,000-4,500', ...parseGlobalCost('$3,000-4,500'), city: 'Bangkok' },
      { country: 'Mexico', cost: '$3,500-5,000', ...parseGlobalCost('$3,500-5,000'), city: 'Tijuana' },
      { country: 'Czech Republic', cost: '$3,200', ...parseGlobalCost('$3,200'), city: 'Prague' },
    ],
  },
  {
    id: 'liposuction',
    name: 'Liposuction',
    category: 'cosmetic',
    categoryTitle: 'Cosmetic Surgery',
    usaCost: '$5,000-10,000',
    ...parseUSCost('$5,000-10,000'),
    savings: '60-75%',
    searchAliases: ['lipo', 'fat removal', 'body contouring'],
    globalCosts: [
      { country: 'Mexico', cost: '$2,000-3,500', ...parseGlobalCost('$2,000-3,500'), city: 'Cancun' },
      { country: 'Colombia', cost: '$2,500-4,000', ...parseGlobalCost('$2,500-4,000'), city: 'Medellín' },
      { country: 'Thailand', cost: '$2,800', ...parseGlobalCost('$2,800'), city: 'Bangkok' },
    ],
  },
  {
    id: 'tummy-tuck',
    name: 'Tummy Tuck (Abdominoplasty)',
    category: 'cosmetic',
    categoryTitle: 'Cosmetic Surgery',
    usaCost: '$8,000-15,000',
    ...parseUSCost('$8,000-15,000'),
    savings: '65-75%',
    searchAliases: ['abdominoplasty', 'tummy tuck', 'abdominal surgery'],
    globalCosts: [
      { country: 'Mexico', cost: '$3,500-5,000', ...parseGlobalCost('$3,500-5,000'), city: 'Tijuana' },
      { country: 'Colombia', cost: '$3,000-4,500', ...parseGlobalCost('$3,000-4,500'), city: 'Cartagena' },
      { country: 'Thailand', cost: '$4,000', ...parseGlobalCost('$4,000'), city: 'Bangkok' },
    ],
  },
  {
    id: 'rhinoplasty',
    name: 'Rhinoplasty (Nose Job)',
    category: 'cosmetic',
    categoryTitle: 'Cosmetic Surgery',
    usaCost: '$8,000-15,000',
    ...parseUSCost('$8,000-15,000'),
    savings: '65-80%',
    searchAliases: ['nose job', 'nose surgery', 'rhino'],
    globalCosts: [
      { country: 'Iran', cost: '$1,500-2,500', ...parseGlobalCost('$1,500-2,500'), city: 'Tehran', note: 'World leader - 200k/year' },
      { country: 'South Korea', cost: '$3,000-4,500', ...parseGlobalCost('$3,000-4,500'), city: 'Seoul' },
      { country: 'Turkey', cost: '$2,500-3,500', ...parseGlobalCost('$2,500-3,500'), city: 'Istanbul' },
    ],
  },
  {
    id: 'mommy-makeover',
    name: 'Mommy Makeover',
    category: 'cosmetic',
    categoryTitle: 'Cosmetic Surgery',
    usaCost: '$15,000-25,000',
    ...parseUSCost('$15,000-25,000'),
    savings: '65-75%',
    searchAliases: ['post pregnancy surgery', 'mommy make over'],
    description: 'Combined breast lift/augmentation, tummy tuck, and liposuction.',
    globalCosts: [
      { country: 'Colombia', cost: '$6,000-9,000', ...parseGlobalCost('$6,000-9,000'), city: 'Medellín' },
      { country: 'Mexico', cost: '$7,000-10,000', ...parseGlobalCost('$7,000-10,000'), city: 'Guadalajara' },
      { country: 'Thailand', cost: '$8,000', ...parseGlobalCost('$8,000'), city: 'Bangkok' },
    ],
  },

  // MORE DENTAL
  {
    id: 'porcelain-veneers',
    name: 'Porcelain Veneers (Full Set)',
    category: 'dental',
    categoryTitle: 'Dental & Cosmetic',
    usaCost: '$15,000-25,000',
    ...parseUSCost('$15,000-25,000'),
    savings: '70-85%',
    searchAliases: ['veneers', 'dental veneers', 'smile makeover'],
    globalCosts: [
      { country: 'Mexico', cost: '$3,000-5,000', ...parseGlobalCost('$3,000-5,000'), city: 'Los Algodones' },
      { country: 'Turkey', cost: '$2,500-4,000', ...parseGlobalCost('$2,500-4,000'), city: 'Istanbul' },
      { country: 'Hungary', cost: '$3,500', ...parseGlobalCost('$3,500'), city: 'Budapest' },
    ],
  },
  {
    id: 'root-canal',
    name: 'Root Canal',
    category: 'dental',
    categoryTitle: 'Dental & Cosmetic',
    usaCost: '$1,500-2,000',
    ...parseUSCost('$1,500-2,000'),
    savings: '75-85%',
    searchAliases: ['root canal therapy', 'endodontic treatment'],
    globalCosts: [
      { country: 'Mexico', cost: '$250-350', ...parseGlobalCost('$250-350'), city: 'Los Algodones' },
      { country: 'Costa Rica', cost: '$300', ...parseGlobalCost('$300'), city: 'San José' },
      { country: 'Thailand', cost: '$280', ...parseGlobalCost('$280'), city: 'Bangkok' },
    ],
  },

  // MORE ORTHOPEDIC
  {
    id: 'acl-reconstruction',
    name: 'ACL Reconstruction',
    category: 'orthopedic',
    categoryTitle: 'Orthopedic Surgery',
    usaCost: '$20,000-50,000',
    ...parseUSCost('$20,000-50,000'),
    savings: '75-85%',
    searchAliases: ['acl surgery', 'knee ligament', 'acl repair'],
    globalCosts: [
      { country: 'India', cost: '$4,000-6,000', ...parseGlobalCost('$4,000-6,000'), city: 'Bangalore' },
      { country: 'Thailand', cost: '$7,000', ...parseGlobalCost('$7,000'), city: 'Bangkok' },
      { country: 'Mexico', cost: '$8,000', ...parseGlobalCost('$8,000'), city: 'Monterrey' },
    ],
  },
  {
    id: 'rotator-cuff',
    name: 'Rotator Cuff Repair',
    category: 'orthopedic',
    categoryTitle: 'Orthopedic Surgery',
    usaCost: '$15,000-30,000',
    ...parseUSCost('$15,000-30,000'),
    savings: '70-80%',
    searchAliases: ['shoulder surgery', 'rotator cuff surgery'],
    globalCosts: [
      { country: 'India', cost: '$3,500-5,000', ...parseGlobalCost('$3,500-5,000'), city: 'Chennai' },
      { country: 'Thailand', cost: '$6,000', ...parseGlobalCost('$6,000'), city: 'Bangkok' },
      { country: 'Malaysia', cost: '$5,000', ...parseGlobalCost('$5,000'), city: 'Kuala Lumpur' },
    ],
  },

  // CANCER TREATMENT
  {
    id: 'proton-therapy',
    name: 'Proton Therapy (Cancer)',
    category: 'cancer',
    categoryTitle: 'Cancer Treatment',
    usaCost: '$150,000-200,000',
    ...parseUSCost('$150,000-200,000'),
    savings: '60-75%',
    searchAliases: ['proton beam', 'radiation therapy', 'cancer treatment'],
    description: 'Advanced radiation therapy with reduced side effects.',
    bestFor: 'Czech Republic offers latest Varian ProBeam technology at 1/3 US cost. Japan invented proton therapy and has 20+ centers.',
    globalCosts: [
      { country: 'Czech Republic', cost: '$50,000-70,000', ...parseGlobalCost('$50,000-70,000'), city: 'Prague', note: 'Latest Varian tech' },
      { country: 'Japan', cost: '$60,000-80,000', ...parseGlobalCost('$60,000-80,000'), city: 'Tokyo' },
      { country: 'South Korea', cost: '$55,000', ...parseGlobalCost('$55,000'), city: 'Seoul' },
    ],
  },
  {
    id: 'immunotherapy',
    name: 'Cancer Immunotherapy',
    category: 'cancer',
    categoryTitle: 'Cancer Treatment',
    usaCost: '$100,000-300,000',
    ...parseUSCost('$100,000-300,000'),
    savings: '60-80%',
    searchAliases: ['immune therapy', 'car-t', 'checkpoint inhibitors'],
    globalCosts: [
      { country: 'India', cost: '$30,000-60,000', ...parseGlobalCost('$30,000-60,000'), city: 'Mumbai', note: 'Clinical trials available' },
      { country: 'Singapore', cost: '$40,000-80,000', ...parseGlobalCost('$40,000-80,000'), city: 'Singapore' },
      { country: 'Germany', cost: '$50,000-100,000', ...parseGlobalCost('$50,000-100,000'), city: 'Munich' },
    ],
  },

  // WELLNESS & LONGEVITY
  {
    id: 'nad-therapy',
    name: 'NAD+ IV Therapy',
    category: 'wellness',
    categoryTitle: 'Wellness & Longevity',
    usaCost: '$1,000-2,500',
    ...parseUSCost('$1,000-2,500'),
    savings: '60-75%',
    searchAliases: ['nad+', 'nad plus', 'longevity therapy'],
    description: 'Intravenous nicotinamide adenine dinucleotide for cellular rejuvenation.',
    globalCosts: [
      { country: 'Mexico', cost: '$300-600', ...parseGlobalCost('$300-600'), city: 'Tijuana' },
      { country: 'Thailand', cost: '$400-700', ...parseGlobalCost('$400-700'), city: 'Bangkok' },
      { country: 'Panama', cost: '$500', ...parseGlobalCost('$500'), city: 'Panama City' },
    ],
  },
  {
    id: 'peptide-therapy',
    name: 'Peptide Therapy Protocols',
    category: 'wellness',
    categoryTitle: 'Wellness & Longevity',
    usaCost: '$3,000-8,000',
    ...parseUSCost('$3,000-8,000'),
    savings: '60-70%',
    searchAliases: ['peptides', 'bpc-157', 'growth hormone peptides'],
    description: 'Customized peptide protocols for recovery, longevity, and performance.',
    globalCosts: [
      { country: 'Mexico', cost: '$1,200-2,500', ...parseGlobalCost('$1,200-2,500'), city: 'Puerto Vallarta' },
      { country: 'Costa Rica', cost: '$1,500-3,000', ...parseGlobalCost('$1,500-3,000'), city: 'San José' },
      { country: 'Colombia', cost: '$1,000-2,000', ...parseGlobalCost('$1,000-2,000'), city: 'Medellín' },
    ],
  },
];

// Helper function to search procedures with fuzzy matching
export function searchProcedures(query: string): ProcedureData[] {
  if (!query || query.length < 2) return [];

  const lowerQuery = query.toLowerCase().trim();

  // Score each procedure based on match quality
  const scored = procedures.map(p => {
    let score = 0;
    const nameLower = p.name.toLowerCase();
    const categoryLower = p.categoryTitle.toLowerCase();

    // Exact match in name (highest priority)
    if (nameLower === lowerQuery) {
      score += 100;
    }
    // Starts with query
    else if (nameLower.startsWith(lowerQuery)) {
      score += 50;
    }
    // Contains query
    else if (nameLower.includes(lowerQuery)) {
      score += 30;
    }

    // Check aliases for typos and alternate names
    if (p.searchAliases) {
      for (const alias of p.searchAliases) {
        const aliasLower = alias.toLowerCase();
        if (aliasLower === lowerQuery) {
          score += 90;
        } else if (aliasLower.startsWith(lowerQuery)) {
          score += 40;
        } else if (aliasLower.includes(lowerQuery)) {
          score += 25;
        }
      }
    }

    // Category match (lower priority)
    if (categoryLower.includes(lowerQuery)) {
      score += 15;
    }

    // Description match (lowest priority)
    if (p.description && p.description.toLowerCase().includes(lowerQuery)) {
      score += 10;
    }

    return { procedure: p, score };
  });

  // Filter out zero scores and sort by score descending
  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(s => s.procedure);
}

// Get procedure by ID
export function getProcedureById(id: string): ProcedureData | undefined {
  return procedures.find(p => p.id === id);
}

// Get CHEAPEST global cost (for "Save UP TO" marketing)
export function getCheapestGlobalCost(procedure: ProcedureData): number {
  const cheapest = Math.min(...procedure.globalCosts.map(loc => loc.costMin));
  return cheapest;
}

// Get average global cost for a procedure
export function getAverageGlobalCost(procedure: ProcedureData): number {
  const avg = procedure.globalCosts.reduce((sum, loc) => sum + loc.costAvg, 0) / procedure.globalCosts.length;
  return Math.round(avg);
}

// Calculate savings
export function calculateSavings(usaCost: number, globalCost: number): {
  amount: number;
  percentage: number;
} {
  const amount = usaCost - globalCost;
  const percentage = Math.round((amount / usaCost) * 100);
  return { amount, percentage };
}
