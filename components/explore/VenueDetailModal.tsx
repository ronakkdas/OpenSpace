'use client'
import { useEffect } from 'react'
import { CapacityBar } from '@/components/CapacityBar'
import { haversineDistance, formatDistance, estimateWalkTime } from '@/lib/distance'
import { isVenueOpen, formatTime, capacityStatus } from '@/lib/utils'
import type { VenueCardVenue } from './VenueCard'

interface Props {
  venue: VenueCardVenue & { hours_close?: string | null; hours_open?: string | null }
  userLat?: number
  userLng?: number
  onClose: () => void
}

// Cafés in Berkeley typically use the same hours every day, so we render
// the same hours_open/hours_close for each weekday until the schema gains
// per-day hours. The placeholder still gives the user a clear week view.
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export function VenueDetailModal({ venue, userLat, userLng, onClose }: Props) {
  // Esc to close + scroll lock while open
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [onClose])

  const pct = venue.max_capacity > 0 ? Math.round((venue.current_count / venue.max_capacity) * 100) : 0
  const isOpen = isVenueOpen(venue.hours_open, venue.hours_close)
  const lastUpdated = 'updated just now' // placeholder — real timestamp would come from capacity_events

  let distText = ''
  if (userLat != null && userLng != null && venue.lat != null && venue.lng != null) {
    const dist = haversineDistance(userLat, userLng, venue.lat, venue.lng)
    distText = `${formatDistance(dist)} · ${estimateWalkTime(dist)}`
  }

  const amenities = venue.venue_amenities?.map(a => a.label) ?? []

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, padding: '32px 36px', maxWidth: 640, width: '100%', maxHeight: '88vh', overflowY: 'auto', position: 'relative' }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Close"
          style={{ position: 'absolute', top: 16, right: 16, width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text-2)', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-1)'; e.currentTarget.style.borderColor = 'var(--border-hover)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-2)'; e.currentTarget.style.borderColor = 'var(--border)' }}
        >
          ×
        </button>

        {/* Header */}
        <div style={{ marginBottom: 24, paddingRight: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, border: '1px solid rgba(255,255,255,0.18)', color: 'rgba(240,234,214,0.55)', textTransform: 'capitalize' }}>{venue.type}</span>
            <span style={{ fontSize: 11, fontWeight: 500, color: isOpen ? '#4A7C59' : '#C0392B', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: isOpen ? '#4A7C59' : '#C0392B' }} />
              {isOpen ? 'Open now' : 'Closed'}
            </span>
            {distText && <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{distText}</span>}
          </div>
          <h2 style={{ fontFamily: '"DM Serif Display",serif', fontSize: 30, color: 'var(--text-1)', margin: 0, fontWeight: 400, lineHeight: 1.15 }}>{venue.name}</h2>
          {venue.address && <p style={{ fontSize: 13, color: 'var(--text-3)', margin: '6px 0 0' }}>{venue.address}</p>}
        </div>

        {/* Big capacity meter */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 22px', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
            <div>
              <p style={{ fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-3)', margin: 0 }}>LIVE CAPACITY</p>
              <p style={{ fontFamily: '"DM Serif Display",serif', fontSize: 28, color: 'var(--text-1)', margin: '4px 0 0' }}>{pct}% full</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 13, color: 'var(--text-2)', margin: 0 }}>{venue.current_count} of {venue.max_capacity} seats</p>
              <p style={{ fontSize: 11, color: 'var(--text-3)', margin: '4px 0 0' }}>{lastUpdated}</p>
            </div>
          </div>
          <CapacityBar current={venue.current_count} max={venue.max_capacity} height={10} />
          <p style={{ fontSize: 12, color: pct >= 90 ? '#C0392B' : pct >= 70 ? '#E8A838' : '#4A7C59', margin: '10px 0 0' }}>{capacityStatus(venue.current_count, venue.max_capacity)}</p>
        </div>

        {/* Description */}
        {venue.description && (
          <Section label="ABOUT">
            <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.7, margin: 0 }}>{venue.description}</p>
          </Section>
        )}

        {/* Hours — full week */}
        {venue.hours_open && venue.hours_close && (
          <Section label="HOURS">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '6px 18px' }}>
              {WEEKDAYS.map(day => (
                <div key={day} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-2)' }}>
                  <span style={{ color: 'var(--text-3)' }}>{day}</span>
                  <span>{formatTime(venue.hours_open!)} – {formatTime(venue.hours_close!)}</span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Popular items */}
        {venue.popular_items && venue.popular_items.length > 0 && (
          <Section label="POPULAR ITEMS">
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {venue.popular_items.map(item => (
                <li key={item} style={{ fontSize: 13, color: 'var(--text-2)', padding: '6px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: 16, border: '1px solid var(--border)' }}>{item}</li>
              ))}
            </ul>
          </Section>
        )}

        {/* Amenities */}
        {amenities.length > 0 && (
          <Section label="FEATURES">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {amenities.map(a => (
                <span key={a} style={{ fontSize: 12, padding: '6px 12px', borderRadius: 16, border: '1px solid var(--border)', color: 'var(--text-1)', background: 'rgba(200,146,58,0.06)' }}>
                  {a}
                </span>
              ))}
            </div>
          </Section>
        )}
      </div>
    </div>
  )
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <p style={{ fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-3)', margin: '0 0 10px' }}>{label}</p>
      {children}
    </div>
  )
}
