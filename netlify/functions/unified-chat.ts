import { Handler, HandlerEvent } from '@netlify/functions';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import { HfInference } from '@huggingface/inference';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || ''
});

// Qdrant config for trust law data
const QDRANT_URL = process.env.QDRANT_URL || '';
const QDRANT_API_KEY = process.env.QDRANT_API_KEY || '';
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY || '';
const COLLECTION_NAME = 'oasara_medical';
const EMBEDDING_MODEL = 'sentence-transformers/all-MiniLM-L6-v2';

const hf = new HfInference(HUGGINGFACE_API_KEY);

interface QdrantSearchResult {
  id: number;
  score: number;
  payload: {
    text: string;
    type: string;
    name?: string;
    state?: string;
    title?: string;
  };
}

/**
 * Generate embedding using HuggingFace
 */
async function getEmbedding(text: string): Promise<number[]> {
  const result = await hf.featureExtraction({
    model: EMBEDDING_MODEL,
    inputs: text,
  });
  if (Array.isArray(result) && typeof result[0] === 'number') {
    return result as number[];
  } else if (Array.isArray(result) && Array.isArray(result[0])) {
    return result[0] as number[];
  }
  throw new Error('Unexpected embedding format');
}

/**
 * Search Qdrant for trust law and medical tourism knowledge
 */
async function searchQdrant(query: string, k: number = 5): Promise<QdrantSearchResult[]> {
  try {
    const vector = await getEmbedding(query);
    const response = await fetch(`${QDRANT_URL}/collections/${COLLECTION_NAME}/points/search`, {
      method: 'POST',
      headers: {
        'api-key': QDRANT_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        vector,
        limit: k,
        with_payload: true
      })
    });

    if (!response.ok) {
      console.error('Qdrant search error:', await response.text());
      return [];
    }

    const data = await response.json();
    return data.result || [];
  } catch (error) {
    console.error('Qdrant search error:', error);
    return [];
  }
}

interface ChatRequest {
  messages: Array<{ role: string; content: string }>;
  userMessage: string;
  context: {
    journeyId?: string | null;
    userId?: string | null;
    userEmail?: string | null;
    procedure?: string;
    shortlist?: Array<{
      id: string;
      name: string;
      location: string;
    }>;
    isNewUser?: boolean; // true = no journey exists yet
    pledgeStatus?: {
      medical_trust: boolean;
      cancel_insurance: boolean;
      try_medical_tourism: boolean;
    };
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

    console.log('[unified-chat] Context:', JSON.stringify(context));

    // Special handling for story_collection mode - simplified AI-assisted story writing
    if (context.mode === 'story_collection') {
      const storyType = context.story_type || 'horror';
      const storyTypeLabel = storyType === 'horror' ? 'horror story' : storyType === 'success' ? 'success story' : 'comparison';
      
      const storyCollectionPrompt = `You are a compassionate story interviewer helping someone share their healthcare ${storyTypeLabel}. 

Your job is to:
1. Listen carefully to what they share
2. Ask follow-up questions to get more details (2-3 questions max per response)
3. Help them articulate their experience clearly
4. When you have enough information (after 3-4 exchanges), use the save_story_draft tool to save the extracted data

Be warm, empathetic, and encouraging. Keep responses short (2-3 sentences max).

IMPORTANT: When the user indicates they're done (e.g., "that's it", "that covers it", "done"), or after 4+ exchanges with good detail, you MUST call the save_story_draft tool to save the story.

The user has already selected story type: ${storyTypeLabel}
${context.extracted_so_far ? `\nAlready extracted: ${JSON.stringify(context.extracted_so_far)}` : ''}`;

      const storyTools = [
        {
          name: 'save_story_draft',
          description: 'Save the extracted story information. Call this when you have enough details from the conversation.',
          input_schema: {
            type: 'object' as const,
            properties: {
              title: {
                type: 'string',
                description: 'A compelling, emotional title for the story (e.g., "$45,000 for a Broken Arm: My ER Nightmare")'
              },
              content: {
                type: 'string',
                description: 'The full story narrative in first person, 2-4 paragraphs, capturing the emotion and key details'
              },
              cost_us: {
                type: 'number',
                description: 'The total cost in USD if mentioned'
              },
              procedure: {
                type: 'string',
                description: 'The medical procedure or treatment involved'
              },
              issues: {
                type: 'array',
                items: { type: 'string' },
                description: 'List of issue categories: billing, insurance_denial, bankruptcy, wait_time, quality, medical_tourism'
              }
            },
            required: ['title', 'content']
          }
        }
      ];

      const anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY || '',
      });

