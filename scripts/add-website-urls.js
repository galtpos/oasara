/**
 * Website & Contact Discovery Script
 * Uses Google Places API to find and add official websites, phone numbers,
 * and contact information for all facilities
 */

const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
if (!GOOGLE_PLACES_API_KEY) {
  console.error('Set GOOGLE_PLACES_API_KEY in .env.local before running this script.');
  process.exit(1);
}

// Rate limiting
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function findFacilityWebsite(facility) {
  try {
    // Step 1: Find place using Google Places Text Search
    const searchUrl = 'https://maps.googleapis.com/maps/api/place/findplacefromtext/json';
    const searchParams = {
      input: `${facility.name} hospital ${facility.city} ${facility.country}`,
      inputtype: 'textquery',
      fields: 'place_id,name,formatted_address',
      key: GOOGLE_PLACES_API_KEY
    };

    const searchResponse = await axios.get(searchUrl, { params: searchParams });

    if (searchResponse.data.status !== 'OK' || !searchResponse.data.candidates?.length) {
      return null;
    }

    const placeId = searchResponse.data.candidates[0].place_id;

    // Step 2: Get place details including website
    const detailsUrl = 'https://maps.googleapis.com/maps/api/place/details/json';
    const detailsParams = {
      place_id: placeId,
      fields: 'website,formatted_phone_number,international_phone_number,url,business_status',
      key: GOOGLE_PLACES_API_KEY
    };

    const detailsResponse = await axios.get(detailsUrl, { params: detailsParams });

    if (detailsResponse.data.status !== 'OK') {
      return null;
    }

    const details = detailsResponse.data.result;

    return {
      website: details.website || null,
      phone: details.international_phone_number || details.formatted_phone_number || null,
      google_maps_url: details.url || null,
      google_place_id: placeId,
      contact_verified: true
    };
  } catch (error) {
    console.error(`Error finding website for ${facility.name}:`, error.message);
    return null;
  }
}

async function updateAllFacilityWebsites() {
  console.log('🌐 Starting Website & Contact Discovery...\n');

  // Get all facilities
  const { data: facilities, error } = await supabase
    .from('facilities')
    .select('*')
    .order('country', { ascending: true });

  if (error) {
    console.error('Error fetching facilities:', error);
    return;
  }

  console.log(`📊 Found ${facilities.length} facilities to process\n`);

  let successCount = 0;
  let failCount = 0;
  let skippedCount = 0;
  const results = {
    withWebsite: 0,
    withPhone: 0,
    withBoth: 0,
    noInfo: 0
  };

  for (let i = 0; i < facilities.length; i++) {
    const facility = facilities[i];

    // Skip if already has website and phone
    if (facility.website && facility.phone) {
      skippedCount++;
      console.log(`⏭️  [${i + 1}/${facilities.length}] Skipped ${facility.name} (already has contact info)`);
      continue;
    }

    console.log(`🔍 [${i + 1}/${facilities.length}] Searching for ${facility.name} in ${facility.city}, ${facility.country}...`);

    const webInfo = await findFacilityWebsite(facility);

    if (webInfo && (webInfo.website || webInfo.phone)) {
      // Update facility in database
      const updateData = {};
      if (webInfo.website && !facility.website) updateData.website = webInfo.website;
      if (webInfo.phone && !facility.phone) updateData.phone = webInfo.phone;
      if (webInfo.google_maps_url) updateData.google_maps_url = webInfo.google_maps_url;
      if (webInfo.google_place_id) updateData.google_place_id = webInfo.google_place_id;

      const { error: updateError } = await supabase
        .from('facilities')
        .update(updateData)
        .eq('id', facility.id);

      if (!updateError) {
        successCount++;

        // Track stats
        if (webInfo.website) results.withWebsite++;
        if (webInfo.phone) results.withPhone++;
        if (webInfo.website && webInfo.phone) results.withBoth++;

        console.log(`✅ Updated ${facility.name}`);
        if (webInfo.website) console.log(`   🌐 Website: ${webInfo.website}`);
        if (webInfo.phone) console.log(`   📞 Phone: ${webInfo.phone}`);
      } else {
        failCount++;
        console.error(`❌ Failed to update ${facility.name}:`, updateError.message);
      }
    } else {
      failCount++;
      results.noInfo++;
      console.log(`⚠️  No info found for ${facility.name}`);
    }

    // Rate limiting - Google Places API: 5 requests per second max
    // We're making 2 requests per facility, so wait 500ms between facilities
    await delay(500);
  }

  console.log('\n' + '='.repeat(70));
  console.log('📊 WEBSITE & CONTACT DISCOVERY COMPLETE');
  console.log('='.repeat(70));
  console.log(`✅ Successfully updated: ${successCount} facilities`);
  console.log(`⏭️  Skipped (already had info): ${skippedCount} facilities`);
  console.log(`❌ Failed/No data: ${failCount} facilities`);
  console.log('\nResults breakdown:');
  console.log(`  🌐 Facilities with website: ${results.withWebsite}`);
  console.log(`  📞 Facilities with phone: ${results.withPhone}`);
  console.log(`  ✅ Facilities with both: ${results.withBoth}`);
  console.log(`  ⚠️  Facilities with no info: ${results.noInfo}`);
  console.log('\n💡 Next: Refresh your browser to see website links on facility cards!');
}

// Run the script
updateAllFacilityWebsites().catch(console.error);
