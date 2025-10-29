# OASARA Quick Start Guide

Get OASARA running locally in 10 minutes.

## Prerequisites

- Node.js 16+ installed
- Git installed
- Text editor (VS Code recommended)

## Quick Setup

### 1. Navigate to Project

```bash
cd /Users/aaronday/Documents/medicaltourism/oasara-marketplace
```

### 2. Install Dependencies (if not already done)

```bash
npm install
```

### 3. Set Up Environment Variables

You need API keys from three services. Here's the quickest path:

#### Option A: Use Placeholder Values (Development Only)

```bash
cp .env.example .env.local
```

Then edit `.env.local` and add placeholder values:

```
REACT_APP_SUPABASE_URL=http://placeholder
REACT_APP_SUPABASE_ANON_KEY=placeholder
REACT_APP_MAPBOX_TOKEN=placeholder
REACT_APP_EMAILJS_SERVICE_ID=placeholder
REACT_APP_EMAILJS_TEMPLATE_ID=placeholder
REACT_APP_EMAILJS_PUBLIC_KEY=placeholder
```

**Note**: App won't fully work with placeholders, but you can see the UI.

#### Option B: Get Real API Keys (Recommended)

**Supabase** (5 minutes):
1. Go to [supabase.com](https://supabase.com)
2. Sign up (free)
3. Create new project
4. Copy URL and anon key from Project Settings > API

**Mapbox** (2 minutes):
1. Go to [mapbox.com](https://mapbox.com)
2. Sign up (free)
3. Copy default public token from Account > Tokens

**EmailJS** (3 minutes):
1. Go to [emailjs.com](https://emailjs.com)
2. Sign up (free)
3. Add email service (Gmail easiest)
4. Create template
5. Copy Service ID, Template ID, and Public Key

### 4. Set Up Database (Only if using real Supabase)

In Supabase SQL Editor, run:

1. Contents of `/database/schema.sql`
2. Contents of `/database/seeds/initial-facilities.sql`

### 5. Start Development Server

```bash
npm start
```

App opens at [http://localhost:3000](http://localhost:3000)

## What You Should See

- Dark themed interface with OASARA branding
- Interactive map (if Mapbox token is valid)
- List of facilities (if Supabase is configured)
- Search and filter controls
- Glass morphism cards with smooth animations

## Troubleshooting

### Map Not Loading
- Check Mapbox token in `.env.local`
- Clear browser cache and refresh

### No Facilities Showing
- Verify Supabase URL and key
- Check database has been seeded
- Open browser console for errors

### Styling Issues
- Run `npm install` again
- Delete `node_modules` and `npm install`

### Port Already in Use
- App tries to use port 3000
- Close other apps using port 3000
- Or use different port: `PORT=3001 npm start`

## Next Steps

Once running locally:

1. **Explore the UI**: Click around, test search/filters
2. **Check Console**: Open browser DevTools, look for errors
3. **Review Code**: Start with `src/App.tsx`
4. **Make Changes**: Edit components, see hot reload
5. **Deploy**: Follow `DEPLOYMENT.md` when ready

## Project Structure

Key files to know:

```
src/
├── App.tsx                          # Main app logic
├── index.css                        # Tailwind + custom styles
├── components/
│   ├── Map/GlobalFacilityMap.tsx   # The map
│   ├── Cards/FacilityCard.tsx      # Facility cards
│   ├── Search/ProcedureSearch.tsx  # Search bar
│   └── Filters/                    # Filter components
└── lib/supabase.ts                 # Database client

database/
├── schema.sql                       # Database structure
└── seeds/initial-facilities.sql    # Sample data
```

## Common Commands

```bash
# Start dev server
npm start

# Build for production
npm run build

# Run tests (if added later)
npm test

# Check for errors
npm run build
```

## Getting Help

- Check browser console for errors
- Review `README.md` for full documentation
- See `DEPLOYMENT.md` for production setup
- Open issue on GitHub if stuck

## Development Tips

1. **Hot Reload**: Changes auto-refresh browser
2. **Console Logs**: Open DevTools to see logs
3. **Component Isolation**: Test one component at a time
4. **Tailwind Classes**: Use `className` for styling
5. **TypeScript**: Check for red squiggles in editor

## Ready to Deploy?

When your local version works:

1. Get all real API keys (no placeholders)
2. Test thoroughly
3. Follow `DEPLOYMENT.md`
4. Push to GitHub
5. Deploy to Netlify

---

Questions? Check the full README.md or open an issue.
