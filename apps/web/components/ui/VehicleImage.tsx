'use client';

import { useState } from 'react';

interface VehicleImageProps {
  src?: string;
  alt: string;
  make: string;
  model: string;
}

export function VehicleImage({ src, alt, make, model }: VehicleImageProps) {
  const [broken, setBroken] = useState(false);

  if (!src || broken) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-slate-100 to-blue-50 gap-2 select-none">
        <svg
          className="w-14 h-14 text-slate-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h8l2-2zM5 8h4M3 12h18m-2-4h2a1 1 0 011 1v5"
          />
        </svg>
        <span className="text-xs font-medium text-slate-400 tracking-wide">
          {make} {model}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
      onError={() => setBroken(true)}
    />
  );
}
