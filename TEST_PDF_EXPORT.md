# PDF Export Feature - Testing Guide

## Prerequisites

1. Install required packages:
```bash
cd /Users/aaronday/Documents/medicaltourism/oasara-marketplace
npm install jspdf jspdf-autotable @types/jspdf
```

2. Start the development server:
```bash
npm start
```

## Test Scenarios

### Test 1: Empty Journey (Button Disabled)
**Steps:**
1. Navigate to a journey with no facilities added
2. Locate the "Export PDF" button in the journey summary card
3. Verify button shows disabled state (grayed out)
4. Hover over button to see tooltip: "Add facilities to export"

**Expected Result:** Button is disabled and cannot be clicked

### Test 2: Single Facility Export
**Steps:**
1. Add one facility to your journey shortlist
2. Click the "Export PDF" button
3. Wait for PDF download

**Expected PDF Content:**
- Header with "OASARA" branding (ocean blue background)
- Journey Summary section with procedure, budget, timeline
- Facility Comparison table with 1 facility
- Personal Notes section (empty if no notes)
- Footer with date and oasara.com

**File Name Format:** `Oasara_Journey_[Procedure]_[Date].pdf`

### Test 3: Multiple Facilities with Ratings
**Steps:**
1. Add 3-5 facilities to your shortlist
2. Rate each facility (click on "Your Rating" row in comparison table)
3. Click "Export PDF" button

**Expected PDF Content:**
- All facilities appear in comparison table
- Your ratings show as hearts (♥♥♥♥♥)
- Google ratings show with star symbol (★)
- JCI accreditation shows as "Yes" or "No"

### Test 4: Facilities with Personal Notes
**Steps:**
1. Add notes to 2-3 facilities in your shortlist
2. Include multi-line notes with special characters
3. Export PDF

**Expected PDF Content:**
- Personal Notes section lists each facility with notes
- Notes are properly formatted and readable
- Long notes wrap to multiple lines
- Facilities without notes don't appear in this section

### Test 5: Budget and Timeline Display
**Steps:**
1. Ensure journey has budget_min and budget_max set
2. Ensure journey has timeline set ("immediate", "1-3 months", etc.)
3. Export PDF

**Expected PDF Content:**
- Budget shows formatted: "$5,000 - $15,000"
- Timeline shows capitalized: "1-3 Months"

### Test 6: Long Procedure Names
**Steps:**
1. Set a very long procedure name (e.g., "Breast Augmentation with Lift and Fat Transfer")
2. Add facilities and export

**Expected Result:**
- Procedure name appears in header and journey summary
- File name truncates or replaces spaces with underscores
- No layout issues in PDF

### Test 7: Page Break Handling
**Steps:**
1. Add 8-10 facilities to shortlist
2. Add extensive notes to multiple facilities
3. Export PDF

**Expected Result:**
- PDF automatically adds pages as needed
- Footer appears on every page
- No content is cut off
- Tables don't split awkwardly

### Test 8: Special Characters
**Steps:**
1. Add facilities with international characters (e.g., México, São Paulo)
2. Add notes with quotes, apostrophes, and special symbols
3. Export PDF

**Expected Result:**
- All characters display correctly
- No encoding issues
- Formatting remains intact

## Visual Verification Checklist

- [ ] Header background is ocean blue (#0A6C94)
- [ ] "OASARA" text is white and bold
- [ ] Section headers have light blue background (#E6F3F7)
- [ ] Tables have proper borders and alternating row colors
- [ ] Text is readable (not too small)
- [ ] Margins are consistent (20mm)
- [ ] Footer is centered at bottom of each page
- [ ] Logo/branding is professional and polished

## Performance Testing

1. **Small Journey (1-3 facilities)**: Export should complete in < 1 second
2. **Medium Journey (4-7 facilities)**: Export should complete in < 2 seconds
3. **Large Journey (8+ facilities)**: Export should complete in < 3 seconds

## Error Handling

### Test Error Recovery:
1. Disconnect from internet
2. Try to export (should still work - no API calls required)
3. Verify error message if PDF generation fails

## Browser Compatibility

Test in multiple browsers:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari
- [ ] Mobile browsers (iOS Safari, Chrome Mobile)

## Accessibility

- [ ] Button has proper tooltip/title attribute
- [ ] Button shows visual feedback on hover
- [ ] Disabled state is clearly visible
- [ ] Download icon is recognizable

## Regression Testing

After any changes to journey functionality, verify:
- [ ] Export button still appears in correct location
- [ ] Export still includes all sections
- [ ] Branding colors remain consistent
- [ ] No console errors during export

## Known Limitations

1. **Image Support**: Logo is text-based (no PNG/SVG embedding)
2. **Font Limitations**: Uses Helvetica (PDF standard font)
3. **File Size**: Large journeys may produce 200-500KB PDFs
4. **Browser Pop-up Blockers**: May need to allow downloads

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Button not appearing | Check import of exportJourneyPDF utility |
| TypeScript errors | Verify @types/jspdf is installed |
| PDF not downloading | Check browser console for errors |
| Blank PDF | Verify data is passed correctly to export function |
| Layout issues | Check page break logic in exportJourneyPDF.ts |
| Wrong colors | Verify RGB color conversions in COLORS object |

## Success Criteria

Export feature passes if:
- ✅ All 8 test scenarios pass
- ✅ Visual checklist is 100% complete
- ✅ No console errors during export
- ✅ PDF opens correctly in Adobe Reader and browser viewers
- ✅ Professional appearance matches Oasara brand
- ✅ All user data exports accurately
