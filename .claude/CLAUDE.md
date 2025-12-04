# OASARA Medical Tourism Marketplace

## Project Overview

OASARA is a privacy-preserving medical tourism marketplace connecting patients with JCI-accredited healthcare facilities worldwide. The platform emphasizes user sovereignty, transparent pricing, and Zano cryptocurrency payment options.

**Live Sites**:
- Production: https://oasara.com
- Demo: https://oasarademo.netlify.app

**Tech Stack**: React 18, TypeScript, Tailwind CSS, Framer Motion, Mapbox GL, Supabase, Netlify

**Supabase Project**: `whklrclzrtijneqdjmiy`

---

## Current Features (December 2025)

### Public Pages

| Page | Route | Status | Description |
|------|-------|--------|-------------|
| Landing Gate | `/welcome` | Live | First-time visitor experience |
| Login | `/login` | Live | Magic link authentication |
| Sign Up | `/signup` | Live | Email confirmation flow |
| Email Confirm | `/auth/confirm` | Live | Token verification + password set |
| Early Access | `/early-access` | Live | Waitlist signup with Telegram notifications |
| Bounty Board | `/bounty` | Live | Feedback bounty system ($50/$30/$20 tiers) |
| Facilities | `/` | Protected | Main marketplace with map + filters |
| Facility Detail | `/facility/:id` | Protected | Individual facility pages |
| Why Zano | `/why-zano` | Protected | Privacy payment education |
| Take Action | `/action` | Protected | Action center for user engagement |
| Guide | `/hub` | Protected | Medical tourism hub with tabs |
| Trust Laws | `/medical-trusts` | Protected | Medical trust information |
| Feedback | `/feedback` | Protected | General feedback form |

### Admin Panel (`/admin/*`)

| Route | Component | Description |
|-------|-----------|-------------|
| `/admin` | Dashboard | Overview stats and quick actions |
| `/admin/analytics` | Analytics | Traffic and engagement metrics |
| `/admin/facilities` | FacilitiesList | CRUD for medical facilities |
| `/admin/facilities/:id` | FacilityEditor | Edit facility details |
| `/admin/doctors` | DoctorsList | Manage doctor profiles |
| `/admin/bounties` | FeedbackManagement | Accept/reject bounty submissions |
| `/admin/testimonials` | (Placeholder) | Patient testimonials |
| `/admin/pricing` | (Placeholder) | Procedure pricing |
| `/admin/affiliates` | AffiliateManager | Affiliate program |
| `/admin/claims` | (Placeholder) | Facility claims |
| `/admin/users` | (Placeholder) | User management |
| `/admin/tasks` | (Placeholder) | Admin tasks |
| `/admin/settings` | (Placeholder) | Site settings |

---

## Bounty System (December 2025)

### Overview
User feedback bounty program with tiered rewards paid in fUSD (Freedom Dollar) via Zano.

### Bounty Tiers
| Category | Bounty | Icon | Description |
|----------|--------|------|-------------|
| Feature Request | $50 fUSD | 💡 | New functionality ideas |
| Bug Report | $30 fUSD | 🐛 | Something broken or wrong |
| UX Improvement | $20 fUSD | ✨ | Make it easier to use |

### Budget
- **Total Budget**: $1,000 fUSD
- **Tracking**: Real-time stats on bounty board

### User Flow
1. User clicks "Submit Idea" or uses floating feedback widget
2. Selects category (feature/bug/ux)
3. Describes the issue/idea
4. Optionally provides Zano wallet address
5. Submission appears on bounty board as "Pending Review"

### Admin Flow
1. Admin reviews submissions at `/admin/bounties`
2. Click "Review" to expand response options
3. Accept (with optional message) or Reject
4. Mark as "Paid" after sending fUSD to wallet

### Database Schema
```sql
-- feedback table columns for bounty
accepted: boolean | null     -- null=pending, true=accepted, false=rejected
bounty_paid: boolean         -- default false
admin_response: text | null  -- response message
wallet_address: text | null  -- Zano wallet for payment
reviewed_at: timestamptz     -- when admin reviewed
```

