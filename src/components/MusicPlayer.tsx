/**
 * Shared Music Player Component
 * Aaron Day Ecosystem - Works in all 7 Vite+React sites + Next.js
 *
 * Single-file, zero external dependencies beyond React.
 * All styles inline for cross-site portability.
 *
 * Features:
 *   - MusicProvider: context with shuffle, repeat, radio station mode
 *   - MusicBar: persistent bottom bar with glow, animated bars, marquee, seek dot
 *   - MusicPage: track grid with radio card, channel card, hover effects
 *   - MusicVideoChannel: cinematic auto-playing video page with interstitials
 *   - Keyboard shortcuts: space, arrows, M
 *
 * Usage:
 *   <MusicProvider brandConfig={brandConfigs.aarondayshow} catalog={catalogData}>
 *     <App />
 *     <MusicBar />
 *   </MusicProvider>
 *
 *   // On your /music route:
 *   <MusicPage />
 *
 *   // On your /music/channel route:
 *   <MusicVideoChannel />
 */
import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { createPortal } from 'react-dom';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Song {
  id: string;
  title: string;
  artist: string;
  audio_url: string;
  image_url: string | null;
  video_url: string | null;
  youtube_url: string | null;
  rumble_url: string | null;
  duration: string;
  tags: string[];
  suno_url: string | null;
}

export interface BrandConfig {
  siteName: string;
  siteKey: string;
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  headingFont: string;
  bodyFont: string;
  // Visibility Floor (Ecosystem Player Board, ratified 2026-05-03):
  // separator + glow tokens are mandatory — bar must be unmistakably present
  // on every brand. Opaque hex only on separatorBorderColor (no alpha suffix).
  separatorBorderColor: string;   // opaque hex, ≥40% contrast vs surfaceColor
  separatorBorderWidth: string;   // CSS length, default '3px'
  glowIntensity: number;          // 0.0–1.0, ≥0.40 floor
  // Bar-specific surface overrides (Aaron 2026-05-04). Optional; if unset,
  // the persistent bar inherits surfaceColor + textColor. Set these when the
  // page ground and the bar need different registers — e.g. Day2026 has a
  // cream page ground but the bar reads as a dark "Field Notes module patch."
  barSurfaceColor?: string;
  barTextColor?: string;
}

interface Playlist {
  name: string;
  song_ids: string[];
}

interface Catalog {
  songs: Song[];
  playlists: Record<string, Playlist>;
  youtube_playlist: { id: string; name: string };
}

export type PlayMode = 'normal' | 'shuffle' | 'radio';
export type RepeatMode = 'off' | 'all' | 'one';

// ─── Brand Presets ───────────────────────────────────────────────────────────

export const brandConfigs: Record<string, BrandConfig> = {
  aarondayshow: {
    siteName: 'The Aaron Day Show',
    siteKey: 'aarondayshow',
    primaryColor: '#E8B923',
    accentColor: '#FF57B2',
    backgroundColor: '#0A0A0A',
    surfaceColor: '#1A1A2E',
    textColor: '#FFFFFF',
    headingFont: 'Montserrat, sans-serif',
    bodyFont: 'Inter, sans-serif',
    separatorBorderColor: '#E8B923',
    separatorBorderWidth: '3px',
    glowIntensity: 0.50,
  },
  day2026: {
    // Cream-ground brand register — flipped 2026-05-04 by Day2026 Design Board
    // (Burns chair) to match the updated Day2026 brand spec at
    // _standards/DAY2026_BRAND_SYSTEM.md §2 (Cream `#EFE6D2` page ground,
    // Bond Cream `#D9CFB7` elevated surface, Granite `#3E3933` ink, Old Glory
    // Red `#A8352B` CTA + separator). Schema contract preserved (Ecosystem
    // Player Board).
    siteName: 'Day 2026',
    siteKey: 'day2026',
    primaryColor: '#A8352B',      // Old Glory Red — CTA / accent
    accentColor: '#7D7468',       // Mountain — secondary type / dividers / halftone (§2.1)
    backgroundColor: '#EFE6D2',   // Cream — page ground (§2.1)
    surfaceColor: '#E8DFC9',      // Bond Cream lighter — elevated cream-patch surface (avoids §2.5 halftone-fill conflict)
    textColor: '#3E3933',         // Granite type on Cream — AAA 9.6:1 (§2.6)
    headingFont: 'Oswald, sans-serif',
    bodyFont: '"Roboto Slab", Georgia, serif',
    separatorBorderColor: '#A8352B', // Old Glory Red separator (§2.3 8% accent zone)
    separatorBorderWidth: '3px',
    glowIntensity: 0.10,          // soft halo only — cream-ground requires near-flat motion (Bass call)
    // Persistent bar overrides — page stays cream, but the bar reads as a
    // dark "Field Notes module patch" so it's visible against the cream
    // ground (Aaron 2026-05-04: Bond-Cream-on-Cream was hard to see).
    barSurfaceColor: '#3E3933',   // Granite — bar background
    barTextColor:    '#EFE6D2',   // Cream type on Granite bar
  },
  ownnothing: {
    siteName: 'Own Nothing',
    siteKey: 'ownnothing',
    primaryColor: '#8B5CF6',
    accentColor: '#EC4899',
    backgroundColor: '#0F0F1A',
    surfaceColor: '#1A1A2E',
    textColor: '#FFFFFF',
    headingFont: 'Archivo Black, sans-serif',
    bodyFont: 'Work Sans, sans-serif',
    separatorBorderColor: '#8B5CF6',
    separatorBorderWidth: '3px',
    glowIntensity: 0.50,
  },
  technocracyatlas: {
    siteName: 'Technocracy Atlas',
    siteKey: 'technocracyatlas',
    primaryColor: '#00CC6F',
    accentColor: '#00D4FF',
    backgroundColor: '#000000',
    surfaceColor: '#1A1A1A',
    textColor: '#FFFFFF',
    headingFont: 'Bebas Neue, sans-serif',
    bodyFont: 'Share Tech Mono, monospace',
    separatorBorderColor: '#00CC6F',
    separatorBorderWidth: '3px',
    glowIntensity: 0.55,
  },
  freedomforge: {
    siteName: 'Freedom Forge',
    siteKey: 'freedomforge',
    primaryColor: '#FF6B35',
    accentColor: '#004E89',
    backgroundColor: '#0D1117',
    surfaceColor: '#161B22',
    textColor: '#FFFFFF',
    headingFont: 'Poppins, sans-serif',
    bodyFont: 'Inter, sans-serif',
    separatorBorderColor: '#FF6B35',
    separatorBorderWidth: '3px',
    glowIntensity: 0.50,
  },
  daylightfreedom: {
    siteName: 'Daylight Freedom',
    siteKey: 'daylightfreedom',
    primaryColor: '#FFD93D',
    accentColor: '#6BCB77',
    backgroundColor: '#0A0A0A',
    surfaceColor: '#1A1A2E',
    textColor: '#FFFFFF',
    headingFont: 'Playfair Display, serif',
    bodyFont: 'Source Sans Pro, sans-serif',
    separatorBorderColor: '#FFD93D',
    separatorBorderWidth: '3px',
    glowIntensity: 0.55,
  },
  ditchthedollar: {
    siteName: 'Ditch the Dollar',
    siteKey: 'ditchthedollar',
    primaryColor: '#A67C00',
    accentColor: '#F4EFE6',
    backgroundColor: '#0A0A0A',
    surfaceColor: '#1F1A14',
    textColor: '#F4EFE6',
    headingFont: 'Playfair Display, serif',
    bodyFont: 'Inter, sans-serif',
    separatorBorderColor: '#A67C00',
    separatorBorderWidth: '3px',
    glowIntensity: 0.45,
  },
  oasara: {
    siteName: 'OASARA',
    siteKey: 'oasara',
    primaryColor: '#4ECDC4',
    accentColor: '#45B7D1',
    backgroundColor: '#1A1A2E',
    surfaceColor: '#2D2D44',
    textColor: '#FFFFFF',
    headingFont: 'Nunito, sans-serif',
    bodyFont: 'Open Sans, sans-serif',
    separatorBorderColor: '#4ECDC4',
    separatorBorderWidth: '3px',
    glowIntensity: 0.50,
  },
};

// ─── BrandConfig validation (Fu, ratified 2026-05-03) ───────────────────────
//
// Throws at module init if a brand config is missing any visibility-floor token.
// Catches the silent-fallback class of bugs where a consumer site ships an
// outdated brandConfig and the bar renders broken in prod with no error.

const REQUIRED_VISIBILITY_FIELDS: (keyof BrandConfig)[] = [
  'separatorBorderColor',
  'separatorBorderWidth',
  'glowIntensity',
];

export function validateBrandConfig(brand: BrandConfig): void {
  for (const f of REQUIRED_VISIBILITY_FIELDS) {
    if (brand[f] === undefined || brand[f] === null) {
      throw new Error(
        `[ecosystem-player] BrandConfig "${brand.siteKey ?? '?'}" missing required ` +
        `visibility-floor field: ${String(f)}. Required by Ecosystem Player Board ` +
        `(2026-05-03). See _standards/ECOSYSTEM_PLAYER_PROCESS.md.`
      );
    }
  }
  if (typeof brand.glowIntensity === 'number' && (brand.glowIntensity < 0 || brand.glowIntensity > 1)) {
    throw new Error(
      `[ecosystem-player] BrandConfig "${brand.siteKey}" glowIntensity must be 0.0–1.0 ` +
      `(got ${brand.glowIntensity}).`
    );
  }
}

// Validate every preset at module load — fail loud if a preset is malformed.
for (const cfg of Object.values(brandConfigs)) {
  validateBrandConfig(cfg);
}

// ─── Station Names ──────────────────────────────────────────────────────────

const STATION_NAMES: Record<string, string> = {
  aarondayshow: 'The Aaron Day Show Radio',
  day2026: 'Day 2026 Radio',
  ownnothing: 'Own Nothing Radio',
  technocracyatlas: 'Atlas Radio',
  freedomforge: 'Freedom Forge Radio',
  daylightfreedom: 'Daylight Radio',
  oasara: 'OASARA Radio',
};

// ─── CSS Keyframes (injected once) ──────────────────────────────────────────

let stylesInjected = false;

function injectGlobalStyles() {
  if (stylesInjected || typeof document === 'undefined') return;
  stylesInjected = true;

  const style = document.createElement('style');
  style.textContent = `
    @keyframes admp-bar1 {
      0%, 100% { height: 30%; }
      50% { height: 100%; }
    }
    @keyframes admp-bar2 {
      0%, 100% { height: 60%; }
      50% { height: 20%; }
    }
    @keyframes admp-bar3 {
      0%, 100% { height: 45%; }
      50% { height: 90%; }
    }
    @keyframes admp-glow-pulse {
      0%, 100% { opacity: 0.2; }
      50% { opacity: 0.5; }
    }
    @keyframes admp-marquee {
      0% { transform: translateX(0%); }
      100% { transform: translateX(-100%); }
    }
    @keyframes admp-radio-wave {
      0% { opacity: 1; transform: scale(1); }
      100% { opacity: 0; transform: scale(1.8); }
    }
    @keyframes admp-countdown-ring {
      0% { stroke-dashoffset: 0; }
      100% { stroke-dashoffset: 283; }
    }
    /* Reserve room at the bottom of the page so the fixed MusicBar
       does not overlap content. Page wrappers must NOT lock the body
       height; if they do, override --admp-bar-pad on the wrapper. */
    body { padding-bottom: var(--admp-bar-pad, 96px); }

    /* Photosensitivity / migraine accessibility (Khan, 2026-05-03).
       Kills the glow pulse and bar height transitions for users with
       prefers-reduced-motion. WCAG 2.3 — no exceptions. */
    @media (prefers-reduced-motion: reduce) {
      [data-admp-bar] {
        animation: none !important;
        transition: none !important;
      }
      [data-admp-bar] [data-admp-bars] > * {
        animation: none !important;
      }
    }
  `;
  document.head.appendChild(style);
}

// ─── Context ─────────────────────────────────────────────────────────────────

