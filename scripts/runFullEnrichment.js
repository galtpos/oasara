/**
 * Full Facility Enrichment Pipeline
 * Orchestrates all enrichment scripts to extract deep data from facility websites
 * 
 * Usage: 
 *   node scripts/runFullEnrichment.js                    # Process 10 facilities (default)
 *   node scripts/runFullEnrichment.js --limit=50         # Process 50 facilities
 *   node scripts/runFullEnrichment.js --all              # Process all facilities with websites
 *   node scripts/runFullEnrichment.js --facility-id=uuid  # Process single facility
 *   node scripts/runFullEnrichment.js --skip-doctors      # Skip doctor scraping
 *   node scripts/runFullEnrichment.js --skip-pricing     # Skip pricing scraping
 *   node scripts/runFullEnrichment.js --skip-packages    # Skip package scraping
 *   node scripts/runFullEnrichment.js --skip-testimonials # Skip testimonials
 *   node scripts/runFullEnrichment.js --use-ai            # Use AI extraction (expensive)
 */

const { createClient } = require('@supabase/supabase-js');
const { scrapeDoctorsFromWebsite } = require('./scrapeDoctors');
const { scrapePricingFromWebsite } = require('./scrapePricing');
const { scrapePackagesFromWebsite } = require('./scrapePackages');
const { scrapeTestimonialsFromWebsite } = require('./scrapeTestimonials');
require('dotenv').config({ path: '.env.local' });

// Lazy load AI extraction only when needed
let extractDataWithAI = null;
function loadAIExtraction() {
  if (!extractDataWithAI) {
    try {
      extractDataWithAI = require('./aiDataExtraction').extractDataWithAI;
    } catch (error) {
      console.error('⚠️  AI extraction not available. Install OpenAI dependency or skip with --skip-ai');
      return null;
    }
  }
  return extractDataWithAI;
}

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Supabase credentials not found in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  
  return {
    limit: args.find(arg => arg.startsWith('--limit='))?.split('=')[1] 
      ? parseInt(args.find(arg => arg.startsWith('--limit=')).split('=')[1]) 
      : null,
    facilityId: args.find(arg => arg.startsWith('--facility-id='))?.split('=')[1] || null,
    all: args.includes('--all'),
    skipDoctors: args.includes('--skip-doctors'),
    skipPricing: args.includes('--skip-pricing'),
    skipPackages: args.includes('--skip-packages'),
    skipTestimonials: args.includes('--skip-testimonials'),
    useAI: args.includes('--use-ai')
  };
}

/**
 * Enrich a single facility with all data types
 */
