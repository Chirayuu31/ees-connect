import Link from 'next/link'
import { listProfiles } from '@/lib/db'
import { RoleBadge } from '@/components/badges'
import { Avatar } from '@/components/avatar'
import { VerifiedGate } from '@/components/verified-gate'

export default async function DirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ mentors?: string; batch?: string; q?: string }>
}) {
  const { mentors, batch, q } = await searchParams
  const people = await listProfiles({
    mentorsOnly: mentors === '1',
    batch: batch ? Number(batch) : undefined,
    search: q?.trim() || undefined,
  })

  return (
    <VerifiedGate>
      <div className="mb-6">
        <h1 className="font-display text-[clamp(1.75rem,3vw,2.5rem)] font-semibold tracking-tight">People</h1>
        <p className="mt-1 text-sm text-muted">
          {people.length} {people.length === 1 ? 'member' : 'members'} · alumni and students of the Earth
          &amp; Environmental Sciences department
        </p>
      </div>

      <div className="mb-4 flex flex-wrap items-end gap-2">
        <form className="flex flex-wrap items-end gap-2" action="/directory">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-muted">Search</span>
            <input
              type="search"
              name="q"
              defaultValue={q ?? ''}
              placeholder="name, field, organisation"
              className="w-52 rounded-lg border border-line bg-surface px-3 py-1.5 text-sm outline-none focus:border-accent"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-muted">Batch</span>
            <input
              type="number"
              name="batch"
              min={2008}
              max={2100}
              defaultValue={batch ?? ''}
              placeholder="2019"
              className="w-24 rounded-lg border border-line bg-surface px-3 py-1.5 text-sm outline-none focus:border-accent"
            />
          </label>
          <label className="flex items-center gap-1.5 pb-2 text-sm">
            <input type="checkbox" name="mentors" value="1" defaultChecked={mentors === '1'} />
            Open to mentoring
          </label>
          <button
            type="submit"
            className="mb-0.5 rounded-lg border border-line bg-surface px-3 py-1.5 text-sm hover:border-muted/50"
          >
            Filter
          </button>
        </form>
      </div>

      {people.length === 0 ? (
        <div className="card border-dashed p-10 text-center text-muted">
          No one matches those filters.
        </div>
      ) : (
        <ul className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(min(320px,100%),1fr))] lg:gap-4">
          {people.map((p) => (
            <li key={p.id}>
              <Link
                href={`/u/${p.id}`}
                className="card card-hover flex h-full items-start gap-3 p-4"
              >
                <Avatar name={p.name} size={40} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate font-semibold">{p.name}</span>
                    <RoleBadge role={p.role} />
                  </div>
                  <p className="mt-0.5 text-xs text-muted">
                    {p.batch ? `Batch of ${p.batch}` : null}
                    {p.batch && p.field ? ' · ' : ''}
                    {p.field}
                  </p>
                  {p.current_org && <p className="mt-1 truncate text-sm">{p.current_org}</p>}
                  {p.mentor_available && (
                    <span className="mt-2 inline-block rounded-full bg-accent/10 px-2 py-0.5 text-[11px] font-medium text-accent">
                      Open to mentoring
                    </span>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </VerifiedGate>
  )
}
