# Journey Sharing System - Architecture & Data Flow

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────┐     ┌─────────────────┐                   │
│  │ JourneyDashboard│────▶│ShareJourneyModal│                   │
│  │   (Owner View)  │     │  - Invite Form  │                   │
│  └─────────────────┘     │  - Collab List  │                   │
│                           │  - Copy Link    │                   │
│                           └────────┬────────┘                   │
│                                    │                             │
│                                    │ POST /send-journey-invite   │
│                                    ▼                             │
│                           ┌─────────────────┐                   │
│                           │  Netlify Func   │                   │
│                           │  (Email Send)   │                   │
│                           └────────┬────────┘                   │
│                                    │                             │
│                                    │ EmailJS API                 │
│                                    ▼                             │
│  ┌─────────────────┐     ┌─────────────────┐                   │
│  │  AcceptInvite   │◀────│  Email Client   │                   │
│  │   (Token Page)  │     │  (User Inbox)   │                   │
│  └────────┬────────┘     └─────────────────┘                   │
│           │                                                      │
│           │ Accept/Decline                                      │
│           ▼                                                      │
│  ┌─────────────────┐                                            │
│  │SharedJourneyView│                                            │
│  │  (Viewer View)  │                                            │
│  └─────────────────┘                                            │
│                                                                   │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ Supabase Client
                            │ (RLS Enforced)
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Supabase (PostgreSQL)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   patient_journeys                       │   │
│  │  - id, user_id, procedure_type, budget, timeline, etc.  │   │
│  └────────────────────────┬────────────────────────────────┘   │
│                            │                                     │
│                            │ FK: journey_id                      │
│                            ▼                                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              journey_collaborators (RLS)                 │   │
│  │  - id, journey_id, user_id, email, role                 │   │
│  │  - invitation_token, status, invited_by                 │   │
│  │  - invited_at, accepted_at, token_expires_at            │   │
│  └────────────────────────┬────────────────────────────────┘   │
│                            │                                     │
│                            │ Audit Logging                       │
│                            ▼                                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │            journey_access_log (Append-Only)              │   │
│  │  - id, journey_id, user_id, action, timestamp           │   │
│  │  - details (JSONB), ip_address, user_agent              │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                 Helper Functions (RLS)                   │   │
│  │  - has_journey_access(journey_id, user_id)              │   │
│  │  - is_journey_owner(journey_id, user_id)                │   │
│  │  - get_journey_role(journey_id, user_id)                │   │
│  │  - log_journey_access(...) [SECURITY DEFINER]           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagrams

### Flow 1: Send Invitation

```
Owner                  Frontend              Netlify Function       EmailJS            Database
  │                       │                        │                   │                  │
  │ 1. Click Share        │                        │                   │                  │
  ├──────────────────────▶│                        │                   │                  │
  │                       │                        │                   │                  │
  │ 2. Enter email        │                        │                   │                  │
  │    Select role        │                        │                   │                  │
  ├──────────────────────▶│                        │                   │                  │
  │                       │                        │                   │                  │
  │                       │ 3. INSERT collaborator │                   │                  │
  │                       ├──────────────────────────────────────────────────────────────▶│
  │                       │                        │                   │   (with token)   │
  │                       │◀──────────────────────────────────────────────────────────────┤
  │                       │                        │                   │   token: abc123  │
  │                       │                        │                   │                  │
  │                       │ 4. POST /send-invite   │                   │                  │
  │                       ├───────────────────────▶│                   │                  │
  │                       │   {email, token, ...}  │                   │                  │
  │                       │                        │                   │                  │
  │                       │                        │ 5. Send email     │                  │
  │                       │                        ├──────────────────▶│                  │
  │                       │                        │   with invite link│                  │
  │                       │                        │                   │                  │
  │                       │                        │◀──────────────────┤                  │
  │                       │                        │   200 OK          │                  │
  │                       │                        │                   │                  │
  │                       │ 6. Log action          │                   │                  │
  │                       ├──────────────────────────────────────────────────────────────▶│
  │                       │   log_journey_access() │                   │  action: invite  │
  │                       │                        │                   │                  │
  │ 7. Success message    │                        │                   │                  │
  │◀──────────────────────┤                        │                   │                  │
  │ "Invitation sent!"    │                        │                   │                  │
```

