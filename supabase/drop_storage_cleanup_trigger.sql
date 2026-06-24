-- Run on the live DB. The trigger did a raw `DELETE FROM storage.objects`,
-- which Supabase now blocks ("direct deletion from storage tables is not allowed").
-- The app already removes objects via the storage API before deleting products,
-- so this trigger is redundant.
drop trigger if exists product_images_storage_cleanup on public.product_images;
drop function if exists public.delete_gallery_object_for_product_image();
