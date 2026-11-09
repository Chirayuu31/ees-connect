-- 0007: admin moderation may purge another member's orphaned image
-- (owners_remove_post_images was owner-only; admin deletePost silently
--  403'd on the storage call and left the image alive)

drop policy if exists "owners_remove_post_images" on storage.objects;
create policy "owners_remove_post_images" on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'post-images'
    and (owner_id::text = auth.uid()::text or public.is_admin())
  );
