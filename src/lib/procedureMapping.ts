/**
 * Procedure Mapping
 *
 * Maps Oasara procedure names to CPT codes for US price comparison
 * CPT codes are standardized billing codes used by US hospitals
 */

// Map common procedure names to CPT codes
export const PROCEDURE_CPT_MAP: Record<string, string> = {
  // Orthopedic
  'hip replacement': '27130',
  'total hip replacement': '27130',
  'hip arthroplasty': '27130',
  'knee replacement': '27447',
  'total knee replacement': '27447',
  'knee arthroplasty': '27447',
  'shoulder replacement': '23472',
  'spinal fusion': '22551',
  'spine fusion': '22551',
  'back surgery': '22551',
  'acl reconstruction': '29888',
  'rotator cuff repair': '23412',

  // Cardiac
  'heart bypass': '33533',
  'cabg': '33533',
  'coronary bypass': '33533',
  'heart valve replacement': '33405',
  'valve replacement': '33405',
  'cardiac catheterization': '93458',
  'heart catheterization': '93458',
  'pacemaker': '33208',
  'angioplasty': '92928',

  // Imaging
  'mri': '70553',
  'brain mri': '70553',
  'mri brain': '70553',
  'head mri': '70553',
  'spine mri': '72148',
  'knee mri': '73721',
  'ct scan': '74177',
  'abdominal ct': '74177',
  'chest ct': '71250',
  'pet scan': '78815',
  'ultrasound': '76700',
  'mammogram': '77067',
  'x-ray': '71046',
  'chest x-ray': '71046',

  // Gastroenterology
  'colonoscopy': '45378',
  'endoscopy': '43239',
  'upper endoscopy': '43239',
  'gastroscopy': '43239',

  // Obstetrics
  'c-section': '59510',
  'cesarean': '59510',
  'cesarean section': '59510',
  'vaginal delivery': '59400',
  'childbirth': '59400',

  // General Surgery
  'gallbladder removal': '47562',
  'cholecystectomy': '47562',
  'appendectomy': '44970',
  'hernia repair': '49650',
  'hysterectomy': '58150',

  // Cancer
  'mastectomy': '19303',
  'breast cancer surgery': '19303',
  'prostatectomy': '55866',
  'tumor removal': '21015',

  // Dental
  'dental implant': 'D6010',
  'dental implants': 'D6010',
  'teeth whitening': 'D9972',
  'dental crown': 'D2740',
  'root canal': 'D3310',

  // Cosmetic
  'liposuction': '15876',
  'rhinoplasty': '30400',
  'nose job': '30400',
  'facelift': '15828',
  'breast augmentation': '19325',
  'tummy tuck': '15830',
  'abdominoplasty': '15830',
  'hair transplant': '15776',

  // Eye
  'lasik': '66984',
  'cataract surgery': '66984',
  'cataract': '66984',

  // Lab
  'blood test': '80053',
  'metabolic panel': '80053',
  'blood work': '80053',
  'cbc': '85025',
  'complete blood count': '85025',
};

// Category groupings for procedures
export const PROCEDURE_CATEGORIES: Record<string, string[]> = {
  'Orthopedic': [
    'hip replacement', 'knee replacement', 'shoulder replacement',
    'spinal fusion', 'acl reconstruction', 'rotator cuff repair'
  ],
  'Cardiac': [
    'heart bypass', 'heart valve replacement', 'cardiac catheterization',
    'pacemaker', 'angioplasty'
  ],
  'Imaging': [
    'mri', 'ct scan', 'pet scan', 'ultrasound', 'mammogram', 'x-ray'
  ],
  'Gastroenterology': ['colonoscopy', 'endoscopy'],
  'Obstetrics': ['c-section', 'vaginal delivery'],
  'General Surgery': [
    'gallbladder removal', 'appendectomy', 'hernia repair', 'hysterectomy'
  ],
  'Cosmetic': [
    'liposuction', 'rhinoplasty', 'facelift', 'breast augmentation',
    'tummy tuck', 'hair transplant'
  ],
  'Eye': ['lasik', 'cataract surgery'],
};

/**
 * Find CPT code for a procedure name
 * Uses fuzzy matching for flexibility
 */
export function findCPTCode(procedureName: string): string | null {
  const normalized = procedureName.toLowerCase().trim();

  // Direct match
  if (PROCEDURE_CPT_MAP[normalized]) {
    return PROCEDURE_CPT_MAP[normalized];
  }

  // Partial match
  for (const [key, code] of Object.entries(PROCEDURE_CPT_MAP)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return code;
    }
  }

  // Word-by-word match
  const words = normalized.split(/\s+/);
  for (const word of words) {
    if (word.length < 3) continue;
    for (const [key, code] of Object.entries(PROCEDURE_CPT_MAP)) {
      if (key.includes(word)) {
        return code;
      }
    }
  }

  return null;
}

/**
 * Get procedure category
 */
export function getProcedureCategory(procedureName: string): string | null {
  const normalized = procedureName.toLowerCase().trim();

  for (const [category, procedures] of Object.entries(PROCEDURE_CATEGORIES)) {
    for (const proc of procedures) {
      if (normalized.includes(proc) || proc.includes(normalized)) {
        return category;
      }
    }
  }

  return null;
}

/**
 * Check if procedure is commonly sought for medical tourism
 */
export function isMedicalTourismProcedure(procedureName: string): boolean {
  const highValueProcedures = [
    'hip replacement', 'knee replacement', 'heart bypass', 'dental implant',
    'liposuction', 'rhinoplasty', 'lasik', 'hair transplant', 'ivf',
    'gastric bypass', 'gastric sleeve'
  ];

  const normalized = procedureName.toLowerCase();
  return highValueProcedures.some(proc => normalized.includes(proc));
}

/**
 * Get typical savings range for medical tourism
 */
export function getTypicalSavingsRange(procedureName: string): { min: number; max: number } | null {
  const normalized = procedureName.toLowerCase();

  // Major surgeries typically save 50-80%
  if (['replacement', 'bypass', 'surgery', 'fusion'].some(s => normalized.includes(s))) {
    return { min: 50, max: 80 };
  }

  // Cosmetic typically saves 40-70%
  if (['lipo', 'rhino', 'facelift', 'augmentation', 'transplant'].some(s => normalized.includes(s))) {
    return { min: 40, max: 70 };
  }

  // Dental typically saves 50-70%
  if (['dental', 'implant', 'crown', 'root'].some(s => normalized.includes(s))) {
    return { min: 50, max: 70 };
  }

  // Imaging typically saves 30-50%
  if (['mri', 'ct', 'scan', 'x-ray', 'mammogram'].some(s => normalized.includes(s))) {
    return { min: 30, max: 50 };
  }

  return { min: 30, max: 70 };
}
