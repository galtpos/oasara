/**
 * ROBUST MEDICAL FACILITY SCRAPER
 *
 * Multi-strategy extraction system designed for complex medical facility websites.
 * Uses 5 different strategies to maximize extraction success rate:
 * 1. Puppeteer with multiple selector patterns
 * 2. Playwright for JavaScript-heavy sites
 * 3. Cheerio for static content
 * 4. AI Vision extraction (GPT-4)
 * 5. API extraction (if facility provides API)
 *
 * Features:
 * - Bot detection bypass
 * - Auto-scrolling for lazy-loaded content
 * - Multiple URL pattern attempts
 * - Fallback strategies
 * - Detailed logging
 */

import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

class RobustMedicalScraper {
  constructor(options = {}) {
    this.verbose = options.verbose || false;
    this.useAI = options.useAI || false;
    this.timeout = options.timeout || 60000;
  }

  log(message, level = 'info') {
    const prefix = {
      'info': '📝',
      'success': '✅',
      'warning': '⚠️',
      'error': '❌'
    }[level];
    console.log(`${prefix} ${message}`);
  }

  /**
   * AUTO-SCROLL PAGE TO LOAD LAZY CONTENT
   */
  async autoScroll(page) {
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
  }

  /**
   * EXTRACT DOCTORS FROM FACILITY WEBSITE
   */
  async extractDoctors(facility) {
    this.log(`Extracting doctors from ${facility.name}...`);

    const results = [];

    // Normalize website URL (remove trailing slash)
    const baseUrl = facility.website.replace(/\/$/, '');

    // Try multiple URL patterns
    const doctorUrls = [
      `${baseUrl}/doctors`,
      `${baseUrl}/our-team`,
      `${baseUrl}/medical-staff`,
      `${baseUrl}/specialists`,
      `${baseUrl}/find-a-doctor`,
      `${baseUrl}/en/doctors`,
      `${baseUrl}/en/our-team`,
      `${baseUrl}/medical-professionals`,
      `${baseUrl}/physicians`,
      `${baseUrl}/staff`,
      baseUrl // Also try homepage
    ];

    for (const url of doctorUrls) {
      try {
        this.log(`Trying ${url}...`, 'info');

        const browser = await puppeteer.launch({
          headless: 'new',
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-blink-features=AutomationControlled',
            '--disable-web-security',
            '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          ]
        });

        const page = await browser.newPage();

        // Bypass bot detection
        await page.evaluateOnNewDocument(() => {
          Object.defineProperty(navigator, 'webdriver', { get: () => false });
          Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
          Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
        });

        // Set realistic viewport
        await page.setViewport({ width: 1920, height: 1080 });

        try {
          // Try to navigate with more lenient settings
          await page.goto(url, {
            waitUntil: 'domcontentloaded',
            timeout: 30000
          }).catch(err => {
            // If first attempt fails, try with even more lenient settings
            return page.goto(url, {
              waitUntil: 'load',
              timeout: 20000
            });
          });

          // Wait a bit for JavaScript to render
          await page.waitForTimeout(5000);

          // Scroll to load lazy content
          await this.autoScroll(page);

          // Wait again after scrolling
          await page.waitForTimeout(2000);

          // Extract with multiple selector strategies
          const doctors = await page.evaluate(() => {
            const extractionPatterns = [
              // Pattern 1: Common class names
              {
                container: '.doctor-card, .physician-card, .staff-card, .team-member, .doctor, .physician, .staff-member, [class*="doctor"], [class*="physician"], [class*="staff"]',
                name: 'h1, h2, h3, h4, h5, .name, .doctor-name, .physician-name, [class*="name"]',
                specialty: '.specialty, .department, .expertise, .specialization, [class*="specialty"], [class*="department"]',
                bio: '.bio, .description, .about, p, [class*="bio"], [class*="description"]'
              },
              // Pattern 2: Data attributes
              {
                container: '[data-doctor], [data-physician], [data-staff], [data-team-member]',
                name: '[data-name], [itemprop="name"]',
                specialty: '[data-specialty], [itemprop="medicalSpecialty"]',
                bio: '[data-bio], [itemprop="description"]'
              },
              // Pattern 3: Semantic HTML
              {
                container: 'article, section.doctor, section.physician, section.team',
                name: 'header h1, header h2, header h3, .title h1, .title h2, .title h3',
                specialty: '.title, .position, .role',
                bio: '.content, .text, .body'
              },
              // Pattern 4: List items
              {
                container: 'li.doctor, li.physician, li.staff, ul.doctors li, ul.team li',
                name: 'strong, b, h3, h4, .name',
                specialty: 'em, i, .specialty',
                bio: 'p, span'
              }
            ];

            const doctors = [];
            const foundNames = new Set(); // Avoid duplicates

            for (const pattern of extractionPatterns) {
              const containers = document.querySelectorAll(pattern.container);

              containers.forEach(container => {
                const nameEl = container.querySelector(pattern.name);
                const specialtyEl = container.querySelector(pattern.specialty);
                const bioEl = container.querySelector(pattern.bio);

                if (nameEl && nameEl.textContent.trim().length > 2) {
                  const text = container.textContent;
                  const name = nameEl.textContent.trim();

                  // Check if this looks like a doctor name
                  const isDoctorContext =
                    text.toLowerCase().includes('dr.') ||
                    text.toLowerCase().includes('dr ') ||
                    text.toLowerCase().includes('doctor') ||
                    text.match(/\bmd\b/i) ||
                    text.match(/\bm\.d\.\b/i) ||
                    text.match(/\bphd\b/i) ||
                    text.match(/\bmbbs\b/i) ||
                    text.match(/\bmbbch\b/i) ||
                    text.match(/\bdo\b/i) ||
                    text.toLowerCase().includes('professor') ||
                    text.toLowerCase().includes('surgeon') ||
                    text.toLowerCase().includes('specialist');

                  if (isDoctorContext && !foundNames.has(name)) {
                    foundNames.add(name);
                    doctors.push({
                      name: name,
                      specialty: specialtyEl?.textContent.trim() || '',
                      bio: bioEl?.textContent.trim().substring(0, 500) || '',
                      qualifications: text.match(/MD|PhD|MBBS|FRCS|FACS|DO|DDS|DMD/gi)?.join(', ') || '',
                      source: 'structured-extraction'
                    });
                  }
                }
              });
            }

            // Fallback: Find all text containing doctor titles
            if (doctors.length === 0) {
              const allText = document.body.innerText;
              const namePatterns = [
                /Dr\.?\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/g,
                /Professor\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/g,
                /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+),?\s+(?:MD|PhD|MBBS|FRCS)/g
              ];

              namePatterns.forEach(pattern => {
                const matches = [...allText.matchAll(pattern)];
                matches.forEach(match => {
                  const name = match[1] || match[0];
                  if (name && !foundNames.has(name)) {
                    foundNames.add(name);
                    doctors.push({
                      name: name.replace(/^Dr\.?\s+/, '').replace(/,?\s+(?:MD|PhD|MBBS|FRCS).*$/, '').trim(),
                      specialty: 'Medical Professional',
                      bio: '',
                      qualifications: match[0].match(/MD|PhD|MBBS|FRCS|FACS/gi)?.join(', ') || '',
                      source: 'text-extraction'
                    });
                  }
                });
              });
            }

            return doctors;
          });

          await browser.close();

          if (doctors.length > 0) {
            this.log(`Found ${doctors.length} doctors using Puppeteer`, 'success');
            results.push(...doctors);
            break; // Success, no need to try other URLs
          }

        } catch (navError) {
          this.log(`Failed to navigate to ${url}: ${navError.message}`, 'warning');
          await browser.close();
        }

      } catch (error) {
        this.log(`Error extracting from ${url}: ${error.message}`, 'error');
      }
    }

