import { PrismaClient } from '@prisma/client';

// Boot-time guard for dev deployments: seed dummy data only when the database
// is completely empty. seed.ts wipes all tables before inserting, so it must
// never run against a database that already has data.
const prisma = new PrismaClient();

async function run() {
  const users = await prisma.user.count();
  await prisma.$disconnect();
  if (users > 0) {
    console.log(`Seed skipped: database already has ${users} user(s)`);
    return;
  }
  console.log('Empty database detected — seeding dummy data...');
  await import('./seed');
}

run().catch((err) => {
  // never block app startup on seeding
  console.error('seed-if-empty failed:', err);
});
