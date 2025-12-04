/**
 * OASARA Data Embedder for Qdrant
 *
 * This script:
 * 1. Fetches all facilities from Supabase
 * 2. Loads trust law data
 * 3. Loads online legal services data
 * 4. Creates embeddings using HuggingFace
 * 5. Uploads to Qdrant Cloud collection 'oasara_medical'
 *
 * Requirements:
 * - QDRANT_URL (e.g., https://xxx.qdrant.io)
 * - QDRANT_API_KEY
 * - HUGGINGFACE_API_KEY
 * - SUPABASE_URL
 * - SUPABASE_SERVICE_KEY
 *
 * Usage:
 *   node scripts/embedOasaraData.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const { HfInference } = require('@huggingface/inference');

// Configuration
const QDRANT_URL = process.env.QDRANT_URL || 'https://your-cluster.qdrant.io';
const QDRANT_API_KEY = process.env.QDRANT_API_KEY;
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;

const COLLECTION_NAME = 'oasara_medical';
const EMBEDDING_MODEL = 'sentence-transformers/all-MiniLM-L6-v2';
const VECTOR_SIZE = 384;

// Initialize Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Trust Law Data (inline for now - matches src/data/stateTrustLaws.ts)
const stateTrustLaws = [
  {
    state: 'South Dakota',
    stateCode: 'SD',
    overallScore: 9.5,
    tier: 'top',
    highlights: [
      'No state income tax on trust income',
      'No rule against perpetuities (dynasty trusts)',
      'Strongest DAPT protections in the nation',
      '2-year statute of limitations for creditors'
    ],
    assetProtection: 'Industry-leading asset protection statutes. South Dakota has consistently been ranked #1 for asset protection trusts.',
    selfSettledTrusts: 'Full DAPT authorization since 2005. Permits self-settled spendthrift trusts where the grantor can be a beneficiary.',
    taxTreatment: 'No state income tax, no capital gains tax, and no inheritance tax.',
    healthcareSpecific: 'Supports special needs and healthcare trusts. Recognizes special needs trusts that preserve Medicaid eligibility.'
  },
  {
    state: 'Nevada',
    stateCode: 'NV',
    overallScore: 9.2,
    tier: 'top',
    highlights: [
      'No state income tax',
      '2-year statute of limitations',
      'Strong DAPT protections',
      '365-year rule against perpetuities'
    ],
    assetProtection: 'Excellent asset protection framework. Nevada\'s Spendthrift Trust Act provides comprehensive asset protection.',
    selfSettledTrusts: 'DAPT authorized since 1999. Nevada was the second state to authorize DAPTs.',
    taxTreatment: 'No state income tax, no franchise tax on trusts, no inheritance tax, and no estate tax.',
    healthcareSpecific: 'Recognizes healthcare trusts and special needs trusts. Medical savings trusts have some tax advantages.'
  },
  {
    state: 'Delaware',
    stateCode: 'DE',
    overallScore: 9.0,
    tier: 'top',
    highlights: [
      'Premier trust jurisdiction with sophisticated laws',
      'Directed trust statutes',
      'No rule against perpetuities',
      'Court of Chancery expertise'
    ],
    assetProtection: 'Premier trust jurisdiction. Court of Chancery provides experienced, expert handling of trust matters.',
    selfSettledTrusts: 'Qualified Dispositions in Trust Act since 1997. Allows self-settled asset protection trusts.',
    taxTreatment: 'No state income tax on out-of-state beneficiaries. Delaware trusts for non-residents avoid state taxation.',
    healthcareSpecific: 'Sophisticated trust structures available for healthcare planning.'
  },
  {
    state: 'Wyoming',
    stateCode: 'WY',
    overallScore: 8.8,
    tier: 'top',
    highlights: [
      'No state income tax',
      'Strong LLC protections complement trusts',
      'DAPT legislation since 2007',
      'Low-cost trust administration'
    ],
    assetProtection: 'Comprehensive asset protection with strong LLC charging order protections.',
    selfSettledTrusts: 'Qualified Spendthrift Trust Act since 2007. Allows self-settled asset protection trusts.',
    taxTreatment: 'No state income tax, no franchise tax, no inheritance tax.',
    healthcareSpecific: 'Flexible trust laws support healthcare and special needs planning.'
  },
  {
    state: 'Alaska',
    stateCode: 'AK',
    overallScore: 8.5,
    tier: 'top',
    highlights: [
      'First state to enact DAPT legislation (1997)',
      'No state income tax',
      'Strong spendthrift protections',
      'Community property trust option'
    ],
    assetProtection: 'Pioneer in DAPT legislation. First state to allow self-settled spendthrift trusts.',
    selfSettledTrusts: 'DAPT legislation since 1997. The original model for other states\' DAPT laws.',
    taxTreatment: 'No state income tax. Trust income not taxed at state level.',
    healthcareSpecific: 'Supports healthcare planning through flexible trust structures.'
  }
];

// Online Legal Services Data
const onlineLegalServices = [
  {
    name: 'LegalZoom',
    tagline: 'Most recognized name in online legal services',
    url: 'https://www.legalzoom.com/personal/estate-planning/living-trust-overview.html',
    livingTrustPrice: '$399',
    healthcareDirectivePrice: '$39',
    pricingModel: 'Pay per document',
    features: ['Living Trust with Pour-Over Will', 'Financial Power of Attorney', 'Healthcare Directive', 'HIPAA Authorization', 'Property Transfer Guide', 'Attorney Review Available ($199 extra)'],
    pros: ['Established since 2001 with strong reputation', 'Pay only for what you need', 'Includes testamentary trust option', 'Extensive customer support'],
    cons: ['Higher prices than competitors', 'Attorney access costs extra', 'Less detailed questionnaire'],
    bestFor: 'One-time users who want a trusted brand',
    rating: 4.2
  },
  {
    name: 'Rocket Lawyer',
    tagline: 'Unlimited legal documents with subscription',
    url: 'https://www.rocketlawyer.com/family-and-personal/estate-planning',
    livingTrustPrice: 'Included in $39.99/mo',
    healthcareDirectivePrice: 'Included',
    pricingModel: 'Subscription ($39.99/mo)',
    features: ['Unlimited Legal Documents', 'Living Trust & Will', 'All Power of Attorney Forms', 'Healthcare Directive', 'Attorney Q&A Included', '40% Off Attorney Consultations', 'Digital Signatures'],
    pros: ['Best value for multiple documents', 'Attorney access included', 'BBB A+ Rating', 'Pet guardian provisions', '$1 first week trial'],
    cons: ['Ongoing subscription required', 'No testamentary trust option', 'Must cancel to stop charges'],
    bestFor: 'Users needing multiple documents or ongoing legal needs',
    rating: 4.4
  },
  {
    name: 'Trust & Will',
    tagline: 'Modern estate planning made simple',
    url: 'https://trustandwill.com/learn/living-trust',
    livingTrustPrice: '$499 individual / $599 couples',
    healthcareDirectivePrice: 'Included',
    pricingModel: 'Flat-rate packages',
    features: ['State-Specific Documents', 'Intuitive Modern Interface', 'Living Trust + Will', 'Power of Attorney', 'Healthcare Directive', 'Guardian Nomination', 'Free Unlimited Updates'],
    pros: ['Clean, modern user experience', 'Transparent flat-rate pricing', 'Free document updates for life', 'In-house legal team reviewed'],
    cons: ['Higher price than some competitors', 'No attorney consultation included', 'Limited to estate planning only'],
    bestFor: 'Tech-savvy users wanting a premium experience',
    rating: 4.6
  },
  {
    name: 'Nolo WillMaker',
    tagline: 'Trusted legal publisher since 1971',
    url: 'https://www.willmaker.com/',
    livingTrustPrice: '$149 (software)',
    healthcareDirectivePrice: 'Included',
    pricingModel: 'One-time software purchase',
    features: ['Desktop Software + Online Access', 'Comprehensive Estate Planning', 'Living Trust Creation', 'All 50 States Supported', 'Executor & Beneficiary Guides', 'Pet Care Instructions', 'Educational Resources'],
    pros: ['Best value for complete package', 'Extensive educational content', 'No recurring fees', '50+ years of legal publishing'],
    cons: ['Interface feels dated', 'Software requires installation', 'Less hand-holding than competitors'],
    bestFor: 'DIY users who want comprehensive software',
    rating: 4.3
  },
  {
    name: 'FreeWill',
    tagline: 'Free wills funded by nonprofits',
    url: 'https://www.freewill.com/',
    livingTrustPrice: 'Free (CA only)',
    healthcareDirectivePrice: 'Free',
    pricingModel: 'Free (nonprofit-funded)',
    features: ['Free Last Will & Testament', 'Free Power of Attorney', 'Free Healthcare Directive', 'Living Trust (California Only)', 'Charitable Giving Integration', 'Simple Interface'],
    pros: ['Completely free to use', 'Simple and straightforward', 'No upsells or hidden fees', 'Great for basic wills'],
    cons: ['Living trusts only in California', 'Encourages charitable giving', 'Limited customization', 'No attorney support'],
    bestFor: 'Users wanting free basic documents',
    rating: 4.0
  }
];

// Medical Tourism How-To Content
const medicalTourismGuides = [
  {
    title: 'How to Plan a Medical Tourism Trip',
    content: `Planning a medical tourism trip requires careful research and preparation. Start by identifying your medical needs and researching facilities that specialize in your procedure. Look for JCI-accredited hospitals which meet international standards. Research the destination country's healthcare system, visa requirements, and travel logistics. Get multiple quotes and verify credentials of doctors. Plan for recovery time and follow-up care. Consider travel insurance that covers medical procedures abroad. Prepare all medical records and communicate clearly with your chosen facility before traveling.`
  },
  {
    title: 'What is JCI Accreditation?',
    content: `JCI (Joint Commission International) accreditation is the gold standard for international healthcare quality. JCI-accredited hospitals meet rigorous safety and quality standards comparable to top US hospitals. The accreditation covers patient care quality, medication safety, infection control, and facility management. When choosing a medical tourism destination, prioritizing JCI-accredited facilities significantly reduces risk. OASARA features 518 JCI-accredited facilities across 39 countries, all vetted for quality and safety.`
  },
  {
    title: 'Medical Tourism Cost Savings',
    content: `Medical tourism can offer savings of 40-90% compared to US healthcare costs. Common procedures and typical savings: Hip replacement ($35,000+ in US, $12,000 in Thailand), Dental implants ($5,000+ per tooth in US, $1,500 in Mexico), Heart bypass surgery ($150,000+ in US, $25,000 in India), Cosmetic surgery (60-80% savings in Colombia or Brazil). Savings come from lower labor costs, streamlined operations, and government healthcare subsidies in destination countries. Quality at JCI-accredited facilities is comparable to US standards.`
  },
  {
    title: 'Medical Trusts for Healthcare Planning',
    content: `A medical trust is a legal structure that sets aside funds specifically for healthcare expenses. Benefits include asset protection from creditors, tax advantages in certain states, and ensuring funds are available for future medical needs. States like South Dakota, Nevada, and Delaware offer the strongest trust protections. A properly structured medical trust can fund international healthcare while protecting assets. Consider working with an attorney experienced in healthcare trusts and international transactions.`
  },
  {
    title: 'Privacy in Medical Tourism',
    content: `Medical tourism offers enhanced privacy compared to domestic healthcare. OASARA emphasizes privacy-preserving approaches: No insurance company involvement means no shared medical records. International HIPAA-equivalent protections vary by country. Zano blockchain enables private payment without financial surveillance. Choose facilities that respect patient confidentiality. Consider medical trusts in privacy-friendly states like South Dakota or Nevada for additional protection.`
  }
];

/**
 * Get embeddings from HuggingFace Inference API using SDK
 */
