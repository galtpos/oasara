# OASARA Deployment Checklist

Print this or keep it open while deploying. Check off each item as you complete it.

---

## Pre-Deployment (5 minutes)

- [ ] Read through SETUP-INSTRUCTIONS.md
- [ ] Have a browser ready
- [ ] Have Terminal open to: `/Users/aaronday/Documents/medicaltourism/oasara-marketplace`
- [ ] Have a text file ready to save API keys

---

## Step 1: Supabase Setup (10 minutes)

- [ ] Go to https://supabase.com
- [ ] Sign up / Sign in
- [ ] Create new project named "oasara-marketplace"
- [ ] Wait for project to initialize
- [ ] Copy Project URL → Save in text file
- [ ] Copy anon/public key → Save in text file
- [ ] Open SQL Editor
- [ ] Paste contents of `database/schema.sql`
- [ ] Run the schema SQL
- [ ] Paste contents of `database/seeds/initial-facilities.sql`
- [ ] Run the seed SQL
- [ ] Verify 50 facilities in Table Editor
- [ ] ✅ Supabase complete!

**Saved:**
- Supabase URL: ________________
- Supabase Key: ________________

---

## Step 2: Mapbox Setup (5 minutes)

- [ ] Go to https://account.mapbox.com/auth/signup/
- [ ] Sign up / Sign in
- [ ] Copy "Default public token" from Account page
- [ ] Save token in text file
- [ ] ✅ Mapbox complete!

**Saved:**
- Mapbox Token: ________________

---

## Step 3: EmailJS Setup (10 minutes)

- [ ] Go to https://dashboard.emailjs.com/sign-up
- [ ] Sign up / Sign in
- [ ] Add Email Service (choose Gmail)
- [ ] Connect your Gmail account
- [ ] Copy Service ID → Save in text file
- [ ] Create new Email Template
- [ ] Name it "Zano Payment Request"
- [ ] Paste template from SETUP-INSTRUCTIONS.md
- [ ] Save template
- [ ] Copy Template ID → Save in text file
- [ ] Go to Account > General
- [ ] Copy Public Key → Save in text file
- [ ] ✅ EmailJS complete!

**Saved:**
- Service ID: ________________
- Template ID: ________________
- Public Key: ________________

---

## Step 4: Configure Environment (2 minutes)

- [ ] Open Terminal
- [ ] Navigate to: `cd /Users/aaronday/Documents/medicaltourism/oasara-marketplace`
- [ ] Run: `nano .env.local`
- [ ] Replace ALL values with your saved credentials
- [ ] Save file (Ctrl+X, Y, Enter)
- [ ] ✅ Environment configured!

---

## Step 5: Test Locally (5 minutes)

- [ ] Run: `npm start`
- [ ] Browser opens to localhost:3000
- [ ] Map loads with facilities ✓
- [ ] Click facility marker - popup shows ✓
- [ ] Search for "Bangkok" - filters work ✓
- [ ] Country filter works ✓
- [ ] Click facility card - map flies to it ✓
- [ ] Click "Request Zano" button ✓
- [ ] Enter email and send ✓
- [ ] Check email inbox for test email ✓
- [ ] Stop server (Ctrl+C)
- [ ] ✅ Local testing complete!

---

## Step 6: GitHub Setup (5 minutes)

- [ ] Go to https://github.com/new
- [ ] Repository name: "oasara-marketplace"
- [ ] Choose Private
- [ ] DO NOT add README
- [ ] Create repository
- [ ] Copy the repository URL
- [ ] In Terminal, run:
  ```bash
  git add .
  git commit -m "Initial commit: OASARA Phase 1"
  git remote add origin [YOUR_REPO_URL]
  git branch -M main
  git push -u origin main
  ```
- [ ] Enter GitHub credentials when prompted
- [ ] Refresh GitHub page - code should be there
- [ ] ✅ GitHub complete!

---

## Step 7: Netlify Deploy (10 minutes)

