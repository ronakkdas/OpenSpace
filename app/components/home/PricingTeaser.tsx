import Link from 'next/link';

const FREE_INCLUDES = [
  'Live capacity meter',
  'Unlimited search radius',
  'Hours, Wi-Fi, outlets',
  'Up to 5 saved cafes',
];

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
];

export function PricingTeaser() {
  return (
    <section className="pricing-teaser">
      <div className="section-eyebrow">PRICING</div>
      <h2 className="pricing-headline">Simple. No surprises.</h2>

      <div className="pricing-cols">
        {/* FREE */}
        <div className="pricing-col">
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
            <div className="pricing-tier">Free</div>
            <span style={{ fontSize: 10, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#aaa', padding: '4px 10px', borderRadius: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>Acquisition</span>
          </div>
          <div className="pricing-amount">$0</div>
          <p className="pricing-desc">Casual users, word-of-mouth driver.</p>
          <ul className="pricing-list">
            {FREE_INCLUDES.map(f => <li key={f}>{f}</li>)}
          </ul>
          <Link href="/login?mode=signup" className="pricing-btn-ghost">
            Get Started
          </Link>
        </div>

        <div className="pricing-divider" />

        {/* PRO */}
        <div className="pricing-col">
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
            <div className="pricing-tier" style={{ color: '#C8923A' }}>OpenSpace Pro</div>
            <span style={{ fontSize: 10, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#C8923A', padding: '4px 10px', borderRadius: 12, background: 'rgba(200,146,58,0.12)', border: '1px solid rgba(200,146,58,0.35)' }}>Recommended</span>
          </div>
          <div className="pricing-amount">$2 <span>/mo</span></div>
          <p className="pricing-desc">Less than a coffee per month. Power users — 4+ cafe sessions/week.</p>
          <ul className="pricing-list">
            {PRO_INCLUDES.map(f => <li key={f}>{f}</li>)}
          </ul>
          <Link href="/pricing" className="pricing-btn-gold">
            Start Pro — $2/mo
          </Link>
        </div>
      </div>
    </section>
  );
}
