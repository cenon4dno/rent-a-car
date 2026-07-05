'use client';

import { useCompare, type CompareVehicle } from '@/lib/useCompare';

interface CompareButtonProps {
  vehicle: CompareVehicle;
}

export function CompareButton({ vehicle }: CompareButtonProps) {
  const { has, toggle, full } = useCompare();
  const selected = has(vehicle.id);

  const disabled = !selected && full;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(vehicle);
      }}
      disabled={disabled}
      title={
        disabled
          ? 'Maximum 3 cars can be compared'
          : selected
            ? 'Remove from compare'
            : 'Add to compare'
      }
      className={[
        'absolute bottom-2 left-2 text-xs font-semibold px-2.5 py-1 rounded-full border transition-colors',
        selected
          ? 'bg-blue-600 text-white border-blue-600'
          : disabled
            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
            : 'bg-white/90 text-gray-700 border-gray-200 hover:border-blue-400 hover:text-blue-700',
      ].join(' ')}
    >
      {selected ? '✓ Comparing' : '+ Compare'}
    </button>
  );
}
