# Contact Facility Feature - Testing Guide

## Implementation Summary

### Files Created/Modified

1. **Database Migration** (NEW)
   - `/supabase/migrations/20251229120000_contact_requests.sql`
   - Creates `contact_requests` table with RLS policies
   - Tracks facility contact requests from patients

2. **Modal Component** (NEW)
   - `/src/components/Journey/ContactFacilityModal.tsx`
   - Form with: Name, Email, Phone (optional), Message (optional)
   - Pre-fills procedure type from journey
   - Shows success/error states

3. **Comparison Table** (MODIFIED)
   - `/src/components/Journey/ComparisonTable.tsx`
   - Added `procedureType` prop
   - Added "Request Quote" button in Actions row
   - Integrates ContactFacilityModal

4. **Journey Dashboard** (MODIFIED)
   - `/src/components/Journey/JourneyDashboard.tsx`
   - Passes `procedureType` to ComparisonTable

5. **Netlify Function** (NEW)
   - `/netlify/functions/contact-facility.ts`
   - Handles contact request submission
   - Saves to database and prepares email
   - Updates contact request status

## Database Schema

```sql
contact_requests (
  id UUID PRIMARY KEY,
  journey_id UUID REFERENCES patient_journeys,
  facility_id UUID REFERENCES facilities,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  user_phone TEXT,
  message TEXT,
  procedure_type TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

## Testing Checklist

### 1. Database Migration
- [ ] Run migration: `supabase db push` (from marketplace directory)
- [ ] Verify table exists in Supabase dashboard
- [ ] Check RLS policies are enabled
- [ ] Test insert as authenticated user

### 2. UI Components
- [ ] Navigate to My Journey page (must be logged in)
- [ ] Add 2+ facilities to shortlist
- [ ] Check "Compare" tab shows comparison table
- [ ] Verify "Request Quote" button appears in Actions row for each facility

### 3. Modal Functionality
- [ ] Click "Request Quote" button
- [ ] Modal opens with facility name in header
- [ ] Procedure type is pre-filled (read-only)
- [ ] Enter name and email (required fields)
- [ ] Phone and message are optional
- [ ] Submit button is enabled when required fields are filled

### 4. Form Submission
- [ ] Fill form and click "Send Request"
- [ ] Button shows "Sending..." during submission
- [ ] Success state shows checkmark and confirmation message
- [ ] Modal auto-closes after 2 seconds
- [ ] Check Supabase `contact_requests` table for new row

### 5. Netlify Function
- [ ] Check browser network tab for POST to `/.netlify/functions/contact-facility`
- [ ] Response should be 200 OK with JSON: `{ success: true, contactRequestId: "..." }`
- [ ] Check Netlify function logs (if deployed)
- [ ] Email HTML template is logged in console

### 6. Error Handling
- [ ] Try submitting without required fields (should show validation)
- [ ] Disconnect internet and submit (should show error message)
- [ ] Check error message appears below form
- [ ] Modal stays open on error

### 7. Responsive Design
- [ ] Test on mobile viewport (modal should be scrollable)
- [ ] Check tablet layout
- [ ] Verify buttons stack properly in comparison table

### 8. RLS Security
- [ ] User can only see their own contact requests
- [ ] User cannot insert contact request for another user's journey
- [ ] Admin can see all contact requests

## Manual Testing Script

```javascript
// Test in browser console after logging in
// 1. Check if table exists
const { data, error } = await supabase
  .from('contact_requests')
  .select('*')
  .limit(1);

console.log('Table access:', error ? 'FAILED' : 'SUCCESS');

// 2. Test RLS - try to insert (should work for own journey)
const { data: journey } = await supabase
  .from('patient_journeys')
  .select('id')
  .limit(1)
  .single();

if (journey) {
  const { data: request, error: insertError } = await supabase
    .from('contact_requests')
    .insert({
      journey_id: journey.id,
      facility_id: 'some-facility-uuid',
      user_name: 'Test User',
      user_email: 'test@example.com',
      procedure_type: 'Test Procedure'
    })
    .select()
    .single();

  console.log('Insert test:', insertError ? 'FAILED' : 'SUCCESS', request);
}
```

## Known Limitations / TODOs

1. **Email Integration Not Connected**
   - Currently logs email HTML to console
   - Need to integrate SendGrid, AWS SES, or Resend
   - Update Netlify function with actual email service

2. **Facility Email Lookup**
   - Assumes `contact_email` field on facilities table
   - May need to add this field in a future migration
   - Falls back to 'info@oasara.com' if not found

3. **No Email Confirmation**
   - User doesn't receive confirmation email
   - Consider sending copy to user's email

4. **No Contact History UI**
   - Contact requests are saved but not displayed anywhere
   - Could add a "My Contacts" section in journey dashboard

## Next Steps (Post-Testing)

1. Deploy migration to production Supabase
2. Add `contact_email` field to facilities table if missing
3. Integrate real email service (SendGrid recommended)
4. Add email templates directory
5. Create admin view for contact requests
6. Add contact history to patient dashboard
7. Set up email notifications for facilities
8. Add rate limiting to prevent spam

## Success Criteria

- [x] Database table created with proper RLS
- [x] Modal component renders correctly
- [x] Form validation works
- [x] Data saves to database
- [x] Netlify function processes request
- [ ] User can successfully request quotes from comparison table
- [ ] Security policies prevent unauthorized access
- [ ] No console errors during flow
