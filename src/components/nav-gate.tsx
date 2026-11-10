'use client'

// Renders the navbar chrome only when it applies. On auth pages
// (/login, /logout subroutes, /signup) the (auth) GuestHeader owns
// the top bar instead — so no member UI can leak onto auth screens
// even through a stale client payload after login/logout transitions.
import { usePathname } from 'next/navigation'

export function NavGate({ auth, children }: { auth?: boolean; children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuthPage =
    pathname.startsWith('/login') || pathname.startsWith('/signup') || pathname === '/auth/callback'

  if (auth) {
    // auth-only chrome: hide on auth pages, show everywhere else
    return isAuthPage ? null : <>{children}</>
  }

  // guest/member navbar: hide on auth pages (the AuthLayout owns them)
  return isAuthPage ? null : <>{children}</>
}
