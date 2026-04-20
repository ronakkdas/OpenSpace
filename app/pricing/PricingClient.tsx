'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const FREE_FEATURES = [
  'See venue names & types',
  'Browse the explore feed',
  'Write reviews',
  'Basic map access',
]
const PRO_FEATURES = [
  'Live capacity all venues',
  'Crowd pattern charts',
  'Distance & walk time',
  'Save favorite spots',
  'Full venue details',
  'Map view',
  'Priority venue placement',
]
const BUSINESS_FEATURES = [
  'Live capacity counter for staff',
  'Crowd pattern analytics',
  'Customer reviews inbox',
  'Real-time dashboard',
  'Venue profile management',
  'Free — we take a small cut of Pro',
]
const FAQ = [
  { q: 'What is OpenSpace Pro?', a: 'Pro gives you live occupancy data, crowd pattern charts, distance estimates, and saved favorites for all Berkeley study spots.' },
  { q: 'Can I cancel anytime?', a: 'Yes. Cancel from your account page at any time. Access continues until the end of your billing period.' },
  { q: 'Is my payment secure?', a: 'Payments are processed by Stripe. We never store your card details.' },
]

interface Props {
  role: 'student' | 'business' | null
  isPro: boolean
  isLoggedIn: boolean
}

export default function PricingClient({ role, isPro, isLoggedIn }: Props) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const router = useRouter()

  const handleCheckout = () => {
    if (!isLoggedIn) { router.push('/login?next=/pricing'); return }
    setError('')
    startTransition(async () => {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' })
      if (!res.ok) {
        const data = await res.json()
        if (data.error === 'Unauthorized') { router.push('/login?next=/pricing'); return }
        setError(data.error ?? 'Something went wrong')
        return
      }
      const { url } = await res.json()
      if (url) window.location.href = url
    })
  }

  const divider = <div style={{ width: 1, background: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />

  // BUSINESS user view — show business-focused pricing
  if (role === 'business') {
    return (
      <main style={{ background: 'var(--bg)', minHeight: '100vh', paddingTop: 65 }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '72px 24px 100px' }}>
          <p style={{ fontSize: 11, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 14 }}>FOR BUSINESSES</p>
          <h1 style={{ fontFamily: '"DM Serif Display",serif', fontSize: 'clamp(36px,5vw,58px)', color: 'var(--text-1)', fontWeight: 400, margin: '0 0 24px', lineHeight: 1.1 }}>Free for venues.</h1>
          <p style={{ fontSize: 16, color: 'var(--text-2)', lineHeight: 1.7, marginBottom: 48, maxWidth: 520 }}>
            OpenSpace is free for cafes, libraries, and lounges. Your venue profile, live counter, and analytics are all included. We make revenue from student Pro subscriptions.
          </p>

          <div style={{ background: 'var(--surface)', border: '1px solid var(--gold)', borderRadius: 14, padding: '32px 36px', marginBottom: 40 }}>
            <p style={{ fontSize: 11, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 10 }}>BUSINESS PLAN</p>
            <p style={{ fontFamily: '"DM Serif Display",serif', fontSize: 52, color: 'var(--text-1)', margin: '0 0 6px' }}>$0<span style={{ fontSize: 18, color: 'var(--text-2)', fontFamily: '"DM Sans",sans-serif' }}>/mo</span></p>
            <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.7, marginBottom: 24 }}>Everything you need to run your venue.</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px' }}>
              {BUSINESS_FEATURES.map(f => (
                <li key={f} style={{ fontSize: 13, color: 'var(--text-2)', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ color: 'var(--gold)', fontSize: 12 }}>✓</span>{f}
                </li>
              ))}
            </ul>
            <Link href="/dashboard" style={{ display: 'inline-block', padding: '11px 26px', borderRadius: 24, background: 'var(--gold)', color: '#2c1a0e', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
              Go to Dashboard →
            </Link>
          </div>
        </div>
      </main>
    )
  }

  // Student / logged-out view
  return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh', paddingTop: 65 }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '72px 24px 100px' }}>
        <p style={{ fontSize: 11, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 14 }}>PRICING</p>
        <h1 style={{ fontFamily: '"DM Serif Display",serif', fontSize: 'clamp(36px,5vw,58px)', color: 'var(--text-1)', fontWeight: 400, margin: '0 0 64px', lineHeight: 1.1 }}>Simple. No surprises.</h1>

        <div className="pricing-grid" style={{ display: 'flex', gap: 0, marginBottom: 80 }}>
          {/* Free */}
          <div style={{ flex: 1, paddingRight: 60 }}>
            <p style={{ fontSize: 11, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 10 }}>FREE</p>
            <p style={{ fontFamily: '"DM Serif Display",serif', fontSize: 52, color: 'var(--text-1)', margin: '0 0 12px' }}>$0</p>
            <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.7, marginBottom: 20 }}>Browse venues, no account required.</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px' }}>
              {FREE_FEATURES.map(f => (
                <li key={f} style={{ fontSize: 13, color: 'var(--text-2)', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ color: 'var(--gold)', fontSize: 12 }}>—</span>{f}
                </li>
              ))}
            </ul>
            <Link href="/explore" style={{ display: 'inline-block', padding: '11px 26px', borderRadius: 24, border: '1px solid rgba(255,255,255,0.2)', color: 'var(--text-1)', fontSize: 13, textDecoration: 'none' }}>Browse Free</Link>
          </div>
          {divider}
          {/* Pro */}
          <div style={{ flex: 1, paddingLeft: 60, borderLeft: '1px solid var(--gold)', marginLeft: -1 }}>
            <p style={{ fontSize: 11, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 10 }}>PRO</p>
            <p style={{ fontFamily: '"DM Serif Display",serif', fontSize: 52, color: 'var(--text-1)', margin: '0 0 6px' }}>$2<span style={{ fontSize: 18, color: 'var(--text-2)', fontFamily: '"DM Sans",sans-serif' }}>/mo</span></p>
            <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.7, marginBottom: 20 }}>Full real-time access for serious students.</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px' }}>
              {PRO_FEATURES.map(f => (
                <li key={f} style={{ fontSize: 13, color: 'var(--text-2)', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ color: 'var(--gold)', fontSize: 12 }}>—</span>{f}
                </li>
              ))}
            </ul>
            {error && <p style={{ fontSize: 12, color: '#C0392B', marginBottom: 12 }}>{error}</p>}
            {isPro ? (
              <span style={{ display: 'inline-block', padding: '11px 26px', borderRadius: 24, background: 'rgba(200,146,58,0.15)', border: '1px solid var(--gold)', color: 'var(--gold)', fontSize: 13, fontWeight: 600 }}>
                ★ You&apos;re a Pro member
              </span>
            ) : (
              <button onClick={handleCheckout} disabled={isPending} style={{ padding: '11px 26px', borderRadius: 24, background: 'var(--gold)', border: 'none', color: '#2c1a0e', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: isPending ? 0.7 : 1, fontFamily: '"DM Sans",sans-serif' }}>
                {isPending ? 'Redirecting…' : isLoggedIn ? 'Subscribe — $2/mo' : 'Sign Up & Subscribe'}
              </button>
            )}
          </div>
        </div>

        {/* Business CTA */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '24px 28px', marginBottom: 80, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          <div>
            <p style={{ fontSize: 11, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 6 }}>OWN A VENUE?</p>
            <p style={{ fontSize: 15, color: 'var(--text-1)', margin: 0, fontFamily: '"DM Serif Display",serif' }}>Free tools to run your cafe, library, or lounge.</p>
          </div>
          <Link href="/login?mode=signup" style={{ padding: '10px 22px', borderRadius: 24, border: '1px solid var(--border-hover)', color: 'var(--text-1)', fontSize: 13, textDecoration: 'none', whiteSpace: 'nowrap' }}>List Your Venue →</Link>
        </div>

        {/* FAQ */}
        <p style={{ fontSize: 11, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 36 }}>FAQ</p>
        <div className="faq-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 0 }}>
          {FAQ.map((f, i) => (
            <div key={f.q} style={{ paddingRight: i < 2 ? 40 : 0, paddingLeft: i > 0 ? 40 : 0, borderRight: i < 2 ? '1px solid var(--border)' : 'none' }}>
              <h3 style={{ fontFamily: '"DM Serif Display",serif', fontSize: 17, color: 'var(--text-1)', marginBottom: 10, fontWeight: 400 }}>{f.q}</h3>
              <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.7, margin: 0 }}>{f.a}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
