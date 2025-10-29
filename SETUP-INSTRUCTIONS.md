# OASARA Live Deployment - Step by Step

Follow these steps **in order** to make OASARA live. Each step takes 5-10 minutes.

## Step 1: Create Supabase Project (10 minutes)

### 1.1 Sign Up
1. Open browser and go to: **https://supabase.com**
2. Click "Start your project"
3. Sign up with GitHub (recommended) or email
4. Verify your email if needed

### 1.2 Create Project
1. Click "New Project"
2. Fill in:
   - **Name**: `oasara-marketplace`
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose closest to your users (e.g., US West, EU Central)
3. Click "Create new project"
4. Wait ~2 minutes for project to initialize

### 1.3 Get API Credentials
1. Go to **Project Settings** (gear icon in sidebar)
2. Click **API** in the left menu
3. You'll see:
   - **Project URL**: Copy this (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key**: Copy this (long string starting with `eyJ...`)
4. **Save both values** - you'll need them soon!

### 1.4 Set Up Database
1. Click **SQL Editor** in the sidebar
2. Click "New query"
3. Open this file on your computer: `/Users/aaronday/Documents/medicaltourism/oasara-marketplace/database/schema.sql`
4. Copy ALL the contents
5. Paste into Supabase SQL Editor
6. Click **Run** (or press Cmd+Enter)
7. You should see "Success. No rows returned"

### 1.5 Add Initial Facilities
1. Still in SQL Editor, click "New query"
2. Open this file: `/Users/aaronday/Documents/medicaltourism/oasara-marketplace/database/seeds/initial-facilities.sql`
3. Copy ALL the contents
4. Paste into Supabase SQL Editor
5. Click **Run**
6. Should see "Success" with rows inserted

### 1.6 Verify Data
1. Click **Table Editor** in sidebar
2. Click **facilities** table
3. You should see 50 facilities listed
4. ✅ Supabase is ready!

---

## Step 2: Get Mapbox Token (5 minutes)

### 2.1 Sign Up
1. Go to: **https://account.mapbox.com/auth/signup/**
2. Sign up with email or GitHub
3. Verify your email

### 2.2 Get Token
1. After login, you'll be at the **Account** page
2. Scroll down to **Access tokens**
3. You'll see a "Default public token" already created
4. Click the **copy icon** to copy the token
5. **Save this token** - starts with `pk.`
6. ✅ Mapbox is ready!

**Note**: Free tier includes 100,000 map loads/month - plenty to start!

---

## Step 3: Set Up EmailJS (10 minutes)

### 3.1 Sign Up
1. Go to: **https://dashboard.emailjs.com/sign-up**
2. Sign up with email
3. Verify your email

### 3.2 Add Email Service
1. Click **Email Services** in sidebar
2. Click **Add New Service**
3. Choose **Gmail** (easiest) or your email provider
4. Click **Connect Account**
5. Sign in with your Gmail
6. Grant permissions
7. Your service is created - **copy the Service ID** (looks like: `service_xxxxx`)

### 3.3 Create Email Template
1. Click **Email Templates** in sidebar
2. Click **Create New Template**
3. Template Name: `Zano Payment Request`
4. In the template editor, paste this:

**Subject:**
```
Interested Patient Requesting Zano Cryptocurrency Payment Option
```

**Content:**
```
Dear {{facility_name}},

A patient has expressed interest in your medical facility and is requesting that you accept Zano cryptocurrency for payment.

{{message}}

Patient Contact: {{user_email}}

To learn more about accepting Zano:
https://zano.org

Best regards,
OASARA Medical Marketplace
https://oasara.com
```

5. Click **Save**
6. **Copy the Template ID** (looks like: `template_xxxxx`)

### 3.4 Get Public Key
1. Click **Account** (top right menu)
2. Click **General**
3. Find **Public Key**
4. **Copy the public key**
5. ✅ EmailJS is ready!

---

## Step 4: Configure Environment Variables (2 minutes)

Now add all your credentials:

1. Open Terminal
2. Navigate to project:
```bash
cd /Users/aaronday/Documents/medicaltourism/oasara-marketplace
```

3. Edit `.env.local`:
```bash
nano .env.local
```

4. Replace with your ACTUAL values:
```
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
REACT_APP_MAPBOX_TOKEN=pk.eyJ1IjoieW91ciB1c2VybmFtZSIsImEiOiJjbH...
REACT_APP_EMAILJS_SERVICE_ID=service_xxxxx
REACT_APP_EMAILJS_TEMPLATE_ID=template_xxxxx
REACT_APP_EMAILJS_PUBLIC_KEY=your_public_key
```

5. Save: Press `Ctrl+X`, then `Y`, then `Enter`
6. ✅ Environment configured!

---

## Step 5: Test Locally (5 minutes)

Make sure everything works:

```bash
# Start the dev server
npm start
```

Browser should open to `http://localhost:3000`

**Test these:**
- [ ] Map loads with facilities visible
- [ ] Click on a facility marker - popup appears
- [ ] Search for "Bangkok" - filters facilities
- [ ] Click Country filter - dropdown works
- [ ] Click on a facility card - map flies to location
- [ ] Click "Request Zano" on a non-Zano facility
- [ ] Enter your email and click Send
- [ ] Check your email - should receive test email

If everything works, press `Ctrl+C` to stop the server.

✅ Local testing complete!

---

## Step 6: Create GitHub Repository (5 minutes)

### 6.1 Create Remote Repository
1. Go to: **https://github.com/new**
2. Repository name: `oasara-marketplace`
3. Description: `Privacy-preserving medical tourism marketplace`
4. Choose **Private** (recommended initially)
5. **DO NOT** check "Add README" (we already have one)
6. Click **Create repository**

### 6.2 Push Code
```bash
cd /Users/aaronday/Documents/medicaltourism/oasara-marketplace

# Add all files
git add .

# Commit
git commit -m "Initial commit: OASARA Phase 1 complete"

# Add remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/oasara-marketplace.git

# Push to GitHub
git branch -M main
git push -u origin main
```

When prompted, enter your GitHub username and password (or personal access token).

✅ Code is on GitHub!

---

## Step 7: Deploy to Netlify (10 minutes)

### 7.1 Sign Up
1. Go to: **https://app.netlify.com/signup**
2. Click **Sign up with GitHub**
3. Authorize Netlify

### 7.2 Create New Site
1. Click **Add new site** > **Import an existing project**
2. Click **GitHub**
3. Authorize Netlify to access your repositories
4. Find and click **oasara-marketplace**

### 7.3 Configure Build Settings
Netlify should auto-detect from `netlify.toml`:
- **Build command**: `npm run build`
- **Publish directory**: `build`
- **Branch**: `main`

Click **Show advanced** and verify it looks correct.

### 7.4 Add Environment Variables
**IMPORTANT**: Before clicking Deploy!

1. Click **Show advanced**
2. Click **New variable** for each:

```
REACT_APP_SUPABASE_URL = [paste your Supabase URL]
REACT_APP_SUPABASE_ANON_KEY = [paste your Supabase key]
REACT_APP_MAPBOX_TOKEN = [paste your Mapbox token]
REACT_APP_EMAILJS_SERVICE_ID = [paste your EmailJS service ID]
REACT_APP_EMAILJS_TEMPLATE_ID = [paste your EmailJS template ID]
REACT_APP_EMAILJS_PUBLIC_KEY = [paste your EmailJS public key]
```

### 7.5 Deploy!
1. Click **Deploy site**
2. Wait 2-3 minutes for build to complete
3. Watch the deploy logs
4. When done, you'll see a URL like: `https://random-name-123.netlify.app`

### 7.6 Test Live Site
1. Click on your site URL
2. Test all features again:
   - [ ] Map loads
   - [ ] Facilities display
   - [ ] Search works
   - [ ] Filters work
   - [ ] Request Zano works

✅ **YOUR SITE IS LIVE!** 🎉

---

## Step 8: Custom Domain (Optional, 10 minutes)

### 8.1 If You Have a Domain
1. In Netlify dashboard, go to **Domain settings**
2. Click **Add custom domain**
3. Enter your domain (e.g., `oasara.com`)
4. Follow DNS configuration instructions
5. Netlify auto-provisions SSL certificate

### 8.2 If You Need a Domain
1. Buy from **Namecheap**, **Google Domains**, or **Cloudflare**
2. Popular options:
   - `oasara.com`
   - `oasara.health`
   - `oasara.io`
3. Then follow 8.1 above

---

## Troubleshooting

### Build Fails on Netlify
- Check deploy logs for specific error
- Verify all 6 environment variables are set
- Make sure no typos in variable names
- Try building locally: `npm run build`

### Map Not Loading on Live Site
- Open browser DevTools Console
- Look for Mapbox errors
- Verify Mapbox token in Netlify environment variables
- Check token hasn't expired

### Database Connection Errors
- Verify Supabase URL and key in Netlify
- Check Supabase project is active (not paused)
- Run schema.sql again in Supabase if needed

### Email Not Sending
- Check EmailJS dashboard for errors
- Verify all 3 EmailJS variables in Netlify
- Test sending from EmailJS dashboard directly
- Check spam folder

---

## You're Live! What's Next?

### Immediate (First 24 hours)
1. **Test thoroughly** - Go through every feature
2. **Check mobile** - Test on your phone
3. **Share with friends** - Get initial feedback
4. **Monitor errors** - Check Netlify logs

### Short Term (First week)
1. **Add more facilities** - Expand from 50 to 100+
2. **Gather feedback** - Talk to potential users
3. **Track metrics** - Which procedures are searched most?
4. **Reach out to facilities** - Start building relationships

### Medium Term (First month)
1. **Expand to 661 facilities** - Complete JCI database
2. **Start Zano outreach** - Contact facilities about crypto
3. **Build waiting list** - Capture interested patients
4. **Plan Phase 2** - Provider dashboard and booking

---

## Monitoring Your Site

### Netlify Dashboard
- **Deploys**: See build history
- **Functions**: View serverless function logs
- **Analytics**: Traffic stats (upgrade to Pro for more)

### Supabase Dashboard
- **Table Editor**: View/edit facilities
- **Database**: Monitor queries
- **Logs**: See API requests

### Daily Checks
- Site loads properly
- No errors in browser console
- Supabase tables accessible
- Email sending works

---

## Costs Reminder

### Current (Free Tier)
- **Total: $0/month**
- Netlify: 100GB bandwidth
- Supabase: 500MB database
- Mapbox: 100k map loads
- EmailJS: 200 emails

### When to Upgrade
- **Netlify**: When you exceed 100GB bandwidth/month
- **Supabase**: When you exceed 500MB database
- **Mapbox**: When you exceed 100k map loads/month
- **EmailJS**: When you exceed 200 emails/month

---

## Support

If you get stuck:
1. Check browser console for errors
2. Review Netlify deploy logs
3. Check this guide again
4. Open GitHub issue
5. Email support for each service

---

## Congratulations! 🎉

You've deployed a production-ready medical tourism marketplace!

**Your live site**: [Your Netlify URL]

Share it, test it, improve it, and empower medical sovereignty!

---

Built with medical sovereignty in mind. Powered by [Zano](https://zano.org).
