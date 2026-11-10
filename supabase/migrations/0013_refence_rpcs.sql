-- 0013: re-fence the definer RPCs. 0011's `create or replace` reset the
-- EXECUTE grants to default (public), and Postgres function privileges do
-- not cascade-replace on redeploys — so anon kept executing current_member()
-- (correctly returning a null composite, which PostgREST materializes as an
-- all-null row). Revoke anon; grant/keep authenticated explicitly.
revoke execute on function public.current_member() from anon;
revoke execute on function public.nav_unread_count() from anon;
grant execute on function public.current_member() to authenticated;
grant execute on function public.nav_unread_count() to authenticated;
