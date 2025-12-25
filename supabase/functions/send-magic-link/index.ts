import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4"
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const responseHeaders = {
    ...corsHeaders,
    'Content-Type': 'application/json'
  }

  try {
    const { email } = await req.json()

    if (!email || !email.includes('@')) {
      return new Response(
        JSON.stringify({
          error: 'Invalid email',
          message: 'Please provide a valid email address'
        }),
        { status: 400, headers: responseHeaders }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Generate secure magic link token
    const magicToken = crypto.randomUUID().replace(/-/g, '') +
                       crypto.randomUUID().replace(/-/g, '') +
                       Date.now().toString(36)

    // Expires in 1 hour
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString()

    // Delete any existing pending confirmations for this email
    await supabase
      .from('pending_email_confirmations')
      .delete()
      .eq('email', normalizedEmail)

    // Insert new magic link token
    const { error: insertError } = await supabase
      .from('pending_email_confirmations')
      .insert({
        email: normalizedEmail,
        confirmation_token: magicToken,
        expires_at: expiresAt,
        confirmed: false,
        ip_address: req.headers.get('x-forwarded-for'),
        user_agent: req.headers.get('user-agent'),
        created_at: new Date().toISOString()
      })

    if (insertError) {
      console.error('Failed to store magic link token:', insertError)
      return new Response(
        JSON.stringify({
          error: 'Database error',
          message: 'Failed to generate magic link'
        }),
        { status: 500, headers: responseHeaders }
      )
    }

    // Create magic link URL
    const baseUrl = Deno.env.get('SITE_URL') || 'https://oasara.com'
    const magicLinkUrl = `${baseUrl}/auth/confirm?token=${magicToken}&type=magic`

    // Send email with Resend
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    let emailSent = false

    if (RESEND_API_KEY) {
      try {
        const resendResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'OASARA <noreply@oasara.com>',
            to: [normalizedEmail],
            subject: 'Your Magic Link to OASARA',
            html: getMagicLinkEmailHTML(magicLinkUrl),
            text: getMagicLinkEmailText(magicLinkUrl),
          }),
        })

        if (resendResponse.ok) {
          const resendData = await resendResponse.json()
          console.log('Magic link email sent via Resend:', resendData.id)
          emailSent = true
        } else {
          const errorData = await resendResponse.json()
          console.error('Resend API error:', errorData)
        }
      } catch (error) {
        console.error('Resend request failed:', error)
      }
    }

    // Log for debugging
    console.log('Magic link for', normalizedEmail, ':', magicLinkUrl)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Magic link sent! Check your email.',
        email: normalizedEmail,
        emailSent: emailSent
      }),
      { status: 200, headers: responseHeaders }
    )

  } catch (error) {
    console.error('Send magic link error:', error)

    return new Response(
      JSON.stringify({
        error: 'Server error',
        message: 'An unexpected error occurred. Please try again later.'
      }),
      { status: 500, headers: responseHeaders }
    )
  }
})

function getMagicLinkEmailHTML(magicLinkUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Magic Link - OASARA</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #FFFFFF; color: #1F525A; margin: 0; padding: 0;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">

        <!-- Header -->
        <div style="text-align: center; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 2px solid #E8F0EC;">
          <h1 style="font-family: 'Cinzel', serif; font-size: 32px; letter-spacing: 0.5em; margin: 0; background: linear-gradient(180deg, #D4B86A 0%, #A67C00 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
            OASARA
          </h1>
          <p style="color: #2A6B72; font-size: 14px; margin: 8px 0 0 0;">
            Medical Sovereignty Platform
          </p>
        </div>

        <!-- Main Content -->
        <div style="background: #F8FAF9; border-radius: 12px; padding: 40px; margin-bottom: 24px; border: 1px solid #D1DDD6;">
          <h2 style="color: #2A6B72; margin: 0 0 16px 0; font-size: 24px; font-weight: 600;">
            Your Magic Link is Ready
          </h2>

          <p style="color: #1F525A; line-height: 1.7; font-size: 16px; margin: 0 0 24px 0;">
            Click the button below to instantly access OASARA and explore <strong>518 JCI-certified medical facilities</strong> across 39 countries.
          </p>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${magicLinkUrl}"
               style="display: inline-block; background: linear-gradient(180deg, #D4B86A 0%, #B8923A 100%); color: white; text-decoration: none; padding: 16px 48px; border-radius: 4px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 0 #8B6914, 0 6px 16px rgba(139, 105, 20, 0.3);">
              Access OASARA Now
            </a>
          </div>

          <div style="background: #FFFFFF; border-left: 4px solid #2A6B72; padding: 16px 20px; margin: 24px 0; border-radius: 0 8px 8px 0;">
            <p style="font-size: 14px; color: #2A6B72; margin: 0; font-weight: 500;">
              What you'll get access to:
            </p>
            <ul style="color: #1F525A; line-height: 1.8; margin: 12px 0 0 0; padding-left: 20px; font-size: 14px;">
              <li>518 JCI-certified facilities worldwide</li>
              <li>Save 50-90% on medical procedures</li>
              <li>Bounty rewards for community contributions</li>
              <li>Privacy-preserving Zano payments</li>
            </ul>
          </div>

          <p style="color: #5B9AA0; font-size: 13px; line-height: 1.6; margin: 24px 0 0 0;">
            Link not working? Copy and paste this URL into your browser:<br>
            <a href="${magicLinkUrl}" style="color: #2A6B72; word-break: break-all; text-decoration: underline;">${magicLinkUrl}</a>
          </p>
        </div>

        <!-- Footer -->
        <div style="text-align: center; color: #5B9AA0; font-size: 13px; line-height: 1.6;">
          <p style="margin: 8px 0;">This link expires in <strong>1 hour</strong>.</p>
          <p style="margin: 8px 0;">If you didn't request this, you can safely ignore this email.</p>
          <div style="margin: 24px 0; padding-top: 16px; border-top: 1px solid #D1DDD6;">
            <p style="margin: 4px 0; color: #2A6B72;">&copy; 2025 OASARA</p>
            <p style="margin: 4px 0; color: #5B9AA0;">Your Oasis for Medical Sovereignty</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
}

function getMagicLinkEmailText(magicLinkUrl: string): string {
  return `
OASARA - Your Magic Link

Your Magic Link is Ready

Click the link below to instantly access OASARA and explore 518 JCI-certified medical facilities across 39 countries.

${magicLinkUrl}

What you'll get access to:
- 518 JCI-certified facilities worldwide
- Save 50-90% on medical procedures
- Bounty rewards for community contributions
- Privacy-preserving Zano payments

This link expires in 1 hour.

If you didn't request this, you can safely ignore this email.

---
(c) 2025 OASARA
Your Oasis for Medical Sovereignty
  `.trim()
}
