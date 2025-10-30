# GPT-4 Vision Scraper - Complete Guide

## Overview

This scraper uses **GPT-4 Vision** to extract structured data from medical facility websites by analyzing screenshots. This approach:

- ✅ **Bypasses bot detection** - Uses stealth browser
- ✅ **Works on any layout** - AI understands visual content
- ✅ **Handles JavaScript-rendered content** - Screenshots after page fully loads
- ✅ **No custom selectors needed** - AI adapts to each site
- ✅ **50-70% success rate expected** - Much better than traditional scraping

## Cost

**GPT-4 Vision Pricing (as of 2024):**
- $0.01-0.03 per screenshot
- 4 screenshots per facility
- **~$0.04-0.12 per facility**

**For 518 facilities:**
- Total cost: **$20-60**
- Processing time: ~2-3 hours
- Success rate: 50-70%

## Setup

### 1. Get OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Copy the key (starts with `sk-`)

### 2. Add to Environment

Edit `.env.local` and add:

```bash
OPENAI_API_KEY=sk-your-actual-key-here
```

### 3. Install Dependencies

```bash
npm install openai puppeteer-extra puppeteer-extra-plugin-stealth
```

## Usage

### Test on Single Facility

```bash
# Test on Bangkok Hospital
node scripts/gpt4VisionScraper.js "Bangkok Hospital" --save-screenshots

# Test on Apollo Hospital
node scripts/gpt4VisionScraper.js "Apollo" --save-screenshots
```

This will:
1. Take 4 screenshots of the website
2. Send to GPT-4 Vision for analysis
3. Extract doctors, prices, testimonials, packages
4. Print results (but not save to database - test mode)
5. Save screenshots to `data/screenshots/` folder

### Process Multiple Facilities

```bash
# Process 10 facilities
node scripts/gpt4VisionScraper.js --limit 10

# Process 50 facilities (estimated cost: $2-6)
node scripts/gpt4VisionScraper.js --limit 50

# Process ALL 518 facilities (estimated cost: $20-60)
node scripts/gpt4VisionScraper.js
```

### Command-Line Options

| Option | Description | Example |
|--------|-------------|---------|
| `--test` | Test mode (1 facility, no DB save) | `--test` |
| `--limit N` | Process only N facilities | `--limit 20` |
| `--save-screenshots` | Save screenshots to disk | `--save-screenshots` |
| `--verbose` | Show detailed logs | `--verbose` |
| `"Facility Name"` | Process specific facility | `"Bangkok Hospital"` |

## How It Works

### Step 1: Stealth Screenshot

Uses `puppeteer-extra` with stealth plugin to:
- Bypass Cloudflare bot detection
- Load page fully (wait for JavaScript)
- Scroll to load lazy content
- Capture 4 sections of the page

### Step 2: GPT-4 Vision Analysis

Sends screenshots to GPT-4 Vision with detailed prompt:
- Extract doctor names, specialties, qualifications
- Find pricing for medical procedures
- Capture patient testimonials
- Identify package deals

### Step 3: Structured JSON Response

GPT-4 returns JSON like:

```json
{
  "doctors": [
    {
      "name": "Dr. Sarah Johnson",
      "specialty": "Cardiology",
      "qualifications": "MD, FACC"
    }
  ],
  "pricing": [
    {
      "procedure": "LASIK Eye Surgery",
      "price": 2500,
      "currency": "USD",
      "price_type": "starting_from"
    }
  ],
  "testimonials": [
    {
      "patient_name": "John D.",
      "review_text": "Excellent care and results!",
      "rating": 5
    }
  ],
  "packages": [
    {
      "package_name": "Complete Health Checkup",
      "description": "Full body scan, blood work, consultation",
      "price": 1200
    }
  ]
}
```

### Step 4: Save to Database

Automatically saves extracted data to:
- `doctors` table
- `procedure_pricing` table
- `testimonials` table
- `facility_packages` table

## Example Output

```
================================================================================
🏥 Bangkok Hospital
🌍 Bangkok, Thailand
🌐 https://www.bangkokhospital.com/
================================================================================

📝 Taking screenshot of https://www.bangkokhospital.com/...
✅ Captured 4 screenshots

📝 Analyzing 4 screenshots with GPT-4 Vision...
✅ GPT-4 Vision extracted:
  👨‍⚕️ Doctors: 12
  💰 Prices: 8
  ⭐ Testimonials: 3
  📦 Packages: 2
  🎯 Confidence: high

✅ Saved 12 doctors
✅ Saved 8 prices
✅ Saved 3 testimonials
✅ Saved 2 packages

================================================================================
📊 RESULT:
================================================================================
Total Items: 25
Status: ✅ SUCCESS
```

## Database Setup

**Before running in production**, create enrichment tables:

```bash
# Go to Supabase SQL Editor
# Run: oasara-marketplace/database/ADD-ENRICHMENT-TABLES.sql
```

This creates:
- `doctors` table
- `procedure_pricing` table
- `testimonials` table
- `facility_packages` table
- Updates `facilities` table with enrichment status columns

## Monitoring Progress

Results are saved incrementally, so you can stop and resume.

Check database:

```sql
-- See enrichment status
SELECT
  country,
  COUNT(*) as total,
  SUM(CASE WHEN enrichment_status = 'enriched' THEN 1 ELSE 0 END) as enriched
FROM facilities
GROUP BY country
ORDER BY total DESC;

-- See extracted doctors count
SELECT
  f.name,
  f.country,
  COUNT(d.id) as doctors_count
FROM facilities f
LEFT JOIN doctors d ON d.facility_id = f.id
GROUP BY f.id, f.name, f.country
ORDER BY doctors_count DESC;
```

