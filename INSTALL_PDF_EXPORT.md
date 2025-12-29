# PDF Export Feature - Installation Instructions

## Overview
This document provides instructions for installing the dependencies required for the Journey PDF Export feature.

## Installation

Run the following command in the project root directory:

```bash
npm install jspdf jspdf-autotable @types/jspdf
```

## Package Details

- **jspdf** (^2.5.2): Core PDF generation library
- **jspdf-autotable** (^3.8.3): Table generation plugin for jsPDF
- **@types/jspdf** (^2.2.4): TypeScript type definitions for jsPDF

## Verification

After installation, verify the packages are listed in `package.json`:

```json
{
  "dependencies": {
    "jspdf": "^2.5.2",
    "jspdf-autotable": "^3.8.3"
  },
  "devDependencies": {
    "@types/jspdf": "^2.2.4"
  }
}
```

## Testing

1. Start the development server: `npm start`
2. Navigate to a journey dashboard with saved facilities
3. Click the "Export PDF" button in the top-right corner
4. Verify that a PDF downloads with:
   - Oasara branding header
   - Journey summary section
   - Facility comparison table
   - Personal notes section
   - Footer with date and website

## Files Created/Modified

### Created:
- `/src/utils/exportJourneyPDF.ts` - PDF generation utility

### Modified:
- `/src/components/Journey/JourneyDashboard.tsx` - Added export button and handler

## Features

The exported PDF includes:
- **Header**: Oasara branding with ocean blue background
- **Journey Summary**: Procedure type, budget, timeline, facility count, creation date
- **Facility Comparison Table**: All shortlisted facilities with location, JCI status, ratings
- **Personal Notes**: User notes for each facility
- **Footer**: Generation date and oasara.com branding

## Troubleshooting

If the export fails:
1. Verify all dependencies are installed
2. Check browser console for errors
3. Ensure at least one facility is added to the shortlist (button is disabled when empty)
4. Try with a smaller number of facilities first

## Brand Colors Used

- Ocean Primary: `#0A6C94` (RGB: 10, 108, 148)
- Ocean Dark: `#084B6B` (RGB: 8, 75, 107)
- Ocean Light: `#E6F3F7` (RGB: 230, 243, 247)
- Sage Primary: `#6B8E7C` (RGB: 107, 142, 124)
- Sage Light: `#F0F5F2` (RGB: 240, 245, 242)
