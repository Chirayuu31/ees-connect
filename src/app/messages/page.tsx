import Link from 'next/link'
import { getCurrentProfile, listConversations, getThread, unreadCount } from '@/lib/db'
import { VerifiedGate } from '@/components/verified-gate'
import { Avatar } from '@/components/avatar'
import { ChatThread, type ChatBubble } from '@/components/chat-thread'
import { RealtimeMessages } from '@/components/realtime-messages'

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ with?: string }>
}) {
  return (
    <VerifiedGate>
      <MessagesInner searchParams={searchParams} />
    </VerifiedGate>
  )
}

async function MessagesInner({
  searchParams,
}: {
  searchParams: Promise<{ with?: string }>
}) {
  const profile = (await getCurrentProfile())!
  const { with: withId } = await searchParams
  const conversations = await listConversations(profile)
  // garbage ids would 400 the PostgREST query; treat them as "no thread"
  const withPartner =
    withId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(withId)
      ? withId
      : undefined
  const [{ messages, partner }, unread] = await Promise.all([
    withPartner ? getThread(profile, withPartner) : Promise.resolve({ messages: [], partner: null }),
    unreadCount(),
  ])

  return (
    <div className="mx-auto w-full max-w-6xl xl:max-w-7xl 2xl:max-w-[88rem]">
      <RealtimeMessages myId={profile.id} openPartnerId={withPartner ?? undefined} />
      <div className="mb-4 flex items-baseline justify-between">
        <h1 className="font-display text-[clamp(1.75rem,3vw,2.5rem)] font-semibold tracking-tight">Messages</h1>
        <Link href="/directory" className="text-sm text-muted hover:underline">
          Find someone →
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
        <aside className="card h-fit max-h-[70vh] overflow-y-auto p-2">
          <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wide text-muted">
            Conversations {unread > 0 && <span className="ml-1 rounded-full bg-opportunity px-1.5 text-[10px] text-background">{unread}</span>}
          </p>
          {conversations.length === 0 && (
            <p className="px-2 py-3 text-sm text-muted">
              No conversations yet. <Link href="/directory" className="text-accent hover:underline">Find people</Link> and say hi.
            </p>
          )}
          {conversations.map((c) => (
            <Link
              key={c.partnerId}
              href={`/messages?with=${c.partnerId}`}
              className={`flex items-center gap-2.5 rounded-xl px-2 py-2 text-sm transition-colors ${
                c.partnerId === withPartner ? 'bg-accent/10' : 'hover:bg-background'
              }`}
            >
              <Avatar name={c.partnerName} size={32} />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">{c.partnerName || 'Member'}</span>
                <span className="block truncate text-xs text-muted">{c.lastBody}</span>
              </span>
              {c.unread > 0 && (
                <span className="rounded-full bg-opportunity px-1.5 py-0.5 text-[10px] font-bold text-background">
                  {c.unread}
                </span>
              )}
            </Link>
          ))}
        </aside>

        <div className="card p-4 sm:p-5">
          {partner && withPartner ? (
            <>
              <div className="mb-3 flex items-center gap-2.5 border-b border-line pb-3">
                <Avatar name={partner.name} size={36} />
                <div>
                  <Link href={`/u/${partner.id}`} className="font-semibold hover:underline">
                    {partner.name}
                  </Link>
                  <p className="text-xs text-muted">
                    {partner.role === 'alumni' ? 'Alum' : partner.role === 'admin' ? 'Admin' : 'Student'}
                    {partner.role !== 'student' && partner.mentor_available ? ' · open to mentoring' : ''}
                  </p>
                </div>
              </div>
              <ChatThread
                partnerId={partner.id}
                partnerName={partner.name.split(' ')[0]}
                initial={messages.map(
                  (m): ChatBubble => ({
                    id: m.id,
                    mine: m.sender_id === profile.id,
                    body: m.body,
                    created_at: m.created_at,
                  }),
                )}
              />
            </>
          ) : (
            <div className="grid min-h-40 place-content-center text-center text-sm text-muted">
              <p>Select a conversation, or find someone in the directory to start one.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
