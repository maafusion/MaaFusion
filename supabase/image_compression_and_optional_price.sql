-- Run once in the Supabase SQL editor before deploying the auto-compress
-- uploads and optional product price changes. Safe to re-run.

-- 1. Image uploads: raise the gallery bucket limit from 200 KB to 1 MB.
--    The admin UI compresses photos in the browser, so this is a safety net.
update storage.buckets
set file_size_limit = 1048576
where id = 'gallery';

-- 2. Optional price: null means "price on request".
alter table public.products
  alter column price drop not null,
  alter column price drop default;

-- Verify: expect 1048576, then is_nullable = YES and column_default = null.
select file_size_limit from storage.buckets where id = 'gallery';

select is_nullable, column_default
from information_schema.columns
where table_schema = 'public' and table_name = 'products' and column_name = 'price';
