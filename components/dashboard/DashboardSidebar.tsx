'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase/client'

interface DashboardSidebarProps {
  venueName: string
  isActive: boolean
  ownerName: string
}

export function DashboardSidebar({ venueName, isActive, ownerName }: DashboardSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '⊞' },
    { href: '/dashboard/analytics', label: 'Analytics', icon: '↗' },
    { href: '/dashboard/settings', label: 'Venue Settings', icon: '⚙' },
    { href: '/dashboard/reviews', label: 'Reviews', icon: '★' },
    { href: '/dashboard/cv-model', label: 'Computer Vision', icon: '◉' },
    { href: '/account', label: 'Subscription', icon: '◎' },
  ]

  const handleSignOut = async () => {
    const supabase = createBrowserClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <aside className="dashboard-sidebar" style={{ width: 240, position: 'fixed', top: 0, left: 0, bottom: 0, background: 'var(--surface)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', zIndex: 40, overflowY: 'auto' }}>
      <div style={{ padding: '24px 24px 8px' }}>
        <Link href="/dashboard" style={{ textDecoration: 'none', display: 'block', marginBottom: 32 }}>
          <span style={{ fontFamily: '"DM Serif Display",serif', fontSize: 20, color: '#F0EAD6' }}>Open<span style={{ color: '#C8923A' }}>Space</span></span>
          <p style={{ fontSize: 9, letterSpacing: '2.5px', color: 'var(--gold)', margin: '2px 0 0', textTransform: 'uppercase', fontWeight: 500 }}>Business</p>
        </Link>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {navItems.map(item => {
            const active = pathname === item.href
            return (
              <Link key={item.href} href={item.href} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, textDecoration: 'none', color: active ? 'var(--text-1)' : 'var(--text-2)', background: active ? 'rgba(255,255,255,0.06)' : 'transparent', borderLeft: active ? '2px solid var(--gold)' : '2px solid transparent', fontSize: 13, fontWeight: active ? 500 : 400, transition: 'all 0.15s' }}>
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>
      <div style={{ marginTop: 'auto', padding: '20px 24px', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: isActive ? '#4A7C59' : '#C0392B', flexShrink: 0 }} />
          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-1)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{venueName}</p>
            <p style={{ fontSize: 11, color: 'var(--text-3)', margin: 0 }}>{ownerName}</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-2)', fontSize: 12, cursor: 'pointer', fontFamily: '"DM Sans",sans-serif', transition: 'all 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#C0392B'; e.currentTarget.style.color = '#C0392B' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-2)' }}
        >
          <span style={{ fontSize: 13 }}>⎋</span>Sign out
        </button>
      </div>
    </aside>
  )
}
