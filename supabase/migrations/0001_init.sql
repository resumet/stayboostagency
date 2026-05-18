create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  avatar_url text,
  role text not null default 'user' check (role in ('admin', 'user')),
  approval_status text not null default 'pending' check (approval_status in ('approved', 'pending', 'rejected')),
  approved_at timestamptz,
  approved_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.login_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  email text not null,
  full_name text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  requested_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id),
  review_note text
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  subtitle text,
  description text,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_by uuid references public.profiles(id),
  updated_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.product_items (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  name text not null,
  price_amount integer,
  price_label text not null,
  description text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.hotels (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_name text not null,
  business_number text not null,
  business_license_file_path text,
  owner_phone text not null,
  address text not null,
  hotel_phone text,
  notes text,
  photo_folder_url text,
  is_active boolean not null default true,
  created_by uuid references public.profiles(id),
  updated_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.hotel_purchased_products (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid not null references public.hotels(id) on delete cascade,
  product_id uuid not null references public.products(id),
  purchased_at date,
  price_amount integer,
  price_label text,
  status text not null default 'active' check (status in ('active', 'completed', 'cancelled')),
  notes text,
  created_by uuid references public.profiles(id),
  updated_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.work_items (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid not null references public.hotels(id) on delete cascade,
  purchased_product_id uuid references public.hotel_purchased_products(id) on delete set null,
  product_item_id uuid references public.product_items(id) on delete set null,
  title text not null,
  description text,
  status text not null default 'scheduled' check (status in ('scheduled', 'in_progress', 'on_hold', 'completed', 'cancelled')),
  start_date date not null,
  end_date date not null,
  notes text,
  sort_order int not null default 0,
  created_by uuid references public.profiles(id),
  updated_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date >= start_date)
);

create index idx_products_active_sort on public.products(is_active, sort_order);
create unique index idx_products_name_unique on public.products(name);
create index idx_product_items_product_sort on public.product_items(product_id, sort_order);
create unique index idx_product_items_product_name_unique on public.product_items(product_id, name);
create index idx_hotels_name on public.hotels(name);
create index idx_work_items_dates on public.work_items(start_date, end_date);
create index idx_work_items_hotel on public.work_items(hotel_id);
create index idx_login_requests_status on public.login_requests(status, requested_at);
create unique index idx_login_requests_one_pending on public.login_requests(user_id) where status = 'pending';

create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger set_products_updated_at
before update on public.products
for each row execute function public.set_updated_at();

create trigger set_product_items_updated_at
before update on public.product_items
for each row execute function public.set_updated_at();

create trigger set_hotels_updated_at
before update on public.hotels
for each row execute function public.set_updated_at();

create trigger set_hotel_purchased_products_updated_at
before update on public.hotel_purchased_products
for each row execute function public.set_updated_at();

create trigger set_work_items_updated_at
before update on public.work_items
for each row execute function public.set_updated_at();

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
      and approval_status = 'approved'
  );
$$;

create or replace function public.is_approved_user()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and approval_status = 'approved'
  );
$$;

alter table public.profiles enable row level security;
alter table public.login_requests enable row level security;
alter table public.products enable row level security;
alter table public.product_items enable row level security;
alter table public.hotels enable row level security;
alter table public.hotel_purchased_products enable row level security;
alter table public.work_items enable row level security;

grant usage on schema public to anon, authenticated, service_role;

grant select, insert, update, delete on table public.profiles to authenticated, service_role;
grant select, insert, update, delete on table public.login_requests to authenticated, service_role;
grant select, insert, update, delete on table public.products to authenticated, service_role;
grant select, insert, update, delete on table public.product_items to authenticated, service_role;
grant select, insert, update, delete on table public.hotels to authenticated, service_role;
grant select, insert, update, delete on table public.hotel_purchased_products to authenticated, service_role;
grant select, insert, update, delete on table public.work_items to authenticated, service_role;

grant select on table public.profiles to anon;
grant select on table public.login_requests to anon;
grant select on table public.products to anon;
grant select on table public.product_items to anon;
grant select on table public.hotels to anon;
grant select on table public.hotel_purchased_products to anon;
grant select on table public.work_items to anon;

grant execute on function public.is_admin() to anon, authenticated, service_role;
grant execute on function public.is_approved_user() to anon, authenticated, service_role;

create policy "profiles_select_self_or_approved"
on public.profiles for select
using (id = auth.uid() or public.is_approved_user());

create policy "profiles_insert_self"
on public.profiles for insert
with check (id = auth.uid());

create policy "profiles_update_admin"
on public.profiles for update
using (public.is_admin())
with check (public.is_admin());

create policy "login_requests_select_self_or_admin"
on public.login_requests for select
using (user_id = auth.uid() or public.is_admin());

create policy "login_requests_insert_self"
on public.login_requests for insert
with check (user_id = auth.uid());

create policy "login_requests_update_admin"
on public.login_requests for update
using (public.is_admin())
with check (public.is_admin());

create policy "products_select_approved"
on public.products for select
using (public.is_approved_user());

create policy "products_insert_approved"
on public.products for insert
with check (public.is_approved_user());

create policy "products_update_approved"
on public.products for update
using (public.is_approved_user())
with check (public.is_approved_user());

create policy "products_delete_approved"
on public.products for delete
using (public.is_approved_user());

create policy "product_items_select_approved"
on public.product_items for select
using (public.is_approved_user());

create policy "product_items_insert_approved"
on public.product_items for insert
with check (public.is_approved_user());

create policy "product_items_update_approved"
on public.product_items for update
using (public.is_approved_user())
with check (public.is_approved_user());

create policy "product_items_delete_approved"
on public.product_items for delete
using (public.is_approved_user());

create policy "hotels_select_approved"
on public.hotels for select
using (public.is_approved_user());

create policy "hotels_insert_approved"
on public.hotels for insert
with check (public.is_approved_user());

create policy "hotels_update_approved"
on public.hotels for update
using (public.is_approved_user())
with check (public.is_approved_user());

create policy "hotels_delete_approved"
on public.hotels for delete
using (public.is_approved_user());

create policy "hotel_purchased_products_select_approved"
on public.hotel_purchased_products for select
using (public.is_approved_user());

create policy "hotel_purchased_products_insert_approved"
on public.hotel_purchased_products for insert
with check (public.is_approved_user());

create policy "hotel_purchased_products_update_approved"
on public.hotel_purchased_products for update
using (public.is_approved_user())
with check (public.is_approved_user());

create policy "hotel_purchased_products_delete_approved"
on public.hotel_purchased_products for delete
using (public.is_approved_user());

create policy "work_items_select_approved"
on public.work_items for select
using (public.is_approved_user());

create policy "work_items_insert_approved"
on public.work_items for insert
with check (public.is_approved_user());

create policy "work_items_update_approved"
on public.work_items for update
using (public.is_approved_user())
with check (public.is_approved_user());

create policy "work_items_delete_approved"
on public.work_items for delete
using (public.is_approved_user());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'business-licenses',
  'business-licenses',
  false,
  10485760,
  array['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy "business_licenses_select_approved"
on storage.objects for select
using (bucket_id = 'business-licenses' and public.is_approved_user());

create policy "business_licenses_insert_approved"
on storage.objects for insert
with check (bucket_id = 'business-licenses' and public.is_approved_user());

create policy "business_licenses_update_approved"
on storage.objects for update
using (bucket_id = 'business-licenses' and public.is_approved_user())
with check (bucket_id = 'business-licenses' and public.is_approved_user());

create policy "business_licenses_delete_approved"
on storage.objects for delete
using (bucket_id = 'business-licenses' and public.is_approved_user());
