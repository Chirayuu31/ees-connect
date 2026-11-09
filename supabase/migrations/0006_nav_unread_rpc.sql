-- 0006: navbar unread badge in a single RPC (drops a per-page DB round trip)

create or replace function public.nav_unread_count()
returns int
language sql
security definer
stable
set search_path = ''
as $$
  select count(*)::int from public.messages
  where recipient_id = auth.uid() and read_at is null;
$$;
