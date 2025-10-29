/**
 * Supabase Import Script
 * Imports enriched facility data into Supabase database
 *
 * Usage: node scripts/import-to-supabase.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;

// Load from environment
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

class SupabaseImporter {
  constructor() {
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not found in .env.local');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.successCount = 0;
    this.failedCount = 0;
    this.duplicateCount = 0;
  }

  async importAllFacilities() {
    console.log('📤 Starting Supabase Import...\n');

    // Load enriched data
    const facilities = JSON.parse(
      await fs.readFile('./data/jci-facilities-enriched.json', 'utf8')
    );

    console.log(`📊 Loaded ${facilities.length} facilities to import\n`);

    // Import in batches of 100
    const batchSize = 100;
    for (let i = 0; i < facilities.length; i += batchSize) {
      const batch = facilities.slice(i, i + batchSize);
      console.log(`Importing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(facilities.length/batchSize)}...`);

      await this.importBatch(batch);
    }

    this.printSummary(facilities.length);
  }

  async importBatch(facilities) {
    const transformedFacilities = facilities.map(f => this.transformFacility(f));

    try {
      const { data, error } = await this.supabase
        .from('facilities')
        .insert(transformedFacilities);

      if (error) {
        console.error(`   ✗ Batch failed: ${error.message}`);
        this.failedCount += facilities.length;
      } else {
        console.log(`   ✓ Imported ${facilities.length} facilities`);
        this.successCount += facilities.length;
      }
    } catch (error) {
      console.error(`   ✗ Error: ${error.message}`);
      this.failedCount += facilities.length;
    }
  }

  transformFacility(raw) {
    return {
      name: raw.name,
      country: raw.country,
      city: raw.city,
      lat: raw.lat || 0,
      lng: raw.lng || 0,
      jci_accredited: true,
      specialties: this.inferSpecialties(raw),
      languages: this.inferLanguages(raw.country),
      google_rating: raw.google_rating || null,
      review_count: raw.review_count || 0,
      accepts_zano: false,
      contact_email: this.inferEmail(raw),
      airport_distance: null,
      popular_procedures: this.inferProcedures(raw)
    };
  }

  inferSpecialties(facility) {
    // Common specialties based on facility type and size
    const baseSpecialties = ['General Medicine', 'Emergency Care'];

    if (facility.type === 'Hospital' || facility.type === 'Academic Medical Center') {
      return [...baseSpecialties, 'Surgery', 'Internal Medicine', 'Cardiology', 'Orthopedics'];
    }

    return baseSpecialties;
  }

  inferLanguages(country) {
    const languageMap = {
      'Thailand': ['English', 'Thai'],
      'India': ['English', 'Hindi'],
      'Turkey': ['English', 'Turkish', 'Arabic'],
      'Singapore': ['English', 'Mandarin', 'Malay'],
      'United Arab Emirates': ['English', 'Arabic'],
      'South Korea': ['English', 'Korean'],
      'Japan': ['English', 'Japanese'],
      'Brazil': ['English', 'Portuguese'],
      'Mexico': ['English', 'Spanish'],
      'Spain': ['English', 'Spanish'],
      'Germany': ['English', 'German'],
      'default': ['English']
    };

    return languageMap[country] || languageMap.default;
  }

  inferEmail(facility) {
    if (facility.website) {
      const domain = facility.website.replace(/https?:\/\/(www\.)?/, '').split('/')[0];
      return `info@${domain}`;
    }
    return null;
  }

  inferProcedures(facility) {
    // Default procedures for medical tourism
    return [
      {
        name: 'General Consultation',
        price_range: 'Contact for pricing',
        wait_time: '1-2 weeks'
      }
    ];
  }

  printSummary(total) {
    console.log('\n' + '='.repeat(60));
    console.log('📊 IMPORT SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Facilities: ${total}`);
    console.log(`Successfully Imported: ${this.successCount}`);
    console.log(`Failed: ${this.failedCount}`);
    console.log(`Success Rate: ${((this.successCount/total)*100).toFixed(1)}%`);

    console.log('\n✅ Import complete!');
    console.log('   Check your database at:');
    console.log(`   ${supabaseUrl.replace('https://', 'https://supabase.com/dashboard/project/')}/table/facilities`);
    console.log('\n✓ Next: Start the app and see all facilities on the map!');
    console.log('  npm start\n');
  }
}

// Run import
if (require.main === module) {
  const importer = new SupabaseImporter();
  importer.importAllFacilities().catch(console.error);
}

module.exports = SupabaseImporter;
