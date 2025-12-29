import { Handler, HandlerEvent } from '@netlify/functions';
import emailjs from '@emailjs/browser';

interface InvitationRequest {
  to: string;
  inviterEmail: string;
  procedureType: string;
  invitationToken: string;
  role: 'viewer' | 'owner';
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
    if (!to || !inviterEmail || !procedureType || !invitationToken) {
      throw new Error('Missing required fields');
    }

    // EmailJS configuration (from environment variables)
    const EMAILJS_SERVICE_ID = process.env.EMAILJS_SERVICE_ID || 'default_service';
    const EMAILJS_TEMPLATE_ID = 'journey_invitation'; // Template ID for journey invitations
    const EMAILJS_PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY;

    if (!EMAILJS_PUBLIC_KEY) {
      throw new Error('EmailJS configuration missing');
    }

    // Generate invitation link
    const inviteLink = `${process.env.URL || 'https://oasara.com'}/journey/accept-invite/${invitationToken}`;

    // Prepare email template parameters
    const templateParams = {
      to_email: to,
      inviter_email: inviterEmail,
      procedure_type: procedureType,
      invite_link: inviteLink,
      role: role === 'viewer' ? 'view' : 'collaborate on',
      expires_in: '7 days'
    };

    // For server-side EmailJS, we use a direct API call instead of the browser SDK
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        service_id: EMAILJS_SERVICE_ID,
        template_id: EMAILJS_TEMPLATE_ID,
        user_id: EMAILJS_PUBLIC_KEY,
        template_params: templateParams
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`EmailJS API error: ${errorData}`);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Invitation email sent successfully'
      })
    };

  } catch (error) {
    console.error('Email sending error:', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to send invitation email',
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};

export { handler };