async function enrichFacility(facility, options) {
  const results = {
    facility_id: facility.id,
    facility_name: facility.name,
    doctors: { success: false, count: 0 },
    pricing: { success: false, count: 0 },
    packages: { success: false, count: 0 },
    testimonials: { success: false, count: 0, metrics: 0 },
    ai: { success: false }
  };
  
  console.log(`\n${'='.repeat(70)}`);
  console.log(`📍 ENRICHING: ${facility.name}`);
  console.log(`   ${facility.city}, ${facility.country}`);
  console.log(`   Website: ${facility.website}`);
  console.log('='.repeat(70));
  
  // Step 1: Scrape Doctors
  if (!options.skipDoctors) {
    console.log('\n👨‍⚕️  Step 1/5: Scraping Doctor Profiles...');
    try {
      const result = await scrapeDoctorsFromWebsite(facility);
      results.doctors = { success: result.success, count: result.doctorsCount || 0 };
      console.log(`   ${result.success ? '✅' : '⚠️'} ${result.doctorsCount || 0} doctors found`);
    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
    }
    
    // Wait between steps
    await new Promise(resolve => setTimeout(resolve, 2000));
  } else {
    console.log('\n⏭️  Skipping doctor scraping...');
  }
  
  // Step 2: Scrape Pricing
  if (!options.skipPricing) {
    console.log('\n💰 Step 2/5: Scraping Procedure Pricing...');
    try {
      const result = await scrapePricingFromWebsite(facility);
      results.pricing = { success: result.success, count: result.pricingCount || 0 };
      console.log(`   ${result.success ? '✅' : '⚠️'} ${result.pricingCount || 0} prices found`);
    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000));
  } else {
    console.log('\n⏭️  Skipping pricing scraping...');
  }
  
  // Step 3: Scrape Packages
  if (!options.skipPackages) {
    console.log('\n📦 Step 3/5: Scraping Package Deals...');
    try {
      const result = await scrapePackagesFromWebsite(facility);
      results.packages = { success: result.success, count: result.packagesCount || 0 };
      console.log(`   ${result.success ? '✅' : '⚠️'} ${result.packagesCount || 0} packages found`);
    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000));
  } else {
    console.log('\n⏭️  Skipping package scraping...');
  }
  
  // Step 4: Scrape Testimonials & Metrics
  if (!options.skipTestimonials) {
    console.log('\n💬 Step 4/5: Scraping Testimonials & Success Metrics...');
    try {
      const result = await scrapeTestimonialsFromWebsite(facility);
      results.testimonials = { 
        success: result.success, 
        count: result.testimonialsCount || 0,
        metrics: result.metricsCount || 0
      };
      console.log(`   ${result.success ? '✅' : '⚠️'} ${result.testimonialsCount || 0} testimonials, ${result.metricsCount || 0} metrics`);
    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000));
  } else {
    console.log('\n⏭️  Skipping testimonials scraping...');
  }
  
  // Step 5: AI Extraction (optional, expensive)
  if (options.useAI) {
    console.log('\n🤖 Step 5/5: AI-Powered Data Extraction...');
    try {
      const aiExtract = loadAIExtraction();
      if (!aiExtract) {
        console.log('   ⚠️  AI extraction not available');
        results.ai = { success: false };
      } else {
        const result = await aiExtract(facility);
        results.ai = { success: result.success };
        console.log(`   ${result.success ? '✅' : '⚠️'} AI extraction ${result.success ? 'completed' : 'failed'}`);
      }
    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
    }
  } else {
    console.log('\n⏭️  Skipping AI extraction (use --use-ai to enable)');
  }
  
  // Mark facility as enriched
  const enrichmentComplete = 
    results.doctors.success || 
    results.pricing.success || 
    results.packages.success || 
    results.testimonials.success ||
    results.ai.success;
  
  if (enrichmentComplete) {
    await supabase
      .from('facilities')
      .update({
        data_enriched: true,
        enriched_date: new Date().toISOString()
      })
      .eq('id', facility.id);
    
    console.log(`\n✅ Enrichment complete for ${facility.name}`);
  } else {
    console.log(`\n⚠️  No data extracted for ${facility.name}`);
  }
  
  return results;
}

/**
 * Main enrichment pipeline
 */
