import Link from 'next/link'
import { listPosts } from '@/lib/db'
import { PostCard } from '@/components/post-card'
import { VerifiedGate } from '@/components/verified-gate'
import { Contours } from '@/components/contours'

export default async function TagPage({ params }: { params: Promise<{ tag: string }> }) {
  const { tag: raw } = await params
  const tag = decodeURIComponent(raw).replace(/[^a-zA-Z0-9 _-]/g, '').trim().slice(0, 40)
  const posts = await listPosts({ tag })

  return (
    <VerifiedGate>
      <div className="relative mx-auto w-full max-w-6xl xl:max-w-7xl 2xl:max-w-[88rem]">
        <Contours className="pointer-events-none absolute -top-6 right-[-18%] h-[420px] w-[500px] text-[color-mix(in_srgb,var(--accent)_7%,transparent)]" />
        <Link href="/tags" className="text-sm text-muted hover:text-foreground">
          ← Tags
        </Link>
        <h1 className="font-display mt-2 text-[clamp(1.75rem,3vw,2.5rem)] font-semibold tracking-tight">
          <span className="font-mono">#{tag}</span>
        </h1>
        <p className="mb-5 mt-1 text-sm text-muted">
          {posts.length} {posts.length === 1 ? 'post' : 'posts'}
        </p>

        {posts.length === 0 ? (
          <div className="card border-dashed p-10 text-center text-muted col-span-full">
            Nothing under this tag yet.
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
