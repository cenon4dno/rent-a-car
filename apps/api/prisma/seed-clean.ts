import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Cleaning dummy data...');

  // Delete in reverse-dependency order to respect FK constraints
  const reviews = await prisma.review.deleteMany();
  const payments = await prisma.payment.deleteMany();
  const bookings = await prisma.booking.deleteMany();
  const vehicles = await prisma.vehicle.deleteMany();
  const drivers = await prisma.driverProfile.deleteMany();
  const customers = await prisma.customerProfile.deleteMany();
  const renters = await prisma.renterProfile.deleteMany();
  const sessions = await prisma.session.deleteMany();
  const users = await prisma.user.deleteMany();

  console.log(`  ✓ ${reviews.count} reviews`);
  console.log(`  ✓ ${payments.count} payments`);
  console.log(`  ✓ ${bookings.count} bookings`);
  console.log(`  ✓ ${vehicles.count} vehicles`);
  console.log(`  ✓ ${drivers.count} driver profiles`);
  console.log(`  ✓ ${customers.count} customer profiles`);
  console.log(`  ✓ ${renters.count} renter profiles`);
  console.log(`  ✓ ${sessions.count} sessions`);
  console.log(`  ✓ ${users.count} users`);
  console.log('\n✅ Database cleared.\n');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
