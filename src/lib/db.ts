import { cache } from 'react'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { Profile, Post, CommentRow, ChatMessage, PostType, Role } from '@/lib/types'
// --- current user (once per request, reused by navbar/gate/pages) ---

export const getCurrentProfile = cache(async (): Promise<Profile | null> => {
  const supabase = await createSupabaseServerClient()
  // 0011: single roundtrip (RLS-bound by the session token; auth.uid() comes
  // from the token itself — no auth.getUser network stop, no extra query)
  const { data, error } = await supabase.rpc('current_member')
  if (error || !data || (Array.isArray(data) && data.length === 0)) return null
  const row = Array.isArray(data) ? data[0] : data
  // PostgREST serializes the null composite (zero rows matched, e.g. no
  // session cookie) as an ALL-NULL object, not null — so an anonymous
  // request used to render the member navbar. A member always has an id.
  if (!row?.id) return null
  return (row as Profile) ?? null
})

// --- posts ---

// expired opportunities are hidden from listings
const NOT_EXPIRED = () => `expires_at.is.null,expires_at.gt.${new Date().toISOString()}`

export async function listPosts(opts: { type?: PostType; q?: string; tag?: string }): Promise<Post[]> {
  const supabase = await createSupabaseServerClient()
  let query = supabase
    .from('posts')
    .select('*, profiles(name, batch, role)')
    .order('created_at', { ascending: false })
    .limit(50)

  if (opts.type) query = query.eq('type', opts.type)
  query = query.or(NOT_EXPIRED())

  if (opts.q) {
    const term = opts.q.replace(/[%_,()]/g, ' ').trim()
    if (term.startsWith('#') && term.length > 1) {
      // hashtag query: exact tag membership
      query = query.contains('tags', [term.slice(1)])
    } else if (term) {
      query = query.or(`title.ilike.%${term}%,body.ilike.%${term}%`)
    }
  }
  if (opts.tag) {
    // tags are stored lowercase; match case-insensitively whatever the searcher typed
    query = query.contains('tags', [opts.tag.toLowerCase()])
  }

  const { data } = await query
  return (data ?? []) as unknown as Post[]
}

export async function getPost(id: string): Promise<Post | null> {
  const supabase = await createSupabaseServerClient()
  const [{ data: post }, { data: comments }] = await Promise.all([
    supabase
      .from('posts')
      .select('*, profiles(name, batch, role)')
      .eq('id', id)
      .maybeSingle(),
    supabase
      .from('comments')
      .select('*, profiles(name, batch, role)')
      .eq('post_id', id)
      .order('created_at', { ascending: true }),
  ])
  if (!post) return null
  return { ...(post as unknown as Post), comments: comments as unknown as CommentRow[] }
}

export async function listUserPosts(authorId: string): Promise<Post[]> {
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase
    .from('posts')
    .select('*, profiles(name, batch, role)')
    .eq('author_id', authorId)
    .order('created_at', { ascending: false })
    .limit(50)
  return (data ?? []) as unknown as Post[]
}

// --- directory ---

export async function listProfiles(opts: {
  mentorsOnly?: boolean
  batch?: number
  search?: string
}): Promise<Profile[]> {
  const supabase = await createSupabaseServerClient()
  let query = supabase
    .from('profiles')
    .select('*')
    .eq('verified', true)
    .order('name', { ascending: true })
    .limit(100)

  if (opts.mentorsOnly) query = query.eq('mentor_available', true)
  if (opts.batch) query = query.eq('batch', opts.batch)
  if (opts.search) {
    const term = `%${opts.search}%`
    query = query.or(`name.ilike.${term},field.ilike.${term},current_org.ilike.${term}`)
  }

  const { data } = await query
  return (data ?? []) as Profile[]
}

export async function getProfile(id: string): Promise<Profile | null> {
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle()
  return (data as Profile | null) ?? null
}

// --- mentorship ---

export async function listMentorships(me: Profile): Promise<
  Array<{
    id: string
    status: string
    message: string
    student_id: string
    mentor_id: string
    created_at: string
    student: { name: string }
    mentor: { name: string }
  }>
