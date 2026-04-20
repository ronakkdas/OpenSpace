type CapacityMeterProps = {
  current: number;
  max: number;
};

export function CapacityMeter({ current, max }: CapacityMeterProps) {
  const percentage = max > 0 ? Math.min(100, Math.round((current / max) * 100)) : 0;
  const ratio = `${current} / ${max} seats · ${percentage}% full`;

  let colorClass = 'bg-capacity-green';
  if (percentage >= 90) colorClass = 'bg-capacity-red';
  else if (percentage >= 70) colorClass = 'bg-capacity-amber';

  return (
    <div className="space-y-1">
      <div className="h-2 w-full rounded-full bg-espresso/10 overflow-hidden">
        <div
          className={`${colorClass} h-full transition-all`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-xs text-espresso/70">{ratio}</p>
    </div>
  );
}

