# OASARA Skills & Procedures

## Quick Reference for Common Tasks

This document contains reusable procedures, commands, and workflows for the OASARA marketplace project.

---

## 1. Supabase CLI Authentication Deployment

### Full Authentication System Deployment

**Time**: ~5 minutes
**Prerequisites**: Supabase CLI installed, project created

```bash
# 1. Link to Supabase project
supabase link --project-ref whklrclzrtijneqdjmiy

# 2. Configure edge function secrets
supabase secrets set RESEND_API_KEY=re_jYW8DLLv_HcVhcRvHcBmyZ9Z64NbJZtm3

# 3. Verify secrets configured
supabase secrets list

# 4. Create migration from schema
mkdir -p supabase/migrations
cp database/USER-AUTH-SCHEMA.sql supabase/migrations/$(date +%Y%m%d%H%M%S)_user_auth_schema.sql

# 5. Push database schema to production
echo "Y" | supabase db push

# 6. Deploy edge functions
supabase functions deploy send-confirmation-email --no-verify-jwt
supabase functions deploy confirm-email --no-verify-jwt

# 7. Test confirmation email endpoint
curl -X POST https://whklrclzrtijneqdjmiy.supabase.co/functions/v1/send-confirmation-email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User"}'
```

**Expected Output**: `{"success":true,"message":"Confirmation email sent!..."}`

---

## 2. Database Schema Management

### Push New Migration
```bash
# Create migration file
supabase db diff -f <migration_name>

# Or manually create migration
cp database/<schema>.sql supabase/migrations/$(date +%Y%m%d%H%M%S)_<name>.sql

# Push to production
supabase db push
```

### Pull Remote Schema
```bash
supabase db pull
```

### Generate TypeScript Types
```bash
supabase gen types typescript --project-id whklrclzrtijneqdjmiy > src/types/supabase.ts
```

---

## 3. Edge Functions Management

### Deploy Single Function
```bash
supabase functions deploy <function-name> --no-verify-jwt
```

### Deploy All Functions
```bash
supabase functions deploy send-confirmation-email --no-verify-jwt && \
supabase functions deploy confirm-email --no-verify-jwt
```

### View Function Logs
**Note**: Not available via CLI - use dashboard:
```
https://supabase.com/dashboard/project/whklrclzrtijneqdjmiy/functions
```

### Test Function Locally
```bash
supabase functions serve <function-name>

# Then in another terminal:
curl -X POST http://localhost:54321/functions/v1/<function-name> \
  -H "Content-Type: application/json" \
  -d '{"key":"value"}'
```

---

## 4. Secrets Management

### List All Secrets
```bash
supabase secrets list
```

### Set Secret
```bash
supabase secrets set SECRET_NAME=secret_value
```

### Unset Secret
```bash
supabase secrets unset SECRET_NAME
```

### Current Secrets (OASARA)
- `RESEND_API_KEY` - Email service API key
- `SUPABASE_SERVICE_ROLE_KEY` - Admin database access (auto-configured)
- `SUPABASE_URL` - Project URL (auto-configured)
- `SUPABASE_ANON_KEY` - Public API key (auto-configured)
- `SUPABASE_DB_URL` - Direct database connection (auto-configured)

---

## 5. Data Enrichment Scripts

### Run Fetch Scraper on All Facilities
```bash
node scripts/fetchScraper.js
```

### Run Fetch Scraper on Specific Facilities
```bash
node scripts/fetchScraper.js --limit=10
```

### Check Scraper Progress
```bash
tail -f fetch-scraper-results.log | grep -E "(SUCCESS|PARTIAL|FAILED)"
```

### Count Results
```bash
grep -c "SUCCESS" fetch-scraper-results.log
grep -c "PARTIAL" fetch-scraper-results.log
grep -c "FAILED" fetch-scraper-results.log
```

---

## 6. Database Operations

### Import Facilities to Supabase
```bash
node scripts/import-to-supabase.js
```

### Enrich Facilities with Specialties
```bash
node scripts/enrich-specialties.js
```

### Add Website URLs
```bash
node scripts/add-website-urls.js
```

### Check for Duplicates
```bash
node scripts/check-duplicates.js
```

---

## 7. Google Places API Integration

### Test Single Facility
```bash
GOOGLE_PLACES_API_KEY=AIzaSyBokFeOvtr7moIFKh1C2NnpbqRgEgQsVvQ \
node scripts/test-enrichment.js "Bangkok Hospital"
```

