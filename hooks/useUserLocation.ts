'use client'
import { useState, useEffect } from 'react'

const BERKELEY_DEFAULT = { lat: 37.8724, lng: -122.2595 }

export function useUserLocation() {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation(BERKELEY_DEFAULT)
      setError('Geolocation not supported')
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLoading(false)
      },
      () => {
        setLocation(BERKELEY_DEFAULT)
        setError('Location access denied — using Berkeley default')
        setLoading(false)
      },
      { timeout: 5000, maximumAge: 60000 }
    )
  }, [])

  return { location, error, loading }
}
