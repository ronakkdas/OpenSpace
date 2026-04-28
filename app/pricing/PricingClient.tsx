'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const FREE_INCLUDES = [
  'Live capacity meter',
  'Unlimited search radius',
  'Hours, Wi-Fi, outlets',
  'Up to 5 saved cafes',
]
const FREE_LIMITS = [
  'Lightweight ads',
  'No friends mode',
  'No forecasting',
  'No notifications',
  'No reserve-ahead',
]
const PRO_INCLUDES = [
  'Everything in Free',
  'Friends mode (add & see)',
  'Capacity forecasting',
  'Business hours + heatmaps',
  'Smart notifications',
  'Reserve-ahead (cafes only)',
  'Unlimited saved cafes',
  'Personalized picks',
  'Ad-free experience',
]

const FEATURE_TABLE: { feature: string; free: string; pro: string }[] = [
  { feature: 'Live capacity meter',         free: '✓', pro: '✓' },
  { feature: 'Search radius',               free: '∞', pro: '∞' },
  { feature: 'Basic info (hours, Wi-Fi, outlets)', free: '✓', pro: '✓' },
  { feature: 'Saved cafes',                 free: '5', pro: '∞' },
  { feature: 'Friends mode',                free: '—', pro: '✓' },
  { feature: 'Capacity forecasting',        free: '—', pro: '✓' },
  { feature: 'Business hours + heatmaps',   free: '—', pro: '✓' },
  { feature: 'Smart notifications',         free: '—', pro: '✓' },
  { feature: 'Reserve-ahead (cafes)',       free: '—', pro: '✓' },
  { feature: 'Personalized recommendations',free: '—', pro: '✓' },
  { feature: 'Ad-free experience',          free: '—', pro: '✓' },
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
  price: { amount: number; interval: string; label: string; configured: boolean }
}

