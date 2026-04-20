'use client'
import { useState, useTransition } from 'react'
import { submitReview } from '@/actions/reviews'

interface WriteReviewModalProps {
  venueId: string
  onClose: () => void
}

export function WriteReviewModal({ venueId, onClose }: WriteReviewModalProps) {
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [body, setBody] = useState('')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  const handleSubmit = () => {
    if (rating === 0) { setError('Please select a rating'); return }
    if (body.trim().length < 10) { setError('Review must be at least 10 characters'); return }
    setError('')
    startTransition(async () => {
      const result = await submitReview(venueId, rating, body.trim())
      if ('error' in result) { setError(result.error ?? 'Failed'); return }
      onClose()
    })
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(13,11,8,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={onClose}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '28px 32px', width: '100%', maxWidth: 480 }} onClick={e => e.stopPropagation()}>
        <h2 style={{ fontFamily: '"DM Serif Display",serif', fontSize: 22, color: 'var(--text-1)', margin: '0 0 20px' }}>Write a Review</h2>
        <div style={{ marginBottom: 18 }}>
          <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 10 }}>Rating</p>
          <div style={{ display: 'flex', gap: 6 }}>
            {[1,2,3,4,5].map(n => (
              <button key={n} onClick={() => setRating(n)} onMouseEnter={() => setHovered(n)} onMouseLeave={() => setHovered(0)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 28, color: n <= (hovered || rating) ? '#C8923A' : 'rgba(240,234,214,0.2)', transition: 'color 0.1s', padding: '2px 4px' }}>★</button>
            ))}
          </div>
        </div>
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 8 }}>Your review</p>
          <textarea value={body} onChange={e => setBody(e.target.value.slice(0, 280))} placeholder="What did you think of this spot?"
            style={{ width: '100%', minHeight: 100, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px', color: 'var(--text-1)', fontSize: 13, resize: 'vertical', outline: 'none', fontFamily: '"DM Sans",sans-serif', boxSizing: 'border-box' }} />
          <p style={{ fontSize: 11, color: 'var(--text-3)', textAlign: 'right', marginTop: 4 }}>{body.length}/280</p>
        </div>
        {error && <p style={{ fontSize: 12, color: '#C0392B', marginBottom: 14 }}>{error}</p>}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 20, color: 'var(--text-2)', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
          <button onClick={handleSubmit} disabled={isPending} style={{ padding: '10px 24px', background: 'var(--gold)', border: 'none', borderRadius: 20, color: '#2c1a0e', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: isPending ? 0.7 : 1 }}>
            {isPending ? 'Submitting…' : 'Submit Review'}
          </button>
        </div>
      </div>
    </div>
  )
}
