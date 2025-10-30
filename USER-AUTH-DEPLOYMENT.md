# User Authentication Deployment Guide

## Overview
This guide will help you deploy the complete user authentication system with email confirmation to your OASARA marketplace.

## What We Built

### 1. Database Schema
- **user_profiles** - Extended user information (name, user_type, preferences)
- **pending_email_confirmations** - Email verification tokens
- **saved_facilities** - User favorites/bookmarks
- **user_inquiries** - Contact history with facilities
- **facility_claims** - For facility representatives to claim their listings
- **user_notifications** - In-app notification system

### 2. Supabase Edge Functions
- **send-confirmation-email** - Sends branded OASARA confirmation emails via Resend
- **confirm-email** - Validates token and creates authenticated user

### 3. Email Integration
- Resend API for transactional emails
- OASARA-branded HTML email template
- 24-hour token expiration

---

## Deployment Steps

### Step 1: Deploy Database Schema (5 minutes)

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your OASARA project (whklrclzrtijneqdjmiy)
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy the entire contents of `database/USER-AUTH-SCHEMA.sql`
6. Paste into the SQL Editor
7. Click **Run** (or press Cmd/Ctrl + Enter)

**Expected Output**:
```
Success. No rows returned
```

This creates all 6 tables with Row Level Security policies.

---

### Step 2: Configure Resend API Key (2 minutes)

Your Resend API key needs to be added as an Edge Function secret:

1. In Supabase Dashboard, go to **Settings** → **Edge Functions**
2. Scroll to **Secrets**
3. Click **Add New Secret**
4. Name: `RESEND_API_KEY`
5. Value: `re_jYW8DLLv_HcVhcRvHcBmyZ9Z64NbJZtm3`
6. Click **Save**

---

### Step 3: Deploy Edge Functions (3 minutes)

Deploy the email functions to Supabase:

```bash
cd /Users/aaronday/Documents/medicaltourism/oasara-marketplace

# Deploy send-confirmation-email function
supabase functions deploy send-confirmation-email

# Deploy confirm-email function
supabase functions deploy confirm-email
```

**Expected Output**:
```
Deploying function send-confirmation-email...
Function deployed successfully!
Function URL: https://whklrclzrtijneqdjmiy.supabase.co/functions/v1/send-confirmation-email

Deploying function confirm-email...
Function deployed successfully!
Function URL: https://whklrclzrtijneqdjmiy.supabase.co/functions/v1/confirm-email
```

---

### Step 4: Update Supabase Service Role Key (1 minute)

The edge functions need the service role key to create users:

1. In Supabase Dashboard, go to **Settings** → **API**
2. Copy the **service_role** key (not the anon key!)
3. Go back to **Settings** → **Edge Functions** → **Secrets**
4. Add another secret:
   - Name: `SUPABASE_SERVICE_ROLE_KEY`
   - Value: [paste your service_role key]
   - Click **Save**

---

### Step 5: Test Email Confirmation Flow (5 minutes)

Test the system with a real email address:

```bash
# Test sending confirmation email
curl -X POST \
  https://whklrclzrtijneqdjmiy.supabase.co/functions/v1/send-confirmation-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-test-email@gmail.com",
    "name": "Test User"
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Confirmation email sent! Please check your inbox.",
  "email": "your-test-email@gmail.com"
}
```

**Check Your Email**:
1. Open your inbox
2. Look for email from "OASARA <noreply@oasara.com>"
3. Click the confirmation link
4. Should see: "Email confirmed successfully! You can now log in."

---

## Frontend Components (Next Step)

After deployment is complete, you'll need to build these React components:

### 1. SignUpForm.tsx
Location: `src/components/Auth/SignUpForm.tsx`

Calls: `POST /functions/v1/send-confirmation-email`

Features:
- Email and name input
- Password field (stored for later)
- "Check your email" success message
- Resend confirmation link

---

### 2. ConfirmEmail.tsx
Location: `src/pages/ConfirmEmail.tsx`

Calls: `POST /functions/v1/confirm-email`

Features:
- Reads `?token=` from URL
- Password input (required to create account)
- Calls confirm-email with token + password
- Redirects to login on success

---

### 3. LoginForm.tsx
Location: `src/components/Auth/LoginForm.tsx`

Uses: Supabase Auth `signInWithPassword()`

Features:
- Email and password input
- "Forgot password?" link
- Redirect to dashboard on success

---

### 4. UserDashboard.tsx
Location: `src/pages/UserDashboard.tsx`

Features:
- Saved facilities list
- Inquiry history
- Profile settings
- Notification center

---

## Verification Checklist

After deployment, verify these work:

- [ ] Database tables exist (check in Supabase Table Editor)
- [ ] RLS policies active (try querying tables - should require auth)
- [ ] Edge functions deployed (check Functions tab in Supabase)
- [ ] Resend API key configured (check Secrets in Edge Functions settings)
- [ ] Service role key configured
- [ ] Test email sent and received
- [ ] Confirmation link works
- [ ] User created in auth.users table
- [ ] User profile created in user_profiles table

---

## Troubleshooting

### Email not sending?
- Check Resend dashboard for delivery logs: https://resend.com/emails
- Verify RESEND_API_KEY is correct in Edge Function secrets
- Check edge function logs in Supabase dashboard

### Confirmation link not working?
- Check token hasn't expired (24 hours)
- Verify SUPABASE_SERVICE_ROLE_KEY is set correctly
- Check edge function logs for errors

### User not created?
- Check edge function logs for auth errors
- Verify service role key has admin permissions
- Ensure email isn't already registered

### RLS blocking queries?
- Make sure you're using the service role key in edge functions
- Verify RLS policies match your use case
- Check Supabase logs for policy violations

---

## Cost Estimate

**Resend (Email)**:
- Free tier: 100 emails/day
- 3,000 emails/month
- $0 for MVP

**Supabase**:
- Free tier: 50,000 monthly active users
- 500MB database
- $0 for MVP

**Total MVP Cost**: $0/month

When you scale past free tiers:
- Resend Pro: $20/mo (50,000 emails)
- Supabase Pro: $25/mo (100,000 MAU)

---

## Next Steps After Deployment

1. **Build React Auth Components** (4-6 hours)
   - SignUpForm, LoginForm, ConfirmEmail pages
   - Protected route wrapper
   - User context provider

2. **Test User Flows** (1 hour)
   - Sign up → Confirm → Login → Dashboard
   - Save facility → View saved list
   - Send inquiry → View history

3. **Add Facility Rep Features** (2-3 hours)
   - Claim facility form
   - Respond to inquiries
   - Update facility info

4. **Deploy to Production** (1 hour)
   - Push to GitHub
   - Deploy to Netlify
   - Test live email flow

---

## Support

If you encounter issues during deployment:

1. **Check Supabase Logs**: Dashboard → Logs → Filter by function name
2. **Check Resend Logs**: https://resend.com/emails
3. **Test Edge Functions**: Use the Test tab in Supabase Functions
4. **Database Issues**: Use SQL Editor to query tables directly

---

## Files Reference

- `database/USER-AUTH-SCHEMA.sql` - Database schema to run
- `supabase/functions/send-confirmation-email/index.ts` - Email sender
- `supabase/functions/confirm-email/index.ts` - Token validator
- `.env.local` - Contains API keys (NEVER commit to git!)

---

## Security Notes

- Never expose service_role key in frontend code
- All user data protected by Row Level Security
- Email tokens expire after 24 hours
- Passwords hashed by Supabase Auth
- CORS configured for your domain only

---

Ready to deploy! Start with Step 1 and work through each section. The entire deployment should take about 15 minutes.
