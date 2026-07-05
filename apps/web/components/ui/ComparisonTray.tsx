'use client';

import { useRouter } from 'next/navigation';
import { useCompare } from '@/lib/useCompare';

export function ComparisonTray() {
  const { list, remove, clear } = useCompare();
  const router = useRouter();

  if (list.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-4">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide shrink-0">
          Compare ({list.length}/3)
        </span>

        <div className="flex items-center gap-3 flex-1 overflow-x-auto">
          {list.map((v) => (
            <div
              key={v.id}
              className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 shrink-0"
            >
              {v.imageUrl ? (
                <img
                  src={v.imageUrl}
                  alt={`${v.make} ${v.model}`}
                  className="w-10 h-8 object-cover rounded"
                />
              ) : (
                <div className="w-10 h-8 bg-gray-200 rounded flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0zM13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h8l2-2z"
                    />
                  </svg>
                </div>
              )}
              <div>
                <p className="text-xs font-semibold text-gray-900 leading-tight">
                  {v.make} {v.model}
                </p>
                <p className="text-[10px] text-gray-400">{v.year}</p>
              </div>
              <button
                onClick={() => remove(v.id)}
                className="text-gray-400 hover:text-red-500 transition-colors ml-1"
                aria-label="Remove"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          ))}

          {/* Empty slots */}
          {Array.from({ length: 3 - list.length }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="w-28 h-12 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center shrink-0"
            >
              <span className="text-[10px] text-gray-300">+ Add car</span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={clear}
            className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
          >
            Clear
          </button>
          <button
            disabled={list.length < 2}
            onClick={() => {
              const ids = list.map((v) => v.id).join(',');
              router.push(`/compare?ids=${ids}`);
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
          >
            Compare now
          </button>
        </div>
      </div>
    </div>
  );
}
