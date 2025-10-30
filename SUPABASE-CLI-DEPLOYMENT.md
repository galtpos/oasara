# Supabase CLI Deployment Guide

## Complete Guide for Deploying User Authentication via CLI

This document shows how to deploy the OASARA user authentication system entirely through the Supabase CLI.

---

## Prerequisites

- Supabase CLI installed: `brew install supabase/tap/supabase`
- Supabase project created
- Project ref ID: `whklrclzrtijneqdjmiy`

---

## Step 1: Link Your Local Project to Supabase

```bash
cd /path/to/oasara-marketplace

# Link to your Supabase project
supabase link --project-ref whklrclzrtijneqdjmiy
```

**Expected Output**: `Finished supabase link.`

---

## Step 2: Configure Edge Function Secrets

### List Current Secrets
```bash
supabase secrets list
```

### Set RESEND_API_KEY
```bash
supabase secrets set RESEND_API_KEY=re_jYW8DLLv_HcVhcRvHcBmyZ9Z64NbJZtm3
```

### Verify Secrets
```bash
supabase secrets list
```

**Expected Output**:
```
NAME                      | DIGEST
--------------------------|------------------------------------------------------------------
RESEND_API_KEY            | 726a3aad828393c50d48eccf90d284057e2cb3edaf471b20d28a0b5a4137bf0c
SUPABASE_ANON_KEY         | ...
SUPABASE_SERVICE_ROLE_KEY | ...
SUPABASE_URL              | ...
```

---

## Step 3: Deploy Database Schema

### Create Migration Directory
```bash
mkdir -p supabase/migrations
```

### Copy Schema to Migration File
```bash
cp database/USER-AUTH-SCHEMA.sql supabase/migrations/$(date +%Y%m%d%H%M%S)_user_auth_schema.sql
```

### Push Migration to Remote Database
```bash
supabase db push
```

When prompted "Do you want to push these migrations to the remote database?", type `Y` and press Enter.

**Expected Output**:
```
Applying migration 20251030000909_user_auth_schema.sql...
NOTICE: trigger "..." does not exist, skipping
[Success - no errors]
```

### Auto-confirm (Optional)
```bash
echo "Y" | supabase db push
```

---

## Step 4: Deploy Edge Functions

### Deploy send-confirmation-email
```bash
supabase functions deploy send-confirmation-email --no-verify-jwt
```

### Deploy confirm-email
```bash
supabase functions deploy confirm-email --no-verify-jwt
```

**Expected Output**:
```
Deployed Functions on project whklrclzrtijneqdjmiy: send-confirmation-email
Function URL: https://whklrclzrtijneqdjmiy.supabase.co/functions/v1/send-confirmation-email
```

### Deploy Both at Once
```bash
supabase functions deploy send-confirmation-email --no-verify-jwt && \
supabase functions deploy confirm-email --no-verify-jwt
```

---

## Step 5: Test Edge Functions

### Test Send Confirmation Email
```bash
curl -X POST \
  https://whklrclzrtijneqdjmiy.supabase.co/functions/v1/send-confirmation-email \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "name": "Test User"}'
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Confirmation email sent! Please check your inbox.",
  "email": "test@example.com",
  "emailSent": false
}
```

**Note**: `emailSent: false` means the email wasn't sent because:
- Resend requires domain verification for `noreply@oasara.com`
- Database record WAS created successfully
- Confirmation URL WAS generated

### Check Database for Confirmation Record
```bash
# Not available via CLI - check Supabase Dashboard → Table Editor → pending_email_confirmations
```

---

## Step 6: Verify Database Tables

Check that all 6 tables were created:

```bash
# List all tables (requires direct SQL access - use dashboard)
# https://supabase.com/dashboard/project/whklrclzrtijneqdjmiy/editor
```

**Tables Created**:
- `user_profiles`
- `pending_email_confirmations`
- `saved_facilities`
- `user_inquiries`
- `facility_claims`
- `user_notifications`

---

## Common CLI Commands

### View Function Logs
```bash
# Not directly available - use Dashboard:
# https://supabase.com/dashboard/project/whklrclzrtijneqdjmiy/functions
```

### Pull Remote Schema
```bash
supabase db pull
```

### Generate TypeScript Types
```bash
supabase gen types typescript --project-id whklrclzrtijneqdjmiy > src/types/supabase.ts
```

### Update CLI
```bash
brew upgrade supabase
```

---

## Troubleshooting

### Error: "uuid_generate_v4() does not exist"
**Solution**: Use `gen_random_uuid()` instead (built-in to PostgreSQL 13+)

### Error: "function does not exist, skipping"
**Solution**: This is expected for DROP IF EXISTS on first run. Ignore these notices.

### Error: "Tenant or user not found"
**Solution**: Use `supabase db push` instead of direct `psql` connection

