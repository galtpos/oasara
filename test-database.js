const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://whklrclzrtijneqdjmiy.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indoa2xyY2x6cnRpam5lcWRqbWl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NjQyOTgsImV4cCI6MjA3NzM0MDI5OH0.WK4MHCmRWOchU4AKwnlvY1pkB62DkFoR5i9izMem_lA'
);

async function testDatabase() {
  console.log('\n=== OASARA Database Tests ===\n');

  // Test 1: Count facilities
  console.log('1. Testing facilities count...');
  const { count: facilitiesCount, error: facilitiesError } = await supabase
    .from('facilities')
    .select('*', { count: 'exact', head: true });

  if (facilitiesError) {
    console.log('   ❌ Error:', facilitiesError.message);
  } else {
    console.log(`   ✅ Facilities: ${facilitiesCount}`);
  }

  // Test 2: Get sample facilities
  console.log('\n2. Testing facility data retrieval...');
  const { data: facilities, error: facilityError } = await supabase
    .from('facilities')
    .select('id, name, country, city, jci_accredited, specialties')
    .limit(3);

  if (facilityError) {
    console.log('   ❌ Error:', facilityError.message);
  } else {
    console.log(`   ✅ Retrieved ${facilities.length} sample facilities:`);
    facilities.forEach(f => {
      console.log(`      - ${f.name} (${f.city}, ${f.country})`);
      console.log(`        JCI: ${f.jci_accredited}, Specialties: ${f.specialties?.length || 0}`);
    });
  }

  // Test 3: Count doctors
  console.log('\n3. Testing doctors count...');
  const { count: doctorsCount, error: doctorsError } = await supabase
    .from('doctors')
    .select('*', { count: 'exact', head: true });

  if (doctorsError) {
    console.log('   ❌ Error:', doctorsError.message);
  } else {
    console.log(`   ✅ Doctors: ${doctorsCount}`);
  }

  // Test 4: Count testimonials
  console.log('\n4. Testing testimonials count...');
  const { count: testimonialsCount, error: testimonialsError } = await supabase
    .from('testimonials')
    .select('*', { count: 'exact', head: true });

  if (testimonialsError) {
    console.log('   ❌ Error:', testimonialsError.message);
  } else {
    console.log(`   ✅ Testimonials: ${testimonialsCount}`);
  }

  // Test 5: Count procedure pricing
  console.log('\n5. Testing procedure pricing count...');
  const { count: pricingCount, error: pricingError } = await supabase
    .from('procedure_pricing')
    .select('*', { count: 'exact', head: true });

  if (pricingError) {
    console.log('   ❌ Error:', pricingError.message);
  } else {
    console.log(`   ✅ Procedure Pricing: ${pricingCount}`);
  }

  // Test 6: Check admin user
  console.log('\n6. Testing admin user...');
  const { data: adminUser, error: adminError } = await supabase
    .from('user_profiles')
    .select('id, email, user_type, name')
    .eq('email', 'eileen@daylightfreedom.org')
    .single();

  if (adminError) {
    console.log('   ❌ Error:', adminError.message);
  } else if (adminUser) {
    console.log(`   ✅ Admin user found: ${adminUser.email}`);
    console.log(`      Type: ${adminUser.user_type}, Name: ${adminUser.name || 'N/A'}`);
  } else {
    console.log('   ❌ Admin user not found');
  }

  // Test 7: Test search functionality
  console.log('\n7. Testing facility search...');
  const { data: searchResults, error: searchError } = await supabase
    .from('facilities')
    .select('name, city, country')
    .ilike('name', '%hospital%')
    .limit(5);

  if (searchError) {
    console.log('   ❌ Error:', searchError.message);
  } else {
    console.log(`   ✅ Found ${searchResults.length} facilities matching "hospital"`);
    searchResults.forEach(f => console.log(`      - ${f.name}`));
  }

  // Test 8: Test facilities with enriched data
  console.log('\n8. Testing enriched data joins...');
  const { data: enriched, error: enrichedError } = await supabase
    .from('facilities')
    .select(`
      id,
      name,
      doctors(count),
      testimonials(count)
    `)
    .limit(5);

  if (enrichedError) {
    console.log('   ❌ Error:', enrichedError.message);
  } else {
    console.log(`   ✅ Retrieved ${enriched.length} facilities with enriched data:`);
    enriched.forEach(f => {
      const doctorCount = Array.isArray(f.doctors) ? f.doctors.length : 0;
      const testimonialCount = Array.isArray(f.testimonials) ? f.testimonials.length : 0;
      console.log(`      - ${f.name}: ${doctorCount} doctors, ${testimonialCount} testimonials`);
    });
  }

  console.log('\n=== Tests Complete ===\n');
}

testDatabase().catch(console.error);
