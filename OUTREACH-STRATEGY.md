# OASARA Facility Outreach Strategy

## Why Direct Partnerships Beat Web Scraping

Medical tourism requires **trust and verification**. Scraped data is:
- Legally risky
- Technically fragile
- Often inaccurate
- Not verifiable

**Instead**: Build direct relationships with 512 facilities who already have websites.

## Phase 1: Email Outreach Campaign (Week 1-2)

### Email Template for Facilities

**Subject**: "List Your Facility on OASARA - Accept Zano Cryptocurrency Payments"

**Body**:
```
Dear [Facility Name] International Patient Department,

We're building OASARA (www.oasara.com), a privacy-preserving medical tourism
marketplace featuring 518 JCI-accredited facilities globally.

Your facility is already listed with basic information. We'd like to feature you
more prominently with:

✓ Verified doctor profiles
✓ Accurate procedure pricing
✓ Patient testimonials
✓ High-resolution facility photos
✓ Ability to accept Zano cryptocurrency payments (privacy-preserving, instant settlement)

This listing is FREE. We only ask that you:
1. Verify your facility information
2. Provide 2-3 doctor profiles (name, specialty, credentials)
3. Share pricing for your top 5 procedures
4. Consider accepting Zano for international patients

Interested facilities get priority placement and a "Verified Partner" badge.

Reply with "YES" if you'd like to participate.

Best regards,
OASARA Team
Medical Tourism Marketplace
```

### Outreach Execution

**Tools needed**:
```bash
npm install nodemailer
```

**Script**: `/scripts/sendOutreachEmails.js`
```javascript
const nodemailer = require('nodemailer');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.OUTREACH_EMAIL,
    pass: process.env.OUTREACH_PASSWORD
  }
});

async function sendOutreachEmails() {
  // Get facilities with contact info
  const { data: facilities } = await supabase
    .from('facilities')
    .select('*')
    .not('contact_email_primary', 'is', null)
    .limit(50); // Start with 50 per day

  for (const facility of facilities) {
    const emailContent = {
      from: 'partnerships@oasara.com',
      to: facility.contact_email_primary,
      subject: `List ${facility.name} on OASARA - Accept Zano Payments`,
      html: `
        <p>Dear ${facility.name} Team,</p>

        <p>We're building OASARA, a medical tourism marketplace featuring
        518 JCI-accredited facilities.</p>

        <p><strong>Your facility is already listed:</strong><br>
        ${facility.website}</p>

        <p>We'd like to upgrade your listing with verified information:</p>
        <ul>
          <li>✓ Doctor profiles with credentials</li>
          <li>✓ Accurate procedure pricing</li>
          <li>✓ Patient testimonials</li>
          <li>✓ Zano cryptocurrency payment option</li>
        </ul>

        <p><strong>This is FREE.</strong> Reply "YES" to participate.</p>

        <p>Best regards,<br>
        OASARA Team</p>
      `
    };

    try {
      await transporter.sendMail(emailContent);

      // Log outreach
      await supabase
        .from('facility_outreach')
        .insert({
          facility_id: facility.id,
          outreach_date: new Date(),
          email_sent: true,
          status: 'sent'
        });

      console.log(`✅ Sent to ${facility.name}`);

      // Rate limit: 1 email per 10 seconds
      await new Promise(resolve => setTimeout(resolve, 10000));
    } catch (error) {
      console.error(`❌ Failed to send to ${facility.name}:`, error);
    }
  }
}

sendOutreachEmails();
```

## Phase 2: Response Handling (Week 2-4)

**Create facility portal for easy data submission**:

1. Generate unique submission link per facility
2. Simple form with fields:
   - Doctor names, specialties, years of experience
   - Top 5 procedure prices (verified by facility)
   - 2-3 patient testimonials (with consent)
   - High-res photos (logo, facility exterior, treatment rooms)
3. Auto-updates database when submitted

**Expected Response Rate**: 5-10% (25-50 facilities respond)

## Phase 3: Manual Phone Follow-up (Week 3-6)

For high-value facilities (popular specialties, good locations):
- Call using phone numbers we collected (512 facilities have phones)
- Speak to International Patient Coordinator
- Walk through partnership benefits
- Schedule video call if interested

**Target**: 10-20 "Champion Facilities" with full verified data

## Data We Actually Need (Verified by Facility)

### Tier 1 Data (Essential):
- ✓ 3-5 top doctors (name, specialty, credentials)
- ✓ 5-10 procedure prices (verified, all-inclusive)
- ✓ Languages spoken by staff
- ✓ Accepts Zano payment? (Yes/No)

### Tier 2 Data (Nice to Have):
- Patient testimonials (with consent)
- Facility photos (high-res)
- Typical wait times
- Package deals
- Airport transfer service

### Tier 3 Data (Premium Partners):
- Live availability calendar
- Direct booking integration
- Video consultations
- Dedicated Zano wallet address

## Tracking & Metrics

**Database Schema**:
```sql
CREATE TABLE facility_outreach (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_id UUID REFERENCES facilities(id),
  outreach_date TIMESTAMP,
  email_sent BOOLEAN DEFAULT false,
  email_opened BOOLEAN DEFAULT false,
  responded BOOLEAN DEFAULT false,
  response_date TIMESTAMP,
  status TEXT, -- 'sent', 'opened', 'responded', 'verified', 'declined'
  notes TEXT,
  partnership_tier TEXT -- 'basic', 'verified', 'premium'
);

CREATE TABLE verified_facility_data (
  facility_id UUID PRIMARY KEY REFERENCES facilities(id),
  verified_doctors JSONB,
  verified_pricing JSONB,
  verified_testimonials JSONB,
  verification_date TIMESTAMP,
  verified_by TEXT
);
```

## Why This Approach Works

1. **Legal**: Facilities provide data with consent
2. **Accurate**: Data verified by facility, not scraped
3. **Trustworthy**: Shows "Verified by Facility" badge
4. **Scalable**: Start with 50 facilities, expand to 200+
5. **Relationship-building**: Opens door for Zano adoption

## Success Metrics

**Week 1-2**:
- 100 emails sent
- 5-10 responses
- 2-3 facilities verified

**Week 3-4**:
- 200 emails sent
- 15-20 responses
- 5-10 facilities verified

**Week 5-8**:
- 500 emails sent
- 30-50 responses
- 15-25 facilities fully verified
- 3-5 accepting Zano

## Budget

- Email service: $0 (Gmail free tier)
- Phone calls: ~$50 (Skype international minutes)
- Time investment: 2-3 hours/day
- **Total**: $50 vs $0 for scraping (but legal and accurate)

## Next Steps

1. **Install Nodemailer**: `npm install nodemailer`
2. **Set up outreach email**: Create partnerships@oasara.com
3. **Create email template**: Customize for your brand
4. **Extract contact emails**: Run extract-emails.js (already built)
5. **Start small**: Send 10 emails manually, test response
6. **Scale up**: Automate to 50/day once template works
7. **Track responses**: Use facility_outreach table
8. **Follow up**: Call interested facilities

This is how successful medical tourism platforms actually work - not by scraping, but by building trust.
