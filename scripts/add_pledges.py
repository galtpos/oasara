#!/usr/bin/env python3
import requests
import time

SUPABASE_URL = "https://whklrclzrtijneqdjmiy.supabase.co"
ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indoa2xyY2x6cnRpam5lcWRqbWl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NjQyOTgsImV4cCI6MjA3NzM0MDI5OH0.WK4MHCmRWOchU4AKwnlvY1pkB62DkFoR5i9izMem_lA"

headers = {
    "apikey": ANON_KEY,
    "Authorization": f"Bearer {ANON_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal"
}

# Get current counts
r = requests.get(f"{SUPABASE_URL}/rest/v1/pledges?select=pledge_type", headers=headers)
if r.ok:
    data = r.json()
    counts = {t: sum(1 for p in data if p.get('pledge_type') == t) for t in ['medical_trust', 'cancel_insurance', 'try_medical_tourism']}
    print(f"Current counts: {counts}")
else:
    print(f"Error fetching: {r.status_code} - {r.text}")

# Add 10 pledges for each type
timestamp = int(time.time())
pledge_types = ['medical_trust', 'cancel_insurance', 'try_medical_tourism']

for ptype in pledge_types:
    pledges = [{"email": f"boost{timestamp}{i}@oasara.com", "pledge_type": ptype} for i in range(10)]
    r = requests.post(f"{SUPABASE_URL}/rest/v1/pledges", headers=headers, json=pledges)
    if r.ok:
        print(f"Added 10 pledges for {ptype}")
    else:
        print(f"Error adding {ptype}: {r.status_code} - {r.text}")

# Get new counts
r = requests.get(f"{SUPABASE_URL}/rest/v1/pledges?select=pledge_type", headers=headers)
if r.ok:
    data = r.json()
    counts = {t: sum(1 for p in data if p.get('pledge_type') == t) for t in ['medical_trust', 'cancel_insurance', 'try_medical_tourism']}
    print(f"New counts: {counts}")
