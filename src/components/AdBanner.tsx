/**
 * AdBanner - Shared React Component for Cross-Site Ad Delivery
 *
 * Usage:
 * ```tsx
 * import { AdBanner } from './shared-components/AdBanner';
 *
 * // In your component:
 * <AdBanner site="freedomforge" zone="FOOTER" />
 * ```
 *
 * Requirements:
 * - Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env
 * - Install: npm install dompurify lucide-react
 * - For TypeScript: npm install @types/dompurify
 */

import React, { useEffect, useState, useCallback } from 'react';
import DOMPurify from 'dompurify';
import * as LucideIcons from 'lucide-react';

// ============================================
// TYPES
// ============================================

type AdFormat = 'image' | 'text_card' | 'rich_card' | 'html';
type CampaignType = 'sponsor' | 'house' | 'affiliate';

interface AdData {
  creative_id: string;
  campaign_id: string;
  campaign_name: string;
  campaign_type: CampaignType;
  format: AdFormat;
  image_url?: string;
  alt_text?: string;
  headline?: string;
  description?: string;
  cta_text?: string;
  icon?: string;
  bg_color?: string;
  html_content?: string;
  click_url: string;
}

interface AdBannerProps {
  /** Site identifier (e.g., 'freedomforge', 'aarondayshow') */
  site: string;
  /** Ad zone (default: 'FOOTER') */
  zone?: 'FOOTER' | 'HEADER' | 'SIDEBAR' | 'IN_CONTENT';
  /** Fallback content when no ad is available */
  fallback?: React.ReactNode;
  /** Custom className for the container */
  className?: string;
  /** Supabase URL (defaults to VITE_SUPABASE_URL env var) */
  supabaseUrl?: string;
  /** Supabase anon key (defaults to VITE_SUPABASE_ANON_KEY env var) */
  supabaseKey?: string;
}

// ============================================
// CONFIGURATION - Centralized Ad Server (freedomforge)
// ============================================

// All sites fetch ads from the central ad server hosted on freedomforge project
// Keys loaded from environment variables (REACT_APP_FREEDOMFORGE_URL, REACT_APP_FREEDOMFORGE_ANON_KEY)
const AD_SERVER_URL = process.env.REACT_APP_FREEDOMFORGE_URL || '';
const AD_SERVER_KEY = process.env.REACT_APP_FREEDOMFORGE_ANON_KEY || '';

const DEFAULT_SUPABASE_URL = AD_SERVER_URL;
const DEFAULT_SUPABASE_KEY = AD_SERVER_KEY;

// Allowed HTML tags for sanitization
const ALLOWED_TAGS = ['div', 'span', 'p', 'a', 'img', 'strong', 'em', 'br'];
const ALLOWED_ATTRS = ['class', 'style', 'href', 'src', 'alt', 'target', 'rel'];

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get a Lucide icon component by name
 */
const getLucideIcon = (iconName: string): React.ComponentType<{ className?: string }> | null => {
  if (!iconName) return null;

  // Convert kebab-case to PascalCase
  const pascalCase = iconName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');

  const IconComponent = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[pascalCase];
  return IconComponent || null;
};

/**
 * Sanitize HTML content
 */
const sanitizeHtml = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR: ALLOWED_ATTRS,
  });
};

// ============================================
// COMPONENT
// ============================================