async function runFullEnrichment() {
  const options = parseArgs();
  
  console.log('\n' + '='.repeat(70));
  console.log('🚀 OASARA FACILITY ENRICHMENT PIPELINE');
  console.log('='.repeat(70));
  console.log('\n📋 Configuration:');
  console.log(`   - Doctors: ${options.skipDoctors ? 'SKIPPED' : 'ENABLED'}`);
  console.log(`   - Pricing: ${options.skipPricing ? 'SKIPPED' : 'ENABLED'}`);
  console.log(`   - Packages: ${options.skipPackages ? 'SKIPPED' : 'ENABLED'}`);
  console.log(`   - Testimonials: ${options.skipTestimonials ? 'SKIPPED' : 'ENABLED'}`);
  console.log(`   - AI Extraction: ${options.useAI ? 'ENABLED (expensive)' : 'DISABLED'}`);
  console.log('');
  
  // Fetch facilities
  let query = supabase
    .from('facilities')
    .select('id, name, website, country, city')
    .not('website', 'is', null);
  
  if (options.facilityId) {
    query = query.eq('id', options.facilityId);
    console.log(`🎯 Single facility mode: ${options.facilityId}`);
  } else if (options.all) {
    console.log('🌍 Processing ALL facilities with websites...');
  } else {
    const limit = options.limit || 10;
    query = query.limit(limit);
    console.log(`📊 Processing ${limit} facilities (use --all for all facilities)`);
  }
  
  const { data: facilities, error } = await query;
  
  if (error) {
    console.error(`❌ Error fetching facilities: ${error.message}`);
    process.exit(1);
  }
  
  if (!facilities || facilities.length === 0) {
    console.log('⚠️  No facilities found with websites');
    process.exit(0);
  }
  
  console.log(`\n📊 Found ${facilities.length} facilities to enrich\n`);
  console.log('⏱️  Estimated time: ~2-3 minutes per facility');
  console.log('💡 Tip: Use --skip-* flags to speed up specific steps\n');
  
  const startTime = Date.now();
  const results = [];
  
  // Process each facility
  for (const [index, facility] of facilities.entries()) {
    console.log(`\n\n[${index + 1}/${facilities.length}] Processing facility ${index + 1} of ${facilities.length}`);
    
    try {
      const result = await enrichFacility(facility, options);
      results.push(result);
      
      // Rate limiting between facilities
      if (index < facilities.length - 1) {
        console.log('\n⏳ Waiting 5 seconds before next facility...');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    } catch (error) {
      console.error(`\n❌ Failed to enrich ${facility.name}: ${error.message}`);
      results.push({
        facility_id: facility.id,
        facility_name: facility.name,
        error: error.message
      });
    }
  }
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000 / 60).toFixed(1);
  
  // Print summary
  console.log('\n\n' + '='.repeat(70));
  console.log('📊 ENRICHMENT SUMMARY');
  console.log('='.repeat(70));
  
  const successfulFacilities = results.filter(r => 
    r.doctors?.success || 
    r.pricing?.success || 
    r.packages?.success || 
    r.testimonials?.success ||
    r.ai?.success
  ).length;
  
  const totalDoctors = results.reduce((sum, r) => sum + (r.doctors?.count || 0), 0);
  const totalPricing = results.reduce((sum, r) => sum + (r.pricing?.count || 0), 0);
  const totalPackages = results.reduce((sum, r) => sum + (r.packages?.count || 0), 0);
  const totalTestimonials = results.reduce((sum, r) => sum + (r.testimonials?.count || 0), 0);
  const totalMetrics = results.reduce((sum, r) => sum + (r.testimonials?.metrics || 0), 0);
  
  console.log(`\nTotal Facilities Processed: ${facilities.length}`);
  console.log(`Successfully Enriched: ${successfulFacilities}`);
  console.log(`Total Time: ${duration} minutes`);
  console.log(`\nData Extracted:`);
  console.log(`   👨‍⚕️  Doctors: ${totalDoctors}`);
  console.log(`   💰 Procedure Prices: ${totalPricing}`);
  console.log(`   📦 Packages: ${totalPackages}`);
  console.log(`   💬 Testimonials: ${totalTestimonials}`);
  console.log(`   📊 Success Metrics: ${totalMetrics}`);
  console.log(`\nSuccess Rate: ${((successfulFacilities/facilities.length)*100).toFixed(1)}%`);
  
  console.log('\n' + '='.repeat(70));
  console.log('✅ Enrichment pipeline complete!');
  console.log('\n💡 Next Steps:');
  console.log('   1. Review extracted data in Supabase dashboard');
  console.log('   2. Verify pricing accuracy');
  console.log('   3. Check doctor profiles for completeness');
  console.log('   4. Run again with --use-ai for complex websites that failed');
  console.log('='.repeat(70) + '\n');
}

// Run if called directly
if (require.main === module) {
  runFullEnrichment().catch(error => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { runFullEnrichment, enrichFacility };

