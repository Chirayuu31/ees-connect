'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { sendMessage, markThreadRead } from '@/app/actions'

export type ChatBubble = {
  id: string
  mine: boolean
  body: string
  created_at: string
}

// Appends to the thread live (via server re-render) whenever a message
// touching this pair lands — including the ones you send yourself.
export function ChatThread({
  partnerId,
  partnerName,
  initial,
}: {
  partnerId: string
  partnerName: string
  initial: ChatBubble[]
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [text, setText] = useState('')
  const [failed, setFailed] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' })
  }, [initial.length])

  // read receipts bubble up to the navbar badge on the next render
  useEffect(() => {
    startTransition(async () => {
      await markThreadRead(partnerId)
      router.refresh()
    })
  }, [partnerId, router])

  const send = () => {
    const body = text.trim()
    if (!body) return
    setText('')
    setFailed(false)
    const fd = new FormData()
    fd.set('recipient_id', partnerId)
    fd.set('body', body)
    startTransition(async () => {
      const res = await sendMessage(fd)
      if (res && !res.ok) {
        // don't eat the sender's message on a transient failure
        setText(body)
        setFailed(true)
        return
      }
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col">
      <div
        className="flex max-h-[60vh] min-h-40 flex-col gap-2 overflow-y-auto pr-1"
        role="log"
        aria-label={`Conversation with ${partnerName}`}
        aria-live="polite"
      >
        {initial.length === 0 && (
          <p className="py-8 text-center text-sm text-muted">Say hello to {partnerName} 👋</p>
        )}
        {initial.map((m) => (
          <div key={m.id} className={m.mine ? 'self-end' : 'self-start'}>
            <div
              className={`max-w-[75ch] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                m.mine
                  ? 'bg-accent text-accent-fg'
                  : 'border border-line bg-surface'
              }`}
            >
              {m.body}
            </div>
            <p className={`mt-0.5 text-[10px] text-muted ${m.mine ? 'text-right' : ''}`}>
              {new Date(m.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              {m.mine && ' · you'}
            </p>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <form
        className="mt-3 flex items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          send()
        }}
      >
          <input type="hidden" name="recipient_id" value={partnerId} />
          <input
            type="text"
            name="body"
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={2000}
            placeholder={`Message ${partnerName}…`}
            className="min-w-0 flex-1 rounded-full border border-line bg-surface px-3.5 py-2 text-sm outline-none focus:border-accent"
          />
          <button
            type="submit"
            disabled={pending || !text.trim()}
            className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-fg transition hover:brightness-110 disabled:opacity-40"
          >
            {pending ? 'Send…' : '→'}
          </button>
      </form>
      {failed && (
        <p className="mt-1 text-xs text-opportunity">
          Message couldn&apos;t send — it&apos;s back in the box. Try again.
        </p>
      )}
    </div>
  )
}
