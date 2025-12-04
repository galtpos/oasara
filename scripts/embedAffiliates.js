/**
 * Embed affiliate programs into Qdrant for RAG
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const { HfInference } = require('@huggingface/inference');

const QDRANT_URL = process.env.QDRANT_URL;
const QDRANT_API_KEY = process.env.QDRANT_API_KEY;
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

const COLLECTION_NAME = 'oasara_medical';
const EMBEDDING_MODEL = 'sentence-transformers/all-MiniLM-L6-v2';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const hf = new HfInference(HUGGINGFACE_API_KEY);

/**
 * Convert affiliate to rich text for embedding
 */
function affiliateToText(affiliate) {
  let text = `Legal Service: ${affiliate.service_name}\n`;
  text += `Description: ${affiliate.description}\n`;
  text += `Price: ${affiliate.price_display} (${affiliate.price_type})\n`;
  text += `Category: ${affiliate.category}\n`;
  text += `Rating: ${affiliate.rating}/5\n`;
  text += `Website: ${affiliate.website_url}\n\n`;

  if (affiliate.features && affiliate.features.length > 0) {
    text += `Features: ${affiliate.features.join('. ')}\n`;
  }
  if (affiliate.pros && affiliate.pros.length > 0) {
    text += `Pros: ${affiliate.pros.join('. ')}\n`;
  }
  if (affiliate.cons && affiliate.cons.length > 0) {
    text += `Cons: ${affiliate.cons.join('. ')}\n`;
  }

  text += `\nThis service can help with creating living trusts, healthcare directives, power of attorney, and estate planning documents. `;
  text += `Great for medical trust setup and healthcare planning.`;

  return text;
}

/**
 * Get embedding from HuggingFace
 */
async function getEmbedding(text) {
  const result = await hf.featureExtraction({
    model: EMBEDDING_MODEL,
    inputs: text
  });

  if (Array.isArray(result) && typeof result[0] === 'number') {
    return result;
  } else if (Array.isArray(result) && Array.isArray(result[0])) {
    return result[0];
  }
  throw new Error('Unexpected embedding format');
}

/**
 * Get collection info
 */
async function getCollectionInfo() {
  const response = await fetch(`${QDRANT_URL}/collections/${COLLECTION_NAME}`, {
    headers: { 'api-key': QDRANT_API_KEY }
  });
  return response.json();
}

/**
 * Main function
 */
async function main() {
  console.log('=== Embedding Affiliate Programs ===\n');

  // Fetch affiliates from Supabase
  const { data: affiliates, error } = await supabase
    .from('affiliate_programs')
    .select('*')
    .eq('is_active', true);

  if (error) {
    console.error('Error fetching affiliates:', error);
    process.exit(1);
  }

  console.log(`Found ${affiliates.length} active affiliates\n`);

  // Get next available ID
  const info = await getCollectionInfo();
  let nextId = (info.result?.points_count || 0) + 2000;

  const points = [];

  for (let i = 0; i < affiliates.length; i++) {
    const affiliate = affiliates[i];
    const text = affiliateToText(affiliate);

    console.log(`  [${i + 1}/${affiliates.length}] Embedding ${affiliate.service_name}...`);

    const vector = await getEmbedding(text);

    points.push({
      id: nextId++,
      vector,
      payload: {
        type: 'legal_service',
        name: affiliate.service_name,
        slug: affiliate.service_slug,
        description: affiliate.description,
        price: affiliate.price_display,
        priceType: affiliate.price_type,
        category: affiliate.category,
        rating: affiliate.rating,
        website: affiliate.website_url,
        affiliateLink: affiliate.affiliate_link || affiliate.website_url,
        features: affiliate.features,
        pros: affiliate.pros,
        cons: affiliate.cons,
        text
      }
    });

    await new Promise(r => setTimeout(r, 100));
  }

  // Upload to Qdrant
  console.log('\nUploading to Qdrant...');
  const response = await fetch(`${QDRANT_URL}/collections/${COLLECTION_NAME}/points?wait=true`, {
    method: 'PUT',
    headers: {
      'api-key': QDRANT_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ points })
  });

  if (!response.ok) {
    console.error('Upload error:', await response.text());
  } else {
    console.log('Upload complete!');
  }

  // Verify
  const finalInfo = await getCollectionInfo();
  console.log(`\nFinal collection has ${finalInfo.result?.points_count} points`);
}

main().catch(console.error);
