import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { MusicProvider, MusicBar, MusicPage, initMusicSupabase, brandConfigs } from '../components/MusicPlayer';
const brand = brandConfigs.oasara;
const ANON_KEY = (typeof import.meta !== 'undefined' ? (import.meta as any).env?.VITE_SUPABASE_ANON_KEY : undefined) || process.env.REACT_APP_SUPABASE_ANON_KEY || '';
export default function MusicRoute() {
  const [catalog, setCatalog] = useState<any>(null);
  useEffect(() => {
    if (ANON_KEY) initMusicSupabase(createClient, ANON_KEY);
    fetch('/catalog.json').then(r => r.json()).then(setCatalog);
  }, []);
  if (!catalog) return (<div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: brand.backgroundColor }}><div style={{ color: brand.textColor }}>Loading music...</div></div>);
  return (<MusicProvider brandConfig={brand} catalog={catalog}><MusicPage /><MusicBar /></MusicProvider>);
}