## Expected Success Rates

Based on typical medical facility websites:

| Facility Type | Expected Success |
|--------------|------------------|
| **Large International Hospitals** | 70-80% |
| Bangkok Hospital, Apollo, Bumrungrad | High quality data |
| **Regional Medical Centers** | 50-70% |
| Most JCI-accredited facilities | Good data |
| **Small Specialized Clinics** | 30-50% |
| Dental clinics, cosmetic surgery | Moderate data |
| **Government Hospitals** | 20-40% |
| Often limited public pricing | Low data |

## Troubleshooting

### Error: "Missing OPENAI_API_KEY"

**Solution**: Add API key to `.env.local`:

```bash
OPENAI_API_KEY=sk-your-key-here
```

### Error: "socket hang up" (Rare with stealth)

**Solution**: Some sites still block. These will be marked as failed.

### Low Extraction (0-2 items)

**Possible reasons**:
- Website in non-English language only
- No public pricing (requires quote request)
- Content behind login wall
- Very minimalist website

**Solution**: These facilities may need manual data collection.

### High API Costs

Each facility costs $0.04-0.12. To reduce costs:

```bash
# Start with top countries only
node scripts/gpt4VisionScraper.js --limit 50

# Review results, then decide if worth processing all 518
```

## Batch Processing Strategy

### Phase 1: High-Value Countries (100 facilities, ~$8)

```bash
# Thailand (48 facilities)
# India (40 facilities)
# Turkey (36 facilities)
# UAE (46 facilities)

# Filter by country in the script or database
```

### Phase 2: Medium-Value Countries (150 facilities, ~$12)

```bash
# South Korea, Singapore, Brazil, Colombia, etc.
```

### Phase 3: Remaining Facilities (268 facilities, ~$20)

```bash
# All others
```

## What Gets Extracted

### Doctors (Most Reliable)
- ✅ Names with titles (Dr., Professor)
- ✅ Specialties
- ✅ Qualifications (MD, PhD, etc.)
- ⚠️ Bio/description (sometimes)
- ❌ Contact info (rarely public)

### Pricing (Moderate Success)
- ✅ Common procedures (LASIK, IVF, cosmetic)
- ✅ Package deals
- ⚠️ Currency conversion needed
- ❌ Detailed breakdown (often requires consultation)

### Testimonials (Lower Success)
- ✅ Featured testimonials on homepage
- ⚠️ May be generic/marketing
- ❌ Full reviews (often behind dedicated portal)

### Packages (Moderate Success)
- ✅ All-inclusive deals
- ✅ Health checkup packages
- ⚠️ Seasonal promotions
- ❌ Detailed terms (fine print)

## After Extraction

### Review Data Quality

```sql
-- Check extracted data
SELECT * FROM doctors LIMIT 20;
SELECT * FROM procedure_pricing LIMIT 20;
```

### Spot Check Facilities

Manually verify 5-10 facilities to ensure accuracy:
1. Visit facility website
2. Compare extracted data
3. Note any errors
4. Adjust prompt if needed

### Display on Site

Update OASARA frontend to show:
- Doctor profiles on facility cards
- Real pricing (not estimates)
- Package deals
- Patient testimonials

## Cost Analysis

| Approach | Cost | Time | Success Rate | Quality |
|----------|------|------|--------------|---------|
| **GPT-4 Vision** | $20-60 | 2-3 hours | 50-70% | Good |
| Manual VAs | $2,000-4,000 | 2-3 weeks | 90%+ | Excellent |
| Traditional Scraping | $0 (dev time) | Weeks | 0-10% | N/A |
| Professional Service | $500-1000/mo | 1 week | 60-80% | Good |

**Recommendation**: Start with GPT-4 Vision for $50, get 50-70% coverage quickly, then manually fill gaps for high-value facilities.

## Next Steps

1. **Add OpenAI API key** to `.env.local`
2. **Test on 1 facility**: `node scripts/gpt4VisionScraper.js "Bangkok Hospital" --save-screenshots`
3. **Review results**: Check extracted JSON and screenshots
4. **Run on 10 facilities**: `node scripts/gpt4VisionScraper.js --limit 10`
5. **If good, process all**: `node scripts/gpt4VisionScraper.js`

## Alternative: No OpenAI Key?

If you don't want to use OpenAI:

1. **Manual collection** - Hire VAs ($2-4k, highest quality)
2. **Screenshot + manual review** - Take screenshots, review manually
3. **Partner with data providers** - Buy existing medical tourism data

## Support

If extraction quality is poor:

1. Check screenshots in `data/screenshots/` - are they showing the right content?
2. Adjust prompt in `gpt4VisionScraper.js` for your specific needs
3. Try different facilities - some are easier than others
4. Consider manual collection for high-value facilities

## Success Story Example

**Hypothetical Results After Processing 100 Facilities**:

```
📊 FINAL SUMMARY
================================================================================
✅ Successful: 58/100 (58%)
⚠️  Partial: 23/100 (23%)
❌ Failed: 19/100 (19%)

Total Extracted:
  👨‍⚕️ Doctors: 687
  💰 Prices: 423
  ⭐ Testimonials: 156
  📦 Packages: 89

Cost: $8.40
Time: 45 minutes
```

This would give you **real, actionable data** for your marketplace launch!

