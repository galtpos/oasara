# Email Deliverability Quick Start Guide

**For**: Fast implementation (skip detailed docs)
**Time**: 30 minutes
**Audience**: Developers familiar with DNS and Supabase

---

## TL;DR

1. Add 3 DNS records (SPF, DKIM, DMARC)
2. Configure Supabase SMTP to use Resend
3. Update email template
4. Test with `node scripts/test-magic-link.js`

**Result**: Magic links delivered to inbox, not spam.

---

## Step 1: DNS Records (10 minutes)

Go to your DNS provider (Netlify/Cloudflare) and add:

### SPF
```
Type:  TXT
Name:  @
Value: v=spf1 include:_spf.resend.com ~all
```

### DKIM (Get from Resend)
```
Type:  CNAME
Name:  resend._domainkey
Value: [Get from https://resend.com/domains after adding oasara.com]
```

### DMARC
```
Type:  TXT
Name:  _dmarc
Value: v=DMARC1; p=none; rua=mailto:dmarc@oasara.com; pct=100
```

**Verify after 30 minutes**:
```bash
dig +short TXT oasara.com | grep spf
dig +short CNAME resend._domainkey.oasara.com
dig +short TXT _dmarc.oasara.com
```

---

## Step 2: Supabase SMTP (5 minutes)

Go to: https://supabase.com/dashboard/project/whklrclzrtijneqdjmiy/settings/auth

**Enable Custom SMTP** and enter:
```
Host:     smtp.resend.com
Port:     465
User:     resend
Password: re_jYW8DLLv_HcVhcRvHcBmyZ9Z64NbJZtm3
From:     noreply@oasara.com
Name:     Oasara Health
```

---

## Step 3: Email Template (10 minutes)

Go to: https://supabase.com/dashboard/project/whklrclzrtijneqdjmiy/auth/templates

Click **Magic Link**, replace with branded template from `EMAIL_DELIVERABILITY_IMPLEMENTATION.md` (Step 4).

**Or use this minimal version**:

```html
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: Arial, sans-serif; background: #f9fafb; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden;">
    <div style="background: linear-gradient(135deg, #2563eb, #1e40af); padding: 40px; text-align: center;">
      <h1 style="color: white; margin: 0;">Oasara Health</h1>
      <p style="color: #dbeafe; margin: 10px 0 0;">Healthcare Without Borders</p>
    </div>
    <div style="padding: 40px;">
      <h2>Sign In to Your Account</h2>
      <p>Click the button below to securely sign in. This link expires in 1 hour.</p>
      <a href="{{ .ConfirmationURL }}" style="display: inline-block; margin: 20px 0; padding: 14px 32px; background: #2563eb; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">Sign In to Oasara</a>
      <p style="color: #6b7280; font-size: 14px;">If you didn't request this, you can safely ignore it.</p>
    </div>
    <div style="background: #f9fafb; padding: 20px; text-align: center; font-size: 13px; color: #6b7280;">
      © 2025 Oasara Health · <a href="https://oasara.com">oasara.com</a>
    </div>
  </div>
</body>
</html>
```

---

## Step 4: Test (5 minutes)

```bash
cd /Users/aaronday/Documents/medicaltourism/oasara-marketplace

# Update test emails in scripts/test-magic-link.js
# Replace example.com addresses with real test emails

node scripts/test-magic-link.js
```

**Check inboxes** (including spam folders) for:
- Gmail
- Outlook
- Yahoo
- ProtonMail

**Target**: >90% inbox placement

---

## Verify Success

### DNS
```bash
# All should return values
dig +short TXT oasara.com | grep spf
dig +short CNAME resend._domainkey.oasara.com
dig +short TXT _dmarc.oasara.com
```

### Resend
- Visit: https://resend.com/domains/oasara.com
- Status: ✅ Verified (green checkmark)

### Supabase
- Auth logs: https://supabase.com/dashboard/project/whklrclzrtijneqdjmiy/logs/auth-logs
- No SMTP errors

### Email Quality
- Inbox placement: >90%
- Spam score (mail-tester.com): >8/10
- Load time: <2 seconds

---

## If Issues Occur

### Emails Not Sending
```bash
# Check Supabase auth logs for SMTP errors
# Verify SMTP credentials are correct
# Test Resend API key is active
```

### Emails Going to Spam
```bash
# Wait 24 hours for DNS propagation
# Check spam score: Forward email to check@mail-tester.com
# Verify DNS records: All 3 must be active
```

### DNS Not Propagating
```bash
# Flush local DNS cache
sudo dscacheutil -flushcache

# Check with public DNS
dig @8.8.8.8 TXT oasara.com | grep spf
```

---

## Rollback (if needed)

1. Go to: https://supabase.com/dashboard/project/whklrclzrtijneqdjmiy/settings/auth
2. Toggle: "Enable Custom SMTP" → OFF
3. Reverts to Supabase default SMTP immediately

---

## Monitoring

**Daily** (first week):
- Resend dashboard: https://resend.com/logs
- Delivery rate target: >98%

**Weekly**:
- Google Postmaster: https://postmaster.google.com/
- Domain reputation: "Good"

**Monthly**:
- MXToolbox blacklist: https://mxtoolbox.com/blacklists.aspx
- DMARC reports: Check dmarc@oasara.com inbox

---

## Resources

**Full Documentation**:
- Implementation Guide: `EMAIL_DELIVERABILITY_IMPLEMENTATION.md`
- DNS Details: `DNS_CONFIGURATION.md`
- Deployment Checklist: `EMAIL_DEPLOYMENT_CHECKLIST.md`

**External Tools**:
- Resend Dashboard: https://resend.com/
- Supabase Dashboard: https://supabase.com/dashboard/project/whklrclzrtijneqdjmiy
- Mail Tester: https://www.mail-tester.com/
- MXToolbox: https://mxtoolbox.com/

**Support**:
- Resend Docs: https://resend.com/docs
- Supabase Auth: https://supabase.com/docs/guides/auth/auth-smtp

---

**Done!** Magic links should now deliver reliably to user inboxes.

**Next**: See `EMAIL_DELIVERABILITY_IMPLEMENTATION.md` for Week 3+ enhancements (transactional emails, analytics, etc.)
