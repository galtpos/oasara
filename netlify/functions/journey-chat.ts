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
    procedure?: string;
    shortlist?: Array<{
      id: string;
      name: string;
      location: string;
    }>;
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

    // Debug logging
    console.log('[journey-chat] Received context:', JSON.stringify(context));
    console.log('[journey-chat] journeyId:', context?.journeyId);
    console.log('[journey-chat] userId:', context?.userId);

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

    // Build dynamic context about user's current state
    let userContext = '';
    if (context.journeyId) {
      userContext += `\n\n**CURRENT USER STATE:**\n`;
      userContext += `- Journey ID: ${context.journeyId}\n`;
      userContext += `- User ID: ${context.userId || 'Not logged in'}\n`;
      userContext += `- Procedure: ${context.procedure || 'Not specified'}\n`;

      if (context.shortlist && context.shortlist.length > 0) {
        userContext += `\n**USER'S SHORTLIST (${context.shortlist.length} facilities):**\n`;
        context.shortlist.forEach((f, i) => {
          userContext += `${i + 1}. ${f.name} - ${f.location}\n`;
        });
        userContext += `\n**IMPORTANT:** When user asks to "compare" or wants to see their shortlist, IMMEDIATELY call generate_comparison tool. Do NOT ask questions - they already have facilities!`;
      } else {
        userContext += `\n**SHORTLIST:** Empty - user needs to add facilities first.\n`;
      }
    }

    // Call Claude API with function calling
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: [
        {
          type: 'text',
          text: systemPrompt + userContext,
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
    let isComparison = false;
    let shortlistChanged = false; // Track if AI modified the shortlist

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
              // Use procedure from input, or fall back to journey's procedure from context
              const inputProcedure = (content.input as any).procedure;
              const procedure = inputProcedure || context.procedure;
              const { country, limit = 5 } = content.input as any;

              console.log('[search_facilities] Searching for procedure:', procedure, 'country:', country);

              let query = supabase
                .from('facilities')
                .select('id, name, city, country, jci_accredited, google_rating, review_count, popular_procedures, specialties')
                .order('google_rating', { ascending: false })
                .limit(Math.min(limit, 10));

              if (country) {
                query = query.ilike('country', `%${country}%`);
              }

              const { data, error } = await query;

              if (!error && data) {
                // Filter by procedure - ALWAYS use journey's procedure type
                const procedureToSearch = procedure || '';
                const procedureLower = procedureToSearch.toLowerCase();

                facilities = data.filter(facility => {
                  if (!procedureLower) return true;

                  // Check if procedure matches any of the facility's popular procedures
                  const hasMatchingProcedure = facility.popular_procedures?.some((p: any) => {
                    const procName = p.name?.toLowerCase() || '';
                    // Match if procedure contains the search term or vice versa
                    return procName.includes(procedureLower) || procedureLower.includes(procName);
                  });

                  // Also check facility specialties if available
                  const matchesSpecialty = facility.specialties?.toLowerCase().includes(procedureLower);

                  return hasMatchingProcedure || matchesSpecialty;
                }).slice(0, limit);

                // Smart messaging for search results - DON'T fall back to random facilities
                if (facilities.length === 0) {
                  assistantMessage += `\n\n**I couldn't find facilities offering ${procedure || 'that procedure'} in our database yet.**\n\nOur network is growing! In the meantime:\n- Try a different location\n- Ask about a related procedure\n- Or browse our [full facility list](/facilities) to see all options.`;
                } else {
                  // Add procedure-specific pricing to displayed facilities
                  facilities = facilities.map(facility => {
                    const matchingProc = facility.popular_procedures?.find((p: any) =>
                      p.name?.toLowerCase().includes(procedureLower) || procedureLower.includes(p.name?.toLowerCase() || '')
                    );
                    return {
                      ...facility,
                      matched_procedure: matchingProc || null,
                      procedure_price: matchingProc?.price_range || null
                    };
                  });

                  assistantMessage += `\n\n**I found ${facilities.length} excellent ${facilities.length === 1 ? 'option' : 'options'} for ${procedure || 'you'}:**`;
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

              console.log('[AddFacility] Inserting:', { journeyId: context.journeyId, facilityId: facilityMatch.id });

              const { error } = await supabase
                .from('journey_facilities')
                .insert({
                  journey_id: context.journeyId,
                  facility_id: facilityMatch.id
                });

              if (!error) {
                assistantMessage += `\n\n✅ Added **${facilityMatch.name}** to your shortlist!`;
                shortlistChanged = true; // Signal frontend to refresh
              } else {
                console.error('[AddFacility] Insert error:', error);
                // Check specific error codes
                if (error.code === '23505') {
                  // Unique constraint violation = duplicate
                  assistantMessage += `\n\n**${facilityMatch.name}** is already in your shortlist.`;
                } else if (error.code === '42501' || error.message?.includes('policy')) {
                  // RLS policy violation - the user doesn't own this journey
                  assistantMessage += `\n\n**Something went wrong** - please make sure you're logged in and this is your journey.`;
                } else {
                  assistantMessage += `\n\n**Couldn't add ${facilityMatch.name}** - ${error.message}`;
                }
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
                shortlistChanged = true; // Signal frontend to refresh
              } else {
                assistantMessage += `\n\n**${facilityMatch.name}** wasn't in your shortlist.`;
              }
            }
            break;

          case 'generate_comparison':
            {
              console.log('[generate_comparison] context.journeyId:', context.journeyId);
              console.log('[generate_comparison] context.userId:', context.userId);
              console.log('[generate_comparison] context.shortlist:', context.shortlist);

              if (!context.journeyId || !context.userId) {
                console.log('[generate_comparison] Missing journeyId or userId, returning login prompt');
                assistantMessage += '\n\n**To generate comparisons, please [log in](/login) first.**';
                break;
              }

              // Use shortlist from context (passed from frontend) to avoid RLS issues
              const shortlistFromContext = context.shortlist || [];

              if (shortlistFromContext.length === 0) {
                console.log('[generate_comparison] No facilities in context shortlist');
                assistantMessage += `\n\n**Your shortlist is empty!** Here's how to add facilities:

1. **Ask me to search**: "Find hospitals for ${context.procedure || 'my procedure'} in Thailand"
2. **Click "+ List"** on any facility card I show you
3. **Or use the dashboard**: Go to the "My Shortlist" tab and click "Add" on recommended facilities

Once you have 2+ facilities on your shortlist, I can create a detailed comparison for you!`;
                break;
              }

              // Get full facility details using the IDs from context
              const facilityIds = shortlistFromContext.map(s => s.id);
              console.log('[generate_comparison] Fetching details for facility IDs:', facilityIds);

              const { data: comparisonFacilities, error: facilitiesError } = await supabase
                .from('facilities')
                .select('*')
                .in('id', facilityIds);

              console.log('[generate_comparison] Facilities result:', comparisonFacilities?.length, 'facilities');
              console.log('[generate_comparison] Facilities error:', facilitiesError);

              if (facilitiesError || !comparisonFacilities || comparisonFacilities.length === 0) {
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

              // Set facilities for frontend to render as comparison table
              facilities = comparisonFacilities;
              isComparison = true;

              assistantMessage += `\n\n📊 **Here's your side-by-side comparison of ${comparisonFacilities.length} facilities:**\n\nI've pulled together all the key details you need to make your decision. Take your time reviewing each option.`;
            }
            break;

          // Stubs for Phase 2-4 tools

          case 'get_facility_details':
            {
              const { facility_id } = content.input as any;

              // Try to find facility by ID or name
              let facilityQuery = supabase
                .from('facilities')
                .select('*');

              // Check if it's a UUID or a name
              const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(facility_id);

              if (isUUID) {
                facilityQuery = facilityQuery.eq('id', facility_id);
              } else {
                facilityQuery = facilityQuery.ilike('name', `%${facility_id}%`);
              }

              const { data: facility, error: facilityError } = await facilityQuery.limit(1).single();

              if (facilityError || !facility) {
                assistantMessage += `\n\n**I couldn't find a facility matching "${facility_id}".** Try searching for facilities first.`;
                break;
              }

              // Build detailed response
              assistantMessage += `\n\n🏥 **${facility.name}**\n\n`;

              // Location & Contact
              assistantMessage += `📍 **Location:** ${facility.city}, ${facility.country}\n`;
              if (facility.address) {
                assistantMessage += `🏠 **Address:** ${facility.address}\n`;
              }
              if (facility.phone) {
                assistantMessage += `📞 **Phone:** ${facility.phone}\n`;
              }
              if (facility.email) {
                assistantMessage += `📧 **Email:** ${facility.email}\n`;
              }
              if (facility.website) {
                assistantMessage += `🌐 **Website:** [Visit Site](${facility.website})\n`;
              }

              assistantMessage += '\n---\n\n';

              // Credentials
              assistantMessage += '**Credentials & Quality:**\n';
              assistantMessage += `- JCI Accredited: ${facility.jci_accredited ? '✅ Yes' : '❌ No'}\n`;
              if (facility.google_rating) {
                assistantMessage += `- Google Rating: ⭐ ${facility.google_rating}/5 (${facility.review_count || 0} reviews)\n`;
              }
              if (facility.year_established) {
                assistantMessage += `- Established: ${facility.year_established}\n`;
              }

              // Procedures & Pricing
              if (facility.popular_procedures && facility.popular_procedures.length > 0) {
                assistantMessage += '\n**Popular Procedures:**\n';
                facility.popular_procedures.slice(0, 5).forEach((proc: any) => {
                  assistantMessage += `- **${proc.name}**: ${proc.price_range || 'Contact for pricing'}`;
                  if (proc.wait_time) {
                    assistantMessage += ` (Wait: ${proc.wait_time})`;
                  }
                  assistantMessage += '\n';
                });
              }

              // Payment & Amenities
              assistantMessage += '\n**Payment & Amenities:**\n';
              assistantMessage += `- Accepts Zano: ${facility.accepts_zano ? '✅ Yes' : '❌ Not yet'}\n`;
              if (facility.languages_spoken && facility.languages_spoken.length > 0) {
                assistantMessage += `- Languages: ${facility.languages_spoken.join(', ')}\n`;
              }
              if (facility.amenities && facility.amenities.length > 0) {
                assistantMessage += `- Amenities: ${facility.amenities.slice(0, 5).join(', ')}\n`;
              }

              // Description
              if (facility.description) {
                assistantMessage += `\n**About:**\n${facility.description.substring(0, 300)}${facility.description.length > 300 ? '...' : ''}\n`;
              }

              assistantMessage += `\n[View Full Details](/facilities/${facility.id})`;
            }
            break;

          case 'add_journey_note':
            {
              if (!context.journeyId || !context.userId) {
                assistantMessage += '\n\n**To save notes, please [log in](/login) first.**';
                break;
              }

              const { note_text, note_type = 'general' } = content.input as any;

              if (!note_text || note_text.trim().length === 0) {
                assistantMessage += '\n\n**Please tell me what you\'d like to note down.** For example: "Note: ask about recovery time"';
                break;
              }

              const { data: note, error: noteError } = await supabase
                .from('journey_notes')
                .insert({
                  journey_id: context.journeyId,
                  content: note_text.trim(),
                  note_type: note_type,
                  completed: false
                })
                .select()
                .single();

              if (noteError) {
                console.error('Note creation error:', noteError);
                assistantMessage += '\n\n**I had trouble saving that note.** Please try again.';
                break;
              }

              const noteTypeEmojis: Record<string, string> = {
                general: '📝',
                question: '❓',
                concern: '⚠️',
                todo: '✅',
                research: '🔍'
              };

              assistantMessage += `\n\n${noteTypeEmojis[note_type] || '📝'} **Got it! I've saved your note:**\n\n> "${note_text}"\n\nYou can view all your notes on the [journey dashboard](/my-journey).`;
            }
            break;

          case 'share_journey':
            {
              if (!context.journeyId || !context.userId) {
                assistantMessage += '\n\n**To share your journey, please [log in](/login) first.**';
                break;
              }

              const { email, role } = content.input as any;

              // Validate email format
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              if (!emailRegex.test(email)) {
                assistantMessage += '\n\n**Please provide a valid email address.** For example: "share with john@example.com"';
                break;
              }

              // Get current user's email for the invitation
              const { data: { user: currentUser } } = await supabase.auth.getUser();
              if (!currentUser?.email) {
                assistantMessage += '\n\n**I couldn\'t retrieve your email.** Please try again.';
                break;
              }

              // Get journey details for the email
              const { data: journeyData, error: journeyError } = await supabase
                .from('patient_journeys')
                .select('procedure_type')
                .eq('id', context.journeyId)
                .single();

              if (journeyError || !journeyData) {
                assistantMessage += '\n\n**I couldn\'t find your journey.** Please refresh and try again.';
                break;
              }

              // Check if already invited
              const { data: existingInvite } = await supabase
                .from('journey_collaborators')
                .select('id, status')
                .eq('journey_id', context.journeyId)
                .eq('email', email.toLowerCase())
                .single();

              if (existingInvite && existingInvite.status !== 'declined') {
                assistantMessage += `\n\n**${email}** has already been invited to view your journey.`;
                break;
              }

              // Create invitation
              const { data: invitation, error: inviteError } = await supabase
                .from('journey_collaborators')
                .insert({
                  journey_id: context.journeyId,
                  email: email.toLowerCase(),
                  role: role || 'viewer',
                  invited_by: context.userId
                })
                .select()
                .single();

              if (inviteError) {
                console.error('Invitation creation error:', inviteError);
                assistantMessage += '\n\n**I had trouble creating the invitation.** Please try again.';
                break;
              }

              // Send invitation email via the send-journey-invitation function
              try {
                const emailResponse = await fetch(`${process.env.URL || 'https://oasara.com'}/.netlify/functions/send-journey-invitation`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    to: email,
                    inviterEmail: currentUser.email,
                    procedureType: journeyData.procedure_type,
                    invitationToken: invitation.invitation_token,
                    role: role || 'viewer'
                  })
                });

                if (!emailResponse.ok) {
                  console.error('Email send failed:', await emailResponse.text());
                  // Still show success but note the email issue
                  assistantMessage += `\n\n✅ **I've created a share link for ${email}!**\n\nThe email delivery might be delayed. You can also copy the link directly:\n\`${process.env.URL || 'https://oasara.com'}/journey/accept-invite/${invitation.invitation_token}\``;
                } else {
                  assistantMessage += `\n\n✅ **I've sent an invitation to ${email}!**\n\nThey'll receive an email with a link to view your ${journeyData.procedure_type} journey. The invitation expires in 7 days.\n\nYou can manage sharing from your [journey dashboard](/my-journey).`;
                }
              } catch (emailError) {
                console.error('Email send error:', emailError);
                assistantMessage += `\n\n✅ **Share link created for ${email}!**\n\nHere's the direct link:\n\`${process.env.URL || 'https://oasara.com'}/journey/accept-invite/${invitation.invitation_token}\``;
              }
            }
            break;

          case 'invite_collaborator':
            {
              if (!context.journeyId || !context.userId) {
                assistantMessage += '\n\n**To invite collaborators, please [log in](/login) first.**';
                break;
              }

              const { email } = content.input as any;

              // Validate email format
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              if (!email || !emailRegex.test(email)) {
                assistantMessage += '\n\n**Please provide a valid email address.** For example: "invite mom@example.com to help"';
                break;
              }

              // Get current user's email for the invitation
              const { data: { user: currentUser } } = await supabase.auth.getUser();
              if (!currentUser?.email) {
                assistantMessage += '\n\n**I couldn\'t retrieve your email.** Please try again.';
                break;
              }

              // Get journey details for the email
              const { data: journeyData, error: journeyError } = await supabase
                .from('patient_journeys')
                .select('procedure_type')
                .eq('id', context.journeyId)
                .single();

              if (journeyError || !journeyData) {
                assistantMessage += '\n\n**I couldn\'t find your journey.** Please refresh and try again.';
                break;
              }

              // Check if already invited
              const { data: existingInvite } = await supabase
                .from('journey_collaborators')
                .select('id, status, role')
                .eq('journey_id', context.journeyId)
                .eq('email', email.toLowerCase())
                .single();

              if (existingInvite && existingInvite.status !== 'declined') {
                const roleLabel = existingInvite.role === 'editor' ? 'collaborator' : 'viewer';
                assistantMessage += `\n\n**${email}** has already been invited as a ${roleLabel}.`;
                break;
              }

              // Create invitation with editor role for collaborators
              const { data: invitation, error: inviteError } = await supabase
                .from('journey_collaborators')
                .insert({
                  journey_id: context.journeyId,
                  email: email.toLowerCase(),
                  role: 'editor',
                  invited_by: context.userId
                })
                .select()
                .single();

              if (inviteError) {
                console.error('Collaborator invitation error:', inviteError);
                assistantMessage += '\n\n**I had trouble creating the invitation.** Please try again.';
                break;
              }

              // Send invitation email
              try {
                const emailResponse = await fetch(`${process.env.URL || 'https://oasara.com'}/.netlify/functions/send-journey-invitation`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    to: email,
                    inviterEmail: currentUser.email,
                    procedureType: journeyData.procedure_type,
                    invitationToken: invitation.invitation_token,
                    role: 'editor'
                  })
                });

                if (!emailResponse.ok) {
                  console.error('Email send failed:', await emailResponse.text());
                  assistantMessage += `\n\n✅ **Invitation created for ${email}!**\n\nThey can collaborate on your journey using this link:\n\`${process.env.URL || 'https://oasara.com'}/journey/accept-invite/${invitation.invitation_token}\``;
                } else {
                  assistantMessage += `\n\n✅ **I've invited ${email} to collaborate on your journey!**\n\nThey'll be able to:\n- View your ${journeyData.procedure_type} research\n- Add notes and suggestions\n- Help compare facilities\n\nThe invitation expires in 7 days.`;
                }
              } catch (emailError) {
                console.error('Email send error:', emailError);
                assistantMessage += `\n\n✅ **Collaboration invite created!**\n\nShare this link with ${email}:\n\`${process.env.URL || 'https://oasara.com'}/journey/accept-invite/${invitation.invitation_token}\``;
              }
            }
            break;

          case 'contact_facility':
            {
              if (!context.journeyId || !context.userId) {
                assistantMessage += '\n\n**To contact a facility, please [log in](/login) first.**';
                break;
              }

              const { facility_id, message } = content.input as any;

              // Get current user's info
              const { data: { user: currentUser } } = await supabase.auth.getUser();
              if (!currentUser?.email) {
                assistantMessage += '\n\n**I couldn\'t retrieve your contact info.** Please make sure you\'re logged in.';
                break;
              }

              // Get user profile for name
              const { data: userProfile } = await supabase
                .from('user_profiles')
                .select('first_name, last_name, phone')
                .eq('id', currentUser.id)
                .single();

              const userName = userProfile
                ? `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim() || 'Oasara User'
                : 'Oasara User';

              // Get facility details
              const { data: facility, error: facilityError } = await supabase
                .from('facilities')
                .select('id, name, email, city, country')
                .eq('id', facility_id)
                .single();

              if (facilityError || !facility) {
                assistantMessage += '\n\n**I couldn\'t find that facility.** Please try again with a valid facility ID.';
                break;
              }

              // Get journey details for procedure type
              const { data: journeyData } = await supabase
                .from('patient_journeys')
                .select('procedure_type')
                .eq('id', context.journeyId)
                .single();

              const procedureType = journeyData?.procedure_type || 'Medical procedure';

              // Create contact request
              const defaultMessage = message || `I am interested in learning more about ${procedureType} at your facility. Please send me information about pricing, availability, and the treatment process.`;

              const { data: contactRequest, error: contactError } = await supabase
                .from('contact_requests')
                .insert({
                  journey_id: context.journeyId,
                  facility_id: facility.id,
                  user_name: userName,
                  user_email: currentUser.email,
                  user_phone: userProfile?.phone || null,
                  message: defaultMessage,
                  procedure_type: procedureType,
                  status: 'pending'
                })
                .select()
                .single();

              if (contactError) {
                console.error('Contact request error:', contactError);
                assistantMessage += '\n\n**I had trouble creating your contact request.** Please try again.';
                break;
              }

              assistantMessage += `\n\n✅ **Contact request submitted to ${facility.name}!**\n\n`;
              assistantMessage += `📍 **Location:** ${facility.city}, ${facility.country}\n`;
              assistantMessage += `📋 **Procedure:** ${procedureType}\n\n`;

              if (facility.email) {
                assistantMessage += `The facility will receive your inquiry at their registered email. `;
              }

              assistantMessage += `You can track the status of your requests on your [journey dashboard](/my-journey).\n\n`;
              assistantMessage += `**Your message:**\n> "${defaultMessage.substring(0, 200)}${defaultMessage.length > 200 ? '...' : ''}"`;
            }
            break;

          case 'export_journey_pdf':
            {
              if (!context.journeyId || !context.userId) {
                assistantMessage += '\n\n**To export your journey, please [log in](/login) first.**';
                break;
              }

              // Get journey details
              const { data: journeyData, error: journeyError } = await supabase
                .from('patient_journeys')
                .select('procedure_type, budget_min, budget_max, budget_preference, timeline, status, created_at')
                .eq('id', context.journeyId)
                .single();

              if (journeyError || !journeyData) {
                assistantMessage += '\n\n**I couldn\'t find your journey details.** Please refresh and try again.';
                break;
              }

              // Get shortlisted facilities with full details
              const { data: shortlistData } = await supabase
                .from('journey_facilities')
                .select(`
                  facility_id,
                  facilities (
                    name,
                    city,
                    country,
                    jci_accredited,
                    google_rating,
                    review_count,
                    phone,
                    email,
                    website,
                    popular_procedures
                  )
                `)
                .eq('journey_id', context.journeyId);

              // Get notes
              const { data: notesData } = await supabase
                .from('journey_notes')
                .select('content, note_type, created_at')
                .eq('journey_id', context.journeyId)
                .order('created_at', { ascending: false });

              // Get contact requests
              const { data: contactsData } = await supabase
                .from('contact_requests')
                .select(`
                  status,
                  created_at,
                  facilities (name)
                `)
                .eq('journey_id', context.journeyId);

              // Build comprehensive export
              const exportDate = new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              });

              assistantMessage += `\n\n📄 **Your Journey Export**\n`;
              assistantMessage += `_Generated ${exportDate} via Oasara_\n\n`;
              assistantMessage += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

              // Journey Overview
              assistantMessage += `## Journey Overview\n\n`;
              assistantMessage += `**Procedure:** ${journeyData.procedure_type}\n`;
              assistantMessage += `**Timeline:** ${journeyData.timeline === 'urgent' ? 'Urgent (< 2 weeks)' : journeyData.timeline === 'soon' ? 'Soon (1-3 months)' : 'Flexible (3+ months)'}\n`;
              assistantMessage += `**Status:** ${journeyData.status}\n`;

              if (journeyData.budget_min && journeyData.budget_max) {
                assistantMessage += `**Budget:** $${journeyData.budget_min.toLocaleString()} - $${journeyData.budget_max.toLocaleString()}\n`;
              } else if (journeyData.budget_preference) {
                const prefLabels: Record<string, string> = {
                  save_most: 'Save as much as possible',
                  balanced: 'Balance of quality & value',
                  quality_first: 'Quality is top priority',
                  no_preference: 'Open to all options'
                };
                assistantMessage += `**Budget Focus:** ${prefLabels[journeyData.budget_preference] || journeyData.budget_preference}\n`;
              }

              assistantMessage += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

              // Shortlisted Facilities
              assistantMessage += `## Shortlisted Facilities (${shortlistData?.length || 0})\n\n`;

              if (shortlistData && shortlistData.length > 0) {
                shortlistData.forEach((item: any, index: number) => {
                  const f = item.facilities;
                  assistantMessage += `### ${index + 1}. ${f.name}\n`;
                  assistantMessage += `📍 ${f.city}, ${f.country}\n`;
                  assistantMessage += `${f.jci_accredited ? '✅ JCI Accredited' : '❌ Not JCI Accredited'}\n`;
                  if (f.google_rating) {
                    assistantMessage += `⭐ ${f.google_rating}/5 (${f.review_count || 0} reviews)\n`;
                  }
                  if (f.phone) assistantMessage += `📞 ${f.phone}\n`;
                  if (f.email) assistantMessage += `📧 ${f.email}\n`;
                  if (f.website) assistantMessage += `🌐 ${f.website}\n`;
                  assistantMessage += '\n';
                });
              } else {
                assistantMessage += '_No facilities shortlisted yet._\n\n';
              }

              assistantMessage += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

              // Notes
              assistantMessage += `## Notes (${notesData?.length || 0})\n\n`;

              if (notesData && notesData.length > 0) {
                notesData.forEach((note: any) => {
                  const noteDate = new Date(note.created_at).toLocaleDateString();
                  const typeEmoji: Record<string, string> = {
                    general: '📝',
                    question: '❓',
                    concern: '⚠️',
                    todo: '✅',
                    research: '🔍'
                  };
                  assistantMessage += `${typeEmoji[note.note_type] || '📝'} **[${noteDate}]** ${note.content}\n`;
                });
              } else {
                assistantMessage += '_No notes saved yet._\n';
              }

              assistantMessage += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

              // Contact Requests
              assistantMessage += `## Contact Requests (${contactsData?.length || 0})\n\n`;

              if (contactsData && contactsData.length > 0) {
                contactsData.forEach((contact: any) => {
                  const contactDate = new Date(contact.created_at).toLocaleDateString();
                  const statusEmoji = contact.status === 'responded' ? '✅' : contact.status === 'pending' ? '⏳' : '📤';
                  assistantMessage += `${statusEmoji} **${(contact.facilities as any)?.name || 'Unknown'}** - ${contact.status} (${contactDate})\n`;
                });
              } else {
                assistantMessage += '_No contact requests sent yet._\n';
              }

              assistantMessage += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

              // Footer
              assistantMessage += `**💡 Tip:** To save this as a PDF:\n`;
              assistantMessage += `1. Press **Ctrl+P** (or **Cmd+P** on Mac)\n`;
              assistantMessage += `2. Select "Save as PDF" as destination\n`;
              assistantMessage += `3. Click Save\n\n`;
              assistantMessage += `Or visit your [journey dashboard](/my-journey) and use your browser's print function for a formatted version.\n\n`;
              assistantMessage += `_Powered by [Oasara](https://oasara.com) - Your Medical Tourism Companion_`;
            }
            break;

          case 'get_journey_summary':
            {
              if (!context.journeyId || !context.userId) {
                assistantMessage += '\n\n**You don\'t have an active journey yet.** Tell me what procedure you\'re interested in to get started!';
                break;
              }

              // Get journey details
              const { data: journeyData, error: journeyError } = await supabase
                .from('patient_journeys')
                .select('procedure_type, budget_min, budget_max, budget_preference, timeline, status, created_at')
                .eq('id', context.journeyId)
                .single();

              if (journeyError || !journeyData) {
                assistantMessage += '\n\n**I couldn\'t find your journey details.** Please refresh and try again.';
                break;
              }

              // Get shortlisted facilities
              const { data: shortlist, error: shortlistError } = await supabase
                .from('journey_facilities')
                .select(`
                  facility_id,
                  facilities (
                    name,
                    city,
                    country,
                    jci_accredited
                  )
                `)
                .eq('journey_id', context.journeyId);

              // Get notes count
              const { count: notesCount } = await supabase
                .from('journey_notes')
                .select('id', { count: 'exact', head: true })
                .eq('journey_id', context.journeyId);

              // Get contact requests count
              const { count: contactsCount } = await supabase
                .from('contact_requests')
                .select('id', { count: 'exact', head: true })
                .eq('journey_id', context.journeyId);

              // Build summary message
              assistantMessage += '\n\n📋 **Your Journey Summary**\n\n';

              // Procedure & Timeline
              assistantMessage += `**Procedure:** ${journeyData.procedure_type}\n`;
              assistantMessage += `**Timeline:** ${journeyData.timeline === 'urgent' ? 'Urgent (< 2 weeks)' : journeyData.timeline === 'soon' ? 'Soon (1-3 months)' : 'Flexible (3+ months)'}\n`;

              // Budget
              if (journeyData.budget_min && journeyData.budget_max) {
                assistantMessage += `**Budget:** $${journeyData.budget_min.toLocaleString()} - $${journeyData.budget_max.toLocaleString()}\n`;
              } else if (journeyData.budget_preference) {
                const prefLabels: Record<string, string> = {
                  save_most: 'Save as much as possible',
                  balanced: 'Balance of quality & value',
                  quality_first: 'Quality is top priority',
                  no_preference: 'Open to all options'
                };
                assistantMessage += `**Budget Focus:** ${prefLabels[journeyData.budget_preference] || journeyData.budget_preference}\n`;
              }

              assistantMessage += '\n---\n\n';

              // Shortlist
              if (shortlist && shortlist.length > 0) {
                assistantMessage += `**🏥 Shortlist (${shortlist.length} facilities):**\n`;
                shortlist.forEach((item: any, index: number) => {
                  const f = item.facilities;
                  assistantMessage += `${index + 1}. **${f.name}** - ${f.city}, ${f.country}${f.jci_accredited ? ' ✓ JCI' : ''}\n`;
                });
              } else {
                assistantMessage += '**🏥 Shortlist:** No facilities added yet\n';
              }

              // Notes & Contacts
              assistantMessage += `\n**📝 Notes:** ${notesCount || 0} saved\n`;
              assistantMessage += `**📧 Contact Requests:** ${contactsCount || 0} sent\n`;

              // Progress indicator
              let progress = 0;
              if (journeyData.procedure_type) progress += 20;
              if (journeyData.timeline) progress += 10;
              if (shortlist && shortlist.length >= 1) progress += 20;
              if (shortlist && shortlist.length >= 3) progress += 20;
              if (notesCount && notesCount >= 1) progress += 10;
              if (contactsCount && contactsCount >= 1) progress += 20;

              assistantMessage += `\n**Progress:** ${Math.min(progress, 100)}% complete\n`;

              // Next steps
              assistantMessage += '\n---\n\n**Suggested next steps:**\n';
              if (!shortlist || shortlist.length === 0) {
                assistantMessage += '- Search for facilities and add some to your shortlist\n';
              } else if (shortlist.length < 3) {
                assistantMessage += '- Add more facilities to compare (aim for 3-5)\n';
              }
              if (shortlist && shortlist.length >= 2) {
                assistantMessage += '- Ask me to "compare my shortlist" for a side-by-side view\n';
              }
              if (!contactsCount || contactsCount === 0) {
                assistantMessage += '- Contact facilities for quotes\n';
              }
              assistantMessage += '- Visit your [full dashboard](/my-journey) for more details';
            }
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
        journeyId: journeyId || undefined,
        isComparison: isComparison || undefined,
        shortlistChanged: shortlistChanged || undefined
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