async function getEmbeddings(texts) {
  const hf = new HfInference(HUGGINGFACE_API_KEY);
  const embeddings = [];

  for (const text of texts) {
    const result = await hf.featureExtraction({
      model: EMBEDDING_MODEL,
      inputs: text,
    });

    // Handle different response formats
    if (Array.isArray(result) && typeof result[0] === 'number') {
      embeddings.push(result);
    } else if (Array.isArray(result) && Array.isArray(result[0])) {
      embeddings.push(result[0]);
    } else {
      throw new Error('Unexpected embedding format from HuggingFace');
    }
  }

  return embeddings;
}

/**
 * Create Qdrant collection
 */
async function createCollection() {
  console.log(`Creating Qdrant collection: ${COLLECTION_NAME}`);

  // Delete existing collection if it exists
  try {
    await fetch(`${QDRANT_URL}/collections/${COLLECTION_NAME}`, {
      method: 'DELETE',
      headers: { 'api-key': QDRANT_API_KEY }
    });
    console.log('Deleted existing collection');
  } catch (e) {
    // Collection might not exist, that's fine
  }

  // Create new collection
  const response = await fetch(`${QDRANT_URL}/collections/${COLLECTION_NAME}`, {
    method: 'PUT',
    headers: {
      'api-key': QDRANT_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      vectors: {
        size: VECTOR_SIZE,
        distance: 'Cosine'
      }
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create collection: ${error}`);
  }

  console.log('Collection created successfully');
}

/**
 * Upload points to Qdrant
 */
async function uploadPoints(points) {
  const BATCH_SIZE = 100;

  for (let i = 0; i < points.length; i += BATCH_SIZE) {
    const batch = points.slice(i, i + BATCH_SIZE);

    const response = await fetch(`${QDRANT_URL}/collections/${COLLECTION_NAME}/points`, {
      method: 'PUT',
      headers: {
        'api-key': QDRANT_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        points: batch
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to upload points: ${error}`);
    }

    console.log(`Uploaded ${Math.min(i + BATCH_SIZE, points.length)}/${points.length} points`);
  }
}

