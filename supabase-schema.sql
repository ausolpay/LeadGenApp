-- =====================================================
-- Cairns Prospect Finder - Database Schema
-- =====================================================

-- 1) Profiles table (1:1 with auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  company text,
  phone text,
  default_location text,
  default_filters jsonb default '{}'::jsonb,
  stripe_customer_id text unique,
  plan text check (plan in ('monthly','yearly','lifetime') or plan is null),
  subscription_status text,              -- 'active','trialing','past_due','canceled', etc.
  current_period_end timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2) Subscriptions table (history + current)
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  stripe_subscription_id text,
  stripe_price_id text,
  plan text check (plan in ('monthly','yearly','lifetime')),
  status text,
  current_period_end timestamptz,
  cancel_at_period_end boolean,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3) Contacted businesses (server-side storage)
create table if not exists public.contacted_businesses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  place_id text not null,
  name text not null,
  notes text,
  called boolean default false,
  emailed boolean default false,
  contacted_at timestamptz default now(),
  raw jsonb,                 -- optional: store snapshot of fields for display
  unique (user_id, place_id)
);

-- 4) Lifetime allowlist table
create table if not exists public.lifetime_allowlist (
  email text primary key
);

-- Create index for case-insensitive email lookups
create unique index if not exists lifetime_allowlist_email_ci
  on public.lifetime_allowlist ((lower(email)));

-- =====================================================
-- Row Level Security (RLS)
-- =====================================================

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.contacted_businesses enable row level security;

-- Profiles policies
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id)
  with check (auth.uid() = id);

-- Subscriptions policies  
create policy "subscriptions_select_own" on public.subscriptions
  for select using (auth.uid() = user_id);

create policy "subscriptions_insert_own" on public.subscriptions
  for insert with check (auth.uid() = user_id);

-- Contacted businesses policies
create policy "contacted_businesses_select_own" on public.contacted_businesses
  for select using (auth.uid() = user_id);

create policy "contacted_businesses_insert_own" on public.contacted_businesses  
  for insert with check (auth.uid() = user_id);

create policy "contacted_businesses_update_own" on public.contacted_businesses
  for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "contacted_businesses_delete_own" on public.contacted_businesses
  for delete using (auth.uid() = user_id);

-- =====================================================
-- Triggers and Functions
-- =====================================================

-- Function to handle new user creation
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email) 
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile on user signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Function to grant lifetime access for allowlisted emails
create or replace function public.grant_lifetime_if_allowlisted()
returns trigger as $$
declare
  em_lower text;
  hit int;
begin
  em_lower := lower(new.email);
  select count(*) into hit
  from public.lifetime_allowlist
  where lower(email) = em_lower;

  if hit > 0 then
    -- upsert a profile row (in case other trigger hasn't run yet)
    insert into public.profiles (id, email, plan, subscription_status, current_period_end)
    values (new.id, new.email, 'lifetime', 'active', null)
    on conflict (id) do update
      set plan='lifetime',
          subscription_status='active',
          current_period_end=null,
          updated_at=now();
  end if;

  return new;
end;
$$ language plpgsql security definer;

-- Trigger to grant lifetime for allowlisted emails
drop trigger if exists on_auth_user_created_grant_lifetime on auth.users;
create trigger on_auth_user_created_grant_lifetime
after insert on auth.users
for each row execute function public.grant_lifetime_if_allowlisted();

-- Function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers for updated_at
create trigger profiles_updated_at before update
  on public.profiles for each row
  execute function public.handle_updated_at();

create trigger subscriptions_updated_at before update
  on public.subscriptions for each row  
  execute function public.handle_updated_at();

-- =====================================================
-- Seed Data
-- =====================================================

-- Insert allowlisted emails for lifetime access
insert into public.lifetime_allowlist (email) values
('info@cairnscitygraphics.com.au'),
('hannah@cairnscitygraphics.com.au'),
('courtney@cairnscitygraphics.com.au')
on conflict do nothing;

-- =====================================================
-- Backfill existing users (if any)
-- =====================================================

-- Grant lifetime to existing users with allowlisted emails
update public.profiles p
set plan='lifetime', subscription_status='active', current_period_end=null, updated_at=now()
from auth.users u
join public.lifetime_allowlist a on lower(a.email)=lower(u.email)
where p.id = u.id;
