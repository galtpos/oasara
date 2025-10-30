/**
 * GPT-4 VISION SCRAPER
 *
 * Uses GPT-4 Vision to extract structured data from facility website screenshots.
 * This bypasses the need for custom selectors and works on any visual layout.
 *
 * Setup:
 *   1. Add OPENAI_API_KEY to .env.local
 *   2. npm install openai puppeteer-extra puppeteer-extra-plugin-stealth
 *
 * Usage:
 *   node scripts/gpt4VisionScraper.js "Bangkok Hospital"
 *   node scripts/gpt4VisionScraper.js --test
 *   node scripts/gpt4VisionScraper.js --limit 10
 *
 * Cost: ~$0.01-0.05 per facility
 */

import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: '.env.local' });

// Add stealth plugin to avoid bot detection
puppeteer.use(StealthPlugin());

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

class GPT4VisionScraper {
  constructor(options = {}) {
    this.saveScreenshots = options.saveScreenshots || false;
    this.verbose = options.verbose || false;
    this.testMode = options.testMode || false;
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
   * TAKE FULL-PAGE SCREENSHOT WITH STEALTH BROWSER
   */
  async takeScreenshot(url) {
    this.log(`Taking screenshot of ${url}...`, 'info');

    const browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
        '--window-size=1920,1080'
      ]
    });

    try {
      const page = await browser.newPage();

      // Set realistic viewport
      await page.setViewport({ width: 1920, height: 1080 });

      // Additional stealth measures
      await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, 'webdriver', { get: () => false });
        Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
        Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
      });

      // Navigate with retries
      let loaded = false;
      let attempts = 0;

      while (!loaded && attempts < 3) {
        try {
          await page.goto(url, {
            waitUntil: 'networkidle0',
            timeout: 30000
          });
          loaded = true;
        } catch (error) {
          attempts++;
          if (attempts >= 3) throw error;
          this.log(`Retry ${attempts}/3...`, 'warning');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      // Wait for page to settle
      await page.waitForTimeout(5000);

      // Scroll to load lazy content
      await page.evaluate(async () => {
        await new Promise((resolve) => {
          let totalHeight = 0;
          const distance = 100;
          const timer = setInterval(() => {
            window.scrollBy(0, distance);
            totalHeight += distance;

            if (totalHeight >= document.body.scrollHeight) {
              clearInterval(timer);
              resolve();
            }
          }, 100);
        });
      });

      // Scroll back to top
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(1000);

      // Take multiple screenshots (sections of page)
      const screenshots = [];

      // Full page screenshot
      const fullScreenshot = await page.screenshot({
        type: 'jpeg',
        quality: 80,
        fullPage: false // Just viewport for now
      });

      screenshots.push({
        data: fullScreenshot.toString('base64'),
        section: 'main'
      });

      // Scroll and capture more sections
      for (let i = 1; i <= 3; i++) {
        await page.evaluate(() => window.scrollBy(0, window.innerHeight));
        await page.waitForTimeout(1000);

        const screenshot = await page.screenshot({
          type: 'jpeg',
          quality: 80,
          fullPage: false
        });

        screenshots.push({
          data: screenshot.toString('base64'),
          section: `section-${i}`
        });
      }

      await browser.close();

      this.log(`Captured ${screenshots.length} screenshots`, 'success');
      return screenshots;

    } catch (error) {
      await browser.close();
      throw error;
    }
  }

  /**
   * EXTRACT DATA USING GPT-4 VISION
   */
  async extractWithVision(facility, screenshots) {
    this.log(`Analyzing ${screenshots.length} screenshots with GPT-4 Vision...`, 'info');

    const prompt = `You are analyzing screenshots from ${facility.name}, a JCI-accredited medical facility in ${facility.city}, ${facility.country}.

Website: ${facility.website}

Please extract the following information from these screenshots:

1. **DOCTORS/PHYSICIANS**
   - Doctor names (look for "Dr.", "MD", "Professor", physician profiles)
   - Specialties (Cardiology, Orthopedics, Cosmetic Surgery, etc.)
   - Qualifications (MD, PhD, MBBS, FRCS, etc.)

2. **PRICING INFORMATION**
   - Procedure names (Breast Augmentation, LASIK, IVF, etc.)
   - Prices (in any currency - USD, THB, EUR, etc.)
   - Whether prices are "starting from", "range", or "exact"

3. **TESTIMONIALS/REVIEWS**
   - Patient testimonials or success stories
   - Ratings if visible
   - Brief quotes

4. **PACKAGES/DEALS**
   - Package names (All-inclusive packages, treatment bundles)
   - What's included
   - Prices if shown

**IMPORTANT**:
- Only extract information you can clearly see in the images
- If you can't find something, leave that section empty
- For prices, note the currency (USD, Baht, etc.)
- Be thorough - extract ALL visible doctors, prices, etc.

Return your response as a JSON object with this structure:

\`\`\`json
{
  "doctors": [
    {
      "name": "Dr. John Smith",
      "specialty": "Cardiology",
      "qualifications": "MD, FACC"
    }
  ],
  "pricing": [
    {
      "procedure": "Breast Augmentation",
      "price": 5000,
      "currency": "USD",
      "price_type": "starting_from"
    }
  ],
  "testimonials": [
    {
      "patient_name": "Sarah M.",
      "review_text": "Excellent care and results...",
      "rating": 5
    }
  ],
  "packages": [
    {
      "package_name": "Complete Health Checkup Package",
      "description": "Includes...",
      "price": 2500
    }
  ],
  "metadata": {
    "data_found": true,
    "confidence": "high",
    "notes": "Found doctor profiles on main page..."
  }
}
\`\`\`

If you cannot find any relevant information, return:
\`\`\`json
{
  "doctors": [],
  "pricing": [],
  "testimonials": [],
  "packages": [],
  "metadata": {
    "data_found": false,
    "confidence": "low",
    "notes": "Website appears to be in a language other than English, or data is not publicly visible"
  }
}
\`\`\`
`;

    try {
      // Prepare image messages
      const imageMessages = screenshots.map(screenshot => ({
        type: "image_url",
        image_url: {
          url: `data:image/jpeg;base64,${screenshot.data}`,
          detail: "high"
        }
      }));

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              ...imageMessages
            ]
          }
        ],
        max_tokens: 4096,
        temperature: 0.1 // Low temperature for consistent extraction
      });

      const content = response.choices[0].message.content;

      // Extract JSON from response
      const jsonMatch = content.match(/```json\n([\s\S]+?)\n```/) || content.match(/{[\s\S]+}/);

      if (!jsonMatch) {
        throw new Error('No JSON found in GPT-4 response');
      }

      const extractedData = JSON.parse(jsonMatch[1] || jsonMatch[0]);

      this.log(`GPT-4 Vision extracted:`, 'success');
      this.log(`  👨‍⚕️ Doctors: ${extractedData.doctors?.length || 0}`, 'info');
      this.log(`  💰 Prices: ${extractedData.pricing?.length || 0}`, 'info');
      this.log(`  ⭐ Testimonials: ${extractedData.testimonials?.length || 0}`, 'info');
      this.log(`  📦 Packages: ${extractedData.packages?.length || 0}`, 'info');
      this.log(`  🎯 Confidence: ${extractedData.metadata?.confidence || 'unknown'}`, 'info');

      return extractedData;

    } catch (error) {
      this.log(`GPT-4 Vision extraction failed: ${error.message}`, 'error');
      return {
        doctors: [],
        pricing: [],
        testimonials: [],
        packages: [],
        metadata: {
          data_found: false,
          confidence: 'error',
          notes: error.message
        }
      };
    }
  }

  /**
   * SAVE TO DATABASE
   */
  async saveToDatabase(facility, extractedData) {
    if (this.testMode) {
      this.log('Test mode - skipping database save', 'info');
      return;
    }

    try {
      // Save doctors
      if (extractedData.doctors && extractedData.doctors.length > 0) {
        const doctors = extractedData.doctors.map(doc => ({
          facility_id: facility.id,
          name: doc.name,
          specialty: doc.specialty || null,
          qualifications: doc.qualifications || null,
          bio: doc.bio || null,
          source: 'gpt4-vision'
        }));

        const { error: doctorsError } = await supabase
          .from('doctors')
          .insert(doctors);

        if (doctorsError) {
          this.log(`Error saving doctors: ${doctorsError.message}`, 'error');
        } else {
          this.log(`Saved ${doctors.length} doctors`, 'success');
        }
      }

      // Save pricing
      if (extractedData.pricing && extractedData.pricing.length > 0) {
        const pricing = extractedData.pricing.map(price => ({
          facility_id: facility.id,
          procedure_name: price.procedure,
          price: price.price,
          currency: price.currency || 'USD',
          price_type: price.price_type || 'starting_from',
          price_min: price.price,
          price_max: price.price_max || null,
          source: 'gpt4-vision'
        }));

        const { error: pricingError } = await supabase
          .from('procedure_pricing')
          .insert(pricing);

        if (pricingError) {
          this.log(`Error saving pricing: ${pricingError.message}`, 'error');
        } else {
          this.log(`Saved ${pricing.length} prices`, 'success');
        }
      }

      // Save testimonials
      if (extractedData.testimonials && extractedData.testimonials.length > 0) {
        const testimonials = extractedData.testimonials.map(test => ({
          facility_id: facility.id,
          patient_name: test.patient_name || 'Anonymous',
          review_text: test.review_text,
          rating: test.rating || null,
          source: 'gpt4-vision'
        }));

        const { error: testimonialsError } = await supabase
          .from('testimonials')
          .insert(testimonials);

        if (testimonialsError) {
          this.log(`Error saving testimonials: ${testimonialsError.message}`, 'error');
        } else {
          this.log(`Saved ${testimonials.length} testimonials`, 'success');
        }
      }

      // Save packages
      if (extractedData.packages && extractedData.packages.length > 0) {
        const packages = extractedData.packages.map(pkg => ({
          facility_id: facility.id,
          package_name: pkg.package_name,
          description: pkg.description || null,
          price: pkg.price || null,
          included_services: pkg.included_services || null,
          source: 'gpt4-vision'
        }));

        const { error: packagesError } = await supabase
          .from('facility_packages')
          .insert(packages);

        if (packagesError) {
          this.log(`Error saving packages: ${packagesError.message}`, 'error');
        } else {
          this.log(`Saved ${packages.length} packages`, 'success');
        }
      }

      // Update facility enrichment status
      const totalItems =
        (extractedData.doctors?.length || 0) +
        (extractedData.pricing?.length || 0) +
        (extractedData.testimonials?.length || 0) +
        (extractedData.packages?.length || 0);

      const status = totalItems >= 10 ? 'enriched' : totalItems > 0 ? 'partial' : 'failed';

      await supabase
        .from('facilities')
        .update({
          enrichment_status: status,
          enrichment_last_attempt: new Date().toISOString(),
          ai_extracted_data: extractedData,
          extraction_method: 'gpt4-vision',
          extraction_date: new Date().toISOString()
        })
        .eq('id', facility.id);

    } catch (error) {
      this.log(`Database save error: ${error.message}`, 'error');
    }
  }

  /**
   * PROCESS SINGLE FACILITY
   */
  async processFacility(facility) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`🏥 ${facility.name}`);
    console.log(`🌍 ${facility.city}, ${facility.country}`);
    console.log(`🌐 ${facility.website}`);
    console.log(`${'='.repeat(80)}\n`);

    try {
      // Take screenshots
      const screenshots = await this.takeScreenshot(facility.website);

      // Save screenshots if requested
      if (this.saveScreenshots) {
        const screenshotDir = path.join(process.cwd(), 'data', 'screenshots');
        if (!fs.existsSync(screenshotDir)) {
          fs.mkdirSync(screenshotDir, { recursive: true });
        }

        screenshots.forEach((screenshot, i) => {
          const filename = `${facility.id}-${screenshot.section}.jpg`;
          const filepath = path.join(screenshotDir, filename);
          fs.writeFileSync(filepath, Buffer.from(screenshot.data, 'base64'));
        });

        this.log(`Screenshots saved to data/screenshots/`, 'success');
      }

      // Extract data with GPT-4 Vision
      const extractedData = await this.extractWithVision(facility, screenshots);

      // Save to database
      await this.saveToDatabase(facility, extractedData);

      const totalItems =
        (extractedData.doctors?.length || 0) +
        (extractedData.pricing?.length || 0) +
        (extractedData.testimonials?.length || 0) +
        (extractedData.packages?.length || 0);

      return {
        success: totalItems >= 10,
        partial: totalItems > 0 && totalItems < 10,
        totalItems,
        data: extractedData
      };

    } catch (error) {
      this.log(`Failed to process facility: ${error.message}`, 'error');
      return {
        success: false,
        partial: false,
        totalItems: 0,
        error: error.message
      };
    }
  }
}

