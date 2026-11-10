import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getProfile, listUserPosts, getCurrentProfile, listMentorships } from '@/lib/db'
import { requestMentorship, respondMentorship } from '@/app/actions'
import { PostCard } from '@/components/post-card'
import { RoleBadge } from '@/components/badges'
import { Avatar } from '@/components/avatar'
import { VerifiedGate } from '@/components/verified-gate'

export default async function ProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ notice?: string; error?: string }>
}) {
  const { id } = await params
  const [profile, viewer, posts, search] = await Promise.all([
    getProfile(id),
    getCurrentProfile(),
    listUserPosts(id),
    searchParams,
  ])
  if (!profile) notFound()

  const isSelf = viewer?.id === profile.id
  const myRequests = viewer ? await listMentorships(viewer) : []
  const incoming = isSelf ? myRequests.filter((r) => r.mentor_id === profile.id) : []
  const outgoing = isSelf ? myRequests.filter((r) => r.student_id === profile.id) : []
  const myRequestOnThisProfile = !isSelf ? myRequests.find((r) => r.mentor_id === profile.id) : undefined
  const canRequest =
    viewer &&
    !isSelf &&
    viewer.role === 'student' &&
    profile.role === 'alumni' &&
    profile.mentor_available

  return (
    <VerifiedGate>
      <div className="mx-auto w-full max-w-5xl xl:max-w-7xl 2xl:max-w-[80rem]">
        <Link href="/directory" className="text-sm text-muted hover:text-foreground">
          ← People
        </Link>

        <header className="card p-6">
          <div className="flex flex-wrap items-center gap-4">
            <Avatar name={profile.name ?? ''} size={56} />
            <div className="min-w-0 flex-1">
              <h1 className="font-display text-[clamp(1.6rem,2.6vw,2.25rem)] font-semibold leading-tight">{profile.name ?? ''}</h1>
              <p className="mt-0.5 text-sm text-muted">
                {profile.batch ? `Batch of ${profile.batch}` : ''}
                {profile.batch && profile.field ? ' · ' : ''}
                {profile.field}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <RoleBadge role={profile.role} />
              {!isSelf && viewer && (
                <Link
                  href={`/messages?with=${profile.id}`}
                  className="rounded-lg border border-line px-2.5 py-1.5 text-sm text-muted transition-colors hover:border-muted/50 hover:text-foreground"
                >
                  Message
                </Link>
              )}
              {profile.mentor_available && (
                <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
                  Open to mentoring
                </span>
              )}
            </div>
          </div>

          {profile.current_org && <p className="mt-4 font-medium">{profile.current_org}</p>}
          {profile.bio && <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted">{profile.bio}</p>}

          {search.error && (
            <p className="mt-4 rounded-lg border border-opportunity/40 bg-opportunity/10 px-3 py-2 text-sm">
              {search.error}
            </p>
          )}
          {search.notice && (
            <p className="mt-4 rounded-lg border border-accent/40 bg-accent/10 px-3 py-2 text-sm">
              {search.notice}
            </p>
          )}

          {/* students ask this mentor directly */}
          {canRequest && !myRequestOnThisProfile && (
            <form action={requestMentorship} className="mt-4 rounded-lg bg-background p-3">
              <input type="hidden" name="mentor_id" value={profile.id} />
              <label className="block text-sm font-medium">
                Ask {(profile.name ?? '').replace(/^(Dr|Prof|Mr|Ms|Mrs)\.?\s+/i, '').split(' ')[0] ?? 'Member'} for mentorship
              </label>
              <textarea
                name="message"
                rows={2}
                maxLength={500}
                placeholder="What would you like guidance on? (optional)"
                className="mt-1.5 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
              />
              <button
                type="submit"
                className="mt-2 rounded-lg bg-accent px-3 py-1.5 text-sm font-semibold text-accent-fg transition hover:shadow-card hover:brightness-110"
              >
                Send request
              </button>
            </form>
          )}
          {myRequestOnThisProfile && (
            <p className="mt-4 rounded-lg bg-background px-3 py-2 text-sm text-muted">
              {myRequestOnThisProfile.status === 'pending' &&
                'Your mentorship request is with them — they can accept or decline. '}
              {myRequestOnThisProfile.status === 'accepted' && 'They accepted your mentorship request ✅ '}
              {myRequestOnThisProfile.status === 'declined' && 'They declined this request — try another mentor from the directory. '}
            </p>
          )}
        </header>

        {/* a mentor sees + manages incoming requests on their own profile */}
        {isSelf && incoming.length > 0 && (
          <section className="mt-6">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
              Mentorship requests ({incoming.filter((r) => r.status === 'pending').length} pending)
            </h2>
            <div className="grid gap-3">
              {incoming.map((r) => (
                <div key={r.id} className="card p-4">
                  <p className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="font-semibold">{r.student.name}</span>
                    <span className="rounded-full bg-background px-2 py-0.5 text-[11px] font-medium text-muted">
                      {r.status}
                    </span>
                    <span className="text-xs text-muted">
                      {new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  </p>
                  {r.message && <p className="mt-1.5 text-sm leading-relaxed">{r.message}</p>}
                  <a href={`/u/${r.student_id}`} className="mt-1 inline-block text-xs text-muted hover:underline">
                    View profile
                  </a>
                  {r.status === 'pending' && (
                    <div className="mt-2 flex gap-2">
                      <form action={respondMentorship.bind(null, r.id, true)}>
                        <button className="rounded-lg bg-accent px-3 py-1.5 text-sm font-semibold text-accent-fg transition hover:brightness-110">
                          Accept
                        </button>
                      </form>
                      <form action={respondMentorship.bind(null, r.id, false)}>
                        <button className="rounded-lg border border-line px-3 py-1.5 text-sm text-muted transition-colors hover:border-muted/50 hover:text-foreground">
                          Decline
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* sent requests for their own eyes */}
        {isSelf && outgoing.length > 0 && viewer?.role === 'student' && (
          <section className="mt-6">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
              Your mentorship requests
            </h2>
            <div className="grid gap-2">
              {outgoing.map((r) => (
                <div key={r.id} className="card flex flex-wrap items-center gap-3 p-3 text-sm">
                  <Link href={`/u/${r.mentor_id}`} className="font-medium hover:underline">
                    {r.mentor.name}
                  </Link>
                  <span className="rounded-full bg-background px-2 py-0.5 text-[11px] font-medium text-muted">
                    {r.status}
                  </span>
                  {r.message && <span className="min-w-0 flex-1 truncate text-xs text-muted">“{r.message}”</span>}
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="mt-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
            Posts by {(profile.name ?? '').replace(/^(Dr|Prof|Mr|Ms|Mrs)\.?\s+/i, '').split(' ')[0] ?? 'Member'} ({posts.length})
          </h2>
          {posts.length === 0 ? (
            <div className="card border-dashed p-8 text-center text-sm text-muted col-span-full">
              No posts yet.
            </div>
          ) : (
            <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(min(420px,100%),1fr))] lg:gap-4">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </section>
      </div>
    </VerifiedGate>
  )
}
