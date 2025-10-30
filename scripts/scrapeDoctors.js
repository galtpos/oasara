/**
 * Doctor Profile Scraper
 * Extracts doctor information from facility websites
 * 
 * Usage: node scripts/scrapeDoctors.js [--facility-id=uuid] [--limit=10]
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

// Common URL patterns for doctor pages
const DOCTOR_PAGE_PATTERNS = [
  '/doctors', '/our-doctors', '/medical-team', '/specialists',
  '/physicians', '/medical-staff', '/our-team', '/staff',
  '/team', '/about/team', '/meet-our-doctors', '/doctors-team'
];

// Common CSS selectors for doctor cards
const DOCTOR_SELECTORS = [
  '.doctor-card', '.team-member', '.staff-member', 
  '[class*="doctor"]', '[class*="physician"]', 
  '[class*="specialist"]', '.medical-professional',
  '.doctor-list-item', '.physician-card'
];

/**
 * Extract qualifications from text
 */
function extractQualifications(text) {
  if (!text) return [];
  
  const qualifications = [];
  const patterns = [
    'MD', 'MBBS', 'PhD', 'FRCS', 'FACS', 'Board Certified',
    'FACP', 'FRCP', 'DDS', 'DMD', 'MBChB', 'MRCS', 'MRCP',
    'FICC', 'FICS', 'FAMM', 'FCPS', 'MCh', 'MS', 'DM', 'DNB'
  ];
  
  patterns.forEach(pattern => {
    const regex = new RegExp(`\\b${pattern}\\b`, 'i');
    if (regex.test(text)) {
      qualifications.push(pattern);
    }
  });
  
  return qualifications;
}

/**
 * Extract years of experience from text
 */
function extractYearsExperience(text) {
  if (!text) return null;
  
  const patterns = [
    /(\d+)\s*years?\s*(of\s*)?experience/i,
    /experience\s*(of\s*)?(\d+)\s*years?/i,
    /(\d+)\+?\s*years?\s*(in|of)/i
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return parseInt(match[1] || match[2] || match[0]);
    }
  }
  
  return null;
}

/**
 * Extract languages from text
 */
function extractLanguages(text) {
  if (!text) return [];
  
  const languages = [];
  const commonLanguages = [
    'English', 'Spanish', 'French', 'German', 'Arabic', 
    'Chinese', 'Japanese', 'Korean', 'Hindi', 'Thai',
    'Turkish', 'Portuguese', 'Russian', 'Italian', 'Dutch',
    'Mandarin', 'Cantonese', 'Bengali', 'Urdu', 'Malay'
  ];
  
  // Check for language mentions
  commonLanguages.forEach(lang => {
    const regex = new RegExp(`\\b${lang}\\b`, 'i');
    if (regex.test(text)) {
      languages.push(lang);
    }
  });
  
  return languages;
}

/**
 * Find doctors page URL from main website
 */
async function findDoctorsPage(page, baseUrl) {
  try {
    // First try: Look for links with doctor-related patterns
    for (const pattern of DOCTOR_PAGE_PATTERNS) {
      try {
        const link = await page.$(`a[href*="${pattern}"]`);
        if (link) {
          const href = await page.evaluate(el => el.href, link);
          if (href && href.startsWith('http')) {
            return href;
          }
        }
      } catch (e) {
        // Continue to next pattern
      }
    }
    
    // Second try: Look for text content mentioning doctors
    const links = await page.$$eval('a', (anchors) => {
      return anchors
        .map(a => ({ text: a.textContent.toLowerCase(), href: a.href }))
        .filter(a => 
          a.text.includes('doctor') || 
          a.text.includes('physician') || 
          a.text.includes('team') ||
          a.text.includes('specialist')
        )
        .map(a => a.href);
    });
    
    if (links.length > 0) {
      return links[0];
    }
    
    // Third try: Check sitemap or common paths
    const commonPaths = [
      '/doctors', '/our-doctors', '/medical-team', '/team',
      '/about/doctors', '/about/team', '/staff'
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
    console.error(`   ⚠️  Error finding doctors page: ${error.message}`);
    return null;
  }
}

/**
 * Extract doctor information from page
 */
async function extractDoctors(page) {
  try {
    const doctors = await page.evaluate((selectors) => {
      const extractedDoctors = [];
      
      // Try each selector pattern
      for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        
        elements.forEach(element => {
          try {
            const nameElement = element.querySelector('h1, h2, h3, h4, h5, .name, .doctor-name, [class*="name"]');
            const specialtyElement = element.querySelector('.specialty, .designation, .title, [class*="specialty"], [class*="title"]');
            const bioElement = element.querySelector('.bio, .description, p, [class*="bio"], [class*="description"]');
            const imageElement = element.querySelector('img');
            const emailElement = element.querySelector('a[href^="mailto:"]');
            
            if (nameElement && nameElement.textContent.trim().length > 2) {
              const name = nameElement.textContent.trim();
              
              // Skip if already extracted (check for duplicates)
              if (!extractedDoctors.find(d => d.name === name)) {
                extractedDoctors.push({
                  name: name,
                  specialty: specialtyElement?.textContent.trim() || '',
                  bio: bioElement?.textContent.trim() || '',
                  image_url: imageElement?.src || imageElement?.getAttribute('data-src') || '',
                  email: emailElement?.href?.replace('mailto:', '') || ''
                });
              }
            }
          } catch (e) {
            // Skip this element if there's an error
          }
        });
        
        if (extractedDoctors.length > 0) break; // Found doctors, stop trying other selectors
      }
      
      // Fallback: Look for structured data (schema.org)
      if (extractedDoctors.length === 0) {
        const schemaDoctors = document.querySelectorAll('[itemtype*="Person"], [itemtype*="Physician"]');
        schemaDoctors.forEach(element => {
          const nameEl = element.querySelector('[itemprop="name"]');
          if (nameEl) {
            extractedDoctors.push({
              name: nameEl.textContent.trim(),
              specialty: element.querySelector('[itemprop="jobTitle"]')?.textContent.trim() || '',
              bio: element.querySelector('[itemprop="description"]')?.textContent.trim() || '',
              image_url: element.querySelector('[itemprop="image"]')?.src || '',
              email: element.querySelector('[itemprop="email"]')?.textContent.trim() || ''
            });
          }
        });
      }
      
      return extractedDoctors;
    }, DOCTOR_SELECTORS);
    
    return doctors.filter(d => d.name && d.name.length > 2);
  } catch (error) {
    console.error(`   ⚠️  Error extracting doctors: ${error.message}`);
    return [];
  }
}

