import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

/**
 * Global middleware that refreshes the Supabase session on every
 * incoming request.  This ensures that authentication tokens are
 * revalidated and cookies are updated so that server components can
 * read the session state.  Routes matching the provided matcher
 * pattern will trigger this middleware; static assets and API
 * endpoints are excluded.
 */
export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

// Exclude API routes and static files from the middleware to avoid
// unnecessary overhead when serving assets.  This matcher pattern
// skips any path that begins with `/api` or `_next/static`,
// or ends with an image extension.
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|gif|webp)$).*)',
  ],
};
