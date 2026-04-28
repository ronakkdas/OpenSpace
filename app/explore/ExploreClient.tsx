'use client'
import { useState, useMemo, useEffect } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import dynamic from 'next/dynamic'
import { VenueCard } from '@/components/explore/VenueCard'
import type { VenueCardVenue } from '@/components/explore/VenueCard'
import { VenueDetailModal } from '@/components/explore/VenueDetailModal'
import { ProPreviewSection } from '@/components/explore/ProPreviewSection'
import { useUserLocation } from '@/hooks/useUserLocation'
import { haversineDistance } from '@/lib/distance'
import { isVenueOpen } from '@/lib/utils'

const MapView = dynamic(() => import('@/components/explore/MapView'), { ssr: false, loading: () => <div style={{ height: '100%', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)' }}>Loading map…</div> })

type Filter = 'all' | 'cafe' | 'library' | 'lounge' | 'open'
type View = 'list' | 'map'

interface ExploreClientProps {
  venues: (VenueCardVenue & { isOpen?: boolean })[]
  isPro: boolean
  favoriteIds: string[]
}

export default function ExploreClient({ venues, isPro, favoriteIds }: ExploreClientProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const [filter, setFilter] = useState<Filter>('all')
  const [view, setView] = useState<View>(searchParams.get('view') === 'map' ? 'map' : 'list')
  const [search, setSearch] = useState('')
  const [selectedCafe, setSelectedCafe] = useState<VenueCardVenue | null>(null)
  const { location } = useUserLocation()

  useEffect(() => {
    const urlView = searchParams.get('view') === 'map' ? 'map' : 'list'
    if (urlView !== view) setView(urlView)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const setViewAndUrl = (v: View) => {
    setView(v)
    const params = new URLSearchParams(searchParams.toString())
    if (v === 'map') params.set('view', 'map')
    else params.delete('view')
    const qs = params.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  const filtered = useMemo(() => {
    let vs = venues
    if (search) vs = vs.filter(v => v.name.toLowerCase().includes(search.toLowerCase()) || v.description?.toLowerCase().includes(search.toLowerCase()))
    if (filter === 'open') vs = vs.filter(v => isVenueOpen(v.hours_open, v.hours_close))
    else if (filter !== 'all') vs = vs.filter(v => v.type === filter)
    if (location) {
      vs = [...vs].sort((a, b) => {
        if (!a.lat || !a.lng) return 1
        if (!b.lat || !b.lng) return -1
        const da = haversineDistance(location.lat, location.lng, a.lat, a.lng)
        const db = haversineDistance(location.lat, location.lng, b.lat, b.lng)
        return da - db
      })
    }
    return vs
  }, [venues, filter, search, location])

  const BERKELEY = { lat: 37.8724, lng: -122.2595 }
  const userLat = location?.lat ?? BERKELEY.lat
  const userLng = location?.lng ?? BERKELEY.lng

  const mappable = useMemo(() => filtered.filter(v => v.lat != null && v.lng != null), [filtered])
  const missingCoords = filtered.length - mappable.length

  const chips: { key: Filter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'cafe', label: 'Cafes' },
    { key: 'library', label: 'Libraries' },
    { key: 'lounge', label: 'Lounges' },
    { key: 'open', label: 'Open Now' },
  ]

  return (
    <main style={{ paddingTop: 65, minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '40px 24px 24px' }}>
        <p style={{ fontSize: 11, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 12 }}>BERKELEY STUDY SPOTS</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
          <h1 style={{ fontFamily: '"DM Serif Display",serif', fontSize: 'clamp(28px,4vw,44px)', color: 'var(--text-1)', margin: 0 }}>Find your seat.</h1>
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)' }}>
            {(['list','map'] as View[]).map(v => (
              <button key={v} onClick={() => setViewAndUrl(v)} style={{ padding: '8px 18px', background: view === v ? 'rgba(255,255,255,0.1)' : 'transparent', color: view === v ? 'var(--text-1)' : 'var(--text-3)', border: 'none', fontSize: 12, cursor: 'pointer', fontFamily: '"DM Sans",sans-serif', textTransform: 'capitalize' }}>
                {v === 'list' ? 'List' : 'Map'}
              </button>
            ))}
          </div>
        </div>

        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search cafes, libraries…"
          style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 18px', color: 'var(--text-1)', fontSize: 14, outline: 'none', marginBottom: 16, boxSizing: 'border-box', fontFamily: '"DM Sans",sans-serif' }}
          onFocus={e => (e.target.style.borderColor = 'var(--gold)')}
          onBlur={e => (e.target.style.borderColor = 'var(--border)')} />

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
          {chips.map(c => (
            <button key={c.key} onClick={() => setFilter(c.key)} style={{ padding: '6px 16px', borderRadius: 20, border: `1px solid ${filter === c.key ? 'rgba(200,146,58,0.5)' : 'var(--border)'}`, background: filter === c.key ? 'var(--gold-dim)' : 'transparent', color: filter === c.key ? 'var(--gold)' : 'var(--text-2)', fontSize: 12, cursor: 'pointer', transition: 'all 0.15s' }}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {view === 'list' ? (
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 24px 80px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map(v => (
              <VenueCard
                key={v.id}
                venue={v}
                isPro={isPro}
                isFavorited={favoriteIds.includes(v.id)}
                userLat={userLat}
                userLng={userLng}
                onSelect={setSelectedCafe}
              />
            ))}
            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-3)' }}>
                <p style={{ fontSize: 24, fontFamily: '"DM Serif Display",serif', marginBottom: 8 }}>No spots found</p>
                <p style={{ fontSize: 13 }}>Try a different filter or search term.</p>
              </div>
            )}
          </div>

          {/* Pro Preview — only for free users, only in list view */}
          {!isPro && filtered.length > 0 && <ProPreviewSection />}
        </div>
      ) : (
        <div style={{ padding: '0 16px 24px' }}>
          {missingCoords > 0 && (
            <div style={{ maxWidth: 860, margin: '0 auto 12px', padding: '10px 14px', background: 'rgba(200,146,58,0.08)', border: '1px solid rgba(200,146,58,0.25)', borderRadius: 8, fontSize: 12, color: 'var(--text-2)' }}>
              Showing {mappable.length} of {filtered.length} spots on the map — {missingCoords} {missingCoords === 1 ? 'venue is' : 'venues are'} missing a pinned address.
            </div>
          )}
          <div style={{ height: 'calc(100vh - 240px)', minHeight: 420, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)' }}>
            <MapView venues={mappable} userLat={userLat} userLng={userLng} />
          </div>
        </div>
      )}

      {selectedCafe && (
        <VenueDetailModal
          venue={selectedCafe}
          userLat={userLat}
          userLng={userLng}
          onClose={() => setSelectedCafe(null)}
        />
      )}
    </main>
  )
}
