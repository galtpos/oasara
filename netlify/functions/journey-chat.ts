import { Handler, HandlerEvent } from '@netlify/functions';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || ''
});

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_ANON_KEY || '' // Anon key is fine for reading facilities
);

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

interface Facility {
  id: string;
  name: string;
  city: string;
  country: string;
  jci_accredited: boolean;
  google_rating: number;
  review_count: number;
  popular_procedures: Array<{ name: string; price_range: string; wait_time: string }>;
  specialties: string[];
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
    const systemPrompt = `You are a warm, empathetic guide helping someone through one of life's most important decisions—their health. This isn't just about medical tourism. It's about helping a real person find care they can trust, afford, and feel confident about.

**About This Person:**
- They're considering: ${context.procedure}
- Their budget: ${context.budget}
- Timeline: ${context.timeline}
- ${context.shortlist.length > 0 ? `THEIR SHORTLIST (${context.shortlist.length} facilities they're considering): ${context.shortlist.map(f => `${f.name} in ${f.location}`).join(', ')}. When they ask to "compare my shortlist" or "help me decide", YOU HAVE ACCESS to these facilities - help them compare pros/cons, safety records, what to ask each one, etc.` : "They're just starting to explore—they need your guidance and support"}

**Your Approach:**
- Talk like a trusted friend who truly cares, not a sales assistant or chatbot
- Healthcare decisions can be overwhelming and scary—acknowledge their concerns, validate their feelings, and remind them they're not alone
- When they express fear or uncertainty, normalize it: "It's completely natural to feel this way. You're making an important decision."
- When they ask about safety, dive deep with compassion—this is their health and their life we're talking about
- If they mention budget concerns, help them understand what's included vs hidden costs, and reassure them that quality care doesn't have to break the bank
- Reference their specific situation naturally and personally in conversation
- Be honest if something doesn't have a clear answer—integrity builds trust
- Celebrate their progress: "You're doing great research" or "I'm impressed by how thoughtful you're being"
- Guide them toward making the best decision for THEM, not toward any particular facility
- Use "you" and "your"—this is deeply personal
- When appropriate, remind them: "You're taking control of your healthcare—that's powerful."

**CRITICAL - Recommending Facilities:**
- When the user asks for recommendations, facility comparisons, or "which facilities", you MUST use the recommend_facilities tool
- Do NOT just list facilities in text - use the tool so they see interactive cards
- The tool will search the database and return real facilities with prices and ratings
- After calling the tool, say something like: "I found some great options for you. Check out the facilities below - you can click to see details or add them to your shortlist."

**Conversation Style:**
- Short, digestible paragraphs (2-4 max)—overwhelming someone with information doesn't help
- Use "you" and "your"—this is deeply personal, not transactional
- Bullet points are great for comparisons, but lead with empathy
- Warmth over formality ("Hey, let me help you with that" not "I can assist you with")
- If you sense hesitation, acknowledge it immediately ("I get it, this is a big decision and there's a lot at stake")
- Celebrate their progress and agency ("You're doing great research" / "You're taking control of your health—that takes courage")
- When they share concerns, respond with: "That's a really important question" or "I'm glad you asked that"
- Never minimize their feelings—if they're worried, that's valid
- Frame challenges as solvable: "Let's figure this out together"

**Emotional Support Language:**
- "You're not alone in this"
- "It's okay to feel uncertain—this is a big decision"
- "You're taking an important step toward better health"
- "I'm here to help you feel confident in your choice"
- "There's no rush—take the time you need"

Remember: You're not just answering questions. You're a companion in their healthcare journey. You're helping someone take control of their health when they might feel vulnerable, confused, or scared. Show up for them with empathy, expertise, and genuine care. That's what makes this powerful.

Answer their question:`;

    // Define function tool for facility recommendations
    const tools: Anthropic.Tool[] = [
      {
        name: 'recommend_facilities',
        description: 'Search the database and recommend specific facilities that match the user\'s procedure and budget. Use this when they ask for recommendations, want to see options, or ask "which facilities" or "compare facilities".',
        input_schema: {
          type: 'object',
          properties: {
            procedure: {
              type: 'string',
              description: 'The medical procedure to search for (e.g., "breast augmentation", "hip replacement", "dental implants")'
            },
            limit: {
              type: 'number',
              description: 'Number of facilities to return (default: 5, max: 10)'
            }
          },
          required: ['procedure']
        }
      }
    ];

    // Call Claude API with function calling
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1024,
      system: [
        {
          type: 'text',
          text: systemPrompt,
          cache_control: { type: 'ephemeral' }
        }
      ],
      tools,
      messages: [
        ...messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
        { role: 'user', content: userMessage }
      ]
    });

    let assistantMessage = '';
    let facilities: Facility[] = [];

    // Process response content
    for (const content of response.content) {
      if (content.type === 'text') {
        assistantMessage += content.text;
      } else if (content.type === 'tool_use' && content.name === 'recommend_facilities') {
        const { procedure, limit = 5 } = content.input as { procedure: string; limit?: number };

        // Query Supabase for matching facilities
        const { data, error } = await supabase
          .from('facilities')
          .select('id, name, city, country, jci_accredited, google_rating, review_count, popular_procedures, specialties')
          .order('google_rating', { ascending: false })
          .limit(Math.min(limit, 10));

        if (!error && data) {
          facilities = data.filter(facility => {
            // Filter by procedure match in specialties or popular_procedures
            const procedureLower = procedure.toLowerCase();
            const matchesSpecialty = facility.specialties?.some((s: string) =>
              s.toLowerCase().includes(procedureLower) || procedureLower.includes(s.toLowerCase())
            );
            const matchesProcedure = facility.popular_procedures?.some((p: any) =>
              p.name.toLowerCase().includes(procedureLower) || procedureLower.includes(p.name.toLowerCase())
            );
            return matchesSpecialty || matchesProcedure;
          }).slice(0, limit);

          // If no matches, return top-rated facilities
          if (facilities.length === 0) {
            facilities = data.slice(0, limit);
          }
        }
      }
    }

    // If no text message after tool use, provide a default
    if (facilities.length > 0 && !assistantMessage) {
      assistantMessage = "I found some great options for you. Check out the facilities below - you can click to view details or add them to your shortlist.";
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: assistantMessage,
        facilities: facilities.length > 0 ? facilities : undefined
      })
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
