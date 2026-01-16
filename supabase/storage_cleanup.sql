-- Storage cleanup helpers for gallery images.

create or replace function public.delete_gallery_object_for_product_image()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from storage.objects
  where bucket_id = 'gallery'
    and name = old.storage_path;
  return old;
end;
$$;

drop trigger if exists product_images_storage_cleanup on public.product_images;
create trigger product_images_storage_cleanup
after delete on public.product_images
for each row
execute function public.delete_gallery_object_for_product_image();

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

create or replace function public.cleanup_gallery_storage_orphans()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  deleted_count integer;
  role_name text;
  auth_role text;
begin
  role_name := coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '');
  auth_role := coalesce(auth.role(), '');
  if role_name <> 'admin'
    and auth_role <> 'service_role'
    and current_user not in ('postgres', 'supabase_admin')
  then
    raise exception 'Admin privileges required';
  end if;

  delete from storage.objects o
  where o.bucket_id = 'gallery'
    and not exists (
      select 1
      from public.product_images pi
      where pi.storage_path = o.name
    );
  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;

revoke execute on function public.cleanup_gallery_storage_orphans() from public;
grant execute on function public.cleanup_gallery_storage_orphans() to authenticated;
