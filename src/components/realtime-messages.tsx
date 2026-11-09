'use client'

import { useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { markThreadRead } from '@/app/actions'

// Page-level realtime: any INSERT into `messages` that touches this member
// re-renders the server page (sidebar counts, badges, open thread all update).
// Writes stay RLS-gated, so events for other people never reach this client.
export function RealtimeMessages({
  myId,
  openPartnerId,
}: {
  myId: string
  openPartnerId?: string
}) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  useEffect(() => {
    const supabase = createSupabaseBrowserClient()
    const channel = supabase
      .channel('messages-feed')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const m = payload.new as { sender_id: string; recipient_id: string }
          if (m.sender_id === myId || m.recipient_id === myId) {
            // a message landing in the thread the member is reading: keep
            // the badges honest by marking it read before the re-render
            if (m.recipient_id === myId && m.sender_id === openPartnerId) {
              startTransition(async () => {
                await markThreadRead(openPartnerId)
                router.refresh()
              })
            } else {
              router.refresh()
            }
          }
        },
      )
      // keep an eye on the connection for silent failures to report in dev
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.warn(`[realtime] connection ${status} — badge/push updates may lag`)
        }
      })
    return () => {
      void supabase.removeChannel(channel)
    }
  }, [myId, openPartnerId, router])
  return null
}
