-- 0008: mentorship requests must target approved members (same boundary as DMs)

drop policy if exists "create_requests" on public.mentorship_requests;
create policy "create_requests" on public.mentorship_requests for insert
  to authenticated
  with check (
    student_id = auth.uid()
    and public.is_verified()
    and public.recipient_is_approved(mentor_id)
  );
