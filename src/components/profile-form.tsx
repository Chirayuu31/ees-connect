import { updateProfile } from '@/app/actions'
import type { Profile } from '@/lib/types'

// Shared by /onboarding (first-run) and /settings (later edits).
// The mentor toggle is alumni-only: students graduate into it via an admin.
export function ProfileForm({ profile }: { profile: Profile }) {
  return (
    <form action={updateProfile} className="space-y-4">
      <label className="block">
        <span className="mb-1 block text-sm font-medium">Name</span>
        <input
          type="text"
          name="name"
          defaultValue={profile.name}
          required
          maxLength={60}
          className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium">Field / interest</span>
        <input
          type="text"
          name="field"
          maxLength={60}
          placeholder="e.g. Hydrology, Ecology, Atmospheric Science"
          defaultValue={profile.field ?? ''}
          className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium">Current organisation</span>
        <input
          type="text"
          name="current_org"
          maxLength={80}
          placeholder="e.g. IISER Bhopal, ISRO, a fellowship…"
          defaultValue={profile.current_org ?? ''}
          className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium">Batch (graduating year)</span>
        <input
          type="number"
          name="batch"
          min={2008}
          max={2100}
          placeholder="e.g. 2019"
          defaultValue={profile.batch ?? ''}
          className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium">Bio</span>
        <textarea
          name="bio"
          rows={3}
          maxLength={500}
          defaultValue={profile.bio ?? ''}
          placeholder="What are you up to, what can you help with…"
          className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
        />
      </label>

      {profile.role === 'alumni' && (
        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            name="mentor_available"
            defaultChecked={profile.mentor_available}
            className="mt-0.5"
          />
          <span>
            Open to mentoring students — show me in the{' '}
            <a href="/directory?mentors=1" className="text-accent hover:underline">
              mentors list
            </a>
          </span>
        </label>
      )}
      {profile.role === 'student' && (
        <p className="rounded-lg bg-background px-3 py-2 text-xs text-muted">
          Mentoring is an alumni-only flag — graduate through an admin approval
          to switch on, and this will appear on your settings.
        </p>
      )}

      <button
        type="submit"
        className="w-full rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-fg transition hover:shadow-card hover:brightness-110"
      >
        Save profile
      </button>
    </form>
  )
}
