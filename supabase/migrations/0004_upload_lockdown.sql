-- 0004: upload lockdown + DM/mentorship hardening
-- V5: reject SVG/HTML uploads; objects must live in the owner's own uuid folder
-- V6: block DMs to unverified members
-- V7: one pending request per (student, mentor); no self-mentorship

-- V5: purge rogue objects (wrong MIME or outside owner's folder)
set storage.allow_delete_query = 'true';
delete from storage.objects
where bucket_id = 'post-images'
  and (
    (metadata->>'mimetype') not in ('image/jpeg','image/png','image/webp','image/gif')
    or (storage.foldername(name))[1] <> owner_id::text
  );
reset storage.allow_delete_query;

drop policy if exists "members_upload_post_images" on storage.objects;
create policy "members_upload_post_images" on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'post-images'
    and (storage.foldername(name))[1] = auth.uid()::text
    and metadata->>'mimetype' in ('image/jpeg','image/png','image/webp','image/gif')
  );

-- V6: security-definer lookup to avoid RLS recursion
create or replace function public.recipient_is_approved(recipient uuid)
returns boolean language sql security definer stable set search_path = '' as $$
  select verified from public.profiles where id = recipient;
$$;

drop policy if exists "insert_messages" on public.messages;
create policy "insert_messages" on public.messages for insert
  to authenticated
  with check (
    sender_id = auth.uid()
    and public.is_verified()
    and public.recipient_is_approved(recipient_id)
  );

-- V7: remove self-mentorship rows, then collapse duplicate pending pairs
delete from mentorship_requests where student_id = mentor_id;

delete from mentorship_requests mr
using mentorship_requests m2
where mr.student_id = m2.student_id
  and mr.mentor_id = m2.mentor_id
  and mr.status = 'pending'
  and m2.status = 'pending'
  and mr.created_at > m2.created_at;

create unique index mentorship_pending_unique_idx
  on public.mentorship_requests (student_id, mentor_id)
  where status = 'pending';

alter table public.mentorship_requests
  add constraint mentorship_no_self check (student_id <> mentor_id);
