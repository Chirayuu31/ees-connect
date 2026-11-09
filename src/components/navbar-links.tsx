'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const LINKS = [
  { href: '/feed', label: 'Feed' },
  { href: '/directory', label: 'People' },
  { href: '/tags', label: 'Tags' },
]

export function NavbarLinks({ admin }: { admin: boolean }) {
  const pathname = usePathname()
  return (
    <>
      {LINKS.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          aria-current={pathname.startsWith(href) ? 'page' : undefined}
          className={
            pathname.startsWith(href)
              ? 'font-medium text-foreground'
              : 'text-muted transition-colors hover:text-foreground'
          }
        >
          {label}
        </Link>
      ))}
      {admin && (
        <Link
          href="/admin"
          className={
            pathname.startsWith('/admin')
              ? 'font-medium text-foreground'
              : 'text-muted transition-colors hover:text-foreground'
          }
        >
          Admin
        </Link>
      )}
    </>
  )
}
