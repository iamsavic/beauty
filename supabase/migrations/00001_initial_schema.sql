-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Enums
create type user_role as enum ('super_admin', 'org_admin', 'manager', 'receptionist', 'worker', 'client');
create type appointment_status as enum ('pending', 'confirmed', 'completed', 'cancelled', 'no_show', 'late_cancel');
create type payment_status as enum ('unpaid', 'deposit_paid', 'paid', 'refunded', 'partial_refund');
create type review_status as enum ('pending', 'published', 'rejected');
create type waitlist_status as enum ('waiting', 'notified', 'booked', 'expired');
create type payment_mode as enum ('deposit', 'full', 'both');
create type button_style as enum ('rounded', 'sharp', 'pill');
create type discount_type as enum ('percentage', 'fixed');
create type org_plan as enum ('solo', 'team', 'multi');

-- Organizations
create table organizations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  logo_url text,
  plan org_plan not null default 'solo',
  is_multi_location boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Organization Settings
create table organization_settings (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  primary_color text not null default '#e91e8c',
  accent_color text not null default '#f472b6',
  background_color text not null default '#ffffff',
  text_color text not null default '#1a1a1a',
  font_family text not null default 'Inter',
  button_style button_style not null default 'rounded',
  cover_image_url text,
  logo_url text,
  instagram_url text,
  google_business_url text,
  payment_enabled boolean not null default false,
  payment_mode payment_mode not null default 'deposit',
  deposit_percentage int not null default 20,
  cancellation_hours int not null default 24,
  deposit_on_noshow boolean not null default true,
  repeat_reminder_enabled boolean not null default true,
  review_request_enabled boolean not null default true,
  onboarding_completed boolean not null default false,
  onboarding_steps jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(organization_id)
);

-- Locations
create table locations (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  address text,
  city text,
  phone text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Staff Roles (custom permissions per org)
create table staff_roles (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  role user_role not null,
  permissions jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- Workers
create table workers (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  location_id uuid references locations(id) on delete set null,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  phone text,
  avatar_url text,
  bio text,
  role user_role not null default 'worker',
  working_hours jsonb not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Services
create table services (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  description text,
  category text not null default 'opsta',
  duration_minutes int not null default 60,
  price numeric(10,2) not null default 0,
  repeat_cycle_days int,
  image_url text,
  is_active boolean not null default true,
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Packages
create table packages (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  description text,
  service_ids uuid[] not null default '{}',
  original_price numeric(10,2) not null,
  discounted_price numeric(10,2) not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Promotions
create table promotions (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  description text,
  discount_type discount_type not null default 'percentage',
  discount_value numeric(10,2) not null,
  applies_to text not null default 'all',
  applies_to_ids uuid[] not null default '{}',
  promo_code text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Clients
create table clients (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete set null,
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  email text not null,
  phone text,
  is_guest boolean not null default true,
  no_show_count int not null default 0,
  is_blocked boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Client Profiles (CRM data per organization)
create table client_profiles (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid not null references clients(id) on delete cascade,
  organization_id uuid not null references organizations(id) on delete cascade,
  notes text,
  allergies text,
  preferences text,
  photo_urls text[] not null default '{}',
  favourite_service_id uuid references services(id) on delete set null,
  favourite_worker_id uuid references workers(id) on delete set null,
  last_visit_date date,
  estimated_next_visit date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(client_id, organization_id)
);

-- Appointments
create table appointments (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  location_id uuid references locations(id) on delete set null,
  worker_id uuid not null references workers(id) on delete cascade,
  client_id uuid not null references clients(id) on delete cascade,
  service_id uuid references services(id) on delete set null,
  package_id uuid references packages(id) on delete set null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status appointment_status not null default 'pending',
  payment_status payment_status not null default 'unpaid',
  notes text,
  deposit_amount numeric(10,2),
  total_price numeric(10,2) not null default 0,
  stripe_payment_intent_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Waitlist
create table waitlist (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  client_id uuid not null references clients(id) on delete cascade,
  service_id uuid not null references services(id) on delete cascade,
  worker_id uuid references workers(id) on delete set null,
  preferred_date_from date,
  preferred_date_to date,
  status waitlist_status not null default 'waiting',
  notified_at timestamptz,
  created_at timestamptz not null default now()
);

-- Reviews
create table reviews (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  appointment_id uuid not null references appointments(id) on delete cascade,
  client_id uuid not null references clients(id) on delete cascade,
  worker_id uuid references workers(id) on delete set null,
  rating int not null check (rating between 1 and 5),
  comment text,
  status review_status not null default 'pending',
  admin_reply text,
  review_token text not null unique default encode(gen_random_bytes(32), 'hex'),
  token_used boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Gallery Items
create table gallery_items (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  worker_id uuid references workers(id) on delete set null,
  service_id uuid references services(id) on delete set null,
  image_url text not null,
  caption text,
  display_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Loyalty Accounts
create table loyalty_accounts (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid not null references clients(id) on delete cascade,
  organization_id uuid not null references organizations(id) on delete cascade,
  points int not null default 0,
  total_earned int not null default 0,
  total_redeemed int not null default 0,
  updated_at timestamptz not null default now(),
  unique(client_id, organization_id)
);

-- Payments
create table payments (
  id uuid primary key default uuid_generate_v4(),
  appointment_id uuid not null references appointments(id) on delete cascade,
  organization_id uuid not null references organizations(id) on delete cascade,
  stripe_payment_intent_id text,
  amount numeric(10,2) not null,
  currency text not null default 'BAM',
  status payment_status not null default 'unpaid',
  type text not null default 'deposit',
  created_at timestamptz not null default now()
);

-- Indexes
create index idx_appointments_org_date on appointments(organization_id, starts_at);
create index idx_appointments_worker on appointments(worker_id, starts_at);
create index idx_clients_org on clients(organization_id, email);
create index idx_waitlist_org_service on waitlist(organization_id, service_id, status);
create index idx_reviews_org_status on reviews(organization_id, status);
create index idx_gallery_org on gallery_items(organization_id, display_order);

-- Updated_at trigger
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger organizations_updated_at before update on organizations
  for each row execute function update_updated_at();
create trigger workers_updated_at before update on workers
  for each row execute function update_updated_at();
create trigger services_updated_at before update on services
  for each row execute function update_updated_at();
create trigger clients_updated_at before update on clients
  for each row execute function update_updated_at();
create trigger client_profiles_updated_at before update on client_profiles
  for each row execute function update_updated_at();
create trigger appointments_updated_at before update on appointments
  for each row execute function update_updated_at();
create trigger reviews_updated_at before update on reviews
  for each row execute function update_updated_at();
create trigger organization_settings_updated_at before update on organization_settings
  for each row execute function update_updated_at();
