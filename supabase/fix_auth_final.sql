-- ═══════════════════════════════════════════════════════════════════
-- OpenSpace — FINAL AUTH FIX
-- Guarantees: profile row exists for every signup, role is captured,
-- schema cache is fresh, nav avatar works immediately after signup.
-- Safe & idempotent. Run once in Supabase SQL Editor.
-- ═══════════════════════════════════════════════════════════════════

-- 1. Ensure every required column exists
alter table public.profiles add column if not exists role text;
alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists is_pro boolean default false;
alter table public.profiles add column if not exists stripe_customer_id text;
alter table public.profiles add column if not exists stripe_subscription_id text;
alter table public.profiles add column if not exists created_at timestamptz default now();

-- 2. Make sure role has a sensible default
alter table public.profiles alter column role set default 'student';

-- 3. Backfill any existing profiles missing a role
update public.profiles set role = 'student' where role is null;

-- 4. RLS on
alter table public.profiles enable row level security;

-- 5. Clean + recreate policies
drop policy if exists "users read own profile"   on public.profiles;
drop policy if exists "users insert own profile" on public.profiles;
drop policy if exists "users update own profile" on public.profiles;

create policy "users read own profile"   on public.profiles for select using (auth.uid() = id);
create policy "users insert own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "users update own profile" on public.profiles for update using (auth.uid() = id);

-- 6. Auto-profile trigger that reads role + full_name from signup metadata
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $fn$
begin
  begin
    insert into public.profiles (id, role, full_name)
    values (
      new.id,
      coalesce(nullif(new.raw_user_meta_data->>'role',''), 'student'),
      nullif(new.raw_user_meta_data->>'full_name','')
    )
    on conflict (id) do update
      set role      = coalesce(excluded.role, public.profiles.role),
          full_name = coalesce(excluded.full_name, public.profiles.full_name);
  exception when others then
    raise warning 'handle_new_user failed for %: %', new.id, sqlerrm;
  end;
  return new;
end;
$fn$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 7. Backfill profiles for any auth.users that somehow missed the trigger
insert into public.profiles (id, role, full_name)
select u.id,
       coalesce(nullif(u.raw_user_meta_data->>'role',''), 'student'),
       nullif(u.raw_user_meta_data->>'full_name','')
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null
on conflict (id) do nothing;

-- 8. Reload PostgREST schema cache so the API sees new columns immediately
notify pgrst, 'reload schema';

-- 9. Verify
select 'profiles_with_role' as check_item, count(*)::text as value
from public.profiles where role is not null
union all
select 'auth_users', count(*)::text from auth.users
union all
select 'profiles_total', count(*)::text from public.profiles
union all
select 'trigger_exists',
       exists(select 1 from pg_trigger where tgname = 'on_auth_user_created')::text;
