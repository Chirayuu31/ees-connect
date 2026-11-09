import Link from 'next/link'
import { listTagCounts } from '@/lib/db'
import { VerifiedGate } from '@/components/verified-gate'

export default async function TagsPage() {
  const tags = await listTagCounts()

  return (
    <VerifiedGate>
      <div className="mx-auto w-full max-w-6xl xl:max-w-7xl 2xl:max-w-[88rem]">
        <h1 className="font-display text-[clamp(1.75rem,3vw,2.5rem)] font-semibold tracking-tight">Tags</h1>
        <p className="mt-1 text-sm text-muted">Every topic the community has written about so far.</p>

        {tags.length === 0 ? (
          <div className="card mt-6 border-dashed p-10 text-center text-muted">
            No tags yet — add some when you post.
          </div>
        ) : (
          <div className="mt-6 flex flex-wrap gap-2">
            {tags.map(({ tag, count }) => (
              <Link
                key={tag}
                href={`/tags/${tag}`}
                className="card card-hover px-3.5 py-1.5 text-sm"
              >
                <span className="font-mono text-[13px]">#{tag}</span>
                <span className="ml-1.5 text-xs text-muted">{count}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </VerifiedGate>
  )
}
