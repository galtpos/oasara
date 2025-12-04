# OASARA Skills & Procedures

## Quick Reference for Common Tasks

This document contains reusable procedures, commands, and workflows for the OASARA marketplace project.

---

## 1. Bounty System Management (December 2025)

### Overview
3-tier bounty system for user feedback paid in fUSD (Freedom Dollar) via Zano.

| Category | Bounty | Icon |
|----------|--------|------|
| Feature Request | $50 fUSD | 💡 |
| Bug Report | $30 fUSD | 🐛 |
| UX Improvement | $20 fUSD | ✨ |

**Total Budget**: $1,000 fUSD

### Accept a Bounty Submission (via CLI)
```bash
# 1. Get pending submissions
SUPABASE_URL="https://whklrclzrtijneqdjmiy.supabase.co"
ANON_KEY="<your_anon_key>"

curl -s "$SUPABASE_URL/rest/v1/feedback?accepted=is.null&select=*" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY"

# 2. Accept a submission
printf '{"accepted": true, "status": "accepted", "admin_response": "Accepted for bounty!", "reviewed_at": "%s"}' \
  "$(date -u +%Y-%m-%dT%H:%M:%SZ)" > /tmp/accept.json

curl -s -X PATCH "$SUPABASE_URL/rest/v1/feedback?id=eq.<feedback_id>" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  --data-binary @/tmp/accept.json

# 3. Mark as paid (after sending fUSD)
printf '{"bounty_paid": true}' > /tmp/paid.json

curl -s -X PATCH "$SUPABASE_URL/rest/v1/feedback?id=eq.<feedback_id>" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "Content-Type: application/json" \
  --data-binary @/tmp/paid.json
```

### Check Bounty Stats
```bash
# Get all accepted submissions with bounty info
curl -s "$SUPABASE_URL/rest/v1/feedback?accepted=eq.true&select=category,bounty_paid,name,wallet_address" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY"
```

### Database Schema
```sql
-- Bounty columns in feedback table
ALTER TABLE feedback ADD COLUMN IF NOT EXISTS accepted boolean;
ALTER TABLE feedback ADD COLUMN IF NOT EXISTS bounty_paid boolean DEFAULT false;
ALTER TABLE feedback ADD COLUMN IF NOT EXISTS admin_response text;
ALTER TABLE feedback ADD COLUMN IF NOT EXISTS wallet_address text;
ALTER TABLE feedback ADD COLUMN IF NOT EXISTS reviewed_at timestamptz;
```

---

## 2. Supabase CLI Authentication Deployment

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

## 3. Database Schema Management

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

### Current Migrations
```
20241030_add_enrichment_tables.sql     # Doctors, pricing, testimonials
20251030000909_user_auth_schema.sql    # User auth tables
20251030092801_add_insert_policies.sql # RLS policies
20251101000000_admin_security_policies.sql # Admin auth
20251102090246_create_admin_user.sql   # Admin user creation
20251102090500_set_admin_password.sql  # Admin password
20251202000000_pledges_feedback.sql    # Pledges and feedback
20251202145239_community_tables.sql    # Community features
20251204000000_feedback_bounty.sql     # Bounty system columns
```

---

## 4. Edge Functions Management

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

## 5. E2E Testing with Playwright

### Start Codegen Session
```javascript
// Via MCP tool
mcp__playwright__start_codegen_session({
  options: {
    outputPath: "/path/to/tests",
    testNamePrefix: "OasaraTest",
    includeComments: true
  }
})
```

### Navigate and Take Screenshot
```javascript
mcp__playwright__playwright_navigate({ url: "https://oasara.com/bounty" })
mcp__playwright__playwright_screenshot({ name: "bounty-board", fullPage: true })
```

### Fill Form and Submit
```javascript
mcp__playwright__playwright_fill({ selector: "input[type='email']", value: "test@example.com" })
mcp__playwright__playwright_click({ selector: "button[type='submit']" })
```

### Common Selectors
```css
/* Bounty Board */
button:has-text("Submit Idea")     /* Open submission form */
button:has-text("Leaderboard")     /* Switch to leaderboard tab */
.category-btn                       /* Category selection buttons */

/* Admin Panel */
button[type="submit"]               /* Sign in button */
input[type="email"]                 /* Email field */
input[type="password"]              /* Password field */
```

