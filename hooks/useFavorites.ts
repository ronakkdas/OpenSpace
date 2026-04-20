'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabaseBrowser';

export function useFavorites() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [userId, setUserId] = useState<string | null>(null);
  const [favoriteVenueIds, setFavoriteVenueIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!active) return;
      setUserId(data.user?.id ?? null);

      if (!data.user) {
        setFavoriteVenueIds([]);
        setLoading(false);
        return;
      }

      const { data: favs } = await supabase
        .from('favorites')
        .select('venue_id')
        .eq('user_id', data.user.id);

      if (!active) return;
      setFavoriteVenueIds((favs ?? []).map((f: { venue_id: string }) => f.venue_id));
      setLoading(false);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_evt: unknown, session: { user?: { id: string } } | null) => {
      setUserId(session?.user?.id ?? null);
      if (!session?.user) setFavoriteVenueIds([]);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [supabase]);

  const isFavorited = useCallback(
    (venueId: string) => favoriteVenueIds.includes(venueId),
    [favoriteVenueIds]
  );

  const toggleFavorite = useCallback(
    async (venueId: string) => {
      if (!userId) {
        return { ok: false as const, error: 'Please log in to save spots.' };
      }

      const currently = favoriteVenueIds.includes(venueId);
      setFavoriteVenueIds((prev) =>
        currently ? prev.filter((id) => id !== venueId) : [venueId, ...prev]
      );

      if (currently) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', userId)
          .eq('venue_id', venueId);
        if (error) return { ok: false as const, error: error.message };
        return { ok: true as const };
      } else {
        const { error } = await supabase.from('favorites').insert({
          user_id: userId,
          venue_id: venueId
        });
        if (error) return { ok: false as const, error: error.message };
        return { ok: true as const };
      }
    },
    [favoriteVenueIds, supabase, userId]
  );

  return {
    userId,
    loading,
    favoriteVenueIds,
    isFavorited,
    toggleFavorite
  };
}

