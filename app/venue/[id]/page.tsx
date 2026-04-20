import { createServerClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { VenueHeader } from '@/components/venue/VenueHeader'
import { LocationRow } from '@/components/venue/LocationRow'
import { LiveCapacityCard } from '@/components/venue/LiveCapacityCard'
import { CrowdPatternChart } from '@/components/venue/CrowdPatternChart'
import { AmenitiesRow } from '@/components/venue/AmenitiesRow'
import { ReviewSection } from '@/components/venue/ReviewSection'
import { ProGate } from '@/components/ProGate'
import { VenueDetailMiniMap } from './VenueDetailClient'

interface Props { params: { id: string } }

export default async function VenueDetailPage({ params }: Props) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: venue }, { data: profile }] = await Promise.all([
    supabase.from('venues').select(`
      id, name, description, type, address, lat, lng,
      hours_open, hours_close, max_capacity, current_count,
      popular_items, website_url, image_url, is_active, owner_id,
      venue_amenities(label),
      reviews(id, author_name, rating, body, created_at),
      crowd_patterns(hour, day_type, avg_pct)
    `).eq('id', params.id).eq('is_active', true).maybeSingle(),
    user ? supabase.from('profiles').select('is_pro').eq('id', user.id).maybeSingle() : Promise.resolve({ data: null }),
  ])

  if (!venue) notFound()

  const isPro = profile?.is_pro ?? false
  const amenities = (venue.venue_amenities ?? []).map((a: { label: string }) => a.label)
  const reviews = [...(venue.reviews ?? [])].sort((a: { created_at: string }, b: { created_at: string }) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  const patterns = venue.crowd_patterns ?? []

  return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh', paddingTop: 65 }}>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '0 24px 80px' }}>
        <div style={{ padding: '16px 0 8px' }}>
          <Link href="/explore" style={{ fontSize: 12, color: 'var(--text-3)', textDecoration: 'none' }}>← Back to spots</Link>
        </div>

        <VenueHeader name={venue.name} type={venue.type} address={venue.address} imageUrl={venue.image_url} />
        <LocationRow address={venue.address} lat={venue.lat} lng={venue.lng} />

        {venue.lat && venue.lng && (
          <div style={{ margin: '20px 0' }}>
            <VenueDetailMiniMap lat={venue.lat} lng={venue.lng} name={venue.name} />
          </div>
        )}

        <div style={{ margin: '20px 0' }}>
          <ProGate isPro={isPro}>
            <LiveCapacityCard venueId={venue.id} initialCount={venue.current_count ?? 0} maxCapacity={venue.max_capacity ?? 40} />
          </ProGate>
        </div>

        <div style={{ margin: '20px 0' }}>
          <ProGate isPro={isPro}>
            <CrowdPatternChart patterns={patterns} />
          </ProGate>
        </div>

        {venue.description && (
          <div style={{ margin: '24px 0', padding: '20px 0', borderTop: '1px solid var(--border)' }}>
            <p style={{ fontSize: 11, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 12 }}>ABOUT</p>
            <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.7, margin: 0 }}>{venue.description}</p>
          </div>
        )}

        <div style={{ margin: '24px 0', padding: '20px 0', borderTop: '1px solid var(--border)' }}>
          <AmenitiesRow amenities={amenities} />
        </div>

        {venue.popular_items && venue.popular_items.length > 0 && (
          <div style={{ margin: '24px 0', padding: '20px 0', borderTop: '1px solid var(--border)' }}>
            <p style={{ fontSize: 11, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 14 }}>POPULAR ITEMS</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {venue.popular_items.map((item: string) => (
                <span key={item} style={{ padding: '6px 14px', borderRadius: 4, border: '1px solid rgba(255,255,255,0.18)', fontSize: 12, color: 'rgba(240,234,214,0.55)' }}>{item}</span>
              ))}
            </div>
          </div>
        )}

        {venue.website_url && (
          <div style={{ margin: '24px 0', padding: '20px 0', borderTop: '1px solid var(--border)' }}>
            <p style={{ fontSize: 11, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 12 }}>CONTACT</p>
            <a href={venue.website_url} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: 'var(--gold)', textDecoration: 'none' }}>{venue.website_url} ↗</a>
          </div>
        )}

        <div style={{ margin: '24px 0', padding: '20px 0', borderTop: '1px solid var(--border)' }}>
          <ReviewSection reviews={reviews} venueId={venue.id} isLoggedIn={!!user} />
        </div>
      </div>
    </main>
  )
}