interface MusicContextValue {
  brand: BrandConfig;
  songs: Song[];
  featuredSongs: Song[];
  allSongs: Song[];
  currentSong: Song | null;
  currentIndex: number;
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  playMode: PlayMode;
  repeatMode: RepeatMode;
  stationName: string;
  play: (song?: Song) => void;
  pause: () => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  seek: (time: number) => void;
  setVolume: (v: number) => void;
  playSongById: (id: string) => void;
  setPlayMode: (mode: PlayMode) => void;
  setRepeatMode: (mode: RepeatMode) => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  startRadio: () => void;
  stopRadio: () => void;
  bufferedFrac: number;        // 0–1, fraction of track buffered ahead
  skipNotice: string | null;   // title of last auto-skipped track (or null)
  dismissSkipNotice: () => void;
  catalog: Catalog;            // exposed for MusicVideoChannel (youtube_playlist)
  // Channel-active flag: when MusicVideoChannel is mounted it sets this true.
  // MusicBar reads it and self-hides so the audio bar doesn't compete with
  // the video's own audio + controls. (Aaron 2026-05-04.)
  channelActive: boolean;
  setChannelActive: (v: boolean) => void;
}

const MusicContext = createContext<MusicContextValue | null>(null);

function useMusicContext(): MusicContextValue {
  const ctx = useContext(MusicContext);
  if (!ctx) throw new Error('useMusicContext must be used within <MusicProvider>');
  return ctx;
}

// ─── Storage helpers ─────────────────────────────────────────────────────────

const STORAGE_KEY = 'aaronday-music-player';

function saveState(songId: string, time: number) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ songId, time, ts: Date.now() }));
  } catch {}
}

function loadState(): { songId: string; time: number } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (Date.now() - data.ts > 86400000) return null;
    return { songId: data.songId, time: data.time };
  } catch {
    return null;
  }
}

// ─── Weighted shuffle for radio ─────────────────────────────────────────────

function weightedShuffle(songs: Song[], featuredIds: Set<string>, lastPlayedId?: string): Song[] {
  // Build weighted pool: featured songs appear 3x
  const pool: Song[] = [];
  for (const song of songs) {
    const weight = featuredIds.has(song.id) ? 3 : 1;
    for (let i = 0; i < weight; i++) pool.push(song);
  }
  // Fisher-Yates on the pool, then deduplicate consecutive
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  // Deduplicate: no same song twice in a row
  const result: Song[] = [];
  const seen = new Set<string>();
  for (const song of pool) {
    if (seen.has(song.id)) continue;
    if (result.length > 0 && result[result.length - 1].id === song.id) continue;
    if (result.length === 0 && song.id === lastPlayedId) continue;
    result.push(song);
    seen.add(song.id);
  }
  return result;
}

// ─── Provider ────────────────────────────────────────────────────────────────

interface MusicProviderProps {
  brandConfig: BrandConfig;
  catalog: Catalog;
  children: React.ReactNode;
}