### Enrich All Facilities
```bash
GOOGLE_PLACES_API_KEY=AIzaSyBokFeOvtr7moIFKh1C2NnpbqRgEgQsVvQ \
node scripts/enrich-facilities.js
```

---

## 8. Development Workflow

### Start Development Server
```bash
npm start
```

### Build for Production
```bash
npm run build
```

### Deploy to Netlify
```bash
npm run deploy
```

### Or push to GitHub (auto-deploys)
```bash
git add . && \
git commit -m "feat: your feature description" && \
git push origin main
```

---

## 9. Git Commit Message Format

Follow conventional commits:

```bash
# Features
git commit -m "feat: add user authentication"

# Fixes
git commit -m "fix: resolve email sending issue"

# Documentation
git commit -m "docs: update deployment guide"

# Refactoring
git commit -m "refactor: simplify scraper logic"

# Performance
git commit -m "perf: optimize database queries"

# Tests
git commit -m "test: add auth flow tests"
```

---

## 10. Environment Variables

### Required for Development (.env.local)
```bash
# Supabase
REACT_APP_SUPABASE_URL=https://whklrclzrtijneqdjmiy.supabase.co
REACT_APP_SUPABASE_ANON_KEY=<your_anon_key>

# Mapbox
REACT_APP_MAPBOX_TOKEN=<your_mapbox_token>

# EmailJS (for facility outreach)
REACT_APP_EMAILJS_SERVICE_ID=service_placeholder
REACT_APP_EMAILJS_TEMPLATE_ID=template_placeholder
REACT_APP_EMAILJS_PUBLIC_KEY=placeholder_key

# OpenAI (for AI scraping)
OPENAI_API_KEY=<your_openai_key>

# Resend (for user auth emails)
RESEND_API_KEY=re_jYW8DLLv_HcVhcRvHcBmyZ9Z64NbJZtm3
```

### Production Environment (Netlify)
Set these in Netlify dashboard under Site Settings → Environment Variables

---

## 11. Database Connection

### Direct PostgreSQL Access
```bash
PGPASSWORD='FreeRoger!2025' psql -h db.whklrclzrtijneqdjmiy.supabase.co \
  -p 5432 -d postgres -U postgres
```

**Note**: Direct connection may not work due to firewall. Use `supabase db push` instead.

---

## 12. Resend Email Domain Setup

### Add Domain
1. Go to https://resend.com/domains
2. Click "Add Domain"
3. Enter: `oasara.com`

### Configure DNS Records
Add these records to your DNS provider:

**SPF Record**:
```
Type: TXT
Name: @
Value: v=spf1 include:_spf.resend.com ~all
```

**DKIM Records**: (provided by Resend after adding domain)
```
Type: TXT
Name: resend._domainkey
Value: <provided_by_resend>
```

### Verify Domain
```bash
# Check domain status in Resend dashboard
# Once verified, emails from noreply@oasara.com will send successfully
```

---

## 13. Testing User Authentication Flow

### 1. Send Confirmation Email
```bash
curl -X POST https://whklrclzrtijneqdjmiy.supabase.co/functions/v1/send-confirmation-email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User"}'
```

### 2. Get Token from Database (via Supabase Dashboard)
```sql
SELECT confirmation_token FROM pending_email_confirmations
WHERE email = 'test@example.com'
ORDER BY created_at DESC LIMIT 1;
```

### 3. Confirm Email with Password
```bash
curl -X POST https://whklrclzrtijneqdjmiy.supabase.co/functions/v1/confirm-email \
  -H "Content-Type: application/json" \
  -d '{
    "token":"<confirmation_token>",
    "password":"MySecurePassword123!"
  }'
```

### 4. Login (via frontend or API)
```bash
# Use Supabase client in frontend:
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'test@example.com',
  password: 'MySecurePassword123!'
})
```

---

## 14. Common Troubleshooting Commands

### Check if tables exist
```bash
# Via Supabase dashboard: Table Editor
# Or use psql if connection works
```

### Check edge function status
```bash
supabase functions list
```

### View recent migrations
```bash
ls -la supabase/migrations/
```

### Check Node.js version
```bash
node --version  # Should be 18+ for Supabase Edge Functions
```

### Clear Node modules and reinstall
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 15. Project File Structure

