-- ═══════════════════════════════════════════════════════════════════════
-- OpenSpace — MINIMAL FIX
-- Fixes the "Database error saving new user" bug.
-- Safe to run on your existing DB. Idempotent.
-- ═══════════════════════════════════════════════════════════════════════

-- 1. Ensure RLS is on for profiles
alter table public.profiles enable row level security;

-- 2. Drop any stale profile policies so we can recreate cleanly
drop policy if exists "users read own profile"   on public.profiles;
drop policy if exists "users insert own profile" on public.profiles;
drop policy if exists "users update own profile" on public.profiles;

-- 3. Recreate the three policies profiles needs
create policy "users read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "users insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "users update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- 4. Server-side safety net: auto-create a profile when a new auth user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
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
$func_new_user$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 5. Verify
select 'profile_insert_policy_exists' as check_item,
       exists(select 1 from pg_policies
              where schemaname = 'public'
                and tablename = 'profiles'
                and policyname = 'users insert own profile')::text as value
union all
select 'auto_profile_trigger_exists',
       exists(select 1 from pg_trigger where tgname = 'on_auth_user_created')::text
union all
select 'venues_count', count(*)::text from venues
union all
select 'auth_users_count', count(*)::text from auth.users;
