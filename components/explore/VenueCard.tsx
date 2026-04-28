'use client'
import { CapacityBar } from '@/components/CapacityBar'
import { FavoriteButton } from '@/components/FavoriteButton'
import { haversineDistance, formatDistance, estimateWalkTime } from '@/lib/distance'
import { isVenueOpen, formatTime, capacityStatus } from '@/lib/utils'

export interface VenueCardVenue {
  id: string
  name: string
  description: string | null
  type: string
  address: string | null
  image_url: string | null
  max_capacity: number
  current_count: number
  hours_open: string | null
  hours_close: string | null
  popular_items: string[] | null
  lat: number | null
  lng: number | null
  venue_amenities?: { label: string }[]
}

interface VenueCardProps {
  venue: VenueCardVenue
  isPro: boolean
  isFavorited?: boolean
  userLat?: number
  userLng?: number
  onSelect?: (venue: VenueCardVenue) => void
}

export function VenueCard({ venue, isPro: _isPro, isFavorited = false, userLat, userLng, onSelect }: VenueCardProps) {
  // _isPro is intentionally unused now: capacity is a free-tier feature.
  // Kept in the prop signature so callers don't have to change.
  void _isPro

  const pct = venue.max_capacity > 0 ? Math.round((venue.current_count / venue.max_capacity) * 100) : 0
  const stripeColor = pct >= 90 ? '#C0392B' : pct >= 70 ? '#E8A838' : '#4A7C59'
  const isOpen = isVenueOpen(venue.hours_open, venue.hours_close)
  const hasWifi = venue.venue_amenities?.some(a => a.label === 'WiFi')

  let distText = ''
  let walkText = ''
  if (userLat != null && userLng != null && venue.lat != null && venue.lng != null) {
    const dist = haversineDistance(userLat, userLng, venue.lat, venue.lng)
    distText = formatDistance(dist)
    walkText = estimateWalkTime(dist)
  }

  // Whole card opens the detail modal. The heart's onClick already calls
  // stopPropagation, so toggling save state never opens the modal.
  const handleClick = () => onSelect?.(venue)

  return (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick() } }}
      style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', display: 'flex', transition: 'border-color 0.15s', cursor: 'pointer' }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-hover)')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
    >
      <div style={{ width: 4, background: stripeColor, flexShrink: 0 }} />
      <div style={{ flex: 1, padding: '16px 18px', minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
          <div style={{ minWidth: 0 }}>
            <h3 style={{ fontFamily: '"DM Serif Display",serif', fontSize: 17, color: 'var(--text-1)', margin: 0, lineHeight: 1.2 }}>{venue.name}</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 5, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, border: '1px solid rgba(255,255,255,0.18)', color: 'rgba(240,234,214,0.55)', textTransform: 'capitalize' }}>{venue.type}</span>
              <span style={{ fontSize: 11, fontWeight: 500, color: isOpen ? '#4A7C59' : '#C0392B', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: isOpen ? '#4A7C59' : '#C0392B', display: 'inline-block' }} />
                {isOpen ? 'Open' : 'Closed'}
              </span>
              {hasWifi && <span style={{ fontSize: 11, color: 'var(--text-3)' }}>WiFi</span>}
            </div>
          </div>
          <FavoriteButton venueId={venue.id} initialFavorited={isFavorited} />
        </div>

        {venue.description && (
          <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 12, lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {venue.description}
          </p>
        )}

        {/* Capacity meter — free for everyone (it's the core value prop) */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{venue.current_count} of {venue.max_capacity} seats · {pct}%</span>
            <span style={{ fontSize: 11, color: pct >= 90 ? '#C0392B' : pct >= 70 ? '#E8A838' : '#4A7C59' }}>{capacityStatus(venue.current_count, venue.max_capacity)}</span>
          </div>
          <CapacityBar current={venue.current_count} max={venue.max_capacity} height={6} />
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 16px', fontSize: 12, color: 'var(--text-3)' }}>
          {venue.hours_open && venue.hours_close && <span>{formatTime(venue.hours_open)} – {formatTime(venue.hours_close)}</span>}
          {distText && <span>{distText} · {walkText}</span>}
          {venue.popular_items && venue.popular_items.length > 0 && <span>{venue.popular_items.slice(0, 3).join(', ')}</span>}
        </div>
      </div>
    </div>
  )
}
