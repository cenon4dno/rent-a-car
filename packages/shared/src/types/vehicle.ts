export type FuelType = 'GASOLINE' | 'DIESEL' | 'HYBRID' | 'ELECTRIC';
export type TransmissionType = 'MANUAL' | 'AUTOMATIC' | 'CVT';
export type VehicleStatus = 'AVAILABLE' | 'RENTED' | 'MAINTENANCE' | 'INACTIVE';

export interface BaseVehicle {
  id: string;
  renterId: string;
  make: string;
  model: string;
  year: number;
  plateNumber: string;
  fuelType: FuelType;
  transmission: TransmissionType;
  seatingCapacity: number;
  dailyRate: number;
  status: VehicleStatus;
  createdAt: Date;
  updatedAt: Date;
}
