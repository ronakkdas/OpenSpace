'use client'
import { useState, useTransition } from 'react'
import { toggleFavorite } from '@/actions/favorites'

interface FavoriteButtonProps {
  venueId: string
  initialFavorited?: boolean
}

export function FavoriteButton({ venueId, initialFavorited = false }: FavoriteButtonProps) {
  const [favorited, setFavorited] = useState(initialFavorited)
  const [, startTransition] = useTransition()

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const next = !favorited
    setFavorited(next)
    startTransition(async () => {
      const result = await toggleFavorite(venueId)
      if ('error' in result) setFavorited(!next)
    })
  }

  return (
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
  )
}
