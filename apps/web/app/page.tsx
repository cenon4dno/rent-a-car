import Link from 'next/link';
import { SearchWidget } from '@/components/ui/SearchWidget';
import { VehicleCard } from '@/components/ui/VehicleCard';
import { PartnerCard } from '@/components/ui/PartnerCard';
import { FeaturedCarousel } from '@/components/ui/FeaturedCarousel';
import { Button } from '@/components/ui/Button';
import {
  searchVehicles,
  getTopRenters,
  getPrimaryImage,
  type VehicleWithRenter,
  type TopRenter,
} from '@/lib/api';

export const dynamic = 'force-dynamic';

const FEATURES = [
  {
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.955 11.955 0 01.005 14.556c.007.272.015.543.027.813A9.003 9.003 0 0018 18.75c0-.003 0-.006 0-.009a9.003 9.003 0 006.004-10.5A11.956 11.956 0 0120.4 6a11.959 11.959 0 01-5.398-2.786A9 9 0 019 5.714z"
        />
      </svg>
    ),
    title: 'Verified Rental Partners',
    desc: 'Every company on our platform undergoes KYC and business registration verification before listing.',
  },
  {
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
        />
      </svg>
    ),
    title: 'Secure Payment',
    desc: 'Pay with credit card, GCash, or Maya. All transactions are encrypted and processed securely.',
  },
  {
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    title: 'Free Cancellation',
    desc: 'Cancel up to 48 hours before pick-up for a full refund. No questions asked.',
  },
  {
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z"
        />
      </svg>
    ),
    title: 'Compare & Choose',
    desc: 'Compare up to 3 vehicles side by side — specs, pricing, mileage limits, and add-ons at a glance.',
  },
  {
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
        />
      </svg>
    ),
    title: 'Nationwide Coverage',
    desc: 'Find vehicles across major cities and provinces in the Philippines, all in one platform.',
  },
  {
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
        />
      </svg>
    ),
    title: '24/7 AI Support',
    desc: 'Our intelligent chatbot answers booking questions, checks availability, and guides you through KYC.',
  },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Search',
    description:
      'Enter your location and dates. Filter by fuel type, transmission, seats, and use case.',
  },
  {
    step: '02',
    title: 'Book & Pay',
    description:
      'Choose your car, review the price breakdown, and pay securely with card or e-wallet.',
  },
  {
    step: '03',
    title: 'Drive Away',
    description: 'Show your QR booking code at pick-up and hit the road with confidence.',
  },
];

const STATS = [
  { label: 'Rental Companies', value: '500+' },
  { label: 'Vehicles Available', value: '10,000+' },
  { label: 'Bookings Completed', value: '50,000+' },
  { label: 'Cities Covered', value: '80+' },
];

