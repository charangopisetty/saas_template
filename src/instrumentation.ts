import * as Sentry from '@sentry/nextjs';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      spotlight: process.env.NODE_ENV === 'development',
      tracesSampleRate: 1,
      debug: false,
    });
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      spotlight: process.env.NODE_ENV === 'development',
      tracesSampleRate: 1,
      debug: false,
    });
  }
}