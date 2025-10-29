# OASARA Deployment Guide

This guide walks you through deploying OASARA to production using Netlify, Supabase, and other services.

## Prerequisites Checklist

Before deploying, make sure you have accounts for:

- [ ] GitHub account
- [ ] Netlify account
- [ ] Supabase account
- [ ] Mapbox account (free tier works)
- [ ] EmailJS account (free tier works)

## Step 1: Set Up Supabase Database

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose organization and project name: `oasara-marketplace`
4. Set a secure database password
5. Choose a region close to your target users
6. Wait for project to be created (~2 minutes)

### 1.2 Run Database Schema

1. In your Supabase dashboard, go to SQL Editor
2. Open the file `/database/schema.sql` from this project
3. Copy and paste the entire contents
4. Click "Run" to execute the SQL
5. Verify tables were created in the Table Editor

### 1.3 Seed Initial Data

1. Still in SQL Editor, create a new query
2. Open `/database/seeds/initial-facilities.sql`
3. Copy and paste the contents
4. Click "Run" to insert initial 50 facilities
5. Verify data in Table Editor > facilities table

### 1.4 Get API Credentials

1. Go to Project Settings > API
2. Copy your `Project URL` - this is `REACT_APP_SUPABASE_URL`
3. Copy your `anon/public` key - this is `REACT_APP_SUPABASE_ANON_KEY`
4. Save these for later

## Step 2: Set Up Mapbox

### 2.1 Create Mapbox Account