### Flow 2: Accept Invitation

```
Viewer              Email           AcceptInvite Page       Database           SharedJourneyView
  │                   │                     │                  │                      │
  │ 1. Click link     │                     │                  │                      │
  ├──────────────────▶│                     │                  │                      │
  │  /accept-invite/  │                     │                  │                      │
  │  abc123           │                     │                  │                      │
  │                   │                     │                  │                      │
  │                   │ 2. GET token=abc123 │                  │                      │
  │                   ├────────────────────▶│                  │                      │
  │                   │                     │                  │                      │
  │                   │                     │ 3. SELECT collab │                      │
  │                   │                     ├─────────────────▶│                      │
  │                   │                     │   WHERE token=   │                      │
  │                   │                     │                  │                      │
  │                   │                     │◀─────────────────┤                      │
  │                   │                     │  {status:pending}│                      │
  │                   │                     │                  │                      │
  │                   │ 4. Show preview     │                  │                      │
  │                   │◀────────────────────┤                  │                      │
  │                   │  Journey: Hip Repl. │                  │                      │
  │                   │  Budget: $10-15k    │                  │                      │
  │                   │                     │                  │                      │
  │ 5. Click Accept   │                     │                  │                      │
  ├─────────────────────────────────────────▶│                  │                      │
  │                   │                     │                  │                      │
  │                   │                     │ 6. UPDATE status │                      │
  │                   │                     ├─────────────────▶│                      │
  │                   │                     │   SET accepted   │                      │
  │                   │                     │                  │                      │
  │                   │                     │ 7. Log action    │                      │
  │                   │                     ├─────────────────▶│                      │
  │                   │                     │   action:accept  │                      │
  │                   │                     │                  │                      │
  │                   │ 8. Redirect         │                  │                      │
  │                   │◀────────────────────┤                  │                      │
  │                   │  /journey/shared/   │                  │                      │
  │                   │  journey-id         │                  │                      │
  │                   │                     │                  │                      │
  │                   │                     │                  │ 9. GET journey      │
  │                   ├──────────────────────────────────────────────────────────────▶│
  │                   │                     │                  │   (RLS checks)      │
  │                   │                     │                  │                      │
  │ 10. View journey  │                     │                  │                      │
  │◀───────────────────────────────────────────────────────────────────────────────────┤
  │  [Read-Only UI]   │                     │                  │                      │
```

### Flow 3: Revoke Access

```
Owner              JourneyDashboard         Database          Viewer
  │                       │                    │                │
  │ 1. Click Share        │                    │                │
  ├──────────────────────▶│                    │                │
  │                       │                    │                │
  │                       │ 2. SELECT collabs  │                │
  │                       ├───────────────────▶│                │
  │                       │                    │                │
  │                       │◀───────────────────┤                │
  │                       │ [{email, status}]  │                │
  │                       │                    │                │
  │ 3. Click Revoke       │                    │                │
  │    next to viewer     │                    │                │
  ├──────────────────────▶│                    │                │
  │                       │                    │                │
  │ 4. Confirm            │                    │                │
  ├──────────────────────▶│                    │                │
  │                       │                    │                │
  │                       │ 5. UPDATE status   │                │
  │                       ├───────────────────▶│                │
  │                       │   SET revoked      │                │
  │                       │                    │                │
  │                       │ 6. Log action      │                │
  │                       ├───────────────────▶│                │
  │                       │   action:revoked   │                │
  │                       │                    │                │
  │ 7. UI updates         │                    │                │
  │◀──────────────────────┤                    │                │
  │ "Access revoked"      │                    │                │
  │                       │                    │                │
  │                       │                    │                │
  │                       │                    │ 8. Next access │
  │                       │                    │    attempt     │
  │                       │                    │◀───────────────┤
  │                       │                    │                │
  │                       │                    │ 9. RLS blocks  │
  │                       │                    ├───────────────▶│
  │                       │                    │  "Access denied"
```

## Security Model

### Row Level Security (RLS) Policies

