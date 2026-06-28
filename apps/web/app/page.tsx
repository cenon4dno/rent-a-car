import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { SearchWidget } from '@/components/ui/SearchWidget';
import { VehicleCard } from '@/components/ui/VehicleCard';
import { PartnerCard } from '@/components/ui/PartnerCard';
import { Button } from '@/components/ui/Button';

// Static seed data shown until the API is live and seeded
const FEATURED_VEHICLES = [
  {
    id: '1',
    make: 'Toyota',
    model: 'Vios',
    year: 2023,
    fuelType: 'GASOLINE',
    transmission: 'Automatic',
    seatingCapacity: 5,
    dailyRate: 2500,
    renterName: 'Sunshine Rentals',
    trustBadge: 'VERIFIED',
    averageRating: 4.8,
  },
  {
    id: '2',
    make: 'Honda',
    model: 'CR-V',
    year: 2024,
    fuelType: 'HYBRID',
    transmission: 'CVT',
    seatingCapacity: 7,
    dailyRate: 4500,
    renterName: 'Metro Car Hub',
    trustBadge: 'VERIFIED',
    averageRating: 4.9,
  },
  {
    id: '3',
    make: 'Mitsubishi',
    model: 'Montero Sport',
    year: 2022,
    fuelType: 'DIESEL',
    transmission: 'Automatic',
    seatingCapacity: 7,
    dailyRate: 5500,
    renterName: 'LuzVisMinda Wheels',
    trustBadge: 'VERIFIED',
    averageRating: 4.7,
  },
  {
    id: '4',
    make: 'BYD',
    model: 'Atto 3',
    year: 2024,
    fuelType: 'ELECTRIC',
    transmission: 'Automatic',
    seatingCapacity: 5,
    dailyRate: 3800,
    renterName: 'GreenDrive PH',
    trustBadge: 'UNDER_VALIDATION',
    averageRating: 4.6,
  },
];

const TOP_PARTNERS = [
  {
    id: '1',
    companyName: 'Sunshine Rentals',
    trustBadge: 'VERIFIED',
    fleetCount: 24,
    averageRating: 4.8,
  },
  {
    id: '2',
    companyName: 'Metro Car Hub',
    trustBadge: 'VERIFIED',
    fleetCount: 41,
    averageRating: 4.9,
  },
  {
    id: '3',
    companyName: 'LuzVisMinda Wheels',
    trustBadge: 'VERIFIED',
    fleetCount: 18,
    averageRating: 4.7,
  },
  {
    id: '4',
    companyName: 'GreenDrive PH',
    trustBadge: 'UNDER_VALIDATION',
    fleetCount: 6,
    averageRating: 4.6,
  },
  {
    id: '5',
    companyName: 'CapitalCity Cars',
    trustBadge: 'VERIFIED',
    fleetCount: 33,
    averageRating: 4.8,
  },
  {
    id: '6',
    companyName: 'IslandHop Rentals',
    trustBadge: 'VERIFIED',
    fleetCount: 12,
    averageRating: 4.5,
  },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Search & Compare',
    description:
      'Enter your dates and location. Browse hundreds of vehicles from verified rental companies across the country.',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    ),
  },
  {
    step: '02',
    title: 'Book & Pay Securely',
    description:
      'Choose your car, review the full price breakdown including platform fee, and pay with card or e-wallet.',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
        />
      </svg>
    ),
  },
  {
    step: '03',
    title: 'Pick Up & Drive',
    description:
      "Show your QR booking code at pickup. Drive away knowing you're covered by our verified renter network.",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0zM13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h8l2-2zM5 8h4"
        />
      </svg>
    ),
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-20 w-96 h-96 bg-indigo-300 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-28">
          <div className="max-w-2xl mb-10">
            <span className="inline-block text-blue-200 text-sm font-semibold tracking-wide uppercase mb-4">
              Philippines #1 Car Rental Marketplace
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-4">
              Find your perfect ride, <span className="text-yellow-300">anywhere in PH</span>
            </h1>
            <p className="text-blue-100 text-lg leading-relaxed">
              Compare fleets from hundreds of verified rental companies. No hidden fees — just great
              cars at honest prices.
            </p>
          </div>

          <SearchWidget />

          <div className="mt-8 flex flex-wrap gap-6 text-sm text-blue-100">
            {[
              'Verified rental companies',
              'Free cancellation up to 48 hrs',
              'GCash, Maya, card payments',
            ].map((t) => (
              <span key={t} className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">How it works</h2>
            <p className="mt-2 text-gray-500">Book a car in under 5 minutes</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map(({ step, title, description, icon }) => (
              <div
                key={step}
                className="relative bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-50 text-blue-600 rounded-xl mb-5">
                  {icon}
                </div>
                <div className="absolute top-4 right-4 text-5xl font-black text-gray-50 select-none leading-none">
                  {step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Vehicles ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Featured vehicles</h2>
              <p className="mt-1 text-gray-500">Top-rated cars available now</p>
            </div>
            <Link href="/search">
              <Button variant="secondary" size="sm">
                View all
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURED_VEHICLES.map((vehicle) => (
              <VehicleCard key={vehicle.id} {...vehicle} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Top Partners ── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Top rental partners</h2>
            <p className="mt-2 text-gray-500">Trusted companies with verified fleets</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {TOP_PARTNERS.map((partner) => (
              <PartnerCard key={partner.id} {...partner} />
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/become-a-partner">
              <Button variant="secondary" size="lg">
                List your fleet → Earn with us
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to hit the road?</h2>
          <p className="text-blue-100 mb-8 text-lg">
            Join thousands of travellers who book smarter with RentACar.
          </p>
          <Link href="/search">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 focus:ring-white">
              Search available cars
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
