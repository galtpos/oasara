require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

// Get one facility with the most enriched data
supabase
  .from('facilities')
  .select(`
    id,
    name,
    country,
    city,
    doctors (id, name, specialty, qualifications),
    testimonials (id, patient_name, rating, review_text, procedure)
  `)
  .eq('name', 'Apollo Hospitals')
  .eq('city', 'New Delhi')
  .single()
  .then(({data, error}) => {
    if (error) {
      console.log('Error:', error.message);
    } else {
      console.log('INDRAPRASTHA APOLLO HOSPITAL - ENRICHED DATA:\n');
      console.log('Hospital:', data.name, '(' + data.city + ', ' + data.country + ')');

      console.log('\nDOCTORS (' + (data.doctors?.length || 0) + '):');
      if (data.doctors) {
        data.doctors.slice(0, 8).forEach((d, i) => {
          console.log('\n  ' + (i+1) + '. ' + d.name);
          if (d.specialty) console.log('     Specialty: ' + d.specialty);
        });
      }

      console.log('\n\nPATIENT REVIEWS (' + (data.testimonials?.length || 0) + '):');
      if (data.testimonials) {
        data.testimonials.slice(0, 3).forEach((t, i) => {
          console.log('\n  ' + (i+1) + '. ' + (t.patient_name || 'Anonymous') + (t.rating ? ' - Rating: ' + t.rating + '/5' : ''));
          if (t.procedure) console.log('     Procedure: ' + t.procedure);
          if (t.review_text) console.log('     "' + t.review_text.substring(0, 100) + '..."');
        });
      }
    }
  });
