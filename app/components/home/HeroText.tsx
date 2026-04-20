export function HeroText() {
  return (
    <section className="hero-text-section">
      <div className="hero-inner">
        <div className="section-eyebrow">THE PLATFORM</div>
        <h1 className="hero-headline">
          Know before
          <br />
          you go.
        </h1>
        <p className="hero-body">
          Real-time occupancy for every cafe, library, and study lounge near
          Berkeley campus. Stop walking 15 minutes only to find no seats.
        </p>
        <div className="hero-ctas">
          <a href="/explore" className="cta-primary">
            Find a Spot Now
          </a>
          <a href="/pricing" className="cta-secondary">
            Pro access — $2/mo
          </a>
        </div>
      </div>
    </section>
  );
}

