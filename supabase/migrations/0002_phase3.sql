-- Phase 3: DMs (with Realtime), images on posts, storage bucket.

alter table public.posts add column if not exists image_url text;

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now(),
  read_at timestamptz,
  check (sender_id <> recipient_id)
);

create index messages_thread_idx on public.messages (sender_id, recipient_id, created_at desc);
create index messages_recipient_idx on public.messages (recipient_id, read_at) where read_at is null;

alter table public.messages enable row level security;

-- both parties must be approved members
create policy "read_messages" on public.messages for select
  to authenticated
  using ((sender_id = auth.uid() or recipient_id = auth.uid()) and public.is_verified());

create policy "insert_messages" on public.messages for insert
  to authenticated
  with check (sender_id = auth.uid() and public.is_verified());

create policy "mark_read" on public.messages for update
  to authenticated
  using (recipient_id = auth.uid())
  with check (recipient_id = auth.uid());

-- stream inserts of this table over Realtime (publications already exist)
do $$ begin
  alter publication supabase_realtime add table public.messages;
exception when duplicate_object then null;
when undefined_object then null;
end $$;

-- public image bucket for post attachments
insert into storage.buckets (id, name, public)
values ('post-images', 'post-images', true)
on conflict (id) do update set public = true;

create policy "read_post_images" on storage.objects for select
  using (bucket_id = 'post-images');

create policy "members_upload_post_images" on storage.objects for insert
  to authenticated
  with check (bucket_id = 'post-images');

create policy "owners_remove_post_images" on storage.objects for delete
  to authenticated
  using (bucket_id = 'post-images' and owner_id::text = auth.uid()::text);
