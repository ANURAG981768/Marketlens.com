-- MarketLens cloud schema
-- Run this once in the Supabase dashboard → SQL Editor → New query → Run.
-- Every table is protected by Row-Level Security: the anon key can only ever
-- touch the signed-in user's own rows (certificates are additionally
-- world-readable so anyone can verify a credential by its ID).

-- ---------------------------------------------------------------------------
-- 1. Profiles — display name per user, auto-created on signup
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  updated_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_upsert_own" on public.profiles;
create policy "profiles_upsert_own" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- 2. User data — one JSON blob per user holding lesson progress, quiz results,
--    paper portfolio, watchlist, journal, etc. Simple, conflict-free sync.
-- ---------------------------------------------------------------------------
create table if not exists public.user_data (
  id         uuid primary key references auth.users (id) on delete cascade,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_data enable row level security;

drop policy if exists "user_data_select_own" on public.user_data;
create policy "user_data_select_own" on public.user_data
  for select using (auth.uid() = id);

drop policy if exists "user_data_insert_own" on public.user_data;
create policy "user_data_insert_own" on public.user_data
  for insert with check (auth.uid() = id);

drop policy if exists "user_data_update_own" on public.user_data;
create policy "user_data_update_own" on public.user_data
  for update using (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- 3. Certificates — the public credential registry.
--    Owners insert their own; ANYONE may read (so /verify works by cert id).
-- ---------------------------------------------------------------------------
create table if not exists public.certificates (
  cert_id     text primary key,
  user_id     uuid not null references auth.users (id) on delete cascade,
  name        text not null,
  track_id    text not null,
  track_title text not null,
  quiz_avg    int  not null default 0,
  lessons     int  not null default 0,
  issued_at   timestamptz not null default now()
);

alter table public.certificates enable row level security;

-- Public, read-only verification registry
drop policy if exists "certificates_public_read" on public.certificates;
create policy "certificates_public_read" on public.certificates
  for select using (true);

drop policy if exists "certificates_insert_own" on public.certificates;
create policy "certificates_insert_own" on public.certificates
  for insert with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 3b. Leaderboard — public ranking of paper-trading returns.
--     Anyone may READ the rankings; each user may only write their OWN row.
-- ---------------------------------------------------------------------------
create table if not exists public.leaderboard (
  user_id      uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default 'Investor',
  return_pct   numeric not null default 0,
  trades       int not null default 0,
  updated_at   timestamptz not null default now()
);

alter table public.leaderboard enable row level security;

drop policy if exists "leaderboard_public_read" on public.leaderboard;
create policy "leaderboard_public_read" on public.leaderboard
  for select using (true);

drop policy if exists "leaderboard_insert_own" on public.leaderboard;
create policy "leaderboard_insert_own" on public.leaderboard
  for insert with check (auth.uid() = user_id);

drop policy if exists "leaderboard_update_own" on public.leaderboard;
create policy "leaderboard_update_own" on public.leaderboard
  for update using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 4. Auto-provision a profile + empty data row when a user signs up
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
    values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', ''))
    on conflict (id) do nothing;
  insert into public.user_data (id, data)
    values (new.id, '{}'::jsonb)
    on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
