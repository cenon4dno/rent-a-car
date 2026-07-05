'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import type { VehicleWithRenter } from '@/lib/api';

interface FeaturedCarouselProps {
  vehicles: VehicleWithRenter[];
}

function parseImageUrls(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function FeaturedCarousel({ vehicles }: FeaturedCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const total = vehicles.length;

  const next = useCallback(() => setCurrent((c) => (c + 1) % total), [total]);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + total) % total), [total]);

  useEffect(() => {
    if (paused || total <= 1) return;
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, [next, paused, total]);

  if (total === 0) return null;

  const slide = vehicles[current];
  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ height: '560px' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slide images */}
      {vehicles.map((v, i) => {
        const imgs = parseImageUrls(v.imageUrls);
        return (
          <div
            key={v.id}
            className="absolute inset-0 transition-opacity duration-700"
            style={{ opacity: i === current ? 1 : 0 }}
          >
            {imgs[0] ? (
              <img
                src={imgs[0]}
                alt={`${v.make} ${v.model}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-900 via-blue-700 to-indigo-900" />
            )}
          </div>
        );
      })}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 px-8 pb-10 md:px-16 text-white">
        <div className="max-w-2xl">
          {slide.renter?.companyName && (
            <span className="inline-block bg-blue-500/80 backdrop-blur-sm text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-3">
              {slide.renter.companyName}
            </span>
          )}
          <h2 className="text-3xl md:text-5xl font-extrabold leading-tight drop-shadow-lg">
            {slide.make} {slide.model}
            <span className="text-blue-300 ml-2 text-2xl md:text-3xl font-semibold">
              {slide.year}
            </span>
          </h2>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-200">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Top rated
            </span>
            <span className="text-gray-400">•</span>
            <span>{slide.fuelType}</span>
            <span className="text-gray-400">•</span>
            <span>{slide.transmission}</span>
            <span className="text-gray-400">•</span>
            <span>{slide.seatingCapacity} seats</span>
          </div>
          <div className="mt-5 flex items-center gap-5">
            <div>
              <span className="text-3xl font-bold">₱{slide.dailyRate.toLocaleString()}</span>
              <span className="text-gray-300 text-sm ml-1">/ day</span>
            </div>
            <Link
              href={`/vehicle/${slide.id}`}
              className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-400 active:bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors shadow-lg"
            >
              Rent Now
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Prev / Next arrows */}
      {total > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Previous"
            className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-sm transition"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            onClick={next}
            aria-label="Next"
            className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-sm transition"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Dot pagination */}
      {total > 1 && (
        <div className="absolute bottom-4 right-8 md:right-16 flex gap-2">
          {vehicles.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`rounded-full transition-all ${
                i === current ? 'bg-white w-6 h-2' : 'bg-white/40 hover:bg-white/70 w-2 h-2'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
