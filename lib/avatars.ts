// Shared avatar presets + helper. Used by GlobalNav, AvatarDropdown, Account page.

export type AvatarPreset = {
  id: string
  icon: string
  bg: string
  color: string
}

export const AVATAR_PRESETS: AvatarPreset[] = [
  { id: 'a1',  icon: '◎', bg: 'rgba(200,146,58,0.2)', color: '#C8923A' },
  { id: 'a2',  icon: '⬗', bg: 'rgba(74,124,89,0.2)',  color: '#4A7C59' },
  { id: 'a3',  icon: '◈', bg: 'rgba(120,90,170,0.2)', color: '#A78BD9' },
  { id: 'a4',  icon: '✦', bg: 'rgba(200,80,80,0.2)',  color: '#D95C5C' },
  { id: 'a5',  icon: '❄', bg: 'rgba(90,150,200,0.2)', color: '#6BAEE0' },
  { id: 'a6',  icon: '✿', bg: 'rgba(200,120,160,0.2)',color: '#E089B8' },
  { id: 'a7',  icon: '☀', bg: 'rgba(220,180,60,0.2)', color: '#EACB57' },
  { id: 'a8',  icon: '☾', bg: 'rgba(160,160,200,0.2)',color: '#B5B5DC' },
  { id: 'a9',  icon: '▲', bg: 'rgba(80,160,140,0.2)', color: '#5EBFA5' },
  { id: 'a10', icon: '◆', bg: 'rgba(180,140,100,0.2)',color: '#CFA57A' },
  { id: 'a11', icon: '♣', bg: 'rgba(100,170,100,0.2)',color: '#78C878' },
  { id: 'a12', icon: '♡', bg: 'rgba(220,100,130,0.2)',color: '#E877A3' },
]

export function getPreset(id?: string | null): AvatarPreset {
  return AVATAR_PRESETS.find(a => a.id === id) ?? AVATAR_PRESETS[0]
}

export function getInitials(fullName?: string | null, email?: string | null): string {
  if (fullName) {
    return fullName.split(' ').filter(Boolean).map(p => p[0]).join('').slice(0, 2).toUpperCase()
  }
  if (email) return email[0].toUpperCase()
  return 'U'
}