1. Go to [mapbox.com](https://mapbox.com)
2. Sign up for free account (100,000 map loads/month free)
3. Verify your email

### 2.2 Get Access Token

1. Go to Account > Tokens
2. Copy your "Default public token"
3. This is your `REACT_APP_MAPBOX_TOKEN`
4. Save this for later

## Step 3: Set Up EmailJS

### 3.1 Create EmailJS Account

1. Go to [emailjs.com](https://emailjs.com)
2. Sign up for free account (200 emails/month free)
3. Verify your email

### 3.2 Create Email Service

1. In dashboard, go to "Email Services"
2. Click "Add New Service"
3. Choose your email provider (Gmail recommended)
4. Follow setup instructions to connect your email
5. Copy your Service ID - this is `REACT_APP_EMAILJS_SERVICE_ID`

### 3.3 Create Email Template

1. Go to "Email Templates"
2. Click "Create New Template"
3. Name it "Zano Payment Request"
4. Use this template:

```
Subject: Request to Accept Zano Cryptocurrency Payment

To {{facility_name}} in {{facility_city}}, {{facility_country}},

{{message}}

Best regards,
OASARA Medical Marketplace
```

5. Copy your Template ID - this is `REACT_APP_EMAILJS_TEMPLATE_ID`

### 3.4 Get Public Key

1. Go to Account > General
2. Copy your Public Key - this is `REACT_APP_EMAILJS_PUBLIC_KEY`

## Step 4: Set Up GitHub Repository

### 4.1 Initialize Git (if not already done)

```bash
cd oasara-marketplace
git init
git add .
git commit -m "Initial commit: OASARA Phase 1"
```

### 4.2 Create GitHub Repository

1. Go to [github.com](https://github.com)
2. Click "New Repository"
3. Name: `oasara-marketplace`
4. Description: "Privacy-preserving medical tourism marketplace"
5. Keep it private (or public if you prefer)
6. DON'T initialize with README (we already have one)
7. Click "Create Repository"

### 4.3 Push to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/oasara-marketplace.git
git branch -M main
git push -u origin main
```

## Step 5: Deploy to Netlify

### 5.1 Connect Repository

1. Go to [netlify.com](https://netlify.com)
2. Click "Add new site" > "Import an existing project"
3. Choose "GitHub"
4. Authorize Netlify to access your repositories
5. Select `oasara-marketplace`

### 5.2 Configure Build Settings

Netlify should auto-detect settings from `netlify.toml`, but verify:

- **Build command**: `npm run build`
- **Publish directory**: `build`
- **Production branch**: `main`

### 5.3 Add Environment Variables

Before deploying, add all environment variables:

1. Go to Site settings > Environment variables
2. Add each variable:

```
REACT_APP_SUPABASE_URL = [your Supabase URL]
REACT_APP_SUPABASE_ANON_KEY = [your Supabase anon key]
REACT_APP_MAPBOX_TOKEN = [your Mapbox token]
REACT_APP_EMAILJS_SERVICE_ID = [your EmailJS service ID]
REACT_APP_EMAILJS_TEMPLATE_ID = [your EmailJS template ID]
REACT_APP_EMAILJS_PUBLIC_KEY = [your EmailJS public key]
```

### 5.4 Deploy

1. Click "Deploy site"
2. Wait for build to complete (~2-3 minutes)
3. Your site will be live at `https://random-name.netlify.app`

### 5.5 Custom Domain (Optional)

1. Go to Site settings > Domain management
2. Click "Add custom domain"
3. Enter your domain (e.g., `oasara.com`)
4. Follow DNS configuration instructions
5. Netlify will auto-provision SSL certificate

## Step 6: Verify Deployment

### 6.1 Test Core Features

Visit your deployed site and test:

- [ ] Map loads with facilities
- [ ] Search works
- [ ] Filters work (Country, Specialty, Zano)
- [ ] Facility cards display correctly
- [ ] Click on facility updates map
- [ ] "Request Zano" button works
- [ ] Email is sent (check facility email)

### 6.2 Check Performance

1. Open Chrome DevTools
2. Go to Lighthouse tab
3. Run audit
4. Aim for:
   - Performance: 90+
   - Accessibility: 90+
   - Best Practices: 90+
   - SEO: 90+

## Step 7: Ongoing Maintenance

### 7.1 Adding More Facilities

1. Go to Supabase dashboard
2. Table Editor > facilities
3. Click "Insert row"
4. Fill in facility data
5. Changes are live immediately

### 7.2 Monitoring Zano Requests

1. Go to Supabase dashboard
2. Table Editor > zano_requests
3. View all requests
4. Track which facilities are being contacted

### 7.3 Updating Code

```bash
git add .
git commit -m "Your update message"
git push origin main
```

Netlify will auto-deploy on push to main branch.

## Troubleshooting

### Build Fails on Netlify

- Check build logs for specific errors
- Verify all environment variables are set
- Make sure all dependencies are in `package.json`
- Try building locally first: `npm run build`

### Map Not Loading

- Verify Mapbox token is correct
- Check browser console for errors
- Ensure token has proper scopes
- Check Mapbox account usage limits

### Supabase Connection Errors

- Verify URL and anon key are correct
- Check Supabase project is not paused
- Verify Row Level Security policies are set
- Check browser console for CORS errors

### Email Not Sending

- Verify all EmailJS credentials
- Check EmailJS dashboard for errors
- Verify email service is connected
- Check email spam folder

## Security Notes

- Never commit `.env.local` to GitHub
- Rotate API keys if accidentally exposed
- Monitor Supabase for unusual activity
- Keep dependencies updated
- Review Netlify deployment logs regularly

## Cost Estimates

With free tiers:
- **Netlify**: Free (100GB bandwidth/month)
- **Supabase**: Free (500MB database, 2GB bandwidth)
- **Mapbox**: Free (100,000 map loads/month)
- **EmailJS**: Free (200 emails/month)

**Total monthly cost for Phase 1: $0**

When you need to scale:
- Netlify Pro: $19/month (more bandwidth)
- Supabase Pro: $25/month (8GB database)
- Mapbox Pay-as-you-go: ~$5/50k loads
- EmailJS: $10/month (1000 emails)

## Next Steps

Once Phase 1 is live:

1. **Monitor Analytics**: Track facility requests
2. **Gather Feedback**: Talk to users
3. **Add More Facilities**: Expand to all 661 JCI facilities
4. **Provider Onboarding**: Begin Phase 2
5. **Zano Integration**: Implement actual Zano payments

## Support

If you run into issues:

1. Check Netlify build logs
2. Check browser console
3. Review Supabase logs
4. Open an issue on GitHub

---

Built with medical sovereignty in mind. Powered by [Zano](https://zano.org).
