'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getCurrentProfile } from '@/lib/db'
import { sendMail } from '@/lib/mail'
import type { PostType } from '@/lib/types'

const IISERB_DOMAIN = 'iiserb.ac.in'

// ---------- auth ----------

export async function signup(formData: FormData) {
  const name = formData.get('name') as string
  const email = (formData.get('email') as string).toLowerCase().trim()
  const password = formData.get('password') as string
  const role = formData.get('role') === 'student' ? 'student' : 'alumni'

  if (!name || !email || !password || password.length < 8) {
    redirect(`/signup/${role}?error=Please+fill+all+fields+(password+min+8+chars)`)
  }

  if (role === 'student' && !email.endsWith(`@${IISERB_DOMAIN}`)) {
    redirect('/signup/student?error=An+IISER+Bhopal+email+is+required+to+sign+up+as+a+student')
  }

  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: name, role },
      ...(process.env.NEXT_PUBLIC_SITE_URL && {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      }),
    },
  })

  if (error) {
    redirect(`/signup/${role}?error=${encodeURIComponent(error.message)}`)
  }

  if (data?.user && !data.session) {
    redirect(`/login/${role}?notice=Check+your+inbox+to+confirm+your+email`)
  }

  redirect('/onboarding')
}

export async function login(formData: FormData) {
  const email = (formData.get('email') as string).toLowerCase().trim()
  const password = formData.get('password') as string
  const role = formData.get('role') === 'alumni' ? 'alumni' : 'student'
  const supabase = await createSupabaseServerClient()

  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    redirect(`/login/${role}?error=${encodeURIComponent(error.message)}`)
  }
  const nextParam = formData.get('next') as string | null
  // '/foo' is safe, '//evil.com' is a protocol-relative open redirect
  redirect(
    nextParam && nextParam.startsWith('/') && !nextParam.startsWith('//') ? nextParam : '/feed',
  )
}

export async function logout() {
  const supabase = await createSupabaseServerClient()
  await supabase.auth.signOut()
  redirect('/login')
}

// ---------- content (all writes are re-checked by RLS in the DB) ----------

export async function createPost(formData: FormData) {
  const profile = await requireProfile()

  const type = formData.get('type') as PostType
  const title = ((formData.get('title') as string) ?? '').trim()
  const body = ((formData.get('body') as string) ?? '').trim()
  const rawTags = ((formData.get('tags') as string) ?? '').trim()
  const linkUrl = ((formData.get('link_url') as string) ?? '').trim()

  if (!title || !body || !['question', 'opportunity', 'resource', 'discussion'].includes(type)) {
    redirect(`/compose?error=Missing+title+or+body`)
  }

  if (linkUrl && !/^https?:\/\//.test(linkUrl)) {
    redirect('/compose?error=Link+must+start+with+http(s)://')
  }

  const tags = rawTags ? rawTags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean).slice(0, 5) : []

  const supabase = await createSupabaseServerClient()

  // optional image upload (≤2 MB straight to Supabase Storage)
  let imageUrl: string | null = null
  const file = formData.get('image') as File | null
  if (file && file.size > 0) {
    if (!file.type.startsWith('image/')) {
      redirect('/compose?error=Only+image+files+can+be+attached')
    }
    if (file.size > 2 * 1024 * 1024) {
      redirect('/compose?error=Image+must+be+under+2MB')
    }
    const path = `${profile.id}/${Date.now()}-${file.name.replace(/[^\w.-]/g, '_')}`.slice(0, 140)
    const { error: upErr } = await supabase.storage.from('post-images').upload(path, file, {
      contentType: file.type,
      upsert: false,
    })
    if (upErr) redirect(`/compose?error=${encodeURIComponent(upErr.message)}`)
    imageUrl = supabase.storage.from('post-images').getPublicUrl(path).data.publicUrl
  }

  const { error } = await supabase.from('posts').insert({
    author_id: profile.id,
    type,
    title: title.slice(0, 200),
    body: body.slice(0, 8000),
    tags,
    link_url: linkUrl ? linkUrl.slice(0, 2000) : null,
    image_url: imageUrl,
    expires_at: type === 'opportunity' ? defaultExpiry() : null,
  })

  if (error) redirect(`/compose?error=${encodeURIComponent(error.message)}`)
  revalidatePath('/feed')
  redirect('/feed')
}