export const AdBanner: React.FC<AdBannerProps> = ({
  site,
  zone = 'FOOTER',
  fallback = null,
  className = '',
  supabaseUrl = DEFAULT_SUPABASE_URL,
  supabaseKey = DEFAULT_SUPABASE_KEY,
}) => {
  const [ad, setAd] = useState<AdData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch ad on mount
  useEffect(() => {
    const fetchAd = async () => {
      if (!supabaseUrl || !supabaseKey) {
        console.warn('AdBanner: Missing Supabase configuration');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${supabaseUrl}/functions/v1/serve-ad?site=${encodeURIComponent(site)}&zone=${encodeURIComponent(zone)}`,
          {
            headers: {
              'Authorization': `Bearer ${supabaseKey}`,
              'apikey': supabaseKey,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        if (data.ad) {
          setAd(data.ad);
        }
      } catch (err) {
        console.error('AdBanner: Failed to fetch ad', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchAd();
  }, [site, zone, supabaseUrl, supabaseKey]);

  // Handle click tracking
  const handleClick = useCallback(async (e: React.MouseEvent) => {
    if (!ad) return;

    e.preventDefault();

    try {
      // Track the click
      const response = await fetch(
        `${supabaseUrl}/functions/v1/track-click`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'apikey': supabaseKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            creative_id: ad.creative_id,
            site,
            zone,
          }),
        }
      );

      const data = await response.json();

      // Redirect to the destination
      if (data.redirect_url) {
        window.open(data.redirect_url, '_blank', 'noopener,noreferrer');
      }
    } catch (err) {
      console.error('AdBanner: Failed to track click', err);
      // Fallback: open the URL directly
      window.open(ad.click_url, '_blank', 'noopener,noreferrer');
    }
  }, [ad, site, zone, supabaseUrl, supabaseKey]);

  // Loading state
  if (loading) {
    return (
      <div className={`ad-banner ad-banner--loading ${className}`}>
        <div className="ad-banner__skeleton" style={{ height: '100px', background: '#1a1a1a', borderRadius: '8px' }} />
      </div>
    );
  }

  // No ad available
  if (!ad) {
    return fallback ? <>{fallback}</> : null;
  }

  // Render based on format
  return (
    <div
      className={`ad-banner ad-banner--${ad.format} ad-banner--${ad.campaign_type} ${className}`}
      data-creative-id={ad.creative_id}
      data-campaign-type={ad.campaign_type}
    >
      {ad.format === 'image' && (
        <ImageAd ad={ad} onClick={handleClick} />
      )}

      {ad.format === 'text_card' && (
        <TextCardAd ad={ad} onClick={handleClick} />
      )}

      {ad.format === 'rich_card' && (
        <RichCardAd ad={ad} onClick={handleClick} />
      )}

      {ad.format === 'html' && (
        <HtmlAd ad={ad} onClick={handleClick} />
      )}
    </div>
  );
};

// ============================================
// SUB-COMPONENTS
// ============================================

interface AdSubComponentProps {
  ad: AdData;
  onClick: (e: React.MouseEvent) => void;
}

/**
 * Image Banner Ad
 */
const ImageAd: React.FC<AdSubComponentProps> = ({ ad, onClick }) => (
  <a
    href={ad.click_url}
    onClick={onClick}
    target="_blank"
    rel="noopener noreferrer"
    className="ad-banner__image-link"
    style={{ display: 'block', textAlign: 'center' }}
  >
    <img
      src={ad.image_url}
      alt={ad.alt_text || ad.campaign_name}
      className="ad-banner__image"
      style={{
        maxWidth: '100%',
        height: 'auto',
        borderRadius: '8px',
        transition: 'opacity 0.2s ease',
      }}
      loading="lazy"
    />
  </a>
);

/**
 * Text Card Ad
 */
const TextCardAd: React.FC<AdSubComponentProps> = ({ ad, onClick }) => (
  <a
    href={ad.click_url}
    onClick={onClick}
    target="_blank"
    rel="noopener noreferrer"
    className="ad-banner__text-card"
    style={{
      display: 'block',
      padding: '16px 20px',
      background: ad.bg_color || 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
      borderRadius: '12px',
      textDecoration: 'none',
      color: 'inherit',
      border: '1px solid rgba(255,255,255,0.1)',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    }}
  >
    {ad.headline && (
      <h4 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', fontWeight: 600, color: '#fff' }}>
        {ad.headline}
      </h4>
    )}
    {ad.description && (
      <p style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.5 }}>
        {ad.description}
      </p>
    )}
    {ad.cta_text && (
      <span
        style={{
          display: 'inline-block',
          padding: '8px 16px',
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: '#fff',
          borderRadius: '6px',
          fontSize: '0.85rem',
          fontWeight: 600,
        }}
      >
        {ad.cta_text}
      </span>
    )}
  </a>
);

/**
 * Rich Card Ad (with icon)
 */
const RichCardAd: React.FC<AdSubComponentProps> = ({ ad, onClick }) => {
  const IconComponent = ad.icon ? getLucideIcon(ad.icon) : null;

  return (
    <a
      href={ad.click_url}
      onClick={onClick}
      target="_blank"
      rel="noopener noreferrer"
      className="ad-banner__rich-card"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '16px',
        padding: '20px',
        background: ad.bg_color || 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(5,150,105,0.1) 100%)',
        borderRadius: '12px',
        textDecoration: 'none',
        color: 'inherit',
        border: '1px solid rgba(16,185,129,0.3)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
    >
      {IconComponent && (
        <div
          style={{
            flexShrink: 0,
            padding: '12px',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            borderRadius: '10px',
          }}
        >
          <IconComponent className="ad-banner__icon" />
        </div>
      )}
      <div style={{ flex: 1 }}>
        {ad.headline && (
          <h4 style={{ margin: '0 0 6px 0', fontSize: '1.1rem', fontWeight: 600, color: '#fff' }}>
            {ad.headline}
          </h4>
        )}
        {ad.description && (
          <p style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.5 }}>
            {ad.description}
          </p>
        )}
        {ad.cta_text && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#fff',
              borderRadius: '6px',
              fontSize: '0.85rem',
              fontWeight: 600,
            }}
          >
            {ad.cta_text}
          </span>
        )}
      </div>
    </a>
  );
};

/**
 * HTML Ad (sanitized)
 */
const HtmlAd: React.FC<AdSubComponentProps> = ({ ad, onClick }) => {
  const sanitizedHtml = ad.html_content ? sanitizeHtml(ad.html_content) : '';

  return (
    <div
      className="ad-banner__html"
      onClick={onClick}
      style={{ cursor: 'pointer' }}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
};

// ============================================
// CSS STYLES (optional - include in your global CSS)
// ============================================

export const AdBannerStyles = `
.ad-banner {
  margin: 16px 0;
}

.ad-banner__image-link:hover .ad-banner__image {
  opacity: 0.9;
}

.ad-banner__text-card:hover,
.ad-banner__rich-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.ad-banner__icon {
  width: 24px;
  height: 24px;
  color: white;
}

/* Sponsored label */
.ad-banner--sponsor::before {
  content: 'Sponsored';
  display: block;
  font-size: 0.7rem;
  color: rgba(255,255,255,0.5);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}
`;

export default AdBanner;
