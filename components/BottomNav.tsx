'use client'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'

export function BottomNav() {
  const pathname = usePathname()
  // Use the Next hook instead of reading window.location — otherwise the
  // server renders one "active" tab and the client re-renders another,
  // triggering the hydration mismatch warning.
  const searchParams = useSearchParams()
  const isMapView = searchParams.get('view') === 'map'
  const tabs = [
    { href: '/explore', label: 'Explore', icon: '⊞' },
    { href: '/explore?view=map', label: 'Map', icon: '◎' },
    { href: '/saved', label: 'Saved', icon: '♡' },
    { href: '/account', label: 'Account', icon: '○' },
  ]
  return (
    <nav className="bottom-nav">
      {tabs.map(tab => {
        const isMapTab = tab.href.includes('view=map')
        const active = isMapTab
          ? pathname === '/explore' && isMapView
          : pathname === tab.href.split('?')[0] && !(tab.href === '/explore' && isMapView)
        return (
          <Link key={tab.href} href={tab.href} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: 3, flex: 1, textDecoration: 'none',
            color: active ? 'var(--gold)' : 'var(--text-3)',
            fontSize: 20, transition: 'color 0.15s',
          }}>
            <span>{tab.icon}</span>
            <span style={{ fontSize: 10, letterSpacing: '0.5px' }}>{tab.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
