/**
 * AuthComponents - Shared auth UI for Aaron Day's 7-site ecosystem
 *
 * Single file, ALL INLINE STYLES (no Tailwind), zero external deps beyond React.
 * Uses BrandConfig for site-specific theming (same pattern as MusicPlayer.tsx).
 *
 * Components:
 *   - AuthPage: Full login/signup page (magic link + password)
 *   - AuthGate: Wraps content requiring login
 *   - UserMenu: Nav dropdown (avatar + name + logout)
 *   - SettingsPage: /settings profile management
 *   - VoteButtons: Upvote/downvote widget
 *   - CommentSection: Comment list + add form
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { EcosystemAuth, Comment, VoteSummary } from '../hooks/useEcosystemAuth';

// ─── Types ────────────────────────────────────────────────────────────────────

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
}

// ─── Brand Presets ────────────────────────────────────────────────────────────

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
  },
  day2026: {
    siteName: 'Day 2026',
    siteKey: 'day2026',
    primaryColor: '#D4AF37',
    accentColor: '#FAF3E0',
    backgroundColor: '#0A0A0A',
    surfaceColor: '#1A1A1A',
    textColor: '#FAF3E0',
    headingFont: 'Playfair Display, serif',
    bodyFont: 'Inter, sans-serif',
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
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

// ─── Shared Styles ────────────────────────────────────────────────────────────

function inputStyle(brand: BrandConfig): React.CSSProperties {
  return {
    width: '100%',
    padding: '12px 16px',
    fontSize: '16px',
    fontFamily: brand.bodyFont,
    color: brand.textColor,
    backgroundColor: hexToRgba(brand.surfaceColor, 0.6),
    border: `1px solid ${hexToRgba(brand.textColor, 0.2)}`,
    borderRadius: '8px',
    outline: 'none',
    boxSizing: 'border-box' as const,
    minHeight: '44px',
    transition: 'border-color 0.2s',
  };
}

function buttonStyle(brand: BrandConfig, variant: 'primary' | 'secondary' | 'ghost' = 'primary'): React.CSSProperties {
  const base: React.CSSProperties = {
    padding: '12px 24px',
    fontSize: '16px',
    fontFamily: brand.bodyFont,
    fontWeight: 600,
    borderRadius: '8px',
    cursor: 'pointer',
    minHeight: '44px',
    minWidth: '44px',
    border: 'none',
    transition: 'all 0.2s',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    boxSizing: 'border-box' as const,
  };

  if (variant === 'primary') {
    return {
      ...base,
      backgroundColor: brand.primaryColor,
      color: brand.backgroundColor,
    };
  }
  if (variant === 'secondary') {
    return {
      ...base,
      backgroundColor: 'transparent',
      color: brand.primaryColor,
      border: `1px solid ${brand.primaryColor}`,
    };
  }
  // ghost
  return {
    ...base,
    backgroundColor: 'transparent',
    color: hexToRgba(brand.textColor, 0.7),
    padding: '8px 12px',
  };
}

// ─── AuthPage ─────────────────────────────────────────────────────────────────

type AuthView = 'login' | 'signup' | 'forgot';

interface AuthPageProps {
  auth: EcosystemAuth;
  brand: BrandConfig;
  onSuccess?: () => void;
}

export function AuthPage({ auth, brand, onSuccess }: AuthPageProps) {
  const [view, setView] = useState<AuthView>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // If user signs in, call onSuccess
  useEffect(() => {
    if (auth.user && onSuccess) onSuccess();
  }, [auth.user, onSuccess]);

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setError('Email is required'); return; }
    setSubmitting(true);
    setError('');
    setSuccess('');
    const result = await auth.signInWithMagicLink(email.trim());
    setSubmitting(false);
    if (result.error) {
      setError(result.error);
    } else {
      setSuccess('Check your email — we sent you a sign-in link. Click it to get in.');
    }
  };

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setError('Email is required'); return; }
    if (!password) { setError('Password is required'); return; }
    setSubmitting(true);
    setError('');
    setSuccess('');
    const result = await auth.signInWithPassword(email.trim(), password);
    setSubmitting(false);
    if (result.error) setError(result.error);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setError('Email is required'); return; }
    if (!password || password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setSubmitting(true);
    setError('');
    setSuccess('');
    const result = await auth.signUp(email.trim(), password, displayName.trim() || undefined);
    setSubmitting(false);
    if (result.error) {
      setError(result.error);
    } else {
      setSuccess('Account created! Check your email to confirm.');
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setError('Email is required'); return; }
    setSubmitting(true);
    setError('');
    setSuccess('');
    const result = await auth.resetPassword(email.trim());
    setSubmitting(false);
    if (result.error) {
      setError(result.error);
    } else {
      setSuccess('Password reset link sent to your email.');
    }
  };

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: brand.backgroundColor,
    padding: '20px',
    fontFamily: brand.bodyFont,
  };

  const cardStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: '440px',
    backgroundColor: brand.surfaceColor,
    borderRadius: '16px',
    padding: '40px 32px',
    boxShadow: `0 8px 32px ${hexToRgba(brand.primaryColor, 0.1)}`,
    border: `1px solid ${hexToRgba(brand.textColor, 0.1)}`,
  };

  const titleStyle: React.CSSProperties = {
    fontFamily: brand.headingFont,
    fontSize: '28px',
    fontWeight: 700,
    color: brand.primaryColor,
    textAlign: 'center' as const,
    margin: '0 0 8px',
  };

  const subtitleStyle: React.CSSProperties = {
    fontFamily: brand.bodyFont,
    fontSize: '14px',
    color: hexToRgba(brand.textColor, 0.6),
    textAlign: 'center' as const,
    margin: '0 0 32px',
  };

  const dividerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    margin: '24px 0',
    color: hexToRgba(brand.textColor, 0.4),
    fontSize: '13px',
  };

  const lineStyle: React.CSSProperties = {
    flex: 1,
    height: '1px',
    backgroundColor: hexToRgba(brand.textColor, 0.15),
  };

  const linkStyle: React.CSSProperties = {
    color: brand.primaryColor,
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    padding: 0,
    fontSize: '14px',
    fontFamily: brand.bodyFont,
    textDecoration: 'underline',
    minHeight: '44px',
    display: 'inline-flex',
    alignItems: 'center',
  };

  const errorStyle: React.CSSProperties = {
    backgroundColor: hexToRgba('#FF0040', 0.1),
    color: '#FF4060',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '14px',
    marginBottom: '16px',
    border: '1px solid rgba(255,0,64,0.2)',
  };

  const successStyle: React.CSSProperties = {
    backgroundColor: hexToRgba('#00CC6F', 0.1),
    color: '#00CC6F',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '14px',
    marginBottom: '16px',
    border: '1px solid rgba(0,204,111,0.2)',
  };

  const fieldGap: React.CSSProperties = { marginBottom: '12px' };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '13px',
    color: hexToRgba(brand.textColor, 0.6),
    marginBottom: '4px',
    fontFamily: brand.bodyFont,
  };

  if (view === 'forgot') {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <h1 style={titleStyle}>{brand.siteName}</h1>
          <p style={subtitleStyle}>Reset your password</p>
          {error && <div style={errorStyle}>{error}</div>}
          {success && <div style={successStyle}>{success}</div>}
          <form onSubmit={handleForgot}>
            <div style={fieldGap}>
              <label style={labelStyle} htmlFor="eco-forgot-email">Email</label>
              <input
                id="eco-forgot-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={inputStyle(brand)}
                autoComplete="email"
                required
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              style={{ ...buttonStyle(brand), width: '100%', opacity: submitting ? 0.6 : 1 }}
            >
              {submitting ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <button style={linkStyle} onClick={() => { setView('login'); setError(''); setSuccess(''); }}>
              Back to sign in
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'signup') {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <h1 style={titleStyle}>{brand.siteName}</h1>
          <p style={subtitleStyle}>Create your account</p>
          {error && <div style={errorStyle}>{error}</div>}
          {success && <div style={successStyle}>{success}</div>}
          <form onSubmit={handleSignUp}>
            <div style={fieldGap}>
              <label style={labelStyle} htmlFor="eco-signup-name">Display Name (optional)</label>
              <input
                id="eco-signup-name"
                type="text"
                placeholder="Your name"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                style={inputStyle(brand)}
                autoComplete="name"
              />
            </div>
            <div style={fieldGap}>
              <label style={labelStyle} htmlFor="eco-signup-email">Email</label>
              <input
                id="eco-signup-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={inputStyle(brand)}
                autoComplete="email"
                required
              />
            </div>
            <div style={fieldGap}>
              <label style={labelStyle} htmlFor="eco-signup-password">Password</label>
              <input
                id="eco-signup-password"
                type="password"
                placeholder="Min 6 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={inputStyle(brand)}
                autoComplete="new-password"
                required
                minLength={6}
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              style={{ ...buttonStyle(brand), width: '100%', opacity: submitting ? 0.6 : 1 }}
            >
              {submitting ? 'Creating...' : 'Create Account'}
            </button>
          </form>
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <span style={{ color: hexToRgba(brand.textColor, 0.5), fontSize: '14px' }}>
              Already have an account?{' '}
            </span>
            <button style={linkStyle} onClick={() => { setView('login'); setError(''); setSuccess(''); }}>
              Sign in
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Login view (default) — shows BOTH magic link and password
  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>{brand.siteName}</h1>
        <p style={subtitleStyle}>Sign in to your account</p>

        {error && <div style={errorStyle}>{error}</div>}
        {success && <div style={successStyle}>{success}</div>}

        {/* Magic Link Section */}
        <form onSubmit={handleMagicLink}>
          <div style={{
            fontSize: '13px',
            fontWeight: 600,
            color: hexToRgba(brand.textColor, 0.5),
            textTransform: 'uppercase' as const,
            letterSpacing: '0.5px',
            marginBottom: '12px',
          }}>
            Sign In With Email
          </div>
          <div style={fieldGap}>
            <label style={labelStyle} htmlFor="eco-magic-email">Email</label>
            <input
              id="eco-magic-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={inputStyle(brand)}
              autoComplete="email"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            style={{ ...buttonStyle(brand), width: '100%', opacity: submitting ? 0.6 : 1 }}
          >
            {submitting ? 'Sending...' : 'Email Me a Sign-In Link'}
          </button>
        </form>

        {/* Divider */}
        <div style={dividerStyle}>
          <div style={lineStyle} />
          <span>or sign in with password</span>
          <div style={lineStyle} />
        </div>

        {/* Password Section */}
        <form onSubmit={handlePassword}>
          <div style={fieldGap}>
            <label style={labelStyle} htmlFor="eco-pass-email">Email</label>
            <input
              id="eco-pass-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={inputStyle(brand)}
              autoComplete="email"
            />
          </div>
          <div style={fieldGap}>
            <label style={labelStyle} htmlFor="eco-pass-password">Password</label>
            <input
              id="eco-pass-password"
              type="password"
              placeholder="Your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={inputStyle(brand)}
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            style={{ ...buttonStyle(brand, 'secondary'), width: '100%', opacity: submitting ? 0.6 : 1 }}
          >
            {submitting ? 'Signing in...' : 'Sign In with Password'}
          </button>
        </form>

        {/* Footer links */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', flexWrap: 'wrap' as const, gap: '8px' }}>
          <button style={linkStyle} onClick={() => { setView('forgot'); setError(''); setSuccess(''); }}>
            Forgot password?
          </button>
          <button style={linkStyle} onClick={() => { setView('signup'); setError(''); setSuccess(''); }}>
            Create account
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── AuthGate ─────────────────────────────────────────────────────────────────

interface AuthGateProps {
  auth: EcosystemAuth;
  brand: BrandConfig;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AuthGate({ auth, brand, children, fallback }: AuthGateProps) {
  if (!auth.initialized || auth.loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '200px',
        color: hexToRgba(brand.textColor, 0.5),
        fontFamily: brand.bodyFont,
        fontSize: '16px',
      }}>
        Loading...
      </div>
    );
  }

  if (!auth.user) {
    return fallback ? <>{fallback}</> : <AuthPage auth={auth} brand={brand} />;
  }

  return <>{children}</>;
}

