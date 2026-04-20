import Link from 'next/link';
import { CapacityMeter } from './CapacityMeter';

export type Venue = {
  id: string;
  name: string;
  description: string | null;
  type: 'cafe' | 'library' | 'lounge' | 'other';
  address?: string | null;
  image_url?: string | null;
  lat?: number | null;
  lng?: number | null;
  max_capacity: number;
  current_count: number;
  hours_open: string | null;
  hours_close: string | null;
  distanceKm?: number;
  distanceMiles?: number | null;
  isOpen?: boolean;
  popular_items?: string[] | null;
};

type VenueCardProps = {
  venue: Venue;
  pro: boolean;
};

export function VenueCard({ venue, pro }: VenueCardProps) {
  const capacityContent = pro ? (
    <CapacityMeter current={venue.current_count} max={venue.max_capacity} />
  ) : (
    <div className="h-2 w-full rounded-full bg-espresso/10 overflow-hidden relative">
      <div className="absolute inset-0 backdrop-blur-[2px] bg-cream/60" />
      <div className="h-full w-2/3 bg-espresso/10" />
    </div>
  );

  const capacityLabel = pro
    ? undefined
    : 'Capacity is Pro-only. Unlock for $2/mo.';

  return (
    <Link
      href={`/venue/${venue.id}`}
      className="card block p-4 space-y-3 hover:-translate-y-0.5 hover:shadow-md transition"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-display text-lg">{venue.name}</h3>
          <div className="flex items-center gap-2 text-xs">
            <span className="uppercase tracking-wide text-espresso/60">
              {venue.type}
            </span>
            {venue.isOpen !== undefined && (
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] ${
                  venue.isOpen
                    ? 'bg-capacity-green/20 text-capacity-green'
                    : 'bg-espresso/10 text-espresso/60'
                }`}
              >
                {venue.isOpen ? 'Open' : 'Closed'}
              </span>
            )}
          </div>
        </div>
        {typeof venue.distanceKm === 'number' && pro && (
          <p className="text-xs text-espresso/70">
            {venue.distanceKm.toFixed(1)} km
          </p>
        )}
      </div>

      <div className="space-y-1" title={capacityLabel}>
        {capacityContent}
      </div>

      {venue.description && (
        <p className="text-sm text-espresso/80 line-clamp-2">
          {venue.description}
        </p>
      )}

      {venue.popular_items && venue.popular_items.length > 0 && (
        <p className="text-xs text-espresso/70">
          Popular: {venue.popular_items.slice(0, 3).join(', ')}
        </p>
      )}
    </Link>
  );
}

