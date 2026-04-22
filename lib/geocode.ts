// Lightweight geocoder using OpenStreetMap Nominatim (free, no API key).
// Must set a User-Agent per their usage policy. Rate-limited to ~1 req/sec.
// For production scale, swap to Mapbox or Google. For a class project, this is fine.

export interface GeocodeResult {
  lat: number
  lng: number
  display_name: string
}

export async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
  if (!address?.trim()) return null
  try {
    const url = new URL('https://nominatim.openstreetmap.org/search')
    url.searchParams.set('q', address)
    url.searchParams.set('format', 'json')
    url.searchParams.set('limit', '1')
    // Bias to Berkeley / East Bay
    url.searchParams.set('viewbox', '-122.32,37.93,-122.21,37.84')
    url.searchParams.set('bounded', '0')

    const res = await fetch(url.toString(), {
      headers: { 'User-Agent': 'OpenSpace/1.0 (berkeley-study-spots)' },
      // Nominatim asks for no caching proxies but Next.js caches by default — opt out
      cache: 'no-store',
    })
    if (!res.ok) return null
    const json = (await res.json()) as Array<{ lat: string; lon: string; display_name: string }>
    if (!json?.length) return null
    const { lat, lon, display_name } = json[0]
    return { lat: Number(lat), lng: Number(lon), display_name }
  } catch {
    return null
  }
}
