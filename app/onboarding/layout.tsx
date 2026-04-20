import { ReactNode } from 'react'
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function OnboardingLayout({ children }: { children: ReactNode }) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
  if (!profile || profile.role !== 'business') redirect('/explore')

  // If they already have a venue, skip onboarding.
  const { data: existing } = await supabase
    .from('venues')
    .select('id')
    .eq('owner_id', user.id)
    .limit(1)
    .maybeSingle()
  if (existing) redirect('/dashboard')

  return (
    <>
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 60,
        height: 65, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 40px', background: 'rgba(13,11,8,0.8)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
      }}>
        <Link href="/" style={{ fontFamily: '"DM Serif Display",serif', fontSize: 22, color: '#F0EAD6', textDecoration: 'none' }}>
          Open<span style={{ color: '#C8923A' }}>Space</span>
          <span style={{ fontSize: 9, letterSpacing: '2.5px', color: '#C8923A', marginLeft: 10, textTransform: 'uppercase', fontWeight: 500, verticalAlign: 'middle' }}>Business setup</span>
        </Link>
        <Link href="/account" style={{ fontSize: 12, color: 'var(--text-3)', textDecoration: 'none' }}>
          Save & exit →
        </Link>
      </header>
      {children}
    </>
  )
}
