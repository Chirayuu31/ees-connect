-- 0012: advisory fixes (security + performance) from the Supabase linter audit
-- SECURITY: fence internal definer functions from the public RPC surface
revoke execute on function public.app_role() from anon, authenticated;
revoke execute on function public.handle_new_user() from anon, authenticated;
revoke execute on function public.handle_email_change() from anon, authenticated;
revoke execute on function public.recipient_is_approved(uuid) from anon;
revoke execute on function public.is_verified() from anon;
revoke execute on function public.is_admin() from anon;
revoke execute on function public.current_member() from anon;
revoke execute on function public.nav_unread_count() from anon;

-- PERFORMANCE: covering indexes on FK columns that members filter on
create index if not exists comments_post_id_idx on public.comments (post_id, created_at);
create index if not exists comments_author_id_idx on public.comments (author_id);
create index if not exists posts_author_id_idx on public.posts (author_id);
create index if not exists reports_reporter_id_idx on public.reports (reporter_id);
create index if not exists mentorship_requests_mentor_id_idx on public.mentorship_requests (mentor_id);
