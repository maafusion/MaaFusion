-- Storage cleanup helpers for gallery images.
-- Object deletion is handled in the app via the storage API (src/lib/storage.ts
-- removeGalleryObjects). A DB trigger doing `delete from storage.objects` is no
-- longer allowed by Supabase, so it was removed. The views below only read.

create or replace view public.gallery_storage_orphans as
select o.id, o.name, o.created_at
from storage.objects o
left join public.product_images pi
  on pi.storage_path = o.name
where o.bucket_id = 'gallery'
  and pi.id is null;

create or replace view public.product_image_orphans as
select pi.*
from public.product_images pi
left join storage.objects o
  on o.bucket_id = 'gallery'
  and o.name = pi.storage_path
where o.id is null;

-- The cleanup_gallery_storage_orphans() function did a raw `delete from
-- storage.objects`, which Supabase forbids ("direct deletion from storage
-- tables is not allowed"). It is removed. To sweep orphans, read the views
-- above and delete the listed objects through the storage API
-- (removeGalleryObjects), not SQL.
drop function if exists public.cleanup_gallery_storage_orphans();
