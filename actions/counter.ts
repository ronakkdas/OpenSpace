'use server'
import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateCount(venueId: string, delta: 1 | -1): Promise<{ count: number; error?: string }> {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { count: 0, error: 'Not authenticated' }

  const { data: venue, error: venueErr } = await supabase
    .from('venues')
    .select('current_count, max_capacity, owner_id')
    .eq('id', venueId)
    .maybeSingle()

  if (venueErr || !venue) return { count: 0, error: 'Venue not found' }
  if (venue.owner_id !== user.id) return { count: 0, error: 'Not authorized' }

  const newCount = Math.max(0, Math.min(venue.max_capacity, (venue.current_count ?? 0) + delta))

  const { error: updateErr } = await supabase
    .from('venues')
    .update({ current_count: newCount })
    .eq('id', venueId)

  if (updateErr) return { count: venue.current_count ?? 0, error: updateErr.message }

  await supabase.from('capacity_events').insert({
    venue_id: venueId,
    delta,
    count_after: newCount,
  })

  revalidatePath('/dashboard')
  return { count: newCount }
}
