import { getCurrentProfile } from '@/lib/db'
import { VerifiedGate } from '@/components/verified-gate'
import { ProfileForm } from '@/components/profile-form'
import { changePassword, changeEmail } from '@/app/actions'
import { RoleBadge } from '@/components/badges'
import { Avatar } from '@/components/avatar'

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string; error?: string }>
}) {
  return (
    <VerifiedGate>
      <SettingsInner searchParams={searchParams} />
    </VerifiedGate>
  )
}

async function SettingsInner({ searchParams }: { searchParams: Promise<{ notice?: string; error?: string }> }) {
  const [profile, param] = await Promise.all([getCurrentProfile(), searchParams])
  if (!profile) return null

  const form =
    'w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-accent'

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-5 flex items-center gap-3">
        <Avatar name={profile.name} size={44} />
        <div>
          <h1 className="font-display text-2xl font-semibold leading-tight">Account settings</h1>
          <p className="mt-0.5 flex items-center gap-2 text-sm text-muted">
            {profile.email} <RoleBadge role={profile.role} />
            {profile.verified && <span className="text-xs text-accent">verified</span>}
          </p>
        </div>
      </div>

      {param?.error && (
        <p className="mb-4 rounded-lg border border-opportunity/40 bg-opportunity/10 px-3 py-2 text-sm">
          {param.error}
        </p>
      )}
      {param?.notice && (
        <p className="mb-4 rounded-lg border border-accent/40 bg-accent/10 px-3 py-2 text-sm">
          {param.notice}
        </p>
      )}

      <section className="card p-5">
        <h2 className="font-display mb-3 text-lg font-semibold">Profile</h2>
        <ProfileForm profile={profile} />
      </section>

      <section className="card mt-6 p-5">
        <h2 className="font-display mb-1 text-lg font-semibold">Change password</h2>
        <p className="mb-3 text-xs text-muted">Min 8 characters. Not your IISER Smarthub password.</p>
        <form action={changePassword} className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-sm font-medium">New password</span>
            <input
              type="password"
              name="password"
              required
              minLength={8}
              autoComplete="new-password"
              className={form}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Repeat new password</span>
            <input
              type="password"
              name="confirm"
              required
              minLength={8}
              autoComplete="new-password"
              className={form}
            />
          </label>
          <button
            type="submit"
            className="w-full rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-fg transition hover:shadow-card hover:brightness-110"
          >
            Update password
          </button>
        </form>
      </section>

      <section className="card mt-6 p-5">
        <h2 className="font-display mb-1 text-lg font-semibold">Change email</h2>
        <p className="mb-3 text-xs text-muted">
          {profile.email.endsWith('@iiserb.ac.in')
            ? 'Students keep their institute email until you graduate.'
            : 'Any reachable email works — notifications land here.'}
        </p>
        <form action={changeEmail} className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-sm font-medium">New email</span>
            <input
              type="email"
              name="email"
              required
              placeholder={profile.email}
              className={form}
            />
          </label>
          <button
            type="submit"
            className="w-full rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-fg transition hover:shadow-card hover:brightness-110"
          >
            Update email
          </button>
        </form>
      </section>
    </div>
  )
}
