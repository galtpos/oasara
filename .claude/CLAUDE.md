# Oasara Medical Tourism Marketplace

## Project Overview

Oasara is a privacy-preserving medical tourism marketplace connecting patients with JCI-accredited healthcare facilities worldwide. The platform emphasizes user sovereignty, transparent pricing, and Zano cryptocurrency payment options.

**Live Site**: https://oasarademo.netlify.app
**Tech Stack**: React, TypeScript, Tailwind CSS, Mapbox, Supabase, Netlify

## Quick Commands

### Development
```bash
npm start          # Start dev server
npm run build      # Production build
npm test           # Run tests
netlify deploy --prod  # Deploy to production
```

### User Testing Simulation

This project uses AI-simulated user testing with defined personas.

| Command | Description |
|---------|-------------|
| `/project:user-test [scenario]` | Run full user test simulation |
| `/project:persona-review [component]` | Get multi-persona feedback |
| `/project:ux-audit [flow]` | Full UX audit with persona panel |
| `/project:generate-persona [description]` | Create new persona |
| `/project:quick-persona-test [feature]` | Rapid go/no-go check |

### Website Audit

| Command | Description |
|---------|-------------|
| `/audit-site [url]` | Full website audit with screenshots |
| `/accessibility-check [url]` | WCAG 2.1 AA compliance check |
| `/responsive-test [url]` | Multi-breakpoint testing |
| `/ux-review [url]` | Nielsen heuristics evaluation |

## Personas Location

User personas are defined in `docs/personas/*.yaml`

### Default Personas

| Persona | File | Use For |
|---------|------|---------|
| Alex Chen | `tech-savvy-millennial.yaml` | Power user testing, performance |
| Patricia Morrison | `busy-professional.yaml` | Task efficiency, conversion |
| Marcus Thompson | `accessibility-user.yaml` | Accessibility compliance |
| Jennifer Walsh | `first-time-visitor.yaml` | Onboarding, trust signals |
| Bob Henderson | `non-technical-senior.yaml` | Clarity, error recovery |

## Architecture

```
src/
├── components/
│   ├── Cards/           # Facility cards
│   ├── Chat/            # Oasis Guide chatbot
│   ├── Filters/         # Country, Specialty, Zano filters
│   ├── Layout/          # SiteHeader, etc.
│   ├── Map/             # GlobalFacilityMap (Mapbox)
│   └── Search/          # ProcedureSearch
├── pages/
│   ├── PublicSite.tsx   # Main marketplace view
│   ├── FacilityDetail.tsx
│   └── ...
└── lib/
    └── supabase.ts      # Database client
```

## Brand Guidelines

### Colors
- **Ocean Teal** `#2A6B72` - Primary brand color
- **Gold** `#D4B86A` - Accent, CTAs
- **Sage** `#8FBC8F` - Secondary, success states
- **White** `#FFFFFF` - Backgrounds

### Typography
- **Display**: Cinzel (serif) - Headings
- **Body**: Inter (sans-serif) - Body text

## Accessibility Standards

This project follows **WCAG 2.1 AA** guidelines:

- ✅ Skip link for keyboard navigation
- ✅ Focus indicators (gold outline)
- ✅ Proper heading hierarchy
- ✅ Form labels and ARIA attributes
- ✅ Screen reader announcements for map

## When to Use User Testing

- **Before merging UI changes** - Run `/project:quick-persona-test`
- **When designing new features** - Run `/project:persona-review`
- **During sprint planning** - Run `/project:ux-audit`
- **When prioritizing bugs** - Check which personas are affected

## Testing Philosophy

> "If it doesn't work for Marcus (accessibility), it doesn't ship."
> "If Patricia (busy) can't complete the task in 3 clicks, simplify it."
> "If Jennifer (new) doesn't trust it, add credibility signals."
