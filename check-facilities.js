const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkFacilities() {
  const { data, error, count } = await supabase
    .from('facilities')
    .select('*', { count: 'exact' });
  
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log(`\n📊 TOTAL FACILITIES IN DATABASE: ${count}\n`);
  
  // Count by country
  const countryCounts = {};
  data.forEach(f => {
    countryCounts[f.country] = (countryCounts[f.country] || 0) + 1;
  });
  
  console.log('By Country:');
  Object.entries(countryCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([country, count]) => {
      console.log(`  ${country}: ${count}`);
    });
}

checkFacilities();
