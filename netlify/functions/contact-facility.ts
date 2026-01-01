import { Handler, HandlerEvent } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

// Use anon key for reads (facilities is public), service role for updates if available
const supabaseUrl = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Create client with anon key for public reads
const supabase = createClient(supabaseUrl, supabaseAnonKey);
// Create admin client for updates if service role key is available
const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

interface ContactRequest {
  contactRequestId: string;
  facility: {
    id: string;
    name: string;
    city: string;
    country: string;
  };
  user: {
    name: string;
    email: string;
    phone?: string;
  };
  procedureType: string;
  message?: string;
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
    const {
      contactRequestId,
      facility,
      user,
      procedureType,
      message
    } = JSON.parse(event.body || '{}') as ContactRequest;

    // Validate required fields
    if (!contactRequestId || !facility || !user || !procedureType) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    // Get facility email from database
    const { data: facilityData, error: facilityError } = await supabase
      .from('facilities')
      .select('contact_email, contact_phone, name')
      .eq('id', facility.id)
      .single();

    if (facilityError || !facilityData) {
      console.error('Facility lookup error:', facilityError);
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Facility not found' })
      };
    }

    // In production, you would send an actual email here using a service like SendGrid, AWS SES, or Resend
    // For now, we'll log the email that would be sent and update the contact request status

    const emailContent = {
      to: facilityData.contact_email || 'info@oasara.com', // Fallback to Oasara
      subject: `New Patient Inquiry - ${procedureType}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">New Patient Inquiry</h1>
          </div>

          <div style="padding: 30px; background: #f9fafb;">
            <h2 style="color: #1f2937; margin-bottom: 20px;">Patient Contact Request</h2>

            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #4b5563; margin-top: 0;">Patient Information</h3>
              <p><strong>Name:</strong> ${user.name}</p>
              <p><strong>Email:</strong> <a href="mailto:${user.email}">${user.email}</a></p>
              ${user.phone ? `<p><strong>Phone:</strong> <a href="tel:${user.phone}">${user.phone}</a></p>` : ''}
            </div>

            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #4b5563; margin-top: 0;">Procedure Details</h3>
              <p><strong>Procedure Type:</strong> ${procedureType}</p>
              <p><strong>Facility:</strong> ${facility.name}</p>
              <p><strong>Location:</strong> ${facility.city}, ${facility.country}</p>
            </div>

            ${message ? `
              <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="color: #4b5563; margin-top: 0;">Message from Patient</h3>
                <p style="white-space: pre-wrap;">${message}</p>
              </div>
            ` : ''}

            <div style="background: #eff6ff; padding: 20px; border-radius: 8px; border-left: 4px solid #2563eb;">
              <p style="margin: 0; color: #1e40af;">
                <strong>Next Steps:</strong> Please respond to this inquiry within 24 hours.
                The patient is actively comparing facilities and quick response times help win their trust.
              </p>
            </div>
          </div>

          <div style="padding: 20px; text-align: center; background: #e5e7eb; color: #6b7280; font-size: 12px;">
            <p>This inquiry was submitted via <strong>Oasara</strong> - The Medical Tourism Marketplace</p>
            <p>Request ID: ${contactRequestId}</p>
            <p><a href="https://oasara.com" style="color: #2563eb;">Visit Oasara</a></p>
          </div>
        </div>
      `
    };

    // Send email via Resend
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    let emailSent = false;
    let emailError = '';

    console.log('[contact-facility] Starting email send...');
    console.log('[contact-facility] RESEND_API_KEY configured:', !!RESEND_API_KEY);
    console.log('[contact-facility] Sending to:', emailContent.to, 'CC:', user.email);

    if (RESEND_API_KEY) {
      try {
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'Oasara <noreply@oasara.com>',
            to: [emailContent.to],
            cc: [user.email], // CC the patient so they have a copy
            subject: emailContent.subject,
            html: emailContent.html
          })
        });

        const responseText = await emailResponse.text();
        console.log('[contact-facility] Resend response status:', emailResponse.status);
        console.log('[contact-facility] Resend response:', responseText);

        if (emailResponse.ok) {
          const result = JSON.parse(responseText);
          console.log(`[contact-facility] Email sent to ${emailContent.to}, ID: ${result.id}`);
          emailSent = true;
        } else {
          try {
            const errorData = JSON.parse(responseText);
            emailError = errorData.message || errorData.error || 'Unknown Resend error';
            console.error('[contact-facility] Resend API error:', errorData);
          } catch {
            emailError = responseText || 'Unknown Resend error';
          }
        }
      } catch (emailErr) {
        emailError = emailErr instanceof Error ? emailErr.message : 'Email sending failed';
        console.error('[contact-facility] Email sending failed:', emailErr);
      }
    } else {
      emailError = 'RESEND_API_KEY not configured';
      console.error('[contact-facility] RESEND_API_KEY not configured');
    }

    // If email failed, return error so user knows
    if (!emailSent && emailError) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'Failed to send email',
          details: emailError
        })
      };
    }

    // Update contact request status to 'contacted' (use admin client if available)
    const updateClient = supabaseAdmin || supabase;
    const { error: updateError } = await updateClient
      .from('contact_requests')
      .update({
        status: 'contacted',
        updated_at: new Date().toISOString()
      })
      .eq('id', contactRequestId);

    if (updateError) {
      console.error('Error updating contact request:', updateError);
      // Don't fail the request if update fails - email was already sent
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        emailSent,
        message: emailSent ? 'Contact request sent successfully' : 'Contact request recorded (email delivery pending)',
        contactRequestId
      })
    };

  } catch (error) {
    console.error('Contact facility error:', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to send contact request',
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};

export { handler };
