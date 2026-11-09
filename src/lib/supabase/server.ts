import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export async function createSupabaseServerClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              // only rewrite cookies that actually changed — prevents the
              // stale-client / fresh-server seesaw during parallel refreshes
              const existing = cookieStore.get(name)?.value
              if (existing !== value) cookieStore.set(name, value, options)
            })
          } catch {
            // called from a Server Component render; the middleware
            // (proxy.ts) refreshes sessions there
          }
        },
      },
    },
  )
}
