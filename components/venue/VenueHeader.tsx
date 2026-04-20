interface VenueHeaderProps {
  name: string
  type: string
  address: string | null
  imageUrl: string | null
}

export function VenueHeader({ name, type, address, imageUrl }: VenueHeaderProps) {
  return (
    <div style={{ position: 'relative', height: 280, background: 'var(--surface)', borderRadius: '0 0 16px 16px', overflow: 'hidden', marginBottom: 28 }}>
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, var(--surface), var(--surface-2))' }} />
      )}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(13,11,8,0.95) 0%, rgba(13,11,8,0.4) 50%, transparent 100%)' }} />
      <div style={{ position: 'absolute', bottom: 24, left: 28, right: 28 }}>
        <span style={{ display: 'inline-block', padding: '4px 10px', borderRadius: 4, border: '1px solid rgba(255,255,255,0.18)', fontSize: 11, color: 'rgba(240,234,214,0.55)', textTransform: 'capitalize', marginBottom: 10 }}>{type}</span>
        <h1 style={{ fontFamily: '"DM Serif Display",serif', fontSize: 'clamp(26px,4vw,38px)', color: '#F0EAD6', margin: 0, lineHeight: 1.1 }}>{name}</h1>
        {address && <p style={{ fontSize: 13, color: 'rgba(240,234,214,0.5)', margin: '8px 0 0' }}>{address}</p>}
      </div>
    </div>
  )
}
