#!/usr/bin/env python3
"""
Scrape contact emails from facility websites and update Supabase.
"""

import re
import time
import requests
from bs4 import BeautifulSoup
from supabase import create_client
from urllib.parse import urljoin, urlparse

# Supabase config
SUPABASE_URL = "https://whklrclzrtijneqdjmiy.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indoa2xyY2x6cnRpam5lcWRqbWl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NjQyOTgsImV4cCI6MjA3NzM0MDI5OH0.WK4MHCmRWOchU4AKwnlvY1pkB62DkFoR5i9izMem_lA"

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Email regex pattern
EMAIL_PATTERN = re.compile(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}')

# Common contact page paths
CONTACT_PATHS = [
    '/contact', '/contact-us', '/contacto', '/kontakt',
    '/about/contact', '/about-us/contact', '/get-in-touch',
    '/reach-us', '/enquiry', '/inquiry', '/book-appointment'
]

# Headers to avoid being blocked
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
}

def extract_emails_from_html(html: str) -> set:
    """Extract all email addresses from HTML content."""
    emails = set()

    # Find mailto: links
    soup = BeautifulSoup(html, 'html.parser')
    for link in soup.find_all('a', href=True):
        href = link['href']
        if href.startswith('mailto:'):
            email = href.replace('mailto:', '').split('?')[0].strip()
            if EMAIL_PATTERN.match(email):
                emails.add(email.lower())

    # Find emails in text content
    text = soup.get_text()
    found = EMAIL_PATTERN.findall(text)
    for email in found:
        # Filter out common false positives
        if not any(x in email.lower() for x in ['example.com', 'domain.com', 'email.com', '.png', '.jpg', '.gif', 'wixpress']):
            emails.add(email.lower())

    return emails

def fetch_page(url: str, timeout: int = 10) -> str | None:
    """Fetch a page with error handling."""
    try:
        response = requests.get(url, headers=HEADERS, timeout=timeout, allow_redirects=True)
        if response.status_code == 200:
            return response.text
    except Exception as e:
        print(f"    Error fetching {url}: {e}")
    return None

def scrape_facility_emails(website_url: str) -> list:
    """Scrape contact emails from a facility website."""
    emails = set()

    # Normalize URL
    if not website_url.startswith(('http://', 'https://')):
        website_url = 'https://' + website_url

    parsed = urlparse(website_url)
    base_url = f"{parsed.scheme}://{parsed.netloc}"

    # First, try the main page
    print(f"    Fetching main page: {website_url}")
    html = fetch_page(website_url)
    if html:
        emails.update(extract_emails_from_html(html))

    # If no emails found, try contact pages
    if not emails:
        for path in CONTACT_PATHS:
            contact_url = urljoin(base_url, path)
            print(f"    Trying: {contact_url}")
            html = fetch_page(contact_url)
            if html:
                emails.update(extract_emails_from_html(html))
                if emails:
                    break
            time.sleep(0.5)  # Rate limiting

    # Filter out generic/noreply emails, prefer info/contact emails
    priority_emails = []
    other_emails = []

    for email in emails:
        if any(x in email for x in ['noreply', 'no-reply', 'donotreply', 'mailer-daemon']):
            continue
        if any(x in email for x in ['info@', 'contact@', 'hello@', 'enquir', 'inquiry', 'booking', 'appointment']):
            priority_emails.append(email)
        else:
            other_emails.append(email)

    return priority_emails + other_emails

def main():
    print("Fetching facilities from Supabase...")

    # Get facilities with website but no contact email
    result = supabase.table('facilities').select('id, name, website, contact_email').execute()
    facilities = result.data

    print(f"Found {len(facilities)} total facilities")

    # Filter to those with websites but no contact email
    to_scrape = [f for f in facilities if f.get('website') and not f.get('contact_email')]
    print(f"Need to scrape {len(to_scrape)} facilities")

    updated = 0
    failed = 0

    for i, facility in enumerate(to_scrape):
        print(f"\n[{i+1}/{len(to_scrape)}] {facility['name']}")
        print(f"    Website: {facility['website']}")

        emails = scrape_facility_emails(facility['website'])

        if emails:
            email = emails[0]  # Take the best one
            print(f"    Found email: {email}")

            # Update Supabase
            try:
                supabase.table('facilities').update({
                    'contact_email': email
                }).eq('id', facility['id']).execute()
                print(f"    Updated in database!")
                updated += 1
            except Exception as e:
                print(f"    Failed to update: {e}")
                failed += 1
        else:
            print(f"    No email found")
            failed += 1

        time.sleep(1)  # Rate limiting between facilities

    print(f"\n{'='*50}")
    print(f"Done! Updated: {updated}, Failed: {failed}")

if __name__ == '__main__':
    main()
