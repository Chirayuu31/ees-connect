-- Phase 3.5: security hardening — fixes found by attacker-simulation testing
-- V1: unverified members could self-verify (PATCH profiles set verified=true)
-- V2: javascript: URLs could be stored in link_url / image_url (stored XSS)
-- V3: unverified members could read the member directory incl. emails

-- V3b: pending (unverified) profiles are visible only to admins and self;
-- members see exactly the approved directory.
drop policy if exists "read_profiles" on public.profiles;
create policy "read_profiles" on public.profiles for select
  to authenticated
  using (
    (public.is_verified() and verified) or public.is_admin() or id = auth.uid()
  );

-- V1: non-admins may not change role/verified themselves
create or replace function public.assert_no_escalation()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if (new.verified is distinct from old.verified or new.role is distinct from old.role)
     and not public.is_admin() then
    raise exception 'only admins can change role or verification';
  end if;
  return new;
end;
$$;

create trigger profiles_no_escalation
  before update on public.profiles
  for each row execute function public.assert_no_escalation();

drop policy if exists "admin_updates_accounts" on public.profiles;
create policy "admin_updates_accounts" on public.profiles for update
  to authenticated using (public.is_admin());

-- V2: only http(s) links are storable
alter table public.posts drop constraint if exists link_url_http;
alter table public.posts
  add constraint link_url_http check (
    link_url is null or link_url ~* '^https?://[^[:space:]]+$'
  );
alter table public.posts drop constraint if exists image_url_http;
alter table public.posts
  add constraint image_url_http check (
    image_url is null or image_url ~* '^https?://[^[:space:]]+$'
  );

-- image uploads capped at 2 MB
update storage.buckets set file_size_limit = 2097152 where id = 'post-images';
