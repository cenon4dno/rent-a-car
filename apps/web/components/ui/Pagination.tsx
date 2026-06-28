'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback } from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

export function Pagination({ currentPage, totalPages }: PaginationProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const goTo = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', String(page));
      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, router, pathname],
  );

  if (totalPages <= 1) return null;

  const pages = buildPageRange(currentPage, totalPages);

  return (
    <nav className="flex items-center justify-center gap-1" aria-label="Pagination">
      <button
        onClick={() => goTo(currentPage - 1)}
        disabled={currentPage <= 1}
        className="px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="Previous page"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {pages.map((page, idx) =>
        page === '...' ? (
          <span key={`ellipsis-${idx}`} className="px-2 py-2 text-sm text-gray-400">
            …
          </span>
        ) : (
          <button
            key={page}
            onClick={() => goTo(page as number)}
            className={[
              'min-w-[36px] px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              page === currentPage ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100',
            ].join(' ')}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page}
          </button>
        ),
      )}

      <button
        onClick={() => goTo(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="Next page"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </nav>
  );
}

function buildPageRange(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | '...')[] = [];
  pages.push(1);
  if (current > 3) pages.push('...');
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    pages.push(i);
  }
  if (current < total - 2) pages.push('...');
  pages.push(total);
  return pages;
}
