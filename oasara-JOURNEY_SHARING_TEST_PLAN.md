# Journey Sharing System - Test Plan

## Pre-Test Setup

### 1. Apply Database Migration
```bash
cd /Users/aaronday/Documents/medicaltourism/oasara-marketplace
supabase link --project-ref nkfcfrzdacffvyzxihit
supabase db push
```

Or via Supabase Dashboard:
1. Go to SQL Editor
2. Copy `supabase/migrations/20251229120000_journey_sharing_system.sql`
3. Execute

### 2. Configure EmailJS
1. Create template with ID: `journey_invitation`
2. Add environment variables to Netlify:
   - `EMAILJS_SERVICE_ID`
   - `EMAILJS_PUBLIC_KEY`

### 3. Deploy Frontend
```bash
npm run build
netlify deploy --prod
```

## Test Scenarios

### Scenario 1: Basic Invitation Flow (Happy Path)

**Prerequisites**:
- User A (owner) has active journey
- User B email address

**Steps**:
1. Login as User A
2. Navigate to My Journey page
3. Click "Share" button
4. Verify Share Journey modal opens
5. Enter User B's email in invitation form
6. Select "Viewer (Read-Only)" role
7. Click "Send Invitation"
8. **Expected**: Success message appears
9. **Expected**: User B appears in collaborators list with "Pending" status
10. Check User B's email
11. **Expected**: Invitation email received with journey details
12. Click invitation link in email
13. **Expected**: Redirected to AcceptInvite page
14. **Expected**: Journey details displayed correctly
15. Click "Accept Invitation" (or "Sign In to Accept" if not logged in)
16. If not logged in, sign in as User B
17. **Expected**: Redirected to shared journey view
18. **Expected**: Can see facilities and notes
19. **Expected**: No edit/delete buttons visible
20. **Expected**: Viewer badge displayed at top

**Result**: ✅ Pass / ❌ Fail

**Notes**: _____________________

---

### Scenario 2: Permission Verification

**Prerequisites**:
- User B has accepted invitation from Scenario 1

**Steps**:
1. Login as User B (viewer)
2. Navigate to shared journey
3. Attempt to add a facility to shortlist
4. **Expected**: No "Add" button visible
5. Attempt to create a new note
6. **Expected**: No "Add Note" button visible
7. Attempt to edit procedure type
8. **Expected**: No edit button visible
9. View facilities list
10. **Expected**: All facilities visible with full details
11. View notes list
12. **Expected**: All notes visible and readable
13. Logout
14. Login as User A (owner)
15. Navigate to My Journey
16. Add a new facility
17. **Expected**: Facility added successfully
18. Create a new note
19. **Expected**: Note created successfully
20. Logout and login as User B
21. Refresh shared journey page
22. **Expected**: New facility and note visible immediately

**Result**: ✅ Pass / ❌ Fail

**Notes**: _____________________

---

### Scenario 3: Revoke Access

**Prerequisites**:
- User B has accepted invitation

**Steps**:
1. Login as User A (owner)
2. Navigate to My Journey
3. Click "Share" button
4. Locate User B in collaborators list
5. **Expected**: User B shows "Accepted" status
6. Click "Revoke" button next to User B
7. Confirm revocation in dialog
8. **Expected**: User B status changes to "Revoked"
9. Logout
10. Login as User B
11. Navigate to shared journey URL
12. **Expected**: Access denied message or journey not visible
13. Attempt to use original invitation link
14. **Expected**: Error message "already been revoked"

**Result**: ✅ Pass / ❌ Fail

**Notes**: _____________________

---

### Scenario 4: Expired Invitation

**Prerequisites**:
- User A (owner) has active journey

**Steps**:
1. Login as User A
2. Send invitation to User C
3. Copy invitation token from database
4. Update `token_expires_at` to past date:
   ```sql
   UPDATE journey_collaborators
   SET token_expires_at = NOW() - INTERVAL '1 day'
   WHERE email = 'userc@example.com';
   ```
5. Open invitation link
6. **Expected**: "This invitation has expired" error message
7. **Expected**: No accept button available
8. Login as User A
9. Click "Share" button
10. Locate User C in collaborators list
11. **Expected**: Status still "Pending"
12. Click "Copy Link" button
13. Send new invitation (generates new token)
14. **Expected**: New invitation email sent with new token
15. Open new invitation link
16. **Expected**: Valid invitation page loads
17. Accept invitation
18. **Expected**: Access granted successfully

