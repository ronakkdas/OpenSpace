'use client';

import Link from 'next/link';

export function HomeNav() {
  return (
    <nav className="home-nav">
      <div className="home-logo">
        Open<span>Space</span>
      </div>
      <div className="nav-links">
        <Link href="/explore">Explore</Link>
        <Link href="/pricing">Pricing</Link>
        <Link href="/login" className="nav-ghost">
          Sign In
        </Link>
        <Link href="/login?signup=true" className="nav-cta">
          Get Started →
        </Link>
      </div>
    </nav>
  );
}

