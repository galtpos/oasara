import { Handler } from '@netlify/functions';
import { HfInference } from '@huggingface/inference';
import { procedures, searchProcedures, getCheapestGlobalCost } from '../../src/data/procedureDatabase';
import { createClient } from '@supabase/supabase-js';

/**
 * OASARA COMPREHENSIVE CHATBOT
 *
 * Accesses ALL site data:
 * - 518 JCI facilities (Supabase)
 * - 43 procedures with pricing
 * - Doctor profiles
 * - Medical trust laws (Qdrant)
 * - Legal services (Qdrant)
 * - Medical tourism knowledge (Qdrant)
 *
 * POST body: { question: string, k?: number }
 * Response: { answer: string, sources: Source[] }
 */

const QDRANT_URL = process.env.QDRANT_URL || '';
const QDRANT_API_KEY = process.env.QDRANT_API_KEY || '';
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY || '';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

const COLLECTION_NAME = 'oasara_medical';
const EMBEDDING_MODEL = 'sentence-transformers/all-MiniLM-L6-v2';

// Initialize Supabase client for facility queries
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface Source {
  type: string;
  name?: string;
  state?: string;
  title?: string;
  text: string;
  score: number;
  website?: string;
  price?: string;
  rating?: number;
  id?: string;
}

interface QdrantSearchResult {
  id: number;
  score: number;
  payload: {
    text: string;
    type: string;
    name?: string;
    state?: string;
    title?: string;
    country?: string;
    city?: string;
    website?: string;
    affiliateLink?: string;
    url?: string;
    price?: string;
    rating?: number;
  };
}

// Initialize HuggingFace client
const hf = new HfInference(HUGGINGFACE_API_KEY);

/**
 * Generate embedding using HuggingFace Inference SDK
 */
async function getEmbedding(text: string): Promise<number[]> {
  const result = await hf.featureExtraction({
    model: EMBEDDING_MODEL,
    inputs: text,
  });

  // Handle different response formats
  if (Array.isArray(result) && typeof result[0] === 'number') {
    return result as number[];
  } else if (Array.isArray(result) && Array.isArray(result[0])) {
    return result[0] as number[];
  }

  throw new Error('Unexpected embedding format from HuggingFace');
}

/**
 * Search Qdrant for similar vectors
 */
async function searchQdrant(vector: number[], k: number = 5): Promise<QdrantSearchResult[]> {
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
    throw new Error(`Qdrant search error: ${await response.text()}`);
  }

  const data = await response.json();
  return data.result || [];
}

/**
 * Classify user intent to route to appropriate data source
 */
function classifyIntent(question: string): string[] {
  const q = question.toLowerCase();
  const intents: string[] = [];

  // Facility search indicators
  if (q.match(/\b(hospital|clinic|facility|facilities|center|centres)\b/) ||
      q.match(/\b(where|which|find|show|list)\b.*\b(in|at)\b/)) {
    intents.push('facility');
  }

  // Doctor search indicators
  if (q.match(/\b(doctor|surgeon|physician|specialist|dr\.)\b/)) {
    intents.push('doctor');
  }

  // Procedure indicators
  if (q.match(/\b(surgery|procedure|treatment|operation|therapy)\b/) ||
      q.match(/\b(cost|price|how much|save|savings)\b/) ||
      q.match(/\b(hip|knee|heart|dental|lasik|ivf)\b/)) {
    intents.push('procedure');
  }

  // Trust/legal indicators
  if (q.match(/\b(trust|legal|law|estate|planning|will|directive)\b/)) {
    intents.push('trust');
  }

  // Country/location indicators
  if (q.match(/\b(thailand|mexico|india|turkey|costa rica|colombia|panama|singapore)\b/i)) {
    intents.push('location');
  }

  return intents.length > 0 ? intents : ['general'];
}

/**
 * Search facilities in Supabase
 */
