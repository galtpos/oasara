# OASARA Facility Enrichment Scripts

Deep data extraction system for enriching 276+ facilities with doctor profiles, real pricing, package deals, testimonials, and success metrics.

## 🎯 Overview

This enrichment pipeline extracts actionable data from facility websites to transform your database from generic listings to comprehensive, bookable resources.

**What gets extracted:**
- 👨‍⚕️ Doctor profiles with qualifications and specialties
- 💰 Real procedure pricing (not estimates)
- 📦 Package deals and all-inclusive offers
- 💬 Patient testimonials and reviews
- 📊 Success metrics (surgeries performed, success rates, etc.)
- 🤖 AI-powered extraction for complex websites (optional)

## 📋 Prerequisites

1. **Database Setup**: Run the enrichment schema migration first:
   ```bash
   # In Supabase SQL Editor, run:
   database/ADD-ENRICHMENT-TABLES.sql
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Environment Variables** (.env.local):
   ```env
   REACT_APP_SUPABASE_URL=your_supabase_url
   REACT_APP_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_KEY=your_service_key  # Optional, for admin operations
   OPENAI_API_KEY=your_openai_key  # Only needed for AI extraction
   ```

## 🚀 Quick Start

### Run Full Enrichment Pipeline

Process 10 facilities with all enrichment steps:
```bash
node scripts/runFullEnrichment.js
```

Process all 276 facilities:
```bash
node scripts/runFullEnrichment.js --all
```

Process specific number:
```bash
node scripts/runFullEnrichment.js --limit=50
```

Process single facility:
```bash
node scripts/runFullEnrichment.js --facility-id=uuid-here
```

### Individual Scripts

Each enrichment script can be run independently:

**Doctor Profiles:**
```bash
node scripts/scrapeDoctors.js --limit=10
```

**Procedure Pricing:**
```bash
node scripts/scrapePricing.js --limit=10
```

**Package Deals:**
```bash
node scripts/scrapePackages.js --limit=10
```

**Testimonials & Metrics:**
```bash
node scripts/scrapeTestimonials.js --limit=10
```

**AI Extraction (expensive, ~$0.02 per facility):**
```bash
node scripts/aiDataExtraction.js --limit=5
```

## 📊 Scripts Overview

### 1. scrapeDoctors.js
Extracts doctor profiles from facility websites.

**What it finds:**
- Doctor names and titles
- Specialties
- Qualifications (MD, PhD, Board Certified, etc.)
- Years of experience
- Languages spoken
- Bio/description
- Profile images

**How it works:**
- Searches for common doctor page URLs (`/doctors`, `/our-doctors`, `/medical-team`)
- Uses multiple CSS selectors to find doctor cards
- Extracts structured data including Schema.org markup
- Parses qualifications and experience from bio text

**Output:** Saved to `doctors` table

### 2. scrapePricing.js
Extracts actual procedure prices from facility websites.

**What it finds:**
- Procedure names
- Exact prices in USD
- Price ranges (e.g., "$3,500 - $8,000")
- Procedure descriptions

**How it works:**
- Searches for pricing pages (`/prices`, `/pricing`, `/costs`)
- Looks for common procedure keywords
- Extracts prices using regex patterns
- Searches price tables and structured data

**Output:** Saved to `procedure_pricing` table

### 3. scrapePackages.js
Extracts all-inclusive package deals.

**What it finds:**
- Package names (e.g., "Dental Package", "Mommy Makeover")
- Package prices
- What's included (hotel, transfers, surgery, etc.)
- Duration (days/nights)

**How it works:**
- Searches for package-related pages
- Finds elements containing package keywords and prices
- Extracts included services from descriptions
- Identifies duration information

**Output:** Saved to `facility_packages` table

### 4. scrapeTestimonials.js
Extracts patient testimonials and facility success metrics.

**What it finds:**
- Patient reviews and testimonials
- Star ratings (1-5)
- Procedure names mentioned
- Success metrics (surgeries performed, success rates, etc.)

**How it works:**
- Searches testimonial/review pages
- Extracts structured review data (Schema.org)
- Parses ratings from text and star emojis
- Scans page text for success metrics patterns

**Output:** Saved to `testimonials` and `success_metrics` tables

### 5. aiDataExtraction.js
Uses GPT-4 Vision to extract structured data from complex websites.

**What it extracts:**
- All data types (doctors, pricing, packages, testimonials)
- Contact emails for international patients
- Languages spoken
- Popular procedures

**How it works:**
- Takes screenshot of facility website
- Sends to GPT-4 Vision API with extraction prompt
- Parses JSON response
- Saves structured data

**Cost:** ~$0.01-0.03 per facility
**When to use:** Complex websites where regular scraping fails

**Output:** Saved to `ai_extracted_data` table and respective data tables

### 6. runFullEnrichment.js
Master script that orchestrates all enrichment steps.

**Features:**
- Runs all enrichment scripts in sequence
- Tracks progress and provides detailed summaries
- Supports selective skipping (--skip-doctors, etc.)
- Handles errors gracefully
- Updates facility enrichment status

## 🎛️ Advanced Usage

### Selective Enrichment

Skip specific steps to speed up processing:
```bash
# Skip doctor scraping
node scripts/runFullEnrichment.js --skip-doctors

# Skip pricing and packages
node scripts/runFullEnrichment.js --skip-pricing --skip-packages

