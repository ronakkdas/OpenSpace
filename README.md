## OpenSpace

Real-time study spot capacity tracker for Berkeley students, built with Next.js 14, Tailwind CSS, Supabase, and Stripe.

### Getting started

1. Install dependencies:

```bash
npm install
```

2. Set the required environment variables in a `.env.local` file:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_PRO_PRICE_ID=
NEXT_PUBLIC_APP_URL=http://localhost:3000
# Optional (beta): treat all users as Pro
NEXT_PUBLIC_BETA_FREE_ACCESS=true
```

3. Run the dev server:

```bash
npm run dev
```

