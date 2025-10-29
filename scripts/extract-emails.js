/**
 * Email Extraction Script
 * Scrapes facility websites to find contact emails
 * for international patient departments
 */

const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
const cheerio = require('cheerio');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Email regex
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

// Priority keywords for international patient emails
const PRIORITY_KEYWORDS = [
  'international',
  'info',
  'contact',
  'inquiry',
  'patient',
  'admissions',
  'enquiry',
  'enquiries',
  'global',
  'overseas'
];

function scoreEmail(email) {
  const lowerEmail = email.toLowerCase();
  let score = 0;

  // Check for priority keywords
  for (const keyword of PRIORITY_KEYWORDS) {
    if (lowerEmail.includes(keyword)) {
      score += 10;
      if (keyword === 'international') score += 5; // Extra weight
    }
  }

  // Penalize generic emails
  if (lowerEmail.includes('noreply')) score -= 20;
  if (lowerEmail.includes('webmaster')) score -= 10;
  if (lowerEmail.includes('admin')) score -= 5;

  // Prefer specific domains over generic
  if (lowerEmail.includes('.org') || lowerEmail.includes('.edu')) score += 3;

  return score;
}

function extractEmailsFromHTML(html) {
  const emails = html.match(EMAIL_REGEX) || [];

  // Deduplicate and score emails
  const uniqueEmails = [...new Set(emails)];
  const scoredEmails = uniqueEmails
    .map(email => ({
      email: email.toLowerCase(),
      score: scoreEmail(email)
    }))
    .filter(item => item.score >= 0) // Filter out penalized emails
    .sort((a, b) => b.score - a.score); // Sort by score descending

  return scoredEmails;
}

function extractContactPages($, baseUrl) {
  const contactPages = [];
  const contactPatterns = [
    /contact/i,
    /inquiry/i,
    /enquiry/i,
    /international/i,
    /patient.*services/i,
    /about.*us/i
  ];

  $('a[href]').each((i, elem) => {
    const href = $(elem).attr('href');
    const text = $(elem).text().toLowerCase();

    for (const pattern of contactPatterns) {
      if (pattern.test(text) || pattern.test(href)) {
        try {
          const fullUrl = new URL(href, baseUrl).href;
          if (fullUrl.startsWith(baseUrl)) {
            contactPages.push(fullUrl);
            break;
          }
        } catch (e) {
          // Invalid URL, skip
        }
      }
    }
  });

  return [...new Set(contactPages)].slice(0, 5); // Limit to 5 pages
}

async function extractContactInfo(website) {
  try {
    // Fetch main page
    const response = await axios.get(website, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // Extract emails from main page
    let allEmails = extractEmailsFromHTML(html);

    // Find and check contact pages
    const contactPages = extractContactPages($, website);

    for (const page of contactPages) {
      try {
        await delay(500); // Rate limit
        const pageResponse = await axios.get(page, {
          timeout: 10000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
          }
        });

        const pageEmails = extractEmailsFromHTML(pageResponse.data);
        allEmails = allEmails.concat(pageEmails);
      } catch (error) {
        // Skip failed pages
        console.log(`  ⚠️  Could not fetch ${page}: ${error.message}`);
      }
    }

    // Deduplicate and resort
    const emailMap = new Map();
    allEmails.forEach(item => {
      if (!emailMap.has(item.email) || emailMap.get(item.email) < item.score) {
        emailMap.set(item.email, item.score);
      }
    });

    const finalEmails = Array.from(emailMap.entries())
      .map(([email, score]) => ({ email, score }))
      .sort((a, b) => b.score - a.score);

    return {
      emails: finalEmails.slice(0, 3).map(item => item.email),
      contactPages: contactPages
    };
  } catch (error) {
    console.log(`  ⚠️  Failed to extract from ${website}: ${error.message}`);
    return { emails: [], contactPages: [] };
  }
}

async function extractAllEmails() {
  console.log('📧 Starting Email Extraction...\n');

  // Get all facilities with websites but no email
  const { data: facilities, error } = await supabase
    .from('facilities')
    .select('*')
    .not('website', 'is', null)
    .is('contact_email_primary', null)
    .order('country', { ascending: true });

  if (error) {
    console.error('Error fetching facilities:', error);
    return;
  }

  console.log(`📊 Found ${facilities.length} facilities with websites needing email extraction\n`);

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < facilities.length; i++) {
    const facility = facilities[i];

    console.log(`🔍 [${i + 1}/${facilities.length}] Extracting emails from ${facility.name}...`);
    console.log(`   🌐 ${facility.website}`);

    const { emails, contactPages } = await extractContactInfo(facility.website);

    if (emails.length > 0) {
      // Update facility with primary email
      const { error: updateError } = await supabase
        .from('facilities')
        .update({
          contact_email_primary: emails[0],
          // Store additional emails in contact_email field as JSON if needed
        })
        .eq('id', facility.id);

      if (!updateError) {
        successCount++;
        console.log(`✅ Found ${emails.length} email(s):`);
        emails.forEach(email => console.log(`   📧 ${email}`));
      } else {
        failCount++;
        console.error(`❌ Failed to update ${facility.name}:`, updateError.message);
      }
    } else {
      failCount++;
      console.log(`⚠️  No emails found`);
    }

    // Rate limiting - be respectful to websites
    await delay(2000); // 2 seconds between requests
  }

  console.log('\n' + '='.repeat(70));
  console.log('📧 EMAIL EXTRACTION COMPLETE');
  console.log('='.repeat(70));
  console.log(`✅ Successfully extracted emails: ${successCount} facilities`);
  console.log(`❌ Failed/No emails: ${failCount} facilities`);
  console.log('\n💡 Next: Review extracted emails and begin outreach campaign!');
}

// Check if cheerio is installed
try {
  require.resolve('cheerio');
  extractAllEmails().catch(console.error);
} catch (e) {
  console.log('📦 Installing cheerio package...');
  console.log('Run: npm install cheerio');
  console.log('Then run this script again.');
}
