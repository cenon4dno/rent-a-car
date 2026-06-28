export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface BaseBooking {
  id: string;
  vehicleId: string;
  customerId: string;
  renterId: string;
  driverId?: string;
  pickupLocation: string;
  startDate: Date;
  endDate: Date;
  dailyRate: number;
  platformFeeRate: number;
  totalAmount: number;
  platformFee: number;
  status: BookingStatus;
  createdAt: Date;
  updatedAt: Date;
}
