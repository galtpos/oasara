const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://whklrclzrtijneqdjmiy.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indoa2xyY2x6cnRpam5lcWRqbWl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NjQyOTgsImV4cCI6MjA3NzM0MDI5OH0.WK4MHCmRWOchU4AKwnlvY1pkB62DkFoR5i9izMem_lA'
);

(async () => {
  const { count } = await supabase
    .from('facilities')
    .select('*', { count: 'exact', head: true });

  console.log(`Total rows in database: ${count}`);

  // Get all facilities
  const { data: all } = await supabase
    .from('facilities')
    .select('id, name, country, specialties');

  // Group by name
  const byName = {};
  all.forEach(f => {
    if (!byName[f.name]) {
      byName[f.name] = [];
    }
    byName[f.name].push(f);
  });

  // Find duplicates
  const duplicates = Object.entries(byName).filter(([_, facilities]) => facilities.length > 1);

  console.log(`\nDuplicate facilities: ${duplicates.length}`);
  console.log('\nFirst 10 duplicates:');
  duplicates.slice(0, 10).forEach(([name, facilities]) => {
    console.log(`\n${name} (${facilities.length} copies):`);
    facilities.forEach((f, i) => {
      const specs = f.specialties.slice(0, 4).join(', ');
      console.log(`  Copy ${i+1} (ID: ${f.id}): ${specs}...`);
    });
  });

  // Check which ones have the NEW enriched data
  const withNewSpecs = all.filter(f =>
    f.specialties.includes('Gender Reassignment') ||
    f.specialties.includes('Hair Transplant') ||
    f.specialties.includes('Wellness & Spa Medicine')
  );

  console.log(`\n\nFacilities with NEW enriched specialties: ${withNewSpecs.length}`);
  console.log('Examples:');
  withNewSpecs.slice(0, 3).forEach(f => {
    console.log(`  ${f.name}: ${f.specialties.slice(0, 6).join(', ')}`);
  });

  const withOldSpecs = all.filter(f =>
    !f.specialties.includes('Gender Reassignment') &&
    !f.specialties.includes('Hair Transplant') &&
    !f.specialties.includes('Wellness & Spa Medicine')
  );

  console.log(`\nFacilities with OLD generic specialties: ${withOldSpecs.length}`);
})();
