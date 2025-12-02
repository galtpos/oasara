const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://whklrclzrtijneqdjmiy.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indoa2xyY2x6cnRpam5lcWRqbWl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NjQyOTgsImV4cCI6MjA3NzM0MDI5OH0.WK4MHCmRWOchU4AKwnlvY1pkB62DkFoR5i9izMem_lA'
);

async function audit() {
  const { data, error } = await supabase
    .from('facilities')
    .select('id, name, website, phone, contact_email, country, city');

  if (error) {
    console.error('Error:', error);
    return;
  }

  const total = data.length;
  const hasWebsite = data.filter(f => f.website).length;
  const hasPhone = data.filter(f => f.phone).length;
  const hasEmail = data.filter(f => f.contact_email).length;

  console.log('=== FACILITY DATA AUDIT ===');
  console.log('Total facilities:', total);
  console.log('Has website:', hasWebsite, '(' + Math.round(hasWebsite/total*100) + '%)');
  console.log('Has phone:', hasPhone, '(' + Math.round(hasPhone/total*100) + '%)');
  console.log('Has email:', hasEmail, '(' + Math.round(hasEmail/total*100) + '%)');
  console.log('Missing website:', total - hasWebsite);
  console.log('Missing phone:', total - hasPhone);

  // Show facilities missing website
  const missingWebsite = data.filter(f => !f.website);
  if (missingWebsite.length > 0) {
    console.log('\n=== MISSING WEBSITE (' + missingWebsite.length + ') ===');
    missingWebsite.forEach(f => console.log('-', f.name, '|', f.country, '|', f.city));
  }

  // Show facilities missing phone
  const missingPhone = data.filter(f => !f.phone);
  if (missingPhone.length > 0) {
    console.log('\n=== MISSING PHONE (' + missingPhone.length + ') ===');
    missingPhone.slice(0, 20).forEach(f => console.log('-', f.name, '|', f.country));
    if (missingPhone.length > 20) console.log('... and', missingPhone.length - 20, 'more');
  }
}

audit();
