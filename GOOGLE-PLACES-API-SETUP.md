# Google Places API Setup Guide

**Time Required**: 10 minutes
**Cost**: $0 (Free tier includes $200/month credit)

## Step-by-Step Instructions

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account
3. Click **"Select a project"** dropdown at top
4. Click **"NEW PROJECT"**
5. Project name: `OASARA Data Collection`
6. Click **"CREATE"**
7. Wait for project creation (10-15 seconds)
8. Select the new project from dropdown

### 2. Enable Places API

1. In the left sidebar, click **"APIs & Services"** → **"Library"**
2. Search for: `Places API`
3. Click on **"Places API"**
4. Click **"ENABLE"** button
5. Wait for confirmation (5-10 seconds)

### 3. Create API Key

1. Click **"APIs & Services"** → **"Credentials"** in left sidebar
2. Click **"+ CREATE CREDENTIALS"** at top
3. Select **"API key"**
4. Your API key will be created and displayed
5. **COPY THE KEY** - it looks like: `AIzaSyA...`
6. Click **"CLOSE"** (you can view it later if needed)

### 4. Restrict API Key (Optional but Recommended)

For better security:

1. Click the API key name to edit
2. Under **"API restrictions"**:
   - Select **"Restrict key"**
   - Check **"Places API"**
3. Click **"SAVE"**

### 5. Enable Billing (Required for Usage)

Google Places API requires billing enabled, but you get $200 free credit monthly:

1. Click **"Billing"** in left sidebar
2. Click **"LINK A BILLING ACCOUNT"**
3. Follow steps to add credit card
4. **Don't worry**: You won't be charged unless you exceed $200/month
5. Our 661 facilities = $32 total (well within free tier)

### 6. Test Your API Key

Add to your `.env.local` file:

```bash
GOOGLE_PLACES_API_KEY=AIzaSyA...your_actual_key...
```

Then test with 5 sample facilities:

```bash
cd /Users/aaronday/Documents/medicaltourism/oasara-marketplace
GOOGLE_PLACES_API_KEY=your_key node scripts/test-enrichment.js
```

Expected output:
```
🧪 Testing Google Places API Enrichment
============================================================

Testing with 5 sample facilities:

[1/5] Testing: Bumrungrad International Hospital, Bangkok
   ✓ SUCCESS
     - Coordinates: 13.7442, 100.5608
     - Rating: 4.5 ⭐
     - Website: https://www.bumrungrad.com
     - Phone: +66 2 066 8888

[2/5] Testing: Apollo Hospitals, Chennai
   ✓ SUCCESS
     - Coordinates: 13.0661, 80.2564
     - Rating: 4.3 ⭐
     ...

============================================================
🧪 TEST RESULTS
============================================================
✓ Successful: 5/5
✗ Failed: 0/5
📊 Success Rate: 100.0%

✅ PASSED: Ready to process all 661 facilities!
```

## Cost Breakdown

### Per Facility
- Text Search: $0.032
- Place Details: $0.017
- **Total per facility**: $0.049

### Full Dataset (661 Facilities)
- Text Search: $21.15
- Place Details: $11.24
- **Total: $32.39**

### Monthly Free Credit
- Google provides: **$200/month FREE**
- Our total cost: **$32.39**
- **Remaining credit: $167.61** ✓

## Quota Limits

Google's default quotas (more than enough):
- 30,000 requests per minute
- 100 requests per second

Our usage:
- 661 × 2 = 1,322 total requests
- Processing at 200ms delay = 5 requests/second
- **Total time: ~4.5 minutes** for all 661 facilities

## Troubleshooting

### "API key not valid"
- Ensure Places API is enabled
- Check API key restrictions
- Wait 2-3 minutes after creating key (propagation delay)

### "This API project is not authorized to use this API"
- Go back to APIs & Services → Library
- Search "Places API" and ensure it's enabled

### "OVER_QUERY_LIMIT"
- Enable billing on your Google Cloud project
- Check you're within quota limits

### "REQUEST_DENIED"
- Ensure API key has Places API access
- Remove unnecessary API restrictions

## Security Best Practices

1. **Never commit API key to Git**
   - Already in `.gitignore` as `.env.local`

2. **Restrict API key**
   - Limit to Places API only
   - Add IP restrictions if deploying scripts to server

3. **Monitor usage**
   - Check [Google Cloud Console](https://console.cloud.google.com/apis/dashboard)
   - Set up billing alerts at $10, $20, $30

## Next Steps

Once API key is working:

1. **Start with test sample** (5 facilities - 2 minutes):
   ```bash
   GOOGLE_PLACES_API_KEY=your_key node scripts/test-enrichment.js
   ```

2. **Process Tier 1** (130 facilities - ~15 minutes):
   - Create `data/jci-facilities-tier1.json` with Thailand, India, Turkey, Singapore facilities
   - Run enrichment: `GOOGLE_PLACES_API_KEY=your_key node scripts/enrich-facilities.js`

3. **Import to Supabase**:
   ```bash
   node scripts/import-to-supabase.js
   ```

4. **Verify on map**: Visit http://localhost:3000

5. **Continue to 661 facilities** over next 3 weeks

## Support

- [Google Places API Documentation](https://developers.google.com/maps/documentation/places/web-service)
- [Pricing Calculator](https://mapsplatform.google.com/pricing/)
- [API Key Best Practices](https://developers.google.com/maps/api-security-best-practices)

---

**Ready to collect all 661 facilities!** 🚀

**Updated**: 2025-10-29
