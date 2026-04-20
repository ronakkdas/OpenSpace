import Link from 'next/link'
import { CapacityBar } from '@/components/CapacityBar'
import { haversineDistance, formatDistance, estimateWalkTime } from '@/lib/distance'
import { isVenueOpen } from '@/lib/utils'
import type { VenueCardVenue } from './VenueCard'

interface VenueMapPopupProps {
  venue: VenueCardVenue
  userLat?: number
  userLng?: number
}

export function VenueMapPopup({ venue, userLat, userLng }: VenueMapPopupProps) {
  const pct = venue.max_capacity > 0 ? Math.round((venue.current_count / venue.max_capacity) * 100) : 0
  const isOpen = isVenueOpen(venue.hours_open, venue.hours_close)
  let distText = ''
  if (userLat && userLng && venue.lat && venue.lng) {
    const dist = haversineDistance(userLat, userLng, venue.lat, venue.lng)
    distText = `${formatDistance(dist)} · ${estimateWalkTime(dist)}`
  }
  return (
    <div style={{ minWidth: 200, fontFamily: '"DM Sans",sans-serif' }}>
      <div style={{ fontFamily: '"DM Serif Display",serif', fontSize: 15, marginBottom: 4 }}>{venue.name}</div>
      <div style={{ fontSize: 11, color: '#888', marginBottom: 8, textTransform: 'capitalize' }}>
        {venue.type} · {isOpen ? '● Open' : '● Closed'}{distText ? ` · ${distText}` : ''}
      </div>
      <CapacityBar current={venue.current_count} max={venue.max_capacity} height={5} />
      <div style={{ fontSize: 11, color: '#666', marginTop: 4, marginBottom: 8 }}>{venue.current_count}/{venue.max_capacity} seats · {pct}% full</div>
      <Link href={`/venue/${venue.id}`} style={{ display: 'inline-block', padding: '5px 14px', background: '#C8923A', color: '#2c1a0e', borderRadius: 12, fontSize: 11, fontWeight: 600, textDecoration: 'none' }}>
        View Details →
      </Link>
    </div>
  )
}
