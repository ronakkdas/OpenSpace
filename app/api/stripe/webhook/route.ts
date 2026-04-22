import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import type Stripe from 'stripe'

// Admin client — webhooks have no user session, so we use the service role key
// to write subscription state into `profiles` directly, bypassing RLS.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Given any subscription, sync its status + period_end + is_pro flag into the
// matching profile row. Centralized so every event path writes the same shape.
async function syncSubscription(sub: Stripe.Subscription) {
  const isActive = sub.status === 'active' || sub.status === 'trialing'
  const periodEnd = sub.current_period_end
    ? new Date(sub.current_period_end * 1000).toISOString()
    : null

  // Prefer lookup by subscription id; fall back to customer id if the row was
  // created before we stored the sub id (e.g. first-time checkout webhooks).
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({
      is_pro: isActive,
      stripe_status: sub.status,
      stripe_subscription_id: sub.id,
      stripe_current_period_end: periodEnd,
    })
    .eq('stripe_customer_id', sub.customer as string)

  if (error) console.error('[stripe-webhook] profile sync failed', error)
}

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: `Webhook error: ${message}` }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const uid = session.metadata?.supabase_uid
        // Stamp the customer + sub ids onto the profile immediately so the UI
        // reflects Pro without waiting for the subscription.updated event.
        if (uid && session.subscription) {
          await supabaseAdmin.from('profiles').update({
            is_pro: true,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
            stripe_status: 'active',
          }).eq('id', uid)
        }
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        await syncSubscription(event.data.object as Stripe.Subscription)
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        await supabaseAdmin.from('profiles').update({
          is_pro: false,
          stripe_status: sub.status,
        }).eq('stripe_subscription_id', sub.id)
        break
      }

      case 'invoice.paid': {
        // Renewal succeeded — push the new period_end forward. Invoice objects
        // carry the subscription id; refetch for the canonical state.
        const invoice = event.data.object as Stripe.Invoice
        if (invoice.subscription) {
          const sub = await stripe.subscriptions.retrieve(invoice.subscription as string)
          await syncSubscription(sub)
        }
        break
      }

      case 'invoice.payment_failed': {
        // Don't yank Pro the instant a charge fails — Stripe will retry for
        // a few days. Just record the status; `customer.subscription.updated`
        // will flip is_pro=false once the sub moves to past_due/unpaid.
        const invoice = event.data.object as Stripe.Invoice
        if (invoice.subscription) {
          await supabaseAdmin.from('profiles').update({
            stripe_status: 'past_due',
          }).eq('stripe_subscription_id', invoice.subscription as string)
        }
        break
      }
    }
  } catch (err) {
    // Log but return 200 — if we 500, Stripe retries and we'll double-apply.
    // Real production would ship this to Sentry.
    console.error('[stripe-webhook] handler error', event.type, err)
  }

  return NextResponse.json({ received: true })
}
