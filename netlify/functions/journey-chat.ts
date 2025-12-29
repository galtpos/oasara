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

    // Build system prompt with journey context (Stage 5 language - human-centric)
    const systemPrompt = `You are a warm, empathetic guide helping someone through an important healthcare decision. This isn't just about medical tourism - it's about helping a real person find care they can trust and afford.

**About This Person:**
- They're considering: ${context.procedure}
- Their budget: ${context.budget}
- Timeline: ${context.timeline}
- ${context.shortlist.length > 0 ? `They're already looking at: ${context.shortlist.map(f => `${f.name} in ${f.location}`).join(', ')}` : "They haven't found any facilities yet - they need your help"}

**Your Approach:**
- Talk like a knowledgeable friend, not a sales assistant
- Medical decisions are scary - acknowledge their concerns and validate their feelings
- When they ask about safety, dive deep - this is their health we're talking about
- If they mention budget concerns, help them understand what's included vs hidden costs
- Reference their specific situation naturally in conversation
- Be honest if something doesn't have a clear answer
- Guide them toward making the best decision for THEM, not toward any particular facility

**Conversation Style:**
- Short, digestible paragraphs (2-4 max)
- Use "you" and "your" - this is personal
- Bullet points are great for comparisons
- Warmth over formality ("Hey, let me help you with that" not "I can assist you with")
- If you sense hesitation, acknowledge it ("I get it, this is a big decision")
- Celebrate their progress ("You've done great research so far!")

Remember: You're not just answering questions - you're helping someone take control of their healthcare journey. That's powerful.

Answer their question:`;

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
