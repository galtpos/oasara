import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Milestone thresholds for exclusivity messaging
const MILESTONES = [250, 500, 1000, 2500, 5000, 10000]

function getNextMilestone(currentCount: number): number {
  for (const milestone of MILESTONES) {
    if (currentCount < milestone) {
      return milestone
    }
  }
  return MILESTONES[MILESTONES.length - 1] + 5000 // Keep adding 5000 after last milestone
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
    // Get Mailchimp credentials
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

    // Fetch subscribers with OASARA tag
    const segmentUrl = `https://${MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0/lists/${MAILCHIMP_LIST_ID}/members?count=1000&status=subscribed`

    const response = await fetch(segmentUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${MAILCHIMP_API_KEY}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('❌ Mailchimp API error:', errorData)
      return new Response(
        JSON.stringify({
          error: 'Failed to fetch count',
          message: 'Could not retrieve signup count'
        }),
        { status: 500, headers: responseHeaders }
      )
    }

    const data = await response.json()

    // Filter for members with OASARA tag
    const oasaraMembers = data.members.filter((member: any) =>
      member.tags?.some((tag: any) => tag.name === 'OASARA')
    )

    const currentCount = oasaraMembers.length
    const nextMilestone = getNextMilestone(currentCount)
    const spotsRemaining = nextMilestone - currentCount
    const percentFilled = Math.round((currentCount / nextMilestone) * 100)

    return new Response(
      JSON.stringify({
        success: true,
        count: currentCount,
        milestone: nextMilestone,
        spotsRemaining,
        percentFilled,
        isAlmostFull: spotsRemaining <= 50,
        isCritical: spotsRemaining <= 20
      }),
      { status: 200, headers: responseHeaders }
    )

  } catch (error) {
    console.error('❌ Get signup count error:', error)

    return new Response(
      JSON.stringify({
        error: 'Server error',
        message: 'An unexpected error occurred.'
      }),
      { status: 500, headers: responseHeaders }
    )
  }
})