# Only testimonials
node scripts/runFullEnrichment.js --skip-doctors --skip-pricing --skip-packages
```

### Combine Regular + AI Extraction

Run regular scraping first, then use AI for facilities that failed:
```bash
# Step 1: Regular scraping
node scripts/runFullEnrichment.js --limit=50

# Step 2: Check which facilities failed
# Step 3: Use AI for complex websites
node scripts/aiDataExtraction.js --facility-id=failed-facility-id
```

### Batch Processing Strategy

For 276 facilities, process in batches:

**Week 1: High-value facilities (50 facilities)**
```bash
# Focus on facilities with highest Google ratings
node scripts/runFullEnrichment.js --limit=50
```

**Week 2: Remaining facilities**
```bash
# Process all remaining
node scripts/runFullEnrichment.js --all
```

**Week 3: AI extraction for failures**
```bash
# Process facilities that had no data extracted
node scripts/aiDataExtraction.js --limit=20
```

## 📈 Expected Results

After running enrichment on 276 facilities:

**Success Rates:**
- Doctors: ~60-70% (not all facilities have doctor pages)
- Pricing: ~40-50% (many facilities require contact for pricing)
- Packages: ~30-40% (not all facilities offer packages)
- Testimonials: ~50-60% (most facilities have reviews)
- Metrics: ~70-80% (often on homepage)

**Typical Data Per Facility:**
- 5-20 doctors (when available)
- 5-15 procedure prices (when available)
- 2-5 packages (when available)
- 5-10 testimonials (when available)
- 3-5 success metrics (usually available)

## 🔧 Troubleshooting

### "No website for facility"
- Check that facility has `website` field populated in database
- Run `enrich-facilities.js` to add websites via Google Places API

### "Could not find doctors page"
- Some facilities don't publish doctor profiles online
- Try AI extraction for these facilities: `--use-ai`

### "No pricing found"
- Many facilities don't publish prices (require consultation)
- Check if they have a "Request Quote" form
- Consider manual data entry for high-value facilities

### Rate Limiting Errors
- Scripts include 3-5 second delays between facilities
- If you hit rate limits, increase delays in scripts
- Consider processing in smaller batches

### Puppeteer Timeouts
- Some websites load slowly or block bots
- Increase timeout values in scripts (default: 30 seconds)
- Try `--use-ai` for problematic websites

### AI Extraction Fails
- Check OPENAI_API_KEY is set correctly
- Verify API has credits available
- Some websites block screenshots (rare)

## 💰 Cost Estimates

**Regular Scraping:** FREE (no API costs)
- Uses Puppeteer (headless Chrome)
- Only cost is server/hosting if running on cloud

**AI Extraction:** ~$0.01-0.03 per facility
- GPT-4 Vision pricing
- For 276 facilities: ~$2.76 - $8.28 if all use AI
- Recommended: Use AI only for facilities where regular scraping fails

## 📊 Monitoring Progress

### Check Enrichment Status

In Supabase SQL Editor:
```sql
-- Facilities with enrichment data
SELECT 
  name,
  doctors_count,
  pricing_count,
  packages_count,
  testimonials_count,
  data_enriched,
  enriched_date
FROM facilities
WHERE data_enriched = true
ORDER BY enriched_date DESC;
```

### Count Extracted Data

```sql
-- Total doctors extracted
SELECT COUNT(*) FROM doctors;

-- Total prices extracted
SELECT COUNT(*) FROM procedure_pricing;

-- Total packages extracted
SELECT COUNT(*) FROM facility_packages;

-- Total testimonials extracted
SELECT COUNT(*) FROM testimonials;
```

### Facilities Needing Attention

```sql
-- Facilities with websites but no enrichment
SELECT name, website, country
FROM facilities
WHERE website IS NOT NULL
  AND data_enriched = false
LIMIT 50;
```

## 🎯 Best Practices

1. **Start Small**: Test with `--limit=5` first
2. **Monitor Costs**: Only use `--use-ai` when necessary
3. **Process in Batches**: Don't run all 276 at once initially
4. **Verify Data**: Check extracted data quality in Supabase
5. **Handle Failures**: Use AI extraction for facilities that fail regular scraping
6. **Rate Limiting**: Scripts include delays, but monitor for blocking
7. **Data Quality**: Manually verify high-value facilities

## 🔄 Updating Existing Data

To re-enrich facilities (useful if websites update):

```bash
# Re-enrich specific facility
node scripts/runFullEnrichment.js --facility-id=uuid-here

# Re-enrich last 10 facilities
node scripts/runFullEnrichment.js --limit=10
```

## 📝 Data Schema

See `database/ADD-ENRICHMENT-TABLES.sql` for complete schema.

**Key Tables:**
- `doctors` - Doctor profiles
- `procedure_pricing` - Procedure prices
- `facility_packages` - Package deals
- `testimonials` - Patient reviews
- `success_metrics` - Facility statistics
- `ai_extracted_data` - AI extraction results

## 🚀 Next Steps

After enrichment:

1. **Review Data Quality**: Check extracted data in Supabase
2. **Verify Pricing**: Manually verify key procedure prices
3. **Enhance UI**: Update frontend to display new data
4. **Add Filters**: Allow filtering by doctor specialty, package deals
5. **Show Success Metrics**: Display facility achievements
6. **Package Search**: Add package deal search/filter

## 📞 Support

- Check script logs for detailed error messages
- Review Supabase dashboard for data issues
- Use `--facility-id` to debug specific facilities
- See main README.md for project overview

---

**Built for OASARA - Your Oasis for Medical Sovereignty** 🏥🌍