/**
 * Convert facility to searchable text
 */
function facilityToText(facility) {
  const procedures = facility.popular_procedures?.map(p =>
    `${p.name} (${p.price_range}, wait time: ${p.wait_time})`
  ).join('. ') || '';

  return `
Medical Facility: ${facility.name}
Location: ${facility.city}, ${facility.country}
JCI Accredited: ${facility.jci_accredited ? 'Yes' : 'No'}
Specialties: ${facility.specialties?.join(', ') || 'General'}
Languages: ${facility.languages?.join(', ') || 'English'}
Google Rating: ${facility.google_rating}/5 (${facility.review_count} reviews)
Accepts Zano Payment: ${facility.accepts_zano ? 'Yes' : 'No'}
Popular Procedures: ${procedures}
Website: ${facility.website || 'Contact for details'}
Phone: ${facility.phone || 'Contact for details'}
`.trim();
}

/**
 * Convert trust law to searchable text
 */
function trustLawToText(law) {
  return `
State Trust Law: ${law.state} (${law.stateCode})
Overall Score: ${law.overallScore}/10
Tier: ${law.tier}
Key Highlights: ${law.highlights.join('. ')}
Asset Protection: ${law.assetProtection}
Self-Settled Trusts (DAPT): ${law.selfSettledTrusts}
Tax Treatment: ${law.taxTreatment}
Healthcare Planning: ${law.healthcareSpecific}
`.trim();
}

