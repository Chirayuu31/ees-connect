import Link from 'next/link'
import { listPosts } from '@/lib/db'
import { PostCard } from '@/components/post-card'
import { VerifiedGate } from '@/components/verified-gate'
import { Contours } from '@/components/contours'
import type { PostType } from '@/lib/types'

const TABS: Array<{ key: PostType | 'all'; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'question', label: 'Doubts' },
  { key: 'opportunity', label: 'Opportunities' },
  { key: 'resource', label: 'Resources' },
  { key: 'discussion', label: 'Discussions' },
]

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; notice?: string; q?: string }>
}) {
  const { type, notice, q } = await searchParams
  const active = (TABS.find((t) => t.key === type)?.key ?? 'all') as PostType | 'all'
  const posts = await listPosts({ type: active === 'all' ? undefined : active, q })

  return (
    <VerifiedGate>
      <div className="relative">
        <h1 className="sr-only">Community feed</h1>
        <Contours className="pointer-events-none absolute -top-6 right-[-18%] h-[420px] w-[500px] text-[color-mix(in_srgb,var(--accent)_7%,transparent)]" />

      {notice && (
        <p className="mb-4 rounded-lg border border-accent/40 bg-accent/10 px-3 py-2 text-sm">
          {notice}
        </p>
      )}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <nav className="flex flex-wrap gap-1.5">
          {TABS.map((tab) => (
            <Link
              key={tab.key}
              href={tab.key === 'all' ? '/feed' : `/feed?type=${tab.key}`}
              aria-current={active === tab.key ? 'page' : undefined}
              className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                active === tab.key
                  ? 'border-accent bg-accent font-medium text-accent-fg'
                  : 'border-line bg-surface text-muted hover:text-foreground'
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <form action="/feed" className="flex items-center gap-1.5">
            <input
              type="search"
              name="q"
              defaultValue={q ?? ''}
              placeholder="Search or #tag"
              maxLength={60}
              className="w-44 rounded-full border border-line bg-surface px-3 py-1 text-sm outline-none focus:border-accent sm:w-56"
            />
            <button
              type="submit"
              className="rounded-full border border-line bg-surface px-3 py-1 text-sm text-muted transition-colors hover:border-muted/50 hover:text-foreground"
            >
              Search
            </button>
          </form>
          <Link
            href="/compose"
            className="rounded-lg bg-accent px-3 py-1.5 text-sm font-semibold text-accent-fg transition hover:shadow-card hover:brightness-110"
          >
            + New post
          </Link>
        </div>
      </div>

      {q && (
        <p className="mb-3 text-sm text-muted">
          Results for <span className="font-medium text-foreground">{q}</span>{' '}
          — <a href="/feed" className="text-accent hover:underline">clear</a>
        </p>
      )}

      {posts.length === 0 ? (
        <div className="card border-dashed col-span-full p-12 text-center">
          <p className="font-display text-lg font-semibold">Nothing here yet</p>
          <p className="mx-auto mt-1 max-w-xs text-sm text-muted">
            Ask the first doubt, drop an opportunity, or share a resource — one post starts the community.
          </p>
          <Link
            href="/compose"
            className="btnpress mt-5 inline-block rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-accent-fg transition hover:brightness-110"
          >
            Write the first post
          </Link>
        </div>
      ) : (
        <div className="relative grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(min(420px,100%),1fr))] lg:gap-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
      </div>
    </VerifiedGate>
  )
}