```
┌─────────────────────────────────────────────────────────────────┐
│                    patient_journeys Table                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  SELECT:  ✓ Owner (user_id = auth.uid())                        │
│           ✓ Accepted Collaborator (via has_journey_access())    │
│           ✓ Admin                                                │
│                                                                   │
│  INSERT:  ✓ Owner only (user_id = auth.uid())                   │
│                                                                   │
│  UPDATE:  ✓ Owner only (user_id = auth.uid())                   │
│                                                                   │
│  DELETE:  ✓ Owner only (user_id = auth.uid())                   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                 journey_collaborators Table                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  SELECT:  ✓ Journey Owner                                        │
│           ✓ Invited User (email matches OR user_id matches)     │
│                                                                   │
│  INSERT:  ✓ Journey Owner only                                   │
│                                                                   │
│  UPDATE:  ✓ Journey Owner (all fields)                           │
│           ✓ Invited User (status field only, to accept/decline) │
│                                                                   │
│  DELETE:  ✓ Journey Owner only                                   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                  journey_facilities Table                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  SELECT:  ✓ Owner + All Accepted Collaborators                  │
│                                                                   │
│  INSERT:  ✓ Owner only                                           │
│                                                                   │
│  UPDATE:  ✓ Owner only                                           │
│                                                                   │
│  DELETE:  ✓ Owner only                                           │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    journey_notes Table                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  SELECT:  ✓ Owner + All Accepted Collaborators                  │
│                                                                   │
│  INSERT:  ✓ Owner only                                           │
│                                                                   │
│  UPDATE:  ✓ Owner only                                           │
│                                                                   │
│  DELETE:  ✓ Owner only                                           │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                  journey_access_log Table                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  SELECT:  ✓ Journey Owner only                                   │
│                                                                   │
│  INSERT:  ✓ System only (via SECURITY DEFINER function)         │
│                                                                   │
│  UPDATE:  ✗ None (append-only for compliance)                   │
│                                                                   │
│  DELETE:  ✗ None (permanent for compliance)                     │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## State Machine: Invitation Status

```
           ┌─────────┐
           │ PENDING │  ← Initial state when invitation created
           └────┬────┘
                │
        ┌───────┼───────┐
        │       │       │
        ▼       ▼       ▼
  ┌─────────┐ ┌────────┐ ┌─────────┐
  │ACCEPTED │ │DECLINED│ │ REVOKED │
  └────┬────┘ └───┬────┘ └────┬────┘
       │          │           │
       │          │           │
       └──────────┴───────────┘
              (Terminal states - no further transitions)

PENDING → ACCEPTED:  User clicks "Accept" on invitation
PENDING → DECLINED:  User clicks "Decline" on invitation
PENDING → REVOKED:   Owner clicks "Revoke" before acceptance
ACCEPTED → REVOKED:  Owner clicks "Revoke" after acceptance

TERMINAL STATES (No escape):
- ACCEPTED: Cannot be changed back to PENDING
- DECLINED: Cannot be re-accepted (must send new invitation)
- REVOKED: Cannot be un-revoked (must send new invitation)
```

## Database Schema (ERD)

```
┌───────────────────────┐
│    auth.users         │
│  (Supabase Auth)      │
├───────────────────────┤
│ id (PK)               │
│ email                 │
│ ...                   │
└───────┬───────────────┘
        │
        │ 1:N (owns journeys)
        ▼
┌───────────────────────┐
│  patient_journeys     │
├───────────────────────┤
│ id (PK)               │
│ user_id (FK) ─────────┘
│ procedure_type        │
│ budget_min            │
│ budget_max            │
│ timeline              │
│ status                │
│ created_at            │
│ updated_at            │
└───────┬───────────────┘
        │
        ├──────────────────────────────────┐
        │ 1:N                              │ 1:N
        ▼                                  ▼
┌───────────────────────┐      ┌──────────────────────┐
│journey_collaborators  │      │ journey_facilities   │
├───────────────────────┤      ├──────────────────────┤
│ id (PK)               │      │ id (PK)              │
│ journey_id (FK)       │      │ journey_id (FK)      │
│ user_id (FK)          │      │ facility_id (FK)     │
│ email                 │      │ notes                │
│ role                  │      │ rating               │
│ invited_by (FK) ──────┼──┐   │ added_at             │
│ invited_at            │  │   └──────────────────────┘
│ accepted_at           │  │
│ invitation_token (UQ) │  │
│ token_expires_at      │  │
│ status                │  │
└───────┬───────────────┘  │
        │                  │
        │ 1:N              │ points to
        ▼                  │ auth.users
