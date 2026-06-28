import { notFound } from 'next/navigation';
import { auth } from '@/auth';
import { getVehicle } from '@/lib/api';
import { VehicleForm } from '../../VehicleForm';

interface EditVehiclePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditVehiclePage({ params }: EditVehiclePageProps) {
  const { id } = await params;
  await auth();

  const result = await getVehicle(id).catch(() => null);
  if (!result?.data) notFound();

  const v = result.data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Edit Vehicle</h1>
      <p className="text-gray-500 text-sm mb-8">
        {v.make} {v.model} · {v.plateNumber}
      </p>
      <VehicleForm
        mode="edit"
        vehicleId={id}
        initial={{
          make: v.make,
          model: v.model,
          year: v.year,
          plateNumber: v.plateNumber,
          fuelType: v.fuelType,
          transmission: v.transmission,
          seatingCapacity: v.seatingCapacity,
          dailyRate: v.dailyRate,
        }}
      />
    </div>
  );
}
