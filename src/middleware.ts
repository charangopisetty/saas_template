import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import {
  type NextFetchEvent,
  type NextRequest,
  NextResponse,
} from 'next/server';
import createMiddleware from 'next-intl/middleware';

import { AllLocales, AppConfig } from './utils/AppConfig';

const intlMiddleware = createMiddleware({
  locales: AllLocales,
  localePrefix: AppConfig.localePrefix,
  defaultLocale: AppConfig.defaultLocale,
  localeDetection: false,
});

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/:locale/dashboard(.*)',
  '/onboarding(.*)',
  '/:locale/onboarding(.*)',
  '/api(.*)',
  '/:locale/api(.*)',
]);

export default async function middleware(
  request: NextRequest,
  event: NextFetchEvent,
) {
  try {
    if (
      request.nextUrl.pathname.includes('/sign-in') ||
      request.nextUrl.pathname.includes('/sign-up') ||
      isProtectedRoute(request)
    ) {
      return clerkMiddleware(async (auth, req) => {
        if (isProtectedRoute(req)) {
          const locale =
            req.nextUrl.pathname.match(/(\/.*)\/dashboard/)?.at(1) ?? '';

          const signInUrl = new URL(`${locale}/sign-in`, req.url);

          await auth.protect({
            unauthenticatedUrl: signInUrl.toString(),
          });
        }

        const authObj = await auth();

        if (
          authObj.userId &&
          !authObj.orgId &&
          req.nextUrl.pathname.includes('/dashboard') &&
          !req.nextUrl.pathname.endsWith('/organization-selection')
        ) {
          const orgSelection = new URL(
            '/onboarding/organization-selection',
            req.url,
          );

          return NextResponse.redirect(orgSelection);
        }

        const intlResponse = await intlMiddleware(req);
        return intlResponse;
      })(request, event);
    }

    return intlMiddleware(request);
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|assets|monitoring).*)',
  ],
};