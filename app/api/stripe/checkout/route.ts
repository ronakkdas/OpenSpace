import { stripe, isStripeConfigured } from '@/lib/stripe'
import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  if (!isStripeConfigured) {
    return NextResponse.json(
      { error: 'Payments are not yet configured. Please check back soon.' },
      { status: 503 }
    )
  }

  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id, full_name, role')
    .eq('id', user.id)
    .maybeSingle()

  if (profile?.role === 'business') {
    return NextResponse.json({ error: 'Pro plan is for student accounts only.' }, { status: 403 })
  }

  let customerId = profile?.stripe_customer_id

  if (!customerId) {
    // Idempotency key prevents duplicate customers if the user double-clicks
    // or the request retries mid-flight. Scoped to this user forever.
    const customer = await stripe.customers.create(
      {
        email: user.email,
        name: profile?.full_name || undefined,
        metadata: { supabase_uid: user.id },
      },
      { idempotencyKey: `customer-create-${user.id}` }
    )
    customerId = customer.id
    await supabase.from('profiles').update({ stripe_customer_id: customerId }).eq('id', user.id)
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: process.env.STRIPE_PRO_PRICE_ID!, quantity: 1 }],
    // Pass session_id back so /account can verify the purchase immediately
    // (no webhook race) if we later want to surface a success toast.
    success_url: `${appUrl}/account?upgraded=true&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/pricing`,
    // subscription_data metadata flows onto the Subscription object, so the
    // webhook can find the Supabase user even for subscription.updated events.
    metadata: { supabase_uid: user.id },
    subscription_data: { metadata: { supabase_uid: user.id } },
    client_reference_id: user.id,
    allow_promotion_codes: true,
  })

  return NextResponse.json({ url: session.url })
}