export async function createComment(formData: FormData) {
  const profile = await requireProfile()
  const postId = formData.get('post_id') as string
  const body = ((formData.get('body') as string) ?? '').trim()
  if (!postId || !body) return

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.from('comments').insert({
    post_id: postId,
    author_id: profile.id,
    body: body.slice(0, 4000),
  })
  if (!error) {
    // notify the post author (skipped silently without RESEND_API_KEY)
    const { data: post } = await supabase
      .from('posts')
      .select('author_id, title, profiles:author_id (email)')
      .eq('id', postId)
      .maybeSingle()
    const author = post?.profiles as unknown as { email?: string } | undefined
    if (author?.email && post && post.author_id !== profile.id) {
      void sendMail(
        author.email,
        `EES Connect: ${profile.name} replied to your post`,
        `${profile.name} replied to "${post.title}":\n\n"${body.slice(0, 200)}"\n\nOpen EES Connect to read and respond.`,
      )
    }
  }
  revalidatePath(`/post/${postId}`)
}

export async function updateProfile(formData: FormData) {
  const profile = await requireProfile()

  const batchRaw = (formData.get('batch') as string) ?? ''
  const batch = batchRaw ? Number(batchRaw) : null

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase
    .from('profiles')
    .update({
      name: ((formData.get('name') as string) ?? '').trim() || profile.name,
      batch: batch && batch >= 2008 ? batch : null,
      field: (((formData.get('field') as string) ?? '').trim() || null),
      bio: (((formData.get('bio') as string) ?? '').trim() || null),
      current_org: (((formData.get('current_org') as string) ?? '').trim() || null),
      mentor_available: formData.get('mentor_available') === 'on',
    })
    .eq('id', profile.id)

  if (error) redirect(`/settings?error=${encodeURIComponent(error.message)}`)
  revalidatePath('/directory')
  redirect('/settings?notice=Profile+saved')
}

// ---------- account settings ----------

export async function changePassword(formData: FormData) {
  await requireProfile()
  const next = formData.get('password') as string
  const confirm = formData.get('confirm') as string

  if (!next || next.length < 8) {
    redirect('/settings?error=Password+must+be+at+least+8+characters')
  }
  if (next !== confirm) {
    redirect('/settings?error=Passwords+do+not+match')
  }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.updateUser({ password: next })
  if (error) redirect(`/settings?error=${encodeURIComponent(error.message)}`)
  redirect('/settings?notice=Password+updated')
}

export async function changeEmail(formData: FormData) {
  const profile = await requireProfile()
  const email = ((formData.get('email') as string) ?? '').toLowerCase().trim()

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    redirect('/settings?error=Enter+a+valid+email')
  }
  if (email.endsWith('@iiserb.ac.in') !== profile.email.endsWith('@iiserb.ac.in')) {
    // keep the no-approval-needed invariant: student emails must stay institute
    redirect('/settings?error=Students+keep+their+iiserb+email+while+studying')
  }

  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.auth.updateUser({
    email,
    ...(process.env.NEXT_PUBLIC_SITE_URL && {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    }),
  })
  if (error) redirect(`/settings?error=${encodeURIComponent(error.message)}`)

  const pending = (data?.user?.new_email ?? '') !== ''

  if (pending) {
    // hosted projects double-opt-in: the new inbox confirms first
    redirect('/settings?notice=Confirmation+sent+to+' + encodeURIComponent(email))
  }

  // local dev (confirmations off) changes immediately — keep the
  // denormalised profile in sync or notifications go to the old address
  await supabase.from('profiles').update({ email }).eq('id', profile.id)
  redirect('/settings?notice=Email+updated')
}

// ---------- admin ----------
// deliberately no "reject": pending alumni simply stay unverified and
// invisible (RLS blocks them) — accounts are never deleted from the app

async function requireProfile() {
  const profile = await getCurrentProfile()
  if (!profile) redirect('/login')
  return profile
}

async function requireAdmin() {
  const profile = await requireProfile()
  if (profile.role !== 'admin') redirect('/')
  return profile
}

export async function approveUser(userId: string) {
  await requireAdmin()
  const supabase = await createSupabaseServerClient()
  await supabase.from('profiles').update({ verified: true }).eq('id', userId)
  revalidatePath('/admin')
}

export async function deletePost(postId: string) {
  await requireAdmin()
  const supabase = await createSupabaseServerClient()
  // remove any attached image before the row goes — no orphans in storage
  const { data: post } = await supabase
    .from('posts')
    .select('image_url')
    .eq('id', postId)
    .maybeSingle()
  const imageUrl = post?.image_url
  if (imageUrl) {
    const marker = '/object/public/post-images/'
    const path = imageUrl.slice(imageUrl.indexOf(marker) + marker.length)
    await supabase.storage.from('post-images').remove([decodeURIComponent(path)])
  }
  await supabase.from('posts').delete().eq('id', postId)
  revalidatePath('/admin')
  revalidatePath('/feed')
}

export async function dismissReport(reportId: string) {
  await requireAdmin()
  const supabase = await createSupabaseServerClient()
  await supabase.from('reports').delete().eq('id', reportId)
  revalidatePath('/admin')
}

