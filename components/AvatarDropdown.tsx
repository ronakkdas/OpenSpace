'use client'
import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase/client'
import { Avatar } from './Avatar'

interface Props {
  initials: string
  email?: string
  role: 'student' | 'business'
  isPro: boolean
  avatarId?: string | null
  avatarUrl?: string | null
}

export function AvatarDropdown({ initials, email, role, isPro, avatarId, avatarUrl }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const router = useRouter()

  const cancelClose = () => {
    if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null }
  }
  const scheduleClose = () => {
    cancelClose()
    closeTimer.current = setTimeout(() => setOpen(false), 180)
  }

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => {
      document.removeEventListener('mousedown', handler)
      cancelClose()
    }
  }, [])

  const signOut = async () => {
    const supabase = createBrowserClient()
    await supabase.auth.signOut()
    setOpen(false)
    router.push('/')
    router.refresh()
  }

  const badge = isPro ? '★ Pro' : role === 'business' ? 'Business' : 'Free'
  const badgeColor = isPro || role === 'business' ? 'var(--gold)' : 'var(--text-3)'

  return (
    <div ref={ref} style={{ position: 'relative' }} onMouseEnter={() => { cancelClose(); setOpen(true) }} onMouseLeave={scheduleClose}>
      <button
        onClick={() => setOpen(v => !v)}
        className="nav-avatar"
        style={{ cursor: 'pointer', border: 'none', background: 'transparent', padding: 0 }}
        aria-label="Account menu"
      >
        <Avatar avatarId={avatarId} avatarUrl={avatarUrl} initials={initials} size={34} />
      </button>

      {open && (
        <div
          role="menu"
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
          style={{
            position: 'absolute',
            top: '100%',
            paddingTop: 8,   // invisible hover-bridge between avatar and menu
            right: 0,
            minWidth: 240,
            zIndex: 100,
          }}
        >
         <div style={{
           background: 'var(--surface)',
           border: '1px solid var(--border)',
           borderRadius: 12,
           padding: 6,
           boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
         }}>
          {/* Header */}
          <div style={{ padding: '12px 14px 10px', borderBottom: '1px solid var(--border)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Avatar avatarId={avatarId} avatarUrl={avatarUrl} initials={initials} size={36} border />
            <div style={{ minWidth: 0, flex: 1 }}>
              <p style={{ fontSize: 13, color: 'var(--text-1)', margin: 0, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{email}</p>
              <span style={{ display: 'inline-block', marginTop: 4, fontSize: 10, padding: '2px 8px', borderRadius: 4, border: `1px solid ${badgeColor}`, color: badgeColor, letterSpacing: '1px', textTransform: 'uppercase' }}>
                {badge}
              </span>
            </div>
          </div>

          {/* Menu items */}
          {role === 'business' && (
            <Link href="/dashboard" onClick={() => setOpen(false)} style={itemStyle}>
              <span style={iconStyle}>⬗</span>Dashboard
            </Link>
          )}
          <Link href="/account" onClick={() => setOpen(false)} style={itemStyle}>
            <span style={iconStyle}>◎</span>Account Settings
          </Link>
          {role === 'student' && (
            <Link href="/saved" onClick={() => setOpen(false)} style={itemStyle}>
              <span style={iconStyle}>♡</span>Saved Spots
            </Link>
          )}
          {role === 'student' && !isPro && (
            <Link href="/pricing" onClick={() => setOpen(false)} style={{ ...itemStyle, color: 'var(--gold)' }}>
              <span style={iconStyle}>★</span>Upgrade to Pro
            </Link>
          )}

          <div style={{ height: 1, background: 'var(--border)', margin: '6px 0' }} />

          <button onClick={signOut} style={{ ...itemStyle, width: '100%', background: 'none', border: 'none', textAlign: 'left', color: '#C0392B', cursor: 'pointer' }}>
            <span style={iconStyle}>⎋</span>Log Out
          </button>
         </div>
        </div>
      )}
    </div>
  )
}

const itemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '9px 14px',
  borderRadius: 8,
  color: 'var(--text-2)',
  fontSize: 13,
  textDecoration: 'none',
  fontFamily: '"DM Sans",sans-serif',
}

const iconStyle: React.CSSProperties = {
  fontSize: 14,
  width: 18,
  textAlign: 'center',
  opacity: 0.8,
}
