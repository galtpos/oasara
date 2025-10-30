#!/bin/bash

# Check progress of fetch scraper

LOG_FILE="/Users/aaronday/Documents/medicaltourism/oasara-marketplace/fetch-scraper-results.log"

echo "🔍 FETCH SCRAPER PROGRESS"
echo "=========================="
echo ""

# Count results
SUCCESS=$(grep -c "✅ SUCCESS" "$LOG_FILE" 2>/dev/null || echo "0")
PARTIAL=$(grep -c "⚠️ PARTIAL" "$LOG_FILE" 2>/dev/null || echo "0")
FAILED=$(grep -c "❌ FAILED" "$LOG_FILE" 2>/dev/null || echo "0")

TOTAL=$((SUCCESS + PARTIAL + FAILED))

echo "📊 Results so far:"
echo "  ✅ Successful: $SUCCESS"
echo "  ⚠️  Partial: $PARTIAL"
echo "  ❌ Failed: $FAILED"
echo "  📈 Total processed: $TOTAL / 494"
echo ""

if [ $TOTAL -gt 0 ]; then
    SUCCESS_RATE=$(( (SUCCESS * 100) / TOTAL ))
    PARTIAL_RATE=$(( (PARTIAL * 100) / TOTAL ))
    echo "  Success rate: $SUCCESS_RATE%"
    echo "  Partial rate: $PARTIAL_RATE%"
    echo ""
fi

# Show latest facility
LATEST=$(grep "🏥 \[" "$LOG_FILE" | tail -1)
echo "🏥 Latest: $LATEST"
echo ""

# Show any successes
if [ $SUCCESS -gt 0 ] || [ $PARTIAL -gt 0 ]; then
    echo "✅ Facilities with data:"
    grep -B 1 "✅ SUCCESS\|⚠️ PARTIAL" "$LOG_FILE" | grep "🏥 \[" | tail -10
    echo ""
fi

echo "💡 To view full log: tail -f fetch-scraper-results.log"
