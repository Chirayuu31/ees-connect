import { createPost } from '@/app/actions'
import { VerifiedGate } from '@/components/verified-gate'

export default async function ComposePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; type?: string }>
}) {
  const { error, type } = await searchParams
  const selected = (['question', 'opportunity', 'resource', 'discussion'] as const).includes(
    type as never,
  )
    ? (type as string)
    : 'discussion'

  return (
    <VerifiedGate>
      <div className="mx-auto max-w-xl">
        <h1 className="font-display mb-1 text-[clamp(1.75rem,2.8vw,2.5rem)] font-semibold tracking-tight">New post</h1>
        <p className="mb-6 text-sm text-muted">
          Visible to every approved member. Be specific — good titles get replies.
        </p>

        {error && (
          <p className="mb-4 rounded-lg border border-opportunity/40 bg-opportunity/10 px-3 py-2 text-sm">
            {error}
          </p>
        )}

        <form action={createPost} className="space-y-4">
          <fieldset className="flex flex-wrap gap-1.5">
            {(['question', 'opportunity', 'resource', 'discussion'] as const).map((t) => (
              <label key={t} className="cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  value={t}
                  defaultChecked={t === selected}
                  className="peer sr-only"
                />
                <span className="inline-block rounded-full border border-line bg-surface px-3 py-1 text-sm capitalize text-muted peer-checked:border-accent peer-checked:bg-accent peer-checked:font-medium peer-checked:text-accent-fg">
                  {t === 'question' ? 'Doubt' : t}
                </span>
              </label>
            ))}
          </fieldset>

          <label className="block">
            <span className="mb-1 block text-sm font-medium">Title</span>
            <input
              type="text"
              name="title"
              required
              minLength={3}
              maxLength={200}
              placeholder="e.g. GATE Environmental Science prep — what worked for you?"
              className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium">Details</span>
            <textarea
              name="body"
              required
              rows={7}
              maxLength={8000}
              placeholder="Give the full context so someone can actually help…"
              className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium">Link (optional)</span>
            <input
              type="url"
              name="link_url"
              maxLength={2000}
              placeholder="https://…"
              className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium">Image (optional, ≤2 MB)</span>
            <input
              type="file"
              name="image"
              accept="image/*"
              className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-background file:px-2.5 file:py-1 file:text-xs file:font-medium"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium">Tags (comma-separated, optional)</span>
            <input
              type="text"
              name="tags"
              maxLength={120}
              placeholder="gate, phd, monsoon"
              className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </label>

          <button
            type="submit"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-fg transition hover:shadow-card hover:brightness-110"
          >
            Post
          </button>
        </form>
      </div>
    </VerifiedGate>
  )
}
