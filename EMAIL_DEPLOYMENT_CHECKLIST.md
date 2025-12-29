# Email Deliverability Deployment Checklist

**Project**: Oasara Marketplace
**Feature**: Magic Link Email via Resend.com
**Priority**: Week 2 Priority #1
**Estimated Time**: 2 hours
**Deployment Date**: _______________

---

## Pre-Deployment (30 minutes)

### Environment Verification

- [ ] **Resend API Key Configured**
  - Location: `.env.local`
  - Key: `RESEND_API_KEY=re_jYW8DLLv_HcVhcRvHcBmyZ9Z64NbJZtm3`
  - Test: https://resend.com/api-keys (verify key is active)

- [ ] **Supabase Project ID Verified**
  - Project: `whklrclzrtijneqdjmiy`
  - URL: https://whklrclzrtijneqdjmiy.supabase.co
  - Dashboard: https://supabase.com/dashboard/project/whklrclzrtijneqdjmiy

- [ ] **Domain Access Confirmed**
  - Domain: oasara.com
  - DNS Provider: _______________ (Netlify/Cloudflare/Other)
  - Access: Login credentials available

- [ ] **Test Email Addresses Prepared**
  - Gmail: _______________
  - Outlook: _______________
  - Yahoo: _______________
  - ProtonMail: _______________

---

## Resend Configuration (15 minutes)

### Domain Setup

- [ ] **Log in to Resend**
  - URL: https://resend.com/login
  - Account: _______________ (email)

- [ ] **Add Domain**
  - Navigate to: https://resend.com/domains
  - Click: "Add Domain"
  - Enter: oasara.com
  - Status: Pending verification

- [ ] **Copy DNS Records**
  - Record DKIM CNAME:
    ```
    Name:  resend._domainkey
    Value: ______________________________
    ```
  - Record SPF TXT: `v=spf1 include:_spf.resend.com ~all`
  - Record DMARC TXT: `v=DMARC1; p=none; rua=mailto:dmarc@oasara.com; pct=100`

---

## DNS Configuration (15 minutes)

### Add DNS Records

- [ ] **SPF Record Added**
  - Type: TXT
  - Name: @ (or oasara.com)
  - Value: `v=spf1 include:_spf.resend.com ~all`
  - TTL: 3600
  - Status: ⏳ Propagating

- [ ] **DKIM Record Added**
  - Type: CNAME
  - Name: resend._domainkey
  - Value: _______________ (from Resend dashboard)
  - TTL: 3600
  - Status: ⏳ Propagating

- [ ] **DMARC Record Added**
  - Type: TXT
  - Name: _dmarc
  - Value: `v=DMARC1; p=none; rua=mailto:dmarc@oasara.com; pct=100`
  - TTL: 3600
  - Status: ⏳ Propagating

### Verification

- [ ] **Wait for Propagation** (30 minutes typical)
  - Started: _______________ (time)
  - Check after: _______________ (time + 30 min)

- [ ] **Verify DNS Records**
  ```bash
  # SPF
  dig +short TXT oasara.com | grep spf

  # DKIM
  dig +short CNAME resend._domainkey.oasara.com

  # DMARC
  dig +short TXT _dmarc.oasara.com
  ```
  - SPF: ✅ / ❌
  - DKIM: ✅ / ❌
  - DMARC: ✅ / ❌

- [ ] **Verify in Resend Dashboard**
  - URL: https://resend.com/domains/oasara.com
  - Status: ✅ Verified / ❌ Pending
  - Domain health: Green checkmarks

- [ ] **MXToolbox Verification**
  - URL: https://mxtoolbox.com/SuperTool.aspx?action=spf%3aoasara.com
  - SPF: Pass
  - DKIM: Pass
  - DMARC: Pass

---

## Supabase SMTP Configuration (10 minutes)

### Enable Custom SMTP

- [ ] **Navigate to Auth Settings**
  - URL: https://supabase.com/dashboard/project/whklrclzrtijneqdjmiy/settings/auth
  - Section: SMTP Settings

- [ ] **Enable Custom SMTP**
  - Toggle: ON

- [ ] **Enter SMTP Credentials**
  ```
  SMTP Host:     smtp.resend.com
  SMTP Port:     465
  SMTP User:     resend
  SMTP Password: re_jYW8DLLv_HcVhcRvHcBmyZ9Z64NbJZtm3
  Sender Email:  noreply@oasara.com
  Sender Name:   Oasara Health
  ```

