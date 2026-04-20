'use client'
import { getPreset } from '@/lib/avatars'

interface AvatarProps {
  avatarUrl?: string | null
  avatarId?: string | null
  initials?: string
  size?: number
  border?: boolean
}

// Single source of truth for rendering a user avatar across the app.
// Priority: uploaded image > preset icon > initials fallback.
export function Avatar({ avatarUrl, avatarId, initials = 'U', size = 34, border = false }: AvatarProps) {
  if (avatarUrl) {
    return (
      <span
        style={{
          display: 'inline-flex', width: size, height: size,
          borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
          border: border ? '1px solid var(--border)' : 'none',
          background: 'var(--surface)',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={avatarUrl}
          alt="Avatar"
          width={size}
          height={size}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </span>
    )
  }

  if (avatarId) {
    const p = getPreset(avatarId)
    return (
      <span
        style={{
          display: 'inline-flex', width: size, height: size,
          borderRadius: '50%', alignItems: 'center', justifyContent: 'center',
          background: p.bg, color: p.color,
          fontSize: Math.round(size * 0.5),
          border: border ? `1px solid ${p.color}66` : 'none',
          flexShrink: 0,
        }}
      >
        {p.icon}
      </span>
    )
  }

  // Initials fallback
  return (
    <span
      style={{
        display: 'inline-flex', width: size, height: size,
        borderRadius: '50%', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(200,146,58,0.15)', color: 'var(--gold)',
        fontSize: Math.round(size * 0.4), fontWeight: 600, letterSpacing: '0.5px',
        border: border ? '1px solid rgba(200,146,58,0.3)' : 'none',
        flexShrink: 0, fontFamily: '"DM Sans",sans-serif',
      }}
    >
      {initials}
    </span>
  )
}
