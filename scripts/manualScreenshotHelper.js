/**
 * MANUAL SCREENSHOT HELPER
 *
 * Opens a visible browser for you to manually navigate and screenshot.
 * Then uses GPT-4 Vision to extract data from your screenshots.
 *
 * This bypasses ALL bot detection because it's a real browser session.
 *
 * Usage:
 *   node scripts/manualScreenshotHelper.js "Bangkok Hospital"
 */

import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: '.env.local' });

puppeteer.use(StealthPlugin());

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function manualScreenshotMode(facility) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`🏥 ${facility.name}`);
  console.log(`🌍 ${facility.city}, ${facility.country}`);
  console.log(`🌐 ${facility.website}`);
  console.log(`${'='.repeat(80)}\n`);

  console.log('🖥️  Opening browser in VISIBLE mode...');
  console.log('📸 You will manually take screenshots\n');

  const browser = await puppeteer.launch({
    headless: false, // VISIBLE browser
    defaultViewport: null,
    args: ['--start-maximized']
  });

  const page = await browser.newPage();

  console.log('📝 Instructions:');
  console.log('1. Browser will open to facility website');
  console.log('2. Navigate around (doctors page, pricing, etc.)');
  console.log('3. When ready, press ENTER in this terminal');
  console.log('4. Script will auto-screenshot 4 sections');
  console.log('5. GPT-4 will analyze screenshots');
  console.log('');

  // Navigate to website
  try {
    await page.goto(facility.website, { waitUntil: 'networkidle2', timeout: 60000 });
  } catch (error) {
    console.log(`⚠️  Navigation timeout, but page may have loaded`);
  }

  // Wait for user to navigate
  console.log('🎯 Browser opened! Navigate to important pages (doctors, pricing, etc.)');
  console.log('   Press ENTER when ready to take screenshots...');

  await new Promise(resolve => {
    process.stdin.once('data', resolve);
  });

  console.log('\n📸 Taking screenshots...');

  const screenshots = [];

  // Current view
  const screenshot1 = await page.screenshot({ type: 'jpeg', quality: 80 });
  screenshots.push({ data: screenshot1.toString('base64'), section: 'current' });
  console.log('  ✅ Screenshot 1/4');

  // Scroll and capture 3 more sections
  for (let i = 1; i <= 3; i++) {
    await page.evaluate(() => window.scrollBy(0, window.innerHeight));
    await page.waitForTimeout(1000);
    const screenshot = await page.screenshot({ type: 'jpeg', quality: 80 });
    screenshots.push({ data: screenshot.toString('base64'), section: `section-${i}` });
    console.log(`  ✅ Screenshot ${i + 1}/4`);
  }

  // Save screenshots
  const screenshotDir = path.join(process.cwd(), 'data', 'screenshots');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  screenshots.forEach((screenshot, i) => {
    const filename = `${facility.id}-${screenshot.section}.jpg`;
    const filepath = path.join(screenshotDir, filename);
    fs.writeFileSync(filepath, Buffer.from(screenshot.data, 'base64'));
  });

  console.log(`\n💾 Screenshots saved to data/screenshots/`);
  console.log('🔍 Analyzing with GPT-4 Vision...\n');

  // Keep browser open while processing
  const extractedData = await analyzeWithGPT4(facility, screenshots);

  console.log('\n📊 EXTRACTION RESULTS:');
  console.log(`${'='.repeat(80)}`);
  console.log(`👨‍⚕️ Doctors: ${extractedData.doctors?.length || 0}`);
  console.log(`💰 Prices: ${extractedData.pricing?.length || 0}`);
  console.log(`⭐ Testimonials: ${extractedData.testimonials?.length || 0}`);
  console.log(`📦 Packages: ${extractedData.packages?.length || 0}`);
  console.log(`🎯 Confidence: ${extractedData.metadata?.confidence || 'unknown'}`);
  console.log(`${'='.repeat(80)}\n`);

  if (extractedData.doctors && extractedData.doctors.length > 0) {
    console.log('👨‍⚕️ Sample Doctors:');
    extractedData.doctors.slice(0, 5).forEach(doc => {
      console.log(`  - ${doc.name} (${doc.specialty})`);
    });
    console.log('');
  }

  if (extractedData.pricing && extractedData.pricing.length > 0) {
    console.log('💰 Sample Pricing:');
    extractedData.pricing.slice(0, 5).forEach(price => {
      console.log(`  - ${price.procedure}: ${price.currency} ${price.price}`);
    });
    console.log('');
  }

  console.log('🔍 Full extracted data:\n');
  console.log(JSON.stringify(extractedData, null, 2));

  console.log('\n✅ Done! You can close the browser now.');

  // Don't close automatically - let user review
  // await browser.close();
}

async function analyzeWithGPT4(facility, screenshots) {
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
\`\`\``;

  try {
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
      temperature: 0.1
    });

    const content = response.choices[0].message.content;
    const jsonMatch = content.match(/```json\n([\s\S]+?)\n```/) || content.match(/{[\s\S]+}/);

    if (!jsonMatch) {
      throw new Error('No JSON found in GPT-4 response');
    }

    return JSON.parse(jsonMatch[1] || jsonMatch[0]);

  } catch (error) {
    console.error(`❌ GPT-4 Vision error: ${error.message}`);
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

async function main() {
  const facilityName = process.argv[2];

  if (!facilityName) {
    console.log('❌ Please provide facility name');
    console.log('Usage: node scripts/manualScreenshotHelper.js "Bangkok Hospital"');
    process.exit(1);
  }

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

  await manualScreenshotMode(facility);
}

main();
