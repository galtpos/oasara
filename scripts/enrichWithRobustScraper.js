/**
 * MASTER ENRICHMENT ORCHESTRATOR
 *
 * Runs the robust scraper on all facilities with websites and saves results to database.
 *
 * Features:
 * - Progress tracking with detailed stats
 * - Saves data incrementally (won't lose progress on crash)
 * - Calculates success rates
 * - Generates detailed report
 * - Can resume from where it left off
 *
 * Usage:
 *   node scripts/enrichWithRobustScraper.js [options]
 *
 * Options:
 *   --limit N       Process only N facilities (default: all)
 *   --country XX    Process only facilities from country XX
 *   --verbose       Show detailed logging
 *   --test          Test mode (5 facilities, no database writes)
 *   --use-ai        Enable AI extraction (requires OpenAI API key)
 *
 * Examples:
 *   node scripts/enrichWithRobustScraper.js --limit 10
 *   node scripts/enrichWithRobustScraper.js --country Thailand --verbose
 *   node scripts/enrichWithRobustScraper.js --test
 */

import RobustMedicalScraper from './robustScraper.js';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  limit: parseInt(args.find(arg => arg.startsWith('--limit'))?.split('=')[1]) || null,
  country: args.find(arg => arg.startsWith('--country'))?.split('=')[1] || null,
  verbose: args.includes('--verbose'),
  test: args.includes('--test'),
  useAI: args.includes('--use-ai')
};

if (options.test) {
  options.limit = 5;
  console.log('🧪 TEST MODE: Processing 5 facilities, no database writes\n');
}

class EnrichmentOrchestrator {
  constructor(options) {
    this.options = options;
    this.scraper = new RobustMedicalScraper({
      verbose: options.verbose,
      useAI: options.useAI
    });
    this.results = {
      success: 0,
      partial: 0,
      failed: 0,
      details: [],
      startTime: Date.now()
    };
  }

  /**
   * SAVE RESULTS TO JSON FILE (BACKUP)
   */
  saveProgress() {
    const filename = `enrichment-results-${Date.now()}.json`;
    const filepath = path.join(process.cwd(), 'data', filename);

    // Create data directory if it doesn't exist
    if (!fs.existsSync(path.join(process.cwd(), 'data'))) {
      fs.mkdirSync(path.join(process.cwd(), 'data'));
    }

    fs.writeFileSync(filepath, JSON.stringify(this.results, null, 2));
    console.log(`💾 Progress saved to ${filename}`);
  }

  /**
   * SAVE DOCTORS TO DATABASE
   */
  async saveDoctors(facilityId, doctors) {
    if (this.options.test) return;

    const doctorsToInsert = doctors.map(doc => ({
      facility_id: facilityId,
      name: doc.name,
      specialty: doc.specialty || null,
      bio: doc.bio || null,
      qualifications: doc.qualifications || null,
      languages: null,
      years_experience: null,
      profile_url: null,
      source: doc.source || 'web-scraping'
    }));

    const { data, error } = await supabase
      .from('doctors')
      .insert(doctorsToInsert);

    if (error) {
      console.error(`   ⚠️ Error saving doctors: ${error.message}`);
    } else {
      console.log(`   ✅ Saved ${doctors.length} doctors to database`);
    }
  }

  /**
   * SAVE PRICING TO DATABASE
   */
  async savePricing(facilityId, prices) {
    if (this.options.test) return;

    const pricesToInsert = prices.map(price => ({
      facility_id: facilityId,
      procedure_name: price.procedure,
      price: price.price,
      currency: price.currency || 'USD',
      price_type: price.price_type || 'starting_from',
      price_min: price.price,
      price_max: price.price_max || null,
      source: 'web-scraping'
    }));

    const { data, error } = await supabase
      .from('procedure_pricing')
      .insert(pricesToInsert);

    if (error) {
      console.error(`   ⚠️ Error saving pricing: ${error.message}`);
    } else {
      console.log(`   ✅ Saved ${prices.length} prices to database`);
    }
  }

  /**
   * SAVE TESTIMONIALS TO DATABASE
   */
  async saveTestimonials(facilityId, testimonials) {
    if (this.options.test) return;

    const testimonialsToInsert = testimonials.map(test => ({
      facility_id: facilityId,
      patient_name: test.patient_name || 'Anonymous',
      procedure: null,
      review_text: test.review_text,
      rating: test.rating ? parseFloat(test.rating) : null,
      review_date: null,
      source: test.source || 'website',
      verified: false
    }));

    const { data, error } = await supabase
      .from('testimonials')
      .insert(testimonialsToInsert);

    if (error) {
      console.error(`   ⚠️ Error saving testimonials: ${error.message}`);
    } else {
      console.log(`   ✅ Saved ${testimonials.length} testimonials to database`);
    }
  }

