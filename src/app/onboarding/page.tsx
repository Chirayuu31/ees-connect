import { getCurrentProfile } from '@/lib/db'
import { VerifiedGate } from '@/components/verified-gate'
import { ProfileForm } from '@/components/profile-form'
import Link from 'next/link'

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  const profile = (await getCurrentProfile())!

  return (
    <VerifiedGate>
      <div className="mx-auto max-w-md">
        <h1 className="font-display mb-1 text-3xl font-semibold tracking-tight">Set up your profile</h1>
        <p className="mb-6 text-sm text-muted">
          This is how people find you in the directory — fill what you&apos;re comfortable sharing.
          You can edit it later from{' '}
          <Link href="/settings" className="text-accent hover:underline">
            account settings
          </Link>.
        </p>

        {error && (
          <p className="mb-4 rounded-lg border border-opportunity/40 bg-opportunity/10 px-3 py-2 text-sm">
            {error}
          </p>
        )}

        <ProfileForm profile={profile} />

        <p className="mt-4 text-center text-xs text-muted">
          Signed in as {profile.email}
        </p>
      </div>
    </VerifiedGate>
  )
}
