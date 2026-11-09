import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// Supabase sends users here after email confirmation / password
// recovery: exchanges the auth code for a cookie session.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (!code) return NextResponse.redirect(new URL('/login?error=auth', origin))

  const pendingCookies: { name: string; value: string; options?: Record<string, unknown> }[] = []
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          pendingCookies.push(...cookiesToSet)
        },
      },
    },
  )

  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) return NextResponse.redirect(new URL('/login?error=auth', origin))

  const target = new URL(next.startsWith('/') && !next.startsWith('//') ? next : '/', origin)
  const forwardedHost = request.headers.get('x-forwarded-host')
  if (forwardedHost) target.host = forwardedHost

  const response = NextResponse.redirect(target)
  for (const { name, value, options } of pendingCookies) {
    if (options) {
      response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2])
    } else {
      response.cookies.set(name, value)
    }
  }
  return response
}
