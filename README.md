# OASARA - Medical Tourism Marketplace

> Your Oasis for Medical Sovereignty

A privacy-preserving medical tourism marketplace connecting patients with 661+ JCI-certified facilities globally. Built on Zano blockchain for payment privacy and medical sovereignty.

**Status**: Phase 1 Complete ✅ | Currently: 10 facilities live | Target: 661 facilities

📚 **Quick Links**:
- 🚀 [Data Collection Quick Start](QUICK-START-DATA-COLLECTION.md) - Scale to 661 facilities
- 🔧 [Google Places API Setup](GOOGLE-PLACES-API-SETUP.md) - Get started in 10 minutes
- 📊 [Complete Data Collection Plan](DATA-COLLECTION-PLAN.md) - 4-week execution plan
- 💡 [Development Skills Guide](SKILLS.md) - Best practices for OASARA

## Features

- **Interactive Global Map**: Explore 661 JCI-certified facilities across 30+ countries
- **Advanced Search & Filtering**: Search by procedure, location, specialty, or Zano payment acceptance
- **Price Transparency**: Compare procedure costs across countries with real pricing data
- **Privacy-First**: No tracking, no cookies, zero-knowledge architecture
- **Zano Integration**: Request facilities to accept Zano cryptocurrency payments
- **Beautiful Dark UI**: Glass morphism design with premium animations

## Tech Stack

- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Map**: Mapbox GL JS with custom dark theme
- **Database**: Supabase (PostgreSQL)
- **Hosting**: Netlify
- **Email**: EmailJS for facility outreach
- **Animations**: Framer Motion
- **State Management**: TanStack Query (React Query)

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Supabase account
- Mapbox account
- EmailJS account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/oasara-marketplace.git
cd oasara-marketplace
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file based on `.env.example`:
```bash
cp .env.example .env.local
```

Fill in your credentials:
```
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_anon_key
REACT_APP_MAPBOX_TOKEN=your_mapbox_token
REACT_APP_EMAILJS_SERVICE_ID=your_emailjs_service_id
REACT_APP_EMAILJS_TEMPLATE_ID=your_emailjs_template_id
REACT_APP_EMAILJS_PUBLIC_KEY=your_emailjs_public_key
```

4. Set up Supabase database:
   - Create a new Supabase project
   - Run the SQL schema from `database/schema.sql`
   - Run the seed data from `database/seeds/initial-facilities.sql`

5. Start the development server:
```bash
npm start
```

Visit [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
oasara-marketplace/
├── src/
│   ├── components/
│   │   ├── Map/
│   │   │   └── GlobalFacilityMap.tsx    # Interactive Mapbox map
│   │   ├── Cards/
│   │   │   └── FacilityCard.tsx         # Glass morphism facility cards
│   │   ├── Search/
│   │   │   └── ProcedureSearch.tsx      # Search component
│   │   ├── Filters/
│   │   │   ├── CountryFilter.tsx        # Country filter dropdown
│   │   │   ├── SpecialtyFilter.tsx      # Specialty filter dropdown
│   │   │   └── ZanoFilter.tsx           # Zano-only toggle
│   │   └── Outreach/
│   │       └── RequestZanoButton.tsx    # Zano payment request
│   ├── lib/
│   │   └── supabase.ts                  # Supabase client & types
│   ├── App.tsx                          # Main application
│   └── index.css                        # Tailwind + custom styles
├── database/
│   ├── schema.sql                       # Database schema
│   └── seeds/
│       └── initial-facilities.sql       # Seed data (50 facilities)
├── netlify.toml                         # Netlify configuration
└── tailwind.config.js                   # Tailwind configuration

```

## Deployment

### Deploy to Netlify

1. Push your code to GitHub

2. Connect your repository to Netlify:
   - Go to [Netlify](https://netlify.com)
   - Click "New site from Git"
   - Select your repository
   - Build settings are auto-detected from `netlify.toml`

3. Add environment variables in Netlify:
   - Go to Site settings > Environment variables
   - Add all variables from `.env.local`

4. Deploy:
```bash
npm run deploy
```

Or push to your main branch for automatic deployment.

## Brand Guidelines

### Color Palette
- **Ignition Amber**: `#D97925` - Primary CTA color
- **Champagne Gold**: `#D4AF37` - Accent color
- **Warm Clay**: `#C17754` - Secondary accent
- **Deep Teal**: `#0B697A` - Trust elements
- **Cream**: `#FFF8F0` - Text color
- **Desert Sand**: `#E5D4B8` - Subtle backgrounds
- **Dark Base**: `#0A0A0A` - Background

### Typography
- **Headers**: Playfair Display (serif)
- **Body**: Open Sans (sans-serif)

### Design Principles
- Always dark mode
- Glass morphism on all cards
- Subtle animations on all interactive elements
- Premium feel (think private jet healthcare, not hospital)
- Organic layouts (river deltas, not rigid grids)

## Database Schema

### Facilities Table
```sql
CREATE TABLE facilities (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  city TEXT NOT NULL,
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  jci_accredited BOOLEAN,
  specialties TEXT[],
  languages TEXT[],
  google_rating DECIMAL(2, 1),
  review_count INTEGER,
  accepts_zano BOOLEAN,
  contact_email TEXT,
  airport_distance TEXT,
  popular_procedures JSONB
);
```

### Zano Requests Table
```sql
CREATE TABLE zano_requests (
  id UUID PRIMARY KEY,
  facility_id UUID REFERENCES facilities(id),
  requested_at TIMESTAMP,
  user_email TEXT,
  status TEXT
);
```

## API Usage

### Fetching Facilities
```typescript
import { getFacilities } from './lib/supabase';

const facilities = await getFacilities({
  country: 'Thailand',
  specialty: 'Cardiology',
  acceptsZano: true
});
```

### Requesting Zano Payment
```typescript
import { requestZanoPayment } from './lib/supabase';

await requestZanoPayment(facilityId, 'user@example.com');
```

## Contributing

This is a sovereign project. Contributions are welcome but will be reviewed through the lens of medical sovereignty and privacy preservation.

## Privacy Policy

- No tracking or analytics
- No cookies except essential
- All patient data encrypted
- Zero-knowledge architecture
- Facility emails only for Zano requests

## License

MIT License - See LICENSE file for details

## Support

For questions or support, please open an issue on GitHub.

---

Built with medical sovereignty in mind. Powered by [Zano](https://zano.org).
