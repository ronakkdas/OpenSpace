-- Favorites
create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  venue_id uuid references public.venues(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, venue_id)
);

-- RLS: users can only read/write their own favorites
alter table public.favorites enable row level security;

drop policy if exists "users manage own favorites" on public.favorites;
create policy "users manage own favorites"
on public.favorites for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Venues columns for map enrichment (safe if already exists)
alter table public.venues
  add column if not exists website_url text,
  add column if not exists google_place_id text;

