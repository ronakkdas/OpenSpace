export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function formatHour(hour: number): string {
  if (hour === 0) return '12AM'
  if (hour < 12) return `${hour}AM`
  if (hour === 12) return '12PM'
  return `${hour - 12}PM`
}

export function capacityColor(current: number, max: number): string {
  if (max === 0) return '#4A7C59'
  const pct = (current / max) * 100
  if (pct >= 90) return '#C0392B'
  if (pct >= 70) return '#E8A838'
  return '#4A7C59'
}

export function capacityStatus(current: number, max: number): string {
  if (max === 0) return 'Available'
  const pct = (current / max) * 100
  if (pct >= 100) return 'At Capacity'
  if (pct >= 90) return 'Nearly Full'
  if (pct >= 70) return 'Getting Busy'
  return 'Available'
}

export function isVenueOpen(hoursOpen: string | null, hoursClose: string | null): boolean {
  if (!hoursOpen || !hoursClose) return true
  const now = new Date()
  const toMin = (t: string) => {
    const [h, m] = t.slice(0, 5).split(':').map(Number)
    return h * 60 + m
  }
  const openM = toMin(hoursOpen)
  const closeM = toMin(hoursClose)
  const nowM = now.getHours() * 60 + now.getMinutes()
  if (closeM > openM) return nowM >= openM && nowM < closeM
  return nowM >= openM || nowM < closeM
}

export function formatTime(t: string | null): string {
  if (!t) return ''
  const [h, m] = t.slice(0, 5).split(':').map(Number)
  const suffix = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 === 0 ? 12 : h % 12
  return `${hour}:${m.toString().padStart(2, '0')} ${suffix}`
}
