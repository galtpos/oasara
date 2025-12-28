// OwnNothing Supabase Client
// Connects to OwnNothing.org's hospital transparency database
// This is a separate Supabase project from Oasara's main database

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// OwnNothing Supabase credentials (public/anon key - safe to expose)
const OWNNOTHING_SUPABASE_URL = 'https://reagtnmcjvulxminomok.supabase.co';
const OWNNOTHING_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJlYWd0bm1janZ1bHhtaW5vbW9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzNzQ0MzYsImV4cCI6MjA3MDk1MDQzNn0.DAG1BDQKPd1RWEvcfmQBjqeTh2pFEqCY0mv_rpCjJ80';

// Singleton pattern
let ownNothingInstance: SupabaseClient | null = null;

function getOwnNothingClient(): SupabaseClient {
  if (ownNothingInstance) {
    return ownNothingInstance;
  }

  ownNothingInstance = createClient(OWNNOTHING_SUPABASE_URL, OWNNOTHING_SUPABASE_ANON_KEY, {
    auth: {
      persistSession: false, // Don't persist auth - this is read-only access
      autoRefreshToken: false,
    }
  });

  return ownNothingInstance;
}

export const ownNothingSupabase = getOwnNothingClient();
