/**
 * Procedure Pricing Scraper
 * Extracts actual procedure prices from facility websites
 * 
 * Usage: node scripts/scrapePricing.js [--facility-id=uuid] [--limit=10]
 */

const puppeteer = require('puppeteer');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Supabase credentials not found in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Common URL patterns for pricing pages
const PRICING_PAGE_PATTERNS = [
  '/prices', '/pricing', '/costs', '/fees', '/rates',
  '/packages', '/estimates', '/quote', '/price-list',
  '/cost-estimate', '/procedure-costs', '/surgery-costs'
];

// Common procedure keywords to search for
const COMMON_PROCEDURES = [
  'Breast Augmentation', 'Rhinoplasty', 'Liposuction', 'Facelift',
  'Dental Implant', 'Hair Transplant', 'Knee Replacement', 'Hip Replacement',
  'IVF', 'LASIK', 'Gastric Bypass', 'Angioplasty', 'Cardiac Bypass',
  'Knee Surgery', 'Hip Surgery', 'Spine Surgery', 'Heart Surgery',
  'Cosmetic Surgery', 'Plastic Surgery', 'Eye Surgery', 'Dental Surgery',
  'Bariatric Surgery', 'Weight Loss Surgery', 'Hair Restoration',
  'Breast Reduction', 'Tummy Tuck', 'Mommy Makeover', 'Botox',
  'Dermal Fillers', 'Dental Crown', 'Root Canal', 'Teeth Whitening',
  'Orthopedic Surgery', 'Cancer Treatment', 'Chemotherapy', 'Radiation'
];

/**
 * Extract price from text
 */
