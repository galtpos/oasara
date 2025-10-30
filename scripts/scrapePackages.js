/**
 * Package Deals Scraper
 * Extracts all-inclusive package deals from facility websites
 * 
 * Usage: node scripts/scrapePackages.js [--facility-id=uuid] [--limit=10]
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

// Common URL patterns for package pages
const PACKAGE_PAGE_PATTERNS = [
  '/packages', '/package-deals', '/all-inclusive', '/special-offers',
  '/promotions', '/medical-packages', '/surgery-packages', '/tour-packages'
];

// Common package keywords
const PACKAGE_KEYWORDS = [
  'package', 'bundle', 'all-inclusive', 'special offer', 'deal',
  'combo', 'combination', 'inclusive', 'comprehensive'
];

/**
 * Extract price from text
 */
function extractPrice(text) {
  if (!text) return null;
  
  const pricePatterns = [
    /\$?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*(?:USD|usd|\$)?/g,
    /(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*(?:USD|US\s*Dollars?)/gi,
    /Price[:\s]+(\$?\s*\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i,
    /Cost[:\s]+(\$?\s*\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i,
    /From[:\s]+(\$?\s*\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i
  ];
  
  for (const pattern of pricePatterns) {
    const match = text.match(pattern);
    if (match) {
      const priceStr = (match[1] || match[0]).replace(/,/g, '').replace(/[^0-9.]/g, '');
      const priceNum = parseFloat(priceStr);
      if (priceNum > 100 && priceNum < 1000000) {
        return {
          value: priceNum,
          display: match[0].trim()
        };
      }
    }
  }
  
  return null;
}

/**
 * Extract duration from text
 */
function extractDuration(text) {
  if (!text) return null;
  
  const patterns = [
    /(\d+)\s*(?:days?|nights?)/i,
    /duration[:\s]+(\d+)\s*(?:days?|nights?)/i,
    /(\d+)\s*(?:day|night)\s*(?:package|stay|program)/i
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return parseInt(match[1]);
    }
  }
  
  return null;
}

/**
 * Extract what's included in package
 */
function extractIncludes(text) {
  if (!text) return [];
  
  const includes = [];
  const commonIncludes = [
    'hotel', 'accommodation', 'airport transfer', 'transfers',
    'consultation', 'surgery', 'post-operative care', 'follow-up',
    'meals', 'medications', 'medical tests', 'laboratory',
    'doctor fees', 'nursing care', 'physiotherapy', 'rehabilitation'
  ];
  
  commonIncludes.forEach(item => {
    const regex = new RegExp(`\\b${item}\\b`, 'i');
    if (regex.test(text)) {
      includes.push(item);
    }
  });
  
  return includes;
}

/**
 * Find packages page URL
 */
async function findPackagesPage(page, baseUrl) {
  try {
    // Look for links with package-related patterns
    for (const pattern of PACKAGE_PAGE_PATTERNS) {
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
    
    // Look for text content mentioning packages
    const links = await page.$$eval('a', (anchors) => {
      return anchors
        .map(a => ({ text: a.textContent.toLowerCase(), href: a.href }))
        .filter(a => 
          a.text.includes('package') || 
          a.text.includes('deal') || 
          a.text.includes('offer') ||
          a.text.includes('bundle')
        )
        .map(a => a.href);
    });
    
    if (links.length > 0) {
      return links[0];
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Extract package deals from page
 */
async function extractPackages(page, sourceUrl) {
  try {
    const packages = await page.evaluate((keywords) => {
      const extractedPackages = [];
      
      // Look for elements containing package keywords
      const allElements = Array.from(document.querySelectorAll('*'));
      const packageElements = allElements.filter(el => {
        const text = el.textContent.toLowerCase();
        return keywords.some(keyword => text.includes(keyword)) &&
               text.match(/\$[\d,]+/) && // Must contain a price
               el.textContent.length > 50 && // Must have substantial content
               el.textContent.length < 2000; // Not too long
      });
      
      packageElements.forEach(element => {
        const text = element.textContent.trim();
        const priceMatch = text.match(/\$[\d,]+/);
        
        if (priceMatch) {
          // Try to find package name (usually in heading)
          const heading = element.querySelector('h1, h2, h3, h4, h5, h6, .title, .package-name');
          const name = heading?.textContent.trim() || text.slice(0, 100).split('\n')[0].trim();
          
          // Extract description
          const description = text.slice(0, 500);
          
          extractedPackages.push({
            name: name,
            description: description,
            price_text: priceMatch[0]
          });
        }
      });
      
      // Also look for structured package cards/sections
      const packageCards = document.querySelectorAll(
        '.package-card, .deal-card, .offer-card, [class*="package"], [class*="deal"]'
      );
      
      packageCards.forEach(card => {
        const nameEl = card.querySelector('h1, h2, h3, h4, .title, .package-name');
        const priceEl = card.querySelector('.price, .cost, [class*="price"]');
        const descEl = card.querySelector('.description, .details, p');
        
        if (nameEl && priceEl) {
          const name = nameEl.textContent.trim();
          const priceText = priceEl.textContent.trim();
          const priceMatch = priceText.match(/\$[\d,]+/);
          
          if (priceMatch) {
            extractedPackages.push({
              name: name,
              description: descEl?.textContent.trim() || '',
              price_text: priceMatch[0]
            });
          }
        }
      });
      
      // Remove duplicates based on name similarity
      const uniquePackages = [];
      extractedPackages.forEach(pkg => {
        const isDuplicate = uniquePackages.some(existing => {
          const similarity = existing.name.toLowerCase().localeCompare(pkg.name.toLowerCase());
          return Math.abs(similarity) < 10;
        });
        
        if (!isDuplicate) {
          uniquePackages.push(pkg);
        }
      });
      
      return uniquePackages;
    }, PACKAGE_KEYWORDS);
    
    // Process packages
    const processedPackages = packages.map(pkg => {
      const priceInfo = extractPrice(pkg.price_text || pkg.description);
      const duration = extractDuration(pkg.description);
      const includes = extractIncludes(pkg.description);
      
      return {
        package_name: pkg.name || 'Medical Package',
        description: pkg.description,
        price_usd: priceInfo?.value || null,
        price_local: pkg.price_text || null,
        currency: 'USD',
        includes: includes,
        duration_days: duration,
        source_url: sourceUrl
      };
    });
    
    return processedPackages.filter(pkg => pkg.price_usd !== null);
  } catch (error) {
    console.error(`   ⚠️  Error extracting packages: ${error.message}`);
    return [];
  }
}

/**
 * Scrape packages from a facility website
 */
async function scrapePackagesFromWebsite(facility) {
  if (!facility.website) {
    console.log(`   ⚠️  No website for ${facility.name}`);
    return { success: false, packagesCount: 0 };
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
    
    // Try to find packages page
    const packagesPageUrl = await findPackagesPage(page, facility.website);
    
    if (packagesPageUrl && packagesPageUrl !== facility.website) {
      console.log(`   📄 Found packages page: ${packagesPageUrl}`);
      await page.goto(packagesPageUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    } else {
      console.log(`   📄 Searching main page for packages...`);
    }
    
    await page.waitForTimeout(2000);
    
    // Extract packages
    const packages = await extractPackages(page, packagesPageUrl || facility.website);
    
    if (packages.length === 0) {
      console.log(`   ⚠️  No packages found`);
      return { success: false, packagesCount: 0 };
    }
    
    console.log(`   ✅ Found ${packages.length} packages`);
    
    // Save packages to database
    let savedCount = 0;
    for (const pkg of packages) {
      try {
        const packageData = {
          facility_id: facility.id,
          package_name: pkg.package_name,
          description: pkg.description,
          price_usd: pkg.price_usd,
          price_local: pkg.price_local,
          currency: pkg.currency,
          includes: pkg.includes,
          duration_days: pkg.duration_days,
          source_url: pkg.source_url
        };
        
        const { error } = await supabase
          .from('facility_packages')
          .insert(packageData);
        
        if (error) {
          if (!error.message.includes('duplicate') && !error.message.includes('unique')) {
            console.error(`   ⚠️  Error saving package ${pkg.package_name}: ${error.message}`);
          }
        } else {
          savedCount++;
          console.log(`   ✅ Added package: ${pkg.package_name} - ${pkg.price_local || `$${pkg.price_usd}`}`);
        }
      } catch (error) {
        console.error(`   ⚠️  Error processing package: ${error.message}`);
      }
    }
    
    // Update facility with package count
    await supabase
      .from('facilities')
      .update({ packages_count: savedCount })
      .eq('id', facility.id);
    
    return { success: true, packagesCount: savedCount };
    
  } catch (error) {
    console.error(`   ❌ Failed to scrape packages for ${facility.name}: ${error.message}`);
    return { success: false, packagesCount: 0, error: error.message };
  } finally {
    await browser.close();
  }
}

/**
 * Main function to scrape packages for facilities
 */
async function scrapeAllPackages() {
  const args = process.argv.slice(2);
  const facilityIdArg = args.find(arg => arg.startsWith('--facility-id='));
  const limitArg = args.find(arg => arg.startsWith('--limit='));
  
  const facilityId = facilityIdArg ? facilityIdArg.split('=')[1] : null;
  const limit = limitArg ? parseInt(limitArg.split('=')[1]) : 10;
  
  console.log('📦 Starting Package Deals Scraping...\n');
  
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
  let totalPackages = 0;
  
  for (const [index, facility] of facilities.entries()) {
    console.log(`\n[${index + 1}/${facilities.length}] Processing ${facility.name} (${facility.country})...`);
    
    const result = await scrapePackagesFromWebsite(facility);
    
    if (result.success) {
      successCount++;
      totalPackages += result.packagesCount;
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
  console.log(`Total Packages Found: ${totalPackages}`);
  console.log(`Success Rate: ${((successCount/facilities.length)*100).toFixed(1)}%`);
  console.log('='.repeat(60));
}

// Run if called directly
if (require.main === module) {
  scrapeAllPackages().catch(console.error);
}

module.exports = { scrapePackagesFromWebsite };