// ─── UserMenu ─────────────────────────────────────────────────────────────────

interface UserMenuProps {
  auth: EcosystemAuth;
  brand: BrandConfig;
  onSettingsClick?: () => void;
}

export function UserMenu({ auth, brand, onSettingsClick }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!auth.user) return null;

  const displayName = auth.profile?.display_name || auth.user.email?.split('@')[0] || 'User';
  const avatarUrl = auth.profile?.avatar_url;

  return (
    <div ref={menuRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 12px',
          borderRadius: '24px',
          border: `1px solid ${hexToRgba(brand.textColor, 0.15)}`,
          backgroundColor: hexToRgba(brand.surfaceColor, 0.6),
          cursor: 'pointer',
          minHeight: '44px',
          minWidth: '44px',
          fontFamily: brand.bodyFont,
          color: brand.textColor,
          fontSize: '14px',
          transition: 'border-color 0.2s',
        }}
        aria-label="User menu"
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt=""
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              objectFit: 'cover' as const,
            }}
          />
        ) : (
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            backgroundColor: brand.primaryColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            fontWeight: 700,
            color: brand.backgroundColor,
          }}>
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}
        <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>
          {displayName}
        </span>
        <span style={{ fontSize: '10px', opacity: 0.5 }}>{open ? '\u25B2' : '\u25BC'}</span>
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          right: 0,
          minWidth: '180px',
          backgroundColor: brand.surfaceColor,
          border: `1px solid ${hexToRgba(brand.textColor, 0.15)}`,
          borderRadius: '12px',
          padding: '8px 0',
          boxShadow: `0 8px 24px rgba(0,0,0,0.4)`,
          zIndex: 9999,
        }}>
          <div style={{
            padding: '12px 16px 8px',
            borderBottom: `1px solid ${hexToRgba(brand.textColor, 0.1)}`,
            marginBottom: '4px',
          }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: brand.textColor, fontFamily: brand.bodyFont }}>
              {displayName}
            </div>
            <div style={{ fontSize: '12px', color: hexToRgba(brand.textColor, 0.5), marginTop: '2px', fontFamily: brand.bodyFont }}>
              {auth.user.email}
            </div>
            {auth.isAdmin && (
              <div style={{
                display: 'inline-block',
                marginTop: '4px',
                padding: '2px 8px',
                borderRadius: '4px',
                backgroundColor: hexToRgba(brand.primaryColor, 0.15),
                color: brand.primaryColor,
                fontSize: '11px',
                fontWeight: 600,
              }}>
                Admin
              </div>
            )}
          </div>

          {onSettingsClick && (
            <button
              onClick={() => { setOpen(false); onSettingsClick(); }}
              style={{
                width: '100%',
                padding: '10px 16px',
                textAlign: 'left' as const,
                background: 'none',
                border: 'none',
                color: brand.textColor,
                fontSize: '14px',
                fontFamily: brand.bodyFont,
                cursor: 'pointer',
                minHeight: '44px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              Settings
            </button>
          )}

          <button
            onClick={() => { setOpen(false); auth.signOut(); }}
            style={{
              width: '100%',
              padding: '10px 16px',
              textAlign: 'left' as const,
              background: 'none',
              border: 'none',
              color: '#FF4060',
              fontSize: '14px',
              fontFamily: brand.bodyFont,
              cursor: 'pointer',
              minHeight: '44px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}

// ─── SettingsPage ─────────────────────────────────────────────────────────────

interface SettingsPageProps {
  auth: EcosystemAuth;
  brand: BrandConfig;
}

export function SettingsPage({ auth, brand }: SettingsPageProps) {
  const [displayName, setDisplayName] = useState(auth.profile?.display_name || '');
  const [avatarUrl, setAvatarUrl] = useState(auth.profile?.avatar_url || '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (auth.profile) {
      setDisplayName(auth.profile.display_name || '');
      setAvatarUrl(auth.profile.avatar_url || '');
    }
  }, [auth.profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    const result = await auth.updateProfile({
      display_name: displayName.trim() || null,
      avatar_url: avatarUrl.trim() || null,
    });
    setSaving(false);
    if (result.error) {
      setMessage({ type: 'error', text: result.error });
    } else {
      setMessage({ type: 'success', text: 'Profile updated.' });
    }
  };

  if (!auth.user) {
    return <AuthPage auth={auth} brand={brand} />;
  }

  const containerStyle: React.CSSProperties = {
    maxWidth: '520px',
    margin: '40px auto',
    padding: '0 20px',
    fontFamily: brand.bodyFont,
    color: brand.textColor,
  };

  const sectionStyle: React.CSSProperties = {
    backgroundColor: brand.surfaceColor,
    borderRadius: '12px',
    padding: '28px 24px',
    marginBottom: '20px',
    border: `1px solid ${hexToRgba(brand.textColor, 0.1)}`,
  };

  const sectionTitle: React.CSSProperties = {
    fontFamily: brand.headingFont,
    fontSize: '20px',
    fontWeight: 700,
    color: brand.primaryColor,
    margin: '0 0 20px',
  };

  const fieldGap: React.CSSProperties = { marginBottom: '16px' };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '13px',
    color: hexToRgba(brand.textColor, 0.6),
    marginBottom: '4px',
    fontFamily: brand.bodyFont,
  };

  return (
    <div style={containerStyle}>
      <h1 style={{
        fontFamily: brand.headingFont,
        fontSize: '32px',
        fontWeight: 700,
        color: brand.textColor,
        marginBottom: '28px',
      }}>
        Account Settings
      </h1>

      {/* Avatar preview */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="Avatar preview"
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              objectFit: 'cover' as const,
              border: `3px solid ${brand.primaryColor}`,
            }}
          />
        ) : (
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: brand.primaryColor,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
            fontWeight: 700,
            color: brand.backgroundColor,
          }}>
            {(displayName || auth.user.email || 'U').charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {message && (
        <div style={{
          padding: '10px 14px',
          borderRadius: '8px',
          fontSize: '14px',
          marginBottom: '16px',
          backgroundColor: message.type === 'success'
            ? hexToRgba('#00CC6F', 0.1)
            : hexToRgba('#FF0040', 0.1),
          color: message.type === 'success' ? '#00CC6F' : '#FF4060',
          border: `1px solid ${message.type === 'success' ? 'rgba(0,204,111,0.2)' : 'rgba(255,0,64,0.2)'}`,
        }}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSave}>
        <div style={sectionStyle}>
          <h2 style={sectionTitle}>Profile</h2>

          <div style={fieldGap}>
            <label style={labelStyle} htmlFor="eco-settings-name">Display Name</label>
            <input
              id="eco-settings-name"
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              style={inputStyle(brand)}
              placeholder="Your display name"
              autoComplete="name"
            />
          </div>

          <div style={fieldGap}>
            <label style={labelStyle} htmlFor="eco-settings-avatar">Avatar URL</label>
            <input
              id="eco-settings-avatar"
              type="url"
              value={avatarUrl}
              onChange={e => setAvatarUrl(e.target.value)}
              style={inputStyle(brand)}
              placeholder="https://example.com/avatar.jpg"
            />
            <div style={{ fontSize: '12px', color: hexToRgba(brand.textColor, 0.4), marginTop: '4px' }}>
              Leave blank to use your Gravatar.
            </div>
          </div>

          <div style={fieldGap}>
            <label style={labelStyle}>Email</label>
            <div style={{
              ...inputStyle(brand),
              opacity: 0.6,
              cursor: 'not-allowed',
            }}>
              {auth.user.email}
            </div>
            <div style={{ fontSize: '12px', color: hexToRgba(brand.textColor, 0.4), marginTop: '4px' }}>
              Email cannot be changed here.
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          style={{ ...buttonStyle(brand), width: '100%', opacity: saving ? 0.6 : 1 }}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>

      <div style={{ marginTop: '32px' }}>
        <div style={sectionStyle}>
          <h2 style={{ ...sectionTitle, color: '#FF4060' }}>Danger Zone</h2>
          <button
            onClick={() => auth.signOut()}
            style={{
              ...buttonStyle(brand, 'secondary'),
              width: '100%',
              color: '#FF4060',
              borderColor: '#FF4060',
            }}
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── VoteButtons ──────────────────────────────────────────────────────────────

interface VoteButtonsProps {
  auth: EcosystemAuth;
  brand: BrandConfig;
  contentType: string;
  contentId: string;
  /** Compact mode for inline use */
  compact?: boolean;
}

export function VoteButtons({ auth, brand, contentType, contentId, compact }: VoteButtonsProps) {
  const [votes, setVotes] = useState<VoteSummary>({ up: 0, down: 0, userVote: null });
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const data = await auth.getVotes(contentType, contentId);
    setVotes(data);
    setLoading(false);
  }, [auth, contentType, contentId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleVote = async (value: 1 | -1) => {
    if (!auth.user) return;
    if (votes.userVote === value) {
      // Toggle off
      await auth.removeVote(contentType, contentId);
    } else {
      await auth.vote(contentType, contentId, value);
    }
    await refresh();
  };

  const size = compact ? '32px' : '40px';
  const fontSize = compact ? '14px' : '18px';
  const countSize = compact ? '13px' : '15px';

  const arrowBtn = (direction: 'up' | 'down'): React.CSSProperties => {
    const value = direction === 'up' ? 1 : -1;
    const isActive = votes.userVote === value;
    const activeColor = direction === 'up' ? '#00CC6F' : '#FF4060';
    return {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: size,
      height: size,
      minWidth: '44px',
      minHeight: '44px',
      border: 'none',
      borderRadius: '8px',
      backgroundColor: isActive ? hexToRgba(activeColor, 0.15) : 'transparent',
      color: isActive ? activeColor : hexToRgba(brand.textColor, 0.5),
      cursor: auth.user ? 'pointer' : 'default',
      fontSize,
      fontWeight: 700,
      transition: 'all 0.15s',
      opacity: auth.user ? 1 : 0.4,
      padding: 0,
    };
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', opacity: 0.3 }}>
        <span style={{ fontSize: countSize, color: brand.textColor }}>...</span>
      </div>
    );
  }

  const net = votes.up - votes.down;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
      <button
        onClick={() => handleVote(1)}
        style={arrowBtn('up')}
        title={auth.user ? 'Upvote' : 'Sign in to vote'}
        aria-label="Upvote"
        disabled={!auth.user}
      >
        &#9650;
      </button>
      <span style={{
        fontSize: countSize,
        fontWeight: 700,
        color: net > 0 ? '#00CC6F' : net < 0 ? '#FF4060' : hexToRgba(brand.textColor, 0.5),
        minWidth: '24px',
        textAlign: 'center' as const,
        fontFamily: brand.bodyFont,
        userSelect: 'none' as const,
      }}>
        {net}
      </span>
      <button
        onClick={() => handleVote(-1)}
        style={arrowBtn('down')}
        title={auth.user ? 'Downvote' : 'Sign in to vote'}
        aria-label="Downvote"
        disabled={!auth.user}
      >
        &#9660;
      </button>
    </div>
  );
}

// ─── CommentSection ───────────────────────────────────────────────────────────

interface CommentSectionProps {
  auth: EcosystemAuth;
  brand: BrandConfig;
  contentType: string;
  contentId: string;
}

export function CommentSection({ auth, brand, contentType, contentId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    const data = await auth.getComments(contentType, contentId);
    setComments(data);
    setLoading(false);
  }, [auth, contentType, contentId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    setError('');
    const result = await auth.addComment(contentType, contentId, text);
    setSubmitting(false);
    if (result.error) {
      setError(result.error);
    } else {
      setText('');
      await refresh();
    }
  };

  const containerStyle: React.CSSProperties = {
    fontFamily: brand.bodyFont,
    color: brand.textColor,
  };

  const headerStyle: React.CSSProperties = {
    fontFamily: brand.headingFont,
    fontSize: '18px',
    fontWeight: 700,
    color: brand.textColor,
    margin: '0 0 16px',
  };

  const commentCard: React.CSSProperties = {
    display: 'flex',
    gap: '12px',
    padding: '14px 0',
    borderBottom: `1px solid ${hexToRgba(brand.textColor, 0.08)}`,
  };

  const avatarStyle: React.CSSProperties = {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    objectFit: 'cover' as const,
    flexShrink: 0,
  };

  const avatarPlaceholder = (_name: string): React.CSSProperties => ({
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: brand.primaryColor,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: 700,
    color: brand.backgroundColor,
    flexShrink: 0,
  });

  return (
    <div style={containerStyle}>
      <h3 style={headerStyle}>
        Comments {!loading && comments.length > 0 && `(${comments.length})`}
      </h3>

      {/* Comment form */}
      {auth.user ? (
        <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
          {error && (
            <div style={{
              backgroundColor: hexToRgba('#FF0040', 0.1),
              color: '#FF4060',
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: '13px',
              marginBottom: '8px',
            }}>
              {error}
            </div>
          )}
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Add a comment..."
            maxLength={2000}
            rows={3}
            style={{
              ...inputStyle(brand),
              resize: 'vertical' as const,
              minHeight: '80px',
              marginBottom: '8px',
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: hexToRgba(brand.textColor, 0.4) }}>
              {text.length}/2000
            </span>
            <button
              type="submit"
              disabled={submitting || !text.trim()}
              style={{
                ...buttonStyle(brand),
                opacity: (submitting || !text.trim()) ? 0.5 : 1,
                padding: '8px 20px',
                fontSize: '14px',
              }}
            >
              {submitting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>
      ) : (
        <div style={{
          padding: '16px',
          backgroundColor: hexToRgba(brand.surfaceColor, 0.5),
          borderRadius: '8px',
          marginBottom: '20px',
          fontSize: '14px',
          color: hexToRgba(brand.textColor, 0.6),
          textAlign: 'center' as const,
        }}>
          Sign in to leave a comment.
        </div>
      )}

      {/* Comment list */}
      {loading ? (
        <div style={{ color: hexToRgba(brand.textColor, 0.4), fontSize: '14px', padding: '20px 0' }}>
          Loading comments...
        </div>
      ) : comments.length === 0 ? (
        <div style={{ color: hexToRgba(brand.textColor, 0.4), fontSize: '14px', padding: '20px 0' }}>
          No comments yet. Be the first.
        </div>
      ) : (
        comments.map(comment => (
          <div key={comment.id} style={commentCard}>
            {comment.avatar_url ? (
              <img src={comment.avatar_url} alt="" style={avatarStyle} />
            ) : (
              <div style={avatarPlaceholder(comment.display_name || 'U')}>
                {(comment.display_name || 'U').charAt(0).toUpperCase()}
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontWeight: 600, fontSize: '14px', color: brand.textColor }}>
                  {comment.display_name || 'Anonymous'}
                </span>
                <span style={{ fontSize: '12px', color: hexToRgba(brand.textColor, 0.4) }}>
                  {timeAgo(comment.created_at)}
                </span>
              </div>
              <div style={{
                fontSize: '14px',
                lineHeight: '1.5',
                color: hexToRgba(brand.textColor, 0.85),
                wordBreak: 'break-word' as const,
              }}>
                {comment.text}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
