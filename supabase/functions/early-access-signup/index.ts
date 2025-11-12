import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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

    // Get Mailchimp credentials
    const MAILCHIMP_API_KEY = Deno.env.get('MAILCHIMP_API_KEY')
    const MAILCHIMP_LIST_ID = Deno.env.get('MAILCHIMP_LIST_ID')
    const MAILCHIMP_SERVER_PREFIX = Deno.env.get('MAILCHIMP_SERVER_PREFIX')

    // Get Telegram credentials
    const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN')
    const TELEGRAM_CHAT_ID = Deno.env.get('TELEGRAM_CHAT_ID')

    if (!MAILCHIMP_API_KEY || !MAILCHIMP_LIST_ID || !MAILCHIMP_SERVER_PREFIX) {
      return new Response(
        JSON.stringify({
          error: 'Configuration error',
          message: 'Mailchimp service not configured'
        }),
        { status: 500, headers: responseHeaders }
      )
    }

    // 1. Subscribe to Mailchimp with OASARA tags
    const mailchimpUrl = `https://${MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0/lists/${MAILCHIMP_LIST_ID}/members`

    const memberData = {
      email_address: email.toLowerCase().trim(),
      status: 'subscribed',
      merge_fields: {
        FNAME: name?.trim() || '',
      },
      tags: ['OASARA', 'EarlyAccess', 'Website'],
    }

    const mailchimpResponse = await fetch(mailchimpUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MAILCHIMP_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(memberData),
    })

    const responseData = await mailchimpResponse.json()

    let mailchimpSuccess = false
    let mailchimpMessage = ''

    if (mailchimpResponse.ok) {
      console.log('✅ Successfully subscribed to Mailchimp with OASARA tags:', responseData.email_address)
      mailchimpSuccess = true
      mailchimpMessage = 'Successfully joined OASARA early access list!'
    } else if (responseData.title === 'Member Exists') {
      // Update existing member with OASARA tags
      const encoder = new TextEncoder();
      const data = encoder.encode(email.toLowerCase().trim());
      const hashBuffer = await crypto.subtle.digest('MD5', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      const updateUrl = `https://${MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0/lists/${MAILCHIMP_LIST_ID}/members/${hashHex}/tags`

      const updateResponse = await fetch(updateUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${MAILCHIMP_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tags: [
            { name: 'OASARA', status: 'active' },
            { name: 'EarlyAccess', status: 'active' },
            { name: 'Website', status: 'active' }
          ]
        }),
      })

      if (updateResponse.ok) {
        console.log('✅ Updated existing subscriber with OASARA tags:', email)
        mailchimpSuccess = true
        mailchimpMessage = 'Welcome back! You\'ve been added to the OASARA early access list.'
      } else {
        mailchimpSuccess = true
        mailchimpMessage = 'You are already subscribed to our newsletter!'
      }
    } else {
      console.error('❌ Mailchimp error:', responseData)
      return new Response(
        JSON.stringify({
          error: 'Subscription failed',
          message: responseData.detail || 'Failed to join early access list.'
        }),
        { status: 400, headers: responseHeaders }
      )
    }

    // 2. Send Telegram notification (don't block on this)
    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID && mailchimpSuccess) {
      const telegramMessage = `🟢 📧 *New OASARA Early Access Signup!*

Someone just joined the OASARA revolution!

*Details:*
• Email: ${email}
• Name: ${name || 'Not provided'}
• Source: early-access
• Timestamp: ${new Date().toISOString()}

*Time:* ${new Date().toLocaleString()}
*Site:* OASARA.com`

      // Send Telegram notification (fire and forget)
      fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: telegramMessage,
          parse_mode: 'Markdown',
          disable_web_page_preview: true,
        }),
      })
        .then(response => {
          if (response.ok) {
            console.log('✅ Telegram notification sent')
          } else {
            console.error('❌ Telegram notification failed:', response.status)
          }
        })
        .catch(error => {
          console.error('❌ Telegram error:', error)
        })
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: mailchimpMessage,
        email: email
      }),
      { status: 200, headers: responseHeaders }
    )

  } catch (error) {
    console.error('❌ Early access signup error:', error)

    return new Response(
      JSON.stringify({
        error: 'Server error',
        message: 'An unexpected error occurred.'
      }),
      { status: 500, headers: responseHeaders }
    )
  }
})
