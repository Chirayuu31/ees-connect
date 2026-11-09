import Link from 'next/link'
import { TypeBadge } from '@/components/badges'
import { Avatar } from '@/components/avatar'
import type { Post } from '@/lib/types'

export function PostCard({ post }: { post: Post }) {
  const author = post.profiles
  return (
    <article className="card card-hover p-5">
      <div className="flex items-center gap-3">
        <Avatar name={author?.name} />
        <div className="min-w-0 text-xs text-muted">
          <span>
            <Link href={`/u/${post.author_id}`} className="font-medium text-foreground hover:underline">
              {author?.name ?? 'Unknown'}
            </Link>
          </span>
          <span className="mx-1.5">·</span>
          {new Date(post.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
        </div>
        <span className="ml-auto shrink-0">
          <TypeBadge type={post.type} />
        </span>
      </div>

      <Link href={`/post/${post.id}`} className="mt-3 block">
        <h3 className="font-display text-lg font-semibold leading-snug text-foreground/95 [text-wrap:balance]">{post.title}</h3>
        {post.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.image_url} alt="" className="mt-2 aspect-[16/10] w-full rounded-lg object-cover" loading="lazy" />
        )}
        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted">{post.body}</p>
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted">
        {post.link_url && (
          <a
            href={post.link_url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-accent underline-offset-2 hover:underline"
          >
            Link ↗
          </a>
        )}
        {post.tags.map((tag) => (
          <span key={tag} className="rounded-full bg-background px-2 py-0.5 font-mono text-[11px]">
            #{tag}
          </span>
        ))}
        {(post.comments?.length ?? 0) > 0 && (
          <span className="ml-auto font-medium">{post.comments?.length} replies</span>
        )}
      </div>
    </article>
  )
}
