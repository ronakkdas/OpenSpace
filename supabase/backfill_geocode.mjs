#!/usr/bin/env node
// One-shot backfill: geocode every venue that has an address but no lat/lng.
// Safe to re-run — the `is null` filter means already-pinned venues are skipped.
//
// Usage:
//   node supabase/backfill_geocode.mjs
//
// Reads .env.local for SUPABASE_URL + SERVICE_ROLE_KEY. Sleeps 1.1s between
// geocodes to stay under Nominatim's 1 req/sec rate limit.

import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

// Hand-rolled .env.local parser so we don't pull in dotenv for a one-off.
const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    .split('\n')
    .filter(l => l.trim() && !l.startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i), l.slice(i + 1)] })
)

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
)

async function geocode(address) {
  const url = new URL('https://nominatim.openstreetmap.org/search')
  url.searchParams.set('q', address)
  url.searchParams.set('format', 'json')
  url.searchParams.set('limit', '1')
  url.searchParams.set('viewbox', '-122.32,37.93,-122.21,37.84')
  const res = await fetch(url, { headers: { 'User-Agent': 'OpenSpace/1.0 (backfill)' } })
  if (!res.ok) return null
  const json = await res.json()
  if (!json?.length) return null
  return { lat: Number(json[0].lat), lng: Number(json[0].lon) }
}

const { data: venues, error } = await supabase
  .from('venues')
  .select('id, name, address, lat, lng')
  .is('lat', null)
  .not('address', 'is', null)

if (error) { console.error('Fetch failed:', error); process.exit(1) }

console.log(`Found ${venues.length} venue(s) needing coords`)

let ok = 0, miss = 0
for (const v of venues) {
  if (!v.address?.trim()) { miss++; continue }
  const result = await geocode(v.address)
  if (result) {
    await supabase.from('venues').update(result).eq('id', v.id)
    console.log(`  ✓ ${v.name} → ${result.lat.toFixed(4)}, ${result.lng.toFixed(4)}`)
    ok++
  } else {
    console.log(`  ✗ ${v.name} (no match for "${v.address}")`)
    miss++
  }
  await new Promise(r => setTimeout(r, 1100)) // Nominatim rate limit
}

console.log(`\nDone. ${ok} geocoded, ${miss} unmatched.`)