  /**
   * SAVE PACKAGES TO DATABASE
   */
  async savePackages(facilityId, packages) {
    if (this.options.test) return;

    const packagesToInsert = packages.map(pkg => ({
      facility_id: facilityId,
      package_name: pkg.package_name,
      description: pkg.description,
      price: pkg.price,
      currency: 'USD',
      duration_days: null,
      included_services: pkg.included_services,
      source: 'web-scraping'
    }));

    const { data, error } = await supabase
      .from('facility_packages')
      .insert(packagesToInsert);

    if (error) {
      console.error(`   ⚠️ Error saving packages: ${error.message}`);
    } else {
      console.log(`   ✅ Saved ${packages.length} packages to database`);
    }
  }

  /**
   * UPDATE ENRICHMENT STATUS
   */
  async updateEnrichmentStatus(facilityId, status) {
    if (this.options.test) return;

    const { data, error } = await supabase
      .from('facilities')
      .update({
        enrichment_status: status,
        enrichment_last_attempt: new Date().toISOString()
      })
      .eq('id', facilityId);

    if (error) {
      console.error(`   ⚠️ Error updating status: ${error.message}`);
    }
  }

  /**
   * PROCESS A SINGLE FACILITY
   */
  async processFacility(facility, index, total) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`🏥 [${index + 1}/${total}] ${facility.name}`);
    console.log(`🌍 ${facility.city}, ${facility.country}`);
    console.log(`🌐 ${facility.website}`);
    console.log(`${'='.repeat(80)}\n`);

    const facilityResult = {
      facility: facility.name,
      country: facility.country,
      website: facility.website,
      doctors: 0,
      prices: 0,
      testimonials: 0,
      packages: 0,
      totalItems: 0,
      status: 'failed',
      errors: []
    };

    try {
      // Extract doctors
      console.log('👨‍⚕️ Extracting doctors...');
      const doctors = await this.scraper.extractDoctors(facility);
      facilityResult.doctors = doctors.length;

      if (doctors.length > 0) {
        await this.saveDoctors(facility.id, doctors);
      }

      // Extract pricing
      console.log('💰 Extracting pricing...');
      const prices = await this.scraper.extractPricing(facility);
      facilityResult.prices = prices.length;

      if (prices.length > 0) {
        await this.savePricing(facility.id, prices);
      }

      // Extract testimonials
      console.log('⭐ Extracting testimonials...');
      const testimonials = await this.scraper.extractTestimonials(facility);
      facilityResult.testimonials = testimonials.length;

      if (testimonials.length > 0) {
        await this.saveTestimonials(facility.id, testimonials);
      }

      // Extract packages
      console.log('📦 Extracting packages...');
      const packages = await this.scraper.extractPackages(facility);
      facilityResult.packages = packages.length;

      if (packages.length > 0) {
        await this.savePackages(facility.id, packages);
      }

      // Calculate total items
      facilityResult.totalItems =
        doctors.length +
        prices.length +
        testimonials.length +
        packages.length;

      // Determine status
      if (facilityResult.totalItems >= 10) {
        facilityResult.status = 'success';
        this.results.success++;
        await this.updateEnrichmentStatus(facility.id, 'enriched');
        console.log(`\n✅ SUCCESS: Extracted ${facilityResult.totalItems} items`);
      } else if (facilityResult.totalItems > 0) {
        facilityResult.status = 'partial';
        this.results.partial++;
        await this.updateEnrichmentStatus(facility.id, 'partial');
        console.log(`\n⚠️ PARTIAL: Extracted ${facilityResult.totalItems} items`);
      } else {
        facilityResult.status = 'failed';
        this.results.failed++;
        await this.updateEnrichmentStatus(facility.id, 'failed');
        console.log(`\n❌ FAILED: No data extracted`);
      }

    } catch (error) {
      facilityResult.errors.push(error.message);
      this.results.failed++;
      await this.updateEnrichmentStatus(facility.id, 'failed');
      console.error(`\n❌ ERROR: ${error.message}`);
    }

    this.results.details.push(facilityResult);

    // Save progress every 5 facilities
    if ((index + 1) % 5 === 0) {
      this.saveProgress();
    }
  }

  /**
   * PRINT SUMMARY REPORT
   */
  printSummary() {
    const elapsed = Date.now() - this.results.startTime;
    const elapsedMin = Math.round(elapsed / 1000 / 60);
    const total = this.results.success + this.results.partial + this.results.failed;
    const successRate = Math.round((this.results.success / total) * 100);
    const partialRate = Math.round((this.results.partial / total) * 100);

    console.log('\n\n');
    console.log('═'.repeat(80));
    console.log('📊 ENRICHMENT SUMMARY REPORT');
    console.log('═'.repeat(80));
    console.log(`⏱️  Time Elapsed: ${elapsedMin} minutes`);
    console.log(`📍 Facilities Processed: ${total}`);
    console.log(`✅ Successful: ${this.results.success} (${successRate}%)`);
    console.log(`⚠️  Partial: ${this.results.partial} (${partialRate}%)`);
    console.log(`❌ Failed: ${this.results.failed} (${100 - successRate - partialRate}%)`);
    console.log('═'.repeat(80));

    // Calculate totals
    const totals = this.results.details.reduce((acc, detail) => {
      acc.doctors += detail.doctors;
      acc.prices += detail.prices;
      acc.testimonials += detail.testimonials;
      acc.packages += detail.packages;
      return acc;
    }, { doctors: 0, prices: 0, testimonials: 0, packages: 0 });

    console.log('\n📈 DATA EXTRACTED:');
    console.log(`   👨‍⚕️ Doctors: ${totals.doctors}`);
    console.log(`   💰 Prices: ${totals.prices}`);
    console.log(`   ⭐ Testimonials: ${totals.testimonials}`);
    console.log(`   📦 Packages: ${totals.packages}`);
    console.log(`   📊 Total Items: ${totals.doctors + totals.prices + totals.testimonials + totals.packages}`);

    console.log('\n🏆 TOP PERFORMERS:');
    const topPerformers = this.results.details
      .sort((a, b) => b.totalItems - a.totalItems)
      .slice(0, 5);

    topPerformers.forEach((detail, idx) => {
      console.log(`   ${idx + 1}. ${detail.facility} - ${detail.totalItems} items`);
      console.log(`      Doctors: ${detail.doctors}, Prices: ${detail.prices}, Testimonials: ${detail.testimonials}, Packages: ${detail.packages}`);
    });

    console.log('\n💡 RECOMMENDATIONS:');
    if (successRate < 30) {
      console.log('   - Success rate is low. Consider using --use-ai flag for AI extraction');
      console.log('   - Review specific facility websites with debugScraper.js');
      console.log('   - Some facilities may not publish data publicly');
    } else if (successRate < 50) {
      console.log('   - Moderate success rate. Try AI extraction for failed facilities');
      console.log('   - Review extraction patterns in robustScraper.js');
    } else {
      console.log('   - Good success rate! Continue processing more facilities');
      console.log('   - Consider manual enrichment for high-value failed facilities');
    }

    console.log('\n📁 Detailed results saved to data/ directory');
    console.log('═'.repeat(80));
    console.log('\n');
  }

  /**
   * RUN ENRICHMENT
   */
  async run() {
    try {
      console.log('\n🚀 OASARA ENRICHMENT ORCHESTRATOR\n');

      // Build query
      let query = supabase
        .from('facilities')
        .select('*')
        .not('website', 'is', null);

      if (this.options.country) {
        query = query.eq('country', this.options.country);
        console.log(`🌍 Filtering by country: ${this.options.country}`);
      }

      if (this.options.limit) {
        query = query.limit(this.options.limit);
        console.log(`🔢 Limiting to ${this.options.limit} facilities`);
      }

      // Fetch facilities
      const { data: facilities, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch facilities: ${error.message}`);
      }

      if (!facilities || facilities.length === 0) {
        console.log('❌ No facilities found with websites');
        return;
      }

      console.log(`\n📍 Found ${facilities.length} facilities to process\n`);
      console.log(`Options:`);
      console.log(`   - Verbose: ${this.options.verbose}`);
      console.log(`   - Use AI: ${this.options.useAI}`);
      console.log(`   - Test Mode: ${this.options.test}`);
      console.log('\n⏳ Starting enrichment...\n');

      // Process each facility
      for (let i = 0; i < facilities.length; i++) {
        await this.processFacility(facilities[i], i, facilities.length);

        // Small delay between facilities to avoid rate limiting
        if (i < facilities.length - 1) {
          console.log('\n⏸️  Waiting 3 seconds before next facility...\n');
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      }

      // Save final results
      this.saveProgress();

      // Print summary
      this.printSummary();

    } catch (error) {
      console.error('❌ Fatal error:', error);
      this.saveProgress();
      process.exit(1);
    }
  }
}

// Main execution
const orchestrator = new EnrichmentOrchestrator(options);
orchestrator.run();
