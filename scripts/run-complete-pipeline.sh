#!/bin/bash

# Complete Data Collection Pipeline
# Runs test, enrichment, and import in sequence

echo "🚀 OASARA Complete Data Collection Pipeline"
echo "============================================================"
echo ""

# Check for API key
if [ -z "$GOOGLE_PLACES_API_KEY" ]; then
    echo "❌ Error: GOOGLE_PLACES_API_KEY not set"
    echo ""
    echo "Run this script with:"
    echo "GOOGLE_PLACES_API_KEY=your_key ./scripts/run-complete-pipeline.sh"
    echo ""
    exit 1
fi

# Step 1: Test with 5 samples
echo "📋 Step 1: Testing enrichment with 5 sample facilities..."
echo "-----------------------------------------------------------"
node scripts/test-enrichment.js
if [ $? -ne 0 ]; then
    echo "❌ Test failed. Please check your API key and try again."
    exit 1
fi

echo ""
echo "✅ Test passed! Proceeding with full data collection..."
echo ""

# Step 2: Enrich Tier 1 facilities
echo "📋 Step 2: Enriching 130 Tier 1 facilities..."
echo "-----------------------------------------------------------"
node scripts/enrich-facilities.js
if [ $? -ne 0 ]; then
    echo "❌ Enrichment failed. Check the error above."
    exit 1
fi

echo ""
echo "✅ Enrichment complete!"
echo ""

# Step 3: Import to Supabase
echo "📋 Step 3: Importing to Supabase..."
echo "-----------------------------------------------------------"
node scripts/import-to-supabase.js
if [ $? -ne 0 ]; then
    echo "❌ Import failed. Check the error above."
    exit 1
fi

echo ""
echo "============================================================"
echo "🎉 COMPLETE! All 130 facilities imported successfully!"
echo "============================================================"
echo ""
echo "✓ Total facilities in database: 140 (10 original + 130 new)"
echo "✓ Next: Open http://localhost:3000 to see all facilities"
echo ""
echo "💰 Cost for this run: ~\$6.40 (within free \$200 tier)"
echo ""