- [ ] Go to https://app.netlify.com/signup
- [ ] Sign up with GitHub
- [ ] Click "Add new site" > "Import an existing project"
- [ ] Choose GitHub
- [ ] Select "oasara-marketplace" repository
- [ ] Build settings auto-detected (verify: `npm run build` and `build`)
- [ ] Click "Show advanced"
- [ ] Add environment variables (all 6):
  - [ ] REACT_APP_SUPABASE_URL
  - [ ] REACT_APP_SUPABASE_ANON_KEY
  - [ ] REACT_APP_MAPBOX_TOKEN
  - [ ] REACT_APP_EMAILJS_SERVICE_ID
  - [ ] REACT_APP_EMAILJS_TEMPLATE_ID
  - [ ] REACT_APP_EMAILJS_PUBLIC_KEY
- [ ] Click "Deploy site"
- [ ] Wait for build to complete (2-3 minutes)
- [ ] Build successful (green checkmark) ✓
- [ ] Copy your site URL
- [ ] ✅ Deployed to Netlify!

**Your Live URL:** ________________

---

## Step 8: Test Live Site (5 minutes)

- [ ] Open your Netlify URL in browser
- [ ] Map loads properly ✓
- [ ] Facilities display correctly ✓
- [ ] Search works ✓
- [ ] Filters work ✓
- [ ] Facility cards look good ✓
- [ ] Click "Request Zano" and test email ✓
- [ ] Test on mobile phone ✓
- [ ] ✅ Live site working!

---

## Step 9: Final Checks (5 minutes)

- [ ] Open browser DevTools Console - no errors ✓
- [ ] Check Netlify deploy logs - all green ✓
- [ ] Check Supabase logs - queries working ✓
- [ ] Test from different device/network ✓
- [ ] Share URL with a friend for feedback ✓
- [ ] ✅ Everything working!

---

## Optional: Custom Domain

- [ ] Purchase domain (e.g., oasara.com)
- [ ] In Netlify: Domain settings > Add custom domain
- [ ] Enter your domain
- [ ] Update DNS records at domain registrar
- [ ] Wait for DNS propagation (5-60 minutes)
- [ ] Netlify auto-provisions SSL certificate
- [ ] ✅ Custom domain live!

**Your Domain:** ________________

---

## Post-Launch Tasks

### Today
- [ ] Share site with 3 people for feedback
- [ ] Monitor Netlify logs for any errors
- [ ] Check Supabase for any issues
- [ ] Document any bugs found

### This Week
- [ ] Add 10 more facilities to database
- [ ] Gather user feedback
- [ ] Make minor UI improvements
- [ ] Test all email functionality

### This Month
- [ ] Expand to 100+ facilities
- [ ] Reach out to facilities about Zano
- [ ] Track which procedures are most searched
- [ ] Plan Phase 2 features

---

## Success! 🎉

**Your live medical tourism marketplace is ready!**

- **Live URL:** [Your URL]
- **Facilities:** 50 (expand to 661)
- **Cost:** $0/month (free tiers)
- **Status:** LIVE & ACCEPTING USERS

### Share Your Success!

Tweet about it, share with friends, or email:
"Just launched OASARA - a privacy-preserving medical tourism marketplace connecting patients with 661+ JCI-certified facilities globally! Check it out: [your URL]"

---

## Quick Reference: Dashboards

- **Live Site:** [Your Netlify URL]
- **Netlify Dashboard:** https://app.netlify.com
- **Supabase Dashboard:** https://app.supabase.com
- **GitHub Repo:** https://github.com/[username]/oasara-marketplace
- **EmailJS Dashboard:** https://dashboard.emailjs.com
- **Mapbox Dashboard:** https://account.mapbox.com

---

## Need Help?

1. Check SETUP-INSTRUCTIONS.md for detailed steps
2. Check browser console for errors
3. Review Netlify deploy logs
4. Check Supabase logs
5. Refer to README.md or DEPLOYMENT.md

---

Built with medical sovereignty in mind. Powered by [Zano](https://zano.org).
