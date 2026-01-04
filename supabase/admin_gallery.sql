-- Gallery products + images schema and policies (Supabase)

do $$
begin
  if not exists (select 1 from pg_type where typname = 'product_category') then
    create type public.product_category as enum ('Murti', 'Pendant', 'Rings');
  end if;
end
$$;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category public.product_category not null,
  created_at timestamptz not null default now(),
  created_by uuid default auth.uid()
);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  storage_path text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists product_images_product_id_idx on public.product_images (product_id);

create or replace function public.enforce_product_image_limit()
returns trigger
language plpgsql
as $$
begin
  if (select count(*) from public.product_images where product_id = new.product_id) >= 4 then
    raise exception 'Image limit reached for this product';
  end if;
  return new;
end;
$$;

drop trigger if exists product_images_limit on public.product_images;
create trigger product_images_limit
before insert on public.product_images
for each row
execute function public.enforce_product_image_limit();

alter table public.products enable row level security;
alter table public.product_images enable row level security;

drop policy if exists "Authenticated read products" on public.products;
create policy "Authenticated read products"
on public.products
for select
to authenticated
using (true);

drop policy if exists "Authenticated read product images" on public.product_images;
create policy "Authenticated read product images"
on public.product_images
for select
to authenticated
using (true);

drop policy if exists "Admin write products" on public.products;
create policy "Admin write products"
on public.products
for all
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Admin write product images" on public.product_images;
create policy "Admin write product images"
on public.product_images
for all
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

insert into storage.buckets (id, name, public)
values ('gallery', 'gallery', true)
on conflict (id) do nothing;

drop policy if exists "Public read gallery images" on storage.objects;
create policy "Public read gallery images"
on storage.objects
for select
using (bucket_id = 'gallery');

drop policy if exists "Admin manage gallery images" on storage.objects;
create policy "Admin manage gallery images"
on storage.objects
for all
to authenticated
using (
  bucket_id = 'gallery'
  and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
)
with check (
  bucket_id = 'gallery'
  and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);
