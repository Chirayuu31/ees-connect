import Link from 'next/link'

// shared footer: two variants — member sees Settings, guest sees Sign in
export function Footer({ signed }: { signed?: boolean }) {
  return (
    <footer className="border-t border-line bg-background/60 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-center sm:flex-row sm:text-left">
        <p className="font-display text-sm font-semibold">
          EES<span className="text-accent">·</span>Connect
          <span className="ml-3 font-sans text-[11px] font-normal leading-5 text-muted">
            Earth &amp; Environmental Sciences, IISER Bhopal
          </span>
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted">
          <Link href="/feed" className="link-underline">Feed</Link>
          <Link href="/directory" className="link-underline">People</Link>
          <Link href="/tags" className="link-underline">Tags</Link>
          {signed ? (
            <Link href="/settings" className="link-underline">Settings</Link>
          ) : (
            <Link href="/login" className="link-underline">Sign in</Link>
          )}
        </div>
      </div>
    </footer>
  )
}