┌───────────────────────┐  │
│ journey_access_log    │  │
├───────────────────────┤  │
│ id (PK)               │  │
│ journey_id (FK) ──────┼──┘
│ user_id (FK)          │
│ action                │
│ details (JSONB)       │
│ timestamp             │
│ ip_address            │
│ user_agent            │
└───────────────────────┘

        │ 1:N
        ▼
┌───────────────────────┐
│    journey_notes      │
├───────────────────────┤
│ id (PK)               │
│ journey_id (FK)       │
│ note_type             │
│ content               │
│ related_facility_id   │
│ completed             │
│ created_at            │
│ updated_at            │
└───────────────────────┘
```

## Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React 19 | UI components |
| | TypeScript | Type safety |
| | TailwindCSS | Styling |
| | Framer Motion | Animations |
| | React Query | Data fetching & caching |
| | React Router | Client-side routing |
| **Backend** | Supabase (PostgreSQL) | Database & Auth |
| | Row Level Security | Access control |
| | Netlify Functions | Serverless email sending |
| | EmailJS | Email delivery service |
| **Security** | JWT Tokens | Authentication |
| | UUID Tokens | Invitation links |
| | RLS Policies | Database-level authorization |
| | HTTPS | Transport encryption |
| **Compliance** | Audit Logging | HIPAA activity tracking |
| | Append-Only Logs | Tamper-proof history |

## Performance Characteristics

| Operation | Expected Time | Notes |
|-----------|--------------|-------|
| Send Invitation | < 2 seconds | Includes email send via EmailJS |
| Accept Invitation | < 1 second | Database update only |
| Load Shared Journey | < 1.5 seconds | With 50 facilities |
| Revoke Access | < 500ms | Database update + UI refresh |
| Query Access Log | < 200ms | Indexed by journey_id |

## Scalability

- **Collaborators per Journey**: No hard limit, UI tested up to 100
- **Journeys per User**: Unlimited
- **Concurrent Viewers**: Limited by Supabase plan (typically 500+ concurrent)
- **Access Log Growth**: ~10KB per 1000 actions, archived quarterly if needed
- **Invitation Expiry**: Auto-cleanup of expired tokens via cron job (future)

## Failure Modes & Recovery

| Failure | Detection | Recovery | Impact |
|---------|-----------|----------|--------|
| Email send fails | Netlify function error | Manual resend via "Copy Link" | User doesn't receive email |
| Token expired | Page load validation | Request new invitation | Cannot accept invitation |
| Database unavailable | Supabase connection error | Retry with exponential backoff | Temporary access denied |
| RLS policy bug | Access denied error | Fix policy, redeploy | Legitimate users blocked |
| Invitation token collision | UUID uniqueness constraint | Regenerate token | Invite fails, retry succeeds |

## Monitoring & Observability

Recommended metrics to track:
- Invitations sent per day
- Invitation acceptance rate
- Average time to acceptance
- Revocation rate
- Failed email sends
- RLS policy denials
- Access log growth rate
- Viewer session duration
- Concurrent viewers per journey

## Future Architecture Enhancements

1. **Real-time Updates** (Supabase Realtime)
   - Viewers see changes immediately
   - "Mom just added a note" notifications

2. **Webhook Integration**
   - Notify external systems on invite/accept
   - Integration with CRM/EHR systems

3. **Advanced Roles** (Collaborator, Coordinator)
   - Hierarchical permissions
   - Delegation of invitations

4. **Offline Support** (Service Workers)
   - View journey when offline
   - Sync changes when reconnected

5. **Analytics Dashboard** (Owner View)
   - Who viewed what and when
   - Engagement metrics per collaborator

## Security Hardening Checklist

- [x] RLS enabled on all tables
- [x] Helper functions use SECURITY DEFINER
- [x] Invitation tokens are UUIDs (unguessable)
- [x] Tokens expire after 7 days
- [x] Email validation on input
- [x] XSS protection via React (auto-escaping)
- [x] SQL injection protection via Supabase client
- [x] CORS configured for Netlify functions
- [x] HTTPS enforced (Netlify + Supabase)
- [x] Audit logging for all sensitive actions
- [ ] Rate limiting on invitation sends (future)
- [ ] CAPTCHA on public invite pages (future)
- [ ] 2FA for journey owners (future)
