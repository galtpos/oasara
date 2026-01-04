"""
AI-powered story extraction using Claude
Extracts structured data from raw scraped content
Includes relevance filtering to exclude non-healthcare content
"""
import os
import json
import re
from typing import Dict, Any, Optional, List
from anthropic import Anthropic
from dotenv import load_dotenv

load_dotenv()

client = Anthropic(api_key=os.getenv('ANTHROPIC_API_KEY'))

# Relevance classification prompt - runs BEFORE extraction
# Covers ALL Oasara story categories
RELEVANCE_PROMPT = """Classify whether this content is relevant to HEALTHCARE SOVEREIGNTY.

RELEVANT CATEGORIES (accept these):

1. MEDICAL BILLS & COSTS
   - Hospital bills, ER bills, surgery costs
   - Itemized bills, surprise billing, price gouging
   - Out-of-pocket costs, deductibles, copays
   - Ambulance bills, lab costs, radiology fees

2. HEALTH INSURANCE PROBLEMS
   - Claim denials, coverage disputes
   - Prior authorization nightmares
   - Insurance company horror stories
   - Losing coverage, uninsured experiences
   - ACA/Obamacare issues, marketplace problems

3. MEDICAL DEBT & BANKRUPTCY
   - Medical collections, credit damage
   - Healthcare-related bankruptcy
   - Payment plans, hospital debt

4. MEDICAL TOURISM & TREATMENT ABROAD
   - Surgery in Mexico, Thailand, Costa Rica, etc.
   - Dental work abroad, dental tourism
   - Cosmetic surgery abroad
   - Cost comparisons US vs. abroad
   - Medical tourism success stories

5. PRESCRIPTION DRUGS
   - Drug prices, insulin costs
   - Pharmacy costs, medication affordability
   - Importing medications, Canadian pharmacies

6. DENTAL & VISION CARE
   - Dental bills, dental insurance issues
   - Vision care costs, LASIK, glasses

7. MENTAL HEALTH COSTS
   - Therapy costs, psychiatry bills
   - Mental health coverage issues

8. SYSTEMIC HEALTHCARE ISSUES
   - US healthcare system criticism
   - Healthcare reform discussions
   - Comparisons to other countries' systems
   - Hospital pricing transparency

NOT RELEVANT (reject these):
- Auto insurance (car insurance, collision)
- Home/property insurance
- Pet insurance, veterinary bills
- Life insurance
- Travel insurance (unless medical coverage specifically)
- Car accidents (unless discussing MEDICAL bills from accident)
- Property damage claims
- General financial advice unrelated to healthcare
- Cryptocurrency, investing, stocks

Content:
---
{content}
---

Respond with ONLY one word: RELEVANT, NOT_RELEVANT, or UNCERTAIN"""

EXTRACTION_PROMPT = """You are an expert at extracting healthcare cost and experience data from social media posts and articles.

Given the following content, extract structured story data. Be thorough but only include information that is actually present or can be reasonably inferred.

Content Source: {source}
Content:
---
{content}
---

Extract the following fields (use null for missing data):

1. title: A compelling, shareable title for this story (max 100 chars)
2. summary: 2-3 sentence summary of the key points
3. content: The full story, cleaned up and formatted for readability
4. story_type: One of: "horror" (bad US healthcare experience), "success" (positive medical tourism), "comparison" (cost comparison), "tip" (advice/guidance)
5. procedure: The medical procedure if mentioned (e.g., "knee replacement", "dental implants")
6. cost_us: US cost in dollars (number only, no symbols)
7. cost_abroad: Foreign cost in dollars if mentioned (number only)
8. country_abroad: Country where treatment was received abroad
9. facility_abroad: Name of foreign facility if mentioned
10. insurance_involved: true/false - was insurance involved
11. insurance_denied: true/false - was a claim denied
12. savings_amount: Calculated savings if both costs are present
13. emotional_tags: Array of relevant emotions: ["anger", "relief", "shock", "gratitude", "frustration", "hope"]
14. issues: Array of issues: ["denied_coverage", "surprise_bill", "price_gouging", "medical_debt", "bankruptcy", "quality_care", "wait_times"]
15. viral_score: 1-10 rating of how shareable/impactful this story is
16. key_quote: The most powerful/shareable quote from the story (verbatim if possible)

Respond with ONLY valid JSON, no markdown formatting."""

