/**
 * Testimonials and Success Metrics Scraper
 * Extracts patient testimonials and facility success metrics
 * 
 * Usage: node scripts/scrapeTestimonials.js [--facility-id=uuid] [--limit=10]
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

// Common URL patterns for testimonials/reviews pages
const TESTIMONIAL_PAGE_PATTERNS = [
  '/testimonials', '/reviews', '/patient-stories', '/success-stories',
  '/patient-reviews', '/feedback', '/reviews-testimonials', '/about/reviews'
];

/**
 * Extract rating from text or element
 */
function extractRating(text) {
  if (!text) return null;
  
  // Look for star ratings: 5/5, 4 stars, ⭐⭐⭐⭐⭐
  const patterns = [
    /(\d+)\s*\/\s*5/i,
    /(\d+)\s*stars?/i,
    /rating[:\s]+(\d+)/i,
    /(\d+)\s*out\s*of\s*5/i
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const rating = parseInt(match[1]);
      if (rating >= 1 && rating <= 5) {
        return rating;
      }
    }
  }
  
  // Count star emojis
  const starCount = (text.match(/⭐|★|star/gi) || []).length;
  if (starCount >= 1 && starCount <= 5) {
    return starCount;
  }
  
  return null;
}

/**
 * Extract date from text
 */
function extractDate(text) {
  if (!text) return null;
  
  const patterns = [
    /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/,
    /(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}/i,
    /(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      try {
        const date = new Date(match[0]);
        if (!isNaN(date.getTime())) {
          return date.toISOString().split('T')[0];
        }
      } catch (e) {
        // Continue
      }
    }
  }
  
  return null;
}

/**
 * Extract testimonials from page
 */
async function extractTestimonials(page) {
  try {
    const testimonials = await page.evaluate(() => {
      const extracted = [];
      
      // Common testimonial selectors
      const selectors = [
        '.testimonial', '.review', '.patient-story', 
        '[class*="testimonial"]', '[class*="review"]',
        'blockquote', '.quote', '.feedback-item'
      ];
      
      for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        
        elements.forEach(element => {
          try {
            const textEl = element.querySelector('p, .text, .review-text, .testimonial-text, .quote-text');
            const nameEl = element.querySelector('.name, .author, .patient-name, [class*="name"]');
            const ratingEl = element.querySelector('.rating, .stars, [class*="rating"]');
            const dateEl = element.querySelector('.date, .review-date, [class*="date"]');
            
            const text = textEl?.textContent.trim() || element.textContent.trim();
            const name = nameEl?.textContent.trim() || null;
            const ratingText = ratingEl?.textContent.trim() || ratingEl?.getAttribute('data-rating') || null;
            const dateText = dateEl?.textContent.trim() || null;
            
            // Must have substantial text content
            if (text && text.length > 20) {
              extracted.push({
                text: text,
                patient_name: name,
                rating_text: ratingText,
                date_text: dateText,
                full_text: element.textContent.trim()
              });
            }
          } catch (e) {
            // Skip this element
          }
        });
        
        if (extracted.length > 0) break; // Found testimonials, stop trying other selectors
      }
      
      // Also look for structured review data
      const reviewCards = document.querySelectorAll('[itemtype*="Review"], [itemprop="review"]');
      reviewCards.forEach(element => {
        const textEl = element.querySelector('[itemprop="reviewBody"]');
        const nameEl = element.querySelector('[itemprop="author"]');
        const ratingEl = element.querySelector('[itemprop="ratingValue"]');
        const dateEl = element.querySelector('[itemprop="datePublished"]');
        
        if (textEl) {
          extracted.push({
            text: textEl.textContent.trim(),
            patient_name: nameEl?.textContent.trim() || null,
            rating_text: ratingEl?.textContent.trim() || ratingEl?.getAttribute('content') || null,
            date_text: dateEl?.textContent.trim() || dateEl?.getAttribute('content') || null,
            full_text: element.textContent.trim()
          });
        }
      });
      
      // Remove duplicates based on text similarity
      const unique = [];
      extracted.forEach(item => {
        const isDuplicate = unique.some(existing => {
          const similarity = existing.text.length > 0 ? 
            (existing.text.substring(0, 50) === item.text.substring(0, 50)) : false;
          return similarity;
        });
        
        if (!isDuplicate) {
          unique.push(item);
        }
      });
      
      return unique;
    });
    
    // Process testimonials
    const processed = testimonials.map(testimonial => {
      const rating = extractRating(testimonial.rating_text || testimonial.full_text);
      const date = extractDate(testimonial.date_text || testimonial.full_text);
      
      // Try to extract procedure name from text
      const procedureMatch = testimonial.text.match(/(breast|knee|hip|dental|cosmetic|surgery|implant|transplant|ivf|lasik)/i);
      const procedureName = procedureMatch ? procedureMatch[0] : null;
      
      return {
        patient_name: testimonial.patient_name || null,
        procedure_name: procedureName,
        rating: rating || 5, // Default to 5 if not found
        review_text: testimonial.text,
        review_date: date
      };
    });
    
    return processed;
  } catch (error) {
    console.error(`   ⚠️  Error extracting testimonials: ${error.message}`);
    return [];
  }
}