---

## 6. Secrets Management

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

## 7. Data Enrichment Scripts

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

## 8. Database Operations

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

## 9. Google Places API Integration

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

## 10. Development Workflow

### Start Development Server
```bash
npm start
```

### Build for Production
```bash
npm run build

# If TypeScript errors blocking build:
CI=false npm run build
```

### Deploy to Netlify
```bash
npm run deploy
# or
netlify deploy --prod
```

### Or push to GitHub (auto-deploys)
```bash
git add . && \
git commit -m "feat: your feature description" && \
git push origin main
```

---

## 11. Git Commit Message Format

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

## 12. Environment Variables

### Required for Development (.env.local)
```bash
# Supabase
REACT_APP_SUPABASE_URL=https://whklrclzrtijneqdjmiy.supabase.co
REACT_APP_SUPABASE_ANON_KEY=<your_anon_key>

# Mapbox
REACT_APP_MAPBOX_TOKEN=<your_mapbox_token>

# Telegram (for early access notifications)
REACT_APP_TELEGRAM_BOT_TOKEN=<bot_token>
REACT_APP_TELEGRAM_CHAT_ID=<chat_id>

# OpenAI (for AI scraping)
OPENAI_API_KEY=<your_openai_key>

# OpenRouter (for DeepSeek)
OPENROUTER_API_KEY=<your_key>

# Resend (for user auth emails)
RESEND_API_KEY=re_jYW8DLLv_HcVhcRvHcBmyZ9Z64NbJZtm3
```

### Production Environment (Netlify)
Set these in Netlify dashboard under Site Settings → Environment Variables

---

## 13. Database Connection

### Direct PostgreSQL Access
```bash
PGPASSWORD='FreeRoger!2025' psql -h db.whklrclzrtijneqdjmiy.supabase.co \
  -p 5432 -d postgres -U postgres
```

**Note**: Direct connection may not work due to firewall. Use `supabase db push` instead.

---

## 14. Resend Email Domain Setup

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

## 15. Testing User Authentication Flow

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
```javascript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'test@example.com',
  password: 'MySecurePassword123!'
})
```

---

## 16. Common Troubleshooting Commands

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

### Kill stuck dev server
```bash
lsof -i :3000 | awk 'NR>1 {print $2}' | xargs kill -9
```

---

## 17. Project File Structure

```
oasara-marketplace/
├── .claude/
│   ├── CLAUDE.md                 # Project documentation
│   └── commands/                 # Slash commands for testing
├── database/
│   └── USER-AUTH-SCHEMA.sql      # Database schema definitions
├── docs/
│   └── personas/                 # User testing personas (YAML)
├── scripts/
│   ├── fetchScraper.js           # Web scraping for facility data
│   ├── import-to-supabase.js     # Import facilities to DB
│   ├── enrich-specialties.js     # Add specialty data
│   └── add-website-urls.js       # Fetch website URLs
├── src/
│   ├── admin/
│   │   ├── layouts/              # AdminLayout, AdminSidebar
│   │   └── pages/                # Dashboard, FeedbackManagement, etc.
│   ├── components/
│   │   ├── Auth/                 # LoginForm, SignUpForm, ProtectedRoute
│   │   ├── Cards/                # FacilityCard
│   │   ├── Chat/                 # OasisGuide chatbot
│   │   ├── Filters/              # CountryFilter, SpecialtyFilter, ZanoFilter
│   │   ├── Hub/                  # Tab components for guide
│   │   ├── Layout/               # SiteHeader
│   │   ├── Map/                  # GlobalFacilityMap (Mapbox)
│   │   └── FeedbackWidget.tsx    # Floating feedback button
│   ├── lib/
│   │   └── supabase.ts           # Database client & types
│   ├── pages/
│   │   ├── BountyBoard.tsx       # Bounty system with leaderboard
│   │   ├── PublicSite.tsx        # Main marketplace
│   │   ├── EarlyAccess.tsx       # Waitlist signup
│   │   └── ...                   # Other pages
│   └── AppRoutes.tsx             # Route definitions
├── supabase/
│   ├── functions/
│   │   ├── send-confirmation-email/
│   │   ├── confirm-email/
│   │   └── _shared/
│   └── migrations/               # Database migrations
├── .env.local                    # Local environment variables
├── skills.md                     # This file
└── tailwind.config.js            # Design system config
```

