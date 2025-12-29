# Oasara DNS Configuration for Email Deliverability

**Domain**: oasara.com
**Email Provider**: Resend.com
**Purpose**: Enable authenticated email sending for magic links

---

## Required DNS Records

### 1. SPF (Sender Policy Framework)

**Purpose**: Authorizes Resend to send emails on behalf of oasara.com

```
Type:  TXT
Name:  @
Value: v=spf1 include:_spf.resend.com ~all
TTL:   3600
```

**Explanation**:
- `v=spf1` - SPF version 1
- `include:_spf.resend.com` - Allow Resend's servers
- `~all` - Soft fail for unauthorized servers (recommended for initial setup)

### 2. DKIM (DomainKeys Identified Mail)

**Purpose**: Cryptographically signs emails to prove they're from Resend

**Note**: Resend will provide these exact values after you add your domain. These are example formats:

**Option A: TXT Record** (Most common)
```
Type:  TXT
Name:  resend._domainkey
Value: v=DKIM1; k=rsa; p=[LONG_PUBLIC_KEY_FROM_RESEND]
TTL:   3600
```

**Option B: CNAME Record** (Simpler, recommended by Resend)
```
Type:  CNAME
Name:  resend._domainkey
Value: resend.domainkey.oasara.resend.com
TTL:   3600
```

### 3. DMARC (Domain-based Message Authentication)

**Purpose**: Tells receiving servers what to do with unauthenticated emails

```
Type:  TXT
Name:  _dmarc
Value: v=DMARC1; p=none; rua=mailto:dmarc@oasara.com; pct=100
TTL:   3600
```

**Explanation**:
- `v=DMARC1` - DMARC version 1
- `p=none` - Policy: Monitor only (recommended for first 30 days)
- `rua=mailto:dmarc@oasara.com` - Send aggregate reports here
- `pct=100` - Apply policy to 100% of emails

**Policy Options**:
- `p=none` - Monitor only (start here)
- `p=quarantine` - Send to spam if fails (after 30 days)
- `p=reject` - Reject if fails (after 90 days, high confidence)

---

## Where to Add These Records

### If Using Netlify DNS

1. Go to: https://app.netlify.com/
2. Select: **oasara** site
3. Click: **Domain settings** → **DNS settings**
4. Click: **Add new record**
5. Add each record listed above
6. Save changes

### If Using Cloudflare

1. Go to: https://dash.cloudflare.com/
2. Select: **oasara.com** domain
3. Click: **DNS** tab
4. Click: **Add record**
5. Add each record listed above
6. Cloudflare proxy: **OFF** (gray cloud) for TXT records

### If Using Domain Registrar (Namecheap, GoDaddy, etc.)

1. Log in to your domain registrar
2. Find: **DNS Management** or **Advanced DNS**
3. Add each record as shown above
4. Note: Some registrars don't support `@` as hostname:
   - Use: `oasara.com` or leave blank instead of `@`

---

## Getting DKIM Values from Resend

1. **Log in to Resend**: https://resend.com/login
2. **Go to Domains**: https://resend.com/domains
3. **Add Domain**: Click "Add Domain" button
4. **Enter**: oasara.com
5. **View Records**: Resend will show you exact DKIM values
6. **Copy Values**: Copy the DKIM record value provided
7. **Add to DNS**: Add the record to your DNS provider
8. **Verify**: Click "Verify Domain" in Resend dashboard

**Example of what Resend provides**:
```
CNAME Record:
Name:  resend._domainkey.oasara.com
Value: resend.domainkey.abc123xyz.resend.com
```

---

## DNS Propagation Time

**Typical Times**:
- **Fast**: 5-15 minutes (most DNS providers)
- **Average**: 30-60 minutes
- **Maximum**: Up to 24 hours (rare)

**Factors Affecting Speed**:
- DNS provider's TTL (Time To Live) settings
- Your ISP's DNS cache
- Geographic location of DNS servers

**How to Speed Up**:
1. Set low TTL before changes (300 seconds)
2. Use public DNS (Google: 8.8.8.8, Cloudflare: 1.1.1.1)
3. Flush your local DNS cache (see below)

---

## Verification Commands

### Check SPF Record
```bash
# Using dig (macOS/Linux)
dig +short TXT oasara.com | grep spf

# Expected output:
# "v=spf1 include:_spf.resend.com ~all"
```

### Check DKIM Record
```bash
# Using dig
dig +short TXT resend._domainkey.oasara.com

# Or with CNAME:
dig +short CNAME resend._domainkey.oasara.com

# Expected: Public key or CNAME target
```

### Check DMARC Record
```bash
# Using dig
dig +short TXT _dmarc.oasara.com

# Expected output:
# "v=DMARC1; p=none; rua=mailto:dmarc@oasara.com; pct=100"
```

### Online Verification Tools

**MXToolbox** (Comprehensive)
```
https://mxtoolbox.com/SuperTool.aspx?action=spf%3aoasara.com
https://mxtoolbox.com/dkim.aspx
https://mxtoolbox.com/dmarc.aspx
```

**Google Admin Toolbox** (Detailed)
```
https://toolbox.googleapps.com/apps/checkmx/check?domain=oasara.com
```

**Resend Dashboard** (Real-time status)
```
https://resend.com/domains/oasara.com
```

---

## Flush DNS Cache

### macOS
```bash
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder
```

### Windows
```cmd
ipconfig /flushdns
```

### Linux
```bash
sudo systemd-resolve --flush-caches
```

