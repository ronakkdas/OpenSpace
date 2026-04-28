'use client'
import { useState } from 'react'

export function NotifyMeButton({ venueId }: { venueId: string }) {
  const [notified, setNotified] = useState(false)

  // Demo-only: flip a flag in localStorage so reloading remembers the user
  // expressed interest. Wire to a real `cv_waitlist` table once we have one.
  const handle = () => {
    try {
      const key = `cv-waitlist:${venueId}`
      localStorage.setItem(key, new Date().toISOString())
    } catch { /* private mode */ }
    setNotified(true)
  }

  if (notified) {
    return (
      <span style={{ display: 'inline-block', padding: '11px 26px', borderRadius: 24, background: 'var(--gold-dim)', border: '1px solid var(--gold)', color: 'var(--gold)', fontSize: 13, fontWeight: 600 }}>
        ✓ You&apos;re on the list
      </span>
    )
  }
  return (
    <button onClick={handle} style={{ padding: '11px 26px', borderRadius: 24, background: 'transparent', border: '1px solid var(--gold)', color: 'var(--gold)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: '"DM Sans",sans-serif' }}>
      Notify me when available
    </button>
  )
}
