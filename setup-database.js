// Quick database setup script using Supabase client
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://whklrclzrtijneqdjmiy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indoa2xyY2x6cnRpam5lcWRqbWl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NjQyOTgsImV4cCI6MjA3NzM0MDI5OH0.WK4MHCmRWOchU4AKwnlvY1pkB62DkFoR5i9izMem_lA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  console.log('🚀 Setting up OASARA database...\n');

  // Sample facilities to insert
  const facilities = [
    {
      name: 'Bumrungrad International Hospital',
      country: 'Thailand',
      city: 'Bangkok',
      lat: 13.7372,
      lng: 100.5642,
      jci_accredited: true,
      specialties: ['Cardiology', 'Oncology', 'Orthopedics', 'Cosmetic Surgery'],
      languages: ['English', 'Thai', 'Arabic', 'Japanese'],
      google_rating: 4.6,
      review_count: 8500,
      contact_email: 'international@bumrungrad.com',
      airport_distance: '30 mins from BKK',
      popular_procedures: [
        { name: 'Hip Replacement', price_range: '$12,000 - $15,000', wait_time: '1 week' },
        { name: 'Heart Bypass', price_range: '$15,000 - $22,000', wait_time: '1-2 weeks' }
      ]
    },
    {
      name: 'Bangkok Hospital',
      country: 'Thailand',
      city: 'Bangkok',
      lat: 13.7563,
      lng: 100.5018,
      jci_accredited: true,
      specialties: ['Neurology', 'Cardiology', 'Fertility', 'Dental'],
      languages: ['English', 'Thai', 'Chinese'],
      google_rating: 4.5,
      review_count: 6200,
      contact_email: 'info@bangkokhospital.com',
      airport_distance: '35 mins from BKK',
      popular_procedures: [
        { name: 'IVF Treatment', price_range: '$4,000 - $6,000', wait_time: '2-4 weeks' },
        { name: 'Dental Implants', price_range: '$1,200 - $2,000', wait_time: '3-5 days' }
      ]
    },
    {
      name: 'Apollo Hospitals',
      country: 'India',
      city: 'Chennai',
      lat: 13.0569,
      lng: 80.2091,
      jci_accredited: true,
      specialties: ['Cardiology', 'Oncology', 'Transplants', 'Orthopedics'],
      languages: ['English', 'Hindi', 'Tamil'],
      google_rating: 4.4,
      review_count: 12000,
      contact_email: 'international@apollohospitals.com',
      airport_distance: '20 mins from MAA',
      popular_procedures: [
        { name: 'Liver Transplant', price_range: '$30,000 - $50,000', wait_time: '2-4 weeks' },
        { name: 'Knee Replacement', price_range: '$7,000 - $9,000', wait_time: '1 week' }
      ]
    },
    {
      name: 'Acibadem Healthcare Group',
      country: 'Turkey',
      city: 'Istanbul',
      lat: 41.0082,
      lng: 29.0909,
      jci_accredited: true,
      specialties: ['Oncology', 'Cardiology', 'Ophthalmology', 'Orthopedics'],
      languages: ['English', 'Turkish', 'Arabic', 'Russian'],
      google_rating: 4.7,
      review_count: 15000,
      contact_email: 'international@acibadem.com',
      airport_distance: '40 mins from IST',
      popular_procedures: [
        { name: 'LASIK Surgery', price_range: '$1,500 - $2,500', wait_time: '2-3 days' },
        { name: 'Hair Transplant', price_range: '$2,000 - $4,000', wait_time: '1 week' }
      ]
    },
    {
      name: 'Samsung Medical Center',
      country: 'South Korea',
      city: 'Seoul',
      lat: 37.4881,
      lng: 127.0859,
      jci_accredited: true,
      specialties: ['Oncology', 'Cardiology', 'Organ Transplants'],
      languages: ['English', 'Korean'],
      google_rating: 4.7,
      review_count: 18000,
      contact_email: 'international@samsung.com',
      airport_distance: '50 mins from ICN',
      popular_procedures: [
        { name: 'Cancer Proton Therapy', price_range: '$40,000 - $60,000', wait_time: '2-3 weeks' }
      ]
    },
    {
      name: 'Mount Elizabeth Hospital',
      country: 'Singapore',
      city: 'Singapore',
      lat: 1.3048,
      lng: 103.8355,
      jci_accredited: true,
      specialties: ['Cardiology', 'Oncology', 'Orthopedics', 'Neurology'],
      languages: ['English', 'Mandarin', 'Malay'],
      google_rating: 4.5,
      review_count: 5600,
      contact_email: 'enquiries@mountelizabeth.com.sg',
      airport_distance: '20 mins from SIN',
      popular_procedures: [
        { name: 'Robotic Surgery', price_range: '$20,000 - $35,000', wait_time: '1-2 weeks' }
      ]
    },
    {
      name: 'Cleveland Clinic Abu Dhabi',
      country: 'United Arab Emirates',
      city: 'Abu Dhabi',
      lat: 24.5247,
      lng: 54.4338,
      jci_accredited: true,
      specialties: ['Cardiology', 'Oncology', 'Neurology', 'Orthopedics'],
      languages: ['English', 'Arabic'],
      google_rating: 4.7,
      review_count: 8900,
      contact_email: 'international@clevelandclinicabudhabi.ae',
      airport_distance: '30 mins from AUH',
      popular_procedures: [
        { name: 'Complex Heart Surgery', price_range: '$35,000 - $55,000', wait_time: '1-2 weeks' }
      ]
    },
    {
      name: 'Hospital Angeles Tijuana',
      country: 'Mexico',
      city: 'Tijuana',
      lat: 32.5027,
      lng: -117.0132,
      jci_accredited: true,
      specialties: ['Bariatric Surgery', 'Dental', 'Cosmetic Surgery'],
      languages: ['English', 'Spanish'],
      google_rating: 4.5,
      review_count: 4200,
      contact_email: 'info@hospitalangelestijuana.com',
      airport_distance: '20 mins from TIJ',
      popular_procedures: [
        { name: 'Gastric Sleeve', price_range: '$4,500 - $7,000', wait_time: '1 week' }
      ]
    },
    {
      name: 'CIMA Hospital',
      country: 'Costa Rica',
      city: 'San Jose',
      lat: 9.9647,
      lng: -84.1235,
      jci_accredited: true,
      specialties: ['Cardiology', 'Orthopedics', 'Cosmetic Surgery', 'Dental'],
      languages: ['English', 'Spanish'],
      google_rating: 4.7,
      review_count: 6100,
      contact_email: 'international@hospitalcima.com',
      airport_distance: '20 mins from SJO',
      popular_procedures: [
        { name: 'Dental Implants Full Arch', price_range: '$8,000 - $12,000', wait_time: '1 week' }
      ]
    },
    {
      name: 'Hospital Quironsalud Barcelona',
      country: 'Spain',
      city: 'Barcelona',
      lat: 41.3926,
      lng: 2.1406,
      jci_accredited: true,
      specialties: ['Oncology', 'Cardiology', 'Neurology', 'Orthopedics'],
      languages: ['English', 'Spanish', 'Catalan'],
      google_rating: 4.6,
      review_count: 7200,
      contact_email: 'international@quironsalud.es',
      airport_distance: '15 mins from BCN',
      popular_procedures: [
        { name: 'Minimally Invasive Spine Surgery', price_range: '$15,000 - $22,000', wait_time: '1-2 weeks' }
      ]
    }
  ];

  console.log('📊 Inserting facilities...');

  const { data, error } = await supabase
    .from('facilities')
    .insert(facilities)
    .select();

  if (error) {
    console.error('❌ Error inserting facilities:', error);
    process.exit(1);
  }

  console.log(`✅ Successfully added ${data.length} facilities!\n`);
  console.log('📋 Facilities added:');
  data.forEach((facility, index) => {
    console.log(`  ${index + 1}. ${facility.name} - ${facility.city}, ${facility.country}`);
  });

  console.log('\n🎉 Database setup complete!');
  console.log('\nNext steps:');
  console.log('  1. Get Mapbox token (https://mapbox.com)');
  console.log('  2. Set up EmailJS (https://emailjs.com)');
  console.log('  3. Run: npm start');
}

setupDatabase().catch(console.error);
