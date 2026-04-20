'use client'

interface ToastProps {
  message: string
  type: 'success' | 'error' | 'info'
  visible: boolean
}

export function Toast({ message, type, visible }: ToastProps) {
  const borderColor = type === 'success' ? 'rgba(74,124,89,0.5)' : type === 'error' ? 'rgba(192,57,43,0.5)' : 'var(--border-hover)'
  return (
    <div style={{
      position: 'fixed', bottom: 32, left: '50%',
      transform: `translateX(-50%) translateY(${visible ? 0 : 16}px)`,
      opacity: visible ? 1 : 0, transition: 'all 0.25s ease',
      zIndex: 9999, pointerEvents: 'none',
      background: 'var(--surface-2)', border: `1px solid ${borderColor}`,
      borderRadius: 10, padding: '12px 24px', fontSize: 13,
      color: 'var(--text-1)', whiteSpace: 'nowrap',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    }}>
      {message}
    </div>
  )
}
