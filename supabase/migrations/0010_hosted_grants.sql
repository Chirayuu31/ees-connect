-- 0010: hosted-platform grants — a FRESH hosted Supabase project does not
-- auto-grant API roles on migration-created tables (the local CLI stack
-- does). Without these the app renders as guest for every member.
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to anon, authenticated;
grant execute on all functions in schema public to anon, authenticated;
alter default privileges in schema public
  grant select, insert, update, delete on tables to anon, authenticated;
grant select, insert, update, delete on all tables in schema storage to anon, authenticated;
grant usage on schema storage to anon, authenticated;
