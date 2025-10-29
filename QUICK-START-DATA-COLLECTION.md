# OASARA Data Collection - Quick Start Guide

**Goal**: Scale from 10 to 661 JCI-accredited facilities in 4 weeks
**Status**: ✅ Infrastructure complete, ready to execute

---

## 📋 Prerequisites Checklist

- [x] Supabase database configured
- [x] App running locally at http://localhost:3000
- [x] 10 facilities successfully displaying on map
- [x] Data collection scripts created
- [ ] Google Places API key obtained

---

## 🚀 Quick Start (15 minutes)

### Step 1: Get Google Places API Key (10 min)

Follow detailed guide: [GOOGLE-PLACES-API-SETUP.md](GOOGLE-PLACES-API-SETUP.md)

**Quick version:**
1. Go to https://console.cloud.google.com/
2. Create project: "OASARA Data Collection"
3. Enable "Places API"
4. Create API key
5. Enable billing (free $200/month credit)

Add to `.env.local`:
```bash
GOOGLE_PLACES_API_KEY=AIzaSyA...your_actual_key...
```

### Step 2: Test Enrichment (2 min)

Validate the pipeline with 5 sample facilities:

```bash
cd /Users/aaronday/Documents/medicaltourism/oasara-marketplace
GOOGLE_PLACES_API_KEY=your_key node scripts/test-enrichment.js
```

**Expected output:**
```
🧪 Testing Google Places API Enrichment
============================================================

[1/5] Testing: Bumrungrad International Hospital, Bangkok
   ✓ SUCCESS
     - Coordinates: 13.7442, 100.5608
     - Rating: 4.5 ⭐
     - Website: https://www.bumrungrad.com
     - Phone: +66 2 066 8888

...

✅ PASSED: Ready to process all 661 facilities!
📊 Success Rate: 100.0%
```

### Step 3: Prepare First Batch (3 min)

You have two options:

**Option A: Manual CSV** (Recommended for quality)
Create `data/tier1-facilities.csv`:
```csv
name,city,country
Bumrungrad International Hospital,Bangkok,Thailand
Apollo Hospitals,Chennai,India
Acibadem Maslak Hospital,Istanbul,Turkey
Mount Elizabeth Hospital,Singapore,Singapore
...
```

**Option B: Automated Scraping** (Faster but requires validation)
Use JCI scraper for Tier 1 countries:
```bash
node scripts/jci-scraper.js --countries="Thailand,India,Turkey,Singapore"
```

---

## 📊 Full Pipeline (All 661 Facilities)

### Week 1: Tier 1 Markets (130 facilities)

**Countries**: Thailand (35), India (40), Turkey (35), Singapore (20)
**Cost**: ~$6.40

```bash
# 1. Scrape or prepare CSV for Tier 1
# Already have test sample, can expand to 130 facilities

# 2. Enrich with Google Places (15 min)
GOOGLE_PLACES_API_KEY=your_key node scripts/enrich-facilities.js

# 3. Import to Supabase (2 min)
node scripts/import-to-supabase.js

# 4. Verify on map
# Open http://localhost:3000
# Should see 140 total facilities (10 existing + 130 new)
```

### Week 2: Tier 2 Markets (120 facilities)

**Countries**: UAE (45), South Korea (20), Malaysia (10), Spain (15), Brazil (30), Colombia (20)
**Cost**: ~$6

Repeat pipeline for Tier 2 countries.

### Week 3: Tier 3 Markets (80 facilities)

**Countries**: Germany (20), Israel (15), Taiwan (10), Czech Republic (5), Hungary (5), others (25)
**Cost**: ~$4

### Week 4: Complete Coverage (331 facilities)

**Countries**: USA (100), China (50), Japan (15), rest of world
**Cost**: ~$16

**Result**: 661 facilities total across 64 countries

---

## 🎯 Daily Workflow

### Option 1: Batch Processing (Recommended)

**Morning (1 hour):**
1. Prepare batch of 50 facilities
2. Run enrichment
3. Import to Supabase
4. Quick quality check

**Target**: 50 facilities/day = 661 done in 13 days

### Option 2: Continuous Processing

Run scripts to process all 661 at once:
```bash
# This will take ~45 minutes total
GOOGLE_PLACES_API_KEY=your_key node scripts/enrich-facilities.js
node scripts/import-to-supabase.js
```

---

## 📁 File Reference

