import type { PostType } from '@/lib/types'

export function TypeBadge({ type }: { type: PostType }) {
  const styles = {
    question: 'bg-question/10 text-question border-question/30',
    opportunity: 'bg-opportunity/10 text-opportunity border-opportunity/30',
    resource: 'bg-resource/10 text-resource border-resource/30',
    discussion: 'bg-discussion/10 text-muted border-line',
  } as const
  return (
    <span
      className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-medium leading-5 ${styles[type]}`}
    >
      {type}
    </span>
  )
}

export function RoleBadge({ role }: { role: string }) {
  if (role === 'alumni')
    return (
      <span className="rounded-full border border-line bg-background px-2 py-0.5 text-[11px] leading-5 text-muted">
        Alum
      </span>
    )
  if (role === 'admin')
    return (
      <span className="rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-[11px] font-medium leading-5 text-accent">
        Admin
      </span>
    )
  return null
}
