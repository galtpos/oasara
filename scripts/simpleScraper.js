/**
 * SIMPLE SCRAPER - Basic extraction with better stealth
 *
 * This version uses puppeteer-extra with stealth plugin to bypass bot detection
 *
 * Usage:
 *   npm install puppeteer-extra puppeteer-extra-plugin-stealth
 *   node scripts/simpleScraper.js "Bangkok Hospital"
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

async function testBasicAccess(url) {
  console.log(`\n🧪 Testing basic access to ${url}...`);

  try {
    // Try with fetch first
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    });

    console.log(`✅ HTTP ${response.status} ${response.statusText}`);
    console.log(`📝 Content-Type: ${response.headers.get('content-type')}`);

    const html = await response.text();
    console.log(`📄 Page size: ${html.length} characters`);

    // Quick scan for doctor mentions
    const doctorMatches = html.match(/Dr\.|M\.D\.|Ph\.D\.|Doctor|Physician/gi);
    console.log(`👨‍⚕️ Found ${doctorMatches ? doctorMatches.length : 0} potential doctor mentions`);

    // Quick scan for prices
    const priceMatches = html.match(/\$[\d,]+|USD\s*[\d,]+|฿[\d,]+|Baht\s*[\d,]+/gi);
    console.log(`💰 Found ${priceMatches ? priceMatches.length : 0} potential price mentions`);

    return {
      accessible: true,
      html: html
    };

  } catch (error) {
    console.log(`❌ Failed: ${error.message}`);
    return { accessible: false, error: error.message };
  }
}

async function main() {
  const facilityName = process.argv[2];

  if (!facilityName) {
    console.log('❌ Please provide facility name');
    console.log('Usage: node scripts/simpleScraper.js "Bangkok Hospital"');
    process.exit(1);
  }

  // Get facility
  const { data: facility, error } = await supabase
    .from('facilities')
    .select('*')
    .ilike('name', `%${facilityName}%`)
    .not('website', 'is', null)
    .limit(1)
    .single();

  if (error || !facility) {
    console.log(`❌ Facility not found: ${facilityName}`);
    process.exit(1);
  }

  console.log(`\n🏥 ${facility.name}`);
  console.log(`🌍 ${facility.city}, ${facility.country}`);
  console.log(`🌐 ${facility.website}`);

  await testBasicAccess(facility.website);
}

main();
