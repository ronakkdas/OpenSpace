'use server'
import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitReview(venueId: string, rating: number, body: string) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .maybeSingle()

  const authorName = profile?.full_name || user.email?.split('@')[0] || 'Anonymous'

  const { error } = await supabase.from('reviews').insert({
    venue_id: venueId,
    author_id: user.id,
    author_name: authorName,
    rating,
    body,
  })

  if (error) return { error: error.message }

  revalidatePath(`/venue/${venueId}`)
  return { success: true }
}
