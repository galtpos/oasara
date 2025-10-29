const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://whklrclzrtijneqdjmiy.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indoa2xyY2x6cnRpam5lcWRqbWl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NjQyOTgsImV4cCI6MjA3NzM0MDI5OH0.WK4MHCmRWOchU4AKwnlvY1pkB62DkFoR5i9izMem_lA'
);

(async () => {
  const { data: cosmetic, count } = await supabase
    .from('facilities')
    .select('name, country, specialties', { count: 'exact' })
    .contains('specialties', ['Cosmetic Surgery']);

  console.log(`Facilities with Cosmetic Surgery: ${count}`);

  // Group by country
  const byCountry = {};
  cosmetic.forEach(f => {
    if (!byCountry[f.country]) byCountry[f.country] = 0;
    byCountry[f.country]++;
  });

  console.log('\nBy country:');
  Object.entries(byCountry).sort((a, b) => b[1] - a[1]).forEach(([country, count]) => {
    console.log(`  ${country}: ${count}`);
  });

  // Check all Thailand facilities
  const { data: thailand } = await supabase
    .from('facilities')
    .select('name, specialties')
    .eq('country', 'Thailand');

  const thailandWithCosmetic = thailand.filter(f => f.specialties.includes('Cosmetic Surgery'));

  console.log(`\nThailand facilities total: ${thailand.length}`);
  console.log(`Thailand with Cosmetic Surgery: ${thailandWithCosmetic.length}`);

  console.log('\nFirst 5 Thailand facilities with Cosmetic Surgery:');
  thailandWithCosmetic.slice(0, 5).forEach(f => {
    console.log(`  ${f.name}: ${f.specialties.slice(0, 4).join(', ')}...`);
  });

  // Check Turkey
  const { data: turkey } = await supabase
    .from('facilities')
    .select('name, specialties')
    .eq('country', 'Turkey');

  const turkeyWithHair = turkey.filter(f => f.specialties.includes('Hair Transplant'));
  const turkeyWithCosmetic = turkey.filter(f => f.specialties.includes('Cosmetic Surgery'));

  console.log(`\nTurkey facilities total: ${turkey.length}`);
  console.log(`Turkey with Hair Transplant: ${turkeyWithHair.length}`);
  console.log(`Turkey with Cosmetic Surgery: ${turkeyWithCosmetic.length}`);
})();
