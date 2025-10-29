/**
 * Test Enrichment Script
 * Tests Google Places enrichment with 5 sample facilities
 *
 * Usage: GOOGLE_PLACES_API_KEY=your_key node scripts/test-enrichment.js
 */

const axios = require('axios');
const fs = require('fs').promises;

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const GOOGLE_PLACES_URL = 'https://maps.googleapis.com/maps/api/place';

class TestEnricher {
  constructor() {
    this.successCount = 0;
    this.failedCount = 0;
  }

  async testEnrichment() {
    console.log('🧪 Testing Google Places API Enrichment\n');
    console.log('='.repeat(60) + '\n');

    // Check API key
    if (!GOOGLE_PLACES_API_KEY) {
      console.error('❌ Error: GOOGLE_PLACES_API_KEY not set\n');
      console.log('Get your API key:');
      console.log('1. Go to https://console.cloud.google.com/');
      console.log('2. Create new project: "OASARA Data Collection"');
      console.log('3. Enable "Places API"');
      console.log('4. Create credentials → API Key');
      console.log('5. Run: GOOGLE_PLACES_API_KEY=your_key node scripts/test-enrichment.js\n');
      process.exit(1);
    }

    // Load test sample
    const testSample = JSON.parse(
      await fs.readFile('./data/jci-facilities-test-sample.json', 'utf8')
    );

    console.log(`Testing with ${testSample.length} sample facilities:\n`);

    const results = [];

    for (const [index, facility] of testSample.entries()) {
      console.log(`[${index + 1}/${testSample.length}] Testing: ${facility.name}, ${facility.city}`);

      try {
        const enriched = await this.enrichFacility(facility);
        results.push({ success: true, facility: enriched });
        this.successCount++;

        console.log(`   ✓ SUCCESS`);
        console.log(`     - Coordinates: ${enriched.lat}, ${enriched.lng}`);
        console.log(`     - Rating: ${enriched.google_rating || 'N/A'} ⭐`);
        console.log(`     - Website: ${enriched.website || 'N/A'}`);
        console.log(`     - Phone: ${enriched.phone || 'N/A'}\n`);

        // Rate limit delay
        await this.delay(250);
      } catch (error) {
        results.push({ success: false, facility, error: error.message });
        this.failedCount++;

        console.log(`   ✗ FAILED: ${error.message}\n`);
      }
    }

    this.printTestResults(results);
  }

  async enrichFacility(facility) {
    // Search for place
    const searchQuery = `${facility.name} ${facility.city} ${facility.country}`;
    const searchResponse = await axios.get(`${GOOGLE_PLACES_URL}/textsearch/json`, {
      params: {
        query: searchQuery,
        key: GOOGLE_PLACES_API_KEY
      }
    });

    if (searchResponse.data.status !== 'OK' || !searchResponse.data.results[0]) {
      throw new Error('Place not found');
    }

    const place = searchResponse.data.results[0];

    // Get place details
    const detailsResponse = await axios.get(`${GOOGLE_PLACES_URL}/details/json`, {
      params: {
        place_id: place.place_id,
        fields: 'name,formatted_address,geometry,formatted_phone_number,website,rating,user_ratings_total,url',
        key: GOOGLE_PLACES_API_KEY
      }
    });

    if (detailsResponse.data.status !== 'OK') {
      throw new Error('Details not found');
    }

    const details = detailsResponse.data.result;

    return {
      ...facility,
      lat: details.geometry.location.lat,
      lng: details.geometry.location.lng,
      address: details.formatted_address,
      phone: details.formatted_phone_number,
      website: details.website,
      google_rating: details.rating,
      review_count: details.user_ratings_total,
      google_place_id: place.place_id,
      google_maps_url: details.url,
      enriched_at: new Date().toISOString()
    };
  }

  printTestResults(results) {
    console.log('='.repeat(60));
    console.log('🧪 TEST RESULTS');
    console.log('='.repeat(60));
    console.log(`✓ Successful: ${this.successCount}/${results.length}`);
    console.log(`✗ Failed: ${this.failedCount}/${results.length}`);

    const successRate = (this.successCount / results.length) * 100;
    console.log(`📊 Success Rate: ${successRate.toFixed(1)}%\n`);

    if (successRate >= 80) {
      console.log('✅ PASSED: Ready to process all 661 facilities!\n');
      console.log('Next steps:');
      console.log('1. Prepare full facility list (661 facilities)');
      console.log('2. Run: GOOGLE_PLACES_API_KEY=your_key node scripts/enrich-facilities.js');
      console.log('3. Import: node scripts/import-to-supabase.js\n');
    } else {
      console.log('⚠️  WARNING: Success rate below 80%');
      console.log('Check API key permissions and quota\n');
    }

    // Cost estimate
    const textSearchCost = results.length * 0.032;
    const detailsCost = results.length * 0.017;
    const totalCost = textSearchCost + detailsCost;

    console.log('💰 Cost for this test:');
    console.log(`   Text Search: $${textSearchCost.toFixed(3)}`);
    console.log(`   Place Details: $${detailsCost.toFixed(3)}`);
    console.log(`   Total: $${totalCost.toFixed(3)}\n`);

    console.log('💰 Estimated cost for 661 facilities:');
    console.log(`   Total: $${(totalCost * 661 / results.length).toFixed(2)}`);
    console.log(`   (Within Google's $200/month free tier ✓)\n`);
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Run test
if (require.main === module) {
  const tester = new TestEnricher();
  tester.testEnrichment().catch(console.error);
}

module.exports = TestEnricher;