- [ ] **Save Configuration**
  - Click: "Save"
  - Confirmation: Settings saved successfully

- [ ] **Test SMTP Connection**
  - Button: "Send Test Email" (if available)
  - Status: ✅ / ❌

---

## Email Template Customization (20 minutes)

### Magic Link Template

- [ ] **Navigate to Email Templates**
  - URL: https://supabase.com/dashboard/project/whklrclzrtijneqdjmiy/auth/templates
  - Template: Magic Link

- [ ] **Backup Existing Template**
  - Copy current HTML to: `backup-magic-link-template.html`

- [ ] **Update Template**
  - Copy new template from: `EMAIL_DELIVERABILITY_IMPLEMENTATION.md`
  - Paste into: Magic Link template editor
  - Verify variables: `{{ .ConfirmationURL }}` present

- [ ] **Update Subject Line**
  - Current: _______________
  - New: "Sign in to Oasara Health"

- [ ] **Save Template**
  - Click: "Save"
  - Confirmation: Template updated

- [ ] **Preview Template**
  - Click: "Preview" (if available)
  - Check: Branding, colors, layout

---

## Testing Phase (30 minutes)

### Automated Tests

- [ ] **Update Test Script**
  - File: `scripts/test-magic-link.js`
  - Update: Test email addresses (replace example.com)
  - Verify: Environment variables loaded

- [ ] **Run Test Script**
  ```bash
  cd /Users/aaronday/Documents/medicaltourism/oasara-marketplace
  node scripts/test-magic-link.js
  ```
  - Exit code: 0 (success) / 1 (failure)
  - Success rate: _____% (target: >90%)

### Manual Email Checks

- [ ] **Gmail Test**
  - Inbox: ✅ / ❌
  - Spam: ✅ / ❌
  - Load time: _____s
  - Mobile responsive: ✅ / ❌

- [ ] **Outlook Test**
  - Inbox: ✅ / ❌
  - Spam: ✅ / ❌
  - Load time: _____s
  - Mobile responsive: ✅ / ❌

- [ ] **Yahoo Test**
  - Inbox: ✅ / ❌
  - Spam: ✅ / ❌
  - Load time: _____s
  - Mobile responsive: ✅ / ❌

- [ ] **ProtonMail Test**
  - Inbox: ✅ / ❌
  - Spam: ✅ / ❌
  - Load time: _____s
  - Mobile responsive: ✅ / ❌

### Email Quality Verification

- [ ] **Branding Check**
  - Oasara name visible: ✅ / ❌
  - Blue gradient header: ✅ / ❌
  - Professional design: ✅ / ❌

- [ ] **Content Check**
  - Subject line clear: ✅ / ❌
  - CTA button prominent: ✅ / ❌
  - Plain text fallback: ✅ / ❌
  - Security note included: ✅ / ❌

- [ ] **Functionality Check**
  - Magic link clickable: ✅ / ❌
  - Redirects to callback: ✅ / ❌
  - Logs user in: ✅ / ❌
  - Link expires (1 hour): ✅ / ❌

### Spam Score Testing

- [ ] **Mail-Tester Check**
  - Forward test email to: check@mail-tester.com
  - Visit: https://www.mail-tester.com/
  - Score: _____/10 (target: >8/10)
  - Issues: _______________

- [ ] **Google Postmaster Setup**
  - URL: https://postmaster.google.com/
  - Domain added: oasara.com
  - Status: Monitoring

---

## Production Deployment (10 minutes)

### Final Verification

- [ ] **All Tests Passing**
  - Automated tests: >90% success
  - Manual tests: 4/4 providers
  - Spam score: >8/10

- [ ] **DNS Records Active**
  - SPF: ✅
  - DKIM: ✅
  - DMARC: ✅
  - Propagation complete: ✅

- [ ] **Supabase Configuration**
  - Custom SMTP enabled: ✅
  - Template updated: ✅
  - Test email sent: ✅

### Go-Live

- [ ] **Enable for All Users**
  - No feature flag needed (backend change only)
  - Effective immediately

- [ ] **Monitor First Hour**
  - Check Resend dashboard: https://resend.com/logs
  - Watch for: Bounce rate, delivery rate
  - Target: >98% delivery rate

- [ ] **Send Notification**
  - To: Team, stakeholders
  - Subject: "Email deliverability improved"
  - Body: "Magic links now using Resend for better inbox placement"

---

## Post-Deployment Monitoring (24 hours)

### Hour 1

