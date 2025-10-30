# User Accounts Implementation Plan for OASARA

## Overview

Implementing user authentication and email confirmation for OASARA marketplace using Supabase Auth + Resend email service (following DaylightFreedom pattern).

## Current Scraper Status Update

**Automated Data Collection Running** (300/494 facilities processed - 60% complete):
- ✅ **33 successful** facilities (11%) with 10+ items
- ⚠️ **65 partial** facilities (21%) with 1-9 items
- ❌ 201 failed facilities
- **Total: 98 facilities with data (32% success rate)**
- **Projected final: ~55 fully successful, ~110 partial = 165 total facilities with data**

This is exceeding expectations! The fetch scraper is working well on older HTML-based medical facility websites.

---

## User Account Requirements for OASARA

### User Types
1. **Patients/Seekers** - Browse facilities, save favorites, contact providers
2. **Facility Representatives** - Claim/manage facility profiles, update pricing
3. **Admins** - Platform management, verify facilities, moderate content

### Core Features Needed
- Email/password authentication
- Email confirmation (anti-spam)
- Password reset
- Profile management
- Saved facilities (favorites)
- Inquiry history
- Role-based access

## Implementation Based on DaylightFreedom Pattern

### What DaylightFreedom Uses

**Email Service**: Resend (https://resend.com)
- **Cost**: Free tier (100 emails/day, 3,000/month)
- **API**: Simple REST API
- **Features**: HTML emails, tracking, templates

**Auth Flow**:
1. User enters email + password
2. Supabase edge function generates confirmation token
3. Resend sends confirmation email
4. User clicks link → email confirmed
5. User can now log in

**Key Files from DaylightFreedom**:
- `/supabase/functions/send-confirmation-email/index.ts` - Sends email via Resend
- `/supabase/functions/confirm-email/index.ts` - Validates token
- `/supabase/migrations/...add_email_confirmation_system.sql` - Database schema

### Resend API Key Needed

**When you're ready to implement**, you'll need a Resend API key:
1. Sign up at https://resend.com (free)
2. Get API key from dashboard
3. Add to Supabase secrets:
   - Key name: `RESEND_API_KEY`
   - Value: `re_...` (your key)

I'll let you know when we need it - probably in the next phase after scraper completes.

## OASARA-Specific Implementation

### Database Schema

```sql
-- User profiles (extends Supabase auth.users)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  user_type TEXT CHECK (user_type IN ('patient', 'facility_rep', 'admin')),
  facility_id UUID REFERENCES facilities(id), -- For facility reps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Saved facilities (favorites)
CREATE TABLE saved_facilities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, facility_id)
);

-- User inquiries (contact history)
CREATE TABLE user_inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
  procedure_interest TEXT,
  message TEXT,
  status TEXT DEFAULT 'sent',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Pending email confirmations (copied from DaylightFreedom)
CREATE TABLE pending_email_confirmations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  name TEXT,
  confirmation_token TEXT UNIQUE NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  confirmed BOOLEAN DEFAULT false,
  confirmed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP + INTERVAL '24 hours')
);
```

### Supabase Edge Functions Needed

**1. `/supabase/functions/send-confirmation-email/index.ts`**
```typescript
// Send confirmation email via Resend
// - Generate token
// - Store in pending_email_confirmations
// - Send email with confirmation link
// - Return success/error
```

**2. `/supabase/functions/confirm-email/index.ts`**
```typescript
// Validate confirmation token
// - Check token exists and not expired
// - Create Supabase auth user
// - Mark email as confirmed
// - Return success/error
```

**3. `/supabase/functions/reset-password/index.ts`**
```typescript
// Send password reset email
// - Generate reset token
// - Send email via Resend
// - Handle password update
```

### Frontend Components Needed

**Auth Components**:
- `components/Auth/SignUpForm.tsx` - Email + password signup
- `components/Auth/LoginForm.tsx` - Email + password login
- `components/Auth/ConfirmEmail.tsx` - Email confirmation page
- `components/Auth/ResetPassword.tsx` - Password reset flow
- `components/Auth/UserProfile.tsx` - Edit profile

**User Dashboard**:
- `components/User/Dashboard.tsx` - User overview
- `components/User/SavedFacilities.tsx` - Favorites list
- `components/User/InquiryHistory.tsx` - Past contacts
- `components/User/Settings.tsx` - Account settings

## Email Templates for OASARA

### Welcome/Confirmation Email

**From**: OASARA <noreply@oasara.com>
**Subject**: Confirm Your Email - Join OASARA

**Template** (HTML):
```html
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; background-color: #0A0A0A; color: #FFF8F0;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <h1 style="color: #D97925;">OASARA</h1>
    <p style="color: #D4AF37; font-size: 1.2rem;">Your Oasis for Medical Sovereignty</p>

    <div style="background: #1a1a1a; border-radius: 12px; padding: 30px; margin: 20px 0;">
      <h2 style="color: #D97925;">Confirm Your Email Address</h2>

      <p>Hi {{name}},</p>

      <p>Welcome to OASARA! You're one step away from accessing our curated network of 518+ JCI-accredited facilities worldwide.</p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="{{confirmationUrl}}"
           style="display: inline-block; background: linear-gradient(135deg, #D97925, #D4AF37);
                  color: white; text-decoration: none; padding: 15px 40px;
                  border-radius: 12px; font-weight: bold;">
          Confirm My Email
        </a>
      </div>

      <p style="font-size: 0.9rem; color: #E5D4B8;">
        Once confirmed, you'll be able to:
      </p>
      <ul style="color: #E5D4B8;">
        <li>Save favorite facilities</li>
        <li>Contact providers directly</li>
        <li>Track your medical tourism journey</li>
        <li>Access verified pricing and doctor profiles</li>
      </ul>
    </div>

    <p style="text-align: center; color: #888; font-size: 0.8rem;">
      This link expires in 24 hours. <br>
      © 2025 OASARA - Medical Sovereignty Platform
    </p>
  </div>
</body>
</html>
```

### Password Reset Email

**Subject**: Reset Your OASARA Password

**Template**: Similar branded design with reset link

### Facility Contact Confirmation

**Subject**: Your Inquiry to {{facilityName}} - OASARA

**Template**: Confirms inquiry sent, provides copy of message

## Implementation Timeline

### Phase 1: Database Setup (Week 1)
- ✅ Create user-related tables in Supabase
- ✅ Set up Row Level Security policies
- ✅ Test auth flow locally

### Phase 2: Resend Integration (Week 2)
**You'll need Resend API key here**
- Set up Resend account (free tier)
- Create email templates
- Deploy Supabase edge functions
- Test email sending

### Phase 3: Frontend Components (Week 2-3)
- Build signup/login forms
- Email confirmation page
- User dashboard
- Profile management

### Phase 4: User Features (Week 3-4)
- Save facilities
- Contact tracking
- User preferences
- Notification settings

## Next Steps

### 1. Wait for Scraper to Complete (~1 hour remaining)

Current status: 300/494 (60% complete)

The scraper will automatically:
- Extract all available data from compatible facilities
- Save to enrichment tables (if created)
- Print final summary with statistics

### 2. Create User Database Tables

Run these migrations in Supabase SQL Editor:
```sql
-- (See Database Schema section above)
```

### 3. Set Up Resend Account

When ready to implement email:
1. Go to https://resend.com
2. Sign up (free tier: 100 emails/day)
3. Get API key
4. **Let me know when you have the key** and I'll configure it

### 4. Deploy Auth System

I can help build:
- Supabase edge functions (copy from DaylightFreedom pattern)
- React auth components
- Email templates branded for OASARA
- User dashboard

## Cost Estimate

**Email Service (Resend)**:
- Free tier: 100 emails/day (3,000/month)
- For MVP: $0/month
- Scale: $20/month for 10,000 emails

**Supabase Auth**:
- Included in free tier (50,000 monthly active users)
- No additional cost for MVP

**Total**: $0/month for MVP launch

## Questions to Answer

1. **What user types do we need first?**
   - Just patients? Or also facility reps?
   - Admin access?

2. **Required vs. optional signup?**
   - Browse without account?
   - Require account for contact?

3. **Social auth?**
   - Email/password only?
   - Or add Google/Apple sign-in?

4. **Email verification?**
   - Strict (can't use site until confirmed)?
   - Or lenient (can browse, confirm later)?

## Ready When You Are!

The scraper is running and making great progress. Once it completes:

1. Review extracted data
2. Set up user auth tables
3. **Get Resend API key** (when ready)
4. I'll implement the auth system

Let me know when you want to move forward with user accounts!

