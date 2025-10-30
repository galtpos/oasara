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
    const { email, name } = await req.json()

    if (!email || !email.includes('@')) {
      return new Response(
        JSON.stringify({
          error: 'Invalid email',
          message: 'Please provide a valid email address'
        }),
        { status: 400, headers: responseHeaders }
      )
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Generate confirmation token
    const confirmationToken = crypto.randomUUID().replace(/-/g, '') + Date.now().toString(36)

    // Store pending confirmation
    const { error: insertError } = await supabase
      .from('pending_email_confirmations')
      .insert({
        email: email.toLowerCase().trim(),
        name: name?.trim() || null,
        confirmation_token: confirmationToken,
        ip_address: req.headers.get('x-forwarded-for'),
        user_agent: req.headers.get('user-agent')
      })

    if (insertError) {
      console.error('Failed to store pending confirmation:', insertError)
      return new Response(
        JSON.stringify({
          error: 'Database error',
          message: 'Failed to store confirmation request'
        }),
        { status: 500, headers: responseHeaders }
      )
    }

    // Create confirmation URL
    const baseUrl = Deno.env.get('SITE_URL') || 'https://oasara.com'
    const confirmationUrl = `${baseUrl}/confirm-email?token=${confirmationToken}`

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
            to: [email],
            subject: 'Confirm Your Email - Welcome to OASARA',
            html: getEmailHTML(name || '', confirmationUrl),
            text: getEmailText(name || '', confirmationUrl),
          }),
        })

        if (resendResponse.ok) {
          const resendData = await resendResponse.json()
          console.log('✅ Email sent successfully via Resend:', resendData.id)
          emailSent = true
        } else {
          const errorData = await resendResponse.json()
          console.error('❌ Resend API error:', errorData)
        }
      } catch (error) {
        console.error('❌ Resend request failed:', error)
      }
    }

    // Always log the confirmation URL for backup
    console.log('📧 CONFIRMATION URL for', email, ':', confirmationUrl)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Confirmation email sent! Please check your inbox and click the confirmation link.',
        email: email,
        emailSent: emailSent
      }),
      { status: 200, headers: responseHeaders }
    )

  } catch (error) {
    console.error('Send confirmation email error:', error)

    return new Response(
      JSON.stringify({
        error: 'Server error',
        message: 'An unexpected error occurred. Please try again later.'
      }),
      { status: 500, headers: responseHeaders }
    )
  }
})

function getEmailHTML(name: string, confirmationUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirm Your Email - OASARA</title>
    </head>
    <body style="font-family: Arial, sans-serif; background-color: #0A0A0A; color: #FFF8F0; margin: 0; padding: 0;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 40px;">
          <h1 style="color: #D97925; font-size: 2.5rem; margin: 0; font-family: 'Playfair Display', serif;">
            OASARA
          </h1>
          <p style="color: #D4AF37; font-size: 1.1rem; margin: 10px 0 0 0;">
            Your Oasis for Medical Sovereignty
          </p>
        </div>

        <!-- Main Content -->
        <div style="background: rgba(26, 26, 26, 0.8); border-radius: 16px; padding: 40px; margin-bottom: 30px; border: 1px solid rgba(217, 121, 37, 0.2);">
          <h2 style="color: #D97925; margin-top: 0; font-size: 1.8rem;">Confirm Your Email Address</h2>

          ${name ? `<p style="font-size: 1.1rem;">Hi ${name},</p>` : '<p style="font-size: 1.1rem;">Hello,</p>'}

          <p style="color: #E5D4B8; line-height: 1.8; font-size: 1rem;">
            Welcome to OASARA! You're one step away from accessing our curated network of <strong>518+ JCI-accredited medical facilities</strong> worldwide.
          </p>

          <div style="text-align: center; margin: 40px 0;">
            <a href="${confirmationUrl}"
               style="display: inline-block; background: linear-gradient(135deg, #D97925, #D4AF37); color: white; text-decoration: none; padding: 18px 48px; border-radius: 12px; font-weight: bold; font-size: 1.1rem; box-shadow: 0 4px 20px rgba(217, 121, 37, 0.3);">
              Confirm My Email
            </a>
          </div>

          <div style="background: rgba(15, 15, 15, 0.6); border-left: 4px solid #D4AF37; padding: 20px; margin: 30px 0; border-radius: 8px;">
            <p style="font-size: 0.95rem; color: #FFF8F0; margin: 0 0 15px 0; font-weight: bold;">
              Once confirmed, you'll be able to:
            </p>
            <ul style="color: #E5D4B8; line-height: 1.8; margin: 0; padding-left: 20px;">
              <li>Save favorite facilities to your personal dashboard</li>
              <li>Contact providers directly with one click</li>
              <li>Track your medical tourism journey</li>
              <li>Access verified pricing and doctor profiles</li>
              <li>Receive updates on Zano payment integration</li>
            </ul>
          </div>

          <p style="color: #C17754; font-size: 0.9rem; line-height: 1.6;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${confirmationUrl}" style="color: #0B697A; word-break: break-all; text-decoration: underline;">${confirmationUrl}</a>
          </p>
        </div>

        <!-- Footer -->
        <div style="text-align: center; color: #888; font-size: 0.85rem; line-height: 1.6;">
          <p style="margin: 10px 0;">This confirmation link will expire in <strong>24 hours</strong>.</p>
          <p style="margin: 10px 0;">If you didn't request this, you can safely ignore this email.</p>
          <div style="margin: 30px 0; padding-top: 20px; border-top: 1px solid #333;">
            <p style="margin: 5px 0;">&copy; 2025 OASARA - Medical Sovereignty Platform</p>
            <p style="margin: 5px 0; color: #666;">Empowering individuals to reclaim medical sovereignty</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
}

function getEmailText(name: string, confirmationUrl: string): string {
  return `
OASARA - Confirm Your Email Address
Your Oasis for Medical Sovereignty

${name ? `Hi ${name},` : 'Hello,'}

Welcome to OASARA! You're one step away from accessing our curated network of 518+ JCI-accredited medical facilities worldwide.

To complete your registration and start exploring verified facilities with real pricing and doctor profiles, please confirm your email address by clicking the link below:

${confirmationUrl}

Once confirmed, you'll be able to:
• Save favorite facilities to your personal dashboard
• Contact providers directly with one click
• Track your medical tourism journey
• Access verified pricing and doctor profiles
• Receive updates on Zano payment integration

This confirmation link will expire in 24 hours.

If you didn't request this, you can safely ignore this email.

---
© 2025 OASARA - Medical Sovereignty Platform
Empowering individuals to reclaim medical sovereignty
  `.trim()
}
