'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function BottomNav() {
  const pathname = usePathname()
  const tabs = [
    { href: '/explore', label: 'Explore', icon: '⊞' },
    { href: '/explore?view=map', label: 'Map', icon: '◎' },
    { href: '/saved', label: 'Saved', icon: '♡' },
    { href: '/account', label: 'Account', icon: '○' },
  ]
  return (
    <nav className="bottom-nav">
      {tabs.map(tab => {
        const active = pathname === tab.href.split('?')[0] && !tab.href.includes('view=map')
          || (tab.href.includes('view=map') && pathname === '/explore' && typeof window !== 'undefined' && window.location.search.includes('view=map'))
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
