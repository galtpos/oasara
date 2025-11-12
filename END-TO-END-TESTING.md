# OASARA End-to-End Testing Checklist

## Test Status: ⏳ IN PROGRESS
**Date**: November 12, 2025
**Tester**: Admin
**Environment**: Local (localhost:3000)

---

## 1. Admin Authentication ✅ PRIORITY 1

### 1.1 Login Flow
- [ ] Navigate to http://localhost:3000/admin/login
- [ ] Test with valid credentials:
  - Email: `eileen@daylightfreedom.org`
  - Password: `admin123`
- [ ] Verify redirect to `/admin` dashboard
- [ ] Verify user menu shows correct email and name
- [ ] Verify "ADMIN" badge appears in sidebar

### 1.2 Protected Routes
- [ ] Try accessing `/admin` without login (should redirect to login)
- [ ] Try accessing `/admin/facilities` without login
- [ ] Verify admin-only access via RLS policies

### 1.3 Logout Flow
- [ ] Click user menu → Sign Out
- [ ] Verify redirect to `/admin/login`
- [ ] Verify cannot access `/admin` after logout

**Status**: ⏳ NEEDS TESTING
**Issues Found**: None yet

---

## 2. Dashboard Functionality ✅ PRIORITY 1

### 2.1 Metrics Display
- [ ] Verify "Total Facilities" shows correct count (should be 518)
- [ ] Verify "Doctor Profiles" shows count from database
- [ ] Verify "Patient Testimonials" shows count
- [ ] Verify "Procedure Prices" shows count
- [ ] Check all numbers match actual database

### 2.2 Data Quality Overview
- [ ] Verify "Facilities with Doctors" percentage is accurate
- [ ] Verify "Facilities with Testimonials" percentage
- [ ] Verify "Facilities with Pricing" percentage
- [ ] Check progress bars animate on load

### 2.3 Quick Actions
- [ ] Click "Add Facility" → should navigate to `/admin/facilities/new`
- [ ] Click "Manage Facilities" → should navigate to `/admin/facilities`
- [ ] Click "View Tasks" → should navigate to `/admin/tasks`

### 2.4 System Status
- [ ] Verify "All systems operational" shows green indicator
- [ ] Verify summary counts display correctly

**Status**: ⏳ NEEDS TESTING
**Issues Found**: None yet

---

## 3. Facilities List ✅ PRIORITY 1

### 3.1 View Facilities
- [ ] Navigate to `/admin/facilities`
- [ ] Verify 518 facilities load correctly
- [ ] Test card view vs table view toggle
- [ ] Verify all facility data displays:
  - Name, country, city
  - JCI badge
  - Specialties
  - Contact info (website, phone)

### 3.2 Search & Filter
- [ ] Test search by facility name
- [ ] Test search by city
- [ ] Test country filter dropdown
- [ ] Test specialty filter
- [ ] Verify results update in real-time

### 3.3 Pagination/Infinite Scroll
- [ ] Verify facilities load in batches
- [ ] Test scrolling through all 518 facilities
- [ ] Verify performance is smooth

**Status**: ⏳ NEEDS TESTING
**Issues Found**: None yet

---

## 4. Facility Editor (CRUD Operations) ✅ PRIORITY 1

### 4.1 Create New Facility
- [ ] Click "+ Add Facility" button
- [ ] Navigate to `/admin/facilities/new`
- [ ] Test interactive map:
  - Click on map to set location
  - Verify coordinates update
- [ ] Fill in all required fields:
  - Facility name
  - Country
  - City
  - Coordinates (from map click)
- [ ] Test multi-select components:
  - Select specialties from list
  - Add custom specialty
  - Select languages
  - Add custom language
- [ ] Toggle JCI accredited checkbox
- [ ] Toggle Accepts Zano checkbox
- [ ] Add optional fields (website, phone, email)
- [ ] Click "Save Facility"
- [ ] Verify facility appears in database
- [ ] Verify redirect back to facilities list