---

## 18. Important URLs

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

**Live Site**:
- Production: https://oasara.com
- Bounty Board: https://oasara.com/bounty
- Admin Login: https://oasara.com/admin/login

---

## 19. Key Learning: UUID Generation

**Problem**: `uuid_generate_v4()` requires `uuid-ossp` extension
**Solution**: Use `gen_random_uuid()` which is built-in to PostgreSQL 13+

```sql
-- Old way (requires extension)
CREATE TABLE example (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4()
);

-- New way (built-in)
CREATE TABLE example (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid()
);
```

---

## 20. Quick Deploy Checklist

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

## 21. Brand Design System (December 2025)

### Color Palette

**Primary - Ocean Teal:**
```
ocean-50:  #F0F7F8
ocean-100: #D9ECED
ocean-200: #B3D9DC
ocean-300: #7FBFC5
ocean-400: #5B9AA0  (borders, icons)
ocean-500: #3D7D85
ocean-600: #2A6B72  PRIMARY (stats bar, accents)
ocean-700: #1F525A
ocean-800: #163C42
ocean-900: #0E282C
```

**Accent - Gold:**
```
gold-50:  #FFFDF5
gold-100: #FEF7E0
gold-200: #FCE9B2
gold-300: #F5D77A  (stat numbers on dark)
gold-400: #E5C76B
gold-500: #D4B86A  LOGO START
gold-600: #C9A54F
gold-700: #B8923A  LOGO END
gold-800: #8B6914  BUTTON SHADOW
gold-900: #5C4610
```

### Typography

**Fonts:**
- Display/Headers: `Cinzel` (Google Fonts) - Bold/Black weight
- Body: `Inter` (Google Fonts) - Regular/Medium weight

**CSS Import:**
```css
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700&display=swap');
```

### Key CSS Classes

**Logo:**
```css
.logo-gradient {
  font-family: 'Cinzel', serif;
  font-weight: 800;
  letter-spacing: 0.5em;
  background: linear-gradient(180deg, #D4B86A 0%, #A67C00 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

**Stats Bar:**
```css
.stats-bar { background: #2A6B72; }
.stat-pill {
  background: rgba(255, 255, 255, 0.15);
  border: 2px solid rgba(255, 255, 255, 0.25);
}
.stat-number {
  font-family: 'Cinzel', serif;
  font-size: 2.5rem;
  font-weight: 900;
  color: #FFD966;
}
```

**Gold Button:**
```css
.btn-gold {
  background: linear-gradient(180deg, #D4B86A 0%, #B8923A 100%);
  color: #1A1A1A;
  box-shadow: 0 4px 0 #8B6914, 0 6px 16px rgba(139, 105, 20, 0.3);
  border-radius: 3px;
}
```

### Tailwind Classes

- Primary color: `bg-ocean-600`, `text-ocean-600`, `border-ocean-400`
- Accent color: `bg-gold-500`, `text-gold-500`
- Headers: `font-display` or `font-serif` (Cinzel)
- Body: `font-sans` (Inter)

### Design Principles

1. **White backgrounds** with ocean teal accents
2. **Crisp edges** - 2-4px border radius
3. **Hard shadows** on buttons (tactile feel)
4. **Stats bar** as prominent Ocean Teal stripe
5. **Gold gradient logo** - architectural, bold
6. **Card borders** in sage-200 (#D1DDD6)

---

## 22. Performance Tips

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

## 23. Security Best Practices

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

**Last Updated**: December 4, 2025
**Project**: OASARA Medical Tourism Marketplace
**Database Password**: FreeRoger!2025
**Brand Theme**: Ocean Teal & Gold
**Bounty Budget**: $1,000 fUSD (Feature $50, Bug $30, UX $20)
