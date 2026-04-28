'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AvatarDropdown } from './AvatarDropdown'
import { AddFriendsButton } from './AddFriendsButton'

interface GlobalNavProps {
  userRole: 'student' | 'business' | null
  isPro: boolean
  userInitials?: string
  userEmail?: string
  avatarId?: string | null
  avatarUrl?: string | null
}

export function GlobalNav({ userRole, isPro, userInitials, userEmail, avatarId, avatarUrl }: GlobalNavProps) {
  const pathname = usePathname()
  if (pathname?.startsWith('/dashboard')) return null
  if (pathname?.startsWith('/onboarding')) return null

  const logoHref = !userRole ? '/' : userRole === 'business' ? '/dashboard' : '/explore'
  const isActive = (href: string) => pathname === href

  return (
    <nav className="global-nav">
      <Link href={logoHref} className="global-nav-logo">
        Open<span>Space</span>
      </Link>
      <div className="global-nav-center">
        {userRole === 'business' ? (
          <Link href="/dashboard" className={`nav-link${isActive('/dashboard') ? ' active' : ''}`}>Dashboard</Link>
        ) : (
          <>
            <Link href="/explore" className={`nav-link${isActive('/explore') ? ' active' : ''}`}>Explore</Link>
            <Link href="/pricing" className={`nav-link${isActive('/pricing') ? ' active' : ''}`}>Pricing</Link>
            {userRole === 'student' && (
              <Link href="/saved" className={`nav-link${isActive('/saved') ? ' active' : ''}`}>Saved</Link>
            )}
          </>
        )}
      </div>
      <div className="global-nav-right">
        {!userRole && (
          <>
            <Link href="/login" className="nav-ghost-btn">Sign In</Link>
            <Link href="/login?mode=signup" className="nav-gold-btn">Get Started</Link>
          </>
        )}
        {userRole === 'student' && !isPro && (
          <Link href="/pricing" className="nav-upgrade-btn">Upgrade to Pro</Link>
        )}
        {userRole === 'student' && <AddFriendsButton isPro={isPro} />}
        {userRole && (
          <AvatarDropdown
            initials={userInitials ?? 'U'}
            email={userEmail}
            role={userRole}
            isPro={isPro}
            avatarId={avatarId}
            avatarUrl={avatarUrl}
          />
        )}
      </div>
    </nav>
  )
}
