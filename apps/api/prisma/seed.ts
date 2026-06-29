import {
  PrismaClient,
  UserRole,
  KycStatus,
  TrustBadge,
  FuelType,
  TransmissionType,
  VehicleStatus,
  BookingStatus,
} from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// placehold.co placeholder URLs — color-coded per renter tier
const ph = (label: string, theme = '334155/f1f5f9') =>
  `https://placehold.co/640x360/${theme}?text=${label.replace(/ /g, '+')}`;
const metroImg = (label: string) => ph(label, '1e3a5f/dbeafe'); // blue — economy
const islandImg = (label: string) => ph(label, '065f46/d1fae5'); // green — adventure
const premierImg = (label: string) => ph(label, '3b0764/ede9fe'); // purple — luxury

async function main() {
  console.log('🌱 Seeding dummy data...');

  // Clear in reverse-dependency order
  await prisma.review.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.driverProfile.deleteMany();
  await prisma.customerProfile.deleteMany();
  await prisma.renterProfile.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 10);

  // ── Admin ──────────────────────────────────────────────────────────────────
  await prisma.user.create({
    data: {
      email: 'cenon4dno@gmail.com',
      name: 'Platform Admin',
      role: UserRole.ADMIN,
      kycStatus: KycStatus.VERIFIED,
      passwordHash: await bcrypt.hash(process.env.ADMIN_SEED_PASSWORD || 'changeme', 10),
    },
  });
  console.log('  ✓ Admin (1)');

  // ── Renters ────────────────────────────────────────────────────────────────

  const renter1 = await prisma.user.create({
    data: {
      email: 'metro@rentacar.ph',
      name: 'Metro Car Rentals',
      role: UserRole.RENTER,
      kycStatus: KycStatus.VERIFIED,
      passwordHash,
      renterProfile: {
        create: {
          companyName: 'Metro Car Rentals Inc.',
          businessPermitUrl: 'https://example.com/docs/metro-permit.pdf',
          companyRegUrl: 'https://example.com/docs/metro-reg.pdf',
          taxIdNumber: '123-456-789-000',
          bankAccountDetails: JSON.stringify({
            bank: 'BPI',
            account: '****5678',
            name: 'Metro Car Rentals Inc.',
          }),
          trustBadge: TrustBadge.VERIFIED,
          commissionRate: 0.05,
        },
      },
    },
    include: { renterProfile: true },
  });

  const renter2 = await prisma.user.create({
    data: {
      email: 'island@wheels.ph',
      name: 'Island Wheels',
      role: UserRole.RENTER,
      kycStatus: KycStatus.UNDER_REVIEW,
      passwordHash,
      renterProfile: {
        create: {
          companyName: 'Island Wheels Transport Co.',
          businessPermitUrl: 'https://example.com/docs/island-permit.pdf',
          taxIdNumber: '987-654-321-000',
          trustBadge: TrustBadge.UNDER_VALIDATION,
          commissionRate: 0.05,
        },
      },
    },
    include: { renterProfile: true },
  });

  const renter3 = await prisma.user.create({
    data: {
      email: 'premier@drive.ph',
      name: 'Premier Drive',
      role: UserRole.RENTER,
      kycStatus: KycStatus.VERIFIED,
      passwordHash,
      renterProfile: {
        create: {
          companyName: 'Premier Drive Luxury Rentals',
          businessPermitUrl: 'https://example.com/docs/premier-permit.pdf',
          companyRegUrl: 'https://example.com/docs/premier-reg.pdf',
          taxIdNumber: '111-222-333-000',
          bankAccountDetails: JSON.stringify({
            bank: 'Metrobank',
            account: '****9012',
            name: 'Premier Drive Luxury Rentals',
          }),
          trustBadge: TrustBadge.VERIFIED,
          commissionRate: 0.04,
        },
      },
    },
    include: { renterProfile: true },
  });

  const metro = renter1.renterProfile!;
  const island = renter2.renterProfile!;
  const premier = renter3.renterProfile!;

  console.log('  ✓ Renters (3)');

  // ── Customers ──────────────────────────────────────────────────────────────

  const c1 = await prisma.user.create({
    data: {
      email: 'maria.santos@gmail.com',
      name: 'Maria Santos',
      role: UserRole.CUSTOMER,
      kycStatus: KycStatus.VERIFIED,
      passwordHash,
      avatarUrl: 'https://i.pravatar.cc/150?u=maria.santos',
      customerProfile: {
        create: {
          licenseUrl: 'https://example.com/docs/maria-license.jpg',
          secondaryIdUrl: 'https://example.com/docs/maria-passport.jpg',
          kycStatus: KycStatus.VERIFIED,
        },
      },
    },
    include: { customerProfile: true },
  });

  const c2 = await prisma.user.create({
    data: {
      email: 'jose.reyes@yahoo.com',
      name: 'Jose Reyes',
      role: UserRole.CUSTOMER,
      kycStatus: KycStatus.PENDING,
      passwordHash,
      avatarUrl: 'https://i.pravatar.cc/150?u=jose.reyes',
      customerProfile: {
        create: { kycStatus: KycStatus.PENDING },
      },
    },
    include: { customerProfile: true },
  });

  const c3 = await prisma.user.create({
    data: {
      email: 'ana.cruz@outlook.com',
      name: 'Ana Cruz',
      role: UserRole.CUSTOMER,
      kycStatus: KycStatus.VERIFIED,
      passwordHash,
      avatarUrl: 'https://i.pravatar.cc/150?u=ana.cruz',
      customerProfile: {
        create: {
          licenseUrl: 'https://example.com/docs/ana-license.jpg',
          secondaryIdUrl: 'https://example.com/docs/ana-passport.jpg',
          kycStatus: KycStatus.VERIFIED,
        },
      },
    },
    include: { customerProfile: true },
  });

  const c4 = await prisma.user.create({
    data: {
      email: 'miguel.delacruz@gmail.com',
      name: 'Miguel Dela Cruz',
      role: UserRole.CUSTOMER,
      kycStatus: KycStatus.VERIFIED,
      passwordHash,
      avatarUrl: 'https://i.pravatar.cc/150?u=miguel.delacruz',
      customerProfile: {
        create: {
          licenseUrl: 'https://example.com/docs/miguel-license.jpg',
          secondaryIdUrl: 'https://example.com/docs/miguel-sss.jpg',
          kycStatus: KycStatus.VERIFIED,
        },
      },
    },
    include: { customerProfile: true },
  });

  console.log('  ✓ Customers (4)');

  // ── Drivers ────────────────────────────────────────────────────────────────

  const d1 = await prisma.user.create({
    data: {
      email: 'roberto.delacruz@metro.ph',
      name: 'Roberto Dela Cruz',
      role: UserRole.DRIVER,
      kycStatus: KycStatus.VERIFIED,
      passwordHash,
      avatarUrl: 'https://i.pravatar.cc/150?u=roberto.delacruz',
      driverProfile: {
        create: {
          renterId: metro.id,
          licenseUrl: 'https://example.com/docs/roberto-license.jpg',
          backgroundCheckUrl: 'https://example.com/docs/roberto-bgcheck.pdf',
          kycStatus: KycStatus.VERIFIED,
        },
      },
    },
    include: { driverProfile: true },
  });

  const d2 = await prisma.user.create({
    data: {
      email: 'manuel.garcia@metro.ph',
      name: 'Manuel Garcia',
      role: UserRole.DRIVER,
      kycStatus: KycStatus.UNDER_REVIEW,
      passwordHash,
      avatarUrl: 'https://i.pravatar.cc/150?u=manuel.garcia',
      driverProfile: {
        create: {
          renterId: metro.id,
          licenseUrl: 'https://example.com/docs/manuel-license.jpg',
          kycStatus: KycStatus.UNDER_REVIEW,
        },
      },
    },
    include: { driverProfile: true },
  });

  const d3 = await prisma.user.create({
    data: {
      email: 'susan.lim@island.ph',
      name: 'Susan Lim',
      role: UserRole.DRIVER,
      kycStatus: KycStatus.VERIFIED,
      passwordHash,
      avatarUrl: 'https://i.pravatar.cc/150?u=susan.lim',
      driverProfile: {
        create: {
          renterId: island.id,
          licenseUrl: 'https://example.com/docs/susan-license.jpg',
          backgroundCheckUrl: 'https://example.com/docs/susan-bgcheck.pdf',
          kycStatus: KycStatus.VERIFIED,
        },
      },
    },
    include: { driverProfile: true },
  });

  const d4 = await prisma.user.create({
    data: {
      email: 'carlos.mendoza@premier.ph',
      name: 'Carlos Mendoza',
      role: UserRole.DRIVER,
      kycStatus: KycStatus.VERIFIED,
      passwordHash,
      avatarUrl: 'https://i.pravatar.cc/150?u=carlos.mendoza',
      driverProfile: {
        create: {
          renterId: premier.id,
          licenseUrl: 'https://example.com/docs/carlos-license.jpg',
          backgroundCheckUrl: 'https://example.com/docs/carlos-bgcheck.pdf',
          kycStatus: KycStatus.VERIFIED,
        },
      },
    },
    include: { driverProfile: true },
  });

  console.log('  ✓ Drivers (4)');

  // ── Vehicles ───────────────────────────────────────────────────────────────
  // Metro Car Rentals — economy & mid-range (7 vehicles)

  const v1 = await prisma.vehicle.create({
    data: {
      renterId: metro.id,
      make: 'Toyota',
      model: 'Vios',
      year: 2022,
      plateNumber: 'ABC-1234',
      description: 'Compact and fuel-efficient sedan, perfect for city drives.',
      fuelType: FuelType.GASOLINE,
      transmission: TransmissionType.AUTOMATIC,
      seatingCapacity: 5,
      dailyRate: 2500,
      mileageLimit: 250,
      imageUrls: JSON.stringify([metroImg('Toyota Vios'), metroImg('Toyota Vios 2')]),
      status: VehicleStatus.AVAILABLE,
    },
  });

  const v2 = await prisma.vehicle.create({
    data: {
      renterId: metro.id,
      make: 'Honda',
      model: 'CR-V',
      year: 2023,
      plateNumber: 'DEF-5678',
      description: 'Spacious SUV ideal for family trips and long drives.',
      fuelType: FuelType.GASOLINE,
      transmission: TransmissionType.AUTOMATIC,
      seatingCapacity: 7,
      dailyRate: 4500,
      mileageLimit: 300,
      imageUrls: JSON.stringify([metroImg('Honda CR-V')]),
      status: VehicleStatus.AVAILABLE,
    },
  });

  await prisma.vehicle.create({
    data: {
      renterId: metro.id,
      make: 'Mitsubishi',
      model: 'Mirage',
      year: 2021,
      plateNumber: 'GHI-9012',
      description: 'Budget-friendly hatchback for urban commuting.',
      fuelType: FuelType.GASOLINE,
      transmission: TransmissionType.CVT,
      seatingCapacity: 5,
      dailyRate: 1800,
      mileageLimit: 200,
      imageUrls: JSON.stringify([metroImg('Mitsubishi Mirage')]),
      status: VehicleStatus.RENTED,
    },
  });

  await prisma.vehicle.create({
    data: {
      renterId: metro.id,
      make: 'Toyota',
      model: 'Avanza',
      year: 2021,
      plateNumber: 'VWX-5566',
      description: 'Versatile 7-seater MPV great for family outings and group transfers.',
      fuelType: FuelType.GASOLINE,
      transmission: TransmissionType.MANUAL,
      seatingCapacity: 7,
      dailyRate: 2200,
      mileageLimit: 200,
      imageUrls: JSON.stringify([metroImg('Toyota Avanza'), metroImg('Toyota Avanza 2')]),
      status: VehicleStatus.AVAILABLE,
    },
  });

  await prisma.vehicle.create({
    data: {
      renterId: metro.id,
      make: 'Suzuki',
      model: 'Ertiga',
      year: 2022,
      plateNumber: 'YZA-7788',
      description: 'Comfortable 7-seater with smooth CVT, ideal for weekend road trips.',
      fuelType: FuelType.GASOLINE,
      transmission: TransmissionType.AUTOMATIC,
      seatingCapacity: 7,
      dailyRate: 2800,
      mileageLimit: 250,
      imageUrls: JSON.stringify([metroImg('Suzuki Ertiga')]),
      status: VehicleStatus.AVAILABLE,
    },
  });

  await prisma.vehicle.create({
    data: {
      renterId: metro.id,
      make: 'Ford',
      model: 'Ranger',
      year: 2022,
      plateNumber: 'BCD-9900',
      description: '4x4 pickup truck with a spacious cabin, ready for rough terrain.',
      fuelType: FuelType.DIESEL,
      transmission: TransmissionType.AUTOMATIC,
      seatingCapacity: 5,
      dailyRate: 4000,
      mileageLimit: 300,
      imageUrls: JSON.stringify([metroImg('Ford Ranger'), metroImg('Ford Ranger 2')]),
      status: VehicleStatus.MAINTENANCE,
    },
  });

  await prisma.vehicle.create({
    data: {
      renterId: metro.id,
      make: 'Hyundai',
      model: 'Tucson',
      year: 2023,
      plateNumber: 'EFG-1133',
      description: 'Modern mid-size SUV with panoramic sunroof and advanced safety tech.',
      fuelType: FuelType.GASOLINE,
      transmission: TransmissionType.AUTOMATIC,
      seatingCapacity: 5,
      dailyRate: 3800,
      mileageLimit: 250,
      imageUrls: JSON.stringify([metroImg('Hyundai Tucson'), metroImg('Hyundai Tucson 2')]),
      status: VehicleStatus.AVAILABLE,
    },
  });

  // Island Wheels — adventure & eco (5 vehicles)

  const v4 = await prisma.vehicle.create({
    data: {
      renterId: island.id,
      make: 'Toyota',
      model: 'Fortuner',
      year: 2022,
      plateNumber: 'JKL-3456',
      description: 'Rugged 4x4 SUV built for off-road and island adventures.',
      fuelType: FuelType.DIESEL,
      transmission: TransmissionType.AUTOMATIC,
      seatingCapacity: 7,
      dailyRate: 5500,
      mileageLimit: 350,
      imageUrls: JSON.stringify([islandImg('Toyota Fortuner'), islandImg('Toyota Fortuner 2')]),
      status: VehicleStatus.AVAILABLE,
    },
  });

  await prisma.vehicle.create({
    data: {
      renterId: island.id,
      make: 'Kia',
      model: 'EV6',
      year: 2023,
      plateNumber: 'MNO-7890',
      description: 'Premium all-electric crossover with a 400 km range.',
      fuelType: FuelType.ELECTRIC,
      transmission: TransmissionType.AUTOMATIC,
      seatingCapacity: 5,
      dailyRate: 6000,
      imageUrls: JSON.stringify([islandImg('Kia EV6'), islandImg('Kia EV6 2')]),
      status: VehicleStatus.AVAILABLE,
    },
  });

  await prisma.vehicle.create({
    data: {
      renterId: island.id,
      make: 'Toyota',
      model: 'HiAce',
      year: 2022,
      plateNumber: 'HIJ-2244',
      description: 'High-roof commuter van seating up to 15, perfect for group tours.',
      fuelType: FuelType.DIESEL,
      transmission: TransmissionType.MANUAL,
      seatingCapacity: 15,
      dailyRate: 7500,
      mileageLimit: 400,
      imageUrls: JSON.stringify([islandImg('Toyota HiAce'), islandImg('Toyota HiAce 2')]),
      status: VehicleStatus.AVAILABLE,
    },
  });

  await prisma.vehicle.create({
    data: {
      renterId: island.id,
      make: 'BYD',
      model: 'Atto 3',
      year: 2023,
      plateNumber: 'KLM-4455',
      description: 'All-electric compact SUV with a 420 km range and fast charging.',
      fuelType: FuelType.ELECTRIC,
      transmission: TransmissionType.AUTOMATIC,
      seatingCapacity: 5,
      dailyRate: 5500,
      imageUrls: JSON.stringify([islandImg('BYD Atto 3'), islandImg('BYD Atto 3 2')]),
      status: VehicleStatus.AVAILABLE,
    },
  });

  await prisma.vehicle.create({
    data: {
      renterId: island.id,
      make: 'Nissan',
      model: 'Terra',
      year: 2022,
      plateNumber: 'NOP-6677',
      description: 'Body-on-frame diesel SUV with 4WD, built for tough island roads.',
      fuelType: FuelType.DIESEL,
      transmission: TransmissionType.AUTOMATIC,
      seatingCapacity: 7,
      dailyRate: 5000,
      mileageLimit: 350,
      imageUrls: JSON.stringify([islandImg('Nissan Terra')]),
      status: VehicleStatus.RENTED,
    },
  });

  // Premier Drive — luxury & executive (5 vehicles)

  await prisma.vehicle.create({
    data: {
      renterId: premier.id,
      make: 'Mercedes-Benz',
      model: 'E-Class',
      year: 2023,
      plateNumber: 'PQR-1122',
      description: 'Executive sedan for business travel and VIP transfers.',
      fuelType: FuelType.GASOLINE,
      transmission: TransmissionType.AUTOMATIC,
      seatingCapacity: 5,
      dailyRate: 12000,
      mileageLimit: 200,
      imageUrls: JSON.stringify([
        premierImg('Mercedes-Benz E-Class'),
        premierImg('Mercedes-Benz E-Class 2'),
      ]),
      status: VehicleStatus.AVAILABLE,
    },
  });

  await prisma.vehicle.create({
    data: {
      renterId: premier.id,
      make: 'Toyota',
      model: 'Alphard',
      year: 2023,
      plateNumber: 'STU-3344',
      description: 'Luxury MPV for group events and airport transfers.',
      fuelType: FuelType.HYBRID,
      transmission: TransmissionType.CVT,
      seatingCapacity: 7,
      dailyRate: 15000,
      mileageLimit: 250,
      imageUrls: JSON.stringify([premierImg('Toyota Alphard')]),
      status: VehicleStatus.AVAILABLE,
    },
  });

  await prisma.vehicle.create({
    data: {
      renterId: premier.id,
      make: 'BMW',
      model: '5 Series',
      year: 2023,
      plateNumber: 'QRS-8899',
      description: 'Sport-luxury sedan with M Sport package and heads-up display.',
      fuelType: FuelType.GASOLINE,
      transmission: TransmissionType.AUTOMATIC,
      seatingCapacity: 5,
      dailyRate: 18000,
      mileageLimit: 150,
      imageUrls: JSON.stringify([premierImg('BMW 5 Series'), premierImg('BMW 5 Series 2')]),
      status: VehicleStatus.AVAILABLE,
    },
  });

  await prisma.vehicle.create({
    data: {
      renterId: premier.id,
      make: 'Lexus',
      model: 'RX 350h',
      year: 2023,
      plateNumber: 'TUV-0011',
      description: 'Flagship hybrid SUV combining refinement with exceptional fuel economy.',
      fuelType: FuelType.HYBRID,
      transmission: TransmissionType.AUTOMATIC,
      seatingCapacity: 5,
      dailyRate: 20000,
      mileageLimit: 200,
      imageUrls: JSON.stringify([premierImg('Lexus RX 350h'), premierImg('Lexus RX 350h 2')]),
      status: VehicleStatus.AVAILABLE,
    },
  });

  await prisma.vehicle.create({
    data: {
      renterId: premier.id,
      make: 'Toyota',
      model: 'Land Cruiser',
      year: 2023,
      plateNumber: 'WXY-2233',
      description: 'Full-size luxury 4x4 SUV — the pinnacle of off-road capability and comfort.',
      fuelType: FuelType.DIESEL,
      transmission: TransmissionType.AUTOMATIC,
      seatingCapacity: 8,
      dailyRate: 25000,
      mileageLimit: 300,
      imageUrls: JSON.stringify([
        premierImg('Toyota Land Cruiser'),
        premierImg('Toyota Land Cruiser 2'),
      ]),
      status: VehicleStatus.AVAILABLE,
    },
  });

  console.log('  ✓ Vehicles (17)');

  // ── Bookings ───────────────────────────────────────────────────────────────
  // totalAmount = (dailyRate * days + addonsAmount) * (1 + platformFeeRate)

  const DAY = 86_400_000;
  const now = new Date();

  // COMPLETED — Maria + Toyota Vios + chauffeur (2 days)
  // base=5000, addons=3000 (2d chauffeur @1500), fee=400, total=8400
  const b1 = await prisma.booking.create({
    data: {
      vehicleId: v1.id,
      customerId: c1.customerProfile!.id,
      renterId: metro.id,
      driverId: d1.driverProfile!.id,
      pickupLocation: 'NAIA Terminal 1, Pasay City',
      startDate: new Date(now.getTime() - 10 * DAY),
      endDate: new Date(now.getTime() - 8 * DAY),
      dailyRate: 2500,
      platformFeeRate: 0.05,
      addonsAmount: 3000,
      platformFee: 400,
      totalAmount: 8400,
      status: BookingStatus.COMPLETED,
      referenceNumber: 'RAC-2024-00001',
    },
  });

  // ACTIVE — Ana + Honda CR-V (3 days, self-drive)
  // base=13500, addons=0, fee=675, total=14175
  await prisma.booking.create({
    data: {
      vehicleId: v2.id,
      customerId: c3.customerProfile!.id,
      renterId: metro.id,
      pickupLocation: 'SM Mall of Asia, Pasay City',
      startDate: new Date(now.getTime() - 1 * DAY),
      endDate: new Date(now.getTime() + 2 * DAY),
      dailyRate: 4500,
      platformFeeRate: 0.05,
      addonsAmount: 0,
      platformFee: 675,
      totalAmount: 14175,
      status: BookingStatus.ACTIVE,
      referenceNumber: 'RAC-2024-00002',
    },
  });

  // CONFIRMED — Miguel + Toyota Fortuner + chauffeur (3 days)
  // base=16500, addons=4500 (3d @1500), fee=1050, total=22050
  await prisma.booking.create({
    data: {
      vehicleId: v4.id,
      customerId: c4.customerProfile!.id,
      renterId: island.id,
      driverId: d3.driverProfile!.id,
      pickupLocation: 'Mactan-Cebu International Airport',
      startDate: new Date(now.getTime() + 3 * DAY),
      endDate: new Date(now.getTime() + 6 * DAY),
      dailyRate: 5500,
      platformFeeRate: 0.05,
      addonsAmount: 4500,
      platformFee: 1050,
      totalAmount: 22050,
      status: BookingStatus.CONFIRMED,
      referenceNumber: 'RAC-2024-00003',
    },
  });

  // CANCELLED — Jose + Kia EV6 (2 days)
  // base=12000, addons=0, fee=600, total=12600
  await prisma.booking.create({
    data: {
      vehicleId: v4.id,
      customerId: c2.customerProfile!.id,
      renterId: island.id,
      pickupLocation: 'Cebu City Port Area',
      startDate: new Date(now.getTime() - 5 * DAY),
      endDate: new Date(now.getTime() - 3 * DAY),
      dailyRate: 6000,
      platformFeeRate: 0.05,
      addonsAmount: 0,
      platformFee: 600,
      totalAmount: 12600,
      status: BookingStatus.CANCELLED,
      referenceNumber: 'RAC-2024-00004',
    },
  });

  console.log('  ✓ Bookings (4)');

  // ── Reviews ────────────────────────────────────────────────────────────────

  await prisma.review.create({
    data: {
      bookingId: b1.id,
      vehicleId: v1.id,
      reviewerId: c1.customerProfile!.id,
      rating: 5,
      comment:
        'Excellent car — very clean and fuel-efficient! Roberto was professional, punctual, and knew the best routes. Highly recommend.',
    },
  });

  console.log('  ✓ Reviews (1)');

  // ── Summary ────────────────────────────────────────────────────────────────

  console.log('\n🎉 Dummy data seeded!\n');
  console.log('── Renters ─────────────────────────────────────────');
  console.log(`  Metro Car Rentals     ${renter1.email}  [VERIFIED]`);
  console.log(`  Island Wheels         ${renter2.email}  [UNDER_VALIDATION]`);
  console.log(`  Premier Drive         ${renter3.email}  [VERIFIED, 4% fee]`);
  console.log('\n── Customers ───────────────────────────────────────');
  console.log(`  Maria Santos          ${c1.email}  [VERIFIED]`);
  console.log(`  Jose Reyes            ${c2.email}  [PENDING]`);
  console.log(`  Ana Cruz              ${c3.email}  [VERIFIED]`);
  console.log(`  Miguel Dela Cruz      ${c4.email}  [VERIFIED]`);
  console.log('\n── Drivers ─────────────────────────────────────────');
  console.log(`  Roberto Dela Cruz     ${d1.email}  (Metro, VERIFIED)`);
  console.log(`  Manuel Garcia         ${d2.email}  (Metro, UNDER_REVIEW)`);
  console.log(`  Susan Lim             ${d3.email}  (Island, VERIFIED)`);
  console.log(`  Carlos Mendoza        ${d4.email}  (Premier, VERIFIED)`);
  console.log('\n── Vehicles (17) ───────────────────────────────────');
  console.log('  Metro Car Rentals (7)');
  console.log('    Toyota Vios           ABC-1234  ₱2,500/day  [AVAILABLE]');
  console.log('    Honda CR-V            DEF-5678  ₱4,500/day  [AVAILABLE]');
  console.log('    Mitsubishi Mirage     GHI-9012  ₱1,800/day  [RENTED]');
  console.log('    Toyota Avanza         VWX-5566  ₱2,200/day  [AVAILABLE]');
  console.log('    Suzuki Ertiga         YZA-7788  ₱2,800/day  [AVAILABLE]');
  console.log('    Ford Ranger           BCD-9900  ₱4,000/day  [MAINTENANCE]');
  console.log('    Hyundai Tucson        EFG-1133  ₱3,800/day  [AVAILABLE]');
  console.log('  Island Wheels (5)');
  console.log('    Toyota Fortuner       JKL-3456  ₱5,500/day  [AVAILABLE]');
  console.log('    Kia EV6               MNO-7890  ₱6,000/day  [AVAILABLE]');
  console.log('    Toyota HiAce          HIJ-2244  ₱7,500/day  [AVAILABLE]');
  console.log('    BYD Atto 3            KLM-4455  ₱5,500/day  [AVAILABLE]');
  console.log('    Nissan Terra          NOP-6677  ₱5,000/day  [RENTED]');
  console.log('  Premier Drive (5)');
  console.log('    Mercedes-Benz E-Class PQR-1122  ₱12,000/day [AVAILABLE]');
  console.log('    Toyota Alphard        STU-3344  ₱15,000/day [AVAILABLE]');
  console.log('    BMW 5 Series          QRS-8899  ₱18,000/day [AVAILABLE]');
  console.log('    Lexus RX 350h         TUV-0011  ₱20,000/day [AVAILABLE]');
  console.log('    Toyota Land Cruiser   WXY-2233  ₱25,000/day [AVAILABLE]');
  console.log('\n── All passwords: password123 ──────────────────────\n');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
