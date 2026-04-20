import { createServerClient } from '@/lib/supabase/server'
import { isVenueOpen } from '@/lib/utils'
import ExploreClient from './ExploreClient'

async function getVenues() {
  const supabase = await createServerClient()
  const { data } = await supabase
    .from('venues')
    .select('id, name, description, type, address, image_url, max_capacity, current_count, hours_open, hours_close, popular_items, is_active, lat, lng, venue_amenities(label)')
    .eq('is_active', true)
    .order('name')
  return (data ?? []).map(v => ({ ...v, isOpen: isVenueOpen(v.hours_open, v.hours_close) }))
}

export default async function ExplorePage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  let isPro = false
  let favoriteIds: string[] = []

  if (user) {
    const { data: profile } = await supabase.from('profiles').select('is_pro').eq('id', user.id).maybeSingle()
    isPro = profile?.is_pro ?? false
    const { data: favs } = await supabase.from('favorites').select('venue_id').eq('user_id', user.id)
    favoriteIds = (favs ?? []).map(f => f.venue_id)
  }

  const venues = await getVenues()

  return <ExploreClient venues={venues} isPro={isPro} favoriteIds={favoriteIds} />
}