/**
 * Convert legal service to searchable text
 */
function legalServiceToText(service) {
  return `
Online Legal Service: ${service.name}
${service.tagline}
Living Trust Price: ${service.livingTrustPrice}
Healthcare Directive Price: ${service.healthcareDirectivePrice}
Pricing Model: ${service.pricingModel}
Features: ${service.features.join(', ')}
Pros: ${service.pros.join('. ')}
Cons: ${service.cons.join('. ')}
Best For: ${service.bestFor}
Rating: ${service.rating}/5
Website: ${service.url}
`.trim();
}

/**
 * Main embedding function
 */
async function main() {
  console.log('=== OASARA Data Embedder ===\n');

  // Validate environment
  if (!QDRANT_URL || !QDRANT_API_KEY) {
    console.error('Missing QDRANT_URL or QDRANT_API_KEY');
    console.log('\nAdd to .env.local:');
    console.log('QDRANT_URL=https://your-cluster.qdrant.io');
    console.log('QDRANT_API_KEY=your-api-key');
    process.exit(1);
  }

  if (!HUGGINGFACE_API_KEY) {
    console.error('Missing HUGGINGFACE_API_KEY');
    console.log('\nAdd to .env.local:');
    console.log('HUGGINGFACE_API_KEY=your-api-key');
    process.exit(1);
  }

  // 1. Create collection
  await createCollection();

  // 2. Fetch facilities from Supabase
  console.log('\nFetching facilities from Supabase...');
  const { data: facilities, error } = await supabase
    .from('facilities')
    .select('*');

  if (error) {
    console.error('Failed to fetch facilities:', error);
    process.exit(1);
  }
  console.log(`Found ${facilities.length} facilities`);

  // 3. Prepare all documents
  const documents = [];
  let pointId = 1;

  // Facilities
  console.log('\nPreparing facility documents...');
  for (const facility of facilities) {
    documents.push({
      id: pointId++,
      text: facilityToText(facility),
      metadata: {
        type: 'facility',
        id: facility.id,
        name: facility.name,
        country: facility.country,
        city: facility.city,
        specialties: facility.specialties || [],
        rating: facility.google_rating,
        website: facility.website
      }
    });
  }

  // Trust Laws
  console.log('Preparing trust law documents...');
  for (const law of stateTrustLaws) {
    documents.push({
      id: pointId++,
      text: trustLawToText(law),
      metadata: {
        type: 'trust_law',
        state: law.state,
        stateCode: law.stateCode,
        tier: law.tier,
        score: law.overallScore
      }
    });
  }

  // Legal Services
  console.log('Preparing legal service documents...');
  for (const service of onlineLegalServices) {
    documents.push({
      id: pointId++,
      text: legalServiceToText(service),
      metadata: {
        type: 'legal_service',
        name: service.name,
        url: service.url,
        rating: service.rating,
        price: service.livingTrustPrice
      }
    });
  }

  // Medical Tourism Guides
  console.log('Preparing medical tourism guide documents...');
  for (const guide of medicalTourismGuides) {
    documents.push({
      id: pointId++,
      text: `${guide.title}\n\n${guide.content}`,
      metadata: {
        type: 'guide',
        title: guide.title
      }
    });
  }

  console.log(`\nTotal documents to embed: ${documents.length}`);

  // 4. Generate embeddings in batches
  console.log('\nGenerating embeddings (this may take a minute)...');
  const EMBED_BATCH_SIZE = 32;
  const points = [];

  for (let i = 0; i < documents.length; i += EMBED_BATCH_SIZE) {
    const batch = documents.slice(i, i + EMBED_BATCH_SIZE);
    const texts = batch.map(d => d.text);

    const embeddings = await getEmbeddings(texts);

    for (let j = 0; j < batch.length; j++) {
      points.push({
        id: batch[j].id,
        vector: embeddings[j],
        payload: {
          text: batch[j].text,
          ...batch[j].metadata
        }
      });
    }

    console.log(`Embedded ${Math.min(i + EMBED_BATCH_SIZE, documents.length)}/${documents.length} documents`);

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // 5. Upload to Qdrant
  console.log('\nUploading to Qdrant...');
  await uploadPoints(points);

  console.log('\n=== Complete! ===');
  console.log(`Uploaded ${points.length} vectors to collection '${COLLECTION_NAME}'`);
  console.log(`\nBreakdown:`);
  console.log(`  - Facilities: ${facilities.length}`);
  console.log(`  - Trust Laws: ${stateTrustLaws.length}`);
  console.log(`  - Legal Services: ${onlineLegalServices.length}`);
  console.log(`  - Guides: ${medicalTourismGuides.length}`);
}

main().catch(console.error);
