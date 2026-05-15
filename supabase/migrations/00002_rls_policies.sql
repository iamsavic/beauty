-- Enable RLS on all tables
alter table organizations enable row level security;
alter table organization_settings enable row level security;
alter table locations enable row level security;
alter table staff_roles enable row level security;
alter table workers enable row level security;
alter table services enable row level security;
alter table packages enable row level security;
alter table promotions enable row level security;
alter table clients enable row level security;
alter table client_profiles enable row level security;
alter table appointments enable row level security;
alter table waitlist enable row level security;
alter table reviews enable row level security;
alter table gallery_items enable row level security;
alter table loyalty_accounts enable row level security;
alter table payments enable row level security;

-- Helper: get organization_id for current auth user (via workers table)
create or replace function get_my_org_id()
returns uuid as $$
  select organization_id from workers where user_id = auth.uid() limit 1;
$$ language sql security definer stable;

-- Helper: get user role
create or replace function get_my_role()
returns text as $$
  select raw_user_meta_data->>'role' from auth.users where id = auth.uid();
$$ language sql security definer stable;

-- Organizations: admins see their org, super_admin sees all
create policy "org_members_read" on organizations for select
  using (id = get_my_org_id() or get_my_role() = 'super_admin');

create policy "org_admin_write" on organizations for all
  using (id = get_my_org_id() and get_my_role() in ('org_admin', 'super_admin'));

-- Organization Settings: same as org
create policy "org_settings_read" on organization_settings for select
  using (organization_id = get_my_org_id() or get_my_role() = 'super_admin');

create policy "org_settings_write" on organization_settings for all
  using (organization_id = get_my_org_id() and get_my_role() in ('org_admin', 'super_admin'));

-- Public read for salon pages (services, gallery, reviews, org info by slug)
create policy "public_org_read" on organizations for select to anon
  using (true);

create policy "public_settings_read" on organization_settings for select to anon
  using (true);

create policy "public_services_read" on services for select to anon
  using (is_active = true);

create policy "public_gallery_read" on gallery_items for select to anon
  using (is_active = true);

create policy "public_reviews_read" on reviews for select to anon
  using (status = 'published');

create policy "public_locations_read" on locations for select to anon
  using (is_active = true);

create policy "public_promotions_read" on promotions for select to anon
  using (is_active = true and starts_at <= now() and ends_at >= now());

-- Workers: admin sees all in their org, worker sees themselves
create policy "admin_workers_read" on workers for select
  using (organization_id = get_my_org_id());

create policy "worker_self_read" on workers for select
  using (user_id = auth.uid());

create policy "admin_workers_write" on workers for all
  using (organization_id = get_my_org_id() and get_my_role() in ('org_admin', 'manager', 'super_admin'));

-- Services: admin CUD, all authenticated members read
create policy "members_services_read" on services for select
  using (organization_id = get_my_org_id());

create policy "admin_services_write" on services for all
  using (organization_id = get_my_org_id() and get_my_role() in ('org_admin', 'manager', 'super_admin'));

-- Clients: admin sees all in org, client sees themselves
create policy "admin_clients_read" on clients for select
  using (organization_id = get_my_org_id());

create policy "client_self_read" on clients for select
  using (user_id = auth.uid());

create policy "admin_clients_write" on clients for all
  using (organization_id = get_my_org_id() and get_my_role() in ('org_admin', 'manager', 'receptionist', 'super_admin'));

create policy "public_client_insert" on clients for insert to anon
  with check (true);

-- Client Profiles: admin sees all, worker sees their clients' profiles (limited)
create policy "admin_profiles_read" on client_profiles for select
  using (organization_id = get_my_org_id());

create policy "admin_profiles_write" on client_profiles for all
  using (organization_id = get_my_org_id() and get_my_role() in ('org_admin', 'manager', 'receptionist', 'worker', 'super_admin'));

-- Appointments: admin/worker sees their org's appointments
create policy "admin_appointments_read" on appointments for select
  using (organization_id = get_my_org_id());

create policy "worker_appointments_read" on appointments for select
  using (worker_id in (select id from workers where user_id = auth.uid()));

create policy "client_appointments_read" on appointments for select
  using (client_id in (select id from clients where user_id = auth.uid()));

create policy "admin_appointments_write" on appointments for all
  using (organization_id = get_my_org_id());

create policy "public_appointment_insert" on appointments for insert to anon
  with check (true);

-- Reviews
create policy "admin_reviews_read" on reviews for select
  using (organization_id = get_my_org_id());

create policy "admin_reviews_write" on reviews for update
  using (organization_id = get_my_org_id() and get_my_role() in ('org_admin', 'manager', 'super_admin'));

create policy "public_review_insert" on reviews for insert to anon
  with check (true);

-- Loyalty
create policy "client_loyalty_read" on loyalty_accounts for select
  using (client_id in (select id from clients where user_id = auth.uid()));

create policy "admin_loyalty_read" on loyalty_accounts for select
  using (organization_id = get_my_org_id());

-- Payments
create policy "admin_payments_read" on payments for select
  using (organization_id = get_my_org_id() and get_my_role() in ('org_admin', 'manager', 'super_admin'));

-- Waitlist
create policy "admin_waitlist_read" on waitlist for select
  using (organization_id = get_my_org_id());

create policy "public_waitlist_insert" on waitlist for insert to anon
  with check (true);
