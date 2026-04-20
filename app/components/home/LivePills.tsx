import { createSupabaseServerClient } from '@/lib/supabaseClient';

export const revalidate = 60;

type Venue = {
  id: string;
  name: string;
  current_count: number;
  max_capacity: number;
};

function getPillColor(pct: number) {
  if (pct >= 90) return '#C0392B';
  if (pct >= 70) return '#E8A838';
  return '#4A7C59';
}

export async function LivePills() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from('venues')
    .select('id, name, current_count, max_capacity')
    .eq('is_active', true)
    .order('current_count', { ascending: false })
    .limit(6);

  const venues = (data ?? []) as Venue[];

  return (
    <section className="live-pills-section">
      <div className="live-label">
        <span className="pulse-dot" /> Live right now
      </div>
      <div className="pills-row">
        {venues.map((v) => {
          const pct = v.max_capacity
            ? Math.round((v.current_count / v.max_capacity) * 100)
            : 0;
          return (
            <a
              href={`/venue/${v.id}`}
              key={v.id}
              className="live-pill"
            >
              <span
                className="pill-indicator"
                style={{ background: getPillColor(pct) }}
              />
              {v.name}
              <span className="pill-pct">{pct}%</span>
            </a>
          );
        })}
      </div>
    </section>
  );
}

