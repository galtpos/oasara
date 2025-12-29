// Comprehensive Medical Tourism Procedures Database
// Organized by category for easy searching and filtering

export interface Procedure {
  name: string;
  category: string;
  keywords?: string[];
}

export const PROCEDURE_CATEGORIES = {
  ORTHOPEDIC: 'Orthopedic',
  DENTAL: 'Dental',
  CARDIAC: 'Cardiac',
  COSMETIC: 'Cosmetic',
  BARIATRIC: 'Bariatric',
  EYE: 'Eye Care',
  FERTILITY: 'Fertility',
  CANCER: 'Cancer Treatment',
  SPINE: 'Spine',
  GENERAL: 'General Surgery',
  WOMENS_HEALTH: "Women's Health",
  MENS_HEALTH: "Men's Health",
  ENT: 'ENT',
  NEUROSURGERY: 'Neurosurgery',
  UROLOGY: 'Urology',
  GASTRO: 'Gastroenterology',
  TRANSPLANT: 'Transplant',
  DIAGNOSTIC: 'Diagnostic',
  OTHER: 'Other'
};

export const ALL_PROCEDURES: Procedure[] = [
  // ORTHOPEDIC (Joint Replacement, Sports Medicine)
  { name: 'Hip Replacement', category: 'Orthopedic', keywords: ['hip', 'joint', 'replacement', 'arthroplasty'] },
  { name: 'Knee Replacement', category: 'Orthopedic', keywords: ['knee', 'joint', 'replacement', 'arthroplasty'] },
  { name: 'Shoulder Replacement', category: 'Orthopedic', keywords: ['shoulder', 'joint', 'replacement'] },
  { name: 'Ankle Replacement', category: 'Orthopedic', keywords: ['ankle', 'joint', 'replacement'] },
  { name: 'ACL Reconstruction', category: 'Orthopedic', keywords: ['acl', 'knee', 'ligament', 'sports'] },
  { name: 'Rotator Cuff Repair', category: 'Orthopedic', keywords: ['rotator', 'shoulder', 'sports'] },
  { name: 'Arthroscopy', category: 'Orthopedic', keywords: ['arthroscopy', 'joint', 'knee', 'shoulder'] },
  { name: 'Hip Resurfacing', category: 'Orthopedic', keywords: ['hip', 'resurfacing'] },
  { name: 'Spinal Fusion', category: 'Orthopedic', keywords: ['spine', 'fusion', 'back'] },

  // DENTAL (Full spectrum of dental work)
  { name: 'Dental Implants', category: 'Dental', keywords: ['dental', 'implant', 'tooth', 'teeth'] },
  { name: 'All-on-4 Dental Implants', category: 'Dental', keywords: ['all on 4', 'full arch', 'dental'] },
  { name: 'Dental Veneers', category: 'Dental', keywords: ['veneer', 'cosmetic', 'teeth'] },
  { name: 'Dental Crowns', category: 'Dental', keywords: ['crown', 'cap', 'tooth'] },
  { name: 'Dental Bridges', category: 'Dental', keywords: ['bridge', 'dental'] },
  { name: 'Root Canal', category: 'Dental', keywords: ['root canal', 'endodontic'] },
  { name: 'Teeth Whitening', category: 'Dental', keywords: ['whitening', 'bleaching', 'cosmetic'] },
  { name: 'Orthodontics / Braces', category: 'Dental', keywords: ['braces', 'orthodontic', 'invisalign'] },
  { name: 'Full Mouth Reconstruction', category: 'Dental', keywords: ['full mouth', 'reconstruction', 'smile makeover'] },
  { name: 'Gum Surgery', category: 'Dental', keywords: ['gum', 'periodontal', 'gingivectomy'] },

  // CARDIAC (Heart procedures)
  { name: 'Cardiac Surgery', category: 'Cardiac', keywords: ['heart', 'cardiac', 'surgery'] },
  { name: 'Coronary Artery Bypass (CABG)', category: 'Cardiac', keywords: ['bypass', 'cabg', 'heart'] },
  { name: 'Heart Valve Replacement', category: 'Cardiac', keywords: ['valve', 'heart', 'replacement'] },
  { name: 'Angioplasty', category: 'Cardiac', keywords: ['angioplasty', 'stent', 'heart'] },
  { name: 'Pacemaker Implantation', category: 'Cardiac', keywords: ['pacemaker', 'heart', 'device'] },
  { name: 'Cardiac Ablation', category: 'Cardiac', keywords: ['ablation', 'heart', 'arrhythmia'] },

  // COSMETIC (Plastic Surgery)
  { name: 'Cosmetic Surgery', category: 'Cosmetic', keywords: ['cosmetic', 'plastic', 'aesthetic'] },
  { name: 'Breast Augmentation', category: 'Cosmetic', keywords: ['breast', 'augmentation', 'implants', 'boob job'] },
  { name: 'Breast Reduction', category: 'Cosmetic', keywords: ['breast', 'reduction'] },
  { name: 'Breast Lift', category: 'Cosmetic', keywords: ['breast', 'lift', 'mastopexy'] },
  { name: 'Tummy Tuck', category: 'Cosmetic', keywords: ['tummy tuck', 'abdominoplasty', 'stomach'] },
  { name: 'Liposuction', category: 'Cosmetic', keywords: ['liposuction', 'lipo', 'fat removal'] },
  { name: 'Brazilian Butt Lift', category: 'Cosmetic', keywords: ['bbl', 'butt lift', 'brazilian'] },
  { name: 'Facelift', category: 'Cosmetic', keywords: ['facelift', 'rhytidectomy'] },
  { name: 'Rhinoplasty', category: 'Cosmetic', keywords: ['rhinoplasty', 'nose job', 'nose'] },
  { name: 'Eyelid Surgery', category: 'Cosmetic', keywords: ['eyelid', 'blepharoplasty'] },
  { name: 'Brow Lift', category: 'Cosmetic', keywords: ['brow', 'forehead', 'lift'] },
  { name: 'Neck Lift', category: 'Cosmetic', keywords: ['neck', 'lift'] },
  { name: 'Arm Lift', category: 'Cosmetic', keywords: ['arm', 'lift', 'brachioplasty'] },
  { name: 'Thigh Lift', category: 'Cosmetic', keywords: ['thigh', 'lift'] },
  { name: 'Mommy Makeover', category: 'Cosmetic', keywords: ['mommy', 'makeover', 'post pregnancy'] },
  { name: 'Hair Transplant', category: 'Cosmetic', keywords: ['hair', 'transplant', 'restoration', 'fue'] },
  { name: 'Botox / Fillers', category: 'Cosmetic', keywords: ['botox', 'filler', 'injectable', 'juvederm'] },
  { name: 'Laser Skin Resurfacing', category: 'Cosmetic', keywords: ['laser', 'skin', 'resurfacing'] },

  // BARIATRIC (Weight Loss)
  { name: 'Bariatric Surgery', category: 'Bariatric', keywords: ['bariatric', 'weight loss'] },
  { name: 'Gastric Bypass', category: 'Bariatric', keywords: ['gastric bypass', 'roux-en-y', 'weight loss'] },
  { name: 'Gastric Sleeve', category: 'Bariatric', keywords: ['gastric sleeve', 'sleeve gastrectomy', 'weight loss'] },
  { name: 'Lap Band Surgery', category: 'Bariatric', keywords: ['lap band', 'gastric band', 'weight loss'] },
  { name: 'Duodenal Switch', category: 'Bariatric', keywords: ['duodenal switch', 'weight loss'] },

  // EYE CARE (Vision correction, cataracts)
  { name: 'Cataract Surgery', category: 'Eye Care', keywords: ['cataract', 'eye', 'vision'] },
  { name: 'LASIK Eye Surgery', category: 'Eye Care', keywords: ['lasik', 'eye', 'vision', 'laser'] },
  { name: 'PRK Eye Surgery', category: 'Eye Care', keywords: ['prk', 'eye', 'vision'] },
  { name: 'Glaucoma Surgery', category: 'Eye Care', keywords: ['glaucoma', 'eye'] },
  { name: 'Retinal Surgery', category: 'Eye Care', keywords: ['retina', 'retinal', 'eye'] },
  { name: 'Corneal Transplant', category: 'Eye Care', keywords: ['cornea', 'transplant', 'eye'] },

  // FERTILITY (IVF, reproductive health)
  { name: 'IVF Treatment', category: 'Fertility', keywords: ['ivf', 'fertility', 'in vitro', 'infertility'] },
  { name: 'IUI Treatment', category: 'Fertility', keywords: ['iui', 'insemination', 'fertility'] },
  { name: 'Egg Freezing', category: 'Fertility', keywords: ['egg', 'freezing', 'fertility'] },
  { name: 'Surrogacy', category: 'Fertility', keywords: ['surrogacy', 'surrogate', 'fertility'] },
  { name: 'Fertility Testing', category: 'Fertility', keywords: ['fertility', 'testing', 'diagnosis'] },

  // CANCER TREATMENT (Oncology)
  { name: 'Cancer Treatment', category: 'Cancer Treatment', keywords: ['cancer', 'oncology', 'tumor'] },
  { name: 'Chemotherapy', category: 'Cancer Treatment', keywords: ['chemotherapy', 'chemo', 'cancer'] },
  { name: 'Radiation Therapy', category: 'Cancer Treatment', keywords: ['radiation', 'therapy', 'cancer'] },
  { name: 'Proton Therapy', category: 'Cancer Treatment', keywords: ['proton', 'therapy', 'cancer'] },
  { name: 'Immunotherapy', category: 'Cancer Treatment', keywords: ['immunotherapy', 'cancer'] },
  { name: 'Tumor Removal', category: 'Cancer Treatment', keywords: ['tumor', 'removal', 'resection', 'cancer'] },
  { name: 'Breast Cancer Surgery', category: 'Cancer Treatment', keywords: ['breast', 'cancer', 'mastectomy'] },
  { name: 'Prostate Cancer Treatment', category: 'Cancer Treatment', keywords: ['prostate', 'cancer'] },

  // SPINE (Back and neck)
  { name: 'Spine Surgery', category: 'Spine', keywords: ['spine', 'spinal', 'back'] },
  { name: 'Disc Replacement', category: 'Spine', keywords: ['disc', 'disk', 'replacement', 'spine'] },
  { name: 'Laminectomy', category: 'Spine', keywords: ['laminectomy', 'spine', 'decompression'] },
  { name: 'Microdiscectomy', category: 'Spine', keywords: ['microdiscectomy', 'herniated disc', 'spine'] },
  { name: 'Scoliosis Surgery', category: 'Spine', keywords: ['scoliosis', 'spine', 'curvature'] },

  // GENERAL SURGERY
  { name: 'Hernia Repair', category: 'General Surgery', keywords: ['hernia', 'repair'] },
  { name: 'Gallbladder Removal', category: 'General Surgery', keywords: ['gallbladder', 'cholecystectomy'] },
  { name: 'Appendectomy', category: 'General Surgery', keywords: ['appendix', 'appendectomy'] },
  { name: 'Thyroid Surgery', category: 'General Surgery', keywords: ['thyroid', 'thyroidectomy'] },
  { name: 'Hemorrhoid Surgery', category: 'General Surgery', keywords: ['hemorrhoid', 'piles'] },

  // WOMEN'S HEALTH
  { name: 'Hysterectomy', category: "Women's Health", keywords: ['hysterectomy', 'uterus', 'women'] },
  { name: 'Fibroid Removal', category: "Women's Health", keywords: ['fibroid', 'myomectomy', 'women'] },
  { name: 'Endometriosis Surgery', category: "Women's Health", keywords: ['endometriosis', 'women'] },
  { name: 'Ovarian Cyst Removal', category: "Women's Health", keywords: ['ovarian', 'cyst', 'women'] },
  { name: 'Cesarean Section', category: "Women's Health", keywords: ['c-section', 'cesarean', 'birth'] },

  // MEN'S HEALTH
  { name: 'Prostate Surgery', category: "Men's Health", keywords: ['prostate', 'men', 'bph'] },
  { name: 'Vasectomy', category: "Men's Health", keywords: ['vasectomy', 'men', 'sterilization'] },
  { name: 'Vasectomy Reversal', category: "Men's Health", keywords: ['vasectomy', 'reversal', 'men'] },
  { name: 'Penile Implant', category: "Men's Health", keywords: ['penile', 'implant', 'ed', 'men'] },

  // ENT (Ear, Nose, Throat)
  { name: 'Tonsillectomy', category: 'ENT', keywords: ['tonsil', 'tonsillectomy', 'throat'] },
  { name: 'Septoplasty', category: 'ENT', keywords: ['septoplasty', 'septum', 'nose', 'deviated'] },
  { name: 'Sinus Surgery', category: 'ENT', keywords: ['sinus', 'sinusitis', 'nose'] },
  { name: 'Cochlear Implant', category: 'ENT', keywords: ['cochlear', 'implant', 'hearing', 'ear'] },
  { name: 'Sleep Apnea Surgery', category: 'ENT', keywords: ['sleep apnea', 'uppp', 'snoring'] },

  // NEUROSURGERY (Brain and nervous system)
  { name: 'Brain Tumor Surgery', category: 'Neurosurgery', keywords: ['brain', 'tumor', 'neurosurgery'] },
  { name: 'Aneurysm Repair', category: 'Neurosurgery', keywords: ['aneurysm', 'brain', 'neurosurgery'] },
  { name: 'Deep Brain Stimulation', category: 'Neurosurgery', keywords: ['dbs', 'deep brain', 'parkinson'] },
  { name: 'Epilepsy Surgery', category: 'Neurosurgery', keywords: ['epilepsy', 'seizure', 'brain'] },

  // UROLOGY (Kidney, bladder)
  { name: 'Kidney Stone Removal', category: 'Urology', keywords: ['kidney', 'stone', 'lithotripsy'] },
  { name: 'Kidney Transplant', category: 'Urology', keywords: ['kidney', 'transplant'] },
  { name: 'Bladder Surgery', category: 'Urology', keywords: ['bladder', 'surgery'] },
  { name: 'Circumcision', category: 'Urology', keywords: ['circumcision', 'men'] },

  // GASTROENTEROLOGY (Digestive system)
  { name: 'Colonoscopy', category: 'Gastroenterology', keywords: ['colonoscopy', 'colon', 'screening'] },
  { name: 'Endoscopy', category: 'Gastroenterology', keywords: ['endoscopy', 'stomach', 'digestive'] },
  { name: 'Liver Transplant', category: 'Gastroenterology', keywords: ['liver', 'transplant'] },
  { name: 'Colon Surgery', category: 'Gastroenterology', keywords: ['colon', 'bowel', 'surgery'] },

  // TRANSPLANT
  { name: 'Heart Transplant', category: 'Transplant', keywords: ['heart', 'transplant'] },
  { name: 'Lung Transplant', category: 'Transplant', keywords: ['lung', 'transplant'] },
  { name: 'Bone Marrow Transplant', category: 'Transplant', keywords: ['bone marrow', 'transplant', 'stem cell'] },

  // DIAGNOSTIC (Tests and scans)
  { name: 'MRI Scan', category: 'Diagnostic', keywords: ['mri', 'scan', 'imaging'] },
  { name: 'CT Scan', category: 'Diagnostic', keywords: ['ct', 'scan', 'imaging'] },
  { name: 'PET Scan', category: 'Diagnostic', keywords: ['pet', 'scan', 'imaging'] },
  { name: 'Full Body Checkup', category: 'Diagnostic', keywords: ['checkup', 'physical', 'screening'] },
  { name: 'Biopsy', category: 'Diagnostic', keywords: ['biopsy', 'tissue', 'test'] },

  // OTHER
  { name: 'Stem Cell Therapy', category: 'Other', keywords: ['stem cell', 'regenerative'] },
  { name: 'Pain Management', category: 'Other', keywords: ['pain', 'management', 'chronic'] },
  { name: 'Physical Rehabilitation', category: 'Other', keywords: ['rehab', 'rehabilitation', 'physical therapy'] },
  { name: 'Addiction Treatment', category: 'Other', keywords: ['addiction', 'rehab', 'substance abuse'] },
  { name: 'Mental Health Treatment', category: 'Other', keywords: ['mental', 'health', 'psychiatric'] },
];