### Email Not Sending
**Solution**:
1. Domain verification required in Resend dashboard
2. Change from address to use verified domain
3. Database record is still created - confirmation works even without email

---

## Complete Deployment Script

Save this as `deploy-auth.sh`:

```bash
#!/bin/bash
set -e

echo "🚀 Deploying OASARA User Authentication..."

# 1. Link project
echo "📡 Linking to Supabase project..."
supabase link --project-ref whklrclzrtijneqdjmiy

# 2. Set secrets
echo "🔐 Configuring secrets..."
supabase secrets set RESEND_API_KEY=re_jYW8DLLv_HcVhcRvHcBmyZ9Z64NbJZtm3

# 3. Create migration
echo "📄 Creating migration..."
mkdir -p supabase/migrations
cp database/USER-AUTH-SCHEMA.sql supabase/migrations/$(date +%Y%m%d%H%M%S)_user_auth_schema.sql

# 4. Push database schema
echo "💾 Pushing database schema..."
echo "Y" | supabase db push

# 5. Deploy edge functions
echo "⚡ Deploying edge functions..."
supabase functions deploy send-confirmation-email --no-verify-jwt
supabase functions deploy confirm-email --no-verify-jwt

# 6. Test
echo "🧪 Testing email function..."
curl -X POST \
  https://whklrclzrtijneqdjmiy.supabase.co/functions/v1/send-confirmation-email \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "name": "Test User"}'

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Verify domain in Resend dashboard"
echo "2. Check database tables in Supabase dashboard"
echo "3. Build React auth components"
```

Make executable:
```bash
chmod +x deploy-auth.sh
./deploy-auth.sh
```

---

## What Was Deployed

### Database (6 Tables)
- ✅ user_profiles
- ✅ pending_email_confirmations
- ✅ saved_facilities
- ✅ user_inquiries
- ✅ facility_claims
- ✅ user_notifications

### Edge Functions (2 Functions)
- ✅ send-confirmation-email
- ✅ confirm-email

### Secrets (2 Secrets)
- ✅ RESEND_API_KEY
- ✅ SUPABASE_SERVICE_ROLE_KEY (pre-existing)

---

## Dashboard Links

- **Project Dashboard**: https://supabase.com/dashboard/project/whklrclzrtijneqdjmiy
- **Table Editor**: https://supabase.com/dashboard/project/whklrclzrtijneqdjmiy/editor
- **Functions**: https://supabase.com/dashboard/project/whklrclzrtijneqdjmiy/functions
- **Secrets**: https://supabase.com/dashboard/project/whklrclzrtijneqdjmiy/settings/functions
- **SQL Editor**: https://supabase.com/dashboard/project/whklrclzrtijneqdjmiy/sql

---

## Email Domain Verification

To enable actual email sending:

1. Go to https://resend.com/domains
2. Add your domain (e.g., oasara.com)
3. Add DNS records:
   - SPF: `v=spf1 include:_spf.resend.com ~all`
   - DKIM: [provided by Resend]
4. Update edge function to use: `from: 'OASARA <noreply@oasara.com>'`

**For testing without domain**, use Resend's test mode or change to a verified email address.

---

## Success Criteria

- [ ] `supabase link` succeeds
- [ ] `supabase secrets list` shows RESEND_API_KEY
- [ ] `supabase db push` completes without errors
- [ ] Both edge functions deploy successfully
- [ ] Test curl returns `"success": true`
- [ ] Database record created in `pending_email_confirmations`
- [ ] All 6 tables visible in Table Editor

---

## Next Steps After CLI Deployment

1. ✅ Database schema deployed
2. ✅ Edge functions deployed
3. ✅ Secrets configured
4. ⏳ Verify domain in Resend (for actual email sending)
5. ⏳ Build React auth components (SignUpForm, LoginForm, ConfirmEmail, UserDashboard)
6. ⏳ Test full user flow end-to-end
7. ⏳ Deploy frontend to Netlify

Total CLI deployment time: **~5 minutes**

---

## Key Learnings

1. **Use `gen_random_uuid()` not `uuid_generate_v4()`** - Built-in to PostgreSQL 13+
2. **Secrets must be set before deploying functions** - Or redeploy after setting secrets
3. **`supabase db push` handles migrations** - No need for direct psql access
4. **Resend requires domain verification** - But confirmation tokens still work without it
5. **`--no-verify-jwt` flag required** - Allows public access to auth endpoints

---

## Support

If you encounter issues:

1. Check Supabase dashboard logs
2. Run commands with `--debug` flag
3. Verify project is linked: `supabase link --project-ref whklrclzrtijneqdjmiy`
4. Check secrets are set: `supabase secrets list`
5. Review migration file syntax

Database password for manual access: `FreeRoger!2025`

---

**Deployed successfully via CLI! 🎉**