export default function PricingClient({ role, isPro, isLoggedIn, price }: Props) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const router = useRouter()

  const intervalShort = price.interval === 'month' ? 'mo' : price.interval === 'year' ? 'yr' : price.interval
  const amountDisplay = price.amount % 1 === 0 ? `$${price.amount}` : `$${price.amount.toFixed(2)}`

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

  // BUSINESS view — unchanged
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
            <Link href="/dashboard" style={{ display: 'inline-block', padding: '11px 26px', borderRadius: 24, background: 'var(--gold)', color: '#2c1a0e', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>Go to Dashboard →</Link>
          </div>
        </div>
      </main>
    )
  }

  // Student / logged-out view
  return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh', paddingTop: 65 }}>
      <div style={{ maxWidth: 1040, margin: '0 auto', padding: '72px 24px 100px' }}>
        <p style={{ fontSize: 11, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 14 }}>PRICING</p>
        <h1 style={{ fontFamily: '"DM Serif Display",serif', fontSize: 'clamp(36px,5vw,58px)', color: 'var(--text-1)', fontWeight: 400, margin: '0 0 48px', lineHeight: 1.1 }}>Simple. No surprises.</h1>

        {/* Two side-by-side plan cards */}
        <div className="pricing-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 64 }}>
          {/* FREE */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '28px 32px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 }}>
              <p style={{ fontFamily: '"DM Serif Display",serif', fontSize: 22, color: 'var(--text-1)', margin: 0, fontWeight: 400 }}>Free</p>
              <span style={{ fontSize: 10, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--text-2)', padding: '4px 10px', borderRadius: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)' }}>Acquisition</span>
            </div>
            <p style={{ fontFamily: '"DM Serif Display",serif', fontSize: 40, color: 'var(--text-1)', margin: '6px 0 4px' }}>$0</p>
            <p style={{ fontSize: 13, color: 'var(--text-3)', margin: '0 0 20px' }}>Casual users, word-of-mouth driver</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {FREE_INCLUDES.map(f => (
                <li key={f} style={{ fontSize: 13, color: 'var(--text-1)', padding: '5px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ color: 'var(--gold)' }}>✓</span>{f}
                </li>
              ))}
              {FREE_LIMITS.map(f => (
                <li key={f} style={{ fontSize: 13, color: 'var(--text-3)', padding: '5px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span>—</span>{f}
                </li>
              ))}
            </ul>
          </div>

          {/* PRO */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--gold)', borderRadius: 16, padding: '28px 32px', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 }}>
              <p style={{ fontFamily: '"DM Serif Display",serif', fontSize: 22, color: 'var(--text-1)', margin: 0, fontWeight: 400 }}>OpenSpace Pro</p>
              <span style={{ fontSize: 10, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--gold)', padding: '4px 10px', borderRadius: 12, background: 'var(--gold-dim)', border: '1px solid var(--gold)' }}>Recommended</span>
            </div>
            <p style={{ fontFamily: '"DM Serif Display",serif', fontSize: 40, color: 'var(--text-1)', margin: '6px 0 4px' }}>{amountDisplay}<span style={{ fontSize: 16, color: 'var(--text-2)', fontFamily: '"DM Sans",sans-serif' }}>/{intervalShort}</span></p>
            <p style={{ fontSize: 13, color: 'var(--text-3)', margin: '0 0 6px' }}>Less than a coffee per month</p>
            <p style={{ fontSize: 13, color: 'var(--text-2)', margin: '0 0 20px' }}>Power users — 4+ cafe sessions/week</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px' }}>
              {PRO_INCLUDES.map(f => (
                <li key={f} style={{ fontSize: 13, color: 'var(--text-1)', padding: '5px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ color: 'var(--gold)' }}>✓</span>{f}
                </li>
              ))}
            </ul>
            {error && <p style={{ fontSize: 12, color: '#C0392B', marginBottom: 12 }}>{error}</p>}
            {isPro ? (
              <span style={{ display: 'inline-block', padding: '11px 26px', borderRadius: 24, background: 'var(--gold-dim)', border: '1px solid var(--gold)', color: 'var(--gold)', fontSize: 13, fontWeight: 600, textAlign: 'center' }}>
                ★ You&apos;re a Pro member
              </span>
            ) : (
              <button onClick={handleCheckout} disabled={isPending} style={{ padding: '11px 26px', borderRadius: 24, background: 'var(--gold)', border: 'none', color: '#2c1a0e', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: isPending ? 0.7 : 1, fontFamily: '"DM Sans",sans-serif' }}>
                {isPending ? 'Redirecting…' : isLoggedIn ? `Subscribe — ${price.label}` : 'Sign Up & Subscribe'}
              </button>
            )}
          </div>
        </div>

        {/* Feature breakdown table */}
        <p style={{ fontSize: 11, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 18, paddingTop: 24, borderTop: '1px solid var(--border)' }}>FEATURE BREAKDOWN</p>
        <div style={{ marginBottom: 64, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ textAlign: 'left', padding: '12px 8px', fontWeight: 500, color: 'var(--text-2)' }}>Feature</th>
                <th style={{ textAlign: 'right', padding: '12px 8px', fontWeight: 500, color: 'var(--text-2)', width: 80 }}>Free</th>
                <th style={{ textAlign: 'right', padding: '12px 8px', fontWeight: 500, color: 'var(--text-2)', width: 80 }}>Pro</th>
              </tr>
            </thead>
            <tbody>
              {FEATURE_TABLE.map(row => (
                <tr key={row.feature} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '14px 8px', color: 'var(--text-1)' }}>{row.feature}</td>
                  <td style={{ padding: '14px 8px', textAlign: 'right', color: row.free === '—' ? 'var(--text-3)' : 'var(--gold)' }}>{row.free}</td>
                  <td style={{ padding: '14px 8px', textAlign: 'right', color: row.pro === '—' ? 'var(--text-3)' : 'var(--gold)' }}>{row.pro}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
        <div className="faq-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 32 }}>
          {FAQ.map(f => (
            <div key={f.q}>
              <h3 style={{ fontFamily: '"DM Serif Display",serif', fontSize: 17, color: 'var(--text-1)', marginBottom: 10, fontWeight: 400 }}>{f.q}</h3>
              <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.7, margin: 0 }}>{f.a}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
