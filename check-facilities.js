const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://whklrclzrtijneqdjmiy.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indoa2xyY2x6cnRpam5lcWRqbWl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NjQyOTgsImV4cCI6MjA3NzM0MDI5OH0.WK4MHCmRWOchU4AKwnlvY1pkB62DkFoR5i9izMem_lA'
);

(async () => {
  try {
    // Get total count
    const { count, error: countError } = await supabase
      .from('facilities')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Count error:', countError);
    } else {
      console.log('Total facilities:', count);
    }

    // Get unique countries
    const { data: countries, error: countriesError } = await supabase
      .from('facilities')
      .select('country')
      .order('country');

    if (countriesError) {
      console.error('Countries error:', countriesError);
    } else {
      const uniqueCountries = [...new Set(countries.map(f => f.country))];
      console.log('\nCountries with facilities:');
      uniqueCountries.forEach(c => console.log('  -', c));
    }

    // Get sample facilities from each country
    const { data: samples, error: samplesError } = await supabase
      .from('facilities')
      .select('name, city, country, google_rating')
      .limit(10);

    if (samplesError) {
      console.error('Samples error:', samplesError);
    } else {
      console.log('\nSample facilities:');
      samples.forEach(f => console.log(`  - ${f.name} (${f.city}, ${f.country}) - ${f.google_rating}★`));
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
})();