- [ ] **Check Resend Logs**
  - URL: https://resend.com/logs
  - Emails sent: _____
  - Delivery rate: _____%
  - Bounce rate: _____%

- [ ] **No Critical Errors**
  - Supabase logs: https://supabase.com/dashboard/project/whklrclzrtijneqdjmiy/logs/auth-logs
  - Error count: _____
  - Error types: _______________

### Hour 6

- [ ] **Deliverability Stats**
  - Total sent: _____
  - Inbox rate: _____%
  - Spam rate: _____%
  - Bounce rate: _____%

- [ ] **User Feedback**
  - Support tickets (email not received): _____
  - Social media mentions: _____
  - Direct feedback: _______________

### Day 1

- [ ] **Daily Summary**
  - Total magic links sent: _____
  - Delivery rate: _____%
  - Issues reported: _____
  - Resolution time: _____

- [ ] **Domain Reputation**
  - Google Postmaster: Good / Medium / Bad
  - MXToolbox blacklist: Clear / Listed

---

## Rollback Plan (If Issues Occur)

### Trigger Conditions

- [ ] Delivery rate drops below 80%
- [ ] Bounce rate exceeds 10%
- [ ] Critical error rate >1%
- [ ] User complaints spike (>10/hour)

### Rollback Steps

1. [ ] **Disable Custom SMTP**
   - Go to: https://supabase.com/dashboard/project/whklrclzrtijneqdjmiy/settings/auth
   - Toggle: "Enable Custom SMTP" → OFF
   - Time to revert: <2 minutes

2. [ ] **Verify Fallback Working**
   - Send test magic link
   - Confirm delivery via default Supabase SMTP

3. [ ] **Notify Team**
   - Message: "Temporarily reverted to default email provider"
   - ETA for fix: _______________

4. [ ] **Debug Offline**
   - Check Resend logs: https://resend.com/logs
   - Verify DNS records: `dig` commands
   - Review error messages: Supabase logs

5. [ ] **Fix and Re-deploy**
   - Issue identified: _______________
   - Fix applied: _______________
   - Re-test in staging
   - Re-enable custom SMTP

---

## Success Criteria

### Week 1 Goals

- [ ] >95% inbox placement (Gmail, Outlook, Yahoo, ProtonMail)
- [ ] <2% bounce rate
- [ ] <0.1% spam complaints
- [ ] Spam score >8/10 on Mail-Tester
- [ ] Zero critical incidents

### Week 2 Goals

- [ ] >90% magic link click-through rate
- [ ] <1 minute average email delivery time
- [ ] Zero DKIM/SPF authentication failures
- [ ] User feedback: <5% "didn't receive email" tickets

### Month 1 Goals

- [ ] >98% delivery rate sustained
- [ ] Domain reputation score >90%
- [ ] Spam rate <0.3%
- [ ] Zero blacklist appearances

---

## Documentation Updates

- [ ] **Update Project README**
  - Section: Email Infrastructure
  - Content: Mention Resend integration

- [ ] **Update Support Docs**
  - Add: "Didn't receive email?" troubleshooting
  - Include: Check spam folder, whitelist instructions

- [ ] **Update Developer Wiki**
  - Document: SMTP configuration
  - Include: Test procedures

- [ ] **Create Runbook**
  - File: `EMAIL_TROUBLESHOOTING.md`
  - Content: Common issues and solutions

---

## Team Sign-off

**Technical Implementation**:
- [ ] CTO (Jone Ivey): _______________ Date: _____

**Quality Assurance**:
- [ ] QA Lead (Elena Riggs): _______________ Date: _____

**Product Approval**:
- [ ] Product Owner (Aaron Day): _______________ Date: _____

**Operations Ready**:
- [ ] DevOps: _______________ Date: _____

---

## Notes & Issues

**Blockers**:
- _______________________________________________
- _______________________________________________

**Deviations from Plan**:
- _______________________________________________
- _______________________________________________

**Follow-up Items**:
- _______________________________________________
- _______________________________________________

**Lessons Learned**:
- _______________________________________________
- _______________________________________________

---

**Deployment Status**: ⏳ Not Started / 🚧 In Progress / ✅ Complete / ❌ Rolled Back

**Completion Date**: _______________
**Total Time Spent**: _____ hours
**Issues Encountered**: _____
**Final Delivery Rate**: _____%

---

**Next Steps**: See `EMAIL_DELIVERABILITY_IMPLEMENTATION.md` Section 7 (Week 3+ Expansion)
