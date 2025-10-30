# Robust Medical Facility Scraper - User Guide

## Overview

This is a **multi-strategy web scraping system** designed to extract data from complex medical facility websites. It uses 5 different extraction strategies to maximize success rates:

1. **Puppeteer** - Full browser automation with multiple selector patterns
2. **Playwright** - Alternative browser engine for JavaScript-heavy sites
3. **Cheerio** - Fast HTML parsing for static content
4. **AI Vision** - GPT-4 Vision for complex/unstructured layouts
5. **API Extraction** - Direct API calls when available

## Files

- **`robustScraper.js`** - Core scraper class with all extraction logic
- **`debugScraper.js`** - Visual debugging tool (shows highlighted elements)
- **`enrichWithRobustScraper.js`** - Master orchestrator script

## Installation

```bash
# Install dependencies
npm install puppeteer cheerio playwright axios dotenv @supabase/supabase-js
```

## Quick Start

### 1. Test Mode (5 facilities, no database writes)

```bash
node scripts/enrichWithRobustScraper.js --test
```

This will:
- Process 5 random facilities
- Extract doctors, prices, testimonials, packages
- Show detailed results
- NOT save to database (safe for testing)

### 2. Debug Mode (Visual Inspection)

```bash
# Debug a specific facility
node scripts/debugScraper.js "Bangkok Hospital"

# Debug a random facility
node scripts/debugScraper.js
```

This will:
- Open a visible browser window
- Highlight elements in different colors:
  - 🟢 **GREEN** = Doctor elements
  - 🔵 **BLUE** = Price elements
  - 🟡 **YELLOW** = Testimonial elements
  - 🟣 **PURPLE** = Package elements
- Show DevTools for inspection
- Keep browser open so you can inspect

**Use this to understand what the scraper is finding on a specific website.**

### 3. Production Mode (Real Extraction)

```bash
# Process 10 facilities
node scripts/enrichWithRobustScraper.js --limit 10

# Process all facilities from Thailand
node scripts/enrichWithRobustScraper.js --country Thailand

# Process all facilities with AI extraction
node scripts/enrichWithRobustScraper.js --use-ai

# Process 50 facilities from India with verbose logging
node scripts/enrichWithRobustScraper.js --limit 50 --country India --verbose
```

## Command Line Options

| Option | Description | Example |
|--------|-------------|---------|
| `--test` | Test mode (5 facilities, no DB writes) | `--test` |
| `--limit N` | Process only N facilities | `--limit 20` |
| `--country XX` | Filter by country | `--country Thailand` |
| `--verbose` | Show detailed logs | `--verbose` |
| `--use-ai` | Enable AI extraction (requires OpenAI key) | `--use-ai` |

## What Gets Extracted

### Doctors
- Name
- Specialty
- Bio/Description
- Qualifications (MD, PhD, MBBS, etc.)
- Languages (if available)

**Extraction Strategies:**
- Looks for elements with classes like `.doctor-card`, `.physician`, `.team-member`
- Searches for text containing "Dr.", "MD", "Professor", "Surgeon"
- Checks data attributes like `[data-doctor]`, `[itemprop="name"]`
- Falls back to regex patterns for doctor names

### Pricing
- Procedure name
- Price (min/max)
- Currency
- Price type (starting from, range, exact)

**Extraction Strategies:**
- Scans tables for procedure/price columns
- Looks for common procedures (Breast Augmentation, LASIK, IVF, etc.)
- Detects price patterns like "$5,000", "USD 3,500", "฿120,000"
- Handles price ranges like "$3,000 - $8,000"

### Testimonials
- Patient name (or "Anonymous")
- Review text
- Rating (1-5 stars)
- Source

**Extraction Strategies:**
- Looks for `.testimonial`, `.review`, `.patient-story` classes
- Extracts star ratings
- Captures review text

### Packages
- Package name
- Description
- Price
- Included services
- Duration (if available)

**Extraction Strategies:**
- Looks for `.package`, `.deal`, `.offer` classes
- Extracts "what's included" lists
- Captures package pricing

## Understanding Results

After running, you'll see a summary like:

```
📊 ENRICHMENT SUMMARY REPORT
════════════════════════════════════════
⏱️  Time Elapsed: 15 minutes
📍 Facilities Processed: 50
✅ Successful: 18 (36%)
⚠️  Partial: 12 (24%)
❌ Failed: 20 (40%)
════════════════════════════════════════

📈 DATA EXTRACTED:
   👨‍⚕️ Doctors: 142
   💰 Prices: 86
   ⭐ Testimonials: 54
   📦 Packages: 31
   📊 Total Items: 313
```

### Success Criteria

- **✅ Successful**: 10+ items extracted
- **⚠️ Partial**: 1-9 items extracted
- **❌ Failed**: 0 items extracted

## Troubleshooting

### Problem: 0% Success Rate

**Symptoms:**
```
✅ Successful: 0 (0%)
⚠️  Partial: 0 (0%)
❌ Failed: 50 (100%)
```

**Solutions:**

1. **Check Network Connection**
   ```bash
   curl https://www.bangkokhospital.com/
   ```

2. **Debug Specific Facility**
   ```bash
   node scripts/debugScraper.js "Bangkok Hospital"
   ```
   Look at what elements are highlighted. If nothing is highlighted, the website structure is different than expected.

3. **Try AI Extraction**
   ```bash
   node scripts/enrichWithRobustScraper.js --limit 5 --use-ai
   ```

