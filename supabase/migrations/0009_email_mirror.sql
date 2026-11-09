-- 0009: keep profiles.email in sync when an auth email changes through any
-- flow (settings page double opt-in on hosted, admin flows, etc.) — this
-- column feeds every outgoing notification.

create or replace function public.handle_email_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles
  set email = new.email
  where id = new.id;
  return new;
end;
$$;

create trigger on_user_email_change
  after update on auth.users
  for each row
  execute function public.handle_email_change();
