import Stripe from 'stripe'

const key = process.env.STRIPE_SECRET_KEY

export const isStripeConfigured = Boolean(
  key &&
  !key.startsWith('sk_test_placeholder') &&
  process.env.STRIPE_PRO_PRICE_ID &&
  !process.env.STRIPE_PRO_PRICE_ID.startsWith('price_placeholder')
)

// Lazily constructed so builds don't crash when env vars are missing.
export const stripe = new Stripe(key ?? 'sk_test_placeholder_not_configured', {
  apiVersion: '2024-06-20',
  typescript: true,
})