/**
 * Extract success metrics from page
 */
async function extractSuccessMetrics(page, sourceUrl) {
  try {
    const metrics = await page.evaluate(() => {
      const extractedMetrics = {};
      const text = document.body.innerText;
      
      // Patterns for success metrics
      const patterns = [
        {
          type: 'successful_surgeries',
          regex: /(\d+[,\d]*)\+?\s*(?:successful\s*)?surgeries?/i
        },
        {
          type: 'patients_treated',
          regex: /(\d+[,\d]*)\+?\s*patients?\s*(?:treated|served)/i
        },
        {
          type: 'years_experience',
          regex: /(\d+[,\d]*)\+?\s*years?\s*(?:of\s*)?experience/i
        },
        {
          type: 'success_rate',
          regex: /(\d+[,\d]*)%\s*success\s*rate/i
        },
        {
          type: 'satisfaction_rate',
          regex: /(\d+[,\d]*)%\s*(?:patient\s*)?satisfaction/i
        },
        {
          type: 'procedures_performed',
          regex: /(\d+[,\d]*)\+?\s*procedures?\s*(?:performed|completed)/i
        },
        {
          type: 'doctors_count',
          regex: /(\d+[,\d]*)\+?\s*(?:doctors?|physicians?|specialists?)/i
        }
      ];
      
      patterns.forEach(pattern => {
        const match = text.match(pattern.regex);
        if (match) {
          const value = match[1].replace(/,/g, '');
          // Get context around the match (100 chars before and after)
          const matchIndex = text.indexOf(match[0]);
          const context = text.substring(
            Math.max(0, matchIndex - 100),
            Math.min(text.length, matchIndex + match[0].length + 100)
          );
          
          extractedMetrics[pattern.type] = {
            value: value,
            display: match[0],
            context: context
          };
        }
      });
      
      return extractedMetrics;
    });
    
    // Convert to array format for database
    const metricsArray = Object.entries(metrics).map(([type, data]) => ({
      metric_type: type,
      metric_value: data.value,
      description: data.display,
      source_url: sourceUrl
    }));
    
    return metricsArray;
  } catch (error) {
    console.error(`   ⚠️  Error extracting metrics: ${error.message}`);
    return [];
  }
}

/**
 * Find testimonials page URL
 */
