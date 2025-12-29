# Oasara Monitoring - Quick Start Guide

## Installation (5 minutes)

```bash
# 1. Run setup script
chmod +x setup-monitoring.sh
./setup-monitoring.sh

# 2. Add Sentry DSN to .env.local
echo "REACT_APP_SENTRY_DSN=https://YOUR_DSN@sentry.io/PROJECT_ID" >> .env.local
echo "REACT_APP_ENVIRONMENT=development" >> .env.local

# 3. Test locally
npm start

# 4. Deploy
npm run deploy
```

## UptimeRobot Setup (5 minutes)

1. Go to [uptimerobot.com](https://uptimerobot.com/signup) and sign up
2. Click "Add New Monitor"
3. Create these 4 monitors:

| Name | Type | URL | Interval |
|------|------|-----|----------|
| Oasara - My Journey | HTTP(s) | `https://oasara.com/my-journey` | 5 min |
| Oasara - Journey Chat | HTTP(s) | `https://oasara.com/.netlify/functions/journey-chat` | 5 min |
| Oasara - Ask API | HTTP(s) | `https://oasara.com/.netlify/functions/oasara-ask` | 5 min |
| Oasara - Onboarding | HTTP(s) | `https://oasara.com/.netlify/functions/onboarding-chat` | 5 min |

4. Add alert contact: Settings → Alert Contacts → Add Email

## Sentry Setup (5 minutes)

1. Go to [sentry.io/signup](https://sentry.io/signup) and create account
2. Create new project:
   - Platform: React
   - Name: Oasara Marketplace
3. Copy your DSN (shown after project creation)
4. Add to Netlify:
   - Netlify Dashboard → Site Settings → Environment Variables
   - Add `REACT_APP_SENTRY_DSN` = your DSN
   - Add `REACT_APP_ENVIRONMENT` = `production`
5. Redeploy site in Netlify

## Testing (2 minutes)

### Test Sentry Error Tracking

Add this temporary button to any page:

```tsx
<button onClick={() => { throw new Error('Test Sentry Error'); }}>
  Test Error
</button>
```

Click it, then check Sentry dashboard for the error.

### Test UptimeRobot

Wait 5 minutes, then check UptimeRobot dashboard. All monitors should show green (up).

## Dashboards

| Service | URL | Purpose |
|---------|-----|---------|
| UptimeRobot | [dashboard](https://uptimerobot.com/dashboard) | Uptime monitoring |
| Sentry | [dashboard](https://sentry.io) | Error tracking |
| Supabase | [dashboard](https://supabase.com/dashboard) | Database metrics |
| Netlify | [dashboard](https://app.netlify.com) | Deployment logs |

## Weekly Checklist

Every Monday:
- [ ] Check UptimeRobot: Any downtime last week?
- [ ] Review Sentry: Any new error patterns?
- [ ] Check Supabase: Any slow queries (>200ms)?
- [ ] Test key user flow: Onboarding → My Journey → Shortlist

## Common Issues

**Error: Sentry not capturing errors**
- Check: Is `REACT_APP_SENTRY_DSN` set in Netlify?
- Check: Is environment set to `production`?
- Verify: Look for `[Sentry] Skipping initialization` in browser console

**Error: UptimeRobot showing false alarms**
- Increase check interval to 10 minutes
- Add keyword monitoring (look for "Oasara" in page body)
- Check: Is Netlify having issues? (status.netlify.com)

**Error: Slow database queries**
- Go to Supabase → Database → Logs
- Filter: `duration > 200`
- Solution: Usually need to add an index

## Complete Documentation

See `/Users/aaronday/Documents/CTO/projects/oasara/MONITORING_SETUP.md` for:
- Detailed runbooks
- Alert thresholds
- Incident response procedures
- Supabase optimization guide