> {
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase
    .from('mentorship_requests')
    .select(
      '*, student:profiles!mentorship_requests_student_id_fkey(name), mentor:profiles!mentorship_requests_mentor_id_fkey(name)',
    )
    .or(`student_id.eq.${me.id},mentor_id.eq.${me.id}`)
    .order('created_at', { ascending: false })
    .limit(30)
  return (data ?? []) as unknown as Array<{
    id: string
    status: string
    message: string
    student_id: string
    mentor_id: string
    created_at: string
    student: { name: string }
    mentor: { name: string }
  }>
}

// --- admin ---

export async function listPendingAlumni(): Promise<Profile[]> {
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('verified', false)
    .order('created_at', { ascending: true })
  return (data ?? []) as Profile[]
}

export async function listReports(): Promise<
  Array<{ id: string; post_id: string; reason: string; created_at: string; reporter: { name: string } }>
> {
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase
    .from('reports')
    .select('id, post_id, reason, created_at, reporter:profiles!reports_reporter_id_fkey(name)')
    .order('created_at', { ascending: false })
    .limit(50)
  return (data ?? []) as unknown as Array<{
    id: string
    post_id: string
    reason: string
    created_at: string
    reporter: { name: string }
  }>
}

// --- tags ---

export async function listTagCounts(): Promise<Array<{ tag: string; count: number }>> {
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase.from('posts').select('tags').limit(800)
  const counts = new Map<string, number>()
  for (const row of (data ?? []) as Array<{ tags: string[] }>) {
    for (const t of row.tags) counts.set(t, (counts.get(t) ?? 0) + 1)
  }
  return Array.from(counts, ([tag, count]) => ({ tag, count })).sort(
    (a, b) => b.count - a.count || a.tag.localeCompare(b.tag),
  )
}

// --- DMs ---

export type Conversation = {
  partnerId: string
  partnerName: string
  lastBody: string
  lastAt: string
  unread: number
}

export async function listConversations(me: Profile): Promise<Conversation[]> {
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase
    .from('messages')
    .select('sender_id, recipient_id, body, created_at, read_at')
    .or(`sender_id.eq.${me.id},recipient_id.eq.${me.id}`)
    .order('created_at', { ascending: false })
    .limit(300)
  const rows = (data ?? []) as Array<{
    sender_id: string
    recipient_id: string
    body: string
    created_at: string
    read_at: string | null
  }>

  const byPartner = new Map<string, Conversation>()
  for (const r of rows) {
    const partnerId = r.sender_id === me.id ? r.recipient_id : r.sender_id
    if (byPartner.has(partnerId)) {
      if (r.recipient_id === me.id && !r.read_at) {
        // only unread conversations gain an increment; messages already grouped
        const c = byPartner.get(partnerId)!
        c.unread += 1
      }
      continue
    }
    byPartner.set(partnerId, {
      partnerId,
      partnerName: '',
      lastBody: r.body,
      lastAt: r.created_at,
      unread: r.recipient_id === me.id && !r.read_at ? 1 : 0,
    })
  }

  const partnerIds = Array.from(byPartner.keys())
  if (partnerIds.length === 0) return []
  const { data: partners } = await supabase
    .from('profiles')
    .select('id, name')
    .in('id', partnerIds)
  for (const p of (partners ?? []) as Array<{ id: string; name: string }>) {
    const c = byPartner.get(p.id)
    if (c) c.partnerName = p.name
  }
  return Array.from(byPartner.values())
}

export async function getThread(me: Profile, partnerId: string) {
  const supabase = await createSupabaseServerClient()
  const { data: messages } = await supabase
    .from('messages')
    .select('id, sender_id, recipient_id, body, created_at, read_at')
    .or(
      `and(sender_id.eq.${me.id},recipient_id.eq.${partnerId}),and(sender_id.eq.${partnerId},recipient_id.eq.${me.id})`,
    )
    .order('created_at', { ascending: true })
    .limit(200)
  const { data: partner } = await supabase
    .from('profiles')
    .select('id, name, role, mentor_available')
    .eq('id', partnerId)
    .maybeSingle()

  return {
    messages: (messages ?? []) as ChatMessage[],
    partner: (partner ?? null) as { id: string; name: string; role: Role; mentor_available: boolean } | null,
  }
}

export const unreadCount = cache(async (): Promise<number> => {
  // one RPC round trip (migration 0006) — no separate count query
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase.rpc('nav_unread_count')
  return (data as number | null) ?? 0
})

