import Link from 'next/link';

const STEPS = [
  {
    number: '01',
    title: 'Search & Compare',
    description:
      'Enter your pick-up location and rental dates. Browse verified vehicles from multiple rental companies, filter by price, fuel type, seating, and more.',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
    number: '02',
    title: 'Book & Pay Securely',
    description:
      'Select your car, choose optional add-ons like a child seat or chauffeur, review the full price breakdown, and pay securely via card or e-wallet.',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
    number: '03',
    title: 'Pick Up & Enjoy',
    description:
      'Receive your booking confirmation with QR code and exact pick-up location on a map. Show your QR at pick-up and hit the road. Rate your experience afterward.',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h8l2-2z"
        />
      </svg>
    ),
  },
];

const FAQS = [
  {
    q: 'Do I need to verify my identity?',
    a: "Yes. All customers must upload a valid driver's license (front and back) plus a secondary government ID before making their first booking. Verification is reviewed within 1 business day.",
  },
  {
    q: 'What payment methods are accepted?',
    a: 'We accept major credit/debit cards (Visa, Mastercard) and local e-wallets including GCash and Maya via PayMongo.',
  },
  {
    q: 'Can I cancel or modify my booking?',
    a: 'You can cancel before pick-up. Full refund if cancelled 48+ hours in advance; 50% refund if 24–48 hours; no refund within 24 hours of pick-up.',
  },
  {
    q: 'What if the car breaks down?',
    a: 'Use the SOS button in the app. This immediately notifies the renter for a replacement and pauses your rental timer.',
  },
  {
    q: 'Can I hire a driver?',
    a: 'Yes. Many vehicles offer an optional chauffeur add-on during booking. The driver is registered and verified by the rental company.',
  },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">How RentACar Works</h1>
          <p className="text-xl text-blue-100">
            Rent a car from verified companies in 3 simple steps.
          </p>
          <Link
            href="/search"
            className="inline-block mt-8 bg-white text-blue-700 font-semibold px-8 py-3 rounded-xl hover:bg-blue-50 transition-colors"
          >
            Find a Car
          </Link>
        </div>
      </section>

      {/* Steps */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12">
            {STEPS.map((step) => (
              <div key={step.number} className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-5">
                  {step.icon}
                </div>
                <div className="text-5xl font-black text-blue-100 mb-2">{step.number}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-gray-50 py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Why Choose RentACar
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Verified Renters', desc: 'Every partner undergoes KYC checks' },
              {
                label: 'Transparent Pricing',
                desc: 'Full breakdown before you pay — no hidden fees',
              },
              { label: 'Instant Confirmation', desc: 'QR code and details right after booking' },
              { label: 'Secure Payments', desc: 'Cards and e-wallets via PayMongo' },
            ].map((item) => (
              <div key={item.label} className="bg-white rounded-2xl p-6 text-center shadow-sm">
                <p className="font-semibold text-gray-900 mb-1">{item.label}</p>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {FAQS.map((faq) => (
              <div key={faq.q} className="border-b border-gray-200 pb-6">
                <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <p className="text-gray-500 mb-4">Still have questions?</p>
            <Link
              href="/contact"
              className="inline-block bg-blue-600 text-white font-semibold px-8 py-3 rounded-xl hover:bg-blue-700 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
