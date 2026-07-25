'use client';

import { useState } from 'react';
import Image from 'next/image';
import { updateHomepageConfig, HomepageConfig, CarouselSlide } from '@/lib/api';

function newSlide(): CarouselSlide {
  return {
    id: crypto.randomUUID(),
    image: '',
    headline: '',
    subtext: '',
    ctaLabel: 'Browse Cars',
    ctaLink: '/search',
  };
}

export function HomepageConfigEditor({
  initialConfig,
  apiToken,
}: {
  initialConfig: HomepageConfig;
  apiToken: string;
}) {
  const [slides, setSlides] = useState<CarouselSlide[]>(initialConfig.slides ?? []);
  const [featuredMode, setFeaturedMode] = useState<'AUTO' | 'MANUAL'>(
    initialConfig.featuredMode ?? 'AUTO',
  );
  const [featuredIds, setFeaturedIds] = useState<string>(
    (initialConfig.featuredIds ?? []).join(', '),
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const updateSlide = (idx: number, field: keyof CarouselSlide, value: string) => {
    setSlides((prev) => prev.map((s, i) => (i === idx ? { ...s, [field]: value } : s)));
  };

  const removeSlide = (idx: number) => setSlides((prev) => prev.filter((_, i) => i !== idx));

  const moveSlide = (idx: number, dir: -1 | 1) => {
    setSlides((prev) => {
      const next = [...prev];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    setError('');
    try {
      await updateHomepageConfig(
        {
          slides,
          featuredMode,
          featuredIds: featuredIds
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
        },
        apiToken,
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* Carousel Slides */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Carousel Slides</h2>
          <button
            onClick={() => setSlides((prev) => [...prev, newSlide()])}
            className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Add Slide
          </button>
        </div>

        {slides.length === 0 && (
          <p className="text-gray-400 text-sm py-6 text-center border border-dashed border-gray-200 rounded-xl">
            No slides yet. Click Add Slide to create your first carousel item.
          </p>
        )}

        <div className="space-y-4">
          {slides.map((slide, idx) => (
            <div key={slide.id} className="bg-white border border-gray-200 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="font-medium text-gray-700 text-sm">Slide {idx + 1}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => moveSlide(idx, -1)}
                    disabled={idx === 0}
                    className="text-xs text-gray-400 hover:text-gray-600 disabled:opacity-30 px-2 py-1"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => moveSlide(idx, 1)}
                    disabled={idx === slides.length - 1}
                    className="text-xs text-gray-400 hover:text-gray-600 disabled:opacity-30 px-2 py-1"
                  >
                    ↓
                  </button>
                  <button
                    onClick={() => removeSlide(idx)}
                    className="text-xs text-red-500 hover:text-red-700 px-2 py-1"
                  >
                    Remove
                  </button>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {(
                  [
                    { key: 'image', label: 'Image URL', placeholder: 'https://...' },
                    { key: 'headline', label: 'Headline', placeholder: 'Explore Our Fleet' },
                    { key: 'subtext', label: 'Subtext', placeholder: 'Find your perfect ride' },
                    { key: 'ctaLabel', label: 'CTA Button Text', placeholder: 'Browse Cars' },
                    { key: 'ctaLink', label: 'CTA Link', placeholder: '/search' },
                  ] as { key: keyof CarouselSlide; label: string; placeholder: string }[]
                ).map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
                    <input
                      type="text"
                      value={slide[key]}
                      onChange={(e) => updateSlide(idx, key, e.target.value)}
                      placeholder={placeholder}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ))}
              </div>

              {slide.image && (
                <div className="mt-4 relative h-24 w-full rounded-lg border border-gray-200 overflow-hidden">
                  <Image
                    src={slide.image}
                    alt="slide preview"
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Featured Vehicles */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Featured Vehicles</h2>
        <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Selection Mode</label>
            <div className="flex gap-4">
              {(['AUTO', 'MANUAL'] as const).map((mode) => (
                <label key={mode} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="featuredMode"
                    value={mode}
                    checked={featuredMode === mode}
                    onChange={() => setFeaturedMode(mode)}
                    className="text-blue-600"
                  />
                  <span className="text-sm text-gray-700">
                    {mode === 'AUTO' ? 'Auto (highest rated)' : 'Manual (pick by ID)'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {featuredMode === 'MANUAL' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Featured Vehicle IDs
              </label>
              <input
                type="text"
                value={featuredIds}
                onChange={(e) => setFeaturedIds(e.target.value)}
                placeholder="cm1abc..., cm2def..., (comma-separated)"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-400 mt-1">
                Paste vehicle IDs separated by commas. Find them in the Fleet section.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Save */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 text-white font-semibold px-8 py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
        {saved && <span className="text-green-600 text-sm font-medium">Changes saved!</span>}
        {error && <span className="text-red-600 text-sm">{error}</span>}
      </div>
    </div>
  );
}
