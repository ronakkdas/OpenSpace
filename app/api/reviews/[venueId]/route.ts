import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(_req: Request, context: { params: Promise<{ venueId: string }> }) {
  const { venueId } = await context.params
  const supabase = await createServerClient()
  const { data, error } = await supabase.from('reviews')
    .select('id, author_name, rating, body, created_at').eq('venue_id', venueId).order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request, context: { params: Promise<{ venueId: string }> }) {
  const { venueId } = await context.params
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { rating, body } = await req.json()
  const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).maybeSingle()
  const authorName = profile?.full_name || user.email?.split('@')[0] || 'Anonymous'
  const { error } = await supabase.from('reviews').insert({ venue_id: venueId, author_id: user.id, author_name: authorName, rating, body })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true }, { status: 201 })
}
