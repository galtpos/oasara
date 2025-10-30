/**
 * AI-Powered Data Extraction
 * Uses GPT-4 Vision to extract structured data from complex facility websites
 * 
 * Usage: node scripts/aiDataExtraction.js [--facility-id=uuid] [--limit=10]
 * 
 * Requires OPENAI_API_KEY in .env.local
 */

const puppeteer = require('puppeteer');
const OpenAI = require('openai');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;
const openaiApiKey = process.env.OPENAI_API_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Supabase credentials not found in .env.local');
}

// Only check OpenAI key when actually called (not on module load)
function getOpenAIClient() {
  if (!openaiApiKey) {
    throw new Error('OPENAI_API_KEY not found in .env.local. Get your API key at: https://platform.openai.com/api-keys');
  }
  return new OpenAI({ apiKey: openaiApiKey });
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Extract structured data using GPT-4 Vision
 */
async function extractDataWithAI(facility) {
  if (!facility.website) {
    console.log(`   ⚠️  No website for ${facility.name}`);
    return { success: false };
  }
  
  // Initialize OpenAI client
  const openai = getOpenAIClient();
  
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
    
    // Set viewport for consistent screenshots
    await page.setViewport({ width: 1920, height: 1080 });
    await page.waitForTimeout(2000);
    
    // Take screenshot of the page
    console.log(`   📸 Taking screenshot...`);
    const screenshot = await page.screenshot({ 
      encoding: 'base64', 
      fullPage: false, // Use viewport only for faster processing
      type: 'jpeg',
      quality: 85
    });
    
    // Prepare prompt for GPT-4 Vision
    const prompt = `Extract the following information from this medical facility website for ${facility.name}:

1. Doctor names and specialties (list each doctor with their specialty)
2. Procedure prices (specific numbers in USD, format as: procedure_name: price_usd)
3. Contact email for international patients
4. Languages spoken by staff
5. Popular procedures offered
6. Package deals (name, price, what's included)
7. Success metrics (e.g., "5000+ successful surgeries", "95% success rate")
8. Patient testimonials (extract 3-5 key testimonials with ratings if available)

Return as JSON with these exact keys:
{
  "doctors": [{"name": "string", "specialty": "string", "qualifications": "string[]"}],
  "pricing": [{"procedure": "string", "price_usd": number, "price_range": "string"}],
  "email": "string",
  "languages": ["string"],
  "procedures": ["string"],
  "packages": [{"name": "string", "price_usd": number, "includes": ["string"]}],
  "metrics": {"metric_type": "metric_value"},
  "testimonials": [{"text": "string", "rating": number}]
}

Be accurate and only extract information that is clearly visible on the page.`;
    
    console.log(`   🤖 Sending to GPT-4 Vision...`);
    
    // Call GPT-4 Vision API
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${screenshot}`
              }
            }
          ]
        }
      ],
      max_tokens: 4096,
      temperature: 0.1 // Lower temperature for more accurate extraction
    });
    
    const content = response.choices[0].message.content;
    
    // Parse JSON from response (sometimes wrapped in markdown code blocks)
    let extractedData;
    try {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
      if (jsonMatch) {
        extractedData = JSON.parse(jsonMatch[1]);
      } else {
        extractedData = JSON.parse(content);
      }
    } catch (error) {
      console.error(`   ⚠️  Failed to parse JSON response: ${error.message}`);
      console.log(`   Response preview: ${content.substring(0, 200)}...`);
      return { success: false, error: 'Failed to parse AI response' };
    }
    
    console.log(`   ✅ Extracted data: ${Object.keys(extractedData).length} categories`);
    
    // Save extracted data to database
    const aiDataRecord = {
      facility_id: facility.id,
      extraction_method: 'gpt-4-vision',
      extracted_data: extractedData,
      extraction_date: new Date().toISOString(),
      confidence_score: 0.85, // Default confidence, could be improved with model scoring
      verified: false
    };
    
    const { error: aiError } = await supabase
      .from('ai_extracted_data')
      .insert(aiDataRecord);
    
    if (aiError) {
      console.error(`   ⚠️  Error saving AI data: ${aiError.message}`);
    }
    
    // Process and save doctors if found
    if (extractedData.doctors && Array.isArray(extractedData.doctors)) {
      let doctorsSaved = 0;
      for (const doctor of extractedData.doctors) {
        if (doctor.name) {
          try {
            const { error } = await supabase
              .from('doctors')
              .insert({
                facility_id: facility.id,
                name: doctor.name,
                specialty: doctor.specialty || null,
                qualifications: doctor.qualifications || [],
                source: 'ai_extraction'
              });
            
            if (!error) doctorsSaved++;
          } catch (e) {
            // Skip duplicates
          }
        }
      }
      if (doctorsSaved > 0) {
        console.log(`   ✅ Saved ${doctorsSaved} doctors`);
      }
    }
    
    // Process and save pricing if found
    if (extractedData.pricing && Array.isArray(extractedData.pricing)) {
      let pricingSaved = 0;
      for (const price of extractedData.pricing) {
        if (price.procedure && price.price_usd) {
          try {
            const { error } = await supabase
              .from('procedure_pricing')
              .insert({
                facility_id: facility.id,
                procedure_name: price.procedure,
                price_usd: price.price_usd,
                price_range: price.price_range || null,
                currency: 'USD',
                verified: false,
                source: 'ai_extraction'
              });
            
            if (!error) pricingSaved++;
          } catch (e) {
            // Skip duplicates
          }
        }
      }
      if (pricingSaved > 0) {
        console.log(`   ✅ Saved ${pricingSaved} prices`);
      }
    }
    
    // Process and save packages if found
    if (extractedData.packages && Array.isArray(extractedData.packages)) {
      let packagesSaved = 0;
      for (const pkg of extractedData.packages) {
        if (pkg.name && pkg.price_usd) {
          try {
            const { error } = await supabase
              .from('facility_packages')
              .insert({
                facility_id: facility.id,
                package_name: pkg.name,
                price_usd: pkg.price_usd,
                includes: pkg.includes || [],
                currency: 'USD',
                source: 'ai_extraction'
              });
            
            if (!error) packagesSaved++;
          } catch (e) {
            // Skip duplicates
          }
        }
      }
      if (packagesSaved > 0) {
        console.log(`   ✅ Saved ${packagesSaved} packages`);
      }
    }
    
    // Update facility with AI extracted data
    await supabase
      .from('facilities')
      .update({
        ai_extracted_data: extractedData,
        extraction_method: 'gpt-4-vision',
        extraction_date: new Date().toISOString()
      })
      .eq('id', facility.id);
    
    return { success: true, data: extractedData };
    
  } catch (error) {
    console.error(`   ❌ Failed to extract data with AI for ${facility.name}: ${error.message}`);
    
    // Check if it's an API error
    if (error.response) {
      console.error(`   API Error: ${JSON.stringify(error.response.data)}`);
    }
    
    return { success: false, error: error.message };
  } finally {
    await browser.close();
  }
}

/**
 * Main function to extract data with AI for facilities
 */
async function extractAllWithAI() {
  const args = process.argv.slice(2);
  const facilityIdArg = args.find(arg => arg.startsWith('--facility-id='));
  const limitArg = args.find(arg => arg.startsWith('--limit='));
  
  const facilityId = facilityIdArg ? facilityIdArg.split('=')[1] : null;
  const limit = limitArg ? parseInt(limitArg.split('=')[1]) : 5; // Default to 5 for AI (expensive)
  
  console.log('🤖 Starting AI-Powered Data Extraction...\n');
  console.log('⚠️  Note: This uses GPT-4 Vision API which costs ~$0.01-0.03 per image\n');
  
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
  let totalCost = 0;
  const estimatedCostPerRequest = 0.02; // ~$0.02 per request
  
  for (const [index, facility] of facilities.entries()) {
    console.log(`\n[${index + 1}/${facilities.length}] Processing ${facility.name} (${facility.country})...`);
    
    const result = await extractDataWithAI(facility);
    
    if (result.success) {
      successCount++;
      totalCost += estimatedCostPerRequest;
    }
    
    // Rate limiting - wait 2 seconds between requests
    if (index < facilities.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 AI EXTRACTION SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Facilities Processed: ${facilities.length}`);
  console.log(`Successfully Extracted: ${successCount}`);
  console.log(`Estimated Cost: $${totalCost.toFixed(2)}`);
  console.log(`Success Rate: ${((successCount/facilities.length)*100).toFixed(1)}%`);
  console.log('='.repeat(60));
  console.log('\n💡 Tip: Use this for complex websites where regular scraping fails');
  console.log('   For most facilities, regular scraping scripts are more cost-effective\n');
}

// Run if called directly
if (require.main === module) {
  // Check OpenAI key when running standalone
  if (!openaiApiKey) {
    console.error('❌ Error: OPENAI_API_KEY not found in .env.local');
    console.log('   Get your API key at: https://platform.openai.com/api-keys');
    process.exit(1);
  }
  extractAllWithAI().catch(console.error);
}

module.exports = { extractDataWithAI };

