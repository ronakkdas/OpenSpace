'use server'
import { createServerClient } from '@/lib/supabase/server'

export async function sendFriendInvite(email: string) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Server-side guard. RLS would also block non-Pro inserts, but failing fast
  // here gives the client a friendlier error than a 403 from PostgREST.
  const { data: profile } = await supabase
    .from('profiles').select('is_pro').eq('id', user.id).maybeSingle()
  if (!profile?.is_pro) return { error: 'Friends mode is a Pro feature.' }

  const cleaned = email.trim().toLowerCase()
  if (!cleaned || !cleaned.includes('@')) return { error: 'Enter a valid email.' }
  if (cleaned === user.email?.toLowerCase()) return { error: "You can't invite yourself." }

  const { error } = await supabase
    .from('friend_invites')
    .insert({ sender_id: user.id, email: cleaned })

  if (error) return { error: error.message }
  return { success: true }
}
