-- Profiles (extends Supabase auth.users)
create table profiles (
  id uuid references auth.users primary key,
  role text check (role in ('student', 'business')) default 'student',
  full_name text,
  is_pro boolean default false,
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz default now()
);

-- Venues
create table venues (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references profiles(id) on delete cascade,
  name text not null,
  description text,
  type text check (type in ('cafe', 'library', 'lounge', 'other')) default 'cafe',
  address text,
  lat float,
  lng float,
  hours_open time default '07:00',
  hours_close time default '22:00',
  max_capacity int default 40,
  current_count int default 0,
  popular_items text[],
  website_url text,
  image_url text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Capacity events log
create table capacity_events (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid references venues(id) on delete cascade,
  delta int check (delta in (-1, 1)),
  count_after int,
  created_at timestamptz default now()
);

-- Crowd patterns (hourly averages, updated via trigger)
create table crowd_patterns (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid references venues(id) on delete cascade,
  hour int check (hour between 0 and 23),
  day_type text check (day_type in ('weekday', 'weekend')),
  avg_pct float,
  updated_at timestamptz default now(),
  unique(venue_id, hour, day_type)
);

-- Venue amenities
create table venue_amenities (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid references venues(id) on delete cascade,
  label text not null
);

-- Reviews
create table reviews (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid references venues(id) on delete cascade,
  author_id uuid references profiles(id),
  author_name text not null,
  rating int check (rating between 1 and 5),
  body text not null,
  created_at timestamptz default now()
);

-- Favorites
create table favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  venue_id uuid references venues(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, venue_id)
);

-- Trigger: update crowd_patterns on every capacity_events insert
create or replace function update_crowd_pattern()
returns trigger as $$
declare
  h int := extract(hour from now());
  dtype text := case when extract(dow from now()) in (0,6) then 'weekend' else 'weekday' end;
  max_cap int;
  new_pct float;
begin
  select max_capacity into max_cap from venues where id = NEW.venue_id;
  if max_cap is null or max_cap = 0 then return NEW; end if;
  new_pct := (NEW.count_after::float / max_cap) * 100;
  insert into crowd_patterns (venue_id, hour, day_type, avg_pct)
    values (NEW.venue_id, h, dtype, new_pct)
  on conflict (venue_id, hour, day_type)
  do update set
    avg_pct = (crowd_patterns.avg_pct * 0.85) + (excluded.avg_pct * 0.15),
    updated_at = now();
  return NEW;
end;
$$ language plpgsql;

create trigger trg_crowd_pattern
after insert on capacity_events
for each row execute function update_crowd_pattern();

-- RLS policies
alter table profiles enable row level security;
alter table venues enable row level security;
alter table capacity_events enable row level security;
alter table crowd_patterns enable row level security;
alter table venue_amenities enable row level security;
alter table reviews enable row level security;
alter table favorites enable row level security;

create policy "public read venues" on venues for select using (is_active = true);
create policy "owners manage own venue" on venues for all using (auth.uid() = owner_id);
create policy "public read amenities" on venue_amenities for select using (true);
create policy "owners manage amenities" on venue_amenities for all using (
  auth.uid() = (select owner_id from venues where id = venue_id)
);
create policy "public read reviews" on reviews for select using (true);
create policy "auth users write reviews" on reviews for insert with check (auth.uid() = author_id);
create policy "users manage own favorites" on favorites for all using (auth.uid() = user_id);
create policy "public read crowd patterns" on crowd_patterns for select using (true);
create policy "public read capacity events" on capacity_events for select using (true);
create policy "owners write capacity events" on capacity_events for insert with check (
  auth.uid() = (select owner_id from venues where id = venue_id)
);
create policy "users read own profile" on profiles for select using (auth.uid() = id);
create policy "users update own profile" on profiles for update using (auth.uid() = id);

-- Enable Realtime on venues (idempotent — safe to re-run)
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'venues'
  ) then
    alter publication supabase_realtime add table venues;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'capacity_events'
  ) then
    alter publication supabase_realtime add table capacity_events;
  end if;
end $$;
