import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(_req: Request, context: { params: Promise<{ venueId: string }> }) {
  const { venueId } = await context.params
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('venues').select('current_count, max_capacity').eq('id', venueId).maybeSingle()
  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(data)
}

export async function POST(req: Request, context: { params: Promise<{ venueId: string }> }) {
  const { venueId } = await context.params
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { delta } = await req.json() as { delta: 1 | -1 }
  if (delta !== 1 && delta !== -1) return NextResponse.json({ error: 'Invalid delta' }, { status: 400 })

  const { data: venue } = await supabase.from('venues')
    .select('current_count, max_capacity, owner_id').eq('id', venueId).maybeSingle()
  if (!venue) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (venue.owner_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const newCount = Math.max(0, Math.min(venue.max_capacity, (venue.current_count ?? 0) + delta))
  await supabase.from('venues').update({ current_count: newCount }).eq('id', venueId)
  await supabase.from('capacity_events').insert({ venue_id: venueId, delta, count_after: newCount })
  return NextResponse.json({ count: newCount })
}
