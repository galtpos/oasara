import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4"
import { corsHeaders } from '../_shared/cors.ts'

interface InquiryRequest {
  facilityId: string;
  facilityName: string;
  facilityEmail?: string;
  senderName: string;
  senderEmail: string;
  senderPhone?: string;
  procedure?: string;
  message: string;
  preferredContact?: 'email' | 'phone' | 'whatsapp';
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const responseHeaders = {
    ...corsHeaders,
    'Content-Type': 'application/json'
  }

  try {
    const body: InquiryRequest = await req.json()

    // Validate required fields
    if (!body.facilityId || !body.facilityName || !body.senderEmail || !body.senderName || !body.message) {
      return new Response(
        JSON.stringify({
          error: 'Missing required fields',
          message: 'Please fill in all required fields (name, email, and message)'
        }),
        { status: 400, headers: responseHeaders }
      )
    }

    // Validate email format
    if (!body.senderEmail.includes('@')) {
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

    // Store the inquiry in the database
    // Using existing columns + storing extra info in the message field
    const fullMessage = `
From: ${body.senderName.trim()}
Email: ${body.senderEmail.toLowerCase().trim()}
${body.senderPhone ? `Phone: ${body.senderPhone.trim()}` : ''}
Preferred Contact: ${body.preferredContact || 'email'}
---
${body.message.trim()}
`.trim();

    const { data: inquiry, error: insertError } = await supabase
      .from('user_inquiries')
      .insert({
        facility_id: body.facilityId,
        procedure_interest: body.procedure?.trim() || null,
        message: fullMessage,
        status: 'sent'
      })
      .select()
      .single()

    if (insertError) {
      console.error('Failed to store inquiry:', insertError)
      // Continue anyway - we still want to try sending the email
    }

    // Get Resend API key
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    let emailSentToFacility = false
    let emailSentToSeeker = false

    if (RESEND_API_KEY) {
      // Send email to facility (if they have an email)
      if (body.facilityEmail) {
        try {
          const facilityEmailResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${RESEND_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: 'OASARA Inquiries <inquiries@oasara.com>',
              to: [body.facilityEmail],
              reply_to: body.senderEmail,
              subject: `New Patient Inquiry via OASARA - ${body.procedure || 'General Inquiry'}`,
              html: getFacilityEmailHTML(body),
              text: getFacilityEmailText(body),
            }),
          })

          if (facilityEmailResponse.ok) {
            const data = await facilityEmailResponse.json()
            console.log('✅ Email sent to facility:', data.id)
            emailSentToFacility = true
          } else {
            const errorData = await facilityEmailResponse.json()
            console.error('❌ Resend error (facility):', errorData)
          }
        } catch (error) {
          console.error('❌ Failed to send facility email:', error)
        }
      }

      // Send confirmation email to the seeker
      try {
        const seekerEmailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'OASARA <noreply@oasara.com>',
            to: [body.senderEmail],
            subject: `Your Inquiry to ${body.facilityName} - OASARA`,
            html: getSeekerEmailHTML(body),
            text: getSeekerEmailText(body),
          }),
        })

        if (seekerEmailResponse.ok) {
          const data = await seekerEmailResponse.json()
          console.log('✅ Confirmation email sent to seeker:', data.id)
          emailSentToSeeker = true
        } else {
          const errorData = await seekerEmailResponse.json()
          console.error('❌ Resend error (seeker):', errorData)
        }
      } catch (error) {
        console.error('❌ Failed to send seeker confirmation:', error)
      }
    }

    // Send Telegram notification
    const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN')
    const TELEGRAM_CHAT_ID = Deno.env.get('TELEGRAM_CHAT_ID')

    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
      try {
        const telegramMessage = `🏥 *New Facility Inquiry*

*Facility:* ${body.facilityName}
*Seeker:* ${body.senderName}
*Email:* ${body.senderEmail}
${body.senderPhone ? `*Phone:* ${body.senderPhone}` : ''}
${body.procedure ? `*Procedure:* ${body.procedure}` : ''}

*Message:*
${body.message.substring(0, 500)}${body.message.length > 500 ? '...' : ''}

📧 Facility notified: ${emailSentToFacility ? '✅' : '❌ No email on file'}
📬 Seeker confirmation: ${emailSentToSeeker ? '✅' : '❌'}`

        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: telegramMessage,
            parse_mode: 'Markdown'
          })
        })
      } catch (error) {
        console.error('Telegram notification failed:', error)
      }
    }

    // Log status for monitoring
    console.log('Inquiry stored:', inquiry?.id, 'Facility notified:', emailSentToFacility, 'Seeker confirmed:', emailSentToSeeker)

    return new Response(
      JSON.stringify({
        success: true,
        message: emailSentToFacility
          ? 'Your inquiry has been sent to the facility! Check your email for confirmation.'
          : 'Your inquiry has been recorded! The facility will be notified through our platform.',
        inquiryId: inquiry?.id,
        emailSentToFacility,
        emailSentToSeeker
      }),
      { status: 200, headers: responseHeaders }
    )

  } catch (error) {
    console.error('Send facility inquiry error:', error)

    return new Response(
      JSON.stringify({
        error: 'Server error',
        message: 'An unexpected error occurred. Please try again later.'
      }),
      { status: 500, headers: responseHeaders }
    )
  }
})