function extractPrice(text) {
  if (!text) return null;
  
  // Match various price formats: $1,234.56, USD 1,234, 1234 USD, etc.
  const pricePatterns = [
    /\$?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*(?:USD|usd|\$)?/g,
    /(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*(?:USD|US\s*Dollars?|dollars?)/gi,
    /Price[:\s]+(\$?\s*\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i,
    /Cost[:\s]+(\$?\s*\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i,
    /From[:\s]+(\$?\s*\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i,
    /Starting[:\s]+at[:\s]+(\$?\s*\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i
  ];
  
  const prices = [];
  
  for (const pattern of pricePatterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const priceStr = match[1].replace(/,/g, '');
      const priceNum = parseFloat(priceStr);
      if (priceNum > 100 && priceNum < 1000000) { // Reasonable range
        prices.push({
          value: priceNum,
          display: match[0].trim(),
          range: null
        });
      }
    }
  }
  
  // Look for price ranges: $3,000 - $8,000
  const rangePattern = /(\$?\s*\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*[-–—]\s*(\$?\s*\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g;
  const rangeMatches = text.matchAll(rangePattern);
  for (const match of rangeMatches) {
    const min = parseFloat(match[1].replace(/,/g, ''));
    const max = parseFloat(match[2].replace(/,/g, ''));
    if (min > 100 && max < 1000000 && max > min) {
      prices.push({
        value: (min + max) / 2, // Average
        display: match[0].trim(),
        range: { min, max }
      });
    }
  }
  
  return prices.length > 0 ? prices[0] : null;
}

/**
 * Find pricing page URL
 */
async function findPricingPage(page, baseUrl) {
  try {
    // First try: Look for links with pricing-related patterns
    for (const pattern of PRICING_PAGE_PATTERNS) {
      try {
        const link = await page.$(`a[href*="${pattern}"]`);
        if (link) {
          const href = await page.evaluate(el => el.href, link);
          if (href && href.startsWith('http')) {
            return href;
          }
        }
      } catch (e) {
        // Continue
      }
    }
    
    // Second try: Look for text content mentioning pricing
    const links = await page.$$eval('a', (anchors) => {
      return anchors
        .map(a => ({ text: a.textContent.toLowerCase(), href: a.href }))
        .filter(a => 
          a.text.includes('price') || 
          a.text.includes('cost') || 
          a.text.includes('fee') ||
          a.text.includes('estimate')
        )
        .map(a => a.href);
    });
    
    if (links.length > 0) {
      return links[0];
    }
    
    // Third try: Check common paths
    const commonPaths = [
      '/pricing', '/prices', '/costs', '/price-list',
      '/procedure-costs', '/surgery-costs'
    ];
    
    for (const path of commonPaths) {
      try {
        const url = new URL(path, baseUrl).href;
        const response = await page.goto(url, { waitUntil: 'networkidle0', timeout: 5000 });
        if (response && response.status() < 400) {
          return url;
        }
      } catch (e) {
        // Continue
      }
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Extract pricing information from page
 */
async function extractPricing(page, sourceUrl) {
  try {
    const pricingData = await page.evaluate((procedures) => {
      const results = [];
      const textContent = document.body.innerText;
      
      // Search for each procedure with prices
      procedures.forEach(procedure => {
        // Find procedure name in text
        const procedureRegex = new RegExp(procedure.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        const procedureIndex = textContent.search(procedureRegex);
        
        if (procedureIndex !== -1) {
          // Extract text around procedure (200 characters before and after)
          const start = Math.max(0, procedureIndex - 200);
          const end = Math.min(textContent.length, procedureIndex + procedure.length + 200);
          const context = textContent.substring(start, end);
          
          // Look for price patterns near the procedure
          const pricePatterns = [
            /\$?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*(?:USD|usd|\$)?/g,
            /(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*(?:USD|US\s*Dollars?)/gi,
            /Price[:\s]+(\$?\s*\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i,
            /Cost[:\s]+(\$?\s*\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i
          ];
          
          const prices = [];
          for (const pattern of pricePatterns) {
            const matches = context.matchAll(pattern);
            for (const match of matches) {
              const priceStr = match[1]?.replace(/,/g, '') || match[0].replace(/[^0-9]/g, '');
              const priceNum = parseFloat(priceStr);
              if (priceNum > 100 && priceNum < 1000000) {
                prices.push({
                  procedure: procedure,
                  price: match[0].trim(),
                  value: priceNum
                });
                break; // Take first match
              }
            }
            if (prices.length > 0) break;
          }
          
          if (prices.length > 0) {
            results.push(prices[0]);
          }
        }
      });
      
      // Also look for price tables
      const tables = document.querySelectorAll('table');
      tables.forEach(table => {
        const rows = table.querySelectorAll('tr');
        rows.forEach(row => {
          const cells = row.querySelectorAll('td, th');
          if (cells.length >= 2) {
            const procedureCell = cells[0].textContent.trim();
            const priceCell = cells[cells.length - 1].textContent.trim();
            
            // Check if it matches any procedure
            const matchingProcedure = procedures.find(p => 
              procedureCell.toLowerCase().includes(p.toLowerCase()) ||
              p.toLowerCase().includes(procedureCell.toLowerCase())
            );
            
            if (matchingProcedure) {
              const priceMatch = priceCell.match(/\$?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
              if (priceMatch) {
                const priceNum = parseFloat(priceMatch[1].replace(/,/g, ''));
                if (priceNum > 100 && priceNum < 1000000) {
                  // Avoid duplicates
                  if (!results.find(r => r.procedure === matchingProcedure)) {
                    results.push({
                      procedure: matchingProcedure,
                      price: priceCell,
                      value: priceNum
                    });
                  }
                }
              }
            }
          }
        });
      });
      
      return results;
    }, COMMON_PROCEDURES);
    
    // Process and format pricing data
    const processedPricing = pricingData.map(item => {
      const priceInfo = extractPrice(item.price);
      return {
        procedure_name: item.procedure,
        price_usd: priceInfo?.value || item.value,
        price_range: priceInfo?.display || item.price,
        currency: 'USD',
        source_url: sourceUrl,
        verified: false
      };
    });
    
    return processedPricing;
  } catch (error) {
    console.error(`   ⚠️  Error extracting pricing: ${error.message}`);
    return [];
  }
}

/**
 * Scrape pricing from a facility website
 */
async function scrapePricingFromWebsite(facility) {
  if (!facility.website) {
    console.log(`   ⚠️  No website for ${facility.name}`);
    return { success: false, pricingCount: 0 };
  }
  
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  try {
    page.setDefaultNavigationTimeout(30000);
    page.setDefaultTimeout(30000);
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    console.log(`   🌐 Navigating to ${facility.website}...`);
    await page.goto(facility.website, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Try to find pricing page
    const pricingPageUrl = await findPricingPage(page, facility.website);
    
    if (pricingPageUrl && pricingPageUrl !== facility.website) {
      console.log(`   📄 Found pricing page: ${pricingPageUrl}`);
      await page.goto(pricingPageUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    } else {
      console.log(`   📄 Searching main page for pricing...`);
    }
    
    await page.waitForTimeout(2000);
    
    // Extract pricing
    const pricing = await extractPricing(page, pricingPageUrl || facility.website);
    
    if (pricing.length === 0) {
      console.log(`   ⚠️  No pricing found`);
      return { success: false, pricingCount: 0 };
    }
    
    console.log(`   ✅ Found ${pricing.length} procedure prices`);
    
    // Save pricing to database
    let savedCount = 0;
    for (const price of pricing) {
      try {
        const priceData = {
          facility_id: facility.id,
          procedure_name: price.procedure_name,
          price_usd: price.price_usd,
          price_range: price.price_range,
          currency: price.currency,
          source_url: price.source_url,
          verified: price.verified,
          last_verified: new Date().toISOString()
        };
        
        const { error } = await supabase
          .from('procedure_pricing')
          .insert(priceData);
        
        if (error) {
          if (!error.message.includes('duplicate') && !error.message.includes('unique')) {
            console.error(`   ⚠️  Error saving pricing for ${price.procedure_name}: ${error.message}`);
          }
        } else {
          savedCount++;
        }
      } catch (error) {
        console.error(`   ⚠️  Error processing pricing: ${error.message}`);
      }
    }
    
    // Update facility with pricing count and actual pricing JSON
    await supabase
      .from('facilities')
      .update({
        pricing_count: savedCount,
        has_verified_pricing: savedCount > 0,
        actual_pricing: pricing
      })
      .eq('id', facility.id);
    
    return { success: true, pricingCount: savedCount };
    
  } catch (error) {
    console.error(`   ❌ Failed to scrape pricing for ${facility.name}: ${error.message}`);
    return { success: false, pricingCount: 0, error: error.message };
  } finally {
    await browser.close();
  }
}

/**
 * Main function to scrape pricing for facilities
 */
async function scrapeAllPricing() {
  const args = process.argv.slice(2);
  const facilityIdArg = args.find(arg => arg.startsWith('--facility-id='));
  const limitArg = args.find(arg => arg.startsWith('--limit='));
  
  const facilityId = facilityIdArg ? facilityIdArg.split('=')[1] : null;
  const limit = limitArg ? parseInt(limitArg.split('=')[1]) : 10;
  
  console.log('💰 Starting Procedure Pricing Scraping...\n');
  
  // Fetch facilities with websites
  let query = supabase
    .from('facilities')
    .select('id, name, website, country, city')
    .not('website', 'is', null);
  
  if (facilityId) {
    query = query.eq('id', facilityId);
  } else {
    query = query.limit(limit);
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
  
  console.log(`📊 Found ${facilities.length} facilities to process\n`);
  
  let successCount = 0;
  let totalPricing = 0;
  
  for (const [index, facility] of facilities.entries()) {
    console.log(`\n[${index + 1}/${facilities.length}] Processing ${facility.name} (${facility.country})...`);
    
    const result = await scrapePricingFromWebsite(facility);
    
    if (result.success) {
      successCount++;
      totalPricing += result.pricingCount;
    }
    
    // Rate limiting
    if (index < facilities.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 SCRAPING SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Facilities Processed: ${facilities.length}`);
  console.log(`Successfully Scraped: ${successCount}`);
  console.log(`Total Prices Found: ${totalPricing}`);
  console.log(`Success Rate: ${((successCount/facilities.length)*100).toFixed(1)}%`);
  console.log('='.repeat(60));
}

// Run if called directly
if (require.main === module) {
  scrapeAllPricing().catch(console.error);
}

module.exports = { scrapePricingFromWebsite, extractPrice };

