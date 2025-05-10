import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import {
  type NextFetchEvent,
  type NextRequest,
  NextResponse,
} from 'next/server';

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/onboarding(.*)',
  '/api(.*)',
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
          const signInUrl = new URL('/sign-in', req.url);

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

        return NextResponse.next();
      })(request, event);
    }

    return NextResponse.next();
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