// Main execution
async function main() {
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ Missing OPENAI_API_KEY in .env.local');
    console.error('Add your OpenAI API key to .env.local:');
    console.error('OPENAI_API_KEY=sk-your-key-here');
    process.exit(1);
  }

  const args = process.argv.slice(2);
  const isTest = args.includes('--test');
  const saveScreenshots = args.includes('--save-screenshots');
  const verbose = args.includes('--verbose');
  const limit = parseInt(args.find(arg => arg.startsWith('--limit'))?.split('=')[1]) || (isTest ? 1 : null);
  const facilityName = args.find(arg => !arg.startsWith('--'));

  const scraper = new GPT4VisionScraper({
    saveScreenshots,
    verbose,
    testMode: isTest
  });

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

    const result = await scraper.processFacility(facility);

    console.log(`\n${'='.repeat(80)}`);
    console.log('📊 RESULT:');
    console.log(`${'='.repeat(80)}`);
    console.log(`Total Items: ${result.totalItems}`);
    console.log(`Status: ${result.success ? '✅ SUCCESS' : result.partial ? '⚠️ PARTIAL' : '❌ FAILED'}`);

    if (result.data) {
      console.log(`\nExtracted Data:`);
      console.log(JSON.stringify(result.data, null, 2));
    }

  } else {
    // Batch mode
    let query = supabase
      .from('facilities')
      .select('*')
      .not('website', 'is', null);

    if (limit) query = query.limit(limit);

    const { data: facilities } = await query;

    console.log(`\n🚀 GPT-4 VISION SCRAPER`);
    console.log(`📍 Processing ${facilities.length} facilities`);
    console.log(`💰 Estimated cost: $${(facilities.length * 0.03).toFixed(2)}`);
    console.log('');

    const results = {
      success: 0,
      partial: 0,
      failed: 0
    };

    for (let i = 0; i < facilities.length; i++) {
      const result = await scraper.processFacility(facilities[i]);

      if (result.success) results.success++;
      else if (result.partial) results.partial++;
      else results.failed++;

      if (i < facilities.length - 1) {
        console.log('\n⏸️  Waiting 5 seconds before next facility...\n');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }

    // Print summary
    console.log(`\n\n${'='.repeat(80)}`);
    console.log('📊 FINAL SUMMARY');
    console.log(`${'='.repeat(80)}`);
    console.log(`✅ Successful: ${results.success}/${facilities.length} (${Math.round(results.success/facilities.length*100)}%)`);
    console.log(`⚠️  Partial: ${results.partial}/${facilities.length} (${Math.round(results.partial/facilities.length*100)}%)`);
    console.log(`❌ Failed: ${results.failed}/${facilities.length} (${Math.round(results.failed/facilities.length*100)}%)`);
  }
}

main();
