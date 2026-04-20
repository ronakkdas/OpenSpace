import { createServerClient } from '@/lib/supabase/server'
import PricingClient from './PricingClient'

export default async function PricingPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  let role: 'student' | 'business' | null = null
  let isPro = false

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, is_pro')
      .eq('id', user.id)
      .maybeSingle()
    role = profile?.role ?? null
    isPro = profile?.is_pro ?? false
  }

  return <PricingClient role={role} isPro={isPro} isLoggedIn={!!user} />
}
