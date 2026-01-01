import { Handler, HandlerEvent } from '@netlify/functions';

interface InvitationRequest {
  to: string;
  inviterEmail: string;
  procedureType: string;
  invitationToken: string;
  role: 'viewer' | 'editor';
}

const handler: Handler = async (event: HandlerEvent) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

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
    const { to, inviterEmail, procedureType, invitationToken } = JSON.parse(event.body || '{}') as InvitationRequest;

    if (!to || !invitationToken) {
      throw new Error('Missing required fields');
    }

    const inviteLink = `${process.env.URL || 'https://oasara.com'}/journey/accept-invite/${invitationToken}`;

    // Send email via Resend
    const RESEND_API_KEY = process.env.RESEND_API_KEY;

    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY not configured');
      throw new Error('Email service not configured');
    }

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Oasara <onboarding@resend.dev>',
        to: [to],
        subject: `You've been invited to view a medical journey on Oasara`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
              <tr>
                <td style="padding: 40px 30px; text-align: center; background: linear-gradient(135deg, #1a4a5e 0%, #2d6a7a 100%);">
                  <h1 style="color: #ffffff; margin: 0; font-size: 32px; letter-spacing: 2px;">OASARA</h1>
                  <p style="color: #d4af37; margin: 10px 0 0 0; font-size: 14px;">Your Medical Tourism Companion</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="color: #1a4a5e; margin: 0 0 20px 0; font-size: 24px;">You're Invited!</h2>
                  <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                    ${inviterEmail ? `<strong>${inviterEmail}</strong> has` : 'Someone has'} invited you to view their medical journey for <strong>${procedureType || 'a procedure'}</strong>.
                  </p>
                  <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                    As a viewer, you'll be able to see their shortlisted facilities, research notes, and help them make an informed decision about their healthcare journey.
                  </p>
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${inviteLink}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #1a4a5e 0%, #2d6a7a 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                      View Journey
                    </a>
                  </div>
                  <p style="color: #718096; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
                    This invitation will expire in 7 days. If you didn't expect this email, you can safely ignore it.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding: 30px; background-color: #f7fafc; border-top: 1px solid #e2e8f0;">
                  <p style="color: #718096; font-size: 12px; margin: 0; text-align: center;">
                    Oasara - Making quality healthcare accessible worldwide<br>
                    <a href="https://oasara.com" style="color: #1a4a5e;">oasara.com</a>
                  </p>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `
      })
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json();
      console.error('Resend API error:', errorData);
      throw new Error(errorData.message || 'Failed to send email');
    }

    const result = await emailResponse.json();
    console.log(`[send-journey-invitation] Email sent to ${to}, ID: ${result.id}`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Invitation sent successfully',
        inviteLink: inviteLink
      })
    };

  } catch (error) {
    console.error('Invitation error:', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to send invitation',
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};

export { handler };
