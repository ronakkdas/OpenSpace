import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(_req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const supabase = await createServerClient()
  const { data, error } = await supabase.from('venues').select(`
    id, name, description, type, address, lat, lng,
    hours_open, hours_close, max_capacity, current_count,
    popular_items, website_url, image_url, is_active, owner_id,
    venue_amenities(id, label),
    reviews(id, author_name, rating, body, created_at),
    crowd_patterns(id, hour, day_type, avg_pct)
  `).eq('id', id).eq('is_active', true).maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(data)
}

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: venue } = await supabase.from('venues').select('owner_id').eq('id', id).maybeSingle()
  if (!venue || venue.owner_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const body = await req.json()
  const { data, error } = await supabase.from('venues').update(body).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(_req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: venue } = await supabase.from('venues').select('owner_id').eq('id', id).maybeSingle()
  if (!venue || venue.owner_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  await supabase.from('venues').update({ is_active: false }).eq('id', id)
  return NextResponse.json({ success: true })
}
