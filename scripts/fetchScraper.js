/**
 * FETCH-BASED SCRAPER - Fast extraction using fetch + cheerio
 *
 * This bypasses Puppeteer's bot detection issues by using native fetch.
 * Much faster and works on Cloudflare-protected sites.
 *
 * Usage:
 *   node scripts/fetchScraper.js --test
 *   node scripts/fetchScraper.js --limit 10
 *   node scripts/fetchScraper.js "Bangkok Hospital"
 */

import * as cheerio from 'cheerio';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

class FetchScraper {
  constructor() {
    this.headers = {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1'
    };
  }

  async fetchPage(url) {
    try {
      const response = await fetch(url, {
        headers: this.headers,
        redirect: 'follow'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.text();
    } catch (error) {
      console.log(`  ⚠️ Failed to fetch ${url}: ${error.message}`);
      return null;
    }
  }

  async extractDoctors(facility) {
    console.log(`\n👨‍⚕️ Extracting doctors from ${facility.name}...`);

    const baseUrl = facility.website.replace(/\/$/, '');
    const urlsToTry = [
      baseUrl,
      `${baseUrl}/en`,
      `${baseUrl}/doctors`,
      `${baseUrl}/en/doctors`,
      `${baseUrl}/our-team`,
      `${baseUrl}/find-a-doctor`
    ];

    const doctors = [];
    const foundNames = new Set();

    for (const url of urlsToTry) {
      console.log(`  📄 Trying ${url}...`);
      const html = await this.fetchPage(url);

      if (!html) continue;

      const $ = cheerio.load(html);

      // Strategy 1: Look for doctor/physician elements
      $('[class*="doctor"], [class*="physician"], [class*="staff"], [class*="team"]').each((i, el) => {
        const text = $(el).text();

        if (text.includes('Dr.') || text.includes('MD') || text.includes('Professor')) {
          const nameMatch = text.match(/(?:Dr\.?\s+|Professor\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/);

          if (nameMatch && !foundNames.has(nameMatch[1])) {
            foundNames.add(nameMatch[1]);

            // Try to find specialty
            let specialty = '';
            $(el).find('[class*="specialty"], [class*="department"]').each((j, specEl) => {
              specialty = $(specEl).text().trim();
            });

            doctors.push({
              name: nameMatch[1],
              specialty: specialty || 'Medical Professional',
              bio: text.substring(0, 500).trim(),
              source: 'fetch-scraping'
            });
          }
        }
      });

      // Strategy 2: Regex search in full text
      if (doctors.length < 5) {
        const bodyText = $('body').text();

        // Match patterns like "Dr. John Smith" or "John Smith, MD"
        const patterns = [
          /Dr\.?\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/g,
          /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+),?\s+(?:MD|M\.D\.|PhD|MBBS)/g
        ];

        patterns.forEach(pattern => {
          const matches = [...bodyText.matchAll(pattern)];
          matches.forEach(match => {
            const name = match[1].trim();
            if (name && !foundNames.has(name) && name.split(' ').length >= 2) {
              foundNames.add(name);
              doctors.push({
                name: name,
                specialty: 'Medical Professional',
                bio: '',
                source: 'regex-extraction'
              });
            }
          });
        });
      }

      if (doctors.length > 0) {
        console.log(`  ✅ Found ${doctors.length} doctors`);
        break; // Success, no need to try more URLs
      }
    }

    return doctors.slice(0, 20); // Limit to 20 doctors
  }

  async extractPricing(facility) {
    console.log(`\n💰 Extracting pricing from ${facility.name}...`);

    const baseUrl = facility.website.replace(/\/$/, '');
    const urlsToTry = [
      baseUrl,
      `${baseUrl}/en`,
      `${baseUrl}/pricing`,
      `${baseUrl}/en/pricing`,
      `${baseUrl}/prices`,
      `${baseUrl}/treatment-costs`
    ];

    const prices = [];
    const foundProcedures = new Set();

    for (const url of urlsToTry) {
      console.log(`  📄 Trying ${url}...`);
      const html = await this.fetchPage(url);

      if (!html) continue;

      const $ = cheerio.load(html);

      // Strategy 1: Find tables with prices
      $('table').each((i, table) => {
        $(table).find('tr').each((j, row) => {
          const cells = $(row).find('td, th');
          let procedure = '';
          let price = '';

          cells.each((k, cell) => {
            const text = $(cell).text().trim();

            // Check if contains price
            if (text.match(/\$[\d,]+|USD\s*[\d,]+|฿[\d,]+|Baht\s*[\d,]+/)) {
              const priceMatch = text.match(/[\d,]+/);
              if (priceMatch) {
                price = priceMatch[0].replace(/,/g, '');
              }
            } else if (text.length > 5 && text.length < 100 && !price) {
              procedure = text;
            }
          });

          if (procedure && price && !foundProcedures.has(procedure)) {
            foundProcedures.add(procedure);
            prices.push({
              procedure: procedure,
              price: parseFloat(price),
              currency: 'USD',
              price_type: 'starting_from'
            });
          }
        });
      });

      // Strategy 2: Look for common medical procedures with prices
      const bodyText = $('body').text();
      const commonProcedures = [
        'Breast Augmentation', 'Rhinoplasty', 'Liposuction', 'Facelift',
        'Hair Transplant', 'Dental Implant', 'Veneers', 'LASIK',
        'IVF', 'Knee Replacement', 'Hip Replacement', 'Bariatric Surgery'
      ];

      commonProcedures.forEach(proc => {
        const regex = new RegExp(`${proc}[\\s\\S]{0,200}?([\\d,]+)`, 'i');
        const match = bodyText.match(regex);

        if (match && !foundProcedures.has(proc)) {
          foundProcedures.add(proc);
          const price = match[1].replace(/,/g, '');

          if (parseFloat(price) > 100 && parseFloat(price) < 1000000) {
            prices.push({
              procedure: proc,
              price: parseFloat(price),
              currency: 'USD',
              price_type: 'starting_from'
            });
          }
        }
      });

      if (prices.length > 0) {
        console.log(`  ✅ Found ${prices.length} prices`);
        break;
      }
    }

    return prices.slice(0, 20); // Limit to 20 prices
  }

  async extractTestimonials(facility) {
    console.log(`\n⭐ Extracting testimonials from ${facility.name}...`);

    const baseUrl = facility.website.replace(/\/$/, '');
    const urlsToTry = [
      `${baseUrl}/testimonials`,
      `${baseUrl}/en/testimonials`,
      `${baseUrl}/reviews`,
      `${baseUrl}/patient-stories`,
      baseUrl
    ];

    const testimonials = [];

    for (const url of urlsToTry) {
      console.log(`  📄 Trying ${url}...`);
      const html = await this.fetchPage(url);

      if (!html) continue;

      const $ = cheerio.load(html);

      // Look for testimonial/review elements
      $('[class*="testimonial"], [class*="review"], [class*="story"]').each((i, el) => {
        const text = $(el).text().trim();

        if (text.length > 100 && testimonials.length < 10) {
          const name = $(el).find('[class*="name"], [class*="author"]').text().trim() || 'Anonymous';

          testimonials.push({
            patient_name: name,
            review_text: text.substring(0, 1000),
            rating: null,
            source: 'website'
          });
        }
      });

      if (testimonials.length > 0) {
        console.log(`  ✅ Found ${testimonials.length} testimonials`);
        break;
      }
    }

    return testimonials;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const isTest = args.includes('--test');
  const limit = parseInt(args.find(arg => arg.startsWith('--limit'))?.split('=')[1]) || (isTest ? 5 : null);
  const facilityName = args.find(arg => !arg.startsWith('--'));

  const scraper = new FetchScraper();

  if (facilityName) {
    // Single facility mode
    const { data: facility, error } = await supabase
      .from('facilities')
      .select('*')
      .ilike('name', `%${facilityName}%`)
      .not('website', 'is', null)
      .limit(1)
      .single();

    if (error || !facility) {
      console.log(`❌ Facility not found: ${facilityName}`);
      process.exit(1);
    }

    console.log(`\n🏥 ${facility.name}`);
    console.log(`🌍 ${facility.city}, ${facility.country}`);
    console.log(`🌐 ${facility.website}`);

    const doctors = await scraper.extractDoctors(facility);
    const prices = await scraper.extractPricing(facility);
    const testimonials = await scraper.extractTestimonials(facility);

    console.log(`\n📊 RESULTS:`);
    console.log(`  👨‍⚕️ Doctors: ${doctors.length}`);
    console.log(`  💰 Prices: ${prices.length}`);
    console.log(`  ⭐ Testimonials: ${testimonials.length}`);
    console.log(`  📈 Total: ${doctors.length + prices.length + testimonials.length} items`);

    if (doctors.length > 0) {
      console.log(`\n👨‍⚕️ Sample Doctors:`);
      doctors.slice(0, 5).forEach(doc => {
        console.log(`  - ${doc.name} (${doc.specialty})`);
      });
    }

    if (prices.length > 0) {
      console.log(`\n💰 Sample Prices:`);
      prices.slice(0, 5).forEach(price => {
        console.log(`  - ${price.procedure}: $${price.price}`);
      });
    }

  } else {
    // Batch mode
    let query = supabase
      .from('facilities')
      .select('*')
      .not('website', 'is', null);

    if (limit) query = query.limit(limit);

    const { data: facilities } = await query;

    console.log(`\n🚀 FETCH SCRAPER - Processing ${facilities.length} facilities\n`);

    const results = {
      success: 0,
      partial: 0,
      failed: 0
    };

    for (let i = 0; i < facilities.length; i++) {
      const facility = facilities[i];

      console.log(`\n${'='.repeat(80)}`);
      console.log(`🏥 [${i + 1}/${facilities.length}] ${facility.name} (${facility.country})`);
      console.log(`${'='.repeat(80)}`);

      const doctors = await scraper.extractDoctors(facility);
      const prices = await scraper.extractPricing(facility);
      const testimonials = await scraper.extractTestimonials(facility);

      const total = doctors.length + prices.length + testimonials.length;

      // SAVE TO DATABASE
      if (doctors.length > 0) {
        const doctorsWithFacilityId = doctors.map(d => ({ ...d, facility_id: facility.id }));
        const { error: docError } = await supabase.from('doctors').insert(doctorsWithFacilityId);
        if (docError) {
          console.log(`  ❌ Error saving doctors: ${docError.message}`);
        } else {
          console.log(`  💾 Saved ${doctors.length} doctors`);
        }
      }

      if (prices.length > 0) {
        const pricesWithFacilityId = prices.map(p => ({ ...p, facility_id: facility.id }));
        const { error: priceError } = await supabase.from('procedure_pricing').insert(pricesWithFacilityId);
        if (priceError) {
          console.log(`  ❌ Error saving prices: ${priceError.message}`);
        } else {
          console.log(`  💾 Saved ${prices.length} prices`);
        }
      }

      if (testimonials.length > 0) {
        const testimonialsWithFacilityId = testimonials.map(t => ({ ...t, facility_id: facility.id }));
        const { error: testError } = await supabase.from('testimonials').insert(testimonialsWithFacilityId);
        if (testError) {
          console.log(`  ❌ Error saving testimonials: ${testError.message}`);
        } else {
          console.log(`  💾 Saved ${testimonials.length} testimonials`);
        }
      }

      if (total >= 10) {
        results.success++;
        console.log(`\n✅ SUCCESS: ${total} items extracted and saved`);
      } else if (total > 0) {
        results.partial++;
        console.log(`\n⚠️ PARTIAL: ${total} items extracted and saved`);
      } else {
        results.failed++;
        console.log(`\n❌ FAILED: No data extracted`);
      }

      if (i < facilities.length - 1) {
        console.log(`\n⏸️  Waiting 2 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // Print summary
    console.log(`\n\n${'='.repeat(80)}`);
    console.log(`📊 SUMMARY`);
    console.log(`${'='.repeat(80)}`);
    console.log(`✅ Successful: ${results.success}/${facilities.length}`);
    console.log(`⚠️  Partial: ${results.partial}/${facilities.length}`);
    console.log(`❌ Failed: ${results.failed}/${facilities.length}`);
    console.log(`📈 Success Rate: ${Math.round((results.success / facilities.length) * 100)}%`);
  }
}

main();