function getFacilityEmailHTML(body: InquiryRequest): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Patient Inquiry - OASARA</title>
    </head>
    <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; color: #333; margin: 0; padding: 0;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2A6B72; font-size: 2rem; margin: 0;">
            OASARA
          </h1>
          <p style="color: #D4B86A; font-size: 0.9rem; margin: 5px 0 0 0;">
            Medical Tourism Marketplace
          </p>
        </div>

        <!-- Main Content -->
        <div style="background: white; border-radius: 12px; padding: 30px; margin-bottom: 20px; border: 1px solid #e0e0e0;">
          <h2 style="color: #2A6B72; margin-top: 0; font-size: 1.4rem;">New Patient Inquiry</h2>

          <p style="color: #666; line-height: 1.6;">
            You have received a new inquiry through OASARA from a potential patient interested in your services.
          </p>

          <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #2A6B72; margin: 0 0 15px 0; font-size: 1.1rem;">Patient Information</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666; width: 120px;">Name:</td>
                <td style="padding: 8px 0; color: #333; font-weight: bold;">${body.senderName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Email:</td>
                <td style="padding: 8px 0;"><a href="mailto:${body.senderEmail}" style="color: #2A6B72;">${body.senderEmail}</a></td>
              </tr>
              ${body.senderPhone ? `
              <tr>
                <td style="padding: 8px 0; color: #666;">Phone:</td>
                <td style="padding: 8px 0;"><a href="tel:${body.senderPhone}" style="color: #2A6B72;">${body.senderPhone}</a></td>
              </tr>
              ` : ''}
              ${body.procedure ? `
              <tr>
                <td style="padding: 8px 0; color: #666;">Interested In:</td>
                <td style="padding: 8px 0; color: #333; font-weight: bold;">${body.procedure}</td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 8px 0; color: #666;">Preferred Contact:</td>
                <td style="padding: 8px 0; color: #333;">${body.preferredContact === 'phone' ? 'Phone Call' : body.preferredContact === 'whatsapp' ? 'WhatsApp' : 'Email'}</td>
              </tr>
            </table>
          </div>

          <div style="background: #fff8e1; border-left: 4px solid #D4B86A; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
            <h4 style="color: #2A6B72; margin: 0 0 10px 0;">Message from Patient:</h4>
            <p style="color: #333; line-height: 1.6; margin: 0; white-space: pre-wrap;">${body.message}</p>
          </div>

          <div style="text-align: center; margin-top: 25px;">
            <a href="mailto:${body.senderEmail}?subject=Re: Your Inquiry to ${body.facilityName}"
               style="display: inline-block; background: linear-gradient(180deg, #D4B86A 0%, #B8923A 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: bold; font-size: 1rem;">
              Reply to Patient
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="text-align: center; color: #888; font-size: 0.8rem; line-height: 1.5;">
          <p style="margin: 10px 0;">This inquiry was submitted through OASARA Medical Tourism Marketplace</p>
          <p style="margin: 5px 0;">&copy; 2025 OASARA - Your Oasis for Medical Sovereignty</p>
        </div>
      </div>
    </body>
    </html>
  `
}

function getFacilityEmailText(body: InquiryRequest): string {
  return `
OASARA - New Patient Inquiry

You have received a new inquiry through OASARA from a potential patient.

PATIENT INFORMATION
-------------------
Name: ${body.senderName}
Email: ${body.senderEmail}
${body.senderPhone ? `Phone: ${body.senderPhone}` : ''}
${body.procedure ? `Interested In: ${body.procedure}` : ''}
Preferred Contact: ${body.preferredContact === 'phone' ? 'Phone Call' : body.preferredContact === 'whatsapp' ? 'WhatsApp' : 'Email'}

MESSAGE
-------
${body.message}

---
This inquiry was submitted through OASARA Medical Tourism Marketplace
© 2025 OASARA - Your Oasis for Medical Sovereignty
  `.trim()
}

function getSeekerEmailHTML(body: InquiryRequest): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Inquiry Confirmation - OASARA</title>
    </head>
    <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; color: #333; margin: 0; padding: 0;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2A6B72; font-size: 2rem; margin: 0;">
            OASARA
          </h1>
          <p style="color: #D4B86A; font-size: 0.9rem; margin: 5px 0 0 0;">
            Your Oasis for Medical Sovereignty
          </p>
        </div>

        <!-- Main Content -->
        <div style="background: white; border-radius: 12px; padding: 30px; margin-bottom: 20px; border: 1px solid #e0e0e0;">
          <h2 style="color: #2A6B72; margin-top: 0; font-size: 1.4rem;">Your Inquiry Has Been Sent!</h2>

          <p style="color: #666; line-height: 1.6;">
            Hi ${body.senderName},
          </p>

          <p style="color: #666; line-height: 1.6;">
            Thank you for using OASARA to connect with <strong>${body.facilityName}</strong>. Your inquiry has been successfully submitted.
          </p>

          <div style="background: #e8f5f3; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #2A6B72; margin: 0 0 15px 0; font-size: 1.1rem;">Your Inquiry Summary</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666; width: 120px;">Facility:</td>
                <td style="padding: 8px 0; color: #333; font-weight: bold;">${body.facilityName}</td>
              </tr>
              ${body.procedure ? `
              <tr>
                <td style="padding: 8px 0; color: #666;">Procedure:</td>
                <td style="padding: 8px 0; color: #333;">${body.procedure}</td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 8px 0; color: #666;">Contact Method:</td>
                <td style="padding: 8px 0; color: #333;">${body.preferredContact === 'phone' ? 'Phone Call' : body.preferredContact === 'whatsapp' ? 'WhatsApp' : 'Email'}</td>
              </tr>
            </table>
          </div>

          <div style="background: #f5f5f5; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <h4 style="color: #666; margin: 0 0 10px 0; font-size: 0.9rem;">Your Message:</h4>
            <p style="color: #333; line-height: 1.6; margin: 0; font-style: italic;">"${body.message}"</p>
          </div>

          <div style="background: #fff8e1; border-left: 4px solid #D4B86A; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
            <h4 style="color: #2A6B72; margin: 0 0 10px 0;">What's Next?</h4>
            <ul style="color: #666; line-height: 1.8; margin: 0; padding-left: 20px;">
              <li>The facility typically responds within 24-48 hours</li>
              <li>Check your email (and spam folder) for their response</li>
              <li>You can continue browsing other facilities on OASARA</li>
            </ul>
          </div>

          <div style="text-align: center; margin-top: 25px;">
            <a href="https://oasara.com"
               style="display: inline-block; background: #2A6B72; color: white; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: bold; font-size: 1rem;">
              Explore More Facilities
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="text-align: center; color: #888; font-size: 0.8rem; line-height: 1.5;">
          <p style="margin: 10px 0;">Questions? Contact us at <a href="mailto:hello@oasara.com" style="color: #2A6B72;">hello@oasara.com</a></p>
          <p style="margin: 5px 0;">&copy; 2025 OASARA - Empowering Medical Sovereignty</p>
        </div>
      </div>
    </body>
    </html>
  `
}

function getSeekerEmailText(body: InquiryRequest): string {
  return `
OASARA - Your Inquiry Has Been Sent!

Hi ${body.senderName},

Thank you for using OASARA to connect with ${body.facilityName}. Your inquiry has been successfully submitted.

YOUR INQUIRY SUMMARY
--------------------
Facility: ${body.facilityName}
${body.procedure ? `Procedure: ${body.procedure}` : ''}
Preferred Contact: ${body.preferredContact === 'phone' ? 'Phone Call' : body.preferredContact === 'whatsapp' ? 'WhatsApp' : 'Email'}

Your Message:
"${body.message}"

WHAT'S NEXT?
------------
• The facility typically responds within 24-48 hours
• Check your email (and spam folder) for their response
• You can continue browsing other facilities on OASARA

Questions? Contact us at hello@oasara.com

---
© 2025 OASARA - Empowering Medical Sovereignty
  `.trim()
}