```
oasara-marketplace/
├── database/
│   └── USER-AUTH-SCHEMA.sql       # Database schema definitions
├── scripts/
│   ├── fetchScraper.js            # Web scraping for facility data
│   ├── import-to-supabase.js      # Import facilities to DB
│   ├── enrich-specialties.js      # Add specialty data
│   └── add-website-urls.js        # Fetch website URLs
├── src/
│   ├── components/                # React components
│   ├── pages/                     # Page components
│   └── types/                     # TypeScript type definitions
├── supabase/
│   ├── functions/
│   │   ├── send-confirmation-email/
│   │   ├── confirm-email/
│   │   └── _shared/
│   └── migrations/                # Database migrations
├── .env.local                     # Local environment variables
├── CLAUDE.md                      # Project documentation
├── SUPABASE-CLI-DEPLOYMENT.md     # CLI deployment guide
└── skills.md                      # This file
```

---

## 16. Important URLs

**Supabase Dashboard**:
- Project: https://supabase.com/dashboard/project/whklrclzrtijneqdjmiy
- Table Editor: https://supabase.com/dashboard/project/whklrclzrtijneqdjmiy/editor
- Functions: https://supabase.com/dashboard/project/whklrclzrtijneqdjmiy/functions
- SQL Editor: https://supabase.com/dashboard/project/whklrclzrtijneqdjmiy/sql
- API Settings: https://supabase.com/dashboard/project/whklrclzrtijneqdjmiy/settings/api

**Resend Dashboard**:
- Emails: https://resend.com/emails
- Domains: https://resend.com/domains
- API Keys: https://resend.com/api-keys

**Edge Function URLs**:
- Send Email: https://whklrclzrtijneqdjmiy.supabase.co/functions/v1/send-confirmation-email
- Confirm Email: https://whklrclzrtijneqdjmiy.supabase.co/functions/v1/confirm-email

---

## 17. Key Learning: UUID Generation

**Problem**: `uuid_generate_v4()` requires `uuid-ossp` extension
**Solution**: Use `gen_random_uuid()` which is built-in to PostgreSQL 13+

```sql
-- ❌ Old way (requires extension)
CREATE TABLE example (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4()
);

-- ✅ New way (built-in)
CREATE TABLE example (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid()
);
```

---

## 18. Quick Deploy Checklist

Before deploying to production:

- [ ] All environment variables set in `.env.local`
- [ ] Supabase project linked: `supabase link`
- [ ] Edge function secrets configured: `supabase secrets list`
- [ ] Database schema pushed: `supabase db push`
- [ ] Edge functions deployed: `supabase functions deploy`
- [ ] Domain verified in Resend (if using email)
- [ ] Test edge functions with curl
- [ ] Frontend builds successfully: `npm run build`
- [ ] Netlify environment variables configured
- [ ] Push to GitHub for auto-deployment

---

## 19. Performance Tips

### Optimize Scraper
- Use `--limit` flag to process fewer facilities
- Run scrapers during off-peak hours
- Use `setTimeout` between requests to avoid rate limits

### Optimize Database Queries
- Use indexes on frequently queried columns
- Enable RLS policies for security
- Use `select()` with specific columns instead of `*`

### Optimize Frontend
- Use React.lazy() for code splitting
- Optimize images before uploading
- Use Mapbox clustering for large datasets

---

## 20. Security Best Practices

### Never Commit to Git
- `.env.local` (in .gitignore)
- API keys in code
- Database passwords
- Service role keys

### Use RLS Policies
```sql
-- Example: Users can only see their own data
CREATE POLICY "Users can view own profile"
ON user_profiles FOR SELECT
USING (auth.uid() = id);
```

### Use Service Role Key Only in Edge Functions
- Never expose service_role key in frontend
- Only use in secure server-side contexts
- Use anon key in frontend code

---

## Summary

This skills.md file contains all the essential commands, procedures, and workflows for working on the OASARA project. Bookmark this file for quick reference!

**Most Common Commands**:
1. `supabase link` - Link to project
2. `supabase db push` - Deploy database changes
3. `supabase functions deploy <name>` - Deploy edge function
4. `npm start` - Run development server
5. `git push origin main` - Deploy to production

**Last Updated**: October 29, 2024
**Project**: OASARA Medical Tourism Marketplace
**Database Password**: FreeRoger!2025
