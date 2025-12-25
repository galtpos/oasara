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
    const { token } = await req.json()

    if (!token) {
      return new Response(
        JSON.stringify({
          error: 'Invalid request',
          message: 'Magic link token is required'
        }),
        { status: 400, headers: responseHeaders }
      )
    }

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Find the pending confirmation
    const { data: pending, error: fetchError } = await supabase
      .from('pending_email_confirmations')
      .select('*')
      .eq('confirmation_token', token)
      .single()

    if (fetchError || !pending) {
      console.error('Token not found:', fetchError)
      return new Response(
        JSON.stringify({
          error: 'Invalid token',
          message: 'This magic link is invalid or has expired'
        }),
        { status: 400, headers: responseHeaders }
      )
    }

    // Check if expired
    if (new Date(pending.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({
          error: 'Token expired',
          message: 'This magic link has expired. Please request a new one.'
        }),
        { status: 400, headers: responseHeaders }
      )
    }

    const email = pending.email

    // Check if user already exists in Supabase Auth
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const existingUser = existingUsers?.users?.find(u => u.email === email)

    let userId: string

    if (existingUser) {
      // User exists - just sign them in
      userId = existingUser.id
      console.log('Existing user found:', email)
    } else {
      // Create new user with random password (they'll always use magic link)
      const randomPassword = crypto.randomUUID() + crypto.randomUUID()

      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: email,
        password: randomPassword,
        email_confirm: true,
        user_metadata: {
          name: pending.name || email.split('@')[0]
        }
      })

      if (createError) {
        console.error('Failed to create user:', createError)
        return new Response(
          JSON.stringify({
            error: 'Registration failed',
            message: 'Failed to create your account. Please try again.'
          }),
          { status: 500, headers: responseHeaders }
        )
      }

      userId = newUser.user.id
      console.log('New user created:', email)

      // Create user profile
      await supabase
        .from('user_profiles')
        .insert({
          id: userId,
          email: email,
          name: pending.name || email.split('@')[0],
          user_type: 'patient'
        })
    }

    // Generate magic link
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: email
    })

    if (linkError || !linkData) {
      console.error('Failed to generate link:', linkError)
      return new Response(
        JSON.stringify({
          error: 'Sign-in failed',
          message: 'Failed to complete sign-in. Please try again.'
        }),
        { status: 500, headers: responseHeaders }
      )
    }

    // Get the token hash and verify it server-side to get session tokens
    const tokenHash = linkData.properties?.hashed_token
    if (!tokenHash) {
      console.error('No token hash returned')
      return new Response(
        JSON.stringify({
          error: 'Sign-in failed',
          message: 'Failed to generate session. Please try again.'
        }),
        { status: 500, headers: responseHeaders }
      )
    }

    // Call the verify endpoint to exchange the token for a session
    const verifyResponse = await fetch(`${supabaseUrl}/auth/v1/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': Deno.env.get('SUPABASE_ANON_KEY')!
      },
      body: JSON.stringify({
        token_hash: tokenHash,
        type: 'magiclink'
      })
    })

    if (!verifyResponse.ok) {
      const errorText = await verifyResponse.text()
      console.error('Verify endpoint failed:', errorText)
      return new Response(
        JSON.stringify({
          error: 'Sign-in failed',
          message: 'Failed to verify session. Please try again.'
        }),
        { status: 500, headers: responseHeaders }
      )
    }

    const sessionData = await verifyResponse.json()

    if (!sessionData.access_token || !sessionData.refresh_token) {
      console.error('No tokens in verify response:', sessionData)
      return new Response(
        JSON.stringify({
          error: 'Sign-in failed',
          message: 'Failed to generate session tokens. Please try again.'
        }),
        { status: 500, headers: responseHeaders }
      )
    }

    // Mark token as used
    await supabase
      .from('pending_email_confirmations')
      .update({
        confirmed: true,
        confirmed_at: new Date().toISOString()
      })
      .eq('confirmation_token', token)

    console.log('Magic link verified for:', email)

    // Return the actual session tokens for the client to use
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Magic link verified!',
        email: email,
        userId: userId,
        accessToken: sessionData.access_token,
        refreshToken: sessionData.refresh_token
      }),
      { status: 200, headers: responseHeaders }
    )

  } catch (error) {
    console.error('Verify magic link error:', error)

    return new Response(
      JSON.stringify({
        error: 'Server error',
        message: 'An unexpected error occurred. Please try again later.'
      }),
      { status: 500, headers: responseHeaders }
    )
  }
})
