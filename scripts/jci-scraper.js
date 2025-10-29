/**
 * JCI Facility Scraper
 * Collects all 661 JCI-accredited facilities from official directory
 *
 * Usage: node scripts/jci-scraper.js
 */

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs').promises;

const JCI_SEARCH_URL = 'https://www.jointcommissioninternational.org/who-is-jci-accredited/';

// Target countries with known JCI facilities
const TARGET_COUNTRIES = [
  // Middle East (~150)
  'United Arab Emirates', 'Saudi Arabia', 'Turkey', 'Israel', 'Jordan', 'Lebanon', 'Qatar', 'Bahrain', 'Oman', 'Kuwait',

  // Asia-Pacific (~200)
  'China', 'India', 'Thailand', 'Singapore', 'South Korea', 'Japan', 'Malaysia', 'Indonesia', 'Philippines', 'Vietnam',
  'Taiwan', 'Hong Kong', 'Pakistan', 'Bangladesh', 'Myanmar', 'Cambodia',

  // Europe (~80)
  'Germany', 'Italy', 'Spain', 'Portugal', 'Czech Republic', 'Poland', 'Hungary', 'Austria', 'Switzerland', 'Greece',
  'Netherlands', 'Belgium', 'France', 'United Kingdom', 'Romania', 'Bulgaria',

  // Americas (~200)
  'Brazil', 'Mexico', 'Colombia', 'Argentina', 'Chile', 'Peru', 'Costa Rica', 'Panama', 'Dominican Republic',
  'United States', 'Canada', 'Ecuador', 'Uruguay', 'Venezuela',

  // Africa (~30)
  'Egypt', 'South Africa', 'Morocco', 'Kenya', 'Tunisia', 'Nigeria', 'Ghana'
];

const FACILITY_TYPES = [
  'Hospital',
  'Academic Medical Center',
  'Ambulatory Care',
  'Clinical Laboratory',
  'Medical Transport Organization',
  'Primary Care Center'
];

class JCIScraper {
  constructor() {
    this.facilities = [];
    this.errors = [];
  }

  async scrapeAllFacilities() {
    console.log('🏥 Starting JCI Facility Scraper...\n');
    console.log(`📍 Target: 661 facilities across ${TARGET_COUNTRIES.length} countries\n`);

    for (const country of TARGET_COUNTRIES) {
      try {
        console.log(`🔍 Scraping ${country}...`);
        const countryFacilities = await this.scrapeFacilitiesByCountry(country);
        this.facilities.push(...countryFacilities);
        console.log(`   ✓ Found ${countryFacilities.length} facilities`);

        // Rate limit: 1 second between requests
        await this.delay(1000);
      } catch (error) {
        console.error(`   ✗ Error scraping ${country}:`, error.message);
        this.errors.push({ country, error: error.message });
      }
    }

    await this.saveFacilities();
    this.printSummary();
  }

  async scrapeFacilitiesByCountry(country) {
    // Note: This is a template - actual scraping depends on JCI website structure
    // You may need to use Puppeteer for JavaScript-heavy sites

    try {
      const response = await axios.get(JCI_SEARCH_URL, {
        params: { country },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
      });

      const $ = cheerio.load(response.data);
      const facilities = [];

      // Parse facility data from HTML
      // (Structure will vary - this is a template)
      $('.facility-item').each((i, elem) => {
        const facility = {
          name: $(elem).find('.facility-name').text().trim(),
          city: $(elem).find('.facility-city').text().trim(),
          country: country,
          type: $(elem).find('.facility-type').text().trim(),
          address: $(elem).find('.facility-address').text().trim(),
          jci_id: $(elem).find('.facility-id').text().trim(),
          accreditation_date: $(elem).find('.accreditation-date').text().trim(),
          source: 'JCI Official Directory',
          scraped_at: new Date().toISOString()
        };

        if (facility.name) {
          facilities.push(facility);
        }
      });

      return facilities;
    } catch (error) {
      // Return empty array on error
      return [];
    }
  }

  async saveFacilities() {
    const outputPath = './data/jci-facilities-raw.json';
    await fs.mkdir('./data', { recursive: true });
    await fs.writeFile(
      outputPath,
      JSON.stringify(this.facilities, null, 2)
    );
    console.log(`\n💾 Saved ${this.facilities.length} facilities to ${outputPath}`);
  }

  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 SCRAPING SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Facilities Found: ${this.facilities.length}`);
    console.log(`Target: 661 facilities`);
    console.log(`Coverage: ${((this.facilities.length / 661) * 100).toFixed(1)}%`);
    console.log(`Errors: ${this.errors.length}`);

    // Group by country
    const byCountry = this.groupBy(this.facilities, 'country');
    console.log(`\nCountries with data: ${Object.keys(byCountry).length}`);

    // Top countries
    const sorted = Object.entries(byCountry)
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 10);

    console.log('\n🏆 Top 10 Countries:');
    sorted.forEach(([country, facilities]) => {
      console.log(`   ${country}: ${facilities.length} facilities`);
    });

    console.log('\n✓ Next step: Run enrichment script to add Google Places data');
    console.log('  node scripts/enrich-facilities.js\n');
  }

  groupBy(array, key) {
    return array.reduce((result, item) => {
      (result[item[key]] = result[item[key]] || []).push(item);
      return result;
    }, {});
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Run scraper
if (require.main === module) {
  const scraper = new JCIScraper();
  scraper.scrapeAllFacilities().catch(console.error);
}

module.exports = JCIScraper;
