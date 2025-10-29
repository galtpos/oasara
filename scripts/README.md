# OASARA Data Collection Scripts

Scripts to collect, enrich, and import all 661 JCI-accredited facilities into the OASARA database.

## Overview

```
Raw JCI Data → Enrichment (Google Places) → Supabase Import → OASARA App
```

## Scripts

### 1. `jci-scraper.js`
Scrapes facility data from JCI official directory.

```bash
node scripts/jci-scraper.js
```

**Output**: `./data/jci-facilities-raw.json`

**What it does**:
- Iterates through 64 target countries
- Extracts: name, city, country, type, accreditation date
- Rate limits to avoid blocking
- Saves ~661 raw facility records

### 2. `enrich-facilities.js`
Enriches raw data with Google Places API.

```bash
GOOGLE_PLACES_API_KEY=your_key node scripts/enrich-facilities.js
```

**Input**: `./data/jci-facilities-raw.json`
**Output**: `./data/jci-facilities-enriched.json`

**What it does**:
- Searches Google Places for each facility
- Adds: coordinates, phone, website, ratings
- Handles rate limiting (200ms between requests)
- Cost: ~$5 for 661 facilities (Places API pricing)

### 3. `import-to-supabase.js`
Imports enriched data to Supabase database.

```bash
node scripts/import-to-supabase.js
```

**Input**: `./data/jci-facilities-enriched.json`
**Output**: Facilities in Supabase database

**What it does**:
- Transforms data to match schema
- Imports in batches of 100
- Handles duplicates via upsert
- Validates before insertion

## Setup

### 1. Install Dependencies

```bash
cd /Users/aaronday/Documents/medicaltourism/oasara-marketplace
npm install axios cheerio puppeteer dotenv
```

### 2. Get Google Places API Key

1. Go to https://console.cloud.google.com/
2. Create new project: "OASARA Data Collection"
3. Enable APIs:
   - Places API
   - Geocoding API
4. Create credentials → API Key
5. Add to `.env.local`:
   ```
   GOOGLE_PLACES_API_KEY=AIza...
   ```

**Cost Estimate**:
- Places Text Search: $0.032 per request × 661 = $21.15
- Place Details: $0.017 per request × 661 = $11.24
- **Total: ~$32 for complete dataset**

### 3. Create Data Directory

```bash
mkdir -p data
```

## Usage

### Quick Start (Manual Data)

If you have a spreadsheet with facility names, cities, countries:

1. Save as `data/facilities-manual.csv`
2. Run enrichment only:
   ```bash
   GOOGLE_PLACES_API_KEY=your_key node scripts/enrich-from-csv.js
   ```
3. Import to Supabase:
   ```bash
   node scripts/import-to-supabase.js
   ```

### Full Automated Pipeline

```bash
# Step 1: Scrape JCI directory
node scripts/jci-scraper.js

# Step 2: Enrich with Google Places
GOOGLE_PLACES_API_KEY=your_key node scripts/enrich-facilities.js

# Step 3: Import to Supabase
node scripts/import-to-supabase.js

# Step 4: Verify in app
npm start
# Visit http://localhost:3000
```

## Batch Processing Strategy

### Week 1: Tier 1 Countries (130 facilities)
High medical tourism volume, best ROI

```bash
# Thailand, India, Turkey, Singapore, Mexico
node scripts/batch-import.js --countries="Thailand,India,Turkey,Singapore,Mexico"
```

### Week 2: Tier 2 Countries (120 facilities)
Growing markets

```bash
# UAE, South Korea, Malaysia, Spain, Brazil, Colombia
node scripts/batch-import.js --countries="United Arab Emirates,South Korea,Malaysia,Spain,Brazil,Colombia"
```

### Week 3: Tier 3 Countries (80 facilities)
Established European markets

```bash
# Germany, Israel, Taiwan, Czech Republic, Hungary
node scripts/batch-import.js --countries="Germany,Israel,Taiwan,Czech Republic,Hungary"
```

### Month 2: Complete Coverage (331 facilities)
All remaining facilities including USA

