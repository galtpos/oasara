import { Handler, HandlerEvent } from '@netlify/functions';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || ''
});

interface ChatRequest {
  messages: Array<{ role: string; content: string }>;
  userMessage: string;
  context: {
    journeyId?: string | null;
    userId?: string | null;
  };
}

const handler: Handler = async (event: HandlerEvent) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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
    const { messages, userMessage, context } = JSON.parse(event.body || '{}') as ChatRequest;

    // Create Supabase client with user's auth token if provided
    const authHeader = event.headers.authorization || event.headers.Authorization;
    const supabase = createClient(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_ANON_KEY || '',
      authHeader ? {
        global: {
          headers: {
            Authorization: authHeader
          }
        }
      } : undefined
    );

    // Stage 5 System Prompt
    const systemPrompt = `You are Oasara's medical tourism assistant. Your communication style follows Stage 5 principles:

**STAGE 5 LANGUAGE - "WE" FRAMING:**
- Use "we" framing: "Let's find facilities for your knee replacement"
- Assume positive outcome: "You WILL find excellent care" (not "might")
- Empathy & reassurance: "Medical decisions feel overwhelming—that's completely normal"
- NO AI SLOP: Never say "Based on the context provided..." - get straight to the answer
- Medical trust: Always mention JCI accreditation, show US cost savings, name surgeons with credentials

**YOUR ROLE:**
You're not a chatbot. You're a trusted advisor who genuinely cares about helping someone find quality, affordable healthcare.

**CONVERSATION STYLE:**
- Short, digestible paragraphs (2-4 sentences max)
- Use "you" and "your"—this is deeply personal
- Warmth over formality: "Hey, let me help you with that" not "I can assist you with"
- If you sense hesitation, acknowledge it: "I get it, this is a big decision"
- Celebrate progress: "You're taking control of your health—that takes courage"

**EMOTIONAL SUPPORT:**
- "You're not alone in this"
- "It's okay to feel uncertain—this is a big decision"
- "You're taking an important step toward better health"
- "There's no rush—take the time you need"

**BUDGET HANDLING - EDUCATE FIRST:**
DON'T ask users for budget numbers - they don't know what things cost!

Instead, EDUCATE them first:
1. When they mention a procedure, immediately tell them US costs:
   - "In the US, [procedure] typically runs $X - $Y"
   - "Going abroad, you can save 50-80%, paying $X - $Y instead"

2. Give them context with examples:
   - "Hip replacement: US $40k-80k → Thailand $12k-18k (70% savings)"
   - "Dental implants: US $3k-5k per tooth → Mexico $800-1,500 (70% savings)"
   - "Knee replacement: US $35k-65k → Costa Rica $15k-22k (60% savings)"

3. Then ask QUALITATIVE preference:
   - "Are you looking to save as much as possible, or is quality your top priority?"
   - NOT "What's your budget?"

4. Only if they volunteer a number, use it. Otherwise leave budget wide open.

**AVAILABLE TOOLS:**
You have 12 tools to help users manage their medical tourism journey:
1. create_journey - Creates initial journey (procedure, timeline, optional budget)
2. search_facilities - Find hospitals matching criteria
3. add_facility_to_shortlist - Add facility to comparison list
4. remove_facility_from_shortlist - Remove facility from list
5. generate_comparison - Create side-by-side comparison
6. get_facility_details - Get detailed info about facility
7. add_journey_note - Add reminder/note to journey
8. share_journey - Share journey with family/friends
9. invite_collaborator - Invite someone to help decide
10. contact_facility - Request quote from facility
11. export_journey_pdf - Generate PDF report
12. get_journey_summary - Get overview of current journey

**CRITICAL TOOL USAGE RULES:**

🚨 **AFTER CREATING A JOURNEY, IMMEDIATELY SEARCH** 🚨
When you call create_journey, you MUST ALSO call search_facilities in the SAME response.
Don't just say "let's find options" - actually find them by calling the tool!

🚨 **DO NOT USE YOUR TRAINING DATA TO ANSWER QUESTIONS ABOUT FACILITIES** 🚨

When a user asks ANYTHING about:
- A specific location (e.g. "Lisbon", "Thailand", "Mexico")
- A specific procedure (e.g. "breast augmentation", "dental implants")
- What procedures are popular/available somewhere
- What facilities exist

YOU MUST:
1. STOP - Do NOT give generic answers from your training
2. IMMEDIATELY call search_facilities tool FIRST
3. WAIT for the search results
4. THEN respond based ONLY on what the search returned

If search returns 0 results: "I don't have facilities in that location yet. Let me try searching nearby countries or tell me another location."

If search returns results: Show the facility cards and describe what you found.

**Example of WRONG behavior:**
User: "What procedures are popular in Lisbon?"
❌ BAD: "Lisbon is known for dental work and cosmetic procedures..."
✅ CORRECT: *calls search_facilities for Lisbon* then responds with actual results

- After tool use, explain what you did in human terms
- If journey doesn't exist yet, guide them through onboarding first

Answer their question:`;

    // Define all 12 function calling tools
    const tools: Anthropic.Tool[] = [
      {
        name: 'create_journey',
        description: 'Creates a new patient journey. Only needs procedure and timeline. Budget is OPTIONAL - only include if user explicitly mentions a number.',
        input_schema: {
          type: 'object',
          properties: {
            procedure: {
              type: 'string',
              description: 'Medical procedure (e.g., "Knee Replacement", "Dental Implants")'
            },
            budgetMin: {
              type: 'number',
              description: 'OPTIONAL: Minimum budget in USD. Only set if user explicitly gave a number.'
            },
            budgetMax: {
              type: 'number',
              description: 'OPTIONAL: Maximum budget in USD. Only set if user explicitly gave a number.'
            },
            budgetPreference: {
              type: 'string',
              enum: ['save_most', 'balanced', 'quality_first', 'no_preference'],
              description: 'User preference: save_most (cheapest), balanced (value), quality_first (best regardless of cost), no_preference (show all)'
            },
            timeline: {
              type: 'string',
              enum: ['urgent', 'soon', 'flexible'],
              description: 'Urgency: urgent (<2 weeks), soon (1-3 months), flexible (3+ months)'
            }
          },
          required: ['procedure', 'timeline']
        }
      },
      {
        name: 'search_facilities',
        description: 'Searches for medical facilities based on criteria. Use when user asks to find/search facilities.',
        input_schema: {
          type: 'object',
          properties: {
            procedure: {
              type: 'string',
              description: 'Procedure type to filter by'
            },
            country: {
              type: 'string',
              description: 'Country name (e.g., "Thailand", "Mexico")'
            },
            limit: {
              type: 'number',
              description: 'Number of results (default: 5, max: 10)'
            }
          },
          required: []
        }
      },
      {
        name: 'add_facility_to_shortlist',
        description: 'Adds a facility to patient\'s shortlist. Use when user says "add [facility]". Use facility_name to look it up.',
        input_schema: {
          type: 'object',
          properties: {
            facility_name: {
              type: 'string',
              description: 'Name of facility to add (e.g., "Hospital Angeles Tijuana")'
            }
          },
          required: ['facility_name']
        }
      },
      {
        name: 'remove_facility_from_shortlist',
        description: 'Removes facility from shortlist. Use when user says "remove [facility]".',
        input_schema: {
          type: 'object',
          properties: {
            facility_name: {
              type: 'string',
              description: 'Name of facility to remove'
            }
          },
          required: ['facility_name']
        }
      },
      {
        name: 'generate_comparison',
        description: 'Generates side-by-side comparison of shortlisted facilities.',
        input_schema: {
          type: 'object',
          properties: {},
          required: []
        }
      },
      {
        name: 'get_facility_details',
        description: 'Gets detailed information about a specific facility.',
        input_schema: {
          type: 'object',
          properties: {
            facility_id: {
              type: 'string',
              description: 'Facility ID'
            }
          },
          required: ['facility_id']
        }
      },
      {
        name: 'add_journey_note',
        description: 'Adds a note/reminder to the journey.',
        input_schema: {
          type: 'object',
          properties: {
            note_text: {
              type: 'string',
              description: 'Note content'
            },
            note_type: {
              type: 'string',
              enum: ['general', 'question', 'concern', 'todo', 'research'],
              description: 'Type of note'
            }
          },
          required: ['note_text']
        }
      },
      {
        name: 'share_journey',
        description: 'Shares journey with another person via email.',
        input_schema: {
          type: 'object',
          properties: {
            email: {
              type: 'string',
              description: 'Email address to share with'
            },
            role: {
              type: 'string',
              enum: ['viewer', 'editor'],
              description: 'Permission level'
            }
          },
          required: ['email', 'role']
        }
      },
      {
        name: 'invite_collaborator',
        description: 'Invites someone to actively collaborate on decision.',
        input_schema: {
          type: 'object',
          properties: {
            email: {
              type: 'string',
              description: 'Email address to invite'
            }
          },
          required: ['email']
        }
      },
      {
        name: 'contact_facility',
        description: 'Sends quote request to facility.',
        input_schema: {
          type: 'object',
          properties: {
            facility_id: {
              type: 'string',
              description: 'Facility ID'
            },
            message: {
              type: 'string',
              description: 'Optional custom message'
            }
          },
          required: ['facility_id']
        }
      },
      {
        name: 'export_journey_pdf',
        description: 'Generates and emails PDF of comparison.',
        input_schema: {
          type: 'object',
          properties: {},
          required: []
        }
      },
      {
        name: 'get_journey_summary',
        description: 'Gets summary of current journey state.',
        input_schema: {
          type: 'object',
          properties: {},
          required: []
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
    let facilities: any[] = [];
    let journeyId: string | null = context.journeyId || null;

    // Process response content and handle tool calls
    for (const content of response.content) {
      if (content.type === 'text') {
        assistantMessage += content.text;
      } else if (content.type === 'tool_use') {
        // Handle each tool
        switch (content.name) {
          case 'create_journey':
            {
              const { procedure, budgetMin, budgetMax, budgetPreference, timeline } = content.input as any;

              // Budget is now optional - only validate if provided
              if (budgetMin !== undefined && budgetMax !== undefined) {
                if (budgetMin < 0 || budgetMax < 0 || budgetMin > budgetMax) {
                  assistantMessage += "\n\nI noticed something off with the budget. Let's verify those numbers.";
                  break;
                }
              }

              // Create journey in database (requires userId)
              if (context.userId) {
                const journeyData: any = {
                  user_id: context.userId,
                  procedure_type: procedure,
                  timeline,
                  status: 'researching'
                };

                // Only add budget if explicitly provided
                if (budgetMin !== undefined) journeyData.budget_min = budgetMin;
                if (budgetMax !== undefined) journeyData.budget_max = budgetMax;
                if (budgetPreference) journeyData.budget_preference = budgetPreference;

                const { data, error } = await supabase
                  .from('patient_journeys')
                  .insert(journeyData)
                  .select()
                  .single();

                if (!error && data) {
                  journeyId = data.id;
                  assistantMessage += `\n\n✅ Perfect! I've created your ${procedure} journey. Let's find some excellent options for you.`;
                } else {
                  console.error('Error creating journey:', error);
                  assistantMessage += `\n\nI had trouble creating your journey. Error: ${error?.message || 'Unknown error'}`;
                }
              } else {
                assistantMessage += '\n\n**To save your journey, please [log in](/login) or [create an account](/signup).** I can still help you explore options!';
              }
            }
            break;

          case 'search_facilities':
            {
              const { procedure, country, limit = 5 } = content.input as any;

              let query = supabase
                .from('facilities')
                .select('id, name, city, country, jci_accredited, google_rating, review_count, popular_procedures')
                .order('google_rating', { ascending: false })
                .limit(Math.min(limit, 10));

              if (country) {
                query = query.ilike('country', `%${country}%`);
              }

              const { data, error } = await query;

              if (!error && data) {
                facilities = data.filter(facility => {
                  if (!procedure) return true;
                  const procedureLower = procedure.toLowerCase();
                  return facility.popular_procedures?.some((p: any) =>
                    p.name.toLowerCase().includes(procedureLower) || procedureLower.includes(p.name.toLowerCase())
                  );
                }).slice(0, limit);

                if (facilities.length === 0) {
                  facilities = data.slice(0, limit);
                }

                // Smart messaging for search results
                if (facilities.length === 0) {
                  assistantMessage += '\n\n**Unfortunately, I couldn\'t find facilities in that specific location right now.** Our database is growing daily! Let me try:\n\n- Searching nearby countries\n- Showing top-rated facilities in popular destinations\n- Or you can tell me a different location to search.';
                } else {
                  assistantMessage += `\n\n**I found ${facilities.length} excellent ${facilities.length === 1 ? 'option' : 'options'} for you.** Check them out below:`;
                }
              }
            }
            break;

          case 'add_facility_to_shortlist':
            {
              if (!context.journeyId || !context.userId) {
                assistantMessage += '\n\n**To add facilities, please [log in](/login) first.**';
                break;
              }

              const { facility_name } = content.input as any;

              // Look up facility by name
              const { data: facilityMatch, error: lookupError } = await supabase
                .from('facilities')
                .select('id, name')
                .ilike('name', `%${facility_name}%`)
                .limit(1)
                .single();

              if (lookupError || !facilityMatch) {
                assistantMessage += `\n\nI couldn't find a facility named "${facility_name}". Please check the spelling or try a different one.`;
                break;
              }

              const { error } = await supabase
                .from('journey_facilities')
                .insert({
                  journey_id: context.journeyId,
                  facility_id: facilityMatch.id
                });

              if (!error) {
                assistantMessage += `\n\n✅ Added **${facilityMatch.name}** to your shortlist!`;
              } else {
                assistantMessage += `\n\n**${facilityMatch.name}** is already in your shortlist.`;
              }
            }
            break;

          case 'remove_facility_from_shortlist':
            {
              if (!context.journeyId || !context.userId) {
                assistantMessage += '\n\n**To remove facilities, please [log in](/login) first.**';
                break;
              }

              const { facility_name } = content.input as any;

              // Look up facility by name
              const { data: facilityMatch, error: lookupError } = await supabase
                .from('facilities')
                .select('id, name')
                .ilike('name', `%${facility_name}%`)
                .limit(1)
                .single();

              if (lookupError || !facilityMatch) {
                assistantMessage += `\n\nI couldn't find a facility named "${facility_name}".`;
                break;
              }

              const { error } = await supabase
                .from('journey_facilities')
                .delete()
                .eq('journey_id', context.journeyId)
                .eq('facility_id', facilityMatch.id);

              if (!error) {
                assistantMessage += `\n\n✅ Removed **${facilityMatch.name}** from your shortlist!`;
              } else {
                assistantMessage += `\n\n**${facilityMatch.name}** wasn't in your shortlist.`;
              }
            }
            break;

          case 'generate_comparison':
            {
              if (!context.journeyId || !context.userId) {
                assistantMessage += '\n\n**To generate comparisons, please [log in](/login) first.**';
                break;
              }

              // Get all shortlisted facilities for this journey
              const { data: shortlist, error: shortlistError } = await supabase
                .from('journey_facilities')
                .select('facility_id')
                .eq('journey_id', context.journeyId);

              if (shortlistError || !shortlist || shortlist.length === 0) {
                assistantMessage += '\n\n**You haven\'t added any facilities to your shortlist yet.** Search for facilities and tell me to "add [facility name]" to build your comparison.';
                break;
              }

              // Get full facility details for each shortlisted facility
              const facilityIds = shortlist.map(s => s.facility_id);
              const { data: comparisonFacilities, error: facilitiesError } = await supabase
                .from('facilities')
                .select('*')
                .in('id', facilityIds);

              if (facilitiesError || !comparisonFacilities) {
                assistantMessage += '\n\n**I had trouble loading your shortlisted facilities.** Please try again.';
                break;
              }

              // Save comparison to database
              const { error: comparisonError } = await supabase
                .from('journey_comparisons')
                .insert({
                  journey_id: context.journeyId,
                  facilities: comparisonFacilities.map(f => f.id),
                  comparison_data: comparisonFacilities
                });

              if (comparisonError) {
                console.error('Error saving comparison:', comparisonError);
              }

              // Set facilities for frontend to render
              facilities = comparisonFacilities;

              assistantMessage += `\n\n📊 **Here's your side-by-side comparison of ${comparisonFacilities.length} facilities:**\n\nI've pulled together all the key details you need to make your decision. Take your time reviewing each option.`;
            }
            break;

          // Stubs for Phase 2-4 tools

          case 'get_facility_details':
            assistantMessage += '\n\n🏥 **Detailed facility view is coming in Phase 2!** Click "View Details" on any facility card.';
            break;

          case 'add_journey_note':
            assistantMessage += '\n\n📝 **Note-taking is coming in Phase 3!** I\'ll remember to ask you about that.';
            break;

          case 'share_journey':
            assistantMessage += '\n\n🔗 **Journey sharing is coming in Phase 3!** You\'ll be able to share with family soon.';
            break;

          case 'invite_collaborator':
            assistantMessage += '\n\n👥 **Collaborator invites are coming in Phase 3!**';
            break;

          case 'contact_facility':
            assistantMessage += '\n\n📧 **Facility contact is coming in Phase 3!** You can contact them directly for now.';
            break;

          case 'export_journey_pdf':
            assistantMessage += '\n\n📄 **PDF export is coming in Phase 4!**';
            break;

          case 'get_journey_summary':
            assistantMessage += '\n\n📋 **Journey summary is coming in Phase 2!** Check your [dashboard](/my-journey).';
            break;

          default:
            console.warn('Unknown tool:', content.name);
        }
      }
    }

    // Default message if empty
    if (!assistantMessage) {
      assistantMessage = "I'm here to help! What would you like to know?";
    }

    // Save conversation to database if we have a journeyId
    if (journeyId) {
      try {
        // Save user message
        await supabase.from('conversation_history').insert({
          journey_id: journeyId,
          role: 'user',
          content: userMessage,
          timestamp: new Date().toISOString()
        });

        // Save assistant message
        await supabase.from('conversation_history').insert({
          journey_id: journeyId,
          role: 'assistant',
          content: assistantMessage,
          timestamp: new Date().toISOString(),
          metadata: facilities.length > 0 ? { facilities } : null
        });
      } catch (dbError) {
        console.error('Failed to save conversation:', dbError);
        // Don't fail the request if DB save fails
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: assistantMessage,
        facilities: facilities.length > 0 ? facilities : undefined,
        journeyId: journeyId || undefined
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
