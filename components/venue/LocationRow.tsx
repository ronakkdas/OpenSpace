'use client'
import { useUserLocation } from '@/hooks/useUserLocation'
import { haversineDistance, formatDistance, estimateWalkTime } from '@/lib/distance'

interface LocationRowProps {
  address: string | null
  lat: number | null
  lng: number | null
}

export function LocationRow({ address, lat, lng }: LocationRowProps) {
  const { location } = useUserLocation()
  let distText = ''
  let walkText = ''
  if (location && lat && lng) {
    const dist = haversineDistance(location.lat, location.lng, lat, lng)
    distText = formatDistance(dist)
    walkText = estimateWalkTime(dist)
  }
  const mapsUrl = lat && lng
    ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
    : address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}` : '#'
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
      <div>
        {address && <p style={{ fontSize: 14, color: 'var(--text-1)', margin: '0 0 4px' }}>{address}</p>}
        {(distText || walkText) && <p style={{ fontSize: 13, color: 'var(--text-2)', margin: 0 }}>{distText} · {walkText}</p>}
      </div>
      <a href={mapsUrl} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: 'var(--gold)', textDecoration: 'none', padding: '8px 16px', border: '1px solid var(--gold)', borderRadius: 20 }}>
        Get Directions ↗
      </a>
    </div>
  )
}