export function MusicProvider({ brandConfig, catalog, children }: MusicProviderProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const consecutiveErrorsRef = useRef(0);
  // Mirrors `audioSourceSong` so the onError handler (registered once at mount)
  // can name the track that just failed in the skipNotice toast.
  const audioSourceSongRef = useRef<Song | null>(null);
  // Refs to next/prev callbacks so the Media Session handlers (set once
  // at audio-creation) can reach the latest definitions without re-binding.
  const nextRef = useRef<() => void>(() => {});
  const prevRef = useRef<() => void>(() => {});

  useEffect(() => { injectGlobalStyles(); }, []);

  // Filter unplayable entries (missing/empty audio_url) — without this a stale
  // catalog entry whose URL is null cascades through the catalog via onError.
  const allSongs = useMemo(
    () => catalog.songs.filter((s) => typeof s.audio_url === 'string' && s.audio_url.length > 0),
    [catalog],
  );

  const featuredSongs = useMemo(() => {
    const pl = catalog.playlists[brandConfig.siteKey];
    if (!pl || pl.song_ids.length === 0) return allSongs;
    return pl.song_ids
      .map((id) => allSongs.find((s) => s.id === id))
      .filter((s): s is Song => s !== undefined);
  }, [catalog, brandConfig.siteKey, allSongs]);

  const featuredIds = useMemo(() => new Set(featuredSongs.map((s) => s.id)), [featuredSongs]);

  // Active playback queue. Defaults to featured; clicking a song that isn't
  // in featured (e.g. from the "All" tab) flips this to 'all' so the click
  // can resolve and the next/prev cycle traverses the full catalog.
  const [activeQueue, setActiveQueue] = useState<'featured' | 'all'>('featured');

  const songs = useMemo(() => {
    if (activeQueue === 'all') return allSongs;
    return featuredSongs.length > 0 ? featuredSongs : allSongs;
  }, [activeQueue, featuredSongs, allSongs]);
  const stationName = STATION_NAMES[brandConfig.siteKey] || `${brandConfig.siteName} Radio`;

  const saved = useMemo(() => loadState(), []);
  const initialIndex = saved ? Math.max(0, songs.findIndex((s) => s.id === saved.songId)) : 0;

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.7);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playMode, setPlayMode] = useState<PlayMode>('normal');
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
  const [radioQueue, setRadioQueue] = useState<Song[]>([]);
  const [radioIndex, setRadioIndex] = useState(0);
  // Buffer fraction (0–1) shown as a paler bar behind the progress fill (Shear, 2026-05-04).
  const [bufferedFrac, setBufferedFrac] = useState(0);
  // Last skipped track surface — displays a brief "Skipped <title>" toast above
  // the bar when a track 403s or otherwise fails to load. Auto-clears.
  const [skipNotice, setSkipNotice] = useState<string | null>(null);
  // Channel-active flag — true while MusicVideoChannel is mounted; MusicBar
  // self-hides when set so the audio bar doesn't compete with the video's
  // own audio + controls.
  const [channelActive, setChannelActive] = useState(false);

  const currentSong = playMode === 'radio'
    ? (radioQueue[radioIndex] ?? songs[currentIndex] ?? null)
    : (songs[currentIndex] ?? null);

  // Create audio element once
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audio.volume = 0.7;
    audioRef.current = audio;

    const onTime = () => setCurrentTime(audio.currentTime);
    const onDuration = () => setDuration(audio.duration || 0);
    const onCanPlay = () => { consecutiveErrorsRef.current = 0; };
    const onEnded = () => {
      // Handled by advanceTrack
      advanceTrackRef.current();
    };
    // Buffered fraction (Shear, 2026-05-04): shaded buffer-ahead bar behind
    // the progress fill, like YouTube's grey-bar-behind-red.
    const onProgress = () => {
      try {
        if (!audio.buffered.length || !audio.duration) {
          setBufferedFrac(0); return;
        }
        const end = audio.buffered.end(audio.buffered.length - 1);
        setBufferedFrac(Math.min(1, end / audio.duration));
      } catch {
        // some browsers throw on .end() before any buffer
      }
    };
    const onError = () => {
      consecutiveErrorsRef.current += 1;
      // Surface the skipped track to the user (van Schneider, 2026-05-04).
      // Replaces silent skip-cascade with a brief, dismissable toast.
      const skipped = audioSourceSongRef.current;
      if (skipped) setSkipNotice(skipped.title);
      if (consecutiveErrorsRef.current >= 3) {
        console.warn('Audio: 3 consecutive load errors, stopping playback');
        setIsPlaying(false);
        consecutiveErrorsRef.current = 0;
        return;
      }
      console.warn('Audio load error, skipping track');
      advanceTrackRef.current();
    };

    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('loadedmetadata', onDuration);
    audio.addEventListener('canplay', onCanPlay);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);
    audio.addEventListener('progress', onProgress);
    audio.addEventListener('timeupdate', onProgress);

    // Media Session API: surface play/pause/skip on the OS lock-screen
    // and hardware media keys. Set once; metadata is updated per-song below.
    if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
      try {
        navigator.mediaSession.setActionHandler('play', () => {
          audioRef.current?.play().catch(() => {});
        });
        navigator.mediaSession.setActionHandler('pause', () => {
          audioRef.current?.pause();
        });
        navigator.mediaSession.setActionHandler('previoustrack', () => {
          prevRef.current?.();
        });
        navigator.mediaSession.setActionHandler('nexttrack', () => {
          nextRef.current?.();
        });
      } catch {
        // setActionHandler can throw on older browsers — non-fatal
      }
    }

    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('loadedmetadata', onDuration);
      audio.removeEventListener('canplay', onCanPlay);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
      audio.removeEventListener('progress', onProgress);
      audio.removeEventListener('timeupdate', onProgress);
      audio.pause();
      audio.src = '';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Advance track logic (respects repeat/shuffle/radio)
  const advanceTrackRef = useRef<() => void>(() => {});

  advanceTrackRef.current = () => {
    if (repeatMode === 'one') {
      const audio = audioRef.current;
      if (audio) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      }
      return;
    }

    if (playMode === 'radio') {
      const nextIdx = radioIndex + 1;
      if (nextIdx >= radioQueue.length) {
        // Reshuffle
        const newQueue = weightedShuffle(allSongs, featuredIds, radioQueue[radioIndex]?.id);
        setRadioQueue(newQueue);
        setRadioIndex(0);
      } else {
        setRadioIndex(nextIdx);
      }
      return;
    }

    if (playMode === 'shuffle') {
      // Random next, different from current
      let nextIdx: number;
      if (songs.length <= 1) {
        nextIdx = 0;
      } else {
        do {
          nextIdx = Math.floor(Math.random() * songs.length);
        } while (nextIdx === currentIndex && songs.length > 1);
      }
      setCurrentIndex(nextIdx);
      return;
    }

    // Normal mode
    const nextIdx = currentIndex + 1;
    if (nextIdx >= songs.length) {
      if (repeatMode === 'all') {
        setCurrentIndex(0);
      } else {
        setCurrentIndex(0);
        setIsPlaying(false);
      }
    } else {
      setCurrentIndex(nextIdx);
    }
  };

  // Determine the actual audio source song
  const audioSourceSong = playMode === 'radio'
    ? radioQueue[radioIndex]
    : songs[currentIndex];

  // Update audio source when song changes
  const prevSongIdRef = useRef<string | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    const song = audioSourceSong;
    if (!audio || !song) return;
    if (song.id === prevSongIdRef.current && audio.src) return;

    prevSongIdRef.current = song.id;
    const wasPlaying = isPlaying;
    audio.src = song.audio_url;
    audio.load();

    if (wasPlaying) {
      audio.play().catch(() => {});
    }

    if (saved && song.id === saved.songId && currentTime === 0) {
      audio.currentTime = saved.time;
    }

    // Surface track metadata to OS lock-screen / hardware media keys.
    if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
      try {
        navigator.mediaSession.metadata = new (window as any).MediaMetadata({
          title: song.title,
          artist: song.artist,
          album: brandConfig.siteName,
          artwork: song.image_url
            ? [
                { src: song.image_url, sizes: '256x256', type: 'image/jpeg' },
                { src: song.image_url, sizes: '512x512', type: 'image/jpeg' },
              ]
            : [],
        });
      } catch {
        // Older browsers — non-fatal
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioSourceSong?.id]);

  // Mirror playback state to Media Session so OS UIs show correct play/pause.
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
      try {
        (navigator.mediaSession as any).playbackState = isPlaying ? 'playing' : 'paused';
      } catch {
        // non-fatal
      }
    }
  }, [isPlaying]);

  // Tab title now-playing (van Schneider, 2026-05-04): when a track is
  // playing, prefix the browser tab title with "♪ Title — Artist". Lets
  // the user locate which tab is making sound when multitasking. Restores
  // the original title on pause / stop / unmount.
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const original = document.title;
    if (isPlaying && currentSong) {
      document.title = `♪ ${currentSong.title} — ${currentSong.artist}`;
    }
    return () => {
      // Only revert if we changed it
      if (isPlaying && currentSong) document.title = original;
    };
  }, [isPlaying, currentSong]);

  // Mirror audioSourceSong into a ref so the once-mounted onError handler
  // can read the current value when surfacing a skip notice.
  const audioSourceSong0 = audioSourceSong;
  useEffect(() => {
    audioSourceSongRef.current = audioSourceSong0 ?? null;
  }, [audioSourceSong0]);

  // Auto-clear the skipNotice toast after 4s.
  useEffect(() => {
    if (!skipNotice) return;
    const t = setTimeout(() => setSkipNotice(null), 4000);
    return () => clearTimeout(t);
  }, [skipNotice]);

  // Cross-tab playback sync (Shear, 2026-05-04): if the user opens multiple
  // tabs of any ecosystem site, only one should be playing at a time. When
  // this tab starts playing, broadcast a 'play' message; other tabs see it
  // and pause themselves. Uses a per-tab UUID so the tab that broadcasts
  // doesn't pause itself.
  const tabIdRef = useRef<string>('');
  if (!tabIdRef.current && typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    tabIdRef.current = crypto.randomUUID();
  }
  useEffect(() => {
    if (typeof window === 'undefined' || !('BroadcastChannel' in window)) return;
    const ch = new BroadcastChannel('admp-cross-tab-playback');
    const onMsg = (e: MessageEvent) => {
      if (!e.data || e.data.tabId === tabIdRef.current) return;
      if (e.data.type === 'play' && audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    };
    ch.addEventListener('message', onMsg);
    return () => {
      ch.removeEventListener('message', onMsg);
      ch.close();
    };
  }, []);
  // Broadcast 'play' whenever this tab transitions to playing.
  useEffect(() => {
    if (!isPlaying || typeof window === 'undefined' || !('BroadcastChannel' in window)) return;
    const ch = new BroadcastChannel('admp-cross-tab-playback');
    ch.postMessage({ type: 'play', tabId: tabIdRef.current });
    ch.close();
  }, [isPlaying]);

  // Persist state periodically
  useEffect(() => {
    const song = audioSourceSong;
    if (!song) return;
    const interval = setInterval(() => {
      saveState(song.id, audioRef.current?.currentTime ?? 0);
    }, 5000);
    return () => clearInterval(interval);
  }, [audioSourceSong]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      // Don't capture when typing in inputs
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          if (isPlaying) {
            audioRef.current?.pause();
            setIsPlaying(false);
          } else {
            audioRef.current?.play().catch(() => {});
            setIsPlaying(true);
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (audioRef.current) {
            audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10);
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (audioRef.current) {
            audioRef.current.currentTime = Math.min(
              audioRef.current.duration || 0,
              audioRef.current.currentTime + 10
            );
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolumeState((prev) => {
            const next = Math.min(1, prev + 0.1);
            if (audioRef.current) audioRef.current.volume = next;
            return next;
          });
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolumeState((prev) => {
            const next = Math.max(0, prev - 0.1);
            if (audioRef.current) audioRef.current.volume = next;
            return next;
          });
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          setVolumeState((prev) => {
            const next = prev > 0 ? 0 : 0.7;
            if (audioRef.current) audioRef.current.volume = next;
            return next;
          });
          break;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isPlaying]);

  const play = useCallback(
    (song?: Song) => {
      if (song) {
        if (playMode === 'radio') {
          // In radio mode, find in radio queue or switch to normal
          const idx = radioQueue.findIndex((s) => s.id === song.id);
          if (idx >= 0) {
            setRadioIndex(idx);
          } else {
            setPlayMode('normal');
            // Pick the right queue same way playSongById does.
            const featIdx = featuredSongs.findIndex((s) => s.id === song.id);
            const allIdx = allSongs.findIndex((s) => s.id === song.id);
            if (featIdx >= 0) {
              setActiveQueue('featured');
              setCurrentIndex(featIdx);
            } else if (allIdx >= 0) {
              setActiveQueue('all');
              setCurrentIndex(allIdx);
            }
          }
        } else {
          const featIdx = featuredSongs.findIndex((s) => s.id === song.id);
          const allIdx = allSongs.findIndex((s) => s.id === song.id);
          if (featIdx >= 0) {
            setActiveQueue('featured');
            setCurrentIndex(featIdx);
          } else if (allIdx >= 0) {
            setActiveQueue('all');
            setCurrentIndex(allIdx);
          }
        }
      }
      setIsPlaying(true);
      setTimeout(() => audioRef.current?.play().catch(() => {}), 50);
    },
    [allSongs, featuredSongs, playMode, radioQueue]
  );

  const pause = useCallback(() => {
    setIsPlaying(false);
    audioRef.current?.pause();
  }, []);

  const toggle = useCallback(() => {
    if (isPlaying) pause();
    else play();
  }, [isPlaying, play, pause]);

  const next = useCallback(() => {
    advanceTrackRef.current();
    if (isPlaying) {
      setTimeout(() => audioRef.current?.play().catch(() => {}), 100);
    }
  }, [isPlaying]);
  nextRef.current = next;

  const prev = useCallback(() => {
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
    } else {
      if (playMode === 'radio') {
        const prevIdx = radioIndex - 1 >= 0 ? radioIndex - 1 : radioQueue.length - 1;
        setRadioIndex(prevIdx);
      } else {
        setCurrentIndex((p) => (p - 1 >= 0 ? p - 1 : songs.length - 1));
      }
      if (isPlaying) {
        setTimeout(() => audioRef.current?.play().catch(() => {}), 100);
      }
    }
  }, [songs.length, isPlaying, playMode, radioIndex, radioQueue.length]);
  prevRef.current = prev;

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const setVolume = useCallback((v: number) => {
    setVolumeState(v);
    if (audioRef.current) audioRef.current.volume = v;
  }, []);

  const playSongById = useCallback(
    (id: string) => {
      // Look up in allSongs first so a click from the "All" tab can resolve
      // even when the song isn't in this site's featured playlist.
      const allIdx = allSongs.findIndex((s) => s.id === id);
      if (allIdx < 0) return;

      const featIdx = featuredSongs.findIndex((s) => s.id === id);
      const targetQueue: 'featured' | 'all' = featIdx >= 0 ? 'featured' : 'all';
      const idxInTarget = targetQueue === 'featured' ? featIdx : allIdx;

      if (playMode === 'radio') setPlayMode('normal');
      setActiveQueue(targetQueue);
      setCurrentIndex(idxInTarget);
      setIsPlaying(true);
      prevSongIdRef.current = null; // Force reload
      setTimeout(() => audioRef.current?.play().catch(() => {}), 100);
    },
    [allSongs, featuredSongs, playMode]
  );

  const toggleShuffle = useCallback(() => {
    setPlayMode((prev) => {
      if (prev === 'shuffle') return 'normal';
      return 'shuffle';
    });
  }, []);

  const cycleRepeat = useCallback(() => {
    setRepeatMode((prev) => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  }, []);

  const startRadio = useCallback(() => {
    const queue = weightedShuffle(allSongs, featuredIds);
    setRadioQueue(queue);
    setRadioIndex(0);
    setPlayMode('radio');
    setIsPlaying(true);
    prevSongIdRef.current = null;
    setTimeout(() => audioRef.current?.play().catch(() => {}), 150);
  }, [allSongs, featuredIds]);

  const stopRadio = useCallback(() => {
    setPlayMode('normal');
  }, []);

  const value: MusicContextValue = {
    brand: brandConfig,
    songs,
    featuredSongs,
    allSongs,
    currentSong,
    currentIndex,
    isPlaying,
    volume,
    currentTime,
    duration,
    playMode,
    repeatMode,
    stationName,
    play,
    pause,
    toggle,
    next,
    prev,
    seek,
    setVolume,
    playSongById,
    setPlayMode,
    setRepeatMode,
    toggleShuffle,
    cycleRepeat,
    startRadio,
    stopRadio,
    bufferedFrac,
    skipNotice,
    dismissSkipNotice: () => setSkipNotice(null),
    catalog,
    channelActive,
    setChannelActive,
  };

  return <MusicContext.Provider value={value}>{children}</MusicContext.Provider>;
}

// ─── SVG Icons (inline, no dependencies) ─────────────────────────────────────

function IconPlay({ size = 20, color = '#fff' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function IconPause({ size = 20, color = '#fff' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
  );
}

function IconSkipNext({ size = 20, color = '#fff' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
    </svg>
  );
}

function IconSkipPrev({ size = 20, color = '#fff' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
    </svg>
  );
}

function IconVolume({ size = 20, color = '#fff' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
    </svg>
  );
}

function IconVolumeMute({ size = 20, color = '#fff' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
    </svg>
  );
}

function IconMusic({ size = 20, color = '#fff' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
    </svg>
  );
}

function IconChevronUp({ size = 20, color = '#fff' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z" />
    </svg>
  );
}

function IconChevronDown({ size = 20, color = '#fff' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z" />
    </svg>
  );
}

function IconExternalLink({ size = 16, color = '#fff' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
    </svg>
  );
}

// IconShare is defined further down (used by MusicPage). Reusing same definition.

function IconShuffle({ size = 20, color = '#fff' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />
    </svg>
  );
}

function IconRepeat({ size = 20, color = '#fff' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 1l4 4-4 4" />
      <path d="M3 11V9a4 4 0 014-4h14" />
      <path d="M7 23l-4-4 4-4" />
      <path d="M21 13v2a4 4 0 01-4 4H3" />
    </svg>
  );
}

function IconRepeatOne({ size = 20, color = '#fff' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 1l4 4-4 4" />
      <path d="M3 11V9a4 4 0 014-4h14" />
      <path d="M7 23l-4-4 4-4" />
      <path d="M21 13v2a4 4 0 01-4 4H3" />
      <text x="11" y="15" fontSize="8" fill={color} stroke="none" textAnchor="middle" fontWeight="bold">1</text>
    </svg>
  );
}

function IconRadio({ size = 20, color = '#fff' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="2" fill={color} />
      <path d="M16.24 7.76a6 6 0 010 8.49" />
      <path d="M7.76 16.24a6 6 0 010-8.49" />
      <path d="M19.07 4.93a10 10 0 010 14.14" />
      <path d="M4.93 19.07a10 10 0 010-14.14" />
    </svg>
  );
}

function IconTV({ size = 20, color = '#fff' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="15" rx="2" ry="2" />
      <polyline points="17 2 12 7 7 2" />
    </svg>
  );
}

function IconClose({ size = 20, color = '#fff' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

// ─── Now Playing Animated Bars ──────────────────────────────────────────────

function NowPlayingBars({ color, size = 16 }: { color: string; size?: number }) {
  const barWidth = Math.max(2, size / 6);
  const gap = Math.max(1, size / 8);

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', height: size, gap }}>
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            width: barWidth,
            height: '100%',
            backgroundColor: color,
            borderRadius: 1,
            animation: `admp-bar${i} ${0.6 + i * 0.15}s ease-in-out infinite`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Marquee Text ───────────────────────────────────────────────────────────

function MarqueeText({
  text,
  style,
}: {
  text: string;
  style: React.CSSProperties;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [shouldScroll, setShouldScroll] = useState(false);

  useEffect(() => {
    const check = () => {
      if (containerRef.current && textRef.current) {
        setShouldScroll(textRef.current.scrollWidth > containerRef.current.clientWidth);
      }
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [text]);

  if (!shouldScroll) {
    return (
      <div ref={containerRef} style={{ ...style, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
        <span ref={textRef}>{text}</span>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{ ...style, overflow: 'hidden', whiteSpace: 'nowrap', position: 'relative' }}
    >
      <span
        ref={textRef}
        style={{
          display: 'inline-block',
          animation: 'admp-marquee 12s linear infinite',
          paddingRight: 60,
        }}
      >
        {text}
      </span>
      <span
        style={{
          display: 'inline-block',
          animation: 'admp-marquee 12s linear infinite',
          paddingRight: 60,
        }}
      >
        {text}
      </span>
    </div>
  );
}

// ─── Radio Waves Animation ──────────────────────────────────────────────────

function RadioWaves({ color, size = 16 }: { color: string; size?: number }) {
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      {[0, 0.4, 0.8].map((delay, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            inset: 0,
            border: `1.5px solid ${color}`,
            borderRadius: '50%',
            animation: `admp-radio-wave 1.5s ease-out ${delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isMobile;
}

function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([^?&]+)/);
  return match ? match[1] : null;
}

// ─── MusicBar (persistent bottom bar) ────────────────────────────────────────

export function MusicBar() {
  const {
    brand,
    currentSong,
    isPlaying,
    toggle,
    next,
    prev,
    currentTime,
    duration,
    seek,
    volume,
    setVolume,
    playMode,
    repeatMode,
    stationName,
    toggleShuffle,
    cycleRepeat,
    startRadio,
    stopRadio,
    bufferedFrac,
    skipNotice,
    dismissSkipNotice,
    channelActive,
  } = useMusicContext();

  // Self-hide while the Music Video Channel is open — its iframe carries its
  // own audio + controls; the bar would only confuse things (Aaron 2026-05-04).
  if (channelActive) return null;

  // Per-brand bar overrides — Day2026 sets barSurfaceColor=Granite +
  // barTextColor=Cream so the bar reads as a dark module patch on the cream
  // page ground. Other sites fall back to surfaceColor / textColor.
  const barSurface = (brand as any).barSurfaceColor || brand.surfaceColor;
  const barText    = (brand as any).barTextColor    || brand.textColor;

  const isMobile = useIsMobile();
  const [expanded, setExpanded] = useState(false);
  const [progressHover, setProgressHover] = useState(false);
  const [shareToast, setShareToast] = useState<string | null>(null);
  const touchStartY = useRef<number>(0);

  if (!currentSong) return null;

  // Share handler (Aaron 2026-05-04): native share API on mobile, clipboard
  // fallback on desktop. Deep-links to THIS site's /music page with ?song=<id>
  // so the recipient lands on Aaron's ecosystem (where they can vote/comment),
  // not on Suno.
  const handleShare = async () => {
    if (!currentSong || typeof window === 'undefined') return;
    const url = `${window.location.origin}/music?song=${currentSong.id}`;
    const shareData = {
      title: `${currentSong.title} — ${currentSong.artist}`,
      text: `Listen to "${currentSong.title}" by ${currentSong.artist}`,
      url,
    };
    const nav: any = typeof navigator !== 'undefined' ? navigator : null;
    try {
      if (nav && typeof nav.share === 'function') {
        await nav.share(shareData);
        setShareToast('Shared');
      } else if (nav && nav.clipboard) {
        await nav.clipboard.writeText(url);
        setShareToast('Link copied');
      } else {
        // Last-ditch fallback: open X intent
        window.open(`https://x.com/intent/post?text=${encodeURIComponent(shareData.text)}&url=${encodeURIComponent(url)}`, '_blank');
      }
    } catch (e: any) {
      // AbortError = user cancelled native share — silent
      if (e?.name !== 'AbortError') {
        try {
          if (nav?.clipboard) {
            await nav.clipboard.writeText(url);
            setShareToast('Link copied');
          }
        } catch {
          setShareToast('Share failed');
        }
      }
    }
    setTimeout(() => setShareToast(null), 2000);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    seek(Math.max(0, Math.min(duration, pct * duration)));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartY.current - e.changedTouches[0].clientY;
    if (diff > 40) setExpanded(true);
    if (diff < -40) setExpanded(false);
  };

  // P1 height floor (van Schneider + Khan, 2026-05-03):
  //   mobile collapsed = 64 (was 56), expanded = 200, desktop = 72 (was 64).
  const barHeight = isMobile ? (expanded ? 200 : 64) : 72;

  // P0 visibility floor (Jina + Shear, 2026-05-03): glow alpha is no longer a
  // hardcoded 1A/33 hex suffix — it's a per-brand intensity token, floor 0.40.
  const glowAlphaHex = Math.round(brand.glowIntensity * 255)
    .toString(16)
    .padStart(2, '0')
    .toUpperCase();
  const glowColor = brand.primaryColor + glowAlphaHex;

  // P0 #3 Shear+Pelly compromise: backdrop-blur ONLY when playing. Always-on
  // separator keeps bar locatable; glass-depth signals "active." When paused,
  // bar is fully solid surfaceColor — no editorial overreach on quiet pages.
  // Fu's @supports fallback: 95% opacity solid for browsers without filter.
  const supportsBackdropFilter =
    typeof CSS !== 'undefined' &&
    typeof CSS.supports === 'function' &&
    CSS.supports('backdrop-filter', 'blur(1px)');
  const playingBackground =
    supportsBackdropFilter
      ? barSurface + 'E0' // ~88% opacity (E0 / FF)
      : barSurface + 'F2'; // ~95% opacity fallback
  const barBackground = isPlaying ? playingBackground : barSurface;

  const barStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    height: barHeight,
    backgroundColor: barBackground,
    // P0 #1: opaque hex separator, default 3px — replaces 1px@20% near-invisible line.
    borderTop: `${brand.separatorBorderWidth} solid ${brand.separatorBorderColor}`,
    zIndex: 2147483000,
    pointerEvents: 'auto',
    isolation: 'isolate',
    transition: 'height 0.3s ease, background-color 0.25s ease',
    fontFamily: brand.bodyFont,
    display: 'flex',
    flexDirection: 'column',
    // P0 #2: glow alpha now driven by brand.glowIntensity (≥0.40 floor enforced
    // by validateBrandConfig). Both states use the brand-controlled alpha so
    // the bar's visual presence is consistent and brand-tuned.
    boxShadow: isPlaying
      ? `0 -6px 24px ${glowColor}, 0 -1px 0 ${brand.separatorBorderColor}`
      : `0 -3px 12px ${brand.primaryColor}33`,
    // P0 #3: backdrop-blur only when actively playing (Pelly compromise).
    ...(isPlaying && supportsBackdropFilter
      ? { backdropFilter: 'blur(12px) saturate(180%)', WebkitBackdropFilter: 'blur(12px) saturate(180%)' }
      : {}),
    ...(isPlaying ? { animation: 'admp-glow-pulse 3s ease-in-out infinite' } : {}),
  };

  const controlsRow: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    padding: isMobile ? '10px 12px' : '10px 24px',
    gap: isMobile ? 10 : 12,
    flex: '0 0 auto',
    minHeight: isMobile ? 64 : 72,
  };

  // P1 #6 (van Schneider, 2026-05-03): mobile collapsed art = 36x36, desktop = 48x48.
  const artSize = isMobile && !expanded ? 36 : 48;
  const artStyle: React.CSSProperties = {
    width: artSize,
    height: artSize,
    borderRadius: 6,
    backgroundColor: brand.primaryColor + '33',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
  };

  const btnStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 6,
    minWidth: 36,
    minHeight: 36,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    flexShrink: 0,
  };

  const mobileBtnStyle: React.CSSProperties = {
    ...btnStyle,
    minWidth: 44,
    minHeight: 44,
    padding: 8,
  };

  const progressHeight = progressHover ? 10 : 6;
  const progressBarOuter: React.CSSProperties = {
    flex: 1,
    height: progressHeight,
    backgroundColor: barText + '22',
    borderRadius: progressHeight / 2,
    cursor: 'pointer',
    position: 'relative',
    minWidth: 60,
    transition: 'height 0.15s ease',
  };

  const progressBarInner: React.CSSProperties = {
    height: '100%',
    width: `${progress}%`,
    backgroundColor: brand.primaryColor,
    borderRadius: progressHeight / 2,
    transition: 'width 0.1s linear',
    position: 'relative',
    zIndex: 2,
  };

  // Buffer-ahead indicator (Shear, 2026-05-04): paler bar between background
  // and progress fill, like YouTube's grey-bar-behind-red.
  const bufferBarStyle: React.CSSProperties = {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    width: `${Math.min(100, bufferedFrac * 100)}%`,
    backgroundColor: brand.primaryColor + '40', // 25% alpha
    borderRadius: progressHeight / 2,
    transition: 'width 0.3s linear',
    zIndex: 1,
    pointerEvents: 'none',
  };

  const seekDotStyle: React.CSSProperties = {
    position: 'absolute',
    right: -6,
    top: '50%',
    transform: 'translateY(-50%)',
    width: 12,
    height: 12,
    borderRadius: '50%',
    backgroundColor: brand.primaryColor,
    boxShadow: `0 0 4px ${brand.primaryColor}88`,
    opacity: progressHover ? 1 : 0,
    transition: 'opacity 0.15s ease',
  };

  const isRadio = playMode === 'radio';

  const tree = (
    <div data-admp-bar style={barStyle} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      {/* Toasts above the bar (skip notice + share confirmation). Stacked
          right, dismissable, auto-clear. */}
      {(skipNotice || shareToast) && (
        <div
          style={{
            position: 'absolute',
            bottom: barHeight + 8,
            right: isMobile ? 12 : 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            pointerEvents: 'none',
            zIndex: 1,
          }}
        >
          {skipNotice && (
            <div
              role="status"
              onClick={dismissSkipNotice}
              style={{
                pointerEvents: 'auto',
                cursor: 'pointer',
                background: barSurface,
                color: barText,
                border: `1px solid ${brand.primaryColor}88`,
                borderLeft: `3px solid ${brand.primaryColor}`,
                padding: '8px 12px',
                borderRadius: 6,
                fontSize: 12,
                fontFamily: brand.bodyFont,
                boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
                maxWidth: 320,
              }}
            >
              Skipped <strong style={{ color: brand.primaryColor }}>{skipNotice}</strong> — track unavailable
            </div>
          )}
          {shareToast && (
            <div
              role="status"
              style={{
                background: brand.primaryColor,
                color: brand.backgroundColor,
                padding: '6px 12px',
                borderRadius: 6,
                fontSize: 12,
                fontFamily: brand.bodyFont,
                fontWeight: 600,
                boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
                alignSelf: 'flex-end',
              }}
            >
              {shareToast}
            </div>
          )}
        </div>
      )}
      {/* Main controls row */}
      <div style={controlsRow}>
        {/* Album art (with hover tooltip showing track + artist) */}
        <div style={artStyle} title={`Now playing: ${currentSong.title} — ${currentSong.artist}`}>
          {currentSong.image_url ? (
            <img
              src={currentSong.image_url}
              alt={currentSong.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <IconMusic size={24} color={brand.primaryColor} />
          )}
        </div>

        {/* Now Playing bars — wrapper carries data-admp-bars so prefers-reduced-motion
            CSS can kill the per-span height animation (Khan, 2026-05-03). */}
        {isPlaying && (
          <div data-admp-bars style={{ flexShrink: 0 }}>
            <NowPlayingBars color={brand.primaryColor} size={16} />
          </div>
        )}

        {/* Track info */}
        <div style={{ flex: '1 1 0', minWidth: 0, overflow: 'hidden' }}>
          {/* Radio station label */}
          {isRadio && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
              <span style={{
                fontSize: 9,
                fontWeight: 800,
                letterSpacing: 1,
                color: brand.primaryColor,
                padding: '1px 5px',
                border: `1px solid ${brand.primaryColor}`,
                borderRadius: 3,
                lineHeight: '14px',
              }}>
                LIVE
              </span>
              <RadioWaves color={brand.primaryColor} size={10} />
              <span style={{ fontSize: 10, color: brand.primaryColor, fontWeight: 600 }}>
                {stationName}
              </span>
            </div>
          )}
          <MarqueeText
            text={currentSong.title}
            style={{
              color: barText,
              fontSize: 14,
              fontWeight: 600,
            }}
          />
          {/* Artist line — always shown (van Schneider 2026-05-03: mobile collapsed
              = 2-line title+artist instead of single-line truncated title). */}
          {true && (
            <div
              style={{
                color: barText + 'AA',
                fontSize: 12,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {currentSong.artist}
            </div>
          )}
        </div>

        {/* Shuffle button */}
        {(!isMobile || expanded) && (
          <button
            style={{
              ...btnStyle,
              opacity: playMode === 'shuffle' ? 1 : 0.6,
              backgroundColor: playMode === 'shuffle' ? brand.primaryColor + '22' : 'transparent',
              border: playMode === 'shuffle' ? `1px solid ${brand.primaryColor}66` : '1px solid transparent',
            }}
            onClick={toggleShuffle}
            aria-label={playMode === 'shuffle' ? 'Shuffle on (click to turn off)' : 'Shuffle off'}
            aria-pressed={playMode === 'shuffle'}
          >
            <IconShuffle
              size={16}
              color={playMode === 'shuffle' ? brand.primaryColor : barText}
            />
          </button>
        )}

        {/* Controls */}
        {(!isMobile || expanded) && (
          <button style={isMobile ? mobileBtnStyle : btnStyle} onClick={prev} aria-label="Previous track">
            <IconSkipPrev size={20} color={barText} />
          </button>
        )}

        <button
          style={{
            ...(isMobile ? mobileBtnStyle : btnStyle),
            backgroundColor: brand.primaryColor,
            borderRadius: '50%',
            width: isMobile ? 44 : 40,
            height: isMobile ? 44 : 40,
          }}
          onClick={toggle}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <IconPause size={20} color={brand.backgroundColor} />
          ) : (
            <IconPlay size={20} color={brand.backgroundColor} />
          )}
        </button>

        {(!isMobile || expanded) && (
          <button style={isMobile ? mobileBtnStyle : btnStyle} onClick={next} aria-label="Next track">
            <IconSkipNext size={20} color={barText} />
          </button>
        )}

        {/* Repeat button */}
        {(!isMobile || expanded) && (
          <button
            style={{
              ...btnStyle,
              opacity: repeatMode !== 'off' ? 1 : 0.6,
              backgroundColor: repeatMode !== 'off' ? brand.primaryColor + '22' : 'transparent',
              border: repeatMode !== 'off' ? `1px solid ${brand.primaryColor}66` : '1px solid transparent',
            }}
            onClick={cycleRepeat}
            aria-label={`Repeat: ${repeatMode}. Click to cycle.`}
            aria-pressed={repeatMode !== 'off'}
          >
            {repeatMode === 'one' ? (
              <IconRepeatOne
                size={16}
                color={brand.primaryColor}
              />
            ) : (
              <IconRepeat
                size={16}
                color={repeatMode === 'all' ? brand.primaryColor : barText}
              />
            )}
          </button>
        )}

        {/* Radio button */}
        {(!isMobile || expanded) && (
          <button
            style={{
              ...btnStyle,
              opacity: isRadio ? 1 : 0.5,
            }}
            onClick={isRadio ? stopRadio : startRadio}
            aria-label={isRadio ? 'Stop radio' : 'Start radio'}
          >
            <IconRadio
              size={16}
              color={isRadio ? brand.primaryColor : barText}
            />
          </button>
        )}

        {/* Share button (Aaron 2026-05-04). Native share on mobile, clipboard
            on desktop. Deep-links to <site>/music?song=<id>. Always shown. */}
        <button
          style={{
            ...(isMobile ? mobileBtnStyle : btnStyle),
            opacity: 0.85,
          }}
          onClick={handleShare}
          aria-label="Share this song"
          title="Share"
        >
          <IconShare size={16} color={barText} />
        </button>

        {/* Progress bar (desktop inline) */}
        {!isMobile && (
          <>
            <span style={{ color: barText + 'AA', fontSize: 11, flexShrink: 0 }}>
              {formatTime(currentTime)}
            </span>
            <div
              style={progressBarOuter}
              onClick={handleProgressClick}
              onMouseEnter={() => setProgressHover(true)}
              onMouseLeave={() => setProgressHover(false)}
            >
              <div style={bufferBarStyle} />
              <div style={progressBarInner}>
                <div style={seekDotStyle} />
              </div>
            </div>
            <span style={{ color: barText + 'AA', fontSize: 11, flexShrink: 0 }}>
              {formatTime(duration)}
            </span>
          </>
        )}

        {/* Volume (desktop only) */}
        {!isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
            <button
              style={{ ...btnStyle, padding: 2, minWidth: 24, minHeight: 24 }}
              onClick={() => setVolume(volume > 0 ? 0 : 0.7)}
              aria-label={volume === 0 ? 'Unmute' : 'Mute'}
            >
              {volume === 0 ? (
                <IconVolumeMute size={16} color={barText + 'AA'} />
              ) : (
                <IconVolume size={16} color={barText + 'AA'} />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              style={{ width: 80, accentColor: brand.primaryColor }}
              aria-label="Volume"
            />
          </div>
        )}

        {/* Mobile expand toggle */}
        {isMobile && (
          <button style={mobileBtnStyle} onClick={() => setExpanded(!expanded)} aria-label="Expand player">
            {expanded ? (
              <IconChevronDown size={20} color={barText} />
            ) : (
              <IconChevronUp size={20} color={barText} />
            )}
          </button>
        )}
      </div>

      {/* Mobile expanded: progress bar */}
      {isMobile && expanded && (
        <div style={{ padding: '0 16px 8px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: barText + 'AA', fontSize: 11 }}>
            {formatTime(currentTime)}
          </span>
          <div
            style={{ ...progressBarOuter, height: 8 }}
            onClick={handleProgressClick}
          >
            <div style={{ ...bufferBarStyle, height: '100%' }} />
            <div style={{ ...progressBarInner, height: '100%' }}>
              <div style={{ ...seekDotStyle, opacity: 1 }} />
            </div>
          </div>
          <span style={{ color: barText + 'AA', fontSize: 11 }}>
            {formatTime(duration)}
          </span>
        </div>
      )}
    </div>
  );

  // Render via portal so the bar escapes any parent stacking context
  // (banner overlays, transformed wrappers) and always sits on top.
  return typeof document !== 'undefined'
    ? createPortal(tree, document.body)
    : tree;
}

// ─── MusicPage (full page with track grid) ───────────────────────────────────

export function MusicPage() {
  const {
    brand,
    featuredSongs,
    allSongs,
    currentSong: _currentSong,
    isPlaying: _isPlaying,
    playMode,
    stationName,
    startRadio,
    playSongById: _playSongById,
  } = useMusicContext();

  const isMobile = useIsMobile();
  const [tab, setTab] = useState<'featured' | 'all'>('featured');
  const [showChannel, setShowChannel] = useState(false);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);

  const displaySongs = tab === 'featured' ? featuredSongs : allSongs;
  const hasFeatured = featuredSongs.length > 0 && featuredSongs.length !== allSongs.length;
  const hasVideos = allSongs.some((s) => s.youtube_url);

  // Check URL for ?song= param to open detail panel
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const songId = params.get('song');
    if (songId) {
      const song = allSongs.find(s => s.id === songId);
      if (song) setSelectedSong(song);
    }
  }, [allSongs]);

  if (showChannel) {
    return <MusicVideoChannel onClose={() => setShowChannel(false)} />;
  }

  const pageStyle: React.CSSProperties = {
    minHeight: '100vh',
    backgroundColor: brand.backgroundColor,
    padding: isMobile ? '24px 16px 120px' : '48px 32px 120px',
    fontFamily: brand.bodyFont,
  };

  const headerStyle: React.CSSProperties = {
    textAlign: 'center' as const,
    marginBottom: 40,
  };

  const titleStyle: React.CSSProperties = {
    fontFamily: brand.headingFont,
    fontSize: isMobile ? 28 : 42,
    fontWeight: 900,
    color: brand.textColor,
    margin: '0 0 8px',
  };

  const subtitleStyle: React.CSSProperties = {
    color: brand.textColor + 'AA',
    fontSize: 16,
    margin: 0,
  };

  const tabBarStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 32,
  };

  const tabBtnStyle = (active: boolean): React.CSSProperties => ({
    padding: '10px 24px',
    borderRadius: 24,
    border: `1px solid ${active ? brand.primaryColor : brand.textColor + '33'}`,
    backgroundColor: active ? brand.primaryColor + '22' : 'transparent',
    color: active ? brand.primaryColor : brand.textColor + 'AA',
    cursor: 'pointer',
    fontFamily: brand.bodyFont,
    fontSize: 14,
    fontWeight: 600,
    minHeight: 44,
  });

  const cardsRow: React.CSSProperties = {
    display: 'flex',
    gap: 16,
    maxWidth: 1200,
    margin: '0 auto 32px',
    flexWrap: 'wrap',
    justifyContent: 'center',
  };

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: 20,
    maxWidth: 1200,
    margin: '0 auto',
  };

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>
          Music{' '}
          <span style={{ color: brand.primaryColor }}>|</span>{' '}
          {brand.siteName}
        </h1>
        <p style={subtitleStyle}>
          The soundtrack of sovereignty. {allSongs.length} tracks.
        </p>
      </div>

      {/* Radio + Channel Cards */}
      <div style={cardsRow}>
        <RadioCard brand={brand} stationName={stationName} onStart={startRadio} isActive={playMode === 'radio'} />
        {hasVideos && (
          <ChannelCard brand={brand} onOpen={() => setShowChannel(true)} />
        )}
      </div>

      {hasFeatured && (
        <div style={tabBarStyle}>
          <button style={tabBtnStyle(tab === 'featured')} onClick={() => setTab('featured')}>
            Featured ({featuredSongs.length})
          </button>
          <button style={tabBtnStyle(tab === 'all')} onClick={() => setTab('all')}>
            All Songs ({allSongs.length})
          </button>
        </div>
      )}

      <div style={gridStyle}>
        {displaySongs.map((song) => (
          <SongCard key={song.id} song={song} onSelect={setSelectedSong} />
        ))}
      </div>

      {/* Detail Panel Overlay */}
      {selectedSong && (
        <MusicDetailPanel
          song={selectedSong}
          brand={brand}
          onClose={() => setSelectedSong(null)}
        />
      )}
    </div>
  );
}

// ─── Radio Card ─────────────────────────────────────────────────────────────

function RadioCard({
  brand,
  stationName,
  onStart,
  isActive,
}: {
  brand: BrandConfig;
  stationName: string;
  onStart: () => void;
  isActive: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        flex: '1 1 280px',
        maxWidth: 380,
        padding: 24,
        borderRadius: 16,
        backgroundColor: isActive ? brand.primaryColor + '1A' : brand.surfaceColor,
        border: `1px solid ${isActive ? brand.primaryColor : brand.primaryColor + '44'}`,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        transform: hovered ? 'scale(1.02)' : 'none',
        boxShadow: hovered ? `0 8px 24px ${brand.primaryColor}33` : 'none',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onStart}
      role="button"
      tabIndex={0}
      aria-label={`Listen to ${stationName}`}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onStart(); } }}
    >
      <div style={{
        width: 56,
        height: 56,
        borderRadius: '50%',
        backgroundColor: brand.primaryColor + '22',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        position: 'relative',
      }}>
        <IconRadio size={28} color={brand.primaryColor} />
        {isActive && (
          <div style={{ position: 'absolute', inset: -4 }}>
            <RadioWaves color={brand.primaryColor} size={64} />
          </div>
        )}
      </div>
      <div>
        <div style={{
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: 1.5,
          color: isActive ? brand.primaryColor : brand.textColor + '88',
          marginBottom: 4,
        }}>
          {isActive ? 'NOW PLAYING' : 'LISTEN TO'}
        </div>
        <div style={{
          fontSize: 18,
          fontWeight: 700,
          color: brand.textColor,
          fontFamily: brand.headingFont,
        }}>
          {stationName}
        </div>
      </div>
    </div>
  );
}

// ─── Channel Card ───────────────────────────────────────────────────────────

function ChannelCard({ brand, onOpen }: { brand: BrandConfig; onOpen: () => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        flex: '1 1 280px',
        maxWidth: 380,
        padding: 24,
        borderRadius: 16,
        backgroundColor: brand.surfaceColor,
        border: `1px solid ${brand.accentColor}44`,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        transform: hovered ? 'scale(1.02)' : 'none',
        boxShadow: hovered ? `0 8px 24px ${brand.accentColor}33` : 'none',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onOpen}
      role="button"
      tabIndex={0}
      aria-label="Watch music video channel"
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(); } }}
    >
      <div style={{
        width: 56,
        height: 56,
        borderRadius: '50%',
        backgroundColor: brand.accentColor + '22',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <IconTV size={28} color={brand.accentColor} />
      </div>
      <div>
        <div style={{
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: 1.5,
          color: brand.textColor + '88',
          marginBottom: 4,
        }}>
          WATCH
        </div>
        <div style={{
          fontSize: 18,
          fontWeight: 700,
          color: brand.textColor,
          fontFamily: brand.headingFont,
        }}>
          Music Video Channel
        </div>
      </div>
    </div>
  );
}

