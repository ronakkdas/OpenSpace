'use client'
import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { WriteReviewModal } from './WriteReviewModal'

interface Review {
  id: string
  author_name: string
  rating: number
  body: string
  created_at: string
}

interface ReviewSectionProps {
  reviews: Review[]
  venueId: string
  isLoggedIn: boolean
}

function Stars({ rating }: { rating: number }) {
  return (
    <span>{Array.from({ length: 5 }, (_, i) => (
      <span key={i} style={{ color: i < rating ? '#C8923A' : 'rgba(240,234,214,0.2)', fontSize: 14 }}>★</span>
    ))}</span>
  )
}

export function ReviewSection({ reviews, venueId, isLoggedIn }: ReviewSectionProps) {
  const [showAll, setShowAll] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const displayed = showAll ? reviews : reviews.slice(0, 3)

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <p style={{ fontSize: 11, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--text-3)', margin: 0 }}>REVIEWS ({reviews.length})</p>
        <button onClick={() => isLoggedIn ? setShowModal(true) : (window.location.href = `/login?next=/venue/${venueId}`)}
          style={{ padding: '8px 18px', borderRadius: 20, background: 'transparent', border: '1px solid var(--border-hover)', color: 'var(--text-1)', fontSize: 12, cursor: 'pointer' }}>
          Write a Review
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {displayed.map(r => (
          <div key={r.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div>
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-1)' }}>{r.author_name}</span>
                <span style={{ fontSize: 11, color: 'var(--text-3)', marginLeft: 10 }}>{formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}</span>
              </div>
              <Stars rating={r.rating} />
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-2)', margin: 0, lineHeight: 1.6 }}>{r.body}</p>
          </div>
        ))}
        {reviews.length === 0 && <p style={{ fontSize: 13, color: 'var(--text-3)', textAlign: 'center', padding: '24px 0' }}>No reviews yet. Be the first!</p>}
      </div>
      {reviews.length > 3 && !showAll && (
        <button onClick={() => setShowAll(true)} style={{ width: '100%', marginTop: 14, padding: '10px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text-2)', fontSize: 13, cursor: 'pointer' }}>
          Show all {reviews.length} reviews
        </button>
      )}
      {showModal && <WriteReviewModal venueId={venueId} onClose={() => setShowModal(false)} />}
    </div>
  )
}
