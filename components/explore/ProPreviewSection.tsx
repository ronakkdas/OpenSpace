'use client'
import Link from 'next/link'

const PRO_PREVIEW = [
  {
    title: 'Friends mode',
    body: 'See where your friends are studying.',
  },
  {
    title: 'Typical business patterns',
    body: 'Hourly heatmaps showing when each cafe gets busy.',
  },
  {
    title: 'Capacity forecasting',
    body: 'Know when Strada will hit capacity before you walk over.',
  },
  {
    title: 'Reserve-ahead',
    body: 'Skip the line at partner cafes.',
  },
  {
    title: 'Smart notifications',
    body: 'Get alerted when your favorite spot opens up.',
  },
  {
    title: 'Unlimited saves',
    body: 'Free tier caps at 5. Pro is unlimited.',
  },
  {
    title: 'Ad-free',
    body: 'Quiet, focused browsing. No filler.',
  },
]

export function ProPreviewSection() {
  return (
    <section style={{ marginTop: 48, padding: '36px 0 24px', borderTop: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 6 }}>
        <p style={{ fontSize: 11, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--gold)', margin: 0 }}>UNLOCK WITH PRO</p>
        <p style={{ fontSize: 12, color: 'var(--text-3)', margin: 0 }}>Less than a coffee per month</p>
      </div>
      <h2 style={{ fontFamily: '"DM Serif Display",serif', fontSize: 28, color: 'var(--text-1)', fontWeight: 400, margin: '6px 0 24px' }}>
        Upgrade to Pro — $2/month
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 28 }}>
        {PRO_PREVIEW.map(item => (
          <div key={item.title} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px' }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', margin: '0 0 6px' }}>{item.title}</p>
            <p style={{ fontSize: 12, color: 'var(--text-2)', margin: 0, lineHeight: 1.55 }}>{item.body}</p>
          </div>
        ))}
      </div>

      <Link
        href="/pricing"
        style={{ display: 'inline-block', padding: '12px 28px', borderRadius: 24, background: 'var(--gold)', color: '#2c1a0e', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}
      >
        Upgrade to Pro →
      </Link>
    </section>
  )
}