### 4.2 Edit Existing Facility
- [ ] Navigate to `/admin/facilities`
- [ ] Click "Edit" on any facility
- [ ] Verify form pre-fills with existing data
- [ ] Update facility name
- [ ] Click new location on map
- [ ] Add/remove specialties
- [ ] Click "Save Changes"
- [ ] Verify changes persist in database
- [ ] Verify updated data shows in facilities list

### 4.3 Map Interaction
- [ ] Verify Mapbox loads correctly
- [ ] Test clicking different locations
- [ ] Verify coordinates update accurately
- [ ] Test with facilities from different countries

### 4.4 Multi-Select Components
- [ ] Verify 16 common specialties appear
- [ ] Test adding custom specialty
- [ ] Verify 16 common languages appear
- [ ] Test adding custom language
- [ ] Verify selected items display as pills/tags
- [ ] Test removing selected items

### 4.5 Form Validation
- [ ] Try saving without required fields
- [ ] Verify error messages appear
- [ ] Test with invalid coordinates
- [ ] Test with invalid email format

**Status**: ⏳ NEEDS TESTING
**Issues Found**: None yet

---

## 5. Public Site (Marketplace) ✅ PRIORITY 1

### 5.1 Facility Map
- [ ] Navigate to http://localhost:3000
- [ ] Verify interactive map loads with all 518 facilities
- [ ] Test map clustering:
  - Zoom out → facilities cluster together
  - Click cluster → zoom in
  - Zoom in → individual markers appear
- [ ] Click facility marker → verify popup shows

### 5.2 Facility Cards
- [ ] Verify facility cards display below map
- [ ] Check all data displays:
  - Facility name
  - Location (city, country)
  - Specialties list
  - Google rating (if available)
  - Contact buttons (website, phone)
  - "Request Zano Payment" button
- [ ] Click "Visit Website" → opens in new tab
- [ ] Click "Call" → initiates phone call (mobile)
- [ ] Click facility card → map flies to location

### 5.3 Search Functionality
- [ ] Test search by facility name
- [ ] Test search by city name
- [ ] Test search by procedure/specialty
- [ ] Verify results filter in real-time
- [ ] Verify map updates to show filtered facilities

### 5.4 Filters
- [ ] Test country filter (dropdown with 39 countries)
- [ ] Test specialty filter
- [ ] Test "Zano Ready" toggle
- [ ] Verify multiple filters work together
- [ ] Test clearing filters

### 5.5 Responsive Design
- [ ] Test on desktop (1920px)
- [ ] Test on tablet (768px)
- [ ] Test on mobile (375px)
- [ ] Verify map and cards stack properly
- [ ] Verify touch interactions work on mobile

**Status**: ⏳ NEEDS TESTING
**Issues Found**: None yet

---

## 6. Database Operations ✅ PRIORITY 1

### 6.1 Supabase Connection
- [ ] Verify Supabase client initializes correctly
- [ ] Check environment variables are set:
  - `REACT_APP_SUPABASE_URL`
  - `REACT_APP_SUPABASE_ANON_KEY`
- [ ] Test connection to production database

### 6.2 Facilities Table
- [ ] Verify 518 facilities exist
- [ ] Test SELECT query with filters
- [ ] Test INSERT new facility
- [ ] Test UPDATE existing facility
- [ ] Test facility search queries

### 6.3 Enriched Data Tables
- [ ] Check `doctors` table has records
- [ ] Check `testimonials` table has records
- [ ] Check `procedure_pricing` table has records
- [ ] Verify JOIN queries work correctly

### 6.4 User Auth Tables
- [ ] Check `user_profiles` table
- [ ] Verify admin user exists (eileen@daylightfreedom.org)
- [ ] Test RLS policies restrict non-admin access

### 6.5 Row Level Security (RLS)
- [ ] Verify RLS policies are enabled
- [ ] Test that anon users can only read public data
- [ ] Test that admin users can modify data
- [ ] Verify service role key works for Edge Functions

**Status**: ⏳ NEEDS TESTING
**Issues Found**: None yet

