import { useEcosystemAuth } from './useEcosystemAuth';

const config = {
  supabaseUrl: (typeof import.meta !== 'undefined' ? (import.meta as any).env?.VITE_SUPABASE_URL : undefined)
    || process.env.REACT_APP_SUPABASE_URL
    || 'https://uefznzzkrzqxgxxwslox.supabase.co',
  supabaseAnonKey: (typeof import.meta !== 'undefined' ? (import.meta as any).env?.VITE_SUPABASE_ANON_KEY : undefined)
    || process.env.REACT_APP_SUPABASE_ANON_KEY
    || '',
  siteKey: 'oasara',
  siteName: 'OASARA',
  redirectUrl: `${typeof window !== 'undefined' ? window.location.origin : 'https://oasara.com'}/auth/confirm`,
};

export function useOasaraAuth() {
  return useEcosystemAuth(config);
}
