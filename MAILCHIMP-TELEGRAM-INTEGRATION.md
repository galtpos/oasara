# OASARA - Mailchimp & Telegram Integration

## Overview
OASARA will use the **same Mailchimp audience** as DaylightFreedom.org but with **"OASARA" tags** to differentiate subscribers. Telegram notifications will go to the same chat.

## Configuration Summary

### Mailchimp Setup
- **Primary Audience**: Shared with DaylightFreedom (same LIST_ID)
- **API Key**: Stored in Supabase secrets as `MAILCHIMP_API_KEY`
- **List ID**: Stored in Supabase secrets as `MAILCHIMP_LIST_ID`
- **Server Prefix**: Stored in Supabase secrets as `MAILCHIMP_SERVER_PREFIX`
- **OASARA Tags**: `['OASARA', 'EarlyAccess', 'Website']`

### Telegram Setup
- **Bot Token**: `8284223307:AAGVX2umU5nmDZSchxqwZmL9xmTMKZjwPLg`
- **Chat ID**: `1537771744` (same as DaylightFreedom)
- **Notification Type**: `email_signup`
- **Message Format**: "New OASARA Early Access Signup!"

## Implementation Plan

### 1. Supabase Edge Function - mailchimp-subscribe-oasara
Create `/supabase/functions/mailchimp-subscribe-oasara/index.ts`:
- Identical to DaylightFreedom's function
- Changed tags from `['DaylightFreedom', 'Website', 'EmailConfirmed']`
- To: `['OASARA', 'EarlyAccess', 'Website']`

### 2. Telegram Service - telegramService.ts
Create `/src/lib/telegramService.ts`:
- Copy from DaylightFreedom
- Update `notifyEmailSignup()` message: "New OASARA Early Access Signup!"
- Update site reference: "OASARA.com"

### 3. Early Access Landing Page
Create `/src/pages/EarlyAccess.tsx`:
- Hero section: "Join the OASARA Revolution"
- Email capture form
- Benefits/features of early access
- OASARA branding (champagne gold, dark theme)
- Call Supabase Edge Function on submit
- Trigger Telegram notification on success

## Environment Variables

### OASARA .env.local
```env
# Telegram Configuration
REACT_APP_TELEGRAM_BOT_TOKEN=8284223307:AAGVX2umU5nmDZSchxqwZmL9xmTMKZjwPLg
REACT_APP_TELEGRAM_CHAT_ID=1537771744

# Supabase (already configured)
REACT_APP_SUPABASE_URL=https://whklrclzrtijneqdjmiy.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indoa2xyY2x6cnRpam5lcWRqbWl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQzNzEzNTUsImV4cCI6MjA0OTk0NzM1NX0.eTxZqQdOjEw-MmhCK0uNxF8o6TcPqbv3tG1T0qGm_dg
```

### Supabase Secrets (to be set via CLI)
```bash
# Use same values as DaylightFreedom (already set)
supabase secrets list
# MAILCHIMP_API_KEY, MAILCHIMP_LIST_ID, MAILCHIMP_SERVER_PREFIX already exist
```

## Deployment Steps

### 1. Deploy Edge Function
```bash
cd /Users/aaronday/Documents/medicaltourism/oasara-marketplace
supabase functions deploy mailchimp-subscribe-oasara --no-verify-jwt
```

### 2. Test Integration
```bash
curl -X POST https://whklrclzrtijneqdjmiy.supabase.co/functions/v1/mailchimp-subscribe-oasara \
  -H "Content-Type: application/json" \
  -d '{"email":"test@oasara.com","name":"Test User"}'
```

### 3. Verify
- Check Mailchimp audience for new subscriber with OASARA tags
- Check Telegram chat (1537771744) for notification
- Verify tags are correct: OASARA, EarlyAccess, Website

## User Flow

1. **User visits**: oasara.com/early-access (or demo page)
2. **User submits email**: Clicks "Get Early Access"
3. **Edge Function called**: mailchimp-subscribe-oasara
4. **Mailchimp subscribes**: User added to primary audience with OASARA tags
5. **Telegram notifies**: Bot sends message to chat 1537771744
6. **User sees**: "Success! You're on the list for early access."

## Tags Strategy

### DaylightFreedom Tags
- `DaylightFreedom`
- `Website`
- `EmailConfirmed`

### OASARA Tags
- `OASARA`
- `EarlyAccess`
- `Website`

Both will exist in the **same Mailchimp audience**, allowing you to:
- Send OASARA-specific campaigns to subscribers with `OASARA` tag
- Send DaylightFreedom campaigns to subscribers with `DaylightFreedom` tag
- Send universal updates to all subscribers

## Benefits of Shared Audience

1. **Single source of truth** - One subscriber list to manage
2. **No duplicate emails** - If someone signs up for both, they get both tags
3. **Unified communications** - Can send cross-promotional emails
4. **Cost efficient** - One Mailchimp plan for both projects
5. **Easy segmentation** - Filter by tags for targeted campaigns

## Next Steps

- [x] Document integration strategy
- [ ] Create mailchimp-subscribe-oasara Edge Function
- [ ] Create telegramService.ts for OASARA
- [ ] Build Early Access landing page
- [ ] Deploy and test complete flow
- [ ] Update CLAUDE.md with deployment instructions
