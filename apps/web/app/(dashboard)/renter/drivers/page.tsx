import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getMyDrivers } from '@/lib/api';
import { DriversClient } from './DriversClient';

export default async function RenterDriversPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const token = session.apiToken as string;
  const result = await getMyDrivers(token).catch(() => null);
  const drivers = result?.data ?? [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <DriversClient drivers={drivers} token={token} />
    </div>
  );
}