### Components
- `src/pages/BountyBoard.tsx` - Public bounty board with leaderboard
- `src/components/FeedbackWidget.tsx` - Floating feedback button
- `src/admin/pages/FeedbackManagement.tsx` - Admin bounty management

---

## Authentication System

### Magic Link Flow
1. User enters email at `/login`
2. Supabase sends magic link email
3. User clicks link, redirected to app
4. Session established via Supabase Auth

### Email Confirmation Flow (New Users)
1. User enters email at `/signup`
2. Edge function `send-confirmation-email` sends email via Resend
3. User clicks confirmation link
4. Redirected to `/auth/confirm?token=xxx`
5. User sets password
6. Edge function `confirm-email` creates Supabase user
7. Auto-login and redirect to app

### Protected Routes
All marketplace routes require authentication via `ProtectedRoute` component.

---

## Database Schema

### Core Tables
- `facilities` - Medical facilities with location, ratings, specialties
- `doctors` - Doctor profiles linked to facilities
- `procedure_pricing` - Procedure costs per facility
- `testimonials` - Patient reviews
- `zano_requests` - Zano payment opt-in requests

### Auth Tables
- `pending_email_confirmations` - Email confirmation tokens
- `user_profiles` - Extended user data

### Feedback Tables
- `feedback` - User feedback with bounty tracking
- `pledges` - Early access pledges

### Community Tables
- `community_posts` - User posts
- `community_comments` - Post comments
- `community_likes` - Post/comment likes

---

## Quick Commands

### Development
```bash
npm start              # Start dev server (port 3000)
npm run build          # Production build
npm test               # Run tests
```

### Deployment
```bash
# Deploy to Netlify (production)
netlify deploy --prod

# Or push to GitHub (auto-deploys)
git push origin main
```

### Supabase
```bash
# Link to project
supabase link --project-ref whklrclzrtijneqdjmiy

# Push database changes
supabase db push

# Deploy edge functions
supabase functions deploy send-confirmation-email --no-verify-jwt
supabase functions deploy confirm-email --no-verify-jwt

# View function logs
supabase functions logs send-confirmation-email --tail
```

---

## Project Structure

```
oasara-marketplace/
├── .claude/
│   ├── CLAUDE.md           # This file
│   └── commands/           # Custom slash commands
├── database/
│   └── USER-AUTH-SCHEMA.sql
├── docs/
│   └── personas/           # User testing personas
├── scripts/
│   ├── fetchScraper.js     # Facility data scraping
│   ├── import-to-supabase.js
│   └── enrich-*.js         # Data enrichment
├── src/
│   ├── admin/
│   │   ├── layouts/        # AdminLayout, AdminSidebar, AdminHeader
│   │   └── pages/          # Admin page components
│   ├── components/
│   │   ├── Auth/           # LoginForm, SignUpForm, ProtectedRoute
│   │   ├── Cards/          # FacilityCard
│   │   ├── Chat/           # OasisGuide chatbot
│   │   ├── Filters/        # Country, Specialty, Zano filters
│   │   ├── Hub/            # Tab components for guide
│   │   ├── Layout/         # SiteHeader
│   │   ├── Map/            # GlobalFacilityMap (Mapbox)
│   │   └── Search/         # ProcedureSearch
│   ├── lib/
│   │   └── supabase.ts     # Database client & types
│   ├── pages/              # All route pages
│   └── AppRoutes.tsx       # Route definitions
├── supabase/
│   ├── functions/          # Edge functions
│   │   ├── send-confirmation-email/
│   │   ├── confirm-email/
│   │   └── _shared/
│   └── migrations/         # Database migrations
├── .env.local              # Local environment (gitignored)
├── skills.md               # Procedures & workflows
└── tailwind.config.js      # Design system config
```

---

## Brand Guidelines

