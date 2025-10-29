# 🚀 Run Data Collection NOW

**Everything is ready. Just need your Google Places API key.**

---

## ⚡ Fast Track (15 minutes total)

### Step 1: Get API Key (10 min)

1. Open: **https://console.cloud.google.com/**
2. Sign in with Google account
3. Click **"Select a project"** → **"NEW PROJECT"**
4. Name: `OASARA Data Collection` → **CREATE**
5. After 10 seconds, select the new project

6. Left sidebar: **APIs & Services** → **Library**
7. Search: `Places API` → Click it → **ENABLE**

8. Left sidebar: **APIs & Services** → **Credentials**
9. Click **"+ CREATE CREDENTIALS"** → **"API key"**
10. **COPY THE KEY** (starts with `AIzaSy...`)

11. Left sidebar: **Billing** → **"LINK A BILLING ACCOUNT"**
12. Add credit card (you get $200 FREE/month, we'll use $32 total)

---

### Step 2: Run Complete Pipeline (5 min)

Open Terminal and run:

```bash
cd /Users/aaronday/Documents/medicaltourism/oasara-marketplace

# Replace 'your_api_key_here' with your actual API key
GOOGLE_PLACES_API_KEY=your_api_key_here ./scripts/run-complete-pipeline.sh
```

**This will automatically:**
1. Test with 5 facilities (30 seconds)
2. Enrich 130 Tier 1 facilities (3 minutes)
3. Import to Supabase (30 seconds)

**Result**: 140 total facilities (10 + 130) 🎉

---

### Step 3: See Results

Open: **http://localhost:3000**

You should see 140 facilities on the map!

---

## 🎯 Alternative: Step-by-Step

If you prefer to run each step manually:

### Test First (2 min)
```bash
cd /Users/aaronday/Documents/medicaltourism/oasara-marketplace
GOOGLE_PLACES_API_KEY=your_key node scripts/test-enrichment.js
```

Expected output:
```
✅ PASSED: Ready to process all 661 facilities!
📊 Success Rate: 100.0%
```

### Enrich Tier 1 (3 min)
```bash
GOOGLE_PLACES_API_KEY=your_key node scripts/enrich-facilities.js
```

Expected output:
```
📊 Loaded 130 facilities to enrich
[1/130] Enriching Bumrungrad International Hospital...
   ✓ Added: coordinates, rating, contact info
...
✓ Successfully Enriched: 130 (100.0%)
```

### Import to Database (30 sec)
```bash
node scripts/import-to-supabase.js
```

Expected output:
```
📊 Loaded 130 facilities to import
Importing batch 1/2...
   ✓ Imported 100 facilities
Importing batch 2/2...
   ✓ Imported 30 facilities
✅ Import complete!
```

### Verify
```bash
# Open browser to:
http://localhost:3000

# You should see 140 facilities on map!
```

---

## 📊 What You'll Get Today

**Tier 1 Complete** (130 facilities):
- 🇹🇭 Thailand: 35 facilities
- 🇮🇳 India: 40 facilities
- 🇹🇷 Turkey: 35 facilities
- 🇸🇬 Singapore: 20 facilities

**Total in database**: 140 facilities
**Cost**: $6.40 (within $200 free tier)

---

## 🐛 Troubleshooting

**"API key not valid"**
→ Wait 2-3 minutes after creating key, then try again

**"OVER_QUERY_LIMIT"**
→ Make sure billing is enabled in Google Cloud Console

**"Place not found" for some facilities**
→ Normal! Script keeps original data and continues

**Script fails halfway**
→ Safe to re-run, uses upsert (no duplicates)

---

## 🚀 After Tier 1

Want all 661 facilities today?

Just prepare more facility lists and run again:

```bash
# Create data/tier2-facilities.json (120 facilities)
# Create data/tier3-facilities.json (80 facilities)
# Create data/tier4-facilities.json (331 facilities)

# Run enrichment for each tier
GOOGLE_PLACES_API_KEY=your_key node scripts/enrich-facilities.js
node scripts/import-to-supabase.js
```

**Total time for all 661**: ~45 minutes
**Total cost**: $32.39 (FREE within $200 credit)

---

## ✅ Ready?

**Run this command now:**

```bash
cd /Users/aaronday/Documents/medicaltourism/oasara-marketplace
GOOGLE_PLACES_API_KEY=your_key ./scripts/run-complete-pipeline.sh
```

**Don't have API key yet?** → See Step 1 above (10 min)

---

**Let's get 140 facilities live today!** 🎉