async function searchFacilities(question: string, procedureName?: string) {
  try {
    let query = supabase.from('facilities').select('*');

    // If specific procedure mentioned, filter by it
    if (procedureName) {
      query = query.or(`popular_procedures.cs.{${procedureName}},specialties.cs.{${procedureName}}`);
    }

    // Extract country/city from question
    const countryMatch = question.match(/\b(thailand|mexico|india|turkey|costa rica|colombia|panama|singapore|brazil|south korea|malaysia|czech republic|spain|greece|hungary|dubai|germany|japan|iran)\b/i);
    if (countryMatch) {
      const country = countryMatch[0];
      query = query.ilike('country', `%${country}%`);
    }

    // Limit to top results
    query = query.limit(10);

    const { data, error } = await query;

    if (error) {
      console.error('Supabase facility search error:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Facility search error:', error);
    return [];
  }
}

/**
 * Search doctors across facilities
 */
async function searchDoctors(question: string) {
  try {
    const { data, error } = await supabase
      .from('facilities')
      .select('name, city, country, doctors, website')
      .not('doctors', 'is', null)
      .limit(10);

    if (error) {
      console.error('Doctor search error:', error);
      return [];
    }

    // Filter facilities that have doctor data
    return (data || []).filter(f => f.doctors && f.doctors.length > 0);
  } catch (error) {
    console.error('Doctor search error:', error);
    return [];
  }
}

/**
 * Search US hospitals with pricing for comparison
 */
async function searchUSHospitals(question: string, procedureName?: string) {
  try {
    let query = supabase
      .from('facilities')
      .select('id, name, city, state, country, procedure_pricing, website')
      .eq('country', 'United States');

    // If specific procedure mentioned, filter by it
    if (procedureName) {
      query = query.or(`procedure_pricing.cs.{${procedureName}},popular_procedures.cs.{${procedureName}}`);
    }

    // Extract hospital name from question
    const hospitalMatch = question.match(/\b([A-Z][a-z]+ (?:General |Medical |Regional )?(?:Hospital|Medical Center|Clinic|Health System))\b/);
    if (hospitalMatch) {
      const hospitalName = hospitalMatch[1];
      query = query.ilike('name', `%${hospitalName}%`);
    }

    // Extract state from question
    const stateMatch = question.match(/\b(Alabama|Alaska|Arizona|Arkansas|California|Colorado|Connecticut|Delaware|Florida|Georgia|Hawaii|Idaho|Illinois|Indiana|Iowa|Kansas|Kentucky|Louisiana|Maine|Maryland|Massachusetts|Michigan|Minnesota|Mississippi|Missouri|Montana|Nebraska|Nevada|New Hampshire|New Jersey|New Mexico|New York|North Carolina|North Dakota|Ohio|Oklahoma|Oregon|Pennsylvania|Rhode Island|South Carolina|South Dakota|Tennessee|Texas|Utah|Vermont|Virginia|Washington|West Virginia|Wisconsin|Wyoming)\b/i);
    if (stateMatch) {
      query = query.ilike('state', `%${stateMatch[0]}%`);
    }

    query = query.limit(10);
    const { data, error } = await query;

    if (error) {
      console.error('US hospital search error:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('US hospital search error:', error);
    return [];
  }
}

/**
 * Format facility data for LLM context
 */
function formatFacilityContext(facilities: any[]): string {
  return facilities.map(f => {
    const parts = [
      `**${f.name}** (${f.city}, ${f.country}) [ID: ${f.id}]`,
      f.jci_accredited ? '✓ JCI Accredited' : '',
      f.specialties ? `Specialties: ${f.specialties.slice(0, 3).join(', ')}` : '',
      f.website ? `Website: ${f.website}` : '',
    ];
    return parts.filter(Boolean).join('\n');
  }).join('\n\n');
}

/**
 * Generate answer using DeepSeek v3.2 via OpenRouter
 */
async function generateAnswer(question: string, context: string): Promise<string> {
  const systemPrompt = `You are Oasara's medical tourism assistant. Be direct, clear, and helpful.

CRITICAL: When context includes facilities with [ID: xxx], you MUST create markdown links using that EXACT ID.
Example from context: "Berlin Medical Center (Berlin, Germany) [ID: abc-123]"
Your response: "[Berlin Medical Center](/facilities/abc-123) - Berlin, Germany"

RESPONSE RULES:
1. Start with answer immediately (no "based on context")
2. ALWAYS link facilities: [Facility Name](/facilities/ID-from-context)
3. Format prices: $12,000 (comma + dollar sign)
4. Keep SHORT: 2-3 sentences + bullet list (max 3 items)
5. NO call to action arrows (→) - just end naturally
6. Show savings: Save $33,000 (73%)
7. Never apologize or use filler phrases
8. For sections: Use plain text "Facility Name:" not **bold**
9. Max 3 facilities per list

FACILITY LINKING (MANDATORY):
- Context shows: "Bangkok Hospital (Bangkok, Thailand) [ID: abc-123]"
- You write: "[Bangkok Hospital](/facilities/abc-123) - Bangkok, Thailand, $12,000"
- NEVER make up IDs or use slugs
- NEVER use **bold** inside markdown links
- If no [ID: xxx] in context, don't create a link

FORMATTING:
- Prices: $12,000-$15,000
- Comparison: US: $45,000 | Thailand: $12,000 | Save $33,000 (73%)
- Lists: Use "-" for bullet points (3 max)
- NO headers (###), NO bold (**), NO arrows (→)

BANNED:
- "Based on context", "I apologize", "Let me help", "Compare quotes"
- Headers: ###, ##, #
- Bold: ** (except in plain text, not in links)
- Arrows: →
- Bad numbers: "12k", "approximately"

TONE: Direct friend. Just the facts and links.`;

  const response = await fetch(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://oasara.com',
        'X-Title': 'OASARA Medical Tourism Guide'
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: `CONTEXT FROM OASARA DATABASE:

${context}

QUESTION: ${question}

Answer directly. Start with the answer, then support with data. End with one call to action.`
          }
        ],
        temperature: 0.7,
        max_tokens: 1024
      })
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error('OpenRouter API error:', error);
    // Fallback to context-only response
    return `Based on our database, here's what I found relevant to your question:\n\n${context.substring(0, 1500)}...\n\nFor more specific guidance, please refine your question or explore our facilities map.`;
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || 'I apologize, but I was unable to generate a response. Please try rephrasing your question.';
}

