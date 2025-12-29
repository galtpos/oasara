import { Handler, HandlerEvent } from '@netlify/functions';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || ''
});

interface ChatRequest {
  messages: Array<{ role: string; content: string }>;
  userMessage: string;
  context: {
    procedure: string;
    budget: string;
    timeline: string;
    shortlist: Array<{ name: string; location: string }>;
  };
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
    const { messages, userMessage, context } = JSON.parse(event.body || '{}') as ChatRequest;

    // Build system prompt with journey context
    const systemPrompt = `You are Oasara's medical tourism assistant. You help patients make informed decisions about medical tourism.

**Patient's Journey Context:**
- Procedure: ${context.procedure}
- Budget: ${context.budget}
- Timeline: ${context.timeline}
- Shortlist: ${context.shortlist.length > 0 ? context.shortlist.map(f => `${f.name} (${f.location})`).join(', ') : 'No facilities yet'}

**Your Role:**
- Answer questions about facilities, procedures, pricing, safety, and medical tourism
- Provide objective, helpful information
- Be empathetic - medical decisions are stressful
- Reference their specific journey context when relevant
- If asked about facilities on their shortlist, discuss those specifically
- Recommend exploring oasara.com for detailed facility information

**Guidelines:**
- Keep responses concise (2-4 paragraphs max)
- Use bullet points for lists
- Be warm and supportive, not clinical
- If you don't know something, say so honestly
- Always prioritize patient safety and due diligence

Answer the patient's question:`;

    // Call Claude API
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        ...messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
        { role: 'user', content: userMessage }
      ]
    });

    const assistantMessage = response.content[0].type === 'text'
      ? response.content[0].text
      : 'I apologize, but I had trouble generating a response. Please try again.';

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: assistantMessage })
    };

  } catch (error) {
    console.error('Chat error:', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to process chat request',
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};

export { handler };
