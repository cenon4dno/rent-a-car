export default function SearchLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header skeleton */}
        <div className="mb-6 space-y-2">
          <div className="h-7 w-48 bg-gray-200 rounded-md animate-pulse" />
          <div className="h-4 w-72 bg-gray-200 rounded-md animate-pulse" />
          <div className="h-3 w-24 bg-gray-200 rounded-md animate-pulse" />
        </div>

        <div className="flex gap-6 items-start">
          {/* Sidebar skeleton */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-5">
              <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-3">
                  <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-gray-200 animate-pulse" />
                      <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </aside>

          {/* Grid skeleton */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm"
              >
                <div className="h-48 bg-gray-200 animate-pulse" />
                <div className="p-4 space-y-3">
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                  <div className="pt-2 border-t border-gray-100 flex justify-between">
                    <div className="h-5 w-20 bg-gray-200 rounded animate-pulse" />
                    <div className="h-3 w-10 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
