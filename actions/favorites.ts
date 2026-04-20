'use server'
import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleFavorite(venueId: string) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: existing } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', user.id)
    .eq('venue_id', venueId)
    .maybeSingle()

  if (existing) {
    await supabase.from('favorites').delete().eq('id', existing.id)
    revalidatePath('/saved')
    return { favorited: false }
  } else {
    await supabase.from('favorites').insert({ user_id: user.id, venue_id: venueId })
    revalidatePath('/saved')
    return { favorited: true }
  }
}

export async function getUserFavorites() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('favorites')
    .select(`
      id,
      venue_id,
      venues (
        id, name, description, type, address, image_url,
        max_capacity, current_count, hours_open, hours_close,
        popular_items, is_active, lat, lng
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (data ?? []).map(f => f.venues).filter(Boolean)
}