### Colors
| Name | Hex | Usage |
|------|-----|-------|
| Ocean Teal | `#2A6B72` | Primary brand, headers, stats bar |
| Gold | `#D4B86A` | Accent, CTAs, logo gradient |
| Sage | `#8FBC8F` | Secondary, success states |
| White | `#FFFFFF` | Backgrounds |

### Typography
- **Display**: Cinzel (serif) - Headings, logo
- **Body**: Inter (sans-serif) - Body text

### Key CSS Classes
```css
.logo-gradient    /* Gold gradient logo text */
.btn-gold         /* Gold button with shadow */
.nav-link         /* Navigation links */
.stats-bar        /* Ocean teal stats section */
```

---

## Accessibility Standards

This project follows **WCAG 2.1 AA** guidelines:

- Skip link for keyboard navigation
- Focus indicators (gold outline)
- Proper heading hierarchy (h1 → h2 → h3)
- Form labels and ARIA attributes
- Screen reader announcements for map
- Color contrast ratios ≥ 4.5:1

---

## User Testing Personas

Located in `docs/personas/*.yaml`

| Persona | File | Use For |
|---------|------|---------|
| Alex Chen | `tech-savvy-millennial.yaml` | Power user testing |
| Patricia Morrison | `busy-professional.yaml` | Task efficiency |
| Marcus Thompson | `accessibility-user.yaml` | Accessibility |
| Jennifer Walsh | `first-time-visitor.yaml` | Onboarding |
| Bob Henderson | `non-technical-senior.yaml` | Clarity |

### Commands
| Command | Description |
|---------|-------------|
| `/project:user-test [scenario]` | Full user test simulation |
| `/project:persona-review [component]` | Multi-persona feedback |
| `/project:ux-audit [flow]` | Full UX audit |
| `/project:quick-persona-test [feature]` | Rapid go/no-go check |

---

## Environment Variables

### Required (.env.local)
```bash
# Supabase
REACT_APP_SUPABASE_URL=https://whklrclzrtijneqdjmiy.supabase.co
REACT_APP_SUPABASE_ANON_KEY=<anon_key>

# Mapbox
REACT_APP_MAPBOX_TOKEN=<mapbox_token>

# Telegram (early access notifications)
REACT_APP_TELEGRAM_BOT_TOKEN=<bot_token>
REACT_APP_TELEGRAM_CHAT_ID=<chat_id>

# Optional: AI features
OPENAI_API_KEY=<key>
OPENROUTER_API_KEY=<key>
```

### Supabase Secrets
```bash
RESEND_API_KEY    # Email service
# Auto-configured: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
```

---

## Testing Philosophy

> "If it doesn't work for Marcus (accessibility), it doesn't ship."
> "If Patricia (busy) can't complete the task in 3 clicks, simplify it."
> "If Jennifer (new) doesn't trust it, add credibility signals."

---

## Recent Changes

### December 4, 2025
- Simplified bounty system to 3 tiers: Feature $50, Bug $30, UX $20
- Added leaderboard to bounty board
- E2E tested entire bounty flow
- Budget tracking ($1000 total)

### December 2, 2025
- Added community tables migration
- Pledges and feedback tables
- FeedbackWidget with screenshot capture

### November 2, 2025
- Admin panel with sidebar navigation
- Admin authentication
- Facility management CRUD

### October 30, 2025
- User authentication via magic links
- Email confirmation flow with Resend
- Data enrichment tables (doctors, pricing, testimonials)

---

## Important URLs

### Dashboards
- Supabase: https://supabase.com/dashboard/project/whklrclzrtijneqdjmiy
- Netlify: https://app.netlify.com/sites/oasara
- Resend: https://resend.com/emails

### Edge Functions
- Send Email: `https://whklrclzrtijneqdjmiy.supabase.co/functions/v1/send-confirmation-email`
- Confirm Email: `https://whklrclzrtijneqdjmiy.supabase.co/functions/v1/confirm-email`

---

**Last Updated**: December 4, 2025
**Database Password**: FreeRoger!2025
