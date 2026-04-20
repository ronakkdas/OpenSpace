'use client'
import { useEffect } from 'react'

// Sets data-theme and data-font-size on <html> based on server-loaded profile
// values. The SSR layout already sets them once for no-flash; this keeps the
// client in sync after navigation / profile updates.
export function ThemeApplier({ theme, fontSize }: { theme: string; fontSize: string }) {
  useEffect(() => {
    const resolved =
      theme === 'system'
        ? (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark')
        : theme
    document.documentElement.dataset.theme = resolved
    document.documentElement.dataset.fontSize = fontSize
  }, [theme, fontSize])
  return null
}
