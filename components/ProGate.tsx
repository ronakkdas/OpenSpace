import Link from 'next/link'
import { ReactNode } from 'react'

interface ProGateProps {
  isPro: boolean
  children: ReactNode
}

export function ProGate({ isPro, children }: ProGateProps) {
  if (isPro) return <>{children}</>
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
        <Link href="/pricing" style={{
          fontSize: 13, fontWeight: 600, color: 'var(--gold)',
          textDecoration: 'none', padding: '8px 20px',
          border: '1px solid var(--gold)', borderRadius: 20,
          background: 'var(--gold-dim)',
        }}>
          Unlock for $2/mo →
        </Link>
      </div>
    </div>
  )
}
