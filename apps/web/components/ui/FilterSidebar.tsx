'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useState, useCallback, Fragment } from 'react';
import { Button } from './Button';

const FUEL_OPTIONS = [
  { value: 'GASOLINE', label: 'Gasoline' },
  { value: 'DIESEL', label: 'Diesel' },
  { value: 'HYBRID', label: 'Hybrid' },
  { value: 'ELECTRIC', label: 'Electric (EV)' },
];

const TRANSMISSION_OPTIONS = [
  { value: 'AUTOMATIC', label: 'Automatic' },
  { value: 'MANUAL', label: 'Manual' },
  { value: 'CVT', label: 'CVT' },
];

const SEAT_OPTIONS = [
  { value: '2', label: '2+' },
  { value: '4', label: '4+' },
  { value: '5', label: '5+' },
  { value: '7', label: '7+' },
];

export function FilterSidebar() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const [fuelType, setFuelType] = useState(searchParams.get('fuelType') ?? '');
  const [transmission, setTransmission] = useState(searchParams.get('transmission') ?? '');
  const [minSeats, setMinSeats] = useState(searchParams.get('minSeats') ?? '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') ?? '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') ?? '');

  const applyFilters = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (fuelType) params.set('fuelType', fuelType);
    else params.delete('fuelType');
    if (transmission) params.set('transmission', transmission);
    else params.delete('transmission');
    if (minSeats) params.set('minSeats', minSeats);
    else params.delete('minSeats');
    if (minPrice) params.set('minPrice', minPrice);
    else params.delete('minPrice');
    if (maxPrice) params.set('maxPrice', maxPrice);
    else params.delete('maxPrice');
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
    setMobileOpen(false);
  }, [fuelType, transmission, minSeats, minPrice, maxPrice, searchParams, router, pathname]);

  const clearFilters = useCallback(() => {
    setFuelType('');
    setTransmission('');
    setMinSeats('');
    setMinPrice('');
    setMaxPrice('');
    const params = new URLSearchParams();
    const location = searchParams.get('location');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    if (location) params.set('location', location);
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    router.push(`${pathname}?${params.toString()}`);
    setMobileOpen(false);
  }, [searchParams, router, pathname]);

  const hasActiveFilters = Boolean(fuelType || transmission || minSeats || minPrice || maxPrice);

  const filterContent = (
    <div className="space-y-6">
      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Fuel Type
        </h4>
        <div className="space-y-2">
          {FUEL_OPTIONS.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="radio"
                name="fuelType"
                value={opt.value}
                checked={fuelType === opt.value}
                onChange={() => setFuelType(fuelType === opt.value ? '' : opt.value)}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 group-hover:text-gray-900">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Transmission
        </h4>
        <div className="space-y-2">
          {TRANSMISSION_OPTIONS.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="radio"
                name="transmission"
                value={opt.value}
                checked={transmission === opt.value}
                onChange={() => setTransmission(transmission === opt.value ? '' : opt.value)}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 group-hover:text-gray-900">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Seats</h4>
        <div className="grid grid-cols-2 gap-2">
          {SEAT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setMinSeats(minSeats === opt.value ? '' : opt.value)}
              className={[
                'px-3 py-1.5 rounded-lg text-sm border transition-colors font-medium',
                minSeats === opt.value
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:text-blue-700',
              ].join(' ')}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Daily Rate (₱)
        </h4>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <span className="text-gray-400 text-sm shrink-0">–</span>
          <input
            type="number"
            min={0}
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button onClick={applyFilters} size="sm" className="flex-1">
          Apply Filters
        </Button>
        {hasActiveFilters && (
          <Button onClick={clearFilters} variant="ghost" size="sm">
            Clear
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <Fragment>
      {/* Mobile toggle button — visible on small screens only, in flow above results */}
      <div className="lg:hidden mb-1">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setMobileOpen(true)}
          className="flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z"
            />
          </svg>
          Filters
          {hasActiveFilters && (
            <span className="bg-blue-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center leading-none">
              ✓
            </span>
          )}
        </Button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/50"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="absolute left-0 top-0 h-full w-80 bg-white p-6 overflow-y-auto shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-semibold text-gray-900">Filters</h3>
              <button
                onClick={() => setMobileOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
                aria-label="Close filters"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            {filterContent}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 shrink-0">
        <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-24">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-gray-900">Filters</h3>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="text-xs text-blue-600 hover:underline">
                Clear all
              </button>
            )}
          </div>
          {filterContent}
        </div>
      </aside>
    </Fragment>
  );
}
