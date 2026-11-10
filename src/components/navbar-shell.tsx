'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { logout } from '@/app/actions'
import type { Profile } from '@/lib/types'

export function NavbarShell({
  profile,
  unread,
  admin,
}: {
  profile: Profile
  unread: number
  admin: boolean
}) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const router = useRouter()

  // reactive auth: sign-out / sign-in / token expiry reflected in the navbar
  // immediately — without a full page reload (a stale signed-in navbar on
  // auth pages after logout was the reported bug)
  useEffect(() => {
    const supabase = createSupabaseBrowserClient()
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      router.refresh()
    })
    return () => {
      sub.subscription.unsubscribe()
    }
  }, [router])


  const LINKS = [
    { href: '/feed', label: 'Feed' },
    { href: '/directory', label: 'People' },
    { href: '/tags', label: 'Tags' },
    { href: '/messages', label: 'Messages', badge: unread > 0 ? (unread > 9 ? '9+' : String(unread)) : undefined },
    ...(admin ? [{ href: '/admin', label: 'Admin' }] : []),
  ]

  const linkClass = (active: boolean) =>
    active
      ? 'font-medium text-foreground'
      : 'text-muted transition-colors hover:text-foreground'

  // auth pages always render the guest chrome — even if a stale client session exists
  const onAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup') || pathname === '/auth/callback'
  if (onAuthPage && profile.role !== 'admin') {
    // falls through to the platform's GuestBar for auth pages
  }
  return (
    <header className="glass border-b border-line">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-accent/10 text-accent">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M3 18c2-6 4-9 7-9s4 3 7 3 3-2 4-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M3 14c2-5 4-8 7-8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.45" />
            </svg>
          </span>
          <span className="font-display text-xl font-semibold tracking-tight">
            EES<span className="text-accent">·</span>Connect
          </span>
        </Link>

        {/* desktop */}
        <nav className="hidden items-center gap-4 text-sm md:flex">
          {LINKS.map(({ href, label, badge }) => (
            <Link
              key={href}
              href={href}
              aria-current={pathname.startsWith(href) ? 'page' : undefined}
              className={`relative px-1 py-0.5 ${linkClass(pathname.startsWith(href))}`}
            >
              {label}
              {badge && (
                <span className="absolute -right-3 -top-1 rounded-full bg-opportunity px-1.5 text-[10px] font-bold leading-4 text-background">
                  {badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* actions + user + mobile trigger */}
        <div className="flex items-center gap-2 text-sm sm:gap-3">
          <ThemeToggle />
          <Link
            href={`/u/${profile.id}`}
            className="flex size-7 items-center justify-center rounded-full bg-accent text-[11px] font-semibold text-accent-fg"
            title="Your profile"
          >
            {(profile.name ?? '').trim().slice(0, 1).toUpperCase() || 'U'}
          </Link>
          <span className="hidden text-[13px] sm:inline">
            {(profile.name ?? '').split(' ')[0] ?? 'New member'}
          </span>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-lg border border-line px-2.5 py-1.5 text-xs text-muted transition-colors hover:border-muted/50 hover:text-foreground"
            >
              Sign out
            </button>
          </form>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label="Menu"
            className="flex size-8 items-center justify-center rounded-lg border border-line text-muted md:hidden"
          >
            {open ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {/* mobile drawer */}
      {open && (
        <div id="mobile-menu" className="border-b border-line bg-surface px-3 py-2 md:hidden">
          <nav className="grid gap-0.5 text-sm">
            {LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                aria-current={pathname.startsWith(href) ? 'page' : undefined}
                className={`rounded-lg px-3 py-2 ${linkClass(pathname.startsWith(href))}`}
              >
                {label}
              </Link>
            ))}
            <Link
              href="/settings"
              onClick={() => setOpen(false)}
              className={`rounded-lg px-3 py-2 ${linkClass(pathname.startsWith('/settings'))}`}
            >
              Settings
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
