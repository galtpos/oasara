# Magic Link Email Fix - Oasara Advisory Board Recommendation

**Consultants:** Jony Ive (Patient Experience), Pieter Levels (UX Simplicity), Dr. Mark Hyman (Warm Communication)

**Problem:**
1. Current magic link email is confusing for non-technical users (like grandma)
2. Email comes from "Supabase" which users don't recognize

**Solution:** Custom email template + custom SMTP sender

---

## Advisory Board Input

**Jony Ive:** *"The email should feel like a welcome home, not a security protocol. Warm typography, clear action, zero anxiety."*

**Pieter Levels:** *"Keep it stupid simple. Big button. One sentence. Done. No corporate speak."*

**Dr. Mark Hyman:** *"Healthcare is already scary. The email should make them feel cared for, not like they're dealing with IT support."*

---

## Quick Fix (5 minutes)

### Step 1: Configure Custom SMTP (Resend)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/whklrclzrtijneqdjmiy/settings/auth)
2. Navigate to **Authentication → Email Templates → SMTP Settings**
3. Enable "Enable Custom SMTP"
4. Enter Resend SMTP credentials:
   - **Host:** `smtp.resend.com`
   - **Port:** `587` (or `465` for SSL)
   - **Username:** `resend`
   - **Password:** Your Resend API Key (`re_jYW8DLLv_HcVhcRvHcBmyZ9Z64NbJZtm3`)
   - **Sender email:** `hello@oasara.com` (or `noreply@oasara.com`)
   - **Sender name:** `Oasara`

### Step 2: Update Magic Link Email Template

1. In Supabase Dashboard → **Authentication → Email Templates**
2. Click "**Confirm signup**" template (this is the magic link)
3. Replace the template with the content from `email-templates/magic-link.html`
4. Save

### Step 3: Test

Send a magic link to yourself and verify:
- ✅ Email comes from "Oasara <hello@oasara.com>"
- ✅ Subject line is clear
- ✅ Content is warm and simple
- ✅ Big button is easy to see
- ✅ No technical jargon

---

## Alternative: Use Netlify Function (More Control)

If Supabase SMTP customization doesn't work, we can bypass Supabase emails entirely and send magic links via Resend using a Netlify function.

### Implementation

```typescript
// netlify/functions/send-magic-link.ts
import { Handler } from '@netlify/functions';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const handler: Handler = async (event) => {
  const { email, confirmationUrl } = JSON.parse(event.body || '{}');

  const { data, error } = await resend.emails.send({
    from: 'Oasara <hello@oasara.com>',
    to: email,
    subject: 'Sign in to Oasara',
    html: `
      <!-- Copy magic-link.html content here -->
    `,
    text: `
      OASARA

      Click this link to sign in: ${confirmationUrl}

      This link expires in 1 hour.
    `
  });

  return {
    statusCode: 200,
    body: JSON.stringify({ success: true })
  };
};
```

---

## Email Template Features (Based on Advisory Board Input)

### From Jony Ive:
- **Visual warmth:** Gradient backgrounds (sage/ocean colors)
- **Clear hierarchy:** Large heading, subheading, button
- **Emotional safety:** "Welcome!" not "Verify your email"
- **Apple-level polish:** Rounded corners, proper spacing, readable fonts

### From Pieter Levels:
- **One action:** Giant button, can't miss it
- **No corporate speak:** "Let's Get You Started" not "Complete Authentication"
- **Fallback:** Plain text link for copy/paste (some email clients block buttons)
- **Simple language:** "Click to sign in" not "Authenticate your session"

### From Dr. Mark Hyman:
- **Reassuring tone:** "You can safely ignore this" if not requested
- **Brand consistency:** Oasara colors and personality
- **Health-forward:** Mentions sovereignty and healthcare exit
- **Trust building:** Clear sender, clear purpose

---

## Before vs. After

### Before (Supabase Default)
```
From: noreply@supabase.io
Subject: Confirm your signup

Confirm your signup

Follow this link to confirm your user:
https://whklrclzrtijneqdjmiy.supabase.co/auth/v1/verify...

If you didn't request this, you can safely ignore this email.
```

### After (Oasara Branded)
```
From: Oasara <hello@oasara.com>
Subject: Sign in to Oasara

[Beautiful gradient header with OASARA logo]

Welcome! Let's Get You Started

Click the button below to sign in to your account.
This link will work for the next 1 hour.

[Big gold button: "Sign In to Oasara"]

Didn't request this?
You can safely ignore this email.
```

---

## Technical Notes

### Email Variables Available

Supabase provides these template variables:
- `{{ .ConfirmationURL }}` - The magic link
- `{{ .Token }}` - The token (if needed separately)
- `{{ .TokenHash }}` - Token hash (if needed separately)
- `{{ .SiteURL }}` - Your site URL
- `{{ .Email }}` - User's email address

### Testing Checklist

- [ ] Email arrives from `hello@oasara.com` (not Supabase)
- [ ] Subject line says "Sign in to Oasara"
- [ ] Button is visible and works
- [ ] Plain text fallback works
- [ ] Link expires after 1 hour
- [ ] Works in Gmail, Apple Mail, Outlook
- [ ] Mobile responsive
- [ ] Grandma can understand it

---

## Sender Domain Setup (DNS Records)

To use `hello@oasara.com`, add these DNS records:

**For Resend:**
```
TXT  _resend  <provided-by-resend>
```

**For SPF (Sender Policy Framework):**
```
TXT  @  v=spf1 include:_spf.resend.com ~all
```

**For DKIM (DomainKeys Identified Mail):**
```
TXT  resend._domainkey  <provided-by-resend>
```

Check with: `dig txt hello.oasara.com`

---

## Status

- [x] Email template created (HTML + Text)
- [ ] Supabase SMTP configured
- [ ] Email template uploaded to Supabase
- [ ] DNS records configured
- [ ] Test email sent
- [ ] Grandma approval ✅

---

*Advisory Board approved this email design on December 31, 2025*
