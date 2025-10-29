/**
 * Facility Data Enrichment Script
 * Enriches JCI facility data with Google Places API data
 *
 * Usage: GOOGLE_PLACES_API_KEY=your_key node scripts/enrich-facilities.js
 */

const axios = require('axios');
const fs = require('fs').promises;

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const GOOGLE_PLACES_URL = 'https://maps.googleapis.com/maps/api/place';

class FacilityEnricher {
  constructor() {
    this.enrichedCount = 0;
    this.failedCount = 0;
    this.rateLimitDelay = 200; // ms between requests
  }

  async enrichAllFacilities() {
    console.log('🌟 Starting Facility Enrichment...\n');

    if (!GOOGLE_PLACES_API_KEY) {
      console.error('❌ Error: GOOGLE_PLACES_API_KEY environment variable not set');
      console.log('   Get your API key at: https://console.cloud.google.com/apis/credentials');
      process.exit(1);
    }

    // Load raw JCI data
    const rawData = JSON.parse(
      await fs.readFile('./data/jci-facilities-raw.json', 'utf8')
    );

    console.log(`📊 Loaded ${rawData.length} facilities to enrich\n`);

    const enrichedFacilities = [];

    for (const [index, facility] of rawData.entries()) {
      try {
        console.log(`[${index + 1}/${rawData.length}] Enriching ${facility.name}...`);

        const enriched = await this.enrichFacility(facility);
        enrichedFacilities.push(enriched);
        this.enrichedCount++;

        console.log(`   ✓ Added: coordinates, rating, contact info`);

        // Rate limiting
        await this.delay(this.rateLimitDelay);
      } catch (error) {
        console.error(`   ✗ Failed: ${error.message}`);
        // Keep original data if enrichment fails
        enrichedFacilities.push({
          ...facility,
          enrichment_failed: true,
          enrichment_error: error.message
        });
        this.failedCount++;
      }
    }

    await this.saveEnrichedData(enrichedFacilities);
    this.printSummary(enrichedFacilities);
  }

  async enrichFacility(facility) {
    // Step 1: Find place with text search
    const searchQuery = `${facility.name} ${facility.city} ${facility.country}`;
    const place = await this.searchPlace(searchQuery);

    if (!place) {
      throw new Error('Place not found in Google Places');
    }

    // Step 2: Get detailed place information
    const details = await this.getPlaceDetails(place.place_id);

    // Step 3: Merge data
    return {
      ...facility,

      // Location data
      lat: details.geometry.location.lat,
      lng: details.geometry.location.lng,
      address: details.formatted_address,

      // Contact info
      phone: details.formatted_phone_number,
      international_phone: details.international_phone_number,
      website: details.website,

      // Review data
      google_rating: details.rating,
      review_count: details.user_ratings_total,
      price_level: details.price_level,

      // Additional info
      opening_hours: details.opening_hours?.weekday_text,
      google_place_id: place.place_id,
      google_maps_url: details.url,

      // Metadata
      enriched_at: new Date().toISOString(),
      enrichment_source: 'Google Places API'
    };
  }

  async searchPlace(query) {
    const response = await axios.get(`${GOOGLE_PLACES_URL}/textsearch/json`, {
      params: {
        query,
        key: GOOGLE_PLACES_API_KEY
      }
    });

    if (response.data.status === 'OK' && response.data.results.length > 0) {
      return response.data.results[0];
    }

    return null;
  }

  async getPlaceDetails(placeId) {
    const response = await axios.get(`${GOOGLE_PLACES_URL}/details/json`, {
      params: {
        place_id: placeId,
        fields: 'name,formatted_address,geometry,formatted_phone_number,international_phone_number,website,rating,user_ratings_total,opening_hours,url,price_level',
        key: GOOGLE_PLACES_API_KEY
      }
    });

    if (response.data.status === 'OK') {
      return response.data.result;
    }

    throw new Error(`Place details not found: ${response.data.status}`);
  }

  async saveEnrichedData(facilities) {
    const outputPath = './data/jci-facilities-enriched.json';
    await fs.writeFile(
      outputPath,
      JSON.stringify(facilities, null, 2)
    );
    console.log(`\n💾 Saved enriched data to ${outputPath}`);
  }

  printSummary(facilities) {
    console.log('\n' + '='.repeat(60));
    console.log('📊 ENRICHMENT SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Facilities: ${facilities.length}`);
    console.log(`Successfully Enriched: ${this.enrichedCount} (${((this.enrichedCount/facilities.length)*100).toFixed(1)}%)`);
    console.log(`Failed: ${this.failedCount}`);

    const withCoordinates = facilities.filter(f => f.lat && f.lng).length;
    const withRatings = facilities.filter(f => f.google_rating).length;
    const withWebsites = facilities.filter(f => f.website).length;

    console.log(`\n✓ Facilities with coordinates: ${withCoordinates}`);
    console.log(`✓ Facilities with ratings: ${withRatings}`);
    console.log(`✓ Facilities with websites: ${withWebsites}`);

    // Average rating
    const avgRating = facilities
      .filter(f => f.google_rating)
      .reduce((sum, f) => sum + f.google_rating, 0) / withRatings;

    console.log(`✓ Average Google Rating: ${avgRating.toFixed(2)} ⭐`);

    console.log('\n✓ Next step: Import to Supabase');
    console.log('  node scripts/import-to-supabase.js\n');
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Run enrichment
if (require.main === module) {
  const enricher = new FacilityEnricher();
  enricher.enrichAllFacilities().catch(console.error);
}

module.exports = FacilityEnricher;
