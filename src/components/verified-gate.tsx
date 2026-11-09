import { getCurrentProfile } from '@/lib/db'

// Renders children only for approved members; unverified alumni see why
// they're still waiting. The proxy handles logged-out users already.
export async function VerifiedGate({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile()

  if (!profile) return null

  if (!profile.verified) {
    return (
      <div className="card mx-auto max-w-md p-6 text-center">
        <h1 className="font-display text-[clamp(1.4rem,2.2vw,1.75rem)] font-semibold">You&apos;re on the list ✅</h1>
        <p className="mt-2 text-sm text-muted">
          Your alumni request is waiting for an EES Connect admin to approve it.
          You&apos;ll see everything here the moment you&apos;re in. If it&apos;s been a
          while, ping the department&apos;s club admin directly.
        </p>
        <div className="mt-4 rounded-lg bg-background px-4 py-3 text-left text-sm text-muted">
          <p>
            <span className="font-medium text-foreground">{profile.name ?? 'New member'}</span>
          </p>
          <p>{profile.email}</p>
          <p className="mt-2 text-xs">Signed up as alumni · pending approval</p>
        </div>
      </div>
    )
  }

  return <div className="mx-auto w-full max-w-6xl xl:max-w-7xl px-4 py-8 2xl:max-w-[88rem]">{children}</div>
}
