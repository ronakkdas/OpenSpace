# Stripe Setup Guide

OpenSpace uses Stripe for the $2/month Pro subscription. Until keys are filled in, the "Upgrade to Pro" button will show a friendly "not yet configured" message instead of crashing.

## 1. Create a Stripe account

Sign up at [stripe.com](https://stripe.com). Use **Test mode** for development (toggle in the top-right of the Stripe dashboard).

## 2. Get your API keys

Stripe Dashboard → **Developers** → **API keys**

Copy these two into `.env.local`:
- **Publishable key** (`pk_test_...`) → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- **Secret key** (`sk_test_...`) → `STRIPE_SECRET_KEY`

## 3. Create the Pro product

Stripe Dashboard → **Products** → **+ Add product**

- **Name**: OpenSpace Pro
- **Description**: Full real-time access to Berkeley study spots
- **Pricing model**: Recurring
- **Price**: $2.00 USD / month

Save. Copy the **Price ID** (starts with `price_...`) → `STRIPE_PRO_PRICE_ID`

> Not the Product ID (`prod_...`) — you want the **Price ID** (`price_...`).

## 4. Set up the webhook (local dev)

Install the Stripe CLI:
```bash
brew install stripe/stripe-cli/stripe
stripe login
```

Forward webhooks to your local dev server:
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

The CLI will print a webhook signing secret (`whsec_...`). Copy it → `STRIPE_WEBHOOK_SECRET`

Keep this command running while testing subscriptions — it relays Stripe events to your local app.

## 5. Set up the webhook (production)

Stripe Dashboard → **Developers** → **Webhooks** → **Add endpoint**

- **Endpoint URL**: `https://yourdomain.com/api/stripe/webhook`
- **Events to listen for**:
  - `checkout.session.completed`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`

Copy the **Signing secret** (`whsec_...`) → `STRIPE_WEBHOOK_SECRET` in your production env vars.

## 6. Test the flow

1. Restart your dev server (`npm run dev`) so it picks up the new env vars
2. Sign in as a student account
3. Go to `/pricing` → click **Subscribe**
4. Use Stripe's test card: `4242 4242 4242 4242`, any future expiry, any CVC, any ZIP
5. You should be redirected back to `/account?upgraded=true` with Pro status active

## 7. Enable the customer portal

Stripe Dashboard → **Settings** → **Billing** → **Customer portal**

Turn on the portal so users can manage subscriptions from `/account` → **Plan & Billing** → **Manage Subscription**.

Configure what customers can do:
- Update payment method ✓
- Cancel subscription ✓
- View invoice history ✓

## Final `.env.local` checklist

```
STRIPE_SECRET_KEY=sk_test_51...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51...
STRIPE_PRO_PRICE_ID=price_1...
```

## Going live

When ready for real payments:
1. Activate your Stripe account (add business details, bank account)
2. Toggle Stripe to **Live mode**
3. Re-fetch all 4 keys (they'll start with `sk_live_`, `pk_live_`, etc.)
4. Create the product in Live mode (test mode products don't carry over)
5. Re-configure the webhook endpoint for your production URL

## How the money flow works

- **Student** pays $2/month → appears as OpenSpace Pro charge on their card
- **Business** accounts are always free — they list their venue, update capacity, get analytics
- Stripe takes ~2.9% + $0.30 per transaction
- Net per Pro student: ~$1.64/month
