import Link from 'next/link'
import { GuestHeader } from '@/components/guest-header'
import { Footer } from '@/components/guest-footer'

export default function NotFound() {
  return (
    <>
      <GuestHeader />
      <main className="w-full flex-1">
      <div className="mx-auto my-16 max-w-md text-center">
      <p className="font-display text-6xl font-semibold text-accent">404</p>
      <h1 className="font-display mt-3 text-2xl font-semibold">That page doesn&apos;t exist</h1>
      <p className="mt-2 text-sm text-muted">
        The profile, post or page you were looking for may have been removed,
        or the link you followed is out of date.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          href="/feed"
          className="rounded-xl bg-accent px-5 py-2.5 font-medium text-accent-fg transition hover:brightness-110"
        >
          Back to the feed
        </Link>
        <Link
          href="/directory"
          className="rounded-xl border border-line bg-surface px-5 py-2.5 font-medium transition hover:border-muted/50"
        >
          Browse people
        </Link>
      </div>
    </div>
      </main>
      <Footer />
    </>
  )
}
