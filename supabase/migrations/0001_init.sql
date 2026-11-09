-- EES Connect schema — run this in the Supabase SQL editor, top to bottom.
-- After running: make one admin with
--   update public.profiles set role = 'admin' where email = 'you@iiserb.ac.in';

-- ===== tables =====

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default 'Unnamed',
  email text not null,
  role text not null default 'student'
    check (role in ('student', 'alumni', 'admin')),
  verified boolean not null default false,
  batch int check (batch between 2008 and 2100),  -- graduating year
  field text,
  bio text,
  current_org text,
  mentor_available boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('question', 'opportunity', 'resource', 'discussion')),
  title text not null check (char_length(title) between 3 and 200),
  body text not null check (char_length(body) <= 8000),
  tags text[] not null default '{}',
  link_url text,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 4000),
  created_at timestamptz not null default now()
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reason text not null default '',
  created_at timestamptz not null default now()
);

create table public.mentorship_requests (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  mentor_id uuid not null references public.profiles(id) on delete cascade,
  message text not null default '',
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz not null default now()
);

create index posts_type_idx on public.posts (type, created_at desc);
create index profiles_batch_idx on public.profiles (batch);
create index profiles_mentors_idx on public.profiles (mentor_available) where mentor_available;

-- ===== helper functions for policies =====
-- security definer: the real access checks, invisible to RLS recursion

create or replace function public.app_role()
returns text language sql security definer stable set search_path = '' as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_verified()
returns boolean language sql security definer stable set search_path = '' as $$
  select coalesce(verified, false) from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean language sql security definer stable set search_path = '' as $$
  select coalesce(role = 'admin', false) from public.profiles where id = auth.uid();
$$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, email, name, role, verified)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', 'Unnamed'),
    -- clients declare student/alumni at signup; students stay students
    case coalesce(new.raw_user_meta_data ->> 'role', 'student')
      when 'student' then 'student'
      when 'alumni' then 'alumni'
      else 'student'
    end,
    -- institute emails are trusted; everyone else awaits admin approval
    split_part(coalesce(new.email, ''), '@', 2) = 'iiserb.ac.in'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ===== row level security =====

alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.reports enable row level security;
alter table public.mentorship_requests enable row level security;

-- profiles: members see members; unverified don't exist to anyone but admins
create policy "read_profiles" on public.profiles for select
  to authenticated
  using (verified or public.is_admin() or id = auth.uid());

create policy "update_own_profile" on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid() and role = (select public.app_role()));

create policy "admin_updates_accounts" on public.profiles for update
  to authenticated using (public.is_admin());

-- posts: only verified members post
create policy "read_posts" on public.posts for select
  to authenticated using (public.is_verified() or public.is_admin());

create policy "insert_posts" on public.posts for insert
  to authenticated with check (author_id = auth.uid() and public.is_verified());

create policy "delete_posts" on public.posts for delete
  to authenticated using (author_id = auth.uid() or public.is_admin());

-- comments: same gate
create policy "read_comments" on public.comments for select
  to authenticated using (public.is_verified() or public.is_admin());

create policy "insert_comments" on public.comments for insert
  to authenticated with check (author_id = auth.uid() and public.is_verified());

create policy "delete_comments" on public.comments for delete
  to authenticated using (author_id = auth.uid() or public.is_admin());

-- reports: write-only for members, admins read and act
create policy "insert_reports" on public.reports for insert
  to authenticated with check (reporter_id = auth.uid() and public.is_verified());

create policy "admin_reads_reports" on public.reports for select
  to authenticated using (public.is_admin());

create policy "admin_deletes_reports" on public.reports for delete
  to authenticated using (public.is_admin());

-- mentorship: student creates, mentor owns the accept
create policy "read_requests" on public.mentorship_requests for select
  to authenticated using (student_id = auth.uid() or mentor_id = auth.uid() or public.is_admin());

create policy "create_requests" on public.mentorship_requests for insert
  to authenticated with check (student_id = auth.uid() and public.is_verified());

create policy "update_requests" on public.mentorship_requests for update
  to authenticated using (mentor_id = auth.uid() or public.is_admin());
