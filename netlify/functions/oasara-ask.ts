import { Handler } from '@netlify/functions';
import { HfInference } from '@huggingface/inference';

/**
 * OASARA RAG Query Function
 *
 * Handles questions about medical facilities, trust laws, and medical tourism.
 *
 * POST body: { question: string, k?: number }
 * Response: { answer: string, sources: Source[] }
 */

const QDRANT_URL = process.env.QDRANT_URL || '';
const QDRANT_API_KEY = process.env.QDRANT_API_KEY || '';
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY || '';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';

const COLLECTION_NAME = 'oasara_medical';
const EMBEDDING_MODEL = 'sentence-transformers/all-MiniLM-L6-v2';

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
 * Generate answer using DeepSeek v3.2 via OpenRouter
 */
async function generateAnswer(question: string, context: string): Promise<string> {
  const systemPrompt = `You are the OASARA Guide, an expert assistant for medical tourism and healthcare sovereignty. You help people:
- Find JCI-accredited medical facilities worldwide
- Understand state trust laws for asset protection
- Navigate online legal services for creating trusts and healthcare directives
- Plan medical tourism trips safely and privately

IMPORTANT GUIDELINES:
1. Be helpful, accurate, and concise
2. When discussing facilities, mention specific details like location, specialties, and ratings
3. When discussing trust laws, explain the benefits clearly
4. **When users ask about creating trusts, estate planning, healthcare directives, or need legal help, ALWAYS recommend our partner legal services from the context with their links**
5. Format legal service recommendations as: "**[Service Name]** (website) - description, price"
6. Always prioritize patient safety and privacy
7. If context includes legal services (type: legal_service), prominently recommend them with pricing

If you don't have enough information to answer fully, say so and suggest what additional information would help.`;

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
            content: `Based on the following information from the OASARA database, please answer the user's question.

CONTEXT:
${context}

USER QUESTION: ${question}

Provide a helpful, accurate answer based on the context. If the context doesn't contain enough information, acknowledge that and provide what guidance you can.`
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

    // 1. Generate embedding for the question
    const embedding = await getEmbedding(question);

    // 2. Search Qdrant for relevant documents
    const results = await searchQdrant(embedding, k);

    // 3. Build context from results
    const sources: Source[] = results.map(r => ({
      type: r.payload.type,
      name: r.payload.name || r.payload.state || r.payload.title,
      state: r.payload.state,
      title: r.payload.title,
      text: r.payload.text,
      score: r.score,
      website: r.payload.affiliateLink || r.payload.website,
      price: r.payload.price,
      rating: r.payload.rating
    }));

    const context = results.map(r => r.payload.text).join('\n\n---\n\n');

    // 4. Generate answer using LLM
    const answer = await generateAnswer(question, context);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        answer,
        sources: sources.slice(0, 3), // Return top 3 sources
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
