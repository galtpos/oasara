import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tyfuwdmrrctqcgszuajx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5ZnV3ZG1ycmN0cWNnc3p1YWp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjUwNDY4OTgsImV4cCI6MjA0MDYyMjg5OH0.iE7G7-H3Wdy6bPBTzscUn2w8qIxnQ-j0aNO2EfX9rVg';

const supabase = createClient(supabaseUrl, supabaseKey);

const pledgeTypes = ['medical_trust', 'cancel_insurance', 'try_medical_tourism'];

async function addPledges() {
  const timestamp = Date.now();

  for (const pledgeType of pledgeTypes) {
    const pledges = [];
    for (let i = 0; i < 10; i++) {
      pledges.push({
        email: `boost${timestamp}${i}@oasara.com`,
        pledge_type: pledgeType
      });
    }

    const { data, error } = await supabase.from('pledges').insert(pledges);
    if (error) {
      console.error(`Error inserting ${pledgeType}:`, error.message);
    } else {
      console.log(`Added 10 pledges for ${pledgeType}`);
    }
  }

  // Verify counts
  const { data: counts } = await supabase.from('pledges').select('pledge_type');
  const summary = { medical_trust: 0, cancel_insurance: 0, try_medical_tourism: 0 };
  counts?.forEach(p => { if (p.pledge_type in summary) summary[p.pledge_type]++; });
  console.log('\nNew totals:', summary);
}

addPledges();
