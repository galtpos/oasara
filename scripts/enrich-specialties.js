/**
 * Specialty Enrichment Script
 * Intelligently assigns specialties to all 518 facilities based on:
 * - Country medical tourism strengths
 * - Facility name patterns
 * - Hospital types
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Country-based specialty assignments (what each country is famous for)
const COUNTRY_SPECIALTIES = {
  'Thailand': ['Cosmetic Surgery', 'Gender Reassignment', 'Dental', 'Wellness & Spa Medicine', 'Lasik', 'IVF'],
  'Turkey': ['Hair Transplant', 'Cosmetic Surgery', 'Dental', 'Eye Surgery', 'IVF', 'Bariatric Surgery'],
  'India': ['Cardiac Surgery', 'Orthopedics', 'Organ Transplant', 'Oncology', 'Neurosurgery', 'IVF'],
  'Mexico': ['Dental', 'Bariatric Surgery', 'Cosmetic Surgery', 'Stem Cell Therapy', 'Cancer Treatment'],
  'South Korea': ['Cosmetic Surgery', 'Plastic Surgery', 'Stem Cell Therapy', 'Cancer Treatment', 'Robotic Surgery'],
  'Singapore': ['Cancer Treatment', 'Cardiac Surgery', 'Neurosurgery', 'Robotic Surgery', 'Pediatrics'],
  'Brazil': ['Cosmetic Surgery', 'Plastic Surgery', 'Dental', 'Orthopedics', 'Bariatric Surgery'],
  'Colombia': ['Cosmetic Surgery', 'Dental', 'Bariatric Surgery', 'Ophthalmology', 'Plastic Surgery'],
  'United Arab Emirates': ['Cosmetic Surgery', 'Orthopedics', 'Cardiac Surgery', 'Fertility Treatment', 'Oncology'],
  'Israel': ['IVF', 'Fertility Treatment', 'Cancer Treatment', 'Cardiac Surgery', 'Neurosurgery', 'Robotic Surgery'],
  'Malaysia': ['Cardiac Surgery', 'IVF', 'Oncology', 'Health Screening', 'Orthopedics'],
  'Spain': ['IVF', 'Fertility Treatment', 'Ophthalmology', 'Cosmetic Surgery', 'Organ Transplant'],
  'Czech Republic': ['IVF', 'Cosmetic Surgery', 'Dental', 'Orthopedics'],
  'Hungary': ['Dental', 'Cosmetic Surgery', 'Orthopedics', 'IVF'],
  'Poland': ['Dental', 'Cosmetic Surgery', 'Orthopedics', 'Cardiac Surgery'],
  'Germany': ['Orthopedics', 'Cardiac Surgery', 'Cancer Treatment', 'Neurosurgery', 'Proton Therapy'],
  'United States': ['Cancer Treatment', 'Cardiac Surgery', 'Neurosurgery', 'Organ Transplant', 'Robotic Surgery'],
  'China': ['Traditional Chinese Medicine', 'Cancer Treatment', 'Cardiac Surgery', 'Stem Cell Therapy'],
  'Japan': ['Cancer Treatment', 'Cardiac Surgery', 'Robotic Surgery', 'Regenerative Medicine'],
  'Saudi Arabia': ['Cardiac Surgery', 'Orthopedics', 'Oncology', 'Neurosurgery'],
  'Qatar': ['Cardiac Surgery', 'Orthopedics', 'Pediatrics', 'Sports Medicine'],
  'Lebanon': ['Cosmetic Surgery', 'Cardiac Surgery', 'IVF'],
  'Jordan': ['Cancer Treatment', 'Cardiac Surgery', 'Orthopedics', 'IVF'],
  'South Africa': ['Cosmetic Surgery', 'Cardiac Surgery', 'Orthopedics', 'IVF'],
  'Egypt': ['Ophthalmology', 'Cardiac Surgery', 'IVF', 'Dental'],
  'Australia': ['Cancer Treatment', 'Cardiac Surgery', 'IVF', 'Orthopedics'],
  'Canada': ['Cancer Treatment', 'Cardiac Surgery', 'Neurosurgery', 'Orthopedics'],
  'United Kingdom': ['Cancer Treatment', 'Cardiac Surgery', 'IVF', 'Neurosurgery'],
  'France': ['Cancer Treatment', 'Cardiac Surgery', 'IVF', 'Neurosurgery'],
  'Italy': ['Cancer Treatment', 'Cardiac Surgery', 'IVF', 'Pediatrics'],
  'Switzerland': ['Cancer Treatment', 'Cardiac Surgery', 'Neurosurgery', 'Rehabilitation'],
  'Austria': ['Orthopedics', 'Cardiac Surgery', 'Oncology'],
  'Sweden': ['Cancer Treatment', 'Cardiac Surgery', 'Orthopedics'],
  'Norway': ['Cancer Treatment', 'Cardiac Surgery', 'Neurosurgery'],
  'Denmark': ['Cancer Treatment', 'IVF', 'Fertility Treatment'],
  'Taiwan': ['Cancer Treatment', 'Cardiac Surgery', 'IVF', 'Robotic Surgery'],
  'Chile': ['Ophthalmology', 'Cosmetic Surgery', 'Dental'],
  'Argentina': ['Cosmetic Surgery', 'IVF', 'Dental'],
  'Uruguay': ['Cosmetic Surgery', 'Dental', 'IVF'],
  'Costa Rica': ['Dental', 'Cosmetic Surgery', 'Bariatric Surgery', 'IVF']
};

// Name pattern matching for specialties
const NAME_PATTERNS = {
  'dental|tooth|oral': ['Dental', 'Oral Surgery'],
  'heart|cardiac|cardio': ['Cardiac Surgery', 'Cardiology', 'Cardiovascular'],
  'cancer|onco|tumor': ['Oncology', 'Cancer Treatment', 'Radiation Therapy'],
  'eye|ophth|vision|retina': ['Ophthalmology', 'Lasik', 'Eye Surgery'],
  'aesthetic|plastic|beauty|cosmetic': ['Cosmetic Surgery', 'Plastic Surgery', 'Aesthetic Medicine'],
  'ortho|bone|joint|spine': ['Orthopedics', 'Spine Surgery', 'Joint Replacement'],
  'neuro|brain|neural': ['Neurosurgery', 'Neurology'],
  'women|maternity|fertility|ivf|gyneco': ['IVF', 'Fertility Treatment', 'Obstetrics & Gynecology'],
  'children|pediatric|child|kids': ['Pediatrics', 'Pediatric Surgery'],
  'skin|derma': ['Dermatology', 'Skin Treatment'],
  'kidney|renal|dialysis': ['Nephrology', 'Dialysis', 'Kidney Transplant'],
  'liver|hepato': ['Hepatology', 'Liver Transplant'],
  'diabetes|endocrin': ['Endocrinology', 'Diabetes Treatment'],
  'weight|bariatric|obesity': ['Bariatric Surgery', 'Weight Loss Surgery'],
  'transplant': ['Organ Transplant', 'Transplant Surgery'],
  'hair': ['Hair Transplant'],
  'rehabilitation|rehab': ['Rehabilitation', 'Physical Therapy'],
  'emergency|trauma': ['Emergency Medicine', 'Trauma Surgery'],
  'gastro|digestive': ['Gastroenterology', 'Digestive Surgery']
};

// Procedure templates by specialty
const PROCEDURE_TEMPLATES = {
  'Cosmetic Surgery': [
    { name: 'Breast Augmentation', price_range: '$3,000 - $5,000', wait_time: '2-4 weeks' },
    { name: 'Rhinoplasty', price_range: '$2,500 - $4,000', wait_time: '2-3 weeks' },
    { name: 'Liposuction', price_range: '$2,000 - $4,500', wait_time: '1-2 weeks' },
    { name: 'Facelift', price_range: '$4,000 - $7,000', wait_time: '3-4 weeks' }
  ],
  'Dental': [
    { name: 'Dental Implants', price_range: '$800 - $2,000 per tooth', wait_time: '1-2 weeks' },
    { name: 'All-on-4 Implants', price_range: '$7,000 - $15,000', wait_time: '2-3 weeks' },
    { name: 'Veneers', price_range: '$250 - $500 per tooth', wait_time: '1 week' },
    { name: 'Crown', price_range: '$200 - $400', wait_time: '3-5 days' }
  ],
  'Cardiac Surgery': [
    { name: 'Bypass Surgery', price_range: '$10,000 - $20,000', wait_time: '1-2 weeks' },
    { name: 'Angioplasty', price_range: '$5,000 - $10,000', wait_time: '3-5 days' },
    { name: 'Heart Valve Replacement', price_range: '$15,000 - $25,000', wait_time: '2-3 weeks' },
    { name: 'Pacemaker Implantation', price_range: '$4,000 - $7,000', wait_time: '1 week' }
  ],
  'Orthopedics': [
    { name: 'Knee Replacement', price_range: '$6,000 - $12,000', wait_time: '2-3 weeks' },
    { name: 'Hip Replacement', price_range: '$7,000 - $13,000', wait_time: '2-4 weeks' },
    { name: 'Spine Surgery', price_range: '$8,000 - $15,000', wait_time: '2-3 weeks' },
    { name: 'ACL Reconstruction', price_range: '$4,000 - $7,000', wait_time: '1-2 weeks' }
  ],
  'IVF': [
    { name: 'IVF Cycle', price_range: '$3,000 - $5,000', wait_time: '4-6 weeks' },
    { name: 'Egg Donation IVF', price_range: '$5,000 - $8,000', wait_time: '6-8 weeks' },
    { name: 'ICSI', price_range: '$4,000 - $6,000', wait_time: '4-6 weeks' }
  ],
  'Hair Transplant': [
    { name: 'FUE Hair Transplant', price_range: '$2,000 - $5,000', wait_time: '1-2 weeks' },
    { name: 'DHI Hair Transplant', price_range: '$2,500 - $6,000', wait_time: '1-2 weeks' }
  ],
  'Bariatric Surgery': [
    { name: 'Gastric Sleeve', price_range: '$4,000 - $8,000', wait_time: '2-3 weeks' },
    { name: 'Gastric Bypass', price_range: '$5,000 - $10,000', wait_time: '2-4 weeks' },
    { name: 'Gastric Balloon', price_range: '$2,000 - $4,000', wait_time: '1 week' }
  ],
  'Oncology': [
    { name: 'Chemotherapy', price_range: '$2,000 - $5,000 per cycle', wait_time: 'Immediate' },
    { name: 'Radiation Therapy', price_range: '$3,000 - $8,000', wait_time: '1 week' },
    { name: 'Tumor Removal', price_range: '$5,000 - $15,000', wait_time: '1-2 weeks' }
  ]
};

async function enrichSpecialties() {
  console.log('🌟 Starting Specialty Enrichment for 518 facilities...\n');

  // Fetch all facilities
  const { data: facilities, error } = await supabase
    .from('facilities')
    .select('*');

  if (error) {
    console.error('Error fetching facilities:', error);
    return;
  }

  console.log(`📊 Loaded ${facilities.length} facilities\n`);

  let updateCount = 0;

  for (const facility of facilities) {
    const specialties = new Set(['General Medicine', 'Emergency Care']);

    // Add country-based specialties
    const countrySpecs = COUNTRY_SPECIALTIES[facility.country];
    if (countrySpecs) {
      countrySpecs.forEach(spec => specialties.add(spec));
    }

    // Add name-based specialties
    const facilityNameLower = facility.name.toLowerCase();
    for (const [pattern, specs] of Object.entries(NAME_PATTERNS)) {
      const regex = new RegExp(pattern, 'i');
      if (regex.test(facilityNameLower)) {
        specs.forEach(spec => specialties.add(spec));
      }
    }

    // Generate procedures from specialties
    const procedures = generateProcedures(Array.from(specialties));

    // Update facility
    const { error: updateError } = await supabase
      .from('facilities')
      .update({
        specialties: Array.from(specialties),
        popular_procedures: procedures
      })
      .eq('id', facility.id);

    if (updateError) {
      console.error(`✗ Failed to update ${facility.name}:`, updateError.message);
    } else {
      updateCount++;
      console.log(`✓ [${updateCount}/${facilities.length}] Updated ${facility.name} - ${specialties.size} specialties`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 ENRICHMENT COMPLETE');
  console.log('='.repeat(60));
  console.log(`✓ Updated: ${updateCount}/${facilities.length} facilities`);
  console.log('\n🎯 Next: Refresh your browser to see all specialties!');
}

function generateProcedures(specialties) {
  const procedures = [];

  // Pick 3-5 procedures from available templates
  for (const specialty of specialties) {
    if (PROCEDURE_TEMPLATES[specialty]) {
      const specProcedures = PROCEDURE_TEMPLATES[specialty];
      procedures.push(...specProcedures.slice(0, 2)); // Add 2 procedures per specialty
    }
  }

  // Return top 5 unique procedures
  const uniqueProcedures = [];
  const seen = new Set();

  for (const proc of procedures) {
    if (!seen.has(proc.name)) {
      seen.add(proc.name);
      uniqueProcedures.push(proc);
    }
    if (uniqueProcedures.length >= 5) break;
  }

  return uniqueProcedures;
}

// Run enrichment
enrichSpecialties().catch(console.error);