export default async function HomePage() {
  const [vehicleResult, renterResult] = await Promise.all([
    searchVehicles({ limit: 8 }).catch(() => null),
    getTopRenters(6).catch(() => null),
  ]);

  const allVehicles = vehicleResult?.data?.data ?? [];
  const featuredVehicles = allVehicles;
  const gridVehicles = allVehicles.slice(0, 4);
  const topRenters = renterResult?.data ?? [];

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative bg-gray-900 text-white overflow-hidden">
        {/* Background gradient blobs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-blue-600/30 blur-3xl" />
          <div className="absolute -bottom-40 -left-20 w-[500px] h-[500px] rounded-full bg-indigo-600/20 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-blue-800/10 blur-3xl" />
        </div>

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-32">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 bg-blue-600/20 border border-blue-500/30 text-blue-300 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
              <svg className="w-3.5 h-3.5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Philippines #1 Car Rental Marketplace
            </div>
            <h1 className="text-5xl sm:text-6xl font-extrabold leading-[1.1] tracking-tight mb-6">
              Find the perfect car{' '}
              <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                anywhere in PH
              </span>
            </h1>
            <p className="text-gray-400 text-xl leading-relaxed">
              Compare hundreds of verified rental fleets, book in minutes, and drive with
              confidence. No hidden fees — just honest pricing.
            </p>
          </div>

          {/* Search widget */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-2 max-w-4xl mx-auto">
            <SearchWidget />
          </div>

          {/* Trust signals */}
          <div className="mt-10 flex flex-wrap justify-center gap-8 text-sm text-gray-400">
            {[
              { icon: '🔒', text: 'Secure payments' },
              { icon: '✅', text: 'Verified companies' },
              { icon: '↩️', text: 'Free cancellation 48h' },
              { icon: '⚡', text: 'Instant confirmation' },
            ].map((t) => (
              <span key={t.text} className="flex items-center gap-2">
                <span>{t.icon}</span>
                <span>{t.text}</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats band ── */}
      <section className="bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-blue-500/50">
            {STATS.map((s) => (
              <div key={s.label} className="px-6 py-8 text-center text-white">
                <p className="text-3xl font-extrabold">{s.value}</p>
                <p className="text-blue-200 text-sm mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Carousel ── */}
      {featuredVehicles.length > 0 && <FeaturedCarousel vehicles={featuredVehicles} />}

      {/* ── Why RentACar ── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-blue-600 text-sm font-semibold uppercase tracking-widest">
              Why choose us
            </span>
            <h2 className="text-4xl font-bold text-gray-900 mt-2">
              Everything you need, in one place
            </h2>
            <p className="mt-3 text-gray-500 max-w-2xl mx-auto">
              We built RentACar to make car rental transparent, safe, and seamless — from search to
              return.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="group p-7 rounded-2xl border border-gray-100 bg-white hover:border-blue-200 hover:shadow-md transition-all"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 text-blue-600 mb-5 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  {f.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-blue-600 text-sm font-semibold uppercase tracking-widest">
              Simple process
            </span>
            <h2 className="text-4xl font-bold text-gray-900 mt-2">Book a car in 3 steps</h2>
          </div>
          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Connector line */}
            <div className="hidden md:block absolute top-10 left-1/3 right-1/3 h-px bg-gradient-to-r from-blue-200 via-blue-400 to-blue-200" />
            {HOW_IT_WORKS.map(({ step, title, description }) => (
              <div key={step} className="relative text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-blue-600 text-white text-2xl font-black shadow-lg shadow-blue-200 mb-6">
                  {step}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
                <p className="text-gray-500 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Vehicles ── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="text-blue-600 text-sm font-semibold uppercase tracking-widest">
                Top picks
              </span>
              <h2 className="text-4xl font-bold text-gray-900 mt-2">Featured vehicles</h2>
              <p className="mt-2 text-gray-500">High-rated cars available for immediate booking</p>
            </div>
            <Link href="/search">
              <Button variant="secondary" size="sm">
                View all &rarr;
              </Button>
            </Link>
          </div>
          {gridVehicles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {gridVehicles.map((v: VehicleWithRenter) => (
                <VehicleCard
                  key={v.id}
                  id={v.id}
                  make={v.make}
                  model={v.model}
                  year={v.year}
                  fuelType={v.fuelType}
                  transmission={v.transmission}
                  seatingCapacity={v.seatingCapacity}
                  dailyRate={v.dailyRate}
                  imageUrl={getPrimaryImage(v.imageUrls, v.vehiclePhotos)}
                  renterName={v.renter?.companyName}
                  trustBadge={v.renter?.trustBadge}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="text-gray-500 font-medium">No vehicles available right now.</p>
              <Link
                href="/search"
                className="inline-block mt-3 text-sm text-blue-600 font-medium hover:underline"
              >
                Try searching directly &rarr;
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── Top Partners ── */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-blue-600 text-sm font-semibold uppercase tracking-widest">
              Our network
            </span>
            <h2 className="text-4xl font-bold text-gray-900 mt-2">Top rental partners</h2>
            <p className="mt-3 text-gray-500">
              Trusted companies with verified fleets across the Philippines
            </p>
          </div>
          {topRenters.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {topRenters.map((partner: TopRenter) => (
                <PartnerCard key={partner.id} {...partner} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400">No partners listed yet.</p>
          )}
          <div className="mt-12 text-center">
            <Link href="/become-a-partner">
              <Button variant="secondary" size="lg">
                List your fleet &rarr; Earn with us
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-24 bg-gray-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-blue-600/20 blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-blue-400 text-sm font-semibold uppercase tracking-widest">
            Get started today
          </span>
          <h2 className="text-4xl sm:text-5xl font-extrabold mt-3 mb-5 leading-tight">
            Ready to hit the road?
          </h2>
          <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto">
            Join thousands of Filipinos who book smarter with RentACar. Compare, book, and drive —
            all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/search">
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-500 text-white border-0 shadow-lg shadow-blue-900/40 w-full sm:w-auto"
              >
                Search available cars
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="lg"
                variant="secondary"
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 w-full sm:w-auto"
              >
                Create a free account
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
