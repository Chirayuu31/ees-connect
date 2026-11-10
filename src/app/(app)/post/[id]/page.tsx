import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPost, getCurrentProfile } from '@/lib/db'
import { createComment, reportPost } from '@/app/actions'
import { TypeBadge, RoleBadge } from '@/components/badges'
import { Avatar } from '@/components/avatar'
import { VerifiedGate } from '@/components/verified-gate'

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [post, profile] = await Promise.all([getPost(id), getCurrentProfile()])
  if (!post) notFound()

  return (
    <VerifiedGate>
      <div className="mx-auto w-full max-w-6xl xl:max-w-7xl 2xl:max-w-[80rem]">
        <Link href="/feed" className="text-sm text-muted hover:text-foreground">
          ← Feed
        </Link>

        <article className="card mt-4 p-[clamp(1.4rem,2.4vw,2rem)]">
          <div className="mb-3 flex items-center gap-2">
            <TypeBadge type={post.type} />
            <span className="text-xs text-muted">
              <Link href={`/u/${post.author_id}`} className="hover:underline">
                {post.profiles?.name ?? 'Unknown'}
              </Link>
              {' · '}
              {new Date(post.created_at).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </div>

          <h1 className="font-display text-[clamp(1.8rem,3.2vw,2.6rem)] font-bold leading-tight">{post.title}</h1>

          <div className="mt-4 max-w-[72ch] whitespace-pre-wrap text-[15px] leading-relaxed lg:mt-5">
            {post.expires_at && new Date(post.expires_at) < new Date() && (
              <span className="mb-3 block rounded-lg border border-opportunity/40 bg-opportunity/10 px-3 py-2 text-sm">
                This opportunity has closed.
              </span>
            )}
            {post.body}
          </div>

          {post.image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.image_url} alt="" className="mt-4 max-h-[70vh] w-full rounded-xl object-contain" />
          )}

          {(post.link_url || post.tags.length > 0) && (
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
              {post.link_url && (
                <a
                  href={post.link_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-accent hover:underline"
                >
                  Open link ↗
                </a>
              )}
              {post.tags.map((tag) => (
                <span key={tag} className="rounded bg-background px-1.5 py-0.5 font-mono text-xs text-muted">
                  #{tag}
                </span>
              ))}
              {profile && profile.id !== post.author_id && (
                <form action={reportPost} className="ml-auto">
                  <input type="hidden" name="post_id" value={post.id} />
                  <input type="hidden" name="reason" value="" />
                  <button
                    type="submit"
                    className="text-xs text-muted underline-offset-2 transition-colors hover:text-opportunity hover:underline"
                  >
                    Report post
                  </button>
                </form>
              )}
            </div>
          )}
        </article>

        <div className="mt-6 lg:grid lg:grid-cols-[1fr_400px] lg:gap-10">
          <section className="max-w-[560px]">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
              {post.comments?.length ?? 0} replies
            </h2>

            <div className="space-y-3">
              {post.comments?.map((c) => (
                <div key={c.id} className="card p-4">
                  <p className="mb-1.5 flex flex-wrap items-center gap-2 text-xs text-muted">
                    <Avatar name={c.profiles?.name} size={22} />
                    <Link href={`/u/${c.author_id}`} className="font-medium text-foreground hover:underline">
                      {c.profiles?.name ?? 'Unknown'}
                    </Link>
                    <RoleBadge role={c.profiles?.role ?? 'student'} />
                    <span>
                      {new Date(c.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  </p>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{c.body}</p>
                </div>
              ))}
            </div>

            <form action={createComment} className="mt-4">
              <input type="hidden" name="post_id" value={post.id} />
              <textarea
                name="body"
                rows={3}
                required
                maxLength={4000}
                placeholder="Write a reply…"
                className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
              />
              <button
                type="submit"
                className="mt-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-fg transition hover:shadow-card hover:brightness-110"
              >
                Reply
              </button>
            </form>
          </section>
        </div>
      </div>
    </VerifiedGate>
  )
}
