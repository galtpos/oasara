/**
 * DEBUG SCRAPER - VISUAL FEEDBACK
 *
 * Run this to see EXACTLY what the scraper is finding on a website.
 * Opens a visible browser window with elements highlighted in different colors:
 * - GREEN: Doctor elements
 * - BLUE: Price elements
 * - YELLOW: Testimonial elements
 * - PURPLE: Package/Deal elements
 *
 * Usage:
 *   node scripts/debugScraper.js
 *
 * The browser will stay open so you can inspect what was found.
 */

import puppeteer from 'puppeteer';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

async function debugExtraction(facility) {
  console.log(`\n🔍 DEBUG MODE: ${facility.name}`);
  console.log(`🌐 Website: ${facility.website}\n`);

  const browser = await puppeteer.launch({
    headless: false,  // Show browser
    devtools: true,   // Open devtools
    args: ['--start-maximized'],
    defaultViewport: null
  });

  const page = await browser.newPage();

  // Log all console messages from the page
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    if (type === 'log') {
      console.log(`📄 PAGE LOG: ${text}`);
    }
  });

  try {
    console.log('⏳ Navigating to website...');
    await page.goto(facility.website, {
      waitUntil: 'networkidle2',
      timeout: 60000
    });

    console.log('✅ Page loaded! Analyzing elements...\n');

    // Wait a bit for JavaScript
    await page.waitForTimeout(3000);

    // Scroll to load lazy content
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let totalHeight = 0;
        const distance = 100;
        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;

          if(totalHeight >= scrollHeight){
            clearInterval(timer);
            resolve();
          }
        }, 100);
      });
    });

    // Highlight and count elements
    const stats = await page.evaluate(() => {
      const results = {
        doctors: 0,
        prices: 0,
        testimonials: 0,
        packages: 0,
        details: {
          doctorSelectors: [],
          priceSelectors: [],
          testimonialSelectors: [],
          packageSelectors: []
        }
      };

      // STRATEGY 1: Highlight doctor elements
      const doctorSelectors = [
        '.doctor-card', '.physician-card', '.staff-card', '.team-member',
        '.doctor', '.physician', '[class*="doctor"]', '[class*="physician"]',
        '[class*="staff"]', '[class*="team"]', '[data-doctor]', '[data-physician]'
      ];

      doctorSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          results.details.doctorSelectors.push(`${selector}: ${elements.length}`);
          elements.forEach(el => {
            el.style.border = '3px solid #00FF00';
            el.style.backgroundColor = 'rgba(0,255,0,0.1)';
            el.style.boxShadow = '0 0 10px #00FF00';
            results.doctors++;
          });
        }
      });

      // Also look for elements containing "Dr." or "MD"
      const allElements = document.querySelectorAll('*');
      allElements.forEach(el => {
        const text = el.textContent;
        if ((text.includes('Dr.') || text.includes('MD') || text.includes('Professor')) &&
            text.length < 500 && !el.querySelector('[style*="border"]')) {
          el.style.border = '3px solid #00FF00';
          el.style.backgroundColor = 'rgba(0,255,0,0.1)';
          results.doctors++;
        }
      });

      // STRATEGY 2: Highlight price elements
      const priceElements = Array.from(document.querySelectorAll('*'))
        .filter(el => {
          const text = el.textContent;
          return text.match(/[\$€£¥₹]\s*[\d,]+/) && text.length < 500;
        });

      priceElements.forEach(el => {
        if (!el.querySelector('[style*="border"]')) {
          el.style.border = '3px solid #0000FF';
          el.style.backgroundColor = 'rgba(0,0,255,0.1)';
          el.style.boxShadow = '0 0 10px #0000FF';
          results.prices++;
        }
      });

      // STRATEGY 3: Highlight testimonial/review elements
      const testimonialSelectors = [
        '.testimonial', '.review', '.patient-story',
        '[class*="testimonial"]', '[class*="review"]', '[class*="story"]'
      ];

      testimonialSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          results.details.testimonialSelectors.push(`${selector}: ${elements.length}`);
          elements.forEach(el => {
            el.style.border = '3px solid #FFFF00';
            el.style.backgroundColor = 'rgba(255,255,0,0.1)';
            el.style.boxShadow = '0 0 10px #FFFF00';
            results.testimonials++;
          });
        }
      });

      // STRATEGY 4: Highlight package/deal elements
      const packageSelectors = [
        '.package', '.deal', '.offer',
        '[class*="package"]', '[class*="deal"]', '[class*="offer"]'
      ];

      packageSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          results.details.packageSelectors.push(`${selector}: ${elements.length}`);
          elements.forEach(el => {
            el.style.border = '3px solid #9900FF';
            el.style.backgroundColor = 'rgba(153,0,255,0.1)';
            el.style.boxShadow = '0 0 10px #9900FF';
            results.packages++;
          });
        }
      });

      // Add legend to page
      const legend = document.createElement('div');
      legend.innerHTML = `
        <div style="position: fixed; top: 10px; right: 10px; background: white;
                    padding: 20px; border: 3px solid #000; z-index: 99999;
                    font-family: Arial; border-radius: 10px; box-shadow: 0 0 20px rgba(0,0,0,0.3);">
          <h3 style="margin: 0 0 10px 0;">🔍 Debug Mode - Element Finder</h3>
          <div style="margin: 5px 0;">
            <span style="display: inline-block; width: 15px; height: 15px;
                         background: rgba(0,255,0,0.3); border: 2px solid #00FF00;
                         margin-right: 5px;"></span>
            <strong>GREEN:</strong> Doctors (${results.doctors})
          </div>
          <div style="margin: 5px 0;">
            <span style="display: inline-block; width: 15px; height: 15px;
                         background: rgba(0,0,255,0.3); border: 2px solid #0000FF;
                         margin-right: 5px;"></span>
            <strong>BLUE:</strong> Prices (${results.prices})
          </div>
          <div style="margin: 5px 0;">
            <span style="display: inline-block; width: 15px; height: 15px;
                         background: rgba(255,255,0,0.3); border: 2px solid #FFFF00;
                         margin-right: 5px;"></span>
            <strong>YELLOW:</strong> Testimonials (${results.testimonials})
          </div>
          <div style="margin: 5px 0;">
            <span style="display: inline-block; width: 15px; height: 15px;
                         background: rgba(153,0,255,0.3); border: 2px solid #9900FF;
                         margin-right: 5px;"></span>
            <strong>PURPLE:</strong> Packages (${results.packages})
          </div>
          <hr style="margin: 10px 0;" />
          <small>Browser will stay open. Close it when done inspecting.</small>
        </div>
      `;
      document.body.appendChild(legend);

      // Scroll back to top
      window.scrollTo(0, 0);

      console.log('✅ Element highlighting complete!');
      console.log(`Found ${results.doctors} doctor elements`);
      console.log(`Found ${results.prices} price elements`);
      console.log(`Found ${results.testimonials} testimonial elements`);
      console.log(`Found ${results.packages} package elements`);

      return results;
    });

    // Print detailed results
    console.log('\n📊 DETECTION RESULTS:');
    console.log('═══════════════════════════════════════');
    console.log(`🟢 Doctors found: ${stats.doctors}`);
    console.log(`🔵 Prices found: ${stats.prices}`);
    console.log(`🟡 Testimonials found: ${stats.testimonials}`);
    console.log(`🟣 Packages found: ${stats.packages}`);
    console.log('═══════════════════════════════════════\n');

    if (stats.details.doctorSelectors.length > 0) {
      console.log('🟢 Doctor Selectors That Matched:');
      stats.details.doctorSelectors.forEach(s => console.log(`   - ${s}`));
      console.log('');
    }

    if (stats.details.testimonialSelectors.length > 0) {
      console.log('🟡 Testimonial Selectors That Matched:');
      stats.details.testimonialSelectors.forEach(s => console.log(`   - ${s}`));
      console.log('');
    }

    if (stats.details.packageSelectors.length > 0) {
      console.log('🟣 Package Selectors That Matched:');
      stats.details.packageSelectors.forEach(s => console.log(`   - ${s}`));
      console.log('');
    }

    // Now extract actual data to compare
    console.log('\n🔬 ATTEMPTING DATA EXTRACTION:');
    console.log('═══════════════════════════════════════\n');

    const extracted = await page.evaluate(() => {
      const data = {
        doctors: [],
        prices: [],
        testimonials: [],
        packages: []
      };

      // Extract from highlighted doctor elements
      const doctorElements = document.querySelectorAll('[style*="rgb(0, 255, 0)"]');
      doctorElements.forEach(el => {
        const text = el.textContent.trim();
        if (text.includes('Dr.') || text.includes('MD')) {
          const nameMatch = text.match(/(?:Dr\.?\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/);
          if (nameMatch) {
            data.doctors.push({
              name: nameMatch[1],
              snippet: text.substring(0, 100)
            });
          }
        }
      });

      // Extract from highlighted price elements
      const priceElements = document.querySelectorAll('[style*="rgb(0, 0, 255)"]');
      priceElements.forEach(el => {
        const text = el.textContent.trim();
        const priceMatch = text.match(/([\$€£¥₹]\s*[\d,]+)/);
        if (priceMatch) {
          data.prices.push({
            price: priceMatch[1],
            snippet: text.substring(0, 100)
          });
        }
      });

      // Extract from highlighted testimonials
      const testimonialElements = document.querySelectorAll('[style*="rgb(255, 255, 0)"]');
      testimonialElements.forEach(el => {
        const text = el.textContent.trim();
        if (text.length > 50) {
          data.testimonials.push({
            snippet: text.substring(0, 150)
          });
        }
      });

      // Extract from highlighted packages
      const packageElements = document.querySelectorAll('[style*="rgb(153, 0, 255)"]');
      packageElements.forEach(el => {
        const text = el.textContent.trim();
        if (text.length > 20) {
          data.packages.push({
            snippet: text.substring(0, 150)
          });
        }
      });

      return data;
    });

    if (extracted.doctors.length > 0) {
      console.log(`🟢 Extracted ${extracted.doctors.length} doctor names:`);
      extracted.doctors.slice(0, 5).forEach(d => {
        console.log(`   ✓ ${d.name}`);
        console.log(`     "${d.snippet}..."\n`);
      });
    } else {
      console.log('🟢 No doctors extracted (but elements were highlighted)');
    }

    if (extracted.prices.length > 0) {
      console.log(`🔵 Extracted ${extracted.prices.length} prices:`);
      extracted.prices.slice(0, 5).forEach(p => {
        console.log(`   ✓ ${p.price}`);
        console.log(`     "${p.snippet}..."\n`);
      });
    } else {
      console.log('🔵 No prices extracted (but elements were highlighted)');
    }

    if (extracted.testimonials.length > 0) {
      console.log(`🟡 Extracted ${extracted.testimonials.length} testimonials:`);
      extracted.testimonials.slice(0, 3).forEach(t => {
        console.log(`   ✓ "${t.snippet}..."\n`);
      });
    }

    if (extracted.packages.length > 0) {
      console.log(`🟣 Extracted ${extracted.packages.length} packages:`);
      extracted.packages.slice(0, 3).forEach(p => {
        console.log(`   ✓ "${p.snippet}..."\n`);
      });
    }

    console.log('\n════════════════════════════════════════════════════════');
    console.log('🎯 BROWSER WINDOW WILL STAY OPEN');
    console.log('   - Inspect highlighted elements');
    console.log('   - Open DevTools to see element structure');
    console.log('   - Close browser when done');
    console.log('════════════════════════════════════════════════════════\n');

    // Don't close browser - let user inspect
    // await browser.close();

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    await browser.close();
  }
}

// Main execution
async function main() {
  try {
    // Get a facility to debug (prefer one with a website)
    let facilityName = process.argv[2];

    let facility;

    if (facilityName) {
      // Search for specific facility by name
      const { data, error } = await supabase
        .from('facilities')
        .select('*')
        .not('website', 'is', null)
        .ilike('name', `%${facilityName}%`)
        .limit(1)
        .single();

      if (error) {
        console.error('❌ Facility not found. Try:');
        console.log('   node scripts/debugScraper.js "Bangkok Hospital"');
        process.exit(1);
      }

      facility = data;
    } else {
      // Use a random facility with a website
      const { data, error } = await supabase
        .from('facilities')
        .select('*')
        .not('website', 'is', null)
        .limit(1);

      if (error || !data || data.length === 0) {
        console.error('❌ No facilities with websites found');
        process.exit(1);
      }

      facility = data[0];

      console.log('\n💡 TIP: Run with facility name to debug specific site:');
      console.log('   node scripts/debugScraper.js "Bangkok Hospital"\n');
    }

    await debugExtraction(facility);

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

main();
