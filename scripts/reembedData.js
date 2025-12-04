/**
 * OASARA Re-embedder - Updates Qdrant with full 50-state trust law data
 *
 * This script:
 * 1. Parses the full stateTrustLaws.ts file
 * 2. Generates embeddings for all 50 states
 * 3. Updates the Qdrant collection
 */

require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const { HfInference } = require('@huggingface/inference');

const QDRANT_URL = process.env.QDRANT_URL;
const QDRANT_API_KEY = process.env.QDRANT_API_KEY;
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;

const COLLECTION_NAME = 'oasara_medical';
const EMBEDDING_MODEL = 'sentence-transformers/all-MiniLM-L6-v2';

const hf = new HfInference(HUGGINGFACE_API_KEY);

/**
 * Parse the TypeScript file to extract trust law data
 */
function parseStateTrustLaws() {
  const content = fs.readFileSync(
    path.join(__dirname, '../src/data/stateTrustLaws.ts'),
    'utf8'
  );

  const states = [];

  // Use regex to extract each state object
  // Find each state entry
  const stateMatches = content.matchAll(/{\s*state:\s*'([^']+)',\s*stateCode:\s*'([^']+)',\s*overallScore:\s*([\d.]+),\s*tier:\s*'([^']+)'/g);

  for (const match of stateMatches) {
    const [, stateName, stateCode, score, tier] = match;

    // Find the section for this state to extract more details
    const stateStart = match.index;
    const nextStateMatch = content.indexOf("state: '", stateStart + 10);
    const stateSection = content.slice(stateStart, nextStateMatch === -1 ? undefined : nextStateMatch);

    // Extract highlights
    const highlightsMatch = stateSection.match(/highlights:\s*\[([\s\S]*?)\]/);
    const highlights = highlightsMatch
      ? highlightsMatch[1].match(/'([^']+)'/g)?.map(h => h.replace(/'/g, '')) || []
      : [];

    // Extract criteria summaries
    const criteriaData = {};
    const criteriaTypes = ['assetProtection', 'selfSettledTrusts', 'taxTreatment', 'healthcareSpecific', 'spendthriftProvisions', 'privacyProtections'];

    for (const criteria of criteriaTypes) {
      const summaryMatch = stateSection.match(new RegExp(`${criteria}:\\s*{[^}]*summary:\\s*'([^']+)'`));
      const detailsMatch = stateSection.match(new RegExp(`${criteria}:\\s*{[^}]*details:\\s*'([^']+)'`));
      if (summaryMatch) {
        criteriaData[criteria] = {
          summary: summaryMatch[1],
          details: detailsMatch ? detailsMatch[1] : ''
        };
      }
    }

    states.push({
      state: stateName,
      stateCode,
      overallScore: parseFloat(score),
      tier,
      highlights,
      criteria: criteriaData
    });
  }

  return states;
}

/**
 * Convert state law to rich text for embedding
 */
function stateToText(law) {
  let text = `State Trust Law: ${law.state} (${law.stateCode})\n`;
  text += `Overall Score: ${law.overallScore}/10\n`;
  text += `Tier: ${law.tier}\n`;

  if (law.highlights.length > 0) {
    text += `Key Highlights: ${law.highlights.join('. ')}\n`;
  }

  // Add criteria details
  if (law.criteria.assetProtection) {
    text += `Asset Protection: ${law.criteria.assetProtection.summary}. ${law.criteria.assetProtection.details}\n`;
  }
  if (law.criteria.selfSettledTrusts) {
    text += `Self-Settled Trusts (DAPT): ${law.criteria.selfSettledTrusts.summary}. ${law.criteria.selfSettledTrusts.details}\n`;
  }
  if (law.criteria.taxTreatment) {
    text += `Tax Treatment: ${law.criteria.taxTreatment.summary}. ${law.criteria.taxTreatment.details}\n`;
  }
  if (law.criteria.healthcareSpecific) {
    text += `Healthcare Planning: ${law.criteria.healthcareSpecific.summary}. ${law.criteria.healthcareSpecific.details}\n`;
  }
  if (law.criteria.privacyProtections) {
    text += `Privacy: ${law.criteria.privacyProtections.summary}. ${law.criteria.privacyProtections.details}\n`;
  }

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
 * Get current points count from Qdrant
 */
async function getCollectionInfo() {
  const response = await fetch(`${QDRANT_URL}/collections/${COLLECTION_NAME}`, {
    headers: { 'api-key': QDRANT_API_KEY }
  });
  return response.json();
}

/**
 * Delete old trust_law points
 */
async function deleteOldTrustLaws() {
  console.log('Deleting old trust law entries...');

  const response = await fetch(`${QDRANT_URL}/collections/${COLLECTION_NAME}/points/delete`, {
    method: 'POST',
    headers: {
      'api-key': QDRANT_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      filter: {
        must: [
          { key: 'type', match: { value: 'trust_law' } }
        ]
      }
    })
  });

  const result = await response.json();
  console.log('Delete result:', result);
}

/**
 * Upload new trust law points
 */
async function uploadTrustLaws(states) {
  console.log(`\nUploading ${states.length} state trust laws...`);

  // Get next available ID
  const info = await getCollectionInfo();
  let nextId = (info.result?.points_count || 0) + 1000; // Start from a high number to avoid conflicts

  const points = [];

  for (let i = 0; i < states.length; i++) {
    const law = states[i];
    const text = stateToText(law);

    console.log(`  [${i + 1}/${states.length}] Embedding ${law.state}...`);

    const vector = await getEmbedding(text);

    points.push({
      id: nextId++,
      vector,
      payload: {
        type: 'trust_law',
        state: law.state,
        stateCode: law.stateCode,
        tier: law.tier,
        overallScore: law.overallScore,
        text
      }
    });

    // Rate limit - wait 100ms between requests
    await new Promise(r => setTimeout(r, 100));
  }

  // Upload in batches of 20
  const batchSize = 20;
  for (let i = 0; i < points.length; i += batchSize) {
    const batch = points.slice(i, i + batchSize);
    console.log(`  Uploading batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(points.length / batchSize)}...`);

    const response = await fetch(`${QDRANT_URL}/collections/${COLLECTION_NAME}/points?wait=true`, {
      method: 'PUT',
      headers: {
        'api-key': QDRANT_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ points: batch })
    });

    if (!response.ok) {
      console.error('Upload error:', await response.text());
    }
  }

  console.log('Upload complete!');
}

/**
 * Main function
 */
async function main() {
  console.log('=== OASARA Trust Law Re-Embedder ===\n');

  // Check credentials
  if (!QDRANT_URL || !QDRANT_API_KEY || !HUGGINGFACE_API_KEY) {
    console.error('Missing required environment variables');
    process.exit(1);
  }

  // Parse state trust laws
  console.log('Parsing state trust laws from TypeScript...');
  const states = parseStateTrustLaws();
  console.log(`Found ${states.length} states\n`);

  // Show sample
  console.log('Sample states:');
  states.slice(0, 3).forEach(s => console.log(`  - ${s.state} (${s.tier}, score: ${s.overallScore})`));
  console.log('  ...');

  // Delete old entries
  await deleteOldTrustLaws();

  // Upload new entries
  await uploadTrustLaws(states);

  // Verify
  const finalInfo = await getCollectionInfo();
  console.log(`\nFinal collection has ${finalInfo.result?.points_count} points`);
}

main().catch(console.error);
