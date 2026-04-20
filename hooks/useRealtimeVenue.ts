'use client'
import { useEffect } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'

export function useRealtimeVenue(venueId: string, onUpdate: (data: Record<string, unknown>) => void) {
  useEffect(() => {
    const supabase = createBrowserClient()
    const channel = supabase
      .channel(`venue-${venueId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'venues', filter: `id=eq.${venueId}` },
        (payload) => {
          onUpdate(payload.new as Record<string, unknown>)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [venueId, onUpdate])
}
