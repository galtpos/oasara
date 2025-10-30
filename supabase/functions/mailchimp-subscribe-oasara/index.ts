import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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

    // Get Mailchimp credentials from environment
    const MAILCHIMP_API_KEY = Deno.env.get('MAILCHIMP_API_KEY')
    const MAILCHIMP_LIST_ID = Deno.env.get('MAILCHIMP_LIST_ID')
    const MAILCHIMP_SERVER_PREFIX = Deno.env.get('MAILCHIMP_SERVER_PREFIX')

    if (!MAILCHIMP_API_KEY || !MAILCHIMP_LIST_ID || !MAILCHIMP_SERVER_PREFIX) {
      return new Response(
        JSON.stringify({
          error: 'Configuration error',
          message: 'Mailchimp service not configured'
        }),
        { status: 500, headers: responseHeaders }
      )
    }

    // Subscribe to Mailchimp with OASARA tags
    const mailchimpUrl = `https://${MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0/lists/${MAILCHIMP_LIST_ID}/members`

    const memberData = {
      email_address: email.toLowerCase().trim(),
      status: 'subscribed',
      merge_fields: {
        FNAME: name?.trim() || '',
      },
      tags: ['OASARA', 'EarlyAccess', 'Website'], // OASARA-specific tags
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

    if (mailchimpResponse.ok) {
      console.log('✅ Successfully subscribed to Mailchimp with OASARA tags:', responseData.email_address)

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Successfully joined OASARA early access list!',
          email: responseData.email_address
        }),
        { status: 200, headers: responseHeaders }
      )
    } else if (responseData.title === 'Member Exists') {
      // If member exists, update their tags to include OASARA
      const updateUrl = `https://${MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0/lists/${MAILCHIMP_LIST_ID}/members/${btoa(email.toLowerCase().trim())}`

      const updateResponse = await fetch(updateUrl, {
        method: 'PATCH',
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
        return new Response(
          JSON.stringify({
            success: true,
            message: 'Welcome back! You\'ve been added to the OASARA early access list.',
            email: email
          }),
          { status: 200, headers: responseHeaders }
        )
      } else {
        return new Response(
          JSON.stringify({
            success: true,
            message: 'You are already subscribed to our newsletter!',
            email: email
          }),
          { status: 200, headers: responseHeaders }
        )
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

  } catch (error) {
    console.error('❌ Mailchimp subscription error:', error)

    return new Response(
      JSON.stringify({
        error: 'Server error',
        message: 'An unexpected error occurred.'
      }),
      { status: 500, headers: responseHeaders }
    )
  }
})
