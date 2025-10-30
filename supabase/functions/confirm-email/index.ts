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
    const { token, password } = await req.json()

    if (!token) {
      return new Response(
        JSON.stringify({
          error: 'Invalid request',
          message: 'Confirmation token is required'
        }),
        { status: 400, headers: responseHeaders }
      )
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Find pending confirmation
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
          message: 'This confirmation link is invalid or has expired'
        }),
        { status: 400, headers: responseHeaders }
      )
    }

    // Check if already confirmed
    if (pending.confirmed) {
      return new Response(
        JSON.stringify({
          error: 'Already confirmed',
          message: 'This email has already been confirmed. Please log in.'
        }),
        { status: 400, headers: responseHeaders }
      )
    }

    // Check if expired
    if (new Date(pending.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({
          error: 'Token expired',
          message: 'This confirmation link has expired. Please request a new one.'
        }),
        { status: 400, headers: responseHeaders }
      )
    }

    // Create Supabase Auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: pending.email,
      password: password,
      email_confirm: true,
      user_metadata: {
        name: pending.name || pending.email.split('@')[0]
      }
    })

    if (authError) {
      console.error('Failed to create auth user:', authError)

      // Check if user already exists
      if (authError.message.includes('already registered')) {
        return new Response(
          JSON.stringify({
            error: 'Email already registered',
            message: 'An account with this email already exists. Please log in.'
          }),
          { status: 400, headers: responseHeaders }
        )
      }

      return new Response(
        JSON.stringify({
          error: 'Registration failed',
          message: 'Failed to create your account. Please try again.'
        }),
        { status: 500, headers: responseHeaders }
      )
    }

    // Mark confirmation as complete
    const { error: updateError } = await supabase
      .from('pending_email_confirmations')
      .update({
        confirmed: true,
        confirmed_at: new Date().toISOString()
      })
      .eq('confirmation_token', token)

    if (updateError) {
      console.error('Failed to update confirmation status:', updateError)
    }

    console.log('✅ User confirmed and created:', pending.email)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Email confirmed successfully! You can now log in.',
        email: pending.email,
        userId: authData.user.id
      }),
      { status: 200, headers: responseHeaders }
    )

  } catch (error) {
    console.error('Confirm email error:', error)

    return new Response(
      JSON.stringify({
        error: 'Server error',
        message: 'An unexpected error occurred. Please try again later.'
      }),
      { status: 500, headers: responseHeaders }
    )
  }
})
