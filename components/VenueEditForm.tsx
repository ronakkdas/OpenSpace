'use client';

import { useState } from 'react';

type VenueEditFormProps = {
  initial: {
    name: string;
    description: string | null;
    address: string | null;
    hours_open: string | null;
    hours_close: string | null;
    max_capacity: number;
    popular_items: string[] | null;
    is_active: boolean;
  };
  onSubmit?: (payload: VenueEditFormProps['initial']) => Promise<void>;
};

export function VenueEditForm({ initial, onSubmit }: VenueEditFormProps) {
  const [form, setForm] = useState({
    ...initial,
    popularItemsText: (initial.popular_items ?? []).join(', ')
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleChange = (
    field: keyof typeof form,
    value: string | number | boolean
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const payload = {
      name: form.name,
      description: form.description,
      address: form.address,
      hours_open: form.hours_open,
      hours_close: form.hours_close,
      max_capacity: Number(form.max_capacity) || 0,
      popular_items: form.popularItemsText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      is_active: form.is_active
    };

    try {
      await onSubmit?.(payload);
      setMessage('Saved.');
    } catch {
      setMessage('Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 text-xs">
      <div className="grid gap-2">
        <label className="space-y-1">
          <span className="block font-medium text-[11px] uppercase tracking-[0.18em] text-espresso/70">
            Business name
          </span>
          <input
            type="text"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="w-full rounded-card border border-espresso/20 bg-white px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-gold/80"
            maxLength={80}
          />
        </label>

        <label className="space-y-1">
          <span className="block font-medium text-[11px] uppercase tracking-[0.18em] text-espresso/70">
            Short description
          </span>
          <textarea
            value={form.description ?? ''}
            onChange={(e) => handleChange('description', e.target.value)}
            className="w-full rounded-card border border-espresso/20 bg-white px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-gold/80"
            rows={3}
            maxLength={160}
          />
          <span className="block text-[10px] text-espresso/50">
            Max 160 characters. What should students know before they come?
          </span>
        </label>

        <label className="space-y-1">
          <span className="block font-medium text-[11px] uppercase tracking-[0.18em] text-espresso/70">
            Address
          </span>
          <input
            type="text"
            value={form.address ?? ''}
            onChange={(e) => handleChange('address', e.target.value)}
            className="w-full rounded-card border border-espresso/20 bg-white px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-gold/80"
          />
        </label>

        <div className="grid grid-cols-2 gap-2">
          <label className="space-y-1">
            <span className="block font-medium text-[11px] uppercase tracking-[0.18em] text-espresso/70">
              Opens
            </span>
            <input
              type="time"
              value={form.hours_open ?? ''}
              onChange={(e) => handleChange('hours_open', e.target.value)}
              className="w-full rounded-card border border-espresso/20 bg-white px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-gold/80"
            />
          </label>
          <label className="space-y-1">
            <span className="block font-medium text-[11px] uppercase tracking-[0.18em] text-espresso/70">
              Closes
            </span>
            <input
              type="time"
              value={form.hours_close ?? ''}
              onChange={(e) => handleChange('hours_close', e.target.value)}
              className="w-full rounded-card border border-espresso/20 bg-white px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-gold/80"
            />
          </label>
        </div>

        <label className="space-y-1">
          <span className="block font-medium text-[11px] uppercase tracking-[0.18em] text-espresso/70">
            Max capacity
          </span>
          <input
            type="number"
            min={1}
            value={form.max_capacity}
            onChange={(e) => handleChange('max_capacity', e.target.value)}
            className="w-full rounded-card border border-espresso/20 bg-white px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-gold/80"
          />
        </label>

        <label className="space-y-1">
          <span className="block font-medium text-[11px] uppercase tracking-[0.18em] text-espresso/70">
            Popular items
          </span>
          <input
            type="text"
            value={form.popularItemsText}
            onChange={(e) => handleChange('popularItemsText', e.target.value)}
            className="w-full rounded-card border border-espresso/20 bg-white px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-gold/80"
            placeholder="Oat latte, Avocado toast, ..."
          />
          <span className="block text-[10px] text-espresso/50">
            Comma-separated list. Shown to students on your card.
          </span>
        </label>

        <label className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => handleChange('is_active', e.target.checked)}
            className="h-3 w-3 rounded border border-espresso/30"
          />
          <span className="text-[11px] text-espresso/80">
            Show this venue in the student explore feed
          </span>
        </label>
      </div>

      <div className="flex items-center justify-between pt-2">
        {message && (
          <span className="text-[11px] text-espresso/60">{message}</span>
        )}
        <button
          type="submit"
          disabled={saving}
          className="ml-auto rounded-full bg-espresso text-cream px-4 py-1.5 text-xs font-medium hover:bg-espresso/90 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </form>
  );
}

