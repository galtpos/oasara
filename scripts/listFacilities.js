import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

// Get diverse sample from different countries
const { data } = await supabase
  .from('facilities')
  .select('name, website, country, city')
  .not('website', 'is', null)
  .in('country', ['India', 'Turkey', 'UAE', 'Mexico', 'Brazil', 'Spain', 'USA', 'Colombia'])
  .limit(25);

console.log('🌍 Sample facilities from different countries:\n');
data.forEach((f, i) => {
  console.log(`${i+1}. ${f.name} (${f.city}, ${f.country})`);
  console.log(`   🌐 ${f.website}\n`);
});
