import { Handler, HandlerEvent } from '@netlify/functions';

interface InvitationRequest {
  to: string;
  inviterEmail: string;
  procedureType: string;
  invitationToken: string;
  role: 'viewer' | 'editor';
}

const handler: Handler = async (event: HandlerEvent) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle OPTIONS request for CORS
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { to, inviterEmail, procedureType, invitationToken, role } = JSON.parse(event.body || '{}') as InvitationRequest;

    // Validate required fields
    if (!to || !invitationToken) {
      throw new Error('Missing required fields');
    }

    // Generate invitation link
    const inviteLink = `${process.env.URL || 'https://oasara.com'}/journey/accept-invite/${invitationToken}`;

    // For now, we skip actual email sending (would need Resend, SendGrid, etc.)
    // The invitation is already created in the database by ShareJourneyModal
    // User can copy the link directly from the UI

    console.log(`[send-journey-invitation] Invitation created for ${to}`);
    console.log(`[send-journey-invitation] Link: ${inviteLink}`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Invitation created successfully',
        inviteLink: inviteLink
      })
    };

  } catch (error) {
    console.error('Invitation error:', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to create invitation',
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};

export { handler };
