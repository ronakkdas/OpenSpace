'use server'
import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const FREE_SAVE_LIMIT = 5

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

  // Removing — never blocked, regardless of plan.
  if (existing) {
    await supabase.from('favorites').delete().eq('id', existing.id)
    revalidatePath('/saved')
    revalidatePath('/explore')
    return { favorited: false }
  }

  // Adding — Free plan caps at 5. Look up plan + current count in parallel.
  const [{ data: profile }, { count }] = await Promise.all([
    supabase.from('profiles').select('is_pro').eq('id', user.id).maybeSingle(),
    supabase.from('favorites').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
  ])

  const isPro = profile?.is_pro ?? false
  const current = count ?? 0
  if (!isPro && current >= FREE_SAVE_LIMIT) {
    return {
      error: `You've hit your ${FREE_SAVE_LIMIT}-cafe limit. Upgrade to Pro for unlimited saves — $2/month.`,
      limitReached: true,
    }
  }

  await supabase.from('favorites').insert({ user_id: user.id, venue_id: venueId })
  revalidatePath('/saved')
  revalidatePath('/explore')
  return { favorited: true }
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