### Scripts
- `scripts/test-enrichment.js` - Test with 5 sample facilities
- `scripts/jci-scraper.js` - Scrape JCI directory
- `scripts/enrich-facilities.js` - Add Google Places data
- `scripts/import-to-supabase.js` - Import to database

### Data Files
- `data/jci-facilities-test-sample.json` - 5 sample facilities for testing
- `data/jci-facilities-raw.json` - Raw scraped data (created by scraper)
- `data/jci-facilities-enriched.json` - After Google enrichment
- `data/JCI-FACILITIES-MASTER-LIST.md` - Complete 661 facility breakdown

### Documentation
- `GOOGLE-PLACES-API-SETUP.md` - Detailed API setup guide
- `DATA-COLLECTION-PLAN.md` - Full 4-week execution plan
- `scripts/README.md` - Technical script documentation
- `SKILLS.md` - Development best practices

---

## 🔍 Quality Assurance

After each import batch:

### 1. Visual Check
Open http://localhost:3000 and verify:
- Facilities appear as markers on map
- Clicking markers shows facility details
- No duplicate markers in same location

### 2. Database Check
In Supabase SQL Editor:
```sql
-- Count total facilities
SELECT COUNT(*) FROM facilities;

-- Check data completeness
SELECT
  COUNT(*) as total,
  COUNT(lat) as with_coordinates,
  COUNT(google_rating) as with_ratings,
  COUNT(website) as with_websites,
  AVG(google_rating) as avg_rating
FROM facilities;

-- Check for duplicates
SELECT name, country, city, COUNT(*)
FROM facilities
GROUP BY name, country, city
HAVING COUNT(*) > 1;
```

### 3. Success Metrics
Target completion rates:
- ✅ 90%+ with coordinates
- ✅ 90%+ with contact info
- ✅ 80%+ with ratings
- ✅ 100% with JCI accreditation

---

## 🐛 Troubleshooting

### "API key not valid"
- Wait 2-3 minutes after creating key
- Ensure Places API is enabled
- Check API key restrictions

### "Place not found"
- Try alternate search query: `${city} ${name} hospital`
- Some facilities may need manual coordinates
- Skip enrichment, keep basic JCI data

### "OVER_QUERY_LIMIT"
- Ensure billing is enabled (free $200 credit)
- Increase delay between requests
- Process in smaller batches

### Enrichment success rate < 80%
- Validate API key permissions
- Check search query format
- Some facilities may need manual entry

---

## 💰 Cost Tracker

### Per Request Costs
- Text Search: $0.032
- Place Details: $0.017
- **Total per facility**: $0.049

### Running Total
- Test (5 facilities): $0.25
- Tier 1 (130 facilities): $6.40
- Tier 2 (120 facilities): $5.88
- Tier 3 (80 facilities): $3.92
- Tier 4 (331 facilities): $16.24
- **Total: $32.69**

✅ **Well within $200 monthly free credit**

---

## ✅ Success Checklist

### Phase 1: Setup (Today)
- [ ] Google Places API key obtained
- [ ] Test enrichment successful (5/5)
- [ ] Cost confirmed within free tier
- [ ] Ready to scale

### Phase 2: Tier 1 (Week 1)
- [ ] 130 Tier 1 facilities enriched
- [ ] 140 total facilities in database
- [ ] All facilities visible on map
- [ ] Launch announcement: "140+ JCI Facilities"

### Phase 3: Scale (Weeks 2-4)
- [ ] Tier 2 complete (260 total)
- [ ] Tier 3 complete (340 total)
- [ ] Tier 4 complete (661 total)
- [ ] Launch announcement: "Every JCI Facility on Earth"

### Phase 4: Polish
- [ ] Map clustering implemented
- [ ] Search optimization added
- [ ] Stats dashboard live
- [ ] Begin Zano cryptocurrency outreach

---

## 🎉 Immediate Next Action

**Run this command now:**

```bash
GOOGLE_PLACES_API_KEY=your_key node scripts/test-enrichment.js
```

If you don't have an API key yet, start with Step 1 above (10 minutes).

Once test passes, you're ready to scale to 661 facilities! 🚀

---

**Questions?** See detailed documentation:
- API Setup: [GOOGLE-PLACES-API-SETUP.md](GOOGLE-PLACES-API-SETUP.md)
- Full Plan: [DATA-COLLECTION-PLAN.md](DATA-COLLECTION-PLAN.md)
- Script Docs: [scripts/README.md](scripts/README.md)
- Dev Guide: [SKILLS.md](SKILLS.md)

**Updated**: 2025-10-29
**Status**: Ready to execute ✓
