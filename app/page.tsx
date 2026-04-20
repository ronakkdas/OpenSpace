import { createServerClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { PhotoStrip } from './components/home/PhotoStrip'

const TICKER_SPOTS = ['Cafe Milano','Moffitt Library','Cafe Strada','Doe Library','FSM Cafe','Brewed Awakening','Main Stacks','Free Speech Movement Cafe','Valley Life Sciences']

function capacityColor(current: number, max: number) {
  const pct = max > 0 ? (current / max) * 100 : 0
  if (pct >= 90) return '#C0392B'
  if (pct >= 70) return '#E8A838'
  return '#4A7C59'
}

export default async function LandingPage() {
  const supabase = await createServerClient()
  const { data: venues } = await supabase
    .from('venues')
    .select('id, name, current_count, max_capacity')
    .eq('is_active', true)
    .order('name')
    .limit(6)

  const liveVenues = venues ?? []

  return (
    <main style={{ background: '#0D0B08', minHeight: '100vh', paddingTop: 65 }}>
      {/* Photo Strip */}
      <PhotoStrip />

      {/* Hero */}
      <section className="hero-text-section">
        <div className="hero-inner">
          <p className="section-eyebrow">THE PLATFORM</p>
          <h1 className="hero-headline">Know before you go.</h1>
          <p className="hero-body">Live occupancy for every cafe, library, and lounge at UC Berkeley — so you never waste a trip to a packed spot again.</p>
          <div className="hero-ctas">
            <Link href="/explore" className="cta-primary">Find a Spot Now</Link>
            <Link href="/pricing" className="cta-secondary">Pro access — $2/mo →</Link>
          </div>
        </div>
      </section>

      {/* Live Pills */}
      <section className="live-pills-section">
        <div className="live-label">
          <span className="pulse-dot" />
          Live right now
        </div>
        <div className="pills-row">
          {liveVenues.map(v => {
            const pct = v.max_capacity > 0 ? Math.round((v.current_count / v.max_capacity) * 100) : 0
            const color = capacityColor(v.current_count, v.max_capacity)
            return (
              <Link key={v.id} href={`/venue/${v.id}`} className="live-pill">
                <span className="pill-indicator" style={{ background: color }} />
                {v.name}
                <span className="pill-pct">{pct}%</span>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Process */}
      <section className="process-section">
        <div className="process-header">
          <p className="section-eyebrow">THE EXPERIENCE</p>
          <h2 className="process-headline">From the door to your perfect seat.</h2>
        </div>
        <div className="process-grid">
          {[
            { n: '01', title: 'Check', body: 'See live occupancy for every study spot before you leave. No more arriving to find every seat taken.', tags: ['Live Data', 'Real-Time', 'No Refresh'] },
            { n: '02', title: 'Choose', body: 'Filter by type, distance, and amenities. Find the exact vibe you\'re looking for — quiet, social, or somewhere in between.', tags: ['Distance', 'Crowd Patterns', 'Hours'] },
            { n: '03', title: 'Arrive', body: 'Walk straight to your spot. Save your favorites, write reviews, and track your most-visited places on campus.', tags: ['Saved Spots', 'Reviews', 'Walk Time'] },
          ].map(s => (
            <div key={s.n} className="process-card">
              <p className="step-number">{s.n}</p>
              <svg className="step-icon" width="40" height="40" viewBox="0 0 40 40" fill="none">
                <circle cx="20" cy="20" r="18" stroke="rgba(240,234,214,0.2)" strokeWidth="1" />
                <circle cx="20" cy="20" r="6" fill="rgba(200,146,58,0.4)" />
              </svg>
              <h3 className="step-title">{s.title}</h3>
              <p className="step-body">{s.body}</p>
              <div className="step-tags">{s.tags.map(t => <span key={t} className="step-tag">{t}</span>)}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Ticker */}
      <div className="ticker-wrap">
        <div className="ticker-track">
          {[...TICKER_SPOTS, ...TICKER_SPOTS].map((s, i) => (
            <span key={i} className="ticker-item">{s}<span className="ticker-sep"> · </span></span>
          ))}
        </div>
      </div>

      {/* Pricing Teaser */}
      <section className="pricing-teaser">
        <p className="section-eyebrow">PRICING</p>
        <h2 className="pricing-headline">Simple. One plan.</h2>
        <div className="pricing-cols">
          <div className="pricing-col">
            <p className="pricing-tier">FREE</p>
            <p className="pricing-amount">$0</p>
            <p className="pricing-desc">Browse venues and write reviews. No credit card needed.</p>
            <ul className="pricing-list">
              {['See venue names & types','Browse the map','Write reviews','Basic spot info'].map(f => <li key={f}>{f}</li>)}
            </ul>
            <Link href="/explore" className="pricing-btn-ghost">Browse Spots</Link>
          </div>
          <div className="pricing-divider" />
          <div className="pricing-col">
            <p className="pricing-tier">PRO</p>
            <p className="pricing-amount">$2<span>/mo</span></p>
            <p className="pricing-desc">Full real-time access for serious students.</p>
            <ul className="pricing-list">
              {['Live capacity all venues','Crowd pattern charts','Distance & walk time','Save favorite spots','Full venue details','Map view'].map(f => <li key={f}>{f}</li>)}
            </ul>
            <Link href="/pricing" className="pricing-btn-gold">Subscribe — $2/mo</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '48px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 24 }}>
        <div>
          <p style={{ fontFamily: '"DM Serif Display",serif', fontSize: 20, color: '#F0EAD6', margin: '0 0 6px' }}>Open<span style={{ color: '#C8923A' }}>Space</span></p>
          <p style={{ fontSize: 12, color: 'rgba(240,234,214,0.3)', margin: 0 }}>Real-time study spots for UC Berkeley</p>
        </div>
        <div style={{ display: 'flex', gap: 28 }}>
          {[['Explore','/explore'],['Pricing','/pricing'],['Login','/login']].map(([l,h]) => (
            <Link key={h} href={h} style={{ fontSize: 12, color: 'rgba(240,234,214,0.3)', textDecoration: 'none' }}>{l}</Link>
          ))}
        </div>
      </footer>

    </main>
  )
}
