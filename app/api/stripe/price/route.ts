import { stripe, isStripeConfigured } from '@/lib/stripe'
import { NextResponse } from 'next/server'

// Public endpoint. Returns the real Pro price straight from Stripe so the
// pricing page shows the actual $ amount instead of a hardcoded label.
// Cached for an hour — prices don't change often and we don't want to hammer
// Stripe on every page load.
export const revalidate = 3600

export async function GET() {
  if (!isStripeConfigured) {
    // Harmless fallback so the page still renders during local dev without keys.
    return NextResponse.json({ amount: 2, currency: 'usd', interval: 'month', configured: false })
  }

  try {
    const price = await stripe.prices.retrieve(process.env.STRIPE_PRO_PRICE_ID!)
    const amount = (price.unit_amount ?? 0) / 100
    return NextResponse.json({
      amount,
      currency: price.currency,
      interval: price.recurring?.interval ?? 'month',
      configured: true,
    })
  } catch {
    return NextResponse.json({ amount: 2, currency: 'usd', interval: 'month', configured: false })
  }
}
