'use client'

import { Moon, Sun } from 'lucide-react'

// Class toggle only — no React state. The inline head script sets the
// initial class (system preference until the user picks one); the icons
// swap via CSS `dark:` variants, so hydration can never disagree.
export function ThemeToggle() {
  return (
    <button
      type="button"
      onClick={() => {
        const dark = document.documentElement.classList.toggle('dark')
        try {
          localStorage.setItem('theme', dark ? 'dark' : 'light')
        } catch {}
      }}
      aria-label="Toggle color theme"
      title="Toggle color theme"
      className="flex size-7 items-center justify-center rounded-lg border border-line bg-surface text-muted transition-colors hover:border-muted/50 hover:text-foreground"
    >
      <Moon size={14} strokeWidth={1.8} className="dark:hidden" />
      <Sun size={14} strokeWidth={1.8} className="hidden dark:block" />
    </button>
  )
}