**Result**: ✅ Pass / ❌ Fail

**Notes**: _____________________

---

### Scenario 5: Duplicate Invitation

**Prerequisites**:
- User B already invited but not yet accepted

**Steps**:
1. Login as User A
2. Click "Share" button
3. Enter User B's email again
4. Click "Send Invitation"
5. **Expected**: Error message "This email has already been invited"
6. **Expected**: No duplicate invitation created
7. Check collaborators list
8. **Expected**: Only one entry for User B with "Pending" status

**Result**: ✅ Pass / ❌ Fail

**Notes**: _____________________

---

### Scenario 6: Copy Invitation Link

**Prerequisites**:
- User A has sent invitation to User D (still pending)

**Steps**:
1. Login as User A
2. Click "Share" button
3. Locate User D in collaborators list (status: Pending)
4. Click "Copy Link" button
5. **Expected**: Button text changes to "Copied!"
6. Open new incognito/private browser window
7. Paste invitation link
8. **Expected**: Valid invitation page loads
9. **Expected**: Journey details displayed correctly
10. Accept invitation (sign in as User D if needed)
11. **Expected**: Access granted successfully

**Result**: ✅ Pass / ❌ Fail

**Notes**: _____________________

---

### Scenario 7: Decline Invitation

**Prerequisites**:
- User E email invited but not yet accepted

**Steps**:
1. Open invitation link as User E
2. **Expected**: Invitation page loads
3. Click "Decline" button
4. **Expected**: Confirmation message displayed
5. **Expected**: Redirected to home page
6. Attempt to open invitation link again
7. **Expected**: Error message "already been declined"
8. Login as User A (owner)
9. Click "Share" button
10. **Expected**: User E not visible in collaborators list (or shows "Declined" status)

**Result**: ✅ Pass / ❌ Fail

**Notes**: _____________________

---

### Scenario 8: Unauthenticated User

**Prerequisites**:
- User F email invited (User F has no Oasara account)

**Steps**:
1. Open invitation link in incognito window (not logged in)
2. **Expected**: Invitation page loads
3. **Expected**: "Account Required" notice displayed
4. **Expected**: Button text is "Sign In to Accept"
5. Click "Sign In to Accept"
6. **Expected**: Redirected to sign up page
7. **Expected**: Email field pre-filled with User F's email
8. **Expected**: Return URL includes invitation token
9. Create account for User F
10. **Expected**: After signup, redirected back to invitation page
11. **Expected**: Auto-accepted (email matches invitation)
12. **Expected**: Redirected to shared journey view
13. **Expected**: Full access as viewer

**Result**: ✅ Pass / ❌ Fail

**Notes**: _____________________

---

### Scenario 9: Activity Logging

**Prerequisites**:
- Database access to check logs

**Steps**:
1. Login as User A
2. Send invitation to User G
3. Query database:
   ```sql
   SELECT * FROM journey_access_log WHERE action = 'invite_sent' ORDER BY timestamp DESC LIMIT 1;
   ```
4. **Expected**: Log entry created with correct journey_id and user_id
5. User G accepts invitation
6. Query database:
   ```sql
   SELECT * FROM journey_access_log WHERE action = 'invite_accepted' ORDER BY timestamp DESC LIMIT 1;
   ```
7. **Expected**: Log entry created for acceptance
8. Login as User G and view journey
9. Query database:
   ```sql
   SELECT * FROM journey_access_log WHERE action = 'view' ORDER BY timestamp DESC LIMIT 1;
   ```
10. **Expected**: Log entry created for view
11. Login as User A and revoke User G's access
12. Query database:
    ```sql
    SELECT * FROM journey_access_log WHERE action = 'access_revoked' ORDER BY timestamp DESC LIMIT 1;
    ```
13. **Expected**: Log entry created for revocation
14. **Expected**: All log entries include timestamps
15. **Expected**: ip_address and user_agent fields populated (if available)

**Result**: ✅ Pass / ❌ Fail

**Notes**: _____________________

---

### Scenario 10: Multiple Journeys

**Prerequisites**:
- User A has 2 active journeys
- User B is invited to both

**Steps**:
1. Login as User A
2. Navigate to Journey 1
3. Share with User B
4. Navigate to Journey 2
5. Share with User B
6. **Expected**: Two separate invitations sent
7. Login as User B
8. Check email
9. **Expected**: Two invitation emails received
10. Accept both invitations
11. **Expected**: Can access both journeys
12. Navigate to Journey 1 shared view
13. **Expected**: Shows Journey 1 data only
14. Navigate to Journey 2 shared view
15. **Expected**: Shows Journey 2 data only
16. **Expected**: No data mixing between journeys

