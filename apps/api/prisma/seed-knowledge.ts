import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const KB_ENTRIES = [
  {
    category: 'booking',
    question: 'How do I make a booking?',
    answer:
      'To book a car: (1) Search for available vehicles by entering your location and dates on the home page. (2) Select a vehicle from the results. (3) Choose any add-ons (child seat ₱500/day, chauffeur ₱1,500/day). (4) Review the price breakdown including the 5% platform fee. (5) Complete payment via credit/debit card or e-wallet (GCash, Maya).',
    keywords: 'book booking reserve car how rent steps',
  },
  {
    category: 'booking',
    question: 'What are the booking statuses?',
    answer:
      'Bookings go through these statuses: PENDING (awaiting renter confirmation), CONFIRMED (renter accepted, payment due or paid), ACTIVE (vehicle currently in use), COMPLETED (rental period ended), CANCELLED (cancelled by user or renter).',
    keywords: 'status pending confirmed active completed cancelled booking',
  },
  {
    category: 'booking',
    question: 'Can I cancel my booking?',
    answer:
      'Yes. Cancellation refund policy: 100% refund if cancelled 48+ hours before pickup. 50% refund if cancelled 24–48 hours before pickup. No refund for cancellations within 24 hours of pickup. To cancel, go to My Bookings and select the booking.',
    keywords: 'cancel cancellation refund policy 48 hours 24 hours',
  },
  {
    category: 'booking',
    question: 'How long can I hold a reservation?',
    answer:
      'During the payment process, your reservation is held for 10 minutes. If payment is not completed within this window, the booking is released and the vehicle becomes available for other users.',
    keywords: 'hold reservation 10 minutes expire payment window',
  },
  {
    category: 'payment',
    question: 'What payment methods are accepted?',
    answer:
      'We accept: Credit and Debit cards (Visa, Mastercard), GCash, Maya (PayMaya), and online bank transfers via BPI and Metrobank. All payments are processed securely through PayMongo.',
    keywords: 'payment method credit debit gcash maya paymaya bpi metrobank card',
  },
  {
    category: 'payment',
    question: 'What is the platform fee?',
    answer:
      'A 5% platform fee is added to all bookings. This fee covers platform maintenance, payment processing, and customer support. Some rental companies may have a different commission rate negotiated with the platform.',
    keywords: 'platform fee 5% commission charge cost',
  },
  {
    category: 'payment',
    question: 'What happens if my payment fails during a booking extension?',
    answer:
      'If your payment fails during an in-app booking extension, the extension is denied immediately. You will receive a notification to update your payment method within 1 hour. If not updated, an immediate return of the vehicle is required.',
    keywords: 'payment fail extension update card return vehicle',
  },
  {
    category: 'kyc',
    question: 'What documents do I need to rent a car?',
    answer:
      "Individual renters (customers) need to upload: (1) A valid driver's license (Non-Professional or Professional). (2) A secondary government-issued ID (Passport, SSS, PhilHealth, etc.). Documents are verified before your first booking is approved.",
    keywords: 'kyc document license id passport verify government renter customer requirement',
  },
  {
    category: 'kyc',
    question: 'How do rental companies get verified?',
    answer:
      'Rental companies (Renters) must submit: Business Permit, Company Registration documents, Tax Identification Number (TIN), and Corporate Bank Details. After submission, an admin reviews and assigns a Trust Badge: Verified, Undergoing Validation, or Not Verified.',
    keywords: 'renter company verify trust badge business permit registration tin bank',
  },
  {
    category: 'kyc',
    question: 'How long does KYC verification take?',
    answer:
      'KYC verification is typically completed within 1–3 business days after all required documents are submitted. You will receive an email notification when your account status changes.',
    keywords: 'kyc verification time 1 3 business days how long',
  },
  {
    category: 'vehicle',
    question: 'What types of vehicles are available?',
    answer:
      'The platform offers a wide range: Economy sedans, SUVs, vans, and luxury vehicles. You can filter by fuel type (EV, Hybrid, Gasoline), transmission (Automatic, Manual), seating capacity (2–15 seats), and price range.',
    keywords: 'vehicle car type sedan suv van luxury ev hybrid gasoline automatic manual filter',
  },
  {
    category: 'vehicle',
    question: 'What are the add-ons available?',
    answer:
      'Available add-ons when booking: Child Seat (₱500/day) — suitable for children under 35 kg. Chauffeur Service (₱1,500/day) — a professional driver assigned for the duration of your rental.',
    keywords: 'addon add-on child seat chauffeur driver service extra 500 1500',
  },
  {
    category: 'vehicle',
    question: 'What happens if the car breaks down?',
    answer:
      'Use the SOS button in the app to report a breakdown. This immediately notifies the rental company for a replacement vehicle and alerts our admin team for tracking. The rental timer is paused during the breakdown period.',
    keywords: 'breakdown sos emergency repair replacement timer pause vehicle',
  },
  {
    category: 'policy',
    question: 'What is the late return policy?',
    answer:
      'If you return the car late and it affects the next booking, automated penalty charges apply to your card on file. The system alerts the rental company and suggests an alternative vehicle for the next affected user.',
    keywords: 'late return penalty charge overlap booking',
  },
  {
    category: 'policy',
    question: 'What if my assigned driver does not show up?',
    answer:
      "If your assigned driver does not arrive, report it via the app. You will receive an automatic full refund, and a high-severity penalty and flag will be applied to the rental company's profile.",
    keywords: 'driver no show refund penalty flag renter profile',
  },
  {
    category: 'reviews',
    question: 'How does the review system work?',
    answer:
      'After a completed booking, both parties can leave reviews. You (the customer) can review the car, driver, and rental company. The rental company can review you as a renter. Reviews are visible on vehicle and company profile pages.',
    keywords: 'review rating feedback star two-way mutual customer renter',
  },
  {
    category: 'disputes',
    question: 'How do I report an issue with my booking?',
    answer:
      'After your booking is confirmed, active, or completed, you will see a "Report an Issue" link on your booking confirmation page. Describe the problem and our admin team will mediate between you and the rental company.',
    keywords: 'report issue dispute problem complaint booking admin mediate',
  },
  {
    category: 'account',
    question: 'How do I sign in?',
    answer:
      'Sign in using your Google, Microsoft, or Apple account via Single Sign-On (SSO). No password required — we use OAuth for secure authentication. On first sign-in, you will be prompted to complete your profile and KYC verification.',
    keywords: 'sign in login google microsoft apple sso oauth account',
  },
  {
    category: 'account',
    question: 'Can rental companies list their fleet on this platform?',
    answer:
      'Yes. Register as a Renter (rental company), complete KYC verification (business permit, company registration, TIN, bank details), and get your Trust Badge. Once verified, you can add vehicles to your fleet via the Renter Portal dashboard.',
    keywords: 'renter company list fleet register onboard partner',
  },
];

async function main() {
  console.log('Seeding knowledge base...');
  await prisma.knowledgeBase.deleteMany();
  await prisma.knowledgeBase.createMany({ data: KB_ENTRIES });
  console.log(`Seeded ${KB_ENTRIES.length} knowledge base entries.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
