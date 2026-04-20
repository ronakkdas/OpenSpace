import Link from 'next/link';

export function PricingTeaser() {
  return (
    <section className="pricing-teaser">
      <div className="section-eyebrow">PRICING</div>
      <h2 className="pricing-headline">Simple. No surprises.</h2>

      <div className="pricing-cols">
        <div className="pricing-col">
          <div className="pricing-tier">Free</div>
          <div className="pricing-amount">$0</div>
          <p className="pricing-desc">
            Browse venue names and types. Capacity data is locked.
          </p>
          <ul className="pricing-list">
            <li>See all venue listings</li>
            <li>View type and location</li>
            <li>Write reviews</li>
          </ul>
          <Link href="/login?signup=true" className="pricing-btn-ghost">
            Get Started
          </Link>
        </div>

        <div className="pricing-divider" />

        <div className="pricing-col">
          <div className="pricing-tier" style={{ color: '#C8923A' }}>
            Pro
          </div>
          <div className="pricing-amount">
            $2 <span>/mo</span>
          </div>
          <p className="pricing-desc">
            Full real-time access. Everything you need to never waste a trip.
          </p>
          <ul className="pricing-list">
            <li>Live capacity, all venues</li>
            <li>Crowd patterns</li>
            <li>Distance & walk time</li>
            <li>Save favorite spots</li>
            <li>Map view</li>
          </ul>
          <Link href="/pricing" className="pricing-btn-gold">
            Start Pro — $2/mo
          </Link>
        </div>
      </div>
    </section>
  );
}

