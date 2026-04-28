'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toggleFavorite } from '@/actions/favorites'

interface FavoriteButtonProps {
  venueId: string
  initialFavorited?: boolean
}

export function FavoriteButton({ venueId, initialFavorited = false }: FavoriteButtonProps) {
  const router = useRouter()
  const [favorited, setFavorited] = useState(initialFavorited)
  const [limitMsg, setLimitMsg] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const next = !favorited
    setFavorited(next) // optimistic
    startTransition(async () => {
      const result = await toggleFavorite(venueId)
      if ('error' in result) {
        setFavorited(!next) // rollback
        if ('limitReached' in result && result.limitReached) {
          setLimitMsg(result.error ?? '')
        }
      }
    })
  }

  return (
    <>
      <button onClick={handleClick} aria-label={favorited ? 'Remove from saved' : 'Save venue'} style={{
        width: 36, height: 36, borderRadius: '50%',
        border: `1px solid ${favorited ? 'var(--gold)' : 'var(--border-hover)'}`,
        background: favorited ? 'var(--gold-dim)' : 'transparent',
        color: favorited ? 'var(--gold)' : 'var(--text-3)',
        fontSize: 16, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.15s ease', flexShrink: 0,
      }}>
        {favorited ? '♥' : '♡'}
      </button>

      {limitMsg && (
        <div onClick={e => { e.stopPropagation(); e.preventDefault(); setLimitMsg(null) }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}>
          <div onClick={e => { e.stopPropagation(); e.preventDefault() }} style={{ background: 'var(--surface)', border: '1px solid var(--gold)', borderRadius: 16, padding: '32px', maxWidth: 420, width: '100%' }}>
            <p style={{ fontSize: 11, letterSpacing: '2.5px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 10 }}>SAVE LIMIT REACHED</p>
            <h2 style={{ fontFamily: '"DM Serif Display",serif', fontSize: 22, color: 'var(--text-1)', margin: '0 0 12px', fontWeight: 400 }}>Unlimited saves with Pro</h2>
            <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6, margin: '0 0 24px' }}>{limitMsg}</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={(e) => { e.stopPropagation(); e.preventDefault(); setLimitMsg(null) }} style={{ flex: 1, padding: '11px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text-2)', fontSize: 13, cursor: 'pointer' }}>Maybe later</button>
              <button onClick={(e) => { e.stopPropagation(); e.preventDefault(); setLimitMsg(null); router.push('/pricing') }} style={{ flex: 2, padding: '11px', background: 'var(--gold)', border: 'none', borderRadius: 10, color: '#2c1a0e', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Upgrade — $2/mo</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
