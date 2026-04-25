'use client'
import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { VenueMapPopup } from './VenueMapPopup'
import type { VenueCardVenue } from './VenueCard'

function RecenterOnUser({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap()
  useEffect(() => { map.setView([lat, lng], map.getZoom()) }, [lat, lng, map])
  return null
}

function makeMarkerIcon(color: string, pct: number) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="44" viewBox="0 0 36 44"><path d="M18 0C8.059 0 0 8.059 0 18c0 13.5 18 26 18 26s18-12.5 18-26C36 8.059 27.941 0 18 0z" fill="${color}"/><circle cx="18" cy="18" r="11" fill="rgba(0,0,0,0.3)"/><text x="18" y="23" text-anchor="middle" font-size="10" font-weight="700" fill="white" font-family="sans-serif">${pct}%</text></svg>`
  return L.divIcon({ html: svg, className: '', iconSize: [36, 44], iconAnchor: [18, 44], popupAnchor: [0, -44] })
}

function makeUserIcon() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8" fill="#4A9CFF" opacity="0.3"/><circle cx="10" cy="10" r="5" fill="#4A9CFF"/><circle cx="10" cy="10" r="3" fill="white"/></svg>`
  return L.divIcon({ html: svg, className: '', iconSize: [20, 20], iconAnchor: [10, 10] })
}

interface MapViewProps {
  venues: VenueCardVenue[]
  userLat: number
  userLng: number
}

export default function MapView({ venues, userLat, userLng }: MapViewProps) {
  // React 18 strict mode mounts effects twice in dev. The first MapContainer
  // init tags the div with `_leaflet_id`; the second sees that and throws
  // "Map container is already initialized." Two-pronged defense:
  //   1. Unique key per logical mount so React gives us a fresh div.
  //   2. Capture the L.Map instance and call .remove() on unmount, which
  //      clears the leaflet id off the underlying DOM node.
  const [mountKey] = useState(() => `map-${Math.random().toString(36).slice(2)}`)
  const mapRef = useRef<L.Map | null>(null)

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (L.Icon.Default.prototype as any)._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    })
    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  return (
    <MapContainer
      key={mountKey}
      center={[userLat, userLng]}
      zoom={15}
      style={{ height: '100%', width: '100%' }}
      zoomControl
      ref={(instance) => { mapRef.current = instance }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OSM' />
      <RecenterOnUser lat={userLat} lng={userLng} />
      <Marker position={[userLat, userLng]} icon={makeUserIcon()} />
      {venues.filter(v => v.lat && v.lng).map(venue => {
        const pct = venue.max_capacity > 0 ? Math.round((venue.current_count / venue.max_capacity) * 100) : 0
        const color = pct >= 90 ? '#C0392B' : pct >= 70 ? '#E8A838' : '#4A7C59'
        return (
          <Marker key={venue.id} position={[venue.lat!, venue.lng!]} icon={makeMarkerIcon(color, pct)}>
            <Popup><VenueMapPopup venue={venue} userLat={userLat} userLng={userLng} /></Popup>
          </Marker>
        )
      })}
    </MapContainer>
  )
}
