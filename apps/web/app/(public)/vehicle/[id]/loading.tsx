export default function VehicleLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb skeleton */}
        <div className="h-4 w-40 bg-gray-200 rounded animate-pulse mb-6" />

        <div className="lg:grid lg:grid-cols-3 lg:gap-8 space-y-6 lg:space-y-0">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image */}
            <div className="rounded-2xl overflow-hidden bg-gray-200 animate-pulse h-72" />

            {/* Vehicle info card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
              <div className="flex justify-between">
                <div className="space-y-2">
                  <div className="h-6 w-40 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="space-y-2 text-right">
                  <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 w-14 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
              <div className="flex gap-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-5 w-16 bg-gray-200 rounded-full animate-pulse" />
                ))}
              </div>
              <div className="grid grid-cols-4 gap-4 pt-4 border-t border-gray-100">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-1">
                    <div className="h-3 w-12 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>

            {/* Renter card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="h-4 w-28 bg-gray-200 rounded animate-pulse mb-4" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
                <div className="space-y-1.5">
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            </div>
          </div>

          {/* Right column — booking form skeleton */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
              <div className="h-5 w-36 bg-gray-200 rounded animate-pulse" />
              <div className="h-10 bg-gray-200 rounded-lg animate-pulse" />
              <div className="grid grid-cols-2 gap-3">
                <div className="h-10 bg-gray-200 rounded-lg animate-pulse" />
                <div className="h-10 bg-gray-200 rounded-lg animate-pulse" />
              </div>
              <div className="space-y-2">
                {[1, 2].map((i) => (
                  <div key={i} className="h-5 bg-gray-200 rounded animate-pulse" />
                ))}
              </div>
              <div className="h-12 bg-gray-200 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
