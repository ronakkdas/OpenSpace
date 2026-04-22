-- Additional Stripe fields on profiles so the webhook can track subscription
-- state accurately, not just a boolean. Safe to run multiple times.

alter table public.profiles
  add column if not exists stripe_status text,
  add column if not exists stripe_current_period_end timestamptz;

-- Index for the webhook's `where stripe_subscription_id = …` lookups.
create index if not exists profiles_stripe_subscription_id_idx
  on public.profiles (stripe_subscription_id);

-- Tell PostgREST to pick up the new columns.
notify pgrst, 'reload schema';