async function findTestimonialsPage(page, baseUrl) {
  try {
    for (const pattern of TESTIMONIAL_PAGE_PATTERNS) {
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
    
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Scrape testimonials and metrics from a facility website
 */
async function scrapeTestimonialsFromWebsite(facility) {
  if (!facility.website) {
    console.log(`   ⚠️  No website for ${facility.name}`);
    return { success: false, testimonialsCount: 0, metricsCount: 0 };
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
    
    // Extract metrics from main page (usually on homepage)
    console.log(`   📊 Extracting success metrics...`);
    const metrics = await extractSuccessMetrics(page, facility.website);
    
    // Try to find testimonials page
    const testimonialsPageUrl = await findTestimonialsPage(page, facility.website);
    
    let testimonials = [];
    
    if (testimonialsPageUrl && testimonialsPageUrl !== facility.website) {
      console.log(`   📄 Found testimonials page: ${testimonialsPageUrl}`);
      await page.goto(testimonialsPageUrl, { waitUntil: 'networkidle2', timeout: 30000 });
      await page.waitForTimeout(2000);
      testimonials = await extractTestimonials(page);
    } else {
      console.log(`   📄 Searching main page for testimonials...`);
      testimonials = await extractTestimonials(page);
    }
    
    const testimonialsCount = testimonials.length;
    const metricsCount = metrics.length;
    
    if (testimonialsCount === 0 && metricsCount === 0) {
      console.log(`   ⚠️  No testimonials or metrics found`);
      return { success: false, testimonialsCount: 0, metricsCount: 0 };
    }
    
    console.log(`   ✅ Found ${testimonialsCount} testimonials and ${metricsCount} metrics`);
    
    // Save testimonials to database
    let savedTestimonials = 0;
    for (const testimonial of testimonials) {
      try {
        const testimonialData = {
          facility_id: facility.id,
          patient_name: testimonial.patient_name,
          procedure_name: testimonial.procedure_name,
          rating: testimonial.rating,
          review_text: testimonial.review_text,
          review_date: testimonial.review_date,
          verified: false,
          source_url: facility.website
        };
        
        const { error } = await supabase
          .from('testimonials')
          .insert(testimonialData);
        
        if (error) {
          if (!error.message.includes('duplicate') && !error.message.includes('unique')) {
            console.error(`   ⚠️  Error saving testimonial: ${error.message}`);
          }
        } else {
          savedTestimonials++;
        }
      } catch (error) {
        console.error(`   ⚠️  Error processing testimonial: ${error.message}`);
      }
    }
    
    // Save metrics to database
    let savedMetrics = 0;
    for (const metric of metrics) {
      try {
        const metricData = {
          facility_id: facility.id,
          metric_type: metric.metric_type,
          metric_value: metric.metric_value,
          description: metric.description,
          source_url: metric.source_url,
          verified: false
        };
        
        const { error } = await supabase
          .from('success_metrics')
          .upsert(metricData, { onConflict: 'facility_id,metric_type' });
        
        if (error) {
          console.error(`   ⚠️  Error saving metric ${metric.metric_type}: ${error.message}`);
        } else {
          savedMetrics++;
        }
      } catch (error) {
        console.error(`   ⚠️  Error processing metric: ${error.message}`);
      }
    }
    
    // Update facility with counts and metrics JSON
    const metricsJson = metrics.reduce((acc, m) => {
      acc[m.metric_type] = m.metric_value;
      return acc;
    }, {});
    
    await supabase
      .from('facilities')
      .update({
        testimonials_count: savedTestimonials,
        success_metrics: metricsJson
      })
      .eq('id', facility.id);
    
    return { 
      success: true, 
      testimonialsCount: savedTestimonials, 
      metricsCount: savedMetrics 
    };
    
  } catch (error) {
    console.error(`   ❌ Failed to scrape testimonials for ${facility.name}: ${error.message}`);
    return { success: false, testimonialsCount: 0, metricsCount: 0, error: error.message };
  } finally {
    await browser.close();
  }
}

/**
 * Main function to scrape testimonials for facilities
 */
async function scrapeAllTestimonials() {
  const args = process.argv.slice(2);
  const facilityIdArg = args.find(arg => arg.startsWith('--facility-id='));
  const limitArg = args.find(arg => arg.startsWith('--limit='));
  
  const facilityId = facilityIdArg ? facilityIdArg.split('=')[1] : null;
  const limit = limitArg ? parseInt(limitArg.split('=')[1]) : 10;
  
  console.log('💬 Starting Testimonials & Metrics Scraping...\n');
  
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
  let totalTestimonials = 0;
  let totalMetrics = 0;
  
  for (const [index, facility] of facilities.entries()) {
    console.log(`\n[${index + 1}/${facilities.length}] Processing ${facility.name} (${facility.country})...`);
    
    const result = await scrapeTestimonialsFromWebsite(facility);
    
    if (result.success) {
      successCount++;
      totalTestimonials += result.testimonialsCount;
      totalMetrics += result.metricsCount;
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
  console.log(`Total Testimonials Found: ${totalTestimonials}`);
  console.log(`Total Metrics Found: ${totalMetrics}`);
  console.log(`Success Rate: ${((successCount/facilities.length)*100).toFixed(1)}%`);
  console.log('='.repeat(60));
}

// Run if called directly
if (require.main === module) {
  scrapeAllTestimonials().catch(console.error);
}

module.exports = { scrapeTestimonialsFromWebsite, extractSuccessMetrics };