export async function reportPost(formData: FormData) {
  const profile = await requireProfile()
  const postId = formData.get('post_id') as string
  const reason = ((formData.get('reason') as string) ?? '').trim().slice(0, 300)
  if (!postId) return

  const supabase = await createSupabaseServerClient()
  // don't double-report the same post
  const { data: existing } = await supabase
    .from('reports')
    .select('id')
    .eq('post_id', postId)
    .eq('reporter_id', profile.id)
    .maybeSingle()
  if (existing) return

  await supabase.from('reports').insert({ post_id: postId, reporter_id: profile.id, reason })
  revalidatePath('/post/' + postId)
}

// ---------- mentorship ----------

export async function requestMentorship(formData: FormData) {
  const profile = await requireProfile()
  const mentorId = formData.get('mentor_id') as string
  const message = ((formData.get('message') as string) ?? '').trim().slice(0, 500)
  if (!mentorId || mentorId === profile.id) redirect('/directory')

  const supabase = await createSupabaseServerClient()
  // one open request per mentor
  const { data: existing } = await supabase
    .from('mentorship_requests')
    .select('id, status')
    .eq('student_id', profile.id)
    .eq('mentor_id', mentorId)
    .maybeSingle()
  if (existing) {
    redirect(`/u/${mentorId}?notice=${existing.status === 'pending' ? 'Request+already+pending' : 'Already+' + existing.status}`)
  }

  const { error } = await supabase.from('mentorship_requests').insert({
    student_id: profile.id,
    mentor_id: mentorId,
    message,
  })
  if (error) redirect(`/u/${mentorId}?error=${encodeURIComponent(error.message)}`)

  // notify the mentor (skipped silently without RESEND_API_KEY)
  const { data: mentor } = await supabase
    .from('profiles')
    .select('email, name')
    .eq('id', mentorId)
    .maybeSingle()
  void sendMail(
    mentor?.email,
    `EES Connect: ${profile.name} asked for your mentorship`,
    `${profile.name} (${profile.email}) sent you a mentorship request${message ? `:\n\n"${message}"` : ''}\n\nOpen EES Connect to respond.`,
  )

  revalidatePath(`/u/${mentorId}`)
  redirect(`/u/${mentorId}?notice=Request+sent`)
}

export async function respondMentorship(requestId: string, accept: boolean) {
  const profile = await requireProfile()
  const supabase = await createSupabaseServerClient()

  const { data: req } = await supabase
    .from('mentorship_requests')
    .select('id, student_id, mentor_id')
    .eq('id', requestId)
    .maybeSingle()
  if (!req || req.mentor_id !== profile.id) return

  const status = accept ? 'accepted' : 'declined'
  await supabase.from('mentorship_requests').update({ status }).eq('id', requestId)

  const { data: student } = await supabase
    .from('profiles')
    .select('email, name')
    .eq('id', req.student_id)
    .maybeSingle()
  void sendMail(
    student?.email,
    accept
      ? `EES Connect: ${profile.name} accepted your mentorship request`
      : `EES Connect: mentorship request update`,
    accept
      ? `${profile.name} accepted your mentorship request. Reach out to them via the directory or by replying to their posts.`
      : `${profile.name} cannot mentor you right now. Try another mentor from the directory.`,
  )

  revalidatePath(`/u/${profile.id}`)
}


// ---------- helpers ----------

function defaultExpiry(): string {
  const d = new Date()
  d.setMonth(d.getMonth() + 3)
  return d.toISOString()
}

// ---------- DMs ----------

export async function markThreadRead(partnerId: string) {
  const profile = await requireProfile()
  const supabase = await createSupabaseServerClient()
  await supabase
    .from('messages')
    .update({ read_at: new Date().toISOString() })
    .eq('recipient_id', profile.id)
    .eq('sender_id', partnerId)
    .is('read_at', null)
}

export async function sendMessage(formData: FormData) {
  const profile = await requireProfile()
  const recipientId = formData.get('recipient_id') as string
  const body = ((formData.get('body') as string) ?? '').trim()
  if (!recipientId || !body || recipientId === profile.id) return { ok: false }

  const supabase = await createSupabaseServerClient()
  const { data: partner } = await supabase
    .from('profiles')
    .select('id, email, name')
    .eq('id', recipientId)
    .maybeSingle()
  if (!partner) return { ok: false }

  const { error } = await supabase.from('messages').insert({
    sender_id: profile.id,
    recipient_id: recipientId,
    body: body.slice(0, 2000),
  })
  if (error) return { ok: false }

  void sendMail(
    partner.email,
    `EES Connect: ${profile.name} messaged you`,
    `${profile.name}: "${body.slice(0, 200)}"\n\nReply on EES Connect.`,
  )
  return { ok: true }
}