```bash
# Process all remaining countries
node scripts/batch-import.js --all
```

## Data Quality

### Validation Steps

After each import batch:

1. **Visual Check**: Open map, verify markers appear
2. **Data Completeness**:
   ```sql
   SELECT
     COUNT(*) as total,
     COUNT(lat) as with_coords,
     COUNT(google_rating) as with_ratings,
     COUNT(website) as with_websites
   FROM facilities;
   ```
3. **Duplicates Check**:
   ```sql
   SELECT name, country, city, COUNT(*)
   FROM facilities
   GROUP BY name, country, city
   HAVING COUNT(*) > 1;
   ```

### Common Issues & Fixes

**Issue**: "Place not found in Google Places"
**Fix**:
- Try alternate search query: `${city} ${name} hospital`
- Manual coordinate lookup
- Skip enrichment, keep JCI data

**Issue**: Rate limit errors
**Fix**:
- Increase `rateLimitDelay` in script
- Use Google Maps Platform quota
- Process in smaller batches

**Issue**: Wrong facility matched
**Fix**:
- Add country code to search query
- Verify by address match
- Manual correction in Supabase

## Cost Optimization

### Free Tier Strategy
Google offers $200/month free credit:

1. **Day 1**: Process 100 facilities ($5)
2. **Day 2**: Process 100 facilities ($5)
3. **Continue**: ~13 days to complete all 661
4. **Total Cost**: $32 (within free tier)

### Batch Processing
Process 50 facilities per run to avoid timeouts:

```bash
node scripts/enrich-facilities.js --start=0 --limit=50
node scripts/enrich-facilities.js --start=50 --limit=50
# ... repeat
```

## Monitoring

### Progress Tracking

View enrichment progress:
```bash
wc -l data/jci-facilities-enriched.json
```

Check Supabase count:
```sql
SELECT country, COUNT(*)
FROM facilities
GROUP BY country
ORDER BY COUNT(*) DESC;
```

### Success Metrics

Target metrics for complete dataset:
- ✅ 661 total facilities
- ✅ 650+ with coordinates (98%)
- ✅ 600+ with Google ratings (90%)
- ✅ 550+ with websites (83%)
- ✅ 661 with JCI accreditation (100%)

## Maintenance

### Updating Existing Data

```bash
# Re-enrich specific country
node scripts/enrich-facilities.js --country="Thailand"

# Update single facility
node scripts/update-facility.js --id="facility_uuid"
```

### Adding New JCI Facilities

JCI accredits ~50 new facilities per year:

```bash
# Quarterly update
node scripts/jci-scraper.js --since="2025-01-01"
node scripts/enrich-facilities.js --new-only
node scripts/import-to-supabase.js --upsert
```

## Troubleshooting

### Script Fails Midway

Resume from last successful position:

```bash
# Check last enriched facility
tail -1 data/jci-facilities-enriched.json

# Resume from position 150
node scripts/enrich-facilities.js --start=150
```

### API Key Issues

Test API key:
```bash
curl "https://maps.googleapis.com/maps/api/place/textsearch/json?query=hospital&key=YOUR_KEY"
```

### Database Connection

Test Supabase connection:
```bash
node -e "
const { createClient } = require('@supabase/supabase-js');
const client = createClient('$REACT_APP_SUPABASE_URL', '$REACT_APP_SUPABASE_ANON_KEY');
client.from('facilities').select('count').then(console.log);
"
```

## Support

- Check logs in `./logs/` directory
- Review `data/failed-facilities.json` for errors
- See main SKILLS.md for troubleshooting

## Next Steps

After importing all 661 facilities:

1. **Optimize map clustering**: See `src/components/Map/GlobalFacilityMap.tsx`
2. **Add facility details**: Manually enrich top 50 with procedure pricing
3. **Begin Zano outreach**: Email facilities about cryptocurrency payments
4. **Launch marketing**: "661 JCI-Certified Facilities Worldwide"

---

**Ready to scale from 10 to 661 facilities!** 🚀