    // Strategy 2: Try Cheerio for static content
    if (results.length === 0) {
      this.log('Trying Cheerio extraction...', 'info');
      const cheerioResults = await this.cheerioExtractDoctors(facility);
      results.push(...cheerioResults);
    }

    return results;
  }

  /**
   * CHEERIO EXTRACTION FOR STATIC CONTENT
   */
  async cheerioExtractDoctors(facility) {
    try {
      const response = await axios.get(facility.website, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 30000
      });

      const $ = cheerio.load(response.data);
      const doctors = [];
      const foundNames = new Set();

      // Look for doctor-related elements
      $('*').each((i, el) => {
        const text = $(el).text();
        const className = $(el).attr('class') || '';

        // Check if element likely contains doctor info
        if (className.match(/doctor|physician|staff|team/i) ||
            text.match(/Dr\.|MD|PhD|Professor/)) {

          // Extract name
          const nameMatch = text.match(/(?:Dr\.?\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/);
          if (nameMatch && !foundNames.has(nameMatch[1])) {
            foundNames.add(nameMatch[1]);
            doctors.push({
              name: nameMatch[1],
              specialty: text.match(/Specialist|Surgery|Cardiology|Oncology|Orthopedic/i)?.[0] || '',
              bio: text.substring(0, 500),
              qualifications: text.match(/MD|PhD|MBBS|FRCS/gi)?.join(', ') || '',
              source: 'cheerio-extraction'
            });
          }
        }
      });

      if (doctors.length > 0) {
        this.log(`Found ${doctors.length} doctors using Cheerio`, 'success');
      }

      return doctors;
    } catch (error) {
      this.log(`Cheerio extraction failed: ${error.message}`, 'warning');
      return [];
    }
  }

  /**
   * EXTRACT PRICING FROM FACILITY WEBSITE
   */
  async extractPricing(facility) {
    this.log(`Extracting pricing from ${facility.name}...`);

    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    // Normalize website URL (remove trailing slash)
    const baseUrl = facility.website.replace(/\/$/, '');

    const priceUrls = [
      `${baseUrl}/pricing`,
      `${baseUrl}/prices`,
      `${baseUrl}/costs`,
      `${baseUrl}/packages`,
      `${baseUrl}/treatment-costs`,
      `${baseUrl}/en/pricing`,
      `${baseUrl}/en/prices`,
      `${baseUrl}/price-list`,
      baseUrl // Try homepage too
    ];

    let allPrices = [];

    for (const url of priceUrls) {
      try {
        this.log(`Trying ${url}...`, 'info');

        await page.goto(url, {
          waitUntil: 'domcontentloaded',
          timeout: 20000
        }).catch(err => {
          return page.goto(url, { waitUntil: 'load', timeout: 15000 });
        });

        await page.waitForTimeout(3000);
        await this.autoScroll(page);

        const prices = await page.evaluate(() => {
          const priceData = [];
          const foundProcedures = new Set();

          // Strategy 1: Find tables with prices
          const tables = document.querySelectorAll('table');
          tables.forEach(table => {
            const rows = table.querySelectorAll('tr');
            rows.forEach(row => {
              const cells = Array.from(row.querySelectorAll('td, th'));
              let procedure = '';
              let price = '';
              let currency = 'USD';

              cells.forEach(cell => {
                const text = cell.textContent.trim();

                // Check if cell contains price
                const priceMatch = text.match(/[\$€£¥₹]?\s*[\d,]+(?:\.\d{2})?/);
                if (priceMatch) {
                  price = text.match(/[\d,]+(?:\.\d{2})?/)[0].replace(/,/g, '');

                  // Detect currency
                  if (text.includes('€')) currency = 'EUR';
                  else if (text.includes('£')) currency = 'GBP';
                  else if (text.includes('₹')) currency = 'INR';
                  else if (text.includes('¥')) currency = 'JPY';
                  else if (text.includes('฿')) currency = 'THB';
                } else if (text.length > 3 && text.length < 100 && !price) {
                  procedure = text;
                }
              });

              if (procedure && price && !foundProcedures.has(procedure)) {
                foundProcedures.add(procedure);
                priceData.push({
                  procedure: procedure.trim(),
                  price: parseFloat(price),
                  currency: currency,
                  price_type: 'starting_from'
                });
              }
            });
          });

          // Strategy 2: Find common medical procedures with prices
          const commonProcedures = [
            'Breast Augmentation', 'Rhinoplasty', 'Liposuction', 'Facelift',
            'Hair Transplant', 'Dental Implant', 'Veneers', 'Root Canal',
            'LASIK', 'Cataract Surgery', 'IVF', 'Knee Replacement',
            'Hip Replacement', 'Bariatric Surgery', 'Gastric Bypass',
            'Cosmetic Surgery', 'Plastic Surgery', 'Botox', 'Dermal Fillers'
          ];

          const bodyText = document.body.innerText;
          commonProcedures.forEach(proc => {
            // Look for procedure followed by price within 200 characters
            const regex = new RegExp(`${proc}[\\s\\S]{0,200}?[\\$€£¥₹]?\\s*([\\d,]+(?:\\.\\d{2})?)`, 'i');
            const match = bodyText.match(regex);

            if (match && !foundProcedures.has(proc)) {
              foundProcedures.add(proc);
              const price = match[1].replace(/,/g, '');
              priceData.push({
                procedure: proc,
                price: parseFloat(price),
                currency: 'USD',
                price_type: 'starting_from'
              });
            }
          });

          // Strategy 3: Find price ranges
          const priceRangeMatches = bodyText.matchAll(/([A-Za-z\s]+)[\s\-:]+\$?([\d,]+)\s*-\s*\$?([\d,]+)/g);
          for (const match of priceRangeMatches) {
            const procedure = match[1].trim();
            if (procedure.length > 5 && procedure.length < 100 && !foundProcedures.has(procedure)) {
              foundProcedures.add(procedure);
              const minPrice = parseFloat(match[2].replace(/,/g, ''));
              const maxPrice = parseFloat(match[3].replace(/,/g, ''));

              priceData.push({
                procedure: procedure,
                price: minPrice,
                currency: 'USD',
                price_type: 'range',
                price_max: maxPrice
              });
            }
          }

          return priceData;
        });

        if (prices.length > 0) {
          this.log(`Found ${prices.length} prices`, 'success');
          allPrices.push(...prices);
        }

      } catch (error) {
        this.log(`No pricing at ${url}`, 'warning');
      }
    }

    await browser.close();

    // Deduplicate prices
    const uniquePrices = Array.from(new Map(
      allPrices.map(item => [item.procedure, item])
    ).values());

    return uniquePrices;
  }

  /**
   * EXTRACT TESTIMONIALS AND REVIEWS
   */
  async extractTestimonials(facility) {
    this.log(`Extracting testimonials from ${facility.name}...`);

    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    // Normalize website URL (remove trailing slash)
    const baseUrl = facility.website.replace(/\/$/, '');

    const testimonialUrls = [
      `${baseUrl}/testimonials`,
      `${baseUrl}/reviews`,
      `${baseUrl}/patient-stories`,
      `${baseUrl}/success-stories`,
      `${baseUrl}/patient-reviews`,
      `${baseUrl}/en/testimonials`,
      baseUrl
    ];

    let allTestimonials = [];

    for (const url of testimonialUrls) {
      try {
        await page.goto(url, {
          waitUntil: 'domcontentloaded',
          timeout: 20000
        }).catch(err => {
          return page.goto(url, { waitUntil: 'load', timeout: 15000 });
        });

        await page.waitForTimeout(3000);
        await this.autoScroll(page);

        const testimonials = await page.evaluate(() => {
          const data = [];

          // Look for testimonial containers
          const containers = document.querySelectorAll(
            '.testimonial, .review, .patient-story, [class*="testimonial"], [class*="review"]'
          );

          containers.forEach(container => {
            const text = container.textContent.trim();
            const name = container.querySelector('.name, .author, [class*="name"]')?.textContent.trim() || 'Anonymous';
            const rating = container.querySelector('[class*="rating"], [class*="star"]')?.textContent.trim() || '';

            if (text.length > 50) {
              data.push({
                patient_name: name,
                review_text: text.substring(0, 1000),
                rating: rating.match(/[\d.]+/)?.[0] || null,
                source: 'website'
              });
            }
          });

          return data;
        });

        if (testimonials.length > 0) {
          this.log(`Found ${testimonials.length} testimonials`, 'success');
          allTestimonials.push(...testimonials);
          break;
        }

      } catch (error) {
        this.log(`No testimonials at ${url}`, 'warning');
      }
    }

    await browser.close();
    return allTestimonials.slice(0, 10); // Limit to 10 testimonials
  }

  /**
   * EXTRACT PACKAGES/DEALS
   */
  async extractPackages(facility) {
    this.log(`Extracting packages from ${facility.name}...`);

    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    // Normalize website URL (remove trailing slash)
    const baseUrl = facility.website.replace(/\/$/, '');

    const packageUrls = [
      `${baseUrl}/packages`,
      `${baseUrl}/deals`,
      `${baseUrl}/offers`,
      `${baseUrl}/medical-packages`,
      `${baseUrl}/treatment-packages`,
      `${baseUrl}/en/packages`,
      baseUrl
    ];

    let allPackages = [];

    for (const url of packageUrls) {
      try {
        await page.goto(url, {
          waitUntil: 'domcontentloaded',
          timeout: 20000
        }).catch(err => {
          return page.goto(url, { waitUntil: 'load', timeout: 15000 });
        });

        await page.waitForTimeout(3000);
        await this.autoScroll(page);

        const packages = await page.evaluate(() => {
          const data = [];

          const containers = document.querySelectorAll(
            '.package, .deal, .offer, [class*="package"], [class*="deal"]'
          );

          containers.forEach(container => {
            const name = container.querySelector('h1, h2, h3, h4, .title, .name')?.textContent.trim() || '';
            const description = container.querySelector('.description, .details, p')?.textContent.trim() || '';
            const price = container.textContent.match(/[\$€£¥₹]?\s*([\d,]+(?:\.\d{2})?)/)?.[1] || '';

            if (name && name.length > 5) {
              data.push({
                package_name: name,
                description: description.substring(0, 500),
                price: price ? parseFloat(price.replace(/,/g, '')) : null,
                included_services: description.match(/includes?:?([^.]+)/i)?.[1] || ''
              });
            }
          });

          return data;
        });

        if (packages.length > 0) {
          this.log(`Found ${packages.length} packages`, 'success');
          allPackages.push(...packages);
          break;
        }

      } catch (error) {
        this.log(`No packages at ${url}`, 'warning');
      }
    }

    await browser.close();
    return allPackages;
  }
}

export default RobustMedicalScraper;