// ─── SongCard ────────────────────────────────────────────────────────────────

function SongCard({ song, onSelect }: { song: Song; onSelect?: (song: Song) => void }) {
  const { brand, currentSong, isPlaying, pause, playSongById } = useMusicContext();
  const isCurrent = currentSong?.id === song.id;
  const isThisPlaying = isCurrent && isPlaying;
  const [hovered, setHovered] = useState(false);

  const cardStyle: React.CSSProperties = {
    backgroundColor: brand.surfaceColor,
    border: `${isCurrent ? '2px' : '1px'} solid ${isCurrent ? brand.primaryColor : brand.textColor + '1A'}`,
    borderRadius: 12,
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'border-color 0.15s, transform 0.15s, box-shadow 0.15s',
    transform: hovered ? 'scale(1.02)' : 'none',
    boxShadow: isCurrent
      ? `0 0 16px ${brand.primaryColor}66, 0 4px 12px rgba(0,0,0,0.3)`
      : hovered
        ? '0 8px 20px rgba(0,0,0,0.3)'
        : 'none',
    position: 'relative',
  };

  const nowPlayingPill: React.CSSProperties = {
    position: 'absolute',
    top: 8,
    left: 8,
    padding: '3px 8px',
    backgroundColor: brand.primaryColor,
    color: brand.backgroundColor,
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: 1,
    borderRadius: 3,
    textTransform: 'uppercase',
    pointerEvents: 'none',
    zIndex: 2,
    boxShadow: `0 2px 6px ${brand.primaryColor}66`,
  };

  const artContainerStyle: React.CSSProperties = {
    width: '100%',
    aspectRatio: '1',
    backgroundColor: brand.primaryColor + '1A',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  };

  const overlayStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    opacity: hovered || isThisPlaying ? 1 : 0,
    transition: 'opacity 0.2s',
  };

  const playBtnStyle: React.CSSProperties = {
    width: 56,
    height: 56,
    borderRadius: '50%',
    backgroundColor: brand.primaryColor,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    cursor: 'pointer',
  };

  const infoStyle: React.CSSProperties = {
    padding: 16,
  };

  const handleClick = () => {
    if (isThisPlaying) {
      pause();
    } else {
      playSongById(song.id);
    }
  };

  return (
    <div
      style={cardStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={`${isThisPlaying ? 'Pause' : 'Play'} ${song.title} by ${song.artist}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {/* NOW PLAYING pill (only when this card's song is the active playing one) */}
      {isThisPlaying && (
        <div style={nowPlayingPill}>Now Playing</div>
      )}

      {/* Art */}
      <div style={artContainerStyle}>
        {song.image_url ? (
          <img
            src={song.image_url}
            alt={song.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <IconMusic size={48} color={brand.primaryColor + '66'} />
        )}
        <div style={overlayStyle}>
          <div style={playBtnStyle}>
            {isThisPlaying ? (
              <IconPause size={28} color={brand.backgroundColor} />
            ) : (
              <IconPlay size={28} color={brand.backgroundColor} />
            )}
          </div>
          {/* Now Playing bars on the card */}
          {isThisPlaying && (
            <NowPlayingBars color={brand.primaryColor} size={28} />
          )}
        </div>
      </div>

      {/* Info */}
      <div style={infoStyle}>
        <div
          style={{
            color: isCurrent ? brand.primaryColor : brand.textColor,
            fontSize: 16,
            fontWeight: 700,
            fontFamily: brand.headingFont,
            marginBottom: 4,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {song.title}
        </div>
        <div
          style={{
            color: brand.textColor + 'AA',
            fontSize: 13,
            marginBottom: 8,
          }}
        >
          {song.artist}
        </div>

        {/* Star rating (compact) */}
        <div style={{ marginBottom: 8 }} onClick={(e) => e.stopPropagation()}>
          <StarRating songId={song.id} brand={brand} compact />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: brand.textColor + '66', fontSize: 12 }}>{song.duration}</span>

          {/* Comment count badge */}
          <CommentCountBadge songId={song.id} brand={brand} />

          {song.youtube_url && (
            <a
              href={song.youtube_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              style={{
                color: brand.primaryColor,
                fontSize: 12,
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              Watch Video <IconExternalLink size={12} color={brand.primaryColor} />
            </a>
          )}

          {song.suno_url && (
            <a
              href={song.suno_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              style={{
                color: brand.textColor + '66',
                fontSize: 12,
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              Suno <IconExternalLink size={12} color={brand.textColor + '66'} />
            </a>
          )}
        </div>

        {/* Tags + Discuss link */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
          {song.tags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {song.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontSize: 10,
                    padding: '2px 8px',
                    borderRadius: 10,
                    backgroundColor: brand.primaryColor + '1A',
                    color: brand.primaryColor,
                    fontWeight: 500,
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          {onSelect && (
            <button
              onClick={(e) => { e.stopPropagation(); onSelect(song); }}
              style={{
                background: 'none',
                border: 'none',
                color: brand.primaryColor,
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 600,
                padding: '2px 0',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                flexShrink: 0,
              }}
            >
              <IconComment size={12} color={brand.primaryColor} />
              Discuss
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Music Video Channel ────────────────────────────────────────────────────

interface MusicVideoChannelProps {
  onClose?: () => void;
}

export function MusicVideoChannel({ onClose }: MusicVideoChannelProps) {
  const ctx = useMusicContext() as any;
  const { brand, allSongs, catalog, isPlaying, pause, currentSong } = ctx;
  const isMobile = useIsMobile();

  // Source of truth for the channel: catalog.videos[] (poller fetches the
  // configured YouTube playlists every 5 min). Falls back to filtering
  // catalog.songs by youtube_url if videos[] is empty (legacy mode).
  type ChannelVideo = { id: string; title: string; thumbnail_url?: string; youtube_url: string };
  const videos: ChannelVideo[] = useMemo(() => {
    const fromCatalog = (catalog as any)?.videos as ChannelVideo[] | undefined;
    if (fromCatalog && fromCatalog.length > 0) return fromCatalog;
    return allSongs
      .filter((s: Song) => !!s.youtube_url)
      .map((s: Song): ChannelVideo | null => {
        const id = extractYouTubeId(s.youtube_url!);
        if (!id) return null;
        return {
          id,
          title: s.title,
          thumbnail_url: `https://i.ytimg.com/vi/${id}/mqdefault.jpg`,
          youtube_url: s.youtube_url!,
        };
      })
      .filter(Boolean) as ChannelVideo[];
  }, [allSongs, catalog]);

  // YouTube playlist (full Aaron Day Music Videos playlist) — single "Play All" tile.
  const playlistInfo = (catalog as any)?.youtube_playlist as { id?: string; name?: string } | undefined;
  const playlistId = playlistInfo?.id || '';

  type Selection =
    | { kind: 'video'; videoId: string; title: string }
    | { kind: 'playlist'; playlistId: string }
    | null;

  // Auto-pick first video so the player isn't empty on mount.
  const [selected, setSelected] = useState<Selection>(() => {
    if (videos.length > 0) {
      return { kind: 'video', videoId: videos[0].id, title: videos[0].title };
    }
    if (playlistId) return { kind: 'playlist', playlistId };
    return null;
  });

  // Pause the audio engine + hide the persistent bar while the channel is
  // open. The iframe's own audio is the sound source here. (Aaron 2026-05-04.)
  useEffect(() => {
    if (isPlaying) pause();
    ctx.setChannelActive(true);
    return () => ctx.setChannelActive(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync iframe to bar's next/prev. When the user hits next/prev on the
  // persistent MusicBar while the channel is open, currentSong changes →
  // advance the channel's video index by the same delta. Falls back to a
  // simple modulo cycle through videos[] (independent of audio matching).
  const lastSongIdRef = useRef<string | null>(currentSong?.id ?? null);
  const videoIndexRef = useRef<number>(0);
  useEffect(() => {
    if (!currentSong || videos.length === 0) return;
    if (currentSong.id === lastSongIdRef.current) return;
    lastSongIdRef.current = currentSong.id;
    // Advance by 1 (next direction). The channel grid is the user's tool for
    // jumping to a specific video; the bar's next just moves the channel
    // forward one slot.
    const nextIdx = (videoIndexRef.current + 1) % videos.length;
    videoIndexRef.current = nextIdx;
    const v = videos[nextIdx];
    setSelected({ kind: 'video', videoId: v.id, title: v.title });
  }, [currentSong, videos]);

  // Keep videoIndexRef in sync when user clicks a tile directly.
  useEffect(() => {
    if (!selected || selected.kind !== 'video') return;
    const idx = videos.findIndex((v) => v.id === selected.videoId);
    if (idx >= 0) videoIndexRef.current = idx;
  }, [selected, videos]);

  const iframeSrc = useMemo(() => {
    if (!selected) return '';
    if (selected.kind === 'video') {
      return `https://www.youtube.com/embed/${selected.videoId}?autoplay=1&modestbranding=1&rel=0&playsinline=1`;
    }
    return `https://www.youtube.com/embed/videoseries?list=${selected.playlistId}&autoplay=1&modestbranding=1&rel=0&playsinline=1`;
  }, [selected]);

  const isActive = (s: Selection): boolean => {
    if (!selected || !s) return false;
    if (selected.kind !== s.kind) return false;
    if (s.kind === 'video' && selected.kind === 'video') return s.videoId === selected.videoId;
    if (s.kind === 'playlist' && selected.kind === 'playlist') return s.playlistId === selected.playlistId;
    return false;
  };

  return (
    <div
      style={{
        minHeight: '60vh',
        backgroundColor: brand.backgroundColor,
        display: 'flex',
        flexDirection: 'column',
        fontFamily: brand.bodyFont,
        position: 'relative',
      }}
    >
      {/* Floating close button — no fixed top bar so we don't collide with
          site nav chrome (Aaron 2026-05-04: LIVE badge was overlapping
          Day2026 logo because the site nav is position:fixed). */}
      {onClose && (
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            zIndex: 5,
            background: brand.surfaceColor,
            border: `1px solid ${brand.textColor}33`,
            color: brand.textColor,
            padding: '6px 14px',
            borderRadius: 6,
            cursor: 'pointer',
            fontSize: 13,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}
        >
          Close
        </button>
      )}

      {/* Player */}
      <div
        style={{
          flex: '0 0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: isMobile ? 12 : 20,
          backgroundColor: brand.backgroundColor,
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 1100,
            aspectRatio: '16/9',
            backgroundColor: brand.surfaceColor,
            borderRadius: 12,
            overflow: 'hidden',
            boxShadow: `0 0 60px ${brand.primaryColor}33`,
            border: `1px solid ${brand.primaryColor}44`,
          }}
        >
          {iframeSrc ? (
            <iframe
              key={iframeSrc}
              src={iframeSrc}
              width="100%"
              height="100%"
              style={{ border: 'none', display: 'block' }}
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
              title="Music video player"
            />
          ) : (
            <div
              style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: brand.textColor + '88',
                fontSize: 14,
              }}
            >
              No videos available yet — check back soon.
            </div>
          )}
        </div>
      </div>

      {/* Selection grid */}
      <div
        style={{
          flex: 1,
          padding: isMobile ? '0 12px 24px' : '0 24px 32px',
          backgroundColor: brand.backgroundColor,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            color: brand.primaryColor,
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: 1.5,
            textTransform: 'uppercase',
            marginBottom: 14,
            paddingTop: 8,
          }}
        >
          <IconTV size={18} color={brand.primaryColor} />
          <span>Music Video Channel</span>
          <span style={{ color: brand.textColor + '88', fontWeight: 400, letterSpacing: 0 }}>
            {videos.length > 0 ? `· ${videos.length} videos · click to play` : '· full playlist below'}
          </span>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile
              ? 'repeat(auto-fill, minmax(140px, 1fr))'
              : 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: isMobile ? 10 : 14,
          }}
        >
          {videos.map((v: ChannelVideo) => {
            const sel: Selection = { kind: 'video', videoId: v.id, title: v.title };
            const active = isActive(sel);
            const thumbUrl = v.thumbnail_url || `https://i.ytimg.com/vi/${v.id}/mqdefault.jpg`;
            return (
              <button
                key={v.id}
                onClick={() => setSelected(sel)}
                style={{
                  cursor: 'pointer',
                  background: brand.surfaceColor,
                  border: active ? `2px solid ${brand.primaryColor}` : `1px solid ${brand.textColor}1A`,
                  borderRadius: 10,
                  overflow: 'hidden',
                  padding: 0,
                  textAlign: 'left',
                  fontFamily: brand.bodyFont,
                  transition: 'transform 0.15s ease, border-color 0.15s ease',
                  transform: active ? 'translateY(-2px)' : 'translateY(0)',
                  boxShadow: active ? `0 6px 20px ${brand.primaryColor}44` : 'none',
                }}
                aria-label={`Play "${v.title}"`}
              >
                <div
                  style={{
                    aspectRatio: '16/9',
                    width: '100%',
                    backgroundImage: `url(${thumbUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundColor: brand.primaryColor + '22',
                  }}
                />
                <div
                  style={{
                    padding: '8px 10px 10px',
                    color: brand.textColor,
                    fontSize: 13,
                    fontWeight: 600,
                    lineHeight: 1.3,
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {v.title}
                </div>
              </button>
            );
          })}

          {/* Play All — full YouTube playlist */}
          {playlistId && (() => {
            const sel: Selection = { kind: 'playlist', playlistId };
            const active = isActive(sel);
            return (
              <button
                key="__playlist__"
                onClick={() => setSelected(sel)}
                style={{
                  cursor: 'pointer',
                  background: active ? brand.primaryColor : brand.surfaceColor,
                  border: active ? `2px solid ${brand.primaryColor}` : `1px solid ${brand.primaryColor}66`,
                  borderRadius: 10,
                  overflow: 'hidden',
                  padding: 0,
                  textAlign: 'center',
                  fontFamily: brand.bodyFont,
                  transition: 'transform 0.15s ease',
                  transform: active ? 'translateY(-2px)' : 'translateY(0)',
                  boxShadow: active ? `0 6px 20px ${brand.primaryColor}66` : 'none',
                  display: 'flex',
                  flexDirection: 'column',
                }}
                aria-label="Play full music video playlist"
              >
                <div
                  style={{
                    aspectRatio: '16/9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: active ? brand.backgroundColor : brand.primaryColor,
                    fontSize: 36,
                  }}
                >
                  <IconTV size={48} color={active ? brand.backgroundColor : brand.primaryColor} />
                </div>
                <div
                  style={{
                    padding: '8px 10px 12px',
                    color: active ? brand.backgroundColor : brand.textColor,
                    fontSize: 13,
                    fontWeight: 700,
                    letterSpacing: 0.5,
                  }}
                >
                  PLAY ALL
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 400,
                      opacity: 0.8,
                      marginTop: 2,
                    }}
                  >
                    Full playlist
                  </div>
                </div>
              </button>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

// ─── Supabase Helpers (self-contained, no external auth import) ─────────────

const ECOSYSTEM_SUPABASE_URL = 'https://uefznzzkrzqxgxxwslox.supabase.co';

// Lazy-loaded Supabase client for ratings/comments
let _sbClient: any = null;
// Public anon key for the ecosystem (FreedomForge) Supabase project where
// song_ratings + song_rating_stats + song_comments live. Anon keys are
// public by design (Supabase docs); embedding it in canonical removes the
// per-site env wiring that was getting the WRONG key (each site's own
// project anon key) and producing 401s on every rating read.
const ECOSYSTEM_PROJECT_REF = 'uefznzzkrzqxgxxwslox';
const ECOSYSTEM_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlZnpuenprcnpxeGd4eHdzbG94Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyNDIzODQsImV4cCI6MjA3MTgxODM4NH0.YmwwuEhG7Siv8zyL9XFjthNuqJrST3C4hs3qESb-grM';

function pickEcosystemKey(maybeKey?: string): string {
  // Validate that any caller-supplied key actually points at the ecosystem
  // project. Sites previously passed VITE_SUPABASE_ANON_KEY which is their
  // own project's key and produces 401 against the ecosystem URL.
  if (!maybeKey) return ECOSYSTEM_SUPABASE_ANON_KEY;
  try {
    const payload = JSON.parse(
      atob(maybeKey.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))
    );
    if (payload?.ref === ECOSYSTEM_PROJECT_REF) return maybeKey;
  } catch {}
  return ECOSYSTEM_SUPABASE_ANON_KEY;
}

function getMusicSupabase(anonKey?: string): any {
  if (_sbClient) return _sbClient;
  const key = pickEcosystemKey(
    anonKey || (typeof window !== 'undefined' && (window as any).__ECOSYSTEM_ANON_KEY__) || undefined
  );
  try {
    const g = typeof globalThis !== 'undefined' ? globalThis : window;
    if ((g as any).__supabaseCreateClient__) {
      _sbClient = (g as any).__supabaseCreateClient__(ECOSYSTEM_SUPABASE_URL, key);
      return _sbClient;
    }
  } catch {}
  return null;
}

// Initialize Supabase from external createClient. anonKey is optional —
// canonical will substitute the ecosystem anon key if the supplied one
// doesn't match the ecosystem project ref.
export function initMusicSupabase(createClientFn: any, anonKey?: string) {
  if (_sbClient) return _sbClient;
  const key = pickEcosystemKey(anonKey);
  _sbClient = createClientFn(ECOSYSTEM_SUPABASE_URL, key, {
    auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: true },
  });
  return _sbClient;
}

// Get current auth user from the shared supabase client
function useMusicAuth() {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);

  useEffect(() => {
    const sb = getMusicSupabase();
    if (!sb) return;
    sb.auth.getUser().then(({ data }: any) => {
      if (data?.user) setUser({ id: data.user.id, email: data.user.email });
    });
    const { data: { subscription } } = sb.auth.onAuthStateChange((_: any, session: any) => {
      if (session?.user) setUser({ id: session.user.id, email: session.user.email });
      else setUser(null);
    });
    return () => subscription?.unsubscribe();
  }, []);

  return user;
}

// Magic-link sign-in to the ECOSYSTEM Supabase project. Each site has its
// own per-site Supabase auth (TADS, OwnNothing, etc.), but the music
// player's ratings + comments live in the shared ecosystem project so
// voting/commenting from any site is collectively saved + visible across
// the ecosystem. This sign-in lands the user as authenticated on that
// shared project regardless of which site they're on.
async function signInToEcosystem(email: string): Promise<{ ok: boolean; error?: string }> {
  const sb = getMusicSupabase();
  if (!sb) return { ok: false, error: 'auth client not ready' };
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: 'enter a valid email' };
  }
  const { error } = await sb.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: typeof window !== 'undefined' ? window.location.href : undefined,
    },
  });
  if (error) return { ok: false, error: error.message || String(error) };
  return { ok: true };
}

// (signOutFromEcosystem will be wired when a "Log out" surface is added.
// Removed to satisfy strict-TS sites; reintroduce when needed.)

// Inline prompt that appears when an unauthenticated user tries to vote or
// comment. Sends a magic link to the ecosystem project.
function MusicSignInPrompt({ brand, onClose }: { brand: BrandConfig; onClose?: () => void }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const submit = async () => {
    setStatus('sending');
    const r = await signInToEcosystem(email);
    if (r.ok) {
      setStatus('sent');
    } else {
      setStatus('error');
      setErrorMsg(r.error || 'sign-in failed');
    }
  };

  return (
    <div
      style={{
        backgroundColor: brand.surfaceColor,
        border: `1px solid ${brand.primaryColor}66`,
        borderRadius: 8,
        padding: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        maxWidth: 420,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div style={{ fontSize: 13, color: brand.textColor, fontWeight: 600 }}>
        Sign in to vote and comment
      </div>
      <div style={{ fontSize: 11, color: brand.textColor + 'AA' }}>
        Ratings and comments are shared across every site in the ecosystem.
        We'll email a one-tap login link.
      </div>
      {status === 'sent' ? (
        <div style={{ fontSize: 12, color: brand.primaryColor }}>
          Check {email} for the login link. After clicking it, you'll come
          back here logged in.
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', gap: 6 }}>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
              style={{
                flex: 1,
                padding: '6px 10px',
                fontSize: 13,
                border: `1px solid ${brand.textColor + '33'}`,
                borderRadius: 4,
                backgroundColor: brand.backgroundColor,
                color: brand.textColor,
              }}
              disabled={status === 'sending'}
            />
            <button
              onClick={submit}
              disabled={status === 'sending'}
              style={{
                padding: '6px 12px',
                fontSize: 13,
                fontWeight: 700,
                border: 'none',
                borderRadius: 4,
                backgroundColor: brand.primaryColor,
                color: brand.backgroundColor,
                cursor: status === 'sending' ? 'wait' : 'pointer',
              }}
            >
              {status === 'sending' ? 'Sending…' : 'Send link'}
            </button>
          </div>
          {status === 'error' && (
            <div style={{ fontSize: 11, color: '#ff6b6b' }}>{errorMsg}</div>
          )}
        </>
      )}
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: brand.textColor + '66',
            fontSize: 11,
            cursor: 'pointer',
            alignSelf: 'flex-end',
            padding: 0,
          }}
        >
          close
        </button>
      )}
    </div>
  );
}

// ─── Star Rating Icons ─────────────────────────────────────────────────────

function IconStar({ size = 20, filled = false, color = '#D4AF37' }: { size?: number; filled?: boolean; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : 'none'} stroke={color} strokeWidth={1.5}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

function IconComment({ size = 16, color = '#fff' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  );
}

function IconShare({ size = 16, color = '#fff' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" />
    </svg>
  );
}

// ─── Star Rating Widget ────────────────────────────────────────────────────

function StarRating({
  songId,
  brand,
  compact = false,
}: {
  songId: string;
  brand: BrandConfig;
  compact?: boolean;
}) {
  const user = useMusicAuth();
  const [avgRating, setAvgRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [saving, setSaving] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);

  // Load ratings
  useEffect(() => {
    const sb = getMusicSupabase();
    if (!sb) return;

    // Get average
    sb.from('song_rating_stats')
      .select('*')
      .eq('song_id', songId)
      .single()
      .then(({ data }: any) => {
        if (data) {
          setAvgRating(parseFloat(data.avg_rating) || 0);
          setTotalRatings(data.total_ratings || 0);
        }
      });

    // Get user's rating
    if (user) {
      sb.from('song_ratings')
        .select('rating')
        .eq('song_id', songId)
        .eq('user_id', user.id)
        .single()
        .then(({ data }: any) => {
          if (data) setUserRating(data.rating);
        });
    }
  }, [songId, user]);

  const handleRate = async (rating: number) => {
    const sb = getMusicSupabase();
    if (!sb || !user) return;
    setSaving(true);

    const { error } = await sb
      .from('song_ratings')
      .upsert({
        user_id: user.id,
        song_id: songId,
        site_key: brand.siteKey,
        rating,
      }, { onConflict: 'user_id,song_id' });

    if (!error) {
      setUserRating(rating);
      // Re-fetch average
      const { data } = await sb
        .from('song_rating_stats')
        .select('*')
        .eq('song_id', songId)
        .single();
      if (data) {
        setAvgRating(parseFloat(data.avg_rating) || 0);
        setTotalRatings(data.total_ratings || 0);
      }
    }
    setSaving(false);
  };

  const starSize = compact ? 14 : 20;
  const displayRating = hoverRating || userRating || 0;

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: compact ? 4 : 8, flexWrap: 'wrap', position: 'relative' }}>
      <div
        style={{ display: 'flex', gap: 2, cursor: 'pointer', opacity: saving ? 0.5 : 1 }}
        onMouseLeave={() => setHoverRating(0)}
        title={user ? 'Click a star to rate' : 'Sign in to vote'}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            onMouseEnter={() => user && setHoverRating(star)}
            onClick={(e) => {
              e.stopPropagation();
              if (user) {
                handleRate(star);
              } else {
                setShowSignIn(true);
              }
            }}
            style={{ display: 'inline-flex' }}
          >
            <IconStar
              size={starSize}
              filled={star <= displayRating}
              color={star <= displayRating ? brand.primaryColor : brand.textColor + '44'}
            />
          </span>
        ))}
      </div>
      {showSignIn && !user && (
        <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: 6, zIndex: 10 }}>
          <MusicSignInPrompt brand={brand} onClose={() => setShowSignIn(false)} />
        </div>
      )}
      {!compact && totalRatings > 0 && (
        <span style={{ fontSize: 12, color: brand.textColor + '88' }}>
          {avgRating.toFixed(1)} ({totalRatings})
        </span>
      )}
      {compact && totalRatings > 0 && (
        <span style={{ fontSize: 11, color: brand.textColor + '66' }}>
          {avgRating.toFixed(1)}
        </span>
      )}
    </div>
  );
}

// ─── Comment Section ───────────────────────────────────────────────────────

interface SongComment {
  id: string;
  user_id: string;
  song_id: string;
  text: string;
  parent_id: string | null;
  created_at: string;
  display_name?: string;
  avatar_url?: string;
}

function SongCommentSection({
  songId,
  brand,
}: {
  songId: string;
  brand: BrandConfig;
}) {
  const user = useMusicAuth();
  const [comments, setComments] = useState<SongComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);

  // Load comments. We don't join a profiles table here because the ecosystem
  // Supabase project doesn't (yet) have a profiles table with display_name +
  // avatar_url + an FK from song_comments.user_id. Display name falls back
  // to a short hash of user_id; the avatar bubble already renders the first
  // letter as a fallback. Wire a real profiles table later if we want
  // human-readable identities cross-site.
  const loadComments = useCallback(async () => {
    const sb = getMusicSupabase();
    if (!sb) { setLoading(false); return; }

    const { data } = await sb
      .from('song_comments')
      .select('id, user_id, song_id, text, parent_id, created_at')
      .eq('song_id', songId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true });

    if (data) {
      setComments(data.map((c: any) => ({
        ...c,
        display_name: c.user_id ? `User-${String(c.user_id).slice(0, 6)}` : 'Anonymous',
        avatar_url: null,
      })));
    }
    setLoading(false);
  }, [songId]);

  useEffect(() => { loadComments(); }, [loadComments]);

  const postComment = async (text: string, parentId?: string | null) => {
    const sb = getMusicSupabase();
    if (!sb || !user || !text.trim()) return;
    setPosting(true);

    const { error } = await sb.from('song_comments').insert({
      user_id: user.id,
      song_id: songId,
      site_key: brand.siteKey,
      text: text.trim(),
      parent_id: parentId || null,
    });

    if (!error) {
      setNewComment('');
      setReplyTo(null);
      setReplyText('');
      await loadComments();
    }
    setPosting(false);
  };

  const rootComments = comments.filter(c => !c.parent_id);
  const getReplies = (parentId: string) => comments.filter(c => c.parent_id === parentId);

  const formatDate = (d: string) => {
    const date = new Date(d);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  const commentStyle: React.CSSProperties = {
    padding: '12px 0',
    borderBottom: `1px solid ${brand.textColor}11`,
  };

  const avatarStyle: React.CSSProperties = {
    width: 28,
    height: 28,
    borderRadius: '50%',
    backgroundColor: brand.primaryColor + '22',
    flexShrink: 0,
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 8,
    border: `1px solid ${brand.textColor}22`,
    backgroundColor: brand.backgroundColor,
    color: brand.textColor,
    fontSize: 14,
    fontFamily: brand.bodyFont,
    resize: 'none' as const,
  };

  const submitBtnStyle: React.CSSProperties = {
    padding: '8px 16px',
    borderRadius: 8,
    border: 'none',
    backgroundColor: brand.primaryColor,
    color: brand.backgroundColor,
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
    opacity: posting ? 0.5 : 1,
  };

  const renderComment = (comment: SongComment, isReply = false) => (
    <div key={comment.id} style={{ ...commentStyle, paddingLeft: isReply ? 36 : 0 }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        {comment.avatar_url ? (
          <img src={comment.avatar_url} alt="" style={avatarStyle} />
        ) : (
          <div style={{ ...avatarStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: brand.primaryColor }}>
            {(comment.display_name || '?')[0].toUpperCase()}
          </div>
        )}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: brand.textColor }}>
              {comment.display_name || 'Anonymous'}
            </span>
            <span style={{ fontSize: 11, color: brand.textColor + '55' }}>
              {formatDate(comment.created_at)}
            </span>
          </div>
          <div style={{ fontSize: 14, color: brand.textColor + 'DD', lineHeight: 1.5 }}>
            {comment.text}
          </div>
          {!isReply && user && (
            <button
              onClick={(e) => { e.stopPropagation(); setReplyTo(replyTo === comment.id ? null : comment.id); }}
              style={{
                background: 'none',
                border: 'none',
                color: brand.primaryColor,
                cursor: 'pointer',
                fontSize: 12,
                marginTop: 4,
                padding: 0,
              }}
            >
              Reply
            </button>
          )}
          {/* Reply input */}
          {replyTo === comment.id && (
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <input
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply..."
                style={{ ...inputStyle, flex: 1 }}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                  e.stopPropagation();
                  if (e.key === 'Enter') postComment(replyText, comment.id);
                }}
              />
              <button
                onClick={(e) => { e.stopPropagation(); postComment(replyText, comment.id); }}
                style={submitBtnStyle}
              >
                Reply
              </button>
            </div>
          )}
          {/* Nested replies */}
          {getReplies(comment.id).map(reply => renderComment(reply, true))}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ marginTop: 16 }} onClick={(e) => e.stopPropagation()}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <IconComment size={16} color={brand.primaryColor} />
        <span style={{ fontSize: 14, fontWeight: 600, color: brand.textColor }}>
          Comments ({comments.length})
        </span>
      </div>

      {loading ? (
        <div style={{ color: brand.textColor + '44', fontSize: 13, padding: 8 }}>Loading comments...</div>
      ) : (
        <>
          {rootComments.map(c => renderComment(c))}

          {rootComments.length === 0 && (
            <div style={{ color: brand.textColor + '44', fontSize: 13, padding: '8px 0' }}>
              No comments yet. Be the first to share your thoughts.
            </div>
          )}
        </>
      )}

      {/* New comment input */}
      {user ? (
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts on this track..."
            rows={2}
            style={inputStyle}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                postComment(newComment);
              }
            }}
          />
          <button
            onClick={(e) => { e.stopPropagation(); postComment(newComment); }}
            disabled={posting || !newComment.trim()}
            style={{ ...submitBtnStyle, alignSelf: 'flex-end' }}
          >
            Post
          </button>
        </div>
      ) : (
        <div style={{ marginTop: 12 }}>
          {showSignIn ? (
            <MusicSignInPrompt brand={brand} onClose={() => setShowSignIn(false)} />
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); setShowSignIn(true); }}
              style={{
                padding: '8px 14px',
                fontSize: 13,
                fontWeight: 600,
                border: `1px solid ${brand.primaryColor}66`,
                borderRadius: 6,
                backgroundColor: 'transparent',
                color: brand.primaryColor,
                cursor: 'pointer',
              }}
            >
              Sign in to comment
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Comment Count Badge ────────────────────────────────────────────────────

function CommentCountBadge({ songId, brand }: { songId: string; brand: BrandConfig }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const sb = getMusicSupabase();
    if (!sb) return;
    sb.from('song_comment_counts')
      .select('total_comments')
      .eq('song_id', songId)
      .single()
      .then(({ data }: any) => {
        if (data) setCount(data.total_comments || 0);
      });
  }, [songId]);

  if (count === 0) return null;

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 3,
      fontSize: 11,
      color: brand.textColor + '88',
    }}>
      <IconComment size={12} color={brand.textColor + '66'} />
      {count}
    </span>
  );
}

// ─── Music Detail Panel ─────────────────────────────────────────────────────

function MusicDetailPanel({
  song,
  brand,
  onClose,
}: {
  song: Song;
  brand: BrandConfig;
  onClose: () => void;
}) {
  const { currentSong, isPlaying, playSongById, pause } = useMusicContext();
  const isMobile = useIsMobile();
  const isCurrent = currentSong?.id === song.id;
  const isThisPlaying = isCurrent && isPlaying;
  const [copied, setCopied] = useState(false);

  const handlePlay = () => {
    if (isThisPlaying) pause();
    else playSongById(song.id);
  };

  const handleShare = () => {
    const url = `${window.location.origin}/music?song=${song.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        backgroundColor: 'rgba(0,0,0,0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isMobile ? 16 : 32,
        fontFamily: brand.bodyFont,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: brand.surfaceColor,
          borderRadius: 16,
          maxWidth: 640,
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          border: `1px solid ${brand.primaryColor}33`,
          boxShadow: `0 0 60px ${brand.primaryColor}22`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with album art */}
        <div style={{ position: 'relative' }}>
          <div style={{
            width: '100%',
            aspectRatio: '16/9',
            backgroundColor: brand.primaryColor + '11',
            overflow: 'hidden',
            borderRadius: '16px 16px 0 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {song.image_url ? (
              <img src={song.image_url} alt={song.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <IconMusic size={64} color={brand.primaryColor + '44'} />
            )}
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              background: 'rgba(0,0,0,0.6)',
              border: 'none',
              borderRadius: '50%',
              width: 36,
              height: 36,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IconClose size={18} color="#fff" />
          </button>

          {/* Play button overlay */}
          <button
            onClick={handlePlay}
            style={{
              position: 'absolute',
              bottom: -24,
              right: 24,
              width: 56,
              height: 56,
              borderRadius: '50%',
              backgroundColor: brand.primaryColor,
              border: `3px solid ${brand.surfaceColor}`,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
            }}
          >
            {isThisPlaying ? (
              <IconPause size={24} color={brand.backgroundColor} />
            ) : (
              <IconPlay size={24} color={brand.backgroundColor} />
            )}
          </button>
        </div>

        {/* Song info */}
        <div style={{ padding: '32px 24px 24px' }}>
          <h2 style={{
            fontFamily: brand.headingFont,
            fontSize: 24,
            fontWeight: 800,
            color: brand.textColor,
            margin: '0 0 4px',
          }}>
            {song.title}
          </h2>
          <p style={{ color: brand.textColor + 'AA', fontSize: 15, margin: '0 0 16px' }}>
            {song.artist} {song.duration && <span style={{ color: brand.textColor + '55' }}>/ {song.duration}</span>}
          </p>

          {/* Tags */}
          {song.tags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 16 }}>
              {song.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontSize: 11,
                    padding: '3px 10px',
                    borderRadius: 12,
                    backgroundColor: brand.primaryColor + '1A',
                    color: brand.primaryColor,
                    fontWeight: 500,
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Star Rating */}
          <div style={{ marginBottom: 16 }}>
            <StarRating songId={song.id} brand={brand} />
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
            {song.youtube_url && (
              <a
                href={song.youtube_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 16px',
                  borderRadius: 8,
                  backgroundColor: '#FF0000',
                  color: '#fff',
                  textDecoration: 'none',
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                <IconTV size={16} color="#fff" /> Watch Video
              </a>
            )}
            {song.suno_url && (
              <a
                href={song.suno_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 16px',
                  borderRadius: 8,
                  border: `1px solid ${brand.textColor}33`,
                  color: brand.textColor + 'CC',
                  textDecoration: 'none',
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                Suno <IconExternalLink size={12} color={brand.textColor + 'CC'} />
              </a>
            )}
            <button
              onClick={handleShare}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                borderRadius: 8,
                border: `1px solid ${brand.textColor}33`,
                backgroundColor: 'transparent',
                color: brand.textColor + 'CC',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              <IconShare size={14} color={brand.textColor + 'CC'} />
              {copied ? 'Copied!' : 'Share'}
            </button>
          </div>

          {/* Divider */}
          <div style={{ height: 1, backgroundColor: brand.textColor + '11', margin: '0 0 16px' }} />

          {/* Comments */}
          <SongCommentSection songId={song.id} brand={brand} />
        </div>
      </div>
    </div>
  );
}

// ─── Default export for convenience ──────────────────────────────────────────

export default {
  MusicProvider,
  MusicBar,
  MusicPage,
  MusicVideoChannel,
  MusicDetailPanel,
  StarRating,
  SongCommentSection,
  brandConfigs,
  initMusicSupabase,
};