      const storyMessages = messages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content
      }));

      // Add the current user message if not already in messages
      if (userMessage && (!messages.length || messages[messages.length - 1].content !== userMessage)) {
        storyMessages.push({ role: 'user', content: userMessage });
      }

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: storyCollectionPrompt,
        messages: storyMessages,
        tools: storyTools
      });

      // Check if the AI called the save_story_draft tool
      let extracted: any = null;
      let assistantMessage = '';

      for (const block of response.content) {
        if (block.type === 'text') {
          assistantMessage += block.text;
        } else if (block.type === 'tool_use' && block.name === 'save_story_draft') {
          extracted = block.input;
        }
      }

      // If no text message but tool was called, provide a confirmation
      if (!assistantMessage && extracted) {
        assistantMessage = "I've captured your story! You can now review and edit it before submitting.";
      } else if (!assistantMessage) {
        assistantMessage = "Thank you for sharing. Could you tell me more about your experience?";
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          message: assistantMessage,
          extracted: extracted
        })
      };
    }

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

    // Unified System Prompt - Healthcare Sovereignty Platform
    const systemPrompt = `You are Oasara's Healthcare Sovereignty guide. You help people take control of their healthcare through THREE pillars:

1. **Medical Trust** - Protect assets from medical debt
2. **Insurance Exit** - Cancel or replace traditional insurance  
3. **Medical Tourism** - Access global healthcare at 40-80% savings

## YOUR OPENING (if no prior messages)
"Hey! I'm here to help you take control of your healthcare. Whether you're looking to protect your savings, cut insurance costs, or explore care options abroad — just tell me what's on your mind."

## STAGE 5 LANGUAGE - "WE" FRAMING
- Use "we" framing: "Let's find facilities for your knee replacement"
- Assume positive outcome: "You WILL find excellent care" (not "might")
- Empathy & reassurance: "Medical decisions feel overwhelming—that's completely normal"
- NO AI SLOP: Never say "Based on the context provided..." - get straight to the answer
- Medical trust: Always mention JCI accreditation, show US cost savings, name surgeons with credentials

## PILLAR DETECTION
Listen for keywords and gently surface relevant pillars:

**Medical Trust triggers:**
- "worried about costs", "protect myself", "what if", "bankruptcy", "debt", "assets", "savings"
→ "By the way, have you thought about protecting your assets with a Medical Trust? Medical debt is the #1 cause of bankruptcy—even for people WITH insurance."

**Insurance Exit triggers:**
- "insurance", "premiums", "deductible", "denied claim", "co-pay", "coverage"
→ "A lot of people don't realize there are alternatives to traditional insurance. Want me to explain your options?"

**Medical Tourism triggers:**
- "procedure", "surgery", "treatment", "hospital", "too expensive", "can't afford"
→ "Going abroad for care can save you 60-90%. Want me to search for facilities?"

## CONVERSATION STYLE
- Short, digestible paragraphs (2-4 sentences max)
- Use "you" and "your"—this is deeply personal
- Warmth over formality: "Hey, let me help you with that" not "I can assist you with"
- If you sense hesitation, acknowledge it: "I get it, this is a big decision"
- Celebrate progress: "You're taking control of your health—that takes courage"

## BUDGET HANDLING - EDUCATE FIRST
DON'T ask users for budget numbers - they don't know what things cost!

Instead, EDUCATE them first:
1. When they mention a procedure, tell them US costs:
   - "In the US, [procedure] typically runs $X - $Y"
   - "Going abroad, you can save 50-80%, paying $X - $Y instead"

2. Give context with examples:
   - "Hip replacement: US $40k-80k → Thailand $12k-18k (70% savings)"
   - "Dental implants: US $3k-5k per tooth → Mexico $800-1,500 (70% savings)"

3. Then ask QUALITATIVE preference:
   - "Are you looking to save as much as possible, or is quality your top priority?"

## AVAILABLE TOOLS

**MEDICAL TOURISM (Core Journey)**
- create_journey - Creates initial journey (procedure, timeline, optional budget)
- search_facilities - Find hospitals matching criteria
- add_facility_to_shortlist - Add facility to comparison list
- remove_facility_from_shortlist - Remove facility from list
- generate_comparison - Create side-by-side comparison
- get_facility_details - Get detailed info about facility
- add_journey_note - Add reminder/note to journey
- share_journey - Share journey with family/friends
- invite_collaborator - Invite someone to help decide
- draft_facility_message - Drafts professional message template for contacting facilities
- contact_facility - Sends quote request to facility (after user reviews draft)
- get_travel_requirements - Gets passport/visa/insurance requirements for destination country
- get_recovery_timeline - Gets estimated recovery timeline for a procedure
- export_journey_pdf - Generate PDF report
- get_journey_summary - Get overview of current journey

**MEDICAL TRUST (Pillar 1)**
- search_trust_laws - ALWAYS USE THIS for trust law questions! Searches our knowledge base for state-by-state trust laws, asset protection rankings, DAPT info, etc.
- explain_medical_trust - Use for basic "what is a medical trust" questions
- get_trust_resources - Get links to medical trust information

**INSURANCE EXIT (Pillar 2)**  
- explain_insurance_exit - Explain alternatives to traditional insurance
- join_insurance_waitlist - Add user to insurance exit waitlist

**PLEDGES (Cross-pillar)**
- check_pledge_status - Check which pledges user has taken
- prompt_pledge - Gently suggest a specific pledge (MAX ONCE per conversation)

**COMMUNITY STORIES**
- search_stories - Find stories from other patients (horror stories, success stories, comparisons)
- get_story_details - Get full details of a specific story
- suggest_share_story - Gently encourage user to share their experience (after journey completion)

## CRITICAL RULES

🚨 **AFTER CREATING A JOURNEY, IMMEDIATELY SEARCH** 🚨
When you call create_journey, you MUST ALSO call search_facilities in the SAME response.

🚨 **FACILITIES = search_facilities, TRUST LAWS = search_trust_laws** 🚨
- For questions about FACILITIES, PROCEDURES, or SPECIFIC HOSPITALS → call search_facilities
- For questions about TRUST LAWS, BEST STATES, ASSET PROTECTION → call search_trust_laws FIRST
- search_trust_laws queries our knowledge base of 50 state trust laws

🚨 **ALWAYS SEARCH BEFORE ANSWERING TRUST QUESTIONS** 🚨
When user asks about:
- "best state for a medical trust" → search_trust_laws("best states for asset protection trusts")
- "Nevada trust laws" → search_trust_laws("Nevada asset protection trust laws")
- "how to protect assets" → search_trust_laws("asset protection trusts creditor protection")
DO NOT give generic answers - USE THE TOOL to get real data!

🚨 **PLEDGES ARE GENTLE** 🚨
Never be pushy about pledges. They're personal commitments. Use prompt_pledge at most ONCE.`;

    // Build dynamic context
    let userContext = '';
    
    if (context.isNewUser) {
      userContext += `\n\n**NEW USER** - No journey yet. Guide them through exploring their options.`;
    } else if (context.journeyId) {
      userContext += `\n\n**RETURNING USER:**\n`;
      userContext += `- Journey ID: ${context.journeyId}\n`;
      userContext += `- Procedure: ${context.procedure || 'Not specified'}\n`;

      if (context.shortlist && context.shortlist.length > 0) {
        userContext += `\n**SHORTLIST (${context.shortlist.length} facilities):**\n`;
        context.shortlist.forEach((f, i) => {
          userContext += `${i + 1}. ${f.name} - ${f.location}\n`;
        });
        userContext += `\n**IMPORTANT:** When user asks to "compare", call generate_comparison immediately.`;
      }
    }

    if (context.pledgeStatus) {
      const { medical_trust, cancel_insurance, try_medical_tourism } = context.pledgeStatus;
      const pledgeCount = [medical_trust, cancel_insurance, try_medical_tourism].filter(Boolean).length;
      userContext += `\n**PLEDGE STATUS:** ${pledgeCount}/3 taken\n`;
      if (!medical_trust) userContext += `- ❌ Medical Trust (not taken)\n`;
      if (!cancel_insurance) userContext += `- ❌ Cancel Insurance (not taken)\n`;
      if (!try_medical_tourism) userContext += `- ❌ Medical Tourism (not taken)\n`;
    }

    // Define ALL tools
    const tools: Anthropic.Tool[] = [
      // === MEDICAL TOURISM TOOLS ===
      {
        name: 'create_journey',
        description: 'Creates a new patient journey. Only needs procedure and timeline. Budget is OPTIONAL.',
        input_schema: {
          type: 'object',
          properties: {
            procedure: {
              type: 'string',
              description: 'Medical procedure (e.g., "Knee Replacement", "Dental Implants")'
            },
            budgetMin: {
              type: 'number',
              description: 'OPTIONAL: Minimum budget in USD'
            },
            budgetMax: {
              type: 'number',
              description: 'OPTIONAL: Maximum budget in USD'
            },
            budgetPreference: {
              type: 'string',
              enum: ['save_most', 'balanced', 'quality_first', 'no_preference'],
              description: 'User preference for cost vs quality'
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
        description: 'Searches for medical facilities. ALWAYS use this for location/procedure questions.',
        input_schema: {
          type: 'object',
          properties: {
            procedure: { type: 'string', description: 'Procedure type to filter by' },
            country: { type: 'string', description: 'Country name (e.g., "Thailand", "Mexico")' },
            limit: { type: 'number', description: 'Number of results (default: 5, max: 10)' }
          },
          required: []
        }
      },
      {
        name: 'add_facility_to_shortlist',
        description: 'Adds a facility to shortlist by name',
        input_schema: {
          type: 'object',
          properties: {
            facility_name: { type: 'string', description: 'Name of facility to add' }
          },
          required: ['facility_name']
        }
      },
      {
        name: 'remove_facility_from_shortlist',
        description: 'Removes facility from shortlist',
        input_schema: {
          type: 'object',
          properties: {
            facility_name: { type: 'string', description: 'Name of facility to remove' }
          },
          required: ['facility_name']
        }
      },
      {
        name: 'generate_comparison',
        description: 'Generates side-by-side comparison of shortlisted facilities',
        input_schema: { type: 'object', properties: {}, required: [] }
      },
      {
        name: 'get_facility_details',
        description: 'Gets detailed info about a facility',
        input_schema: {
          type: 'object',
          properties: {
            facility_id: { type: 'string', description: 'Facility ID or name' }
          },
          required: ['facility_id']
        }
      },
      {
        name: 'add_journey_note',
        description: 'Adds a note to the journey',
        input_schema: {
          type: 'object',
          properties: {
            note_text: { type: 'string', description: 'Note content' },
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
        description: 'Shares journey via email',
        input_schema: {
          type: 'object',
          properties: {
            email: { type: 'string', description: 'Email to share with' },
            role: { type: 'string', enum: ['viewer', 'editor'], description: 'Permission level' }
          },
          required: ['email', 'role']
        }
      },
      {
        name: 'invite_collaborator',
        description: 'Invites someone to collaborate on decisions',
        input_schema: {
          type: 'object',
          properties: {
            email: { type: 'string', description: 'Email to invite' }
          },
          required: ['email']
        }
      },
      {
        name: 'draft_facility_message',
        description: 'Drafts a professional message template for contacting a facility. Use this when user wants to reach out to a facility.',
        input_schema: {
          type: 'object',
          properties: {
            facility_id: { type: 'string', description: 'Facility ID or name' },
            procedure: { type: 'string', description: 'Procedure name (from journey context)' },
            include_medical_history: { type: 'boolean', description: 'Whether to include placeholders for medical history' }
          },
          required: ['facility_id']
        }
      },
      {
        name: 'contact_facility',
        description: 'Sends quote request to facility via email. Use this after user has reviewed and approved the draft message.',
        input_schema: {
          type: 'object',
          properties: {
            facility_id: { type: 'string', description: 'Facility ID' },
            message: { type: 'string', description: 'The message to send (use draft_facility_message first)' },
            user_email: { type: 'string', description: 'User email for facility to respond to' }
          },
          required: ['facility_id', 'message', 'user_email']
        }
      },
      {
        name: 'export_journey_pdf',
        description: 'Generates PDF export of journey',
        input_schema: { type: 'object', properties: {}, required: [] }
      },
      {
        name: 'get_journey_summary',
        description: 'Gets overview of current journey',
        input_schema: { type: 'object', properties: {}, required: [] }
      },
      {
        name: 'get_travel_requirements',
        description: 'Gets travel requirements (passport, visa, insurance) for a destination country',
        input_schema: {
          type: 'object',
          properties: {
            country: { type: 'string', description: 'Destination country name' },
            procedure_type: { type: 'string', description: 'Procedure type (affects stay duration)' }
          },
          required: ['country']
        }
      },
      {
        name: 'get_recovery_timeline',
        description: 'Gets estimated recovery timeline for a specific procedure',
        input_schema: {
          type: 'object',
          properties: {
            procedure: { type: 'string', description: 'Procedure name' }
          },
          required: ['procedure']
        }
      },
      // === MEDICAL TRUST TOOLS ===
      {
        name: 'search_trust_laws',
        description: 'Searches the knowledge base for trust law information by state. Use this when user asks about specific states, best states for trusts, asset protection laws, or any trust-related legal question.',
        input_schema: {
          type: 'object',
          properties: {
            query: { 
              type: 'string', 
              description: 'Search query about trust laws, e.g. "best states for asset protection trusts" or "Nevada trust laws"' 
            }
          },
          required: ['query']
        }
      },
      {
        name: 'explain_medical_trust',
        description: 'Explains what a medical trust is and how it protects assets from medical debt. Use for general "what is a medical trust" questions.',
        input_schema: { type: 'object', properties: {}, required: [] }
      },
      {
        name: 'get_trust_resources',
        description: 'Returns links and resources about medical trusts',
        input_schema: { type: 'object', properties: {}, required: [] }
      },
      // === INSURANCE EXIT TOOLS ===
      {
        name: 'explain_insurance_exit',
        description: 'Explains alternatives to traditional insurance (health shares, DPC, self-pay + medical tourism)',
        input_schema: { type: 'object', properties: {}, required: [] }
      },
      {
        name: 'join_insurance_waitlist',
        description: 'Adds user to the Insurance Exit waitlist for when full tools launch',
        input_schema: {
          type: 'object',
          properties: {
            email: { type: 'string', description: 'User email' },
            current_insurance_type: { type: 'string', description: 'Current insurance (employer, marketplace, none, etc.)' },
            state: { type: 'string', description: 'US state of residence' }
          },
          required: ['email']
        }
      },
      // === PLEDGE TOOLS ===
      {
        name: 'check_pledge_status',
        description: 'Checks which Healthcare Sovereignty pledges the user has taken',
        input_schema: { type: 'object', properties: {}, required: [] }
      },
      {
        name: 'prompt_pledge',
        description: 'Gently suggests user take a pledge. Use MAX ONCE per conversation.',
        input_schema: {
          type: 'object',
          properties: {
            pledge_type: {
              type: 'string',
              enum: ['medical_trust', 'cancel_insurance', 'try_medical_tourism'],
              description: 'Which pledge to suggest'
            }
          },
          required: ['pledge_type']
        }
      },
      // === COMMUNITY STORIES TOOLS ===
      {
        name: 'search_stories',
        description: 'Searches community stories for relevant experiences. Use when user mentions wanting to hear from others, share experiences, read horror stories, success stories, or comparisons.',
        input_schema: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Search query or topic' },
            story_type: { 
              type: 'string', 
              enum: ['horror', 'success', 'comparison'],
              description: 'Filter by story type' 
            },
            procedure: { type: 'string', description: 'Filter by procedure type' },
            limit: { type: 'number', description: 'Number of results (default: 3)' }
          },
          required: []
        }
      },
      {
        name: 'get_story_details',
        description: 'Gets full details of a specific story by slug or ID',
        input_schema: {
          type: 'object',
          properties: {
            story_slug: { type: 'string', description: 'Story slug or ID' }
          },
          required: ['story_slug']
        }
      },
      {
        name: 'suggest_share_story',
        description: 'Gently encourages user to share their own healthcare story. Use when user has finished their journey or mentioned a significant experience.',
        input_schema: {
          type: 'object',
          properties: {
            story_type: {
              type: 'string',
              enum: ['horror', 'success', 'comparison'],
              description: 'Type of story to suggest based on conversation'
            }
          },
          required: []
        }
      }
    ];

    // Call Claude API
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
    let shortlistChanged = false;

    // Process response
    for (const content of response.content) {
      if (content.type === 'text') {
        assistantMessage += content.text;
      } else if (content.type === 'tool_use') {
        const toolInput = content.input as any;
        
        switch (content.name) {
          // === MEDICAL TOURISM TOOLS ===
          case 'create_journey':
            {
              const { procedure, budgetMin, budgetMax, budgetPreference, timeline } = toolInput;

              if (context.userId) {
                const journeyData: any = {
                  user_id: context.userId,
                  procedure_type: procedure,
                  timeline,
                  status: 'researching'
                };

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
                  assistantMessage += `\n\nPerfect! I've created your ${procedure} journey. Let's find some excellent options for you.`;
                } else {
                  console.error('Error creating journey:', error);
                  assistantMessage += `\n\nI had trouble creating your journey. Error: ${error?.message || 'Unknown error'}`;
                }
              } else {
                assistantMessage += '\n\n**To save your journey, please [log in](/auth).** I can still help you explore options!';
              }
            }
            break;

          case 'search_facilities':
            {
              const procedure = toolInput.procedure || context.procedure;
              const { country, limit = 5 } = toolInput;

              if (!procedure) {
                assistantMessage += `\n\n**To find facilities, I need to know what procedure you're looking for.**\n\nWhat medical procedure are you researching?`;
                break;
              }

              const procedureLower = procedure.toLowerCase().trim();

              // Build procedure synonyms
              const procedureSynonyms: Record<string, string[]> = {
                'breast augmentation': ['cosmetic surgery', 'plastic surgery', 'breast'],
                'hip replacement': ['orthopedics', 'joint replacement', 'hip'],
                'knee replacement': ['orthopedics', 'joint replacement', 'knee'],
                'dental implants': ['dental', 'implants', 'tooth'],
                'gastric bypass': ['bariatric surgery', 'weight loss'],
                'gastric sleeve': ['bariatric surgery', 'weight loss'],
                'lasik': ['eye surgery', 'ophthalmology'],
                'ivf': ['fertility', 'reproductive'],
                'hair transplant': ['cosmetic', 'hair restoration']
              };

              const synonyms = Object.entries(procedureSynonyms).find(([key]) =>
                procedureLower.includes(key) || key.includes(procedureLower)
              )?.[1] || [];

              let query = supabase
                .from('facilities')
                .select('id, name, city, country, jci_accredited, google_rating, review_count, popular_procedures, specialties')
                .order('google_rating', { ascending: false })
                .limit(500);

              if (country) {
                query = query.ilike('country', `%${country}%`);
              }

              const { data, error } = await query;

              if (!error && data) {
                // Filter by procedure
                facilities = data.filter(facility => {
                  const hasMatchingProcedure = facility.popular_procedures?.some((p: any) => {
                    const procName = (p.name || '').toLowerCase();
                    return procName.includes(procedureLower) || procedureLower.includes(procName) ||
                      synonyms.some(syn => procName.includes(syn));
                  });

                  const specialtiesArray: string[] = Array.isArray(facility.specialties) ? facility.specialties : [];
                  const matchesSpecialty = specialtiesArray.some((spec: string) => {
                    const specLower = (spec || '').toLowerCase();
                    return specLower.includes(procedureLower) || procedureLower.includes(specLower) ||
                      synonyms.some(syn => specLower.includes(syn));
                  });

                  return hasMatchingProcedure || matchesSpecialty;
                }).slice(0, limit);

                if (facilities.length === 0) {
                  assistantMessage += `\n\n**I couldn't find facilities offering "${procedure}" ${country ? `in ${country} ` : ''}in our current database.**`;
                } else {
                  // Get doctor counts
                  const facilityIds = facilities.map(f => f.id);
                  const { data: doctorsData } = await supabase
                    .from('doctors')
                    .select('facility_id, name, specialty, years_experience')
                    .in('facility_id', facilityIds);

                  const doctorsByFacility: Record<string, any[]> = {};
                  doctorsData?.forEach(doc => {
                    if (!doctorsByFacility[doc.facility_id]) {
                      doctorsByFacility[doc.facility_id] = [];
                    }
                    doctorsByFacility[doc.facility_id].push(doc);
                  });

                  facilities = facilities.map(facility => {
                    const matchingProc = facility.popular_procedures?.find((p: any) => {
                      const procName = (p.name || '').toLowerCase();
                      return procName.includes(procedureLower) || procedureLower.includes(procName);
                    });
                    
                    const facilityDoctors = doctorsByFacility[facility.id] || [];
                    const featuredDoctor = facilityDoctors[0];

                    return {
                      ...facility,
                      matched_procedure: matchingProc || null,
                      procedure_price: matchingProc?.price_range || null,
                      doctor_count: facilityDoctors.length,
                      featured_doctor: featuredDoctor ? {
                        name: featuredDoctor.name,
                        specialty: featuredDoctor.specialty,
                        years_experience: featuredDoctor.years_experience
                      } : null
                    };
                  });

                  assistantMessage += `\n\n**I found ${facilities.length} excellent ${facilities.length === 1 ? 'option' : 'options'} for ${procedure}:**`;
                }
              }
            }
            break;

          case 'add_facility_to_shortlist':
            {
              if (!context.journeyId || !context.userId) {
                assistantMessage += '\n\n**To add facilities, please [log in](/auth) first.**';
                break;
              }

              const { facility_name } = toolInput;

              const { data: facilityMatch } = await supabase
                .from('facilities')
                .select('id, name')
                .ilike('name', `%${facility_name}%`)
                .limit(1)
                .single();

              if (!facilityMatch) {
                assistantMessage += `\n\nI couldn't find a facility named "${facility_name}".`;
                break;
              }

              const { error } = await supabase
                .from('journey_facilities')
                .insert({
                  journey_id: context.journeyId,
                  facility_id: facilityMatch.id
                });

              if (!error) {
                assistantMessage += `\n\nAdded **${facilityMatch.name}** to your shortlist.`;
                shortlistChanged = true;
              } else if (error.code === '23505') {
                assistantMessage += `\n\n**${facilityMatch.name}** is already in your shortlist.`;
              } else {
                assistantMessage += `\n\n**Couldn't add ${facilityMatch.name}** - ${error.message}`;
              }
            }
            break;

          case 'remove_facility_from_shortlist':
            {
              if (!context.journeyId || !context.userId) {
                assistantMessage += '\n\n**To remove facilities, please [log in](/auth) first.**';
                break;
              }

              const { facility_name } = toolInput;

              const { data: facilityMatch } = await supabase
                .from('facilities')
                .select('id, name')
                .ilike('name', `%${facility_name}%`)
                .limit(1)
                .single();

              if (!facilityMatch) {
                assistantMessage += `\n\nI couldn't find a facility named "${facility_name}".`;
                break;
              }

              const { error } = await supabase
                .from('journey_facilities')
                .delete()
                .eq('journey_id', context.journeyId)
                .eq('facility_id', facilityMatch.id);

              if (!error) {
                assistantMessage += `\n\nRemoved **${facilityMatch.name}** from your shortlist.`;
                shortlistChanged = true;
              }
            }
            break;

          case 'generate_comparison':
            {
              if (!context.journeyId || !context.userId) {
                assistantMessage += '\n\n**To generate comparisons, please [log in](/auth) first.**';
                break;
              }

              const shortlistFromContext = context.shortlist || [];

              if (shortlistFromContext.length === 0) {
                assistantMessage += `\n\n**Your shortlist is empty!** Search for facilities and add some to compare.`;
                break;
              }

              const facilityIds = shortlistFromContext.map(s => s.id);
              const { data: comparisonFacilities } = await supabase
                .from('facilities')
                .select('*')
                .in('id', facilityIds);

              if (!comparisonFacilities || comparisonFacilities.length === 0) {
                assistantMessage += '\n\n**I had trouble loading your shortlisted facilities.**';
                break;
              }

              facilities = comparisonFacilities;
              isComparison = true;
              assistantMessage += `\n\n**Here's your side-by-side comparison of ${comparisonFacilities.length} facilities:**`;
            }
            break;

          case 'get_facility_details':
            {
              const { facility_id } = toolInput;

              let facilityQuery = supabase.from('facilities').select('*');
              const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(facility_id);

              if (isUUID) {
                facilityQuery = facilityQuery.eq('id', facility_id);
              } else {
                facilityQuery = facilityQuery.ilike('name', `%${facility_id}%`);
              }

              const { data: facility } = await facilityQuery.limit(1).single();

              if (!facility) {
                assistantMessage += `\n\n**I couldn't find a facility matching "${facility_id}".**`;
                break;
              }

              assistantMessage += `\n\n🏥 **${facility.name}**\n\n`;
              assistantMessage += `📍 **Location:** ${facility.city}, ${facility.country}\n`;
              assistantMessage += `${facility.jci_accredited ? 'JCI Accredited' : 'Not JCI Accredited'}\n`;
              if (facility.google_rating) {
                assistantMessage += `⭐ ${facility.google_rating}/5 (${facility.review_count || 0} reviews)\n`;
              }
              if (facility.website) {
                assistantMessage += `🌐 [Visit Website](${facility.website})\n`;
              }
            }
            break;

          case 'get_journey_summary':
            {
              if (!context.journeyId) {
                assistantMessage += '\n\n**You don\'t have an active journey yet.** Tell me what procedure you\'re interested in!';
                break;
              }

              const { data: journeyData } = await supabase
                .from('patient_journeys')
                .select('procedure_type, timeline, status')
                .eq('id', context.journeyId)
                .single();

              if (!journeyData) {
                assistantMessage += '\n\n**I couldn\'t find your journey.**';
                break;
              }

              const shortlistCount = context.shortlist?.length || 0;

              assistantMessage += '\n\n**Your Journey Summary**\n\n';
              assistantMessage += `**Procedure:** ${journeyData.procedure_type}\n`;
              assistantMessage += `**Timeline:** ${journeyData.timeline}\n`;
              assistantMessage += `**Shortlist:** ${shortlistCount} facilities\n`;
              assistantMessage += `**Status:** ${journeyData.status}\n`;
            }
            break;

          // Stub implementations for note, share, invite, contact, export
          case 'add_journey_note':
          case 'share_journey':
          case 'invite_collaborator':
            assistantMessage += `\n\nThis feature is coming soon!`;
            break;

          case 'draft_facility_message':
            {
              const { facility_id, procedure, include_medical_history = true } = toolInput;
              
              // Check if facility_id is a number (1, 2, 3) referencing shortlist position
              let resolvedFacilityId = facility_id;
              const numericRef = parseInt(facility_id, 10);
              if (!isNaN(numericRef) && context.shortlist && context.shortlist.length >= numericRef && numericRef > 0) {
                resolvedFacilityId = context.shortlist[numericRef - 1].id;
                console.log(`Resolved shortlist reference ${numericRef} to facility ID: ${resolvedFacilityId}`);
              }
              
              // Also check if it's a partial name match from shortlist
              if (context.shortlist && context.shortlist.length > 0) {
                const shortlistMatch = context.shortlist.find(s => 
                  s.name.toLowerCase().includes(facility_id.toLowerCase()) ||
                  facility_id.toLowerCase().includes(s.name.split(' ')[0].toLowerCase())
                );
                if (shortlistMatch) {
                  resolvedFacilityId = shortlistMatch.id;
                  console.log(`Matched shortlist facility by name: ${shortlistMatch.name}`);
                }
              }
              
              // Get facility details
              const { data: facility } = await supabase
                .from('facilities')
                .select('name, city, country, website, contact_email')
                .or(`id.eq.${resolvedFacilityId},name.ilike.%${resolvedFacilityId}%`)
                .limit(1)
                .single();

              if (!facility) {
                // If still not found, list the shortlist options
                if (context.shortlist && context.shortlist.length > 0) {
                  assistantMessage += `\n\nI couldn't find that facility. Your shortlisted facilities are:\n`;
                  context.shortlist.forEach((s, i) => {
                    assistantMessage += `${i + 1}. ${s.name} - ${s.location}\n`;
                  });
                  assistantMessage += `\nPlease tell me which one (1, 2, 3, etc.) or use the facility name.`;
                } else {
                  assistantMessage += `\n\nI couldn't find that facility. Please check the facility name or add some facilities to your shortlist first.`;
                }
                break;
              }

              const procedureName = procedure || context.procedure || 'my procedure';
              
              let draft = `Subject: Inquiry about ${procedureName} - Quote Request\n\n`;
              draft += `Dear ${facility.name} Team,\n\n`;
              draft += `I am interested in learning more about ${procedureName} at your facility in ${facility.city}, ${facility.country}.\n\n`;
              
              if (include_medical_history) {
                draft += `**My Medical Information:**\n`;
                draft += `- Procedure of interest: ${procedureName}\n`;
                draft += `- [Please provide: Age, relevant medical history, current medications, any previous surgeries]\n\n`;
              }
              
              draft += `**Questions:**\n`;
              draft += `1. What is the estimated cost for ${procedureName}?\n`;
              draft += `2. What is included in the quoted price (hospital stay, anesthesia, post-op care)?\n`;
              draft += `3. What is the typical timeline from consultation to procedure?\n`;
              draft += `4. Do you provide assistance with travel arrangements?\n`;
              draft += `5. What are your payment options?\n\n`;
              
              draft += `I would appreciate a personalized quote based on my medical records, which I can provide upon request.\n\n`;
              draft += `Thank you for your time.\n\n`;
              draft += `Best regards,\n`;
              draft += `[Your Name]\n`;
              draft += `[Your Email]\n`;
              draft += `[Your Phone Number]`;

              assistantMessage += `\n\n**Draft Message for ${facility.name}:**\n\n`;
              assistantMessage += `\`\`\`\n${draft}\n\`\`\`\n\n`;
              assistantMessage += `You can copy this message and send it via email to ${facility.email || facility.website || 'their contact page'}. `;
              assistantMessage += `Or I can help you send it directly if you'd like.`;
            }
            break;

          case 'contact_facility':
            {
              const { facility_id, message, user_email } = toolInput;
              
              if (!context.userEmail && !user_email) {
                assistantMessage += `\n\n**To contact facilities, please [log in](/auth) first.**`;
                break;
              }

              const email = user_email || context.userEmail;
              
              // Check if facility_id is a number referencing shortlist position
              let resolvedFacilityId = facility_id;
              const numericRef = parseInt(facility_id, 10);
              if (!isNaN(numericRef) && context.shortlist && context.shortlist.length >= numericRef && numericRef > 0) {
                resolvedFacilityId = context.shortlist[numericRef - 1].id;
              }
              
              // Also check shortlist for name match
              if (context.shortlist && context.shortlist.length > 0) {
                const shortlistMatch = context.shortlist.find(s => 
                  s.name.toLowerCase().includes(facility_id.toLowerCase()) ||
                  facility_id.toLowerCase().includes(s.name.split(' ')[0].toLowerCase())
                );
                if (shortlistMatch) {
                  resolvedFacilityId = shortlistMatch.id;
                }
              }
              
              // Get facility details
              const { data: facility } = await supabase
                .from('facilities')
                .select('name, contact_email, website')
                .or(`id.eq.${resolvedFacilityId},name.ilike.%${resolvedFacilityId}%`)
                .limit(1)
                .single();

              if (!facility) {
                if (context.shortlist && context.shortlist.length > 0) {
                  assistantMessage += `\n\nI couldn't find that facility. Your shortlisted facilities are:\n`;
                  context.shortlist.forEach((s, i) => {
                    assistantMessage += `${i + 1}. ${s.name} - ${s.location}\n`;
                  });
                } else {
                  assistantMessage += `\n\nI couldn't find that facility. Please try again with a facility name.`;
                }
                break;
              }

              // TODO: Send email via EmailJS or similar
              // For now, provide instructions
              assistantMessage += `\n\n**Ready to send!**\n\n`;
              assistantMessage += `I've prepared your message for ${facility.name}.\n\n`;
              assistantMessage += `**To send:**\n`;
              assistantMessage += `1. Copy the message below\n`;
              assistantMessage += `2. Email it to: ${facility.email || facility.website || 'their contact page'}\n\n`;
              assistantMessage += `**Your Message:**\n\n`;
              assistantMessage += `\`\`\`\n${message}\n\`\`\`\n\n`;
              assistantMessage += `**Tip:** Keep a copy of this message and any responses for your records.`;
            }
            break;

          case 'get_travel_requirements':
            {
              const { country, procedure_type } = toolInput;
              
              // Travel requirements by country
              const requirements: Record<string, { visa: string; passport: string; insurance: string; notes: string[] }> = {
                'thailand': {
                  visa: 'Tourist visa (30-60 days) - visa on arrival for US citizens, or apply online for longer stays',
                  passport: 'Valid for 6+ months from entry date',
                  insurance: 'Medical tourism insurance recommended (covers complications, evacuation)',
                  notes: [
                    'No visa required for stays under 30 days (US citizens)',
                    'Tourist visa sufficient for medical procedures',
                    'Consider travel companion for major procedures',
                    'English widely spoken in medical facilities'
                  ]
                },
                'mexico': {
                  visa: 'Tourist visa (FMM) - free for US citizens, valid 180 days',
                  passport: 'Valid passport or passport card',
                  insurance: 'Medical tourism insurance recommended, especially near border',
                  notes: [
                    'No visa required for US citizens (tourist permit at border)',
                    'Many facilities near US border for easy access',
                    'Spanish helpful but English common in medical facilities',
                    'Consider travel companion for major procedures'
                  ]
                },
                'india': {
                  visa: 'Tourist visa required - apply online (e-Visa) or at consulate, valid 30-90 days',
                  passport: 'Valid for 6+ months from entry date',
                  insurance: 'Medical tourism insurance strongly recommended',
                  notes: [
                    'e-Visa available online (apply 4 days before travel)',
                    'Tourist visa sufficient for medical procedures',
                    'English widely spoken in major medical facilities',
                    'Plan for longer stay (1-2 weeks post-op)',
                    'Travel companion recommended'
                  ]
                },
                'turkey': {
                  visa: 'e-Visa required for US citizens - apply online, valid 90 days',
                  passport: 'Valid for 6+ months from entry date',
                  insurance: 'Medical tourism insurance recommended',
                  notes: [
                    'e-Visa available online (instant approval)',
                    'Tourist visa sufficient for medical procedures',
                    'English spoken in major medical facilities',
                    'Consider travel companion for major procedures'
                  ]
                },
                'costa rica': {
                  visa: 'No visa required for US citizens (90 days)',
                  passport: 'Valid passport',
                  insurance: 'Medical tourism insurance recommended',
                  notes: [
                    'No visa needed for stays under 90 days',
                    'Easy access from US',
                    'English widely spoken',
                    'Consider travel companion for major procedures'
                  ]
                },
                'colombia': {
                  visa: 'No visa required for US citizens (90 days)',
                  passport: 'Valid passport',
                  insurance: 'Medical tourism insurance recommended',
                  notes: [
                    'No visa needed for stays under 90 days',
                    'English spoken in major medical facilities',
                    'Consider travel companion for major procedures'
                  ]
                }
              };

              const countryLower = country.toLowerCase();
              const countryKey = Object.keys(requirements).find(k => countryLower.includes(k)) || 'thailand';
              const req = requirements[countryKey] || requirements['thailand'];

              assistantMessage += `\n\n**Travel Requirements for ${country}:**\n\n`;
              assistantMessage += `**Passport:** ${req.passport}\n\n`;
              assistantMessage += `**Visa:** ${req.visa}\n\n`;
              assistantMessage += `**Insurance:** ${req.insurance}\n\n`;
              assistantMessage += `**Additional Notes:**\n`;
              req.notes.forEach(note => {
                assistantMessage += `• ${note}\n`;
              });
              
              if (procedure_type) {
                assistantMessage += `\n**For ${procedure_type}:** Plan to stay in ${country} for 1-2 weeks post-procedure for follow-up appointments and recovery.`;
              }
            }
            break;

          case 'get_recovery_timeline':
            {
              const { procedure } = toolInput;
              const proc = procedure?.toLowerCase() || '';
              
              // Recovery timelines by procedure type
              const timelines: Record<string, { hospital: string; destination: string; home: string; notes: string[] }> = {
                'dental': {
                  hospital: 'Same day or 1 night',
                  destination: '3-7 days',
                  home: '1-2 weeks (soft foods)',
                  notes: [
                    'Can usually return home within a week',
                    'Avoid hard foods for 1-2 weeks',
                    'Follow-up may be done remotely'
                  ]
                },
                'knee replacement': {
                  hospital: '2-4 days',
                  destination: '10-14 days',
                  home: '6-12 weeks (full recovery)',
                  notes: [
                    'Stay in destination for 2 weeks minimum',
                    'Physical therapy starts 1-2 days post-op',
                    'Can walk with assistance after 1-2 days',
                    'Full recovery takes 3-6 months'
                  ]
                },
                'hip replacement': {
                  hospital: '2-4 days',
                  destination: '10-14 days',
                  home: '6-12 weeks (full recovery)',
                  notes: [
                    'Stay in destination for 2 weeks minimum',
                    'Can walk with assistance after 1 day',
                    'Physical therapy starts immediately',
                    'Full recovery takes 3-6 months'
                  ]
                },
                'heart surgery': {
                  hospital: '5-7 days',
                  destination: '2-3 weeks',
                  home: '6-12 weeks (gradual return)',
                  notes: [
                    'Stay in destination for 3 weeks minimum',
                    'Strict activity restrictions for 6-8 weeks',
                    'Regular follow-up appointments required',
                    'Travel clearance needed before returning home'
                  ]
                },
                'cosmetic surgery': {
                  hospital: '1-2 days',
                  destination: '7-10 days',
                  home: '2-4 weeks (swelling/bruising)',
                  notes: [
                    'Stay in destination for 1 week minimum',
                    'Swelling and bruising normal for 2-3 weeks',
                    'Avoid strenuous activity for 4-6 weeks',
                    'Final results visible after 3-6 months'
                  ]
                },
                'bariatric': {
                  hospital: '1-2 days',
                  destination: '7-10 days',
                  home: '4-6 weeks (diet restrictions)',
                  notes: [
                    'Stay in destination for 1 week minimum',
                    'Liquid diet for 2-4 weeks post-op',
                    'Gradual return to solid foods',
                    'Lifelong dietary changes required'
                  ]
                }
              };

              const procedureKey = Object.keys(timelines).find(k => proc.includes(k)) || 'dental';
              const timeline = timelines[procedureKey] || timelines['dental'];

              assistantMessage += `\n\n**Recovery Timeline for ${procedure}:**\n\n`;
              assistantMessage += `**Hospital Stay:** ${timeline.hospital}\n\n`;
              assistantMessage += `**Stay in Destination:** ${timeline.destination} (for follow-ups and initial recovery)\n\n`;
              assistantMessage += `**Recovery at Home:** ${timeline.home}\n\n`;
              assistantMessage += `**Important Notes:**\n`;
              timeline.notes.forEach(note => {
                assistantMessage += `• ${note}\n`;
              });
              
              assistantMessage += `\n**Plan Accordingly:** Make sure you have enough time off work and support at home during recovery.`;
            }
            break;

          case 'export_journey_pdf':
            assistantMessage += `\n\n[This feature is being set up. Please use the [journey dashboard](/my-journey) for now.]`;
            break;

          // === MEDICAL TRUST TOOLS ===
          case 'search_trust_laws':
            {
              const query = toolInput.query || 'best states for asset protection trusts';
              const qdrantResults = await searchQdrant(query, 8);
              
              if (qdrantResults.length > 0) {
                assistantMessage += `\n\n**Trust Law Information**\n\n`;
                
                // Group by state if available
                const byState = new Map<string, string[]>();
                const general: string[] = [];
                
                for (const result of qdrantResults) {
                  const text = result.payload.text;
                  const state = result.payload.state;
                  
                  if (state) {
                    if (!byState.has(state)) {
                      byState.set(state, []);
                    }
                    byState.get(state)!.push(text);
                  } else {
                    general.push(text);
                  }
                }
                
                // Output by state
                for (const [state, texts] of byState) {
                  assistantMessage += `**${state}**\n`;
                  for (const text of texts.slice(0, 2)) {
                    // Truncate long texts
                    const truncated = text.length > 400 ? text.substring(0, 400) + '...' : text;
                    assistantMessage += `${truncated}\n\n`;
                  }
                }
                
                // Output general info
                if (general.length > 0 && byState.size === 0) {
                  for (const text of general.slice(0, 3)) {
                    const truncated = text.length > 400 ? text.substring(0, 400) + '...' : text;
                    assistantMessage += `${truncated}\n\n`;
                  }
                }
                
                assistantMessage += `[Explore our Trust Law Map](/medical-trusts) for state-by-state details.`;
              } else {
                assistantMessage += `\n\nI couldn't find specific trust law data for that query. `;
                assistantMessage += `Check our [Medical Trust Guide](/medical-trusts) for state-by-state analysis.`;
              }
            }
            break;

          case 'explain_medical_trust':
            {
              assistantMessage += `\n\n**What is a Medical Trust?**\n\n`;
              assistantMessage += `A Medical Trust is a legal structure that protects your assets from medical debt—the #1 cause of bankruptcy in America.\n\n`;
              assistantMessage += `**How it works:**\n`;
              assistantMessage += `• You transfer assets (home, savings, investments) into a trust\n`;
              assistantMessage += `• The trust owns the assets, not you personally\n`;
              assistantMessage += `• Medical creditors can't seize trust assets to pay your bills\n`;
              assistantMessage += `• You still control and benefit from the assets\n\n`;
              assistantMessage += `**Why it matters:**\n`;
              assistantMessage += `• 66.5% of bankruptcies are medical-related\n`;
              assistantMessage += `• Even people WITH insurance go bankrupt from medical bills\n`;
              assistantMessage += `• A trust is like a firewall between your wealth and the healthcare system\n\n`;
              assistantMessage += `[Learn more about Medical Trusts](/medical-trusts) | [Take the Pledge](/action)`;
            }
            break;

          case 'get_trust_resources':
            {
              assistantMessage += `\n\n**Medical Trust Resources**\n\n`;
              assistantMessage += `**On Oasara:**\n`;
              assistantMessage += `• [Medical Trust Guide](/medical-trusts) - Full explanation\n`;
              assistantMessage += `• [Take the Pledge](/action) - Commit to protecting yourself\n\n`;
              assistantMessage += `**External Resources:**\n`;
              assistantMessage += `• Asset protection attorneys in your state\n`;
              assistantMessage += `• Irrevocable trust vs. revocable trust considerations\n`;
              assistantMessage += `• Timing requirements (must be set up BEFORE medical debt occurs)\n\n`;
              assistantMessage += `We're building partnerships with legal services to help you actually form a trust. Want to be notified when that launches?`;
            }
            break;

          // === INSURANCE EXIT TOOLS ===
          case 'explain_insurance_exit':
            {
              assistantMessage += `\n\n**Alternatives to Traditional Insurance**\n\n`;
              assistantMessage += `The average family pays **$24,000/year** in premiums + a **$3,000 deductible**—and still gets **18% of claims denied**.\n\n`;
              assistantMessage += `**Your alternatives:**\n\n`;
              assistantMessage += `**Health Shares**\n`;
              assistantMessage += `• Members share medical costs directly\n`;
              assistantMessage += `• $200-500/month vs $2,000/month insurance\n`;
              assistantMessage += `• Examples: Sedera, Knew Health, Zion Health\n\n`;
              assistantMessage += `**Direct Primary Care (DPC)**\n`;
              assistantMessage += `• $50-150/month for unlimited doctor visits\n`;
              assistantMessage += `• No co-pays, no insurance hassle\n`;
              assistantMessage += `• Combined with catastrophic coverage\n\n`;
              assistantMessage += `**Self-Pay + Medical Tourism**\n`;
              assistantMessage += `• Pay cash for routine care (often cheaper than co-pays)\n`;
              assistantMessage += `• Go abroad for major procedures (60-90% savings)\n`;
              assistantMessage += `• Keep a medical emergency fund instead of paying premiums\n\n`;
              assistantMessage += `We're building a full Insurance Exit Assessment tool. [Join the waitlist](/action)`;
            }
            break;

          case 'join_insurance_waitlist':
            {
              const email = toolInput.email || context.userEmail;
              
              if (!email) {
                assistantMessage += '\n\n**Please provide your email to join the waitlist.**';
                break;
              }

              // Add to insurance_exit_waitlist table (create if doesn't exist)
              const { error } = await supabase
                .from('insurance_exit_waitlist')
                .insert({
                  email: email.toLowerCase(),
                  current_insurance_type: toolInput.current_insurance_type || null,
                  state: toolInput.state || null,
                  created_at: new Date().toISOString()
                });

              if (error && error.code !== '23505') { // Ignore duplicate
                // Table might not exist, that's ok for now
                console.log('Waitlist insert error (may not exist yet):', error);
              }

              assistantMessage += `\n\n**You're on the Insurance Exit waitlist.**\n\n`;
              assistantMessage += `We'll email you at **${email}** when our full Insurance Exit Assessment tool launches. `;
              assistantMessage += `You'll get:\n`;
              assistantMessage += `- Personalized alternatives for your state\n`;
              assistantMessage += `- Cost comparison calculator\n`;
              assistantMessage += `- Step-by-step exit guide\n\n`;
              assistantMessage += `In the meantime, [take the pledge →](/action)`;
            }
            break;

          // === PLEDGE TOOLS ===
          case 'check_pledge_status':
            {
              const email = context.userEmail;

              if (!email) {
                assistantMessage += '\n\nTo check your pledge status, please make sure you\'re logged in!';
                break;
              }

              const { data: pledges } = await supabase
                .from('pledges')
                .select('pledge_type')
                .eq('email', email.toLowerCase());

              const hasMedicalTrust = pledges?.some(p => p.pledge_type === 'medical_trust') || false;
              const hasCancelInsurance = pledges?.some(p => p.pledge_type === 'cancel_insurance') || false;
              const hasMedicalTourism = pledges?.some(p => p.pledge_type === 'try_medical_tourism') || false;

              const pledgeCount = [hasMedicalTrust, hasCancelInsurance, hasMedicalTourism].filter(Boolean).length;

              assistantMessage += '\n\n**Your Healthcare Sovereignty Pledges**\n\n';

              if (pledgeCount === 3) {
                assistantMessage += '🎉 **All three pledges taken!** You\'re leading the revolution.\n\n';
              }

              assistantMessage += `${hasMedicalTrust ? '[x]' : '[ ]'} **Medical Trust** - Protect assets\n`;
              assistantMessage += `${hasCancelInsurance ? '[x]' : '[ ]'} **Cancel Insurance** - Exit the trap\n`;
              assistantMessage += `${hasMedicalTourism ? '[x]' : '[ ]'} **Medical Tourism** - Use global healthcare\n\n`;

              if (pledgeCount < 3) {
                assistantMessage += `[Take the pledge →](/action)`;
              }
            }
            break;

          case 'prompt_pledge':
            {
              const { pledge_type } = toolInput;

              const pledgeInfo: Record<string, { title: string; why: string }> = {
                medical_trust: {
                  title: 'Medical Trust',
                  why: 'Medical debt is the #1 cause of bankruptcy in America—even for people WITH insurance.'
                },
                cancel_insurance: {
                  title: 'Cancel Insurance',
                  why: 'The average family pays $24,000/year in premiums and still gets claims denied.'
                },
                try_medical_tourism: {
                  title: 'Medical Tourism',
                  why: 'JCI-accredited hospitals abroad offer the same quality at 60-90% savings.'
                }
              };

              const pledge = pledgeInfo[pledge_type] || pledgeInfo.try_medical_tourism;

              assistantMessage += `\n\n**Have you considered the ${pledge.title} pledge?**\n\n`;
              assistantMessage += `${pledge.why}\n\n`;
              assistantMessage += `[Learn more & take the pledge →](/action)`;
            }
            break;

          // === COMMUNITY STORIES TOOLS ===
          case 'search_stories':
            {
              const { query, story_type, procedure, limit = 3 } = toolInput;

              let dbQuery = supabase
                .from('stories')
                .select('id, slug, title, summary, story_type, procedure, display_name, verification_level, reaction_counts, share_count, published_at')
                .in('status', ['published', 'featured'])
                .order('share_count', { ascending: false })
                .limit(limit);

              if (story_type) {
                dbQuery = dbQuery.eq('story_type', story_type);
              }
              if (procedure) {
                dbQuery = dbQuery.ilike('procedure', `%${procedure}%`);
              }
              if (query) {
                dbQuery = dbQuery.or(`title.ilike.%${query}%,summary.ilike.%${query}%,content.ilike.%${query}%`);
              }

              const { data: storiesData, error } = await dbQuery;

              if (error || !storiesData || storiesData.length === 0) {
                assistantMessage += '\n\nI couldn\'t find any stories matching your search. Would you like to be the first to [share your experience](/share-story)?';
              } else {
                const storyTypeLabels = {
                  horror: '💔 Horror Story',
                  success: '🎉 Success Story',
                  comparison: '⚖️ Comparison'
                };

                assistantMessage += '\n\n**Stories from Our Community**\n\n';
                
                for (const story of storiesData) {
                  const typeLabel = storyTypeLabels[story.story_type as keyof typeof storyTypeLabels] || story.story_type;
                  const reactions = story.reaction_counts as Record<string, number>;
                  const meToo = reactions?.me_too || 0;
                  
                  assistantMessage += `**${typeLabel}**: [${story.title}](/stories/${story.slug})\n`;
                  assistantMessage += `> ${story.summary?.substring(0, 100)}...\n`;
                  assistantMessage += `*${meToo > 0 ? `${meToo} others relate` : 'Be the first to react'} • ${story.share_count || 0} shares*\n\n`;
                }

                assistantMessage += `[See all stories →](/stories)`;
              }
            }
            break;

          case 'get_story_details':
            {
              const { story_slug } = toolInput;

              const { data: story, error } = await supabase
                .from('stories')
                .select('*')
                .eq('slug', story_slug)
                .in('status', ['published', 'featured'])
                .single();

              if (error || !story) {
                assistantMessage += '\n\nI couldn\'t find that story. It may have been removed or isn\'t published yet.';
              } else {
                const storyTypeLabels = {
                  horror: '💔 Horror Story',
                  success: '🎉 Success Story',
                  comparison: '⚖️ Comparison'
                };
                const typeLabel = storyTypeLabels[story.story_type as keyof typeof storyTypeLabels];
                const reactions = story.reaction_counts as Record<string, number>;

                assistantMessage += `\n\n**${typeLabel}**: ${story.title}\n\n`;
                assistantMessage += `*By ${story.display_name || 'Anonymous'}`;
                if (story.verification_level !== 'anonymous') {
                  assistantMessage += ' (Verified)';
                }
                assistantMessage += `*\n\n`;

                // For comparisons, show the savings
                if (story.story_type === 'comparison' && story.cost_us && story.cost_abroad) {
                  assistantMessage += `**US Price:** $${story.cost_us.toLocaleString()}\n`;
                  assistantMessage += `**Abroad:** $${story.cost_abroad.toLocaleString()}\n`;
                  assistantMessage += `**Saved:** ${story.savings_percent}%\n\n`;
                }

                // Show preview of content
                const preview = story.content.substring(0, 300);
                assistantMessage += `${preview}...\n\n`;

                // Show reactions
                assistantMessage += `❤️ ${reactions?.heart || 0} • 🤝 ${reactions?.me_too || 0} "Me Too" • 📢 ${story.share_count || 0} Shares\n\n`;

                assistantMessage += `[Read full story →](/stories/${story.slug})`;
              }
            }
            break;

          case 'suggest_share_story':
            {
              const { story_type } = toolInput;

              const suggestions: Record<string, { title: string; prompt: string }> = {
                horror: {
                  title: '💔 Share Your Healthcare Horror Story',
                  prompt: 'Many people have had frustrating or unfair experiences with the US healthcare system. Sharing your story can help others feel less alone—and push for change.'
                },
                success: {
                  title: '🎉 Share Your Success Story',
                  prompt: 'Did medical tourism or a medical trust help you? Your success story could inspire someone else to take the leap.'
                },
                comparison: {
                  title: '⚖️ Share Your Before & After',
                  prompt: 'Comparing what you would have paid in the US vs. what you actually paid abroad is one of the most powerful ways to show others what\'s possible.'
                }
              };

              const suggestion = suggestions[story_type || 'success'] || suggestions.success;

              assistantMessage += `\n\n**${suggestion.title}**\n\n`;
              assistantMessage += `${suggestion.prompt}\n\n`;
              assistantMessage += `Your story could help thousands of others make informed decisions about their healthcare.\n\n`;
              assistantMessage += `[Share your story →](/share-story)`;
            }
            break;
        }
      }
    }

    // Default message
    if (!assistantMessage) {
      assistantMessage = "Hey! I'm here to help you take control of your healthcare. What's on your mind?";
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
    console.error('Unified chat error:', error);

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