### Browser
- Chrome: `chrome://net-internals/#dns` → Clear host cache
- Firefox: Restart browser
- Safari: Clear history → All history

---

## Common Issues & Solutions

### Issue: "Domain not verified" in Resend

**Cause**: DKIM record not found or incorrect

**Solutions**:
1. Wait 30 minutes for DNS propagation
2. Verify exact record name: `resend._domainkey` (not `resend._domainkey.oasara.com`)
3. Check for typos in CNAME value
4. Remove duplicate records
5. Use CNAME instead of TXT (if supported)

### Issue: "SPF record not found"

**Cause**: Record not added or wrong hostname

**Solutions**:
1. Verify hostname is `@` or `oasara.com` (not www)
2. Check for existing SPF record (can only have one)
3. Merge with existing SPF: `v=spf1 include:_spf.resend.com include:other.com ~all`

### Issue: "DMARC policy too strict"

**Cause**: Using `p=reject` before testing

**Solutions**:
1. Start with `p=none` (monitoring only)
2. Monitor reports for 30 days
3. Gradually increase to `p=quarantine`
4. Only use `p=reject` after 90+ days of monitoring

### Issue: Emails still going to spam

**Possible Causes**:
1. DNS not fully propagated (wait 24 hours)
2. Domain reputation low (new domain)
3. Content triggers spam filters
4. Missing SPF/DKIM/DMARC alignment

**Solutions**:
1. Verify all 3 records active
2. Check spam score: https://www.mail-tester.com/
3. Warm up domain (send low volume initially)
4. Review email content (reduce links, avoid spam keywords)

---

## Record Priority Order

**Immediate** (Required for Resend verification):
1. ✅ DKIM (CNAME or TXT from Resend)
2. ✅ SPF (TXT record)

**Important** (Required for good deliverability):
3. ✅ DMARC (TXT record)

**Optional** (Advanced):
4. ⚠️ MX records (only if receiving email at oasara.com)
5. ⚠️ BIMI (Brand Indicators for Message Identification)

---

## Testing Checklist

After adding all records:

- [ ] Wait 30 minutes for DNS propagation
- [ ] Verify SPF: `dig +short TXT oasara.com | grep spf`
- [ ] Verify DKIM: `dig +short CNAME resend._domainkey.oasara.com`
- [ ] Verify DMARC: `dig +short TXT _dmarc.oasara.com`
- [ ] Check Resend dashboard: Domain status = "Verified" (green)
- [ ] Run MXToolbox tests: All green checkmarks
- [ ] Send test email via `scripts/test-magic-link.js`
- [ ] Check mail-tester.com: Score >8/10

---

## Domain Reputation Monitoring

### Weekly Checks

**Google Postmaster Tools**: https://postmaster.google.com/
- Sign up with Google account
- Add oasara.com domain
- Monitor: Spam rate, domain reputation, delivery errors

**Microsoft SNDS**: https://sendersupport.olc.protection.outlook.com/snds/
- Sign up with Microsoft account
- Monitor Outlook/Hotmail deliverability

**MXToolbox Blacklist**: https://mxtoolbox.com/blacklists.aspx
- Check if domain is blacklisted
- Monitor weekly

### Red Flags

- Spam rate >0.3%
- Domain reputation: "Low" or "Bad"
- Bounce rate >5%
- Blacklist appearance

**If flagged**:
1. Review email content
2. Check for compromised accounts
3. Request delisting (if blacklisted)
4. Temporarily reduce sending volume

---

## DMARC Reports Setup

**Purpose**: Receive weekly reports on email authentication failures

1. **Create Mailbox**: dmarc@oasara.com (or use existing)
2. **Add to DMARC Record**: Already included (`rua=mailto:dmarc@oasara.com`)
3. **Receive Reports**: XML files sent weekly
4. **Parse Reports**: Use tool like https://dmarc.postmarkapp.com/

**What to Look For**:
- High failure rate (>10%): DNS records need fixing
- Unknown sources: Potential spoofing attempts
- SPF/DKIM alignment: Should be "pass"

---

## References

**Official Documentation**:
- Resend DNS Setup: https://resend.com/docs/dashboard/domains/introduction
- SPF Specification: https://tools.ietf.org/html/rfc7208
- DKIM Specification: https://tools.ietf.org/html/rfc6376
- DMARC Specification: https://tools.ietf.org/html/rfc7489

**Testing Tools**:
- MXToolbox: https://mxtoolbox.com/
- Mail Tester: https://www.mail-tester.com/
- DMARC Analyzer: https://dmarc.postmarkapp.com/

**Community Resources**:
- Resend Community: https://resend.com/community
- Email Deliverability Guide: https://resend.com/docs/knowledge-base/deliverability

---

## Quick Start (5-Minute Setup)

**Fastest path to working email**:

1. **Add Domain to Resend**: https://resend.com/domains
2. **Copy 3 Records**: SPF, DKIM, DMARC (Resend provides exact values)
3. **Add to DNS**: Paste into Netlify/Cloudflare DNS settings
4. **Wait 15 Minutes**: DNS propagation
5. **Verify**: Click "Verify Domain" in Resend dashboard
6. **Test**: Run `node scripts/test-magic-link.js`

**Done!** Emails should now deliver reliably.

---

**Last Updated**: 2025-12-29
**Maintained By**: Meta Management Team (CTO: Jone Ivey)
**Review Frequency**: Quarterly or after major email issues
