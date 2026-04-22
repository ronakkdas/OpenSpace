import { stripe, isStripeConfigured } from '@/lib/stripe'

export interface ProPrice {
  amount: number       // dollars, e.g. 2
  currency: string     // 'usd'
  interval: string     // 'month'
  label: string        // '$2/mo' — formatted for direct rendering
  configured: boolean  // false when Stripe isn't wired up yet
}

const FALLBACK: ProPrice = {
  amount: 2, currency: 'usd', interval: 'month', label: '$2/mo', configured: false,
}

// Server-side fetch of the live Pro price. Cheap to call from any server
// component — we don't revalidate on every render because pricing rarely
// changes, but we also don't want a stale hardcoded string.
export async function getProPrice(): Promise<ProPrice> {
  if (!isStripeConfigured) return FALLBACK
  try {
    const price = await stripe.prices.retrieve(process.env.STRIPE_PRO_PRICE_ID!)
    const amount = (price.unit_amount ?? 0) / 100
    const currency = price.currency
    const interval = price.recurring?.interval ?? 'month'
    const intervalShort = interval === 'month' ? 'mo' : interval === 'year' ? 'yr' : interval
    const label = `${formatMoney(amount, currency)}/${intervalShort}`
    return { amount, currency, interval, label, configured: true }
  } catch {
    return FALLBACK
  }
}

function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    }).format(amount)
  } catch {
    return `$${amount}`
  }
}
