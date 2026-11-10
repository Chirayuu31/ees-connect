import Link from 'next/link'
import { ThemeToggle } from '@/components/theme-toggle'

// guest-only chrome: brand + directory link + theme + sign-in CTA
export function GuestHeader() {
  return (
    <header className="glass border-b border-line">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
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
        <div className="flex items-center gap-3 text-sm">
          <Link href="/directory" className="link-underline text-muted hover:text-foreground">People</Link>
          <ThemeToggle />
          <Link
            href="/login"
            className="btnpress rounded-lg bg-accent px-3.5 py-1.5 font-medium text-accent-fg transition hover:brightness-110"
          >
            Sign in
          </Link>
        </div>
      </div>
    </header>
  )
}
