interface AmenitiesRowProps {
  amenities: string[]
}

export function AmenitiesRow({ amenities }: AmenitiesRowProps) {
  return (
    <div>
      <p style={{ fontSize: 11, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 14 }}>AMENITIES</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {amenities.length === 0
          ? <span style={{ fontSize: 13, color: 'var(--text-3)' }}>No amenities listed</span>
          : amenities.map(label => (
            <span key={label} style={{ padding: '6px 14px', borderRadius: 4, border: '1px solid rgba(255,255,255,0.18)', fontSize: 12, color: 'rgba(240,234,214,0.55)' }}>{label}</span>
          ))
        }
      </div>
    </div>
  )
}
