-- Product inquiries schema and policies (Supabase)

create table if not exists public.product_inquiries (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products (id) on delete set null,
  product_name text not null,
  user_id uuid references auth.users (id) on delete set null,
  first_name text,
  last_name text,
  email text not null,
  phone text,
  requirements text not null,
  status text not null default 'in_process',
  created_at timestamptz not null default now()
);

create index if not exists product_inquiries_product_id_idx on public.product_inquiries (product_id);
create index if not exists product_inquiries_created_at_idx on public.product_inquiries (created_at);
create index if not exists product_inquiries_status_idx on public.product_inquiries (status);

alter table public.product_inquiries enable row level security;

drop policy if exists "Authenticated create inquiries" on public.product_inquiries;
create policy "Authenticated create inquiries"
on public.product_inquiries
for insert
to authenticated
with check (true);

drop policy if exists "Admin read inquiries" on public.product_inquiries;
create policy "Admin read inquiries"
on public.product_inquiries
for select
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Admin update inquiries" on public.product_inquiries;
create policy "Admin update inquiries"
on public.product_inquiries
for update
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
