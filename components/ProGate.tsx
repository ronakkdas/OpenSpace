'use client'
import { useRouter } from 'next/navigation'
import { ReactNode } from 'react'

interface ProGateProps {
  isPro: boolean
  children: ReactNode
}

export function ProGate({ isPro, children }: ProGateProps) {
  const router = useRouter()
  if (isPro) return <>{children}</>

  // VenueCard wraps the whole card in <Link>, so we can't nest another <a>
  // here (HTML doesn't allow <a> inside <a> — React warns and hydration breaks).
  // Use a button + router.push, and stopPropagation so clicking "Unlock"
  // doesn't also trigger the outer card link.
  const goPricing = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    router.push('/pricing')
  }

  return (
    <div style={{ position: 'relative', display: 'block' }}>
      <div style={{ filter: 'blur(6px)', pointerEvents: 'none', userSelect: 'none' }}>
        {children}
      </div>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', gap: 10,
        background: 'rgba(13,11,8,0.5)', borderRadius: 12,
        backdropFilter: 'blur(2px)',
      }}>
        <p style={{ fontSize: 13, color: 'var(--text-2)', margin: 0 }}>Pro feature</p>
        <button onClick={goPricing} style={{
          fontSize: 13, fontWeight: 600, color: 'var(--gold)',
          padding: '8px 20px',
          border: '1px solid var(--gold)', borderRadius: 20,
          background: 'var(--gold-dim)',
          cursor: 'pointer', fontFamily: 'inherit',
        }}>
          Unlock for $2/mo →
        </button>
      </div>
    </div>
  )
}
