import './globals.css'
import 'leaflet/dist/leaflet.css'
import type { Metadata } from 'next'
import { DM_Sans, DM_Serif_Display } from 'next/font/google'
import { ReactNode } from 'react'
import { createServerClient } from '@/lib/supabase/server'
import { GlobalNav } from '@/components/GlobalNav'
import { BottomNav } from '@/components/BottomNav'
import { ThemeApplier } from '@/components/ThemeApplier'
import { getInitials } from '@/lib/avatars'

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-sans' })
const dmSerif = DM_Serif_Display({ subsets: ['latin'], weight: ['400'], variable: '--font-display' })

export const metadata: Metadata = {
  title: 'OpenSpace — Berkeley Study Spot Tracker',
  description: 'Real-time study spot capacity for UC Berkeley students.',
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  let userRole: 'student' | 'business' | null = null
  let isPro = false
  let userInitials = 'U'
  let avatarId: string | null = null
  let avatarUrl: string | null = null
  let theme: string = 'dark'
  let fontSize: string = 'medium'

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, is_pro, full_name, avatar_id, avatar_url, theme, font_size')
      .eq('id', user.id)
      .maybeSingle()
    userRole = profile?.role ?? null
    isPro = profile?.is_pro ?? false
    avatarId = profile?.avatar_id ?? null
    avatarUrl = profile?.avatar_url ?? null
    theme = profile?.theme ?? 'dark'
    fontSize = profile?.font_size ?? 'medium'
    userInitials = getInitials(profile?.full_name, user.email)
  }

  return (
    <html lang="en" data-theme={theme} data-font-size={fontSize}>
      <body className={`${dmSans.variable} ${dmSerif.variable} font-sans`}>
        <ThemeApplier theme={theme} fontSize={fontSize} />
        <GlobalNav
          userRole={userRole}
          isPro={isPro}
          userInitials={userInitials}
          userEmail={user?.email}
          avatarId={avatarId}
          avatarUrl={avatarUrl}
        />
        {children}
        <BottomNav />
      </body>
    </html>
  )
}
