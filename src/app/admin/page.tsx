import Link from 'next/link'
import { getCurrentProfile, listPendingAlumni, listReports } from '@/lib/db'
import { approveUser, deletePost, dismissReport } from '@/app/actions'
import { VerifiedGate } from '@/components/verified-gate'

export default async function AdminPage() {
  return (
    <VerifiedGate>
      <AdminPanel />
    </VerifiedGate>
  )
}

async function AdminPanel() {
  const profile = await getCurrentProfile()
  if (profile?.role !== 'admin') {
    return (
      <p className="card border-dashed p-10 text-center text-muted">
        Admin access only.
      </p>
    )
  }

  const [pending, reports] = await Promise.all([listPendingAlumni(), listReports()])

  return (
    <div className="mx-auto w-full max-w-5xl xl:max-w-7xl 2xl:max-w-[80rem]">
      <h1 className="font-display text-[clamp(1.75rem,3vw,2.5rem)] font-semibold tracking-tight">Admin</h1>
      <p className="mt-1 text-sm text-muted">
        Approve alumni who signed up with an external email. Check batch year and LinkedIn
        against the sign-up details before approving.
      </p>

      {pending.length === 0 ? (
        <div className="card mt-6 border-dashed p-10 text-center text-muted">
          No pending approvals. Inbox zero.
        </div>
      ) : (
        <ul className="mt-6 grid gap-3">
          {pending.map((p) => (
            <li
              key={p.id}
              className="card flex flex-wrap items-center justify-between gap-3 p-4"
            >
              <div>
                <p className="font-semibold">
                  {p.name} <span className="text-xs font-normal text-muted">{p.email}</span>
                </p>
                <p className="mt-0.5 text-xs text-muted">
                  Alumni · role on signup: {p.role} · joined{' '}
                  {new Date(p.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </p>
              </div>
              <form action={approveUser.bind(null, p.id)}>
                <button
                  type="submit"
                  className="rounded-lg bg-accent px-3 py-1.5 text-sm font-semibold text-accent-fg transition hover:shadow-card hover:brightness-110"
                >
                  Approve
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}

      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold">Reported posts</h2>
        <p className="mt-1 text-sm text-muted">
          Members-flagged content. Deleting removes the post everywhere; dismissing
          just clears the flag.
        </p>

        {reports.length === 0 ? (
          <div className="card mt-4 border-dashed p-8 text-center text-muted">
            No open reports.
          </div>
        ) : (
          <ul className="mt-4 grid gap-3">
            {reports.map((r) => (
              <li key={r.id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="text-sm">
                    Post{' '}
                    <Link href={`/post/${r.post_id}`} className="font-mono text-xs text-accent hover:underline">
                      {r.post_id.slice(0, 8)}
                    </Link>{' '}
                    reported by <span className="font-medium">{r.reporter?.name ?? 'a member'}</span>
                    {r.reason ? ` — “${r.reason}”` : ''} ·{' '}
                    <span className="text-xs text-muted">
                      {new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <form action={deletePost.bind(null, r.post_id)}>
                    <button className="rounded-lg border border-opportunity/40 px-3 py-1.5 text-sm font-medium text-opportunity transition-colors hover:bg-opportunity/10">
                      Delete post
                    </button>
                  </form>
                  <form action={dismissReport.bind(null, r.id)}>
                    <button className="rounded-lg border border-line px-3 py-1.5 text-sm text-muted transition-colors hover:border-muted/50 hover:text-foreground">
                      Dismiss
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
