'use server'
import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createVenue(fields: {
  name: string
  type: string
  description?: string
  address?: string
  website_url?: string
  max_capacity: number
  hours_open: string
  hours_close: string
  popular_items?: string[]
}) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  if (!fields.name?.trim()) return { error: 'Venue name is required' }

  // Normalize: turn empty optional strings into null so Postgres stores NULL, not ''.
  const payload = {
    owner_id: user.id,
    name: fields.name.trim(),
    type: fields.type || 'cafe',
    description: fields.description?.trim() ? fields.description.trim() : null,
    address: fields.address?.trim() ? fields.address.trim() : null,
    website_url: fields.website_url?.trim() ? fields.website_url.trim() : null,
    max_capacity: fields.max_capacity ?? 40,
    hours_open: fields.hours_open ?? '07:00',
    hours_close: fields.hours_close ?? '22:00',
    popular_items: (fields.popular_items ?? []).filter(Boolean),
  }

  const { data, error } = await supabase
    .from('venues')
    .insert(payload)
    .select('id')
    .single()

  if (error) return { error: error.message }
  revalidatePath('/dashboard')
  revalidatePath('/explore')
  return { id: data.id }
}

export async function updateVenue(
  venueId: string,
  fields: Partial<{
    name: string
    type: string
    description: string
    address: string
    website_url: string
    max_capacity: number
    hours_open: string
    hours_close: string
    popular_items: string[]
    image_url: string
    is_active: boolean
    lat: number
    lng: number
  }>,
  amenities?: string[]
) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: venue } = await supabase
    .from('venues')
    .select('owner_id')
    .eq('id', venueId)
    .maybeSingle()

  if (!venue || venue.owner_id !== user.id) return { error: 'Not authorized' }

  const { error } = await supabase.from('venues').update(fields).eq('id', venueId)
  if (error) return { error: error.message }

  if (amenities !== undefined) {
    await supabase.from('venue_amenities').delete().eq('venue_id', venueId)
    if (amenities.length > 0) {
      await supabase.from('venue_amenities').insert(
        amenities.map(label => ({ venue_id: venueId, label }))
      )
    }
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/settings')
  return { success: true }
}

export async function resetCount(venueId: string) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: venue } = await supabase
    .from('venues')
    .select('owner_id')
    .eq('id', venueId)
    .maybeSingle()

  if (!venue || venue.owner_id !== user.id) return { error: 'Not authorized' }

  await supabase.from('venues').update({ current_count: 0 }).eq('id', venueId)

  await supabase.from('capacity_events').insert({
    venue_id: venueId,
    delta: -1,
    count_after: 0,
  })

  revalidatePath('/dashboard')
  return { success: true }
}
