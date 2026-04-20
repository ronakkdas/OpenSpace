'use client';

import { useState } from 'react';

export function CheckoutButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === 'Unauthorized') {
          setError('Please log in first.');
          return;
        }
        throw new Error(data.error ?? 'Checkout failed');
      }
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="pt-3 space-y-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="w-full rounded-full bg-espresso text-cream px-4 py-2 text-sm font-medium hover:bg-espresso/90 disabled:opacity-60 disabled:cursor-not-allowed transition"
      >
        {loading ? 'Redirecting…' : 'Unlock Pro for $2/month'}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
