-- Friends-mode minimal schema. Pro users send invites by email; recipients
-- accept once they sign up. Safe to re-run.

create table if not exists public.friend_invites (
  id          uuid primary key default gen_random_uuid(),
  sender_id   uuid not null references auth.users(id) on delete cascade,
  email       text not null,
  status      text not null default 'pending', -- 'pending' | 'accepted' | 'declined'
  created_at  timestamptz not null default now()
);

create index if not exists friend_invites_sender_idx on public.friend_invites (sender_id);
create index if not exists friend_invites_email_idx  on public.friend_invites (lower(email));

alter table public.friend_invites enable row level security;

drop policy if exists "owners read invites" on public.friend_invites;
create policy "owners read invites" on public.friend_invites
  for select using (auth.uid() = sender_id);

drop policy if exists "pro users send invites" on public.friend_invites;
create policy "pro users send invites" on public.friend_invites
  for insert with check (
    auth.uid() = sender_id
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_pro = true)
  );

drop policy if exists "owners delete invites" on public.friend_invites;
create policy "owners delete invites" on public.friend_invites
  for delete using (auth.uid() = sender_id);

notify pgrst, 'reload schema';
