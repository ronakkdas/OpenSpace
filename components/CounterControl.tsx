'use client';

import { useOptimistic, useTransition } from 'react';

type CounterControlProps = {
  venueId: string;
  current: number;
  max: number;
  onChange?: (next: number) => void;
  mutateAction?: (venueId: string, delta: 1 | -1) => Promise<void>;
};

export function CounterControl({
  venueId,
  current,
  max,
  onChange,
  mutateAction
}: CounterControlProps) {
  const [optimisticCount, addOptimistic] = useOptimistic(current);
  const [isPending, startTransition] = useTransition();

  const canDecrement = optimisticCount > 0;
  const canIncrement = optimisticCount < max;

  const handleClick = (delta: 1 | -1) => {
    if ((delta === -1 && !canDecrement) || (delta === 1 && !canIncrement)) {
      return;
    }

    addOptimistic(optimisticCount + delta);
    onChange?.(optimisticCount + delta);

    if (mutateAction) {
      startTransition(async () => {
        try {
          await mutateAction(venueId, delta);
        } catch {
          // let server reconcile on next fetch
        }
      });
    }
  };

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => handleClick(-1)}
        disabled={!canDecrement || isPending}
        className="h-10 w-10 rounded-full border border-espresso/20 flex items-center justify-center text-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-espresso/5 transition"
      >
        −
      </button>
      <div className="min-w-[4rem] text-center">
        <p className="font-display text-2xl leading-none">{optimisticCount}</p>
        <p className="text-[11px] text-espresso/60">current count</p>
      </div>
      <button
        type="button"
        onClick={() => handleClick(1)}
        disabled={!canIncrement || isPending}
        className="h-10 w-10 rounded-full border border-espresso/20 flex items-center justify-center text-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-espresso/5 transition"
      >
        +
      </button>
    </div>
  );
}