4. **Check Timeout Errors**
   If you see "socket hang up" or "timeout", increase timeouts in [robustScraper.js:123-131](scripts/robustScraper.js#L123-L131)

### Problem: "socket hang up" Errors

**Cause:** Website is blocking or timing out

**Solutions:**

1. **Add delays between requests** (already implemented - 3 seconds)
2. **Use residential proxy** (not implemented yet)
3. **Try different User-Agent** (already implemented)

### Problem: Website Blocking Bot

**Symptoms:**
- 403 Forbidden errors
- CAPTCHA pages
- Empty responses

**Solutions:**

1. **Use Playwright instead of Puppeteer** (more stealthy)
2. **Enable AI extraction** with `--use-ai` flag
3. **Manual extraction** for high-value facilities

## Database Schema

The scraper saves data to these tables:

### `doctors`
```sql
- id: UUID
- facility_id: UUID
- name: TEXT
- specialty: TEXT
- qualifications: TEXT
- bio: TEXT
- source: TEXT
```

### `procedure_pricing`
```sql
- id: UUID
- facility_id: UUID
- procedure_name: TEXT
- price: DECIMAL
- currency: TEXT
- price_type: TEXT (starting_from, range, exact)
- price_min: DECIMAL
- price_max: DECIMAL
```

### `testimonials`
```sql
- id: UUID
- facility_id: UUID
- patient_name: TEXT
- review_text: TEXT
- rating: DECIMAL
- source: TEXT
```

### `facility_packages`
```sql
- id: UUID
- facility_id: UUID
- package_name: TEXT
- description: TEXT
- price: DECIMAL
- included_services: TEXT
```

## Performance Tips

1. **Start Small**: Use `--test` or `--limit 10` first
2. **Target Specific Countries**: Use `--country` to focus on known good sites
3. **Use Verbose Mode**: Add `--verbose` to see what's happening
4. **Debug Individual Sites**: Use `debugScraper.js` before running full batch
5. **Run During Off-Peak**: Some sites may block during high traffic

## Known Limitations

1. **JavaScript-Heavy Sites**: May require longer wait times or AI extraction
2. **Login-Required Content**: Cannot extract data behind login walls
3. **Dynamic Pricing**: Only captures pricing shown on public pages
4. **Rate Limiting**: Some sites may block after too many requests
5. **Language Barriers**: Works best with English content

## Success Rate Expectations

Based on typical medical facility websites:

- **Tier 1 Facilities** (Bangkok Hospital, Mount Elizabeth): 50-70% success
- **Tier 2 Facilities** (Regional hospitals): 30-50% success
- **Tier 3 Facilities** (Small clinics): 10-30% success

## Advanced Usage

### Custom Extraction Patterns

Edit [robustScraper.js](scripts/robustScraper.js) to add custom selectors:

```javascript
// In extractDoctors method, add new pattern:
{
  container: '.your-custom-class',
  name: '.custom-name-class',
  specialty: '.custom-specialty-class',
  bio: '.custom-bio-class'
}
```

### AI Extraction (Optional)

Requires OpenAI API key in `.env.local`:

```bash
OPENAI_API_KEY=sk-your-key-here
```

Then run with `--use-ai` flag:

```bash
node scripts/enrichWithRobustScraper.js --use-ai --limit 10
```

## Monitoring Progress

Results are saved incrementally to `data/enrichment-results-{timestamp}.json`:

```json
{
  "success": 18,
  "partial": 12,
  "failed": 20,
  "startTime": 1234567890,
  "details": [
    {
      "facility": "Bangkok Hospital",
      "country": "Thailand",
      "doctors": 12,
      "prices": 8,
      "testimonials": 5,
      "packages": 3,
      "totalItems": 28,
      "status": "success"
    }
  ]
}
```

## Next Steps

After getting good results:

1. **Review Data Quality**: Check database for accuracy
2. **Update Facility Cards**: Display doctor profiles and pricing
3. **Add Search Filters**: Filter by procedures with real pricing
4. **Manual Enrichment**: High-value facilities that failed
5. **Regular Updates**: Re-run monthly to keep data fresh

## Support

If you encounter issues:

1. Run debug mode on the failing facility
2. Check the network tab in DevTools
3. Look for error patterns in the logs
4. Try AI extraction for complex sites

## Examples

### Example 1: Test Before Production

```bash
# Test on 5 facilities
node scripts/enrichWithRobustScraper.js --test

# If results look good, run on 50
node scripts/enrichWithRobustScraper.js --limit 50
```

### Example 2: Target High-Value Country

```bash
# Thailand has many medical tourism facilities
node scripts/enrichWithRobustScraper.js --country Thailand --verbose
```

### Example 3: Debug a Failing Site

```bash
# Visual inspection
node scripts/debugScraper.js "Samsung Medical Center"

# Check what's highlighted
# If nothing is highlighted, the selectors need adjustment
```

### Example 4: Full Production Run

```bash
# Process all facilities with websites
node scripts/enrichWithRobustScraper.js

# This will take several hours for 500+ facilities
# Results are saved incrementally every 5 facilities
```

## FAQ

**Q: Why is success rate 0%?**
A: Usually means websites have very different structure than expected. Use debugScraper.js to see what's on the page.

**Q: Can I pause and resume?**
A: Not yet, but results are saved every 5 facilities, so you won't lose all progress if you stop.

**Q: How long does full enrichment take?**
A: ~5 minutes per facility = ~40 hours for 500 facilities. Use `--limit` to do in batches.

**Q: Will this work on any medical website?**
A: Works best on JCI-accredited facilities that follow standard medical website patterns. Success varies by site.

**Q: Is this legal?**
A: Yes, this scrapes publicly available information. However, respect robots.txt and rate limits.

## License

Part of OASARA medical tourism marketplace.
