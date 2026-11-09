const HUES = [
  'bg-accent/15 text-accent',
  'bg-question/15 text-question',
  'bg-opportunity/15 text-opportunity',
  'bg-discussion/15 text-foreground',
]

export function Avatar({ name, size = 28 }: { name: string | undefined; size?: number }) {
  const letters = (name ?? '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('')
  // stable hue per name
  let h = 0
  for (const ch of name ?? '?') h = (h * 31 + ch.charCodeAt(0)) % 997
  const hue = HUES[h % HUES.length]

  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold ${hue}`}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {letters || '?'}
    </span>
  )
}
