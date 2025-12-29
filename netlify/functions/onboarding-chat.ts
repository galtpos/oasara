import { Handler, HandlerEvent } from '@netlify/functions';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || ''
});

interface ChatRequest {
  messages: Array<{ role: string; content: string }>;
  userMessage: string;
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
    const { messages, userMessage } = JSON.parse(event.body || '{}') as ChatRequest;

    // System prompt for conversational onboarding
    const systemPrompt = `You are a warm, conversational guide helping someone explore medical tourism options. Your job is to have a natural conversation that gently extracts the information needed to create their healthcare journey.

**Your Goal:**
Through natural conversation, learn:
1. What procedure they're interested in (be specific - "breast augmentation", "hip replacement", etc.)
2. Their budget range (min and max in USD)
3. Their timeline (urgent/flexible/planning)

**Conversation Style:**
- Start with open-ended questions: "What brings you here today?"
- Be conversational and warm - no interrogation vibes
- If they mention a procedure, confirm it: "Got it, you're looking into [procedure]. That's a big decision - I'm here to help!"
- If they don't mention budget, ask naturally: "Do you have a budget range in mind? Even a rough estimate helps me find the right options."
- If they don't mention timeline, ask: "How soon are you looking to do this? No rush - just helps me understand your situation."
- Acknowledge their concerns and validate feelings
- Once you have all THREE pieces of info, summarize and offer to create their personalized journey

**When You Have All Info:**
When you've collected procedure, budget (min/max), and timeline, say something like:
"Perfect! So you're looking at [PROCEDURE] with a budget around $[MIN]-$[MAX], and you're [TIMELINE]. Let me create your personalized journey so you can see your options - sound good?"

Then use the create_journey tool.

**Important:**
- Don't ask for all info at once - let it flow naturally
- If they're vague about budget, suggest ranges: "Are we talking $5k-10k, or more like $10k-20k?"
- For timeline: "urgent" (next 1-3 months), "flexible" (3-6 months), "planning" (6+ months)
- Be encouraging: "You're in the right place - we'll find you great options!"`;

    // Define the function tool for journey creation
    const tools: Anthropic.Tool[] = [
      {
        name: 'create_journey',
        description: 'Creates a personalized healthcare journey once you have all required information: procedure type, budget range (min/max), and timeline',
        input_schema: {
          type: 'object',
          properties: {
            procedure: {
              type: 'string',
              description: 'The specific medical procedure the person is interested in (e.g., "breast augmentation", "hip replacement", "dental implants")'
            },
            budgetMin: {
              type: 'number',
              description: 'Minimum budget in USD'
            },
            budgetMax: {
              type: 'number',
              description: 'Maximum budget in USD'
            },
            timeline: {
              type: 'string',
              enum: ['urgent', 'flexible', 'planning'],
              description: 'How soon they want to proceed: urgent (1-3 months), flexible (3-6 months), planning (6+ months)'
            }
          },
          required: ['procedure', 'budgetMin', 'budgetMax', 'timeline']
        }
      }
    ];

    // Call Claude API with function calling
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1024,
      system: systemPrompt,
      tools,
      messages: [
        ...messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
        { role: 'user', content: userMessage }
      ]
    });

    // Check if Claude wants to use the create_journey tool
    let createJourneyData = null;
    let assistantMessage = '';

    for (const content of response.content) {
      if (content.type === 'text') {
        assistantMessage += content.text;
      } else if (content.type === 'tool_use' && content.name === 'create_journey') {
        createJourneyData = content.input;
      }
    }

    // Validate journey data if present
    if (createJourneyData) {
      const { budgetMin, budgetMax, procedure } = createJourneyData as any;

      // Validate budget ranges
      if (typeof budgetMin !== 'number' || typeof budgetMax !== 'number') {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            error: 'Invalid budget values',
            message: 'Budget must be numeric values'
          })
        };
      }

      if (budgetMin < 0 || budgetMax < 0) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            error: 'Invalid budget range',
            message: 'Budget values must be positive'
          })
        };
      }

      if (budgetMin > budgetMax) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            error: 'Invalid budget range',
            message: 'Minimum budget cannot exceed maximum budget'
          })
        };
      }

      if (budgetMax > 1000000) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            error: 'Invalid budget range',
            message: 'Budget seems unrealistic. Please verify the amount.'
          })
        };
      }

      if (!procedure || typeof procedure !== 'string' || procedure.length < 3) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            error: 'Invalid procedure',
            message: 'Please specify a valid procedure type'
          })
        };
      }
    }

    // If no text message, provide a default
    if (!assistantMessage) {
      assistantMessage = "Great! I'm setting up your personalized journey now...";
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: assistantMessage,
        createJourney: createJourneyData
      })
    };

  } catch (error) {
    console.error('Onboarding chat error:', error);

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
