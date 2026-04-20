-- ═══════════════════════════════════════════════════════════════════════
-- OpenSpace — FIX EVERYTHING
-- Fully idempotent. Safe to re-run. Paste the whole thing into Supabase
-- SQL Editor → Run. Read the verification table at the end.
-- ═══════════════════════════════════════════════════════════════════════

-- ─── 1. TABLES (create if missing) ─────────────────────────────────────

create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  role text check (role in ('student', 'business')) default 'student',
  full_name text,
  is_pro boolean default false,
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz default now()
);

create table if not exists venues (
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

create table if not exists capacity_events (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid references venues(id) on delete cascade,
  delta int check (delta in (-1, 1)),
  count_after int,
  created_at timestamptz default now()
);

create table if not exists crowd_patterns (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid references venues(id) on delete cascade,
  hour int check (hour between 0 and 23),
  day_type text check (day_type in ('weekday', 'weekend')),
  avg_pct float,
  updated_at timestamptz default now(),
  unique(venue_id, hour, day_type)
);

create table if not exists venue_amenities (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid references venues(id) on delete cascade,
  label text not null,
  unique(venue_id, label)
);

-- If venue_amenities existed before without the unique constraint, add it now.
-- First dedupe any existing duplicate (venue_id, label) rows.
delete from venue_amenities a
  using venue_amenities b
  where a.id > b.id
    and a.venue_id = b.venue_id
    and a.label = b.label;

do $do_amenities$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.venue_amenities'::regclass
      and contype = 'u'
      and conname = 'venue_amenities_venue_id_label_key'
  ) then
    alter table public.venue_amenities
      add constraint venue_amenities_venue_id_label_key unique (venue_id, label);
  end if;
end $do_amenities$;

create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid references venues(id) on delete cascade,
  author_id uuid references profiles(id),
  author_name text not null,
  rating int check (rating between 1 and 5),
  body text not null,
  created_at timestamptz default now()
);

create table if not exists favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  venue_id uuid references venues(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, venue_id)
);

-- ─── 2. AUTO-PROVISION PROFILE ON SIGNUP (safety net) ──────────────────
-- Fixes "Database error saving new user" by ensuring a profile row is
-- created server-side the moment auth.users gets a new row.

create or replace function public.handle_new_user()
returns trigger
security definer
set search_path = public
as $func_new_user$
begin
  insert into public.profiles (id, role, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'student'),
    coalesce(new.raw_user_meta_data->>'full_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$func_new_user$ language plpgsql;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── 3. CROWD-PATTERN TRIGGER ──────────────────────────────────────────

create or replace function update_crowd_pattern()
returns trigger as $func_crowd$
declare
  v_hour int := extract(hour from now());
  v_dtype text := case when extract(dow from now()) in (0,6) then 'weekend' else 'weekday' end;
  v_max_cap int;
  v_new_pct float;
begin
  select max_capacity into v_max_cap from venues where id = new.venue_id;
  if v_max_cap is null or v_max_cap = 0 then return new; end if;
  v_new_pct := (new.count_after::float / v_max_cap) * 100;
  insert into crowd_patterns (venue_id, hour, day_type, avg_pct)
    values (new.venue_id, v_hour, v_dtype, v_new_pct)
  on conflict (venue_id, hour, day_type)
  do update set
    avg_pct = (crowd_patterns.avg_pct * 0.85) + (excluded.avg_pct * 0.15),
    updated_at = now();
  return new;
end;
$func_crowd$ language plpgsql;

drop trigger if exists trg_crowd_pattern on capacity_events;
create trigger trg_crowd_pattern
  after insert on capacity_events
  for each row execute function update_crowd_pattern();

-- ─── 4. ROW-LEVEL SECURITY ─────────────────────────────────────────────

alter table profiles         enable row level security;
alter table venues           enable row level security;
alter table capacity_events  enable row level security;
alter table crowd_patterns   enable row level security;
alter table venue_amenities  enable row level security;
alter table reviews          enable row level security;
alter table favorites        enable row level security;

-- Drop existing policies so we can recreate them cleanly
do $do_policies$
declare p record;
begin
  for p in
    select policyname, tablename from pg_policies
    where schemaname = 'public'
      and tablename in ('profiles','venues','capacity_events','crowd_patterns','venue_amenities','reviews','favorites')
  loop
    execute format('drop policy if exists %I on public.%I', p.policyname, p.tablename);
  end loop;
end $do_policies$;

-- Profiles
create policy "users read own profile"   on profiles for select using (auth.uid() = id);
create policy "users insert own profile" on profiles for insert with check (auth.uid() = id);
create policy "users update own profile" on profiles for update using (auth.uid() = id);

-- Venues
create policy "public read venues"       on venues for select using (is_active = true);
create policy "owners manage own venue"  on venues for all using (auth.uid() = owner_id);

-- Amenities
create policy "public read amenities"    on venue_amenities for select using (true);
create policy "owners manage amenities"  on venue_amenities for all using (
  auth.uid() = (select owner_id from venues where id = venue_id)
);

-- Reviews
create policy "public read reviews"      on reviews for select using (true);
create policy "auth users write reviews" on reviews for insert with check (auth.uid() = author_id);

-- Favorites
create policy "users manage own favorites" on favorites for all using (auth.uid() = user_id);

-- Crowd patterns + capacity events
create policy "public read crowd patterns"  on crowd_patterns for select using (true);
create policy "public read capacity events" on capacity_events for select using (true);
create policy "owners write capacity events" on capacity_events for insert with check (
  auth.uid() = (select owner_id from venues where id = venue_id)
);

-- ─── 5. REALTIME PUBLICATION (idempotent) ──────────────────────────────

do $do_realtime$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'venues'
  ) then alter publication supabase_realtime add table venues;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'capacity_events'
  ) then alter publication supabase_realtime add table capacity_events;
  end if;