def check_relevance(content: str) -> str:
    """
    Check if content is relevant to healthcare sovereignty before full extraction.
    Returns: 'RELEVANT', 'NOT_RELEVANT', or 'UNCERTAIN'
    """
    try:
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=50,
            messages=[
                {
                    "role": "user",
                    "content": RELEVANCE_PROMPT.format(content=content[:3000])
                }
            ]
        )
        
        result = response.content[0].text.strip().upper()
        
        # Normalize response
        if 'NOT_RELEVANT' in result or 'NOT RELEVANT' in result or 'NOTRELEVANT' in result:
            return 'NOT_RELEVANT'
        elif 'RELEVANT' in result or 'YES' in result:
            return 'RELEVANT'
        else:
            return 'UNCERTAIN'
            
    except Exception as e:
        print(f"Relevance check error: {e}")
        return 'UNCERTAIN'


def extract_story_data(
    content: str,
    source: str,
    source_url: Optional[str] = None,
    attached_images: Optional[List[str]] = None,
    skip_relevance_check: bool = False
) -> Dict[str, Any]:
    """
    Extract structured story data from raw content
    
    Args:
        content: Raw text content from scraping
        source: Source platform (reddit, twitter, youtube, etc.)
        source_url: Original URL
        attached_images: List of image URLs if any
        skip_relevance_check: Skip the relevance filter (for pre-validated content)
        
    Returns:
        Structured story data ready for database insertion
    """
    # First, check if content is relevant to healthcare sovereignty
    if not skip_relevance_check:
        relevance = check_relevance(content)
        if relevance == 'NOT_RELEVANT':
            return {
                'error': 'Content not relevant to healthcare sovereignty',
                'relevance': relevance,
                'source': source,
                'source_url': source_url,
                'rejected': True
            }
        elif relevance == 'UNCERTAIN':
            print(f"  ⚠️ Uncertain relevance, proceeding with extraction...")
    
    try:
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=2000,
            messages=[
                {
                    "role": "user",
                    "content": EXTRACTION_PROMPT.format(source=source, content=content[:10000])
                }
            ]
        )
        
        # Parse JSON response
        response_text = response.content[0].text
        
        # Clean up potential markdown formatting
        if response_text.startswith('```'):
            response_text = re.sub(r'^```json?\n?', '', response_text)
            response_text = re.sub(r'\n?```$', '', response_text)
        
        extracted = json.loads(response_text)
        
        # Add metadata
        extracted['source'] = source
        extracted['source_url'] = source_url
        extracted['images'] = attached_images or []
        extracted['status'] = 'pending'  # Needs review before publishing
        extracted['scraped_at'] = True  # Flag to identify scraped vs user-submitted
        
        return extracted
        
    except json.JSONDecodeError as e:
        print(f"JSON parse error: {e}")
        return {
            'error': 'Failed to parse AI response',
            'raw_content': content[:500],
            'source': source,
            'source_url': source_url
        }
    except Exception as e:
        print(f"Extraction error: {e}")
        return {
            'error': str(e),
            'source': source,
            'source_url': source_url
        }


def batch_extract(items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Extract data from multiple items
    Includes rate limiting and error handling
    """
    import time
    results = []
    
    for i, item in enumerate(items):
        print(f"Extracting {i+1}/{len(items)}: {item.get('source_url', 'unknown')[:50]}...")
        
        result = extract_story_data(
            content=item['content'],
            source=item['source'],
            source_url=item.get('source_url'),
            attached_images=item.get('images', [])
        )
        results.append(result)
        
        # Rate limiting: ~20 requests per minute
        if i < len(items) - 1:
            time.sleep(3)
    
    return results


def calculate_viral_potential(story: Dict[str, Any]) -> int:
    """
    Calculate viral potential score based on story characteristics
    Used for prioritizing which stories to feature
    """
    score = 5  # Base score
    
    # Cost factors
    if story.get('cost_us') and story['cost_us'] > 50000:
        score += 2
    if story.get('savings_amount') and story['savings_amount'] > 20000:
        score += 2
    
    # Emotional impact
    emotional_tags = story.get('emotional_tags', [])
    if 'shock' in emotional_tags:
        score += 1
    if 'anger' in emotional_tags:
        score += 1
    
    # Issues
    issues = story.get('issues', [])
    if 'bankruptcy' in issues:
        score += 2
    if 'denied_coverage' in issues:
        score += 1
    if 'surprise_bill' in issues:
        score += 1
    
    # Has compelling quote
    if story.get('key_quote') and len(story['key_quote']) > 50:
        score += 1
    
    # Has visual proof
    if story.get('images') and len(story['images']) > 0:
        score += 1
    
    return min(score, 10)