// Get procedures by category
export const getProceduresByCategory = (category: string): Procedure[] => {
  return ALL_PROCEDURES.filter(p => p.category === category);
};

// Search procedures (fuzzy search across name and keywords)
export const searchProcedures = (query: string): Procedure[] => {
  if (!query || query.length < 2) return ALL_PROCEDURES;

  const lowerQuery = query.toLowerCase();

  return ALL_PROCEDURES.filter(procedure => {
    // Check name
    if (procedure.name.toLowerCase().includes(lowerQuery)) return true;

    // Check keywords
    if (procedure.keywords?.some(keyword => keyword.includes(lowerQuery))) return true;

    return false;
  });
};

// Get top N most common procedures
export const getCommonProcedures = (count: number = 12): Procedure[] => {
  return [
    ALL_PROCEDURES.find(p => p.name === 'Hip Replacement')!,
    ALL_PROCEDURES.find(p => p.name === 'Knee Replacement')!,
    ALL_PROCEDURES.find(p => p.name === 'Dental Implants')!,
    ALL_PROCEDURES.find(p => p.name === 'Cataract Surgery')!,
    ALL_PROCEDURES.find(p => p.name === 'Cosmetic Surgery')!,
    ALL_PROCEDURES.find(p => p.name === 'Cardiac Surgery')!,
    ALL_PROCEDURES.find(p => p.name === 'Bariatric Surgery')!,
    ALL_PROCEDURES.find(p => p.name === 'IVF Treatment')!,
    ALL_PROCEDURES.find(p => p.name === 'Spine Surgery')!,
    ALL_PROCEDURES.find(p => p.name === 'Cancer Treatment')!,
    ALL_PROCEDURES.find(p => p.name === 'LASIK Eye Surgery')!,
    ALL_PROCEDURES.find(p => p.name === 'Hair Transplant')!,
  ].filter(Boolean);
};