/**
 * Scrape doctors from a facility website
 */
async function scrapeDoctorsFromWebsite(facility) {
  if (!facility.website) {
    console.log(`   ⚠️  No website for ${facility.name}`);
    return { success: false, doctorsCount: 0 };
  }
  
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  try {
    // Set reasonable timeouts
    page.setDefaultNavigationTimeout(30000);
    page.setDefaultTimeout(30000);
    
    // Set user agent to avoid blocking
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    console.log(`   🌐 Navigating to ${facility.website}...`);
    await page.goto(facility.website, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Find doctors page
    const doctorsPageUrl = await findDoctorsPage(page, facility.website);
    
    if (!doctorsPageUrl) {
      console.log(`   ⚠️  Could not find doctors page for ${facility.name}`);
      return { success: false, doctorsCount: 0 };
    }
    
    console.log(`   📄 Found doctors page: ${doctorsPageUrl}`);
    await page.goto(doctorsPageUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Wait a bit for dynamic content
    await page.waitForTimeout(2000);
    
    // Extract doctors
    const doctors = await extractDoctors(page);
    
    if (doctors.length === 0) {
      console.log(`   ⚠️  No doctors found on page`);
      return { success: false, doctorsCount: 0 };
    }
    
    console.log(`   ✅ Found ${doctors.length} doctors`);
    
    // Save doctors to database
    let savedCount = 0;
    for (const doctor of doctors) {
      try {
        const doctorData = {
          facility_id: facility.id,
          name: doctor.name,
          specialty: doctor.specialty || null,
          bio: doctor.bio || null,
          image_url: doctor.image_url || null,
          qualifications: extractQualifications(doctor.bio || doctor.specialty || ''),
          languages: extractLanguages(doctor.bio || ''),
          years_experience: extractYearsExperience(doctor.bio || ''),
          email: doctor.email || null
        };
        
        const { error } = await supabase
          .from('doctors')
          .insert(doctorData);
        
        if (error) {
          // Skip duplicates silently
          if (!error.message.includes('duplicate') && !error.message.includes('unique')) {
            console.error(`   ⚠️  Error saving doctor ${doctor.name}: ${error.message}`);
          }
        } else {
          savedCount++;
          console.log(`   ✅ Added doctor: ${doctor.name}`);
        }
      } catch (error) {
        console.error(`   ⚠️  Error processing doctor ${doctor.name}: ${error.message}`);
      }
    }
    
    // Update facility with doctor count
    await supabase
      .from('facilities')
      .update({ doctors_count: savedCount })
      .eq('id', facility.id);
    
    return { success: true, doctorsCount: savedCount };
    
  } catch (error) {
    console.error(`   ❌ Failed to scrape ${facility.name}: ${error.message}`);
    return { success: false, doctorsCount: 0, error: error.message };
  } finally {
    await browser.close();
  }
}

/**
 * Main function to scrape doctors for facilities
 */
async function scrapeAllDoctors() {
  const args = process.argv.slice(2);
  const facilityIdArg = args.find(arg => arg.startsWith('--facility-id='));
  const limitArg = args.find(arg => arg.startsWith('--limit='));
  
  const facilityId = facilityIdArg ? facilityIdArg.split('=')[1] : null;
  const limit = limitArg ? parseInt(limitArg.split('=')[1]) : 10;
  
  console.log('🔍 Starting Doctor Profile Scraping...\n');
  
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
  let totalDoctors = 0;
  
  for (const [index, facility] of facilities.entries()) {
    console.log(`\n[${index + 1}/${facilities.length}] Processing ${facility.name} (${facility.country})...`);
    
    const result = await scrapeDoctorsFromWebsite(facility);
    
    if (result.success) {
      successCount++;
      totalDoctors += result.doctorsCount;
    }
    
    // Rate limiting - wait 3 seconds between facilities
    if (index < facilities.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 SCRAPING SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Facilities Processed: ${facilities.length}`);
  console.log(`Successfully Scraped: ${successCount}`);
  console.log(`Total Doctors Found: ${totalDoctors}`);
  console.log(`Success Rate: ${((successCount/facilities.length)*100).toFixed(1)}%`);
  console.log('='.repeat(60));
}

// Run if called directly
if (require.main === module) {
  scrapeAllDoctors().catch(console.error);
}

module.exports = { scrapeDoctorsFromWebsite, extractQualifications, extractLanguages, extractYearsExperience };