**Result**: ✅ Pass / ❌ Fail

**Notes**: _____________________

---

## Performance Tests

### Test 1: Large Collaborator List
- Send 20 invitations to different users
- **Expected**: Modal loads quickly (<500ms)
- **Expected**: Scrolling is smooth
- **Expected**: All collaborators display correctly

### Test 2: Large Facility List (Viewer)
- Owner adds 50+ facilities to shortlist
- Viewer accesses shared journey
- **Expected**: Facilities load within 2 seconds
- **Expected**: Scrolling is smooth
- **Expected**: No layout shifts

### Test 3: Concurrent Access
- Owner and 3 viewers access same journey simultaneously
- Owner adds facility
- **Expected**: Viewers see update on refresh
- **Expected**: No database locking issues
- **Expected**: All users can view without errors

## Security Tests

### Test 1: SQL Injection
- Attempt to enter SQL in email field: `'; DROP TABLE journey_collaborators; --`
- **Expected**: Treated as regular email, validation fails
- **Expected**: No database changes

### Test 2: XSS Injection
- Attempt to enter script in email: `<script>alert('xss')</script>`
- **Expected**: Properly escaped in UI
- **Expected**: No script execution

### Test 3: Token Manipulation
- Copy valid invitation token
- Modify token slightly
- Attempt to access with modified token
- **Expected**: "Invitation not found" error
- **Expected**: No access granted

### Test 4: Direct Database Access
- Viewer attempts to update journey via Supabase client:
  ```javascript
  supabase.from('patient_journeys').update({ budget_max: 1000000 }).eq('id', journey_id)
  ```
- **Expected**: RLS policy blocks update
- **Expected**: Error returned, no data changed

## Edge Cases

### Edge Case 1: Invitation to Self
- Owner tries to invite their own email
- **Expected**: Either allowed (shows as owner in list) or blocked with message

### Edge Case 2: Special Characters in Procedure Name
- Journey has procedure: `Mom's "Special" Treatment & Care`
- Send invitation
- **Expected**: Email displays correctly
- **Expected**: Invitation page displays correctly
- **Expected**: No encoding issues

### Edge Case 3: Very Long Email
- Attempt to invite email with 254 characters (max valid length)
- **Expected**: Accepted if valid format
- **Expected**: Displays correctly in UI (truncated with ellipsis if needed)

### Edge Case 4: Rapid Accept/Decline
- Open invitation in two tabs
- Accept in tab 1
- Decline in tab 2
- **Expected**: First action wins
- **Expected**: Second action shows appropriate error

## Compliance Tests (HIPAA)

### Test 1: Audit Trail Completeness
- Perform 10 different actions (invite, accept, view, revoke, etc.)
- Query access log
- **Expected**: All 10 actions logged
- **Expected**: No missing timestamps
- **Expected**: All entries have journey_id and user_id

### Test 2: Data Retention
- Check if logs are kept indefinitely
- **Expected**: Logs not auto-deleted
- **Expected**: Full history available for compliance audits

### Test 3: PHI Protection
- Viewer accesses shared journey
- **Expected**: No access to owner's email/phone
- **Expected**: Only procedure, facilities, notes visible
- **Expected**: No personally identifiable information leaked

## Browser Compatibility

Test in:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

## Test Summary

| Scenario | Result | Notes | Tester | Date |
|----------|--------|-------|--------|------|
| 1. Basic Invitation Flow | ⬜ | | | |
| 2. Permission Verification | ⬜ | | | |
| 3. Revoke Access | ⬜ | | | |
| 4. Expired Invitation | ⬜ | | | |
| 5. Duplicate Invitation | ⬜ | | | |
| 6. Copy Invitation Link | ⬜ | | | |
| 7. Decline Invitation | ⬜ | | | |
| 8. Unauthenticated User | ⬜ | | | |
| 9. Activity Logging | ⬜ | | | |
| 10. Multiple Journeys | ⬜ | | | |

**Overall Status**: 🟡 Not Started / 🔵 In Progress / 🟢 All Pass / 🔴 Issues Found

## Known Issues

_Document any issues found during testing here_

1.

## Sign-Off

**QA Lead (Elena Riggs)**: ___________________________ Date: ___________

**CTO (Jone Ivey)**: ___________________________ Date: ___________

**Product Owner**: ___________________________ Date: ___________
