function StepIcon({ type }: { type: 'search' | 'map' | 'coffee' }) {
  if (type === 'search') {
    return (
      <svg
        width="48"
        height="48"
        viewBox="0 0 48 48"
        fill="none"
        stroke="rgba(240,234,214,0.4)"
        strokeWidth="1.5"
      >
        <circle cx="20" cy="20" r="10" />
        <line x1="28" y1="28" x2="40" y2="40" />
        <line x1="20" y1="14" x2="20" y2="10" />
        <line x1="26" y1="16" x2="29" y2="13" />
      </svg>
    );
  }

  if (type === 'map') {
    return (
      <svg
        width="48"
        height="48"
        viewBox="0 0 48 48"
        fill="none"
        stroke="rgba(240,234,214,0.4)"
        strokeWidth="1.5"
      >
        <path d="M24 8C18 8 13 13 13 19c0 9 11 21 11 21s11-12 11-21c0-6-5-11-11-11z" />
        <circle cx="24" cy="19" r="3" />
      </svg>
    );
  }

  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      stroke="rgba(240,234,214,0.4)"
      strokeWidth="1.5"
    >
      <path d="M12 18h24l-3 16H15L12 18z" />
      <path d="M36 22h4a4 4 0 010 8h-4" />
      <line x1="18" y1="12" x2="18" y2="16" />
      <line x1="24" y1="10" x2="24" y2="16" />
      <line x1="30" y1="12" x2="30" y2="16" />
    </svg>
  );
}

const STEPS = [
  {
    iconType: 'search',
    title: 'Check',
    body: 'Open OpenSpace before you leave. See live occupancy for every cafe and library near campus — updated in real time.',
    tags: ['Live capacity', 'Open/Closed status', 'Distance', 'Crowd patterns']
  },
  {
    iconType: 'map',
    title: 'Choose',
    body: 'Filter by noise level, WiFi, distance, or type. Browse the map view or swipe the list. Save favorites for quick access.',
    tags: ['Map view', 'Favorites', 'Filters', 'Walk time']
  },
  {
    iconType: 'coffee',
    title: 'Arrive',
    body: 'Walk in knowing there is a seat. No more wasted trips. Spend your time studying, not searching.',
    tags: ['Guaranteed availability', 'Saved spots', 'Reviews']
  }
] as const;

export function ProcessSection() {
  return (
    <section className="process-section">
      <div className="process-header">
        <div className="section-eyebrow">THE EXPERIENCE</div>
        <h2 className="process-headline">
          From the door to
          <br />
          your perfect seat.
        </h2>
      </div>

      <div className="process-grid">
        {STEPS.map((step, i) => (
          <div key={i} className="process-card">
            <div className="step-number">{String(i + 1).padStart(2, '0')}</div>
            <div className="step-icon">
              <StepIcon type={step.iconType} />
            </div>
            <h3 className="step-title">{step.title}</h3>
            <p className="step-body">{step.body}</p>
            <div className="step-tags">
              {step.tags.map((tag) => (
                <span key={tag} className="step-tag">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