/**
 * Main handler
 */
export const handler: Handler = async (event) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { question, k = 5 } = JSON.parse(event.body || '{}');

    if (!question || typeof question !== 'string') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Question is required' })
      };
    }

    // COMPREHENSIVE DATA ACCESS - Query ALL sources in parallel
    const intents = classifyIntent(question);
    let context = '';
    const sources: Source[] = [];

    // First, search procedures to get procedure name for filtering
    const procedureResults = searchProcedures(question);
    const topProcedureName = procedureResults.length > 0 ? procedureResults[0].name : undefined;

    // Query ALL data sources simultaneously (not just what matches intent)
    const [
      facilities,
      usHospitals,
      doctorFacilities,
      ragResults
    ] = await Promise.all([
      // Query facilities if facility/location intent
      (intents.includes('facility') || intents.includes('location'))
        ? searchFacilities(question, topProcedureName)
        : Promise.resolve([]),

      // ALWAYS search US hospitals for comparison
      searchUSHospitals(question, topProcedureName),

      // Query doctors if doctor intent
      intents.includes('doctor')
        ? searchDoctors(question)
        : Promise.resolve([]),

      // ALWAYS search RAG (trust, legal, medical tourism)
      (async () => {
        const embedding = await getEmbedding(question);
        return await searchQdrant(embedding, k);
      })()
    ]);

    // Build comprehensive context from ALL results

    // 1. US Hospitals (for comparison)
    if (usHospitals.length > 0) {
      const usContext = usHospitals.map(h => {
        const parts = [
          `**${h.name}** (${h.city}, ${h.state}) [ID: ${h.id}]`,
          h.procedure_pricing ? `Has pricing data for procedures` : '',
          h.website ? `Website: ${h.website}` : ''
        ];
        return parts.filter(Boolean).join('\n');
      }).join('\n\n');

      context += `US HOSPITALS:\n\n${usContext}\n\n`;

      usHospitals.slice(0, 3).forEach(h => {
        sources.push({
          type: 'us_hospital',
          name: h.name,
          text: `${h.name} in ${h.city}, ${h.state}`,
          score: 0.95,
          website: h.website,
          id: h.id
        });
      });
    }

    // 2. Global Facilities
    if (facilities.length > 0) {
      context += `GLOBAL MEDICAL TOURISM FACILITIES:\n\n${formatFacilityContext(facilities)}\n\n`;
      facilities.slice(0, 3).forEach(f => {
        sources.push({
          type: 'facility',
          name: f.name,
          text: `${f.name} in ${f.city}, ${f.country}`,
          score: 0.9,
          website: f.website,
          id: f.id
        });
      });
    }

    // 3. Doctors
    if (doctorFacilities.length > 0) {
      const doctorContext = doctorFacilities.map(f => {
        const doctors = f.doctors.slice(0, 3).map((d: any) =>
          `- ${d.name}${d.specialization ? ` (${d.specialization})` : ''}`
        ).join('\n');
        return `**${f.name}** (${f.city}, ${f.country})\n${doctors}`;
      }).join('\n\n');

      context += `DOCTORS:\n\n${doctorContext}\n\n`;

      doctorFacilities.slice(0, 3).forEach(f => {
        sources.push({
          type: 'doctor',
          name: f.name,
          text: `${f.name} - ${f.doctors.length} doctors`,
          score: 0.85,
          website: f.website
        });
      });
    }

    // 4. Procedures (only top match)
    if (procedureResults.length > 0) {
      const topProcedure = procedureResults[0];
      const procedureFacilities = await searchFacilities(question, topProcedure.name);
      const cheapest = getCheapestGlobalCost(topProcedure);
      const bestCountry = topProcedure.globalCosts.find(gc => gc.costMin === cheapest);

      context += `PROCEDURE PRICING:\n\n**${topProcedure.name}**\n- US: ${topProcedure.usaCost} (up to $${topProcedure.usaCostMax.toLocaleString()})\n- Cheapest: $${cheapest.toLocaleString()} in ${bestCountry?.city}, ${bestCountry?.country}\n- Savings: ${topProcedure.savings}\n\n`;

      if (procedureFacilities.length > 0) {
        context += `Facilities offering this:\n${formatFacilityContext(procedureFacilities)}\n\n`;
      }

      sources.push({
        type: 'procedure',
        name: topProcedure.name,
        text: topProcedure.description || topProcedure.categoryTitle,
        score: 0.95
      });
    }

    // 5. Trust/Legal/Medical Tourism (ALWAYS include from RAG)
    if (ragResults.length > 0) {
      const ragContext = ragResults.map(r => r.payload.text).join('\n\n---\n\n');
      context += `TRUST & LEGAL INFO:\n\n${ragContext}\n\n`;

      ragResults.slice(0, 5).forEach(r => {
        sources.push({
          type: r.payload.type,
          name: r.payload.name || r.payload.state || r.payload.title,
          state: r.payload.state,
          title: r.payload.title,
          text: r.payload.text,
          score: r.score,
          website: r.payload.affiliateLink || r.payload.website,
          price: r.payload.price,
          rating: r.payload.rating
        });
      });
    }

    // If no context found anywhere, return helpful message
    if (!context) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          answer: `I'm here to help you with:\n\n- **Finding facilities**: "Show me hospitals in Thailand"\n- **Procedure pricing**: "How much does hip replacement cost?"\n- **Doctor search**: "Find cardiac surgeons in India"\n- **Legal help**: "How do I set up a medical trust?"\n\nWhat can I help you with?`,
          sources: [],
          question
        })
      };
    }

    // Generate answer using LLM with aggregated context
    const answer = await generateAnswer(question, context);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        answer,
        sources: sources.slice(0, 5), // Return top 5 sources
        question
      })
    };

  } catch (error) {
    console.error('Error processing request:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to process request',
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};
