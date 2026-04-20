-- ═══════════════════════════════════════════════════════════════════
-- OpenSpace — User preferences + avatar storage
-- Adds avatar, notification, theme, and MFA columns to profiles,
-- creates the `avatars` storage bucket, and installs storage RLS.
-- Safe & idempotent.
-- ═══════════════════════════════════════════════════════════════════

-- 1. Preference columns on profiles
alter table public.profiles add column if not exists avatar_id text default 'a1';
alter table public.profiles alter column avatar_id set default 'a1';
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists notification_prefs jsonb
  default jsonb_build_object(
    'emailAlerts', true,
    'pushNotifications', false,
    'weeklyDigest', true,
    'spotUpdates', true,
    'marketing', false
  );
alter table public.profiles add column if not exists theme text default 'dark';
alter table public.profiles add column if not exists font_size text default 'medium';
alter table public.profiles add column if not exists mfa_enabled boolean default false;

-- Backfill defaults for existing rows
update public.profiles
   set notification_prefs = jsonb_build_object(
         'emailAlerts', true,
         'pushNotifications', false,
         'weeklyDigest', true,
         'spotUpdates', true,
         'marketing', false)
 where notification_prefs is null;
update public.profiles set theme = 'dark'     where theme is null;
update public.profiles set font_size = 'medium' where font_size is null;
update public.profiles set avatar_id = 'a1'    where avatar_id is null and avatar_url is null;

-- 2. Avatars storage bucket (public-read, user-write-own)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 2097152, array['image/png','image/jpeg','image/webp','image/gif'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- 3. Storage RLS — users can manage only their own folder, anyone can read
drop policy if exists "avatars public read" on storage.objects;
drop policy if exists "avatars user insert"  on storage.objects;
drop policy if exists "avatars user update"  on storage.objects;
drop policy if exists "avatars user delete"  on storage.objects;

create policy "avatars public read"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "avatars user insert"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "avatars user update"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "avatars user delete"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- 4. Reload PostgREST schema cache
notify pgrst, 'reload schema';

-- 5. Verify
select 'profiles_has_avatar_id'       as check_item,
       exists(select 1 from information_schema.columns
              where table_schema='public' and table_name='profiles' and column_name='avatar_id')::text as value
union all
select 'profiles_has_notification_prefs',
       exists(select 1 from information_schema.columns
              where table_schema='public' and table_name='profiles' and column_name='notification_prefs')::text
union all
select 'avatars_bucket_exists',
       exists(select 1 from storage.buckets where id='avatars')::text
union all
select 'avatars_policies',
       (select count(*)::text from pg_policies
        where schemaname='storage' and tablename='objects' and policyname like 'avatars%');
