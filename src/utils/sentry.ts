import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

export const initSentry = () => {
  const dsn = process.env.REACT_APP_SENTRY_DSN;
  const environment = process.env.REACT_APP_ENVIRONMENT || 'development';

  // Only initialize in production or if DSN is explicitly set
  if (!dsn || environment === 'development') {
    console.log('[Sentry] Skipping initialization in development');
    return;
  }

  Sentry.init({
    dsn,
    environment,
    integrations: [
      new BrowserTracing(),
      new Sentry.Replay({
        // Capture 10% of all sessions
        sessionSampleRate: 0.1,
        // Capture 100% of sessions with errors
        errorSampleRate: 1.0,
      }),
    ],

    // Performance Monitoring
    tracesSampleRate: 0.2, // 20% of transactions for performance monitoring

    // Set sample rate for profiling
    profilesSampleRate: 0.2,

    // Ignore common errors
    ignoreErrors: [
      // Browser extensions
      'top.GLOBALS',
      'chrome-extension://',
      'moz-extension://',
      // Network errors
      'NetworkError',
      'Failed to fetch',
      'Network request failed',
      // React hydration mismatches (usually harmless)
      'Hydration failed',
    ],

    // Add custom data to all events
    beforeSend(event, hint) {
      // Add custom context
      if (event.request) {
        event.request.headers = {
          ...event.request.headers,
          'User-Agent': navigator.userAgent,
        };
      }

      // Filter out localhost errors in production
      if (event.request?.url?.includes('localhost')) {
        return null;
      }

      return event;
    },
  });

  // Set user context when available (after auth)
  Sentry.setContext('app', {
    name: 'Oasara Marketplace',
    version: process.env.REACT_APP_VERSION || '1.0.0',
  });
};

// Helper function to manually capture errors
export const captureError = (error: Error, context?: Record<string, any>) => {
  Sentry.captureException(error, {
    extra: context,
  });
};

// Helper function to capture messages
export const captureMessage = (message: string, level: Sentry.SeverityLevel = 'info') => {
  Sentry.captureMessage(message, level);
};

// Helper function to set user context (call after login)
export const setUserContext = (user: { id: string; email?: string }) => {
  Sentry.setUser({
    id: user.id,
    email: user.email,
  });
};

// Helper function to clear user context (call after logout)
export const clearUserContext = () => {
  Sentry.setUser(null);
};
