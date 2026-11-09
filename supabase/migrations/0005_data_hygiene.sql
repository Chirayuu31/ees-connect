-- 0005: dedupe reports + normalize tags (S31 drift guard)

-- clean the accidental probe duplicate from testing first
delete from reports r
using reports r2
where r.post_id = r2.post_id and r.reporter_id = r2.reporter_id
  and r.created_at > r2.created_at;

create unique index if not exists reports_one_per_member_idx
  on public.reports (post_id, reporter_id);

-- S13: canonical lowercase tags so exact-match `contains` queries always hit
update public.posts
set tags = (select array_agg(distinct lower(t)) from unnest(tags) as t)
where exists (select 1 from unnest(tags) as t where t <> lower(t));
