import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Refreshes Supabase sessions on every matched request and guards
// app routes. Unauthenticated visitors only see the landing and auth
// pages; logged-in users can't revisit them.
const PUBLIC_PATHS = ['/', '/login', '/signup', '/auth/callback']

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => {
            // only rewrite cookies that actually changed — prevents the
            // stale-client / fresh-server seesaw during parallel refreshes
            const existing = request.cookies.get(name)?.value
            if (existing !== value) request.cookies.set(name, value)
          })
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => {
            const existing = response.cookies.get(name)?.value
            if (existing !== value) response.cookies.set(name, value, options)
          })
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname
  const isPublic =
    PUBLIC_PATHS.includes(path) ||
    path.startsWith('/login/') ||
    path.startsWith('/signup/')

  if (!user && !isPublic) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.search = `?next=${encodeURIComponent(path)}`
    return NextResponse.redirect(url)
  }

  if (user && isPublic && path !== '/auth/callback') {
    // members skip the marketing page and auth flow entirely
    const url = request.nextUrl.clone()
    url.pathname = '/feed'
    url.search = ''
    return NextResponse.redirect(url)
  }

  // auth pages: never cached, never bfcache-restored — every revisit is a
  // fresh server render (prevents the stale signed-in-navbar-on-login-form
  // back/forward class and re-runs the member auto-redirect above)
  if (isPublic && path.startsWith('/login') || path.startsWith('/signup')) {
    response.headers.set('Cache-Control', 'no-store, must-revalidate')
  }

  return response
}

export const config = {
  matcher: [
    // everything except Next internals and static assets
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
