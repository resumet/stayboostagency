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

alter table public.profiles enable row level security;
alter table public.login_requests enable row level security;
alter table public.products enable row level security;
alter table public.product_items enable row level security;
alter table public.hotels enable row level security;
alter table public.hotel_purchased_products enable row level security;
alter table public.work_items enable row level security;

drop policy if exists "profiles_select_self_or_approved" on public.profiles;
create policy "profiles_select_self_or_approved"
on public.profiles for select
using (id = auth.uid() or public.is_approved_user());

drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self"
on public.profiles for insert
with check (id = auth.uid());

drop policy if exists "profiles_update_admin" on public.profiles;
create policy "profiles_update_admin"
on public.profiles for update
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "login_requests_select_self_or_admin" on public.login_requests;
create policy "login_requests_select_self_or_admin"
on public.login_requests for select
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "login_requests_insert_self" on public.login_requests;
create policy "login_requests_insert_self"
on public.login_requests for insert
with check (user_id = auth.uid());

drop policy if exists "login_requests_update_admin" on public.login_requests;
create policy "login_requests_update_admin"
on public.login_requests for update
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "products_select_approved" on public.products;
create policy "products_select_approved"
on public.products for select
using (public.is_approved_user());

drop policy if exists "products_insert_approved" on public.products;
create policy "products_insert_approved"
on public.products for insert
with check (public.is_approved_user());

drop policy if exists "products_update_approved" on public.products;
create policy "products_update_approved"
on public.products for update
using (public.is_approved_user())
with check (public.is_approved_user());

drop policy if exists "products_delete_approved" on public.products;
create policy "products_delete_approved"
on public.products for delete
using (public.is_approved_user());

drop policy if exists "product_items_select_approved" on public.product_items;
create policy "product_items_select_approved"
on public.product_items for select
using (public.is_approved_user());

drop policy if exists "product_items_insert_approved" on public.product_items;
create policy "product_items_insert_approved"
on public.product_items for insert
with check (public.is_approved_user());

drop policy if exists "product_items_update_approved" on public.product_items;
create policy "product_items_update_approved"
on public.product_items for update
using (public.is_approved_user())
with check (public.is_approved_user());

drop policy if exists "product_items_delete_approved" on public.product_items;
create policy "product_items_delete_approved"
on public.product_items for delete
using (public.is_approved_user());

drop policy if exists "hotels_select_approved" on public.hotels;
create policy "hotels_select_approved"
on public.hotels for select
using (public.is_approved_user());

drop policy if exists "hotels_insert_approved" on public.hotels;
create policy "hotels_insert_approved"
on public.hotels for insert
with check (public.is_approved_user());

drop policy if exists "hotels_update_approved" on public.hotels;
create policy "hotels_update_approved"
on public.hotels for update
using (public.is_approved_user())
with check (public.is_approved_user());

drop policy if exists "hotels_delete_approved" on public.hotels;
create policy "hotels_delete_approved"
on public.hotels for delete
using (public.is_approved_user());

drop policy if exists "hotel_purchased_products_select_approved" on public.hotel_purchased_products;
create policy "hotel_purchased_products_select_approved"
on public.hotel_purchased_products for select
using (public.is_approved_user());

drop policy if exists "hotel_purchased_products_insert_approved" on public.hotel_purchased_products;
create policy "hotel_purchased_products_insert_approved"
on public.hotel_purchased_products for insert
with check (public.is_approved_user());

drop policy if exists "hotel_purchased_products_update_approved" on public.hotel_purchased_products;
create policy "hotel_purchased_products_update_approved"
on public.hotel_purchased_products for update
using (public.is_approved_user())
with check (public.is_approved_user());

drop policy if exists "hotel_purchased_products_delete_approved" on public.hotel_purchased_products;
create policy "hotel_purchased_products_delete_approved"
on public.hotel_purchased_products for delete
using (public.is_approved_user());

drop policy if exists "work_items_select_approved" on public.work_items;
create policy "work_items_select_approved"
on public.work_items for select
using (public.is_approved_user());

drop policy if exists "work_items_insert_approved" on public.work_items;
create policy "work_items_insert_approved"
on public.work_items for insert
with check (public.is_approved_user());

drop policy if exists "work_items_update_approved" on public.work_items;
create policy "work_items_update_approved"
on public.work_items for update
using (public.is_approved_user())
with check (public.is_approved_user());

drop policy if exists "work_items_delete_approved" on public.work_items;
create policy "work_items_delete_approved"
on public.work_items for delete
using (public.is_approved_user());

notify pgrst, 'reload schema';
