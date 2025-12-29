#!/usr/bin/env node

// Quick script to create a test user
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://whklrclzrtijneqdjmiy.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.argv[2];

if (!supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_SERVICE_KEY');
  console.log('\nUsage: node create-test-user.js <SERVICE_KEY>');
  console.log('Or set SUPABASE_SERVICE_KEY environment variable');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createTestUser() {
  const testEmail = 'test@oasara.com';
  const testPassword = 'OasaraTest2025!';

  console.log('\n🔨 Creating test user...');
  console.log('📧 Email:', testEmail);
  console.log('🔐 Password:', testPassword);

  try {
    const { data, error } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true // Skip email confirmation
    });

    if (error) {
      if (error.message.includes('already registered')) {
        console.log('\n✅ User already exists!');
        console.log('\n📋 LOGIN CREDENTIALS:');
        console.log('   Email:', testEmail);
        console.log('   Password:', testPassword);
        console.log('\n🌐 Login at: http://localhost:3000/login');
        return;
      }
      throw error;
    }

    console.log('\n✅ Test user created successfully!');
    console.log('\n📋 LOGIN CREDENTIALS:');
    console.log('   Email:', testEmail);
    console.log('   Password:', testPassword);
    console.log('\n🌐 Login at: http://localhost:3000/login');
    console.log('\n💡 Use "Sign in with password instead" option');

  } catch (err) {
    console.error('\n❌ Error:', err.message);
    process.exit(1);
  }
}

createTestUser();
