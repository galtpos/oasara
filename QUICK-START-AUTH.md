# Quick Start - User Authentication

## 3-Step Setup (15 minutes)

### Step 1: Configure Secrets (5 min)
```
https://supabase.com/dashboard/project/whklrclzrtijneqdjmiy/settings/functions
```

Add these 2 secrets:
- `RESEND_API_KEY` = `re_jYW8DLLv_HcVhcRvHcBmyZ9Z64NbJZtm3`
- `SUPABASE_SERVICE_ROLE_KEY` = [Get from Settings → API]

---

### Step 2: Run SQL (2 min)
```
https://supabase.com/dashboard/project/whklrclzrtijneqdjmiy/editor
```

1. Open SQL Editor
2. Copy entire `database/USER-AUTH-SCHEMA.sql`
3. Paste and Run
4. Expect: "Success. No rows returned"

---

### Step 3: Test Email (5 min)
```bash
curl -X POST \
  https://whklrclzrtijneqdjmiy.supabase.co/functions/v1/send-confirmation-email \
  -H "Content-Type: application/json" \
  -d '{"email": "YOUR_EMAIL@gmail.com", "name": "Test User"}'
```

Check inbox for OASARA email!

---

## What's Already Done ✅

- Database schema designed (6 tables)
- Edge functions deployed to Supabase
- Email integration configured (Resend)
- OASARA-branded email template
- All backend code complete

---

## What's Next ⏳

After setup, build these React components:
1. **SignUpForm** - Email/name input → Send confirmation
2. **ConfirmEmail** - Token validation → Create password
3. **LoginForm** - Email/password → Dashboard
4. **UserDashboard** - Saved facilities, inquiries, profile

Estimated time: 4-6 hours

---

## Files to Reference

- [SESSION-SUMMARY.md](SESSION-SUMMARY.md) - Full session overview
- [AUTH-IMPLEMENTATION-COMPLETE.md](AUTH-IMPLEMENTATION-COMPLETE.md) - Complete guide
- [USER-AUTH-DEPLOYMENT.md](USER-AUTH-DEPLOYMENT.md) - Detailed deployment steps
- [database/USER-AUTH-SCHEMA.sql](database/USER-AUTH-SCHEMA.sql) - SQL to run

---

## Edge Functions URLs

**Send Confirmation**:
```
https://whklrclzrtijneqdjmiy.supabase.co/functions/v1/send-confirmation-email
```

**Confirm Email**:
```
https://whklrclzrtijneqdjmiy.supabase.co/functions/v1/confirm-email
```

---

## Database Tables Created

- `user_profiles` - User info (name, type, preferences)
- `pending_email_confirmations` - Verification tokens
- `saved_facilities` - User favorites
- `user_inquiries` - Contact history
- `facility_claims` - Rep verification
- `user_notifications` - In-app alerts

---

Ready to launch user accounts! 🚀
