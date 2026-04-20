create or replace function public.adjust_capacity(p_venue_id uuid, p_delta int)
returns void
language plpgsql
security definer
as $$
declare
  v_current int;
  v_max int;
  v_next int;
begin
  select current_count, max_capacity
  into v_current, v_max
  from venues
  where id = p_venue_id
  for update;

  if v_current is null then
    v_current := 0;
  end if;

  if v_max is null then
    v_max := 40;
  end if;

  v_next := greatest(0, least(v_current + p_delta, v_max));

  update venues
  set current_count = v_next
  where id = p_venue_id;

  insert into capacity_events (venue_id, delta, count_after)
  values (p_venue_id, p_delta, v_next);
end;
$$;

