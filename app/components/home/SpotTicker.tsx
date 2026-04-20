const ITEMS = [
  'CAFE MILANO',
  'CAFE STRADA',
  'MOFFITT LIBRARY',
  'DOE LIBRARY',
  'FSM CAFE',
  'BREWED AWAKENING',
  "YALI'S CAFE",
  'GOLDEN BEAR CAFE',
  'THE GRADUATE'
] as const;

export function SpotTicker() {
  // Duplicate to ensure the animation has enough content.
  const loop = [...ITEMS, ...ITEMS];
  return (
    <section className="ticker-wrap">
      <div className="ticker-track">
        {loop.map((item, idx) => (
          <span className="ticker-item" key={`${item}-${idx}`}>
            {item}
            {idx < loop.length - 1 ? (
              <span className="ticker-sep"> · </span>
            ) : null}
          </span>
        ))}
      </div>
    </section>
  );
}

