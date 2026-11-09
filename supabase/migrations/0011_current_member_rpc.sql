-- 0011: single-roundtrip session member fetch
-- replaces the auth.getUser()+select chain (2 network hops+auth call) with 1 PostgREST RPC
create or replace function public.current_member()
returns public.profiles
language sql
security definer
stable
set search_path = ''
as $$
  select p.* from public.profiles p where p.id = auth.uid();
$$;
