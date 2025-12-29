# JourneyDashboard.tsx Integration Guide

## Manual Integration Required

The file `src/components/Journey/JourneyDashboard.tsx` needs manual modification to add the Share button and modal.

## Step 1: Add Import

Add this import at the top of the file (around line 10):

```tsx
import ShareJourneyModal from './ShareJourneyModal';
```

Full imports section should look like:
```tsx
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import ComparisonTable from './ComparisonTable';
import FacilityShortlist from './FacilityShortlist';
import PersonalNotes from './PersonalNotes';
import { Link } from 'react-router-dom';
import JourneyChatbot from './JourneyChatbot';
import { exportJourneyToPDF } from '../../utils/exportJourneyPDF';
import ShareJourneyModal from './ShareJourneyModal';  // <-- ADD THIS LINE
```

## Step 2: Add State Variable

In the component, add state for the share modal (around line 31):

```tsx
const [isShareModalOpen, setIsShareModalOpen] = useState(false);
```

Full state section should look like:
```tsx
const JourneyDashboard: React.FC<JourneyDashboardProps> = ({ journey }) => {
  const [activeTab, setActiveTab] = useState<'compare' | 'shortlist' | 'notes'>('compare');
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [isEditingProcedure, setIsEditingProcedure] = useState(false);
  const [editedProcedure, setEditedProcedure] = useState(journey.procedure_type);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);  // <-- ADD THIS LINE
```

## Step 3: Add Share Button

Find the section with the action buttons (around line 241-262). Add the Share button BEFORE the Export PDF button:

**Find this section:**
```tsx
<div className="flex items-center gap-3">
  <button
    onClick={handleExportPDF}
    disabled={shortlistCount === 0}
    className="px-4 py-2 bg-white border-2 border-ocean-600 text-ocean-600 rounded-lg hover:bg-ocean-50 transition-all text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
    title={shortlistCount === 0 ? 'Add facilities to export' : 'Export journey to PDF'}
  >
```

**Replace with:**
```tsx
<div className="flex items-center gap-3">
  <button
    onClick={() => setIsShareModalOpen(true)}
    className="px-4 py-2 bg-white border-2 border-ocean-300 text-ocean-700 rounded-lg hover:border-ocean-600 hover:bg-ocean-50 transition-all text-sm font-medium flex items-center gap-2"
    title="Share journey with family"
  >
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
    </svg>
    Share
  </button>
  <button
    onClick={handleExportPDF}
    disabled={shortlistCount === 0}
    className="px-4 py-2 bg-white border-2 border-ocean-600 text-ocean-600 rounded-lg hover:bg-ocean-50 transition-all text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
    title={shortlistCount === 0 ? 'Add facilities to export' : 'Export journey to PDF'}
  >
```

## Step 4: Add Modal Component

At the end of the component, just before the closing `</div>` (around line 448-455), add the ShareJourneyModal:

**Find this section:**
```tsx
      {/* AI Chatbot - Fixed position */}
      <JourneyChatbot
        journey={journey}
        shortlistedFacilities={shortlistedFacilities || []}
        isOpen={isChatbotOpen}
        setIsOpen={setIsChatbotOpen}
      />
    </div>
  );
};

export default JourneyDashboard;
```

**Replace with:**
```tsx
      {/* AI Chatbot - Fixed position */}
      <JourneyChatbot
        journey={journey}
        shortlistedFacilities={shortlistedFacilities || []}
        isOpen={isChatbotOpen}
        setIsOpen={setIsChatbotOpen}
      />

      {/* Share Journey Modal */}
      <ShareJourneyModal
        journeyId={journey.id}
        procedureType={journey.procedure_type}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />
    </div>
  );
};

export default JourneyDashboard;
```

## Complete Modified Section (Step 3 + Step 4)

Here's the complete action buttons + modals section for reference:

```tsx
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="px-4 py-2 bg-white border-2 border-ocean-300 text-ocean-700 rounded-lg hover:border-ocean-600 hover:bg-ocean-50 transition-all text-sm font-medium flex items-center gap-2"
              title="Share journey with family"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share
            </button>
            <button
              onClick={handleExportPDF}
              disabled={shortlistCount === 0}
              className="px-4 py-2 bg-white border-2 border-ocean-600 text-ocean-600 rounded-lg hover:bg-ocean-50 transition-all text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              title={shortlistCount === 0 ? 'Add facilities to export' : 'Export journey to PDF'}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export PDF
            </button>
            <button
              onClick={() => setIsChatbotOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-ocean-600 to-ocean-700 text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              Have Questions?
            </button>
          </div>
        </div>
      </motion.div>

      {/* ... rest of component ... */}

      {/* AI Chatbot - Fixed position */}
      <JourneyChatbot
        journey={journey}
        shortlistedFacilities={shortlistedFacilities || []}
        isOpen={isChatbotOpen}
        setIsOpen={setIsChatbotOpen}
      />

      {/* Share Journey Modal */}
      <ShareJourneyModal
        journeyId={journey.id}
        procedureType={journey.procedure_type}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />
    </div>
  );
};

export default JourneyDashboard;
```

## Verification

After making these changes:

1. **Check for TypeScript errors**: `npm run build`
2. **Test the Share button appears** in the journey dashboard
3. **Test the modal opens** when clicking Share
4. **Verify no console errors** in browser dev tools

## Router Configuration

Don't forget to add the new routes to your router configuration file (probably `src/App.tsx`):

```tsx
import AcceptInvite from './pages/AcceptInvite';
import SharedJourneyView from './components/Journey/SharedJourneyView';

// In your Routes:
<Route path="/journey/accept-invite/:token" element={<AcceptInvite />} />
<Route path="/journey/shared/:journeyId" element={<SharedJourneyView journeyId={/* extract from params */} />} />
```

## Troubleshooting

### Share button not showing
- Verify import was added correctly
- Check for TypeScript errors
- Ensure state variable is defined

### Modal not opening
- Check state variable is being set in onClick
- Verify ShareJourneyModal import path is correct
- Look for console errors

### TypeScript errors
- Ensure all imports match actual file locations
- Check that Journey interface includes all required fields
- Verify ShareJourneyModal props match the component definition

## Next Steps

Once JourneyDashboard integration is complete:
1. Apply database migration (see JOURNEY_SHARING_IMPLEMENTATION.md)
2. Configure EmailJS
3. Test full invitation flow
4. Deploy to production