end $do_realtime$;

-- ─── 6. SEED BERKELEY VENUES (skip duplicates) ─────────────────────────

insert into venues (id, name, description, type, address, lat, lng, hours_open, hours_close, max_capacity, current_count, popular_items, image_url, is_active)
values
  ('a1b2c3d4-0001-0001-0001-000000000001','Cafe Milano','A beloved Berkeley institution on Bancroft Way. Exposed brick, warm lighting, and the best espresso near campus. Fills up fast between 10am and 2pm.','cafe','2522 Bancroft Way, Berkeley, CA 94704',37.8683,-122.2594,'07:00','22:00',45,18,array['Cappuccino','Avocado Toast','Latte','Croissant','Cold Brew'],'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80',true),
  ('a1b2c3d4-0002-0002-0002-000000000002','Cafe Strada','Outdoor patio with views of the Campanile. Popular with graduate students and professors alike. Dog-friendly and always buzzing.','cafe','2300 College Ave, Berkeley, CA 94704',37.8697,-122.2549,'07:30','23:00',60,32,array['Americano','Spinach Quiche','Chai Latte','Blueberry Scone','Matcha'],'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&q=80',true),
  ('a1b2c3d4-0003-0003-0003-000000000003','Moffitt Library','The undergraduate library at UC Berkeley. 24-hour access during finals. Multiple floors with collaborative and quiet zones. Robust WiFi throughout.','library','101 Doe Library, Berkeley, CA 94720',37.8726,-122.2602,'08:00','23:59',350,142,array['Study Pods','Group Rooms','Printing','Whiteboards'],'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800&q=80',true),
  ('a1b2c3d4-0004-0004-0004-000000000004','Doe Library','The main research library on campus. Grand reading rooms with high ceilings and natural light. Hushed atmosphere, strictly enforced. Laptop-friendly.','library','190 Doe Library, Berkeley, CA 94720',37.8728,-122.2598,'09:00','21:00',200,88,array['Research Databases','Special Collections','Quiet Carrels','Microfilm'],'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800&q=80',true),
  ('a1b2c3d4-0005-0005-0005-000000000005','Free Speech Movement Cafe','Historic cafe inside Moffitt Library. Named after the 1964 student movement. Great spot for a quick coffee between classes. Always lively.','cafe','Moffitt Library, UC Berkeley, CA 94720',37.8726,-122.2605,'08:00','20:00',50,24,array['Drip Coffee','Sandwiches','Cookies','Smoothies','Tea'],'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80',true),
  ('a1b2c3d4-0006-0006-0006-000000000006','Brewed Awakening','Cozy neighborhood coffee shop on Shattuck Avenue. Indie music, mismatched furniture, and a loyal local following. Power outlets at every seat.','cafe','2616 Durant Ave, Berkeley, CA 94704',37.8670,-122.2591,'07:00','21:00',35,11,array['Pour Over','Breakfast Burrito','Oat Milk Latte','Banana Bread','Espresso'],'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800&q=80',true)
on conflict (id) do nothing;

-- ─── 7. SEED AMENITIES (skip duplicates) ───────────────────────────────

insert into venue_amenities (venue_id, label) values
  ('a1b2c3d4-0001-0001-0001-000000000001','WiFi'),
  ('a1b2c3d4-0001-0001-0001-000000000001','Power Sockets'),
  ('a1b2c3d4-0001-0001-0001-000000000001','Food Available'),
  ('a1b2c3d4-0002-0002-0002-000000000002','WiFi'),
  ('a1b2c3d4-0002-0002-0002-000000000002','Outdoor Seating'),
  ('a1b2c3d4-0002-0002-0002-000000000002','Food Available'),
  ('a1b2c3d4-0002-0002-0002-000000000002','Pet Friendly'),
  ('a1b2c3d4-0003-0003-0003-000000000003','WiFi'),
  ('a1b2c3d4-0003-0003-0003-000000000003','Power Sockets'),
  ('a1b2c3d4-0003-0003-0003-000000000003','Quiet Zone'),
  ('a1b2c3d4-0003-0003-0003-000000000003','Air Conditioning'),
  ('a1b2c3d4-0004-0004-0004-000000000004','WiFi'),
  ('a1b2c3d4-0004-0004-0004-000000000004','Quiet Zone'),
  ('a1b2c3d4-0004-0004-0004-000000000004','Air Conditioning'),
  ('a1b2c3d4-0005-0005-0005-000000000005','WiFi'),
  ('a1b2c3d4-0005-0005-0005-000000000005','Food Available'),
  ('a1b2c3d4-0006-0006-0006-000000000006','WiFi'),
  ('a1b2c3d4-0006-0006-0006-000000000006','Power Sockets'),
  ('a1b2c3d4-0006-0006-0006-000000000006','Food Available')
on conflict (venue_id, label) do nothing;

-- ─── 8. VERIFICATION ───────────────────────────────────────────────────

select 'venues'            as check_item, count(*)::text as value from venues
union all select 'amenities',        count(*)::text from venue_amenities
union all select 'profiles',         count(*)::text from profiles
union all select 'auth_users',       count(*)::text from auth.users
union all select 'realtime_tables',  string_agg(tablename, ', ')
  from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public'
union all select 'rls_policies',     count(*)::text from pg_policies where schemaname = 'public'
union all select 'auto_profile_trigger',
  case when exists (select 1 from pg_trigger where tgname = 'on_auth_user_created')
       then 'installed ✓' else 'MISSING ✗' end;