---

## 7. Email & Contact Features ✅ PRIORITY 2

### 7.1 Request Zano Button
- [ ] Click "Request Zano Payment" on facility card
- [ ] Verify EmailJS modal/form appears
- [ ] Fill in contact form
- [ ] Submit form
- [ ] Verify email sent to facility
- [ ] Check email content and formatting

### 7.2 Facility Outreach
- [ ] Test outreach to facilities with websites
- [ ] Test outreach to facilities with emails
- [ ] Verify contact information is accurate

**Status**: ⏳ NEEDS TESTING
**Issues Found**: None yet

---

## 8. Performance & Loading ✅ PRIORITY 2

### 8.1 Page Load Times
- [ ] Measure time to first contentful paint
- [ ] Measure time to interactive
- [ ] Verify < 3 seconds on 3G connection

### 8.2 Map Performance
- [ ] Test with all 518 facilities loaded
- [ ] Verify smooth panning and zooming
- [ ] Check clustering performance at different zoom levels
- [ ] Verify no lag or stuttering

### 8.3 Data Fetching
- [ ] Check React Query caching works
- [ ] Verify stale data refetches correctly
- [ ] Test infinite scroll performance
- [ ] Monitor network requests (should be minimal)

**Status**: ⏳ NEEDS TESTING
**Issues Found**: None yet

---

## 9. Error Handling ✅ PRIORITY 2

### 9.1 Network Errors
- [ ] Disconnect network and test
- [ ] Verify error messages appear
- [ ] Test automatic retry behavior

### 9.2 Form Errors
- [ ] Test with invalid data
- [ ] Verify validation error messages
- [ ] Test server-side errors (duplicate entries, etc.)

### 9.3 Auth Errors
- [ ] Test with expired session
- [ ] Test with invalid credentials
- [ ] Verify proper error messages

**Status**: ⏳ NEEDS TESTING
**Issues Found**: None yet

---

## 10. Cross-Browser Testing ✅ PRIORITY 3

### 10.1 Desktop Browsers
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### 10.2 Mobile Browsers
- [ ] Safari iOS
- [ ] Chrome Android

**Status**: ⏳ NEEDS TESTING
**Issues Found**: None yet

---

## Issues Found

### Critical (Blocks functionality)
*None yet*

### High (Major feature broken)
*None yet*

### Medium (Feature partially broken)
*None yet*

### Low (Minor visual/UX issues)
*None yet*

---

## Test Results Summary

| Category | Tests Passed | Tests Failed | Status |
|----------|-------------|--------------|--------|
| Admin Auth | 0/7 | 0 | ⏳ Not Started |
| Dashboard | 0/14 | 0 | ⏳ Not Started |
| Facilities List | 0/9 | 0 | ⏳ Not Started |
| Facility Editor | 0/20 | 0 | ⏳ Not Started |
| Public Site | 0/15 | 0 | ⏳ Not Started |
| Database | 0/13 | 0 | ⏳ Not Started |
| Email/Contact | 0/6 | 0 | ⏳ Not Started |
| Performance | 0/9 | 0 | ⏳ Not Started |
| Error Handling | 0/9 | 0 | ⏳ Not Started |
| Cross-Browser | 0/6 | 0 | ⏳ Not Started |
| **TOTAL** | **0/108** | **0** | **⏳ Ready to Begin** |

---

## Next Steps

1. **Start with Priority 1 tests** (Admin Auth, Dashboard, CRUD)
2. **Document all issues** in this file as they're found
3. **Fix critical/high issues immediately**
4. **Re-test after fixes**
5. **Move to Priority 2 & 3 tests**

## How to Use This Checklist

1. Open this file in a second window/screen
2. Go through each test systematically
3. Check the box `[ ]` → `[x]` as you complete each test
4. Document any issues found in the "Issues Found" section
5. Update the summary table at the end

**Testing Started**: [Date/Time]
**Testing Completed**: [Date/Time]
**Total Time**: [Duration]
