import type { ApiResponse, PaginatedResponse, BaseVehicle } from '@rent-a-car/shared';

export interface VehicleRenter {
  companyName: string;
  trustBadge: string;
}

export interface VehicleReview {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}

export interface VehicleWithRenter extends BaseVehicle {
  imageUrls: string; // JSON-encoded string[]
  renter: VehicleRenter;
}

export interface VehicleDetail extends VehicleWithRenter {
  renter: VehicleRenter & { userId: string };
  reviews: VehicleReview[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}/api/v1${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? `API error ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export interface VehicleSearchParams {
  startDate?: string;
  endDate?: string;
  location?: string;
  fuelType?: string;
  transmission?: string;
  minSeats?: number;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

export async function searchVehicles(params: VehicleSearchParams) {
  const qs = new URLSearchParams(
    Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== '')
      .map(([k, v]) => [k, String(v)]),
  ).toString();
  return apiFetch<ApiResponse<PaginatedResponse<VehicleWithRenter>>>(
    `/vehicles${qs ? `?${qs}` : ''}`,
  );
}

export async function getVehicle(id: string) {
  return apiFetch<ApiResponse<VehicleDetail>>(`/vehicles/${id}`);
}

export interface BookingVehicle {
  make: string;
  model: string;
  year: number;
  plateNumber: string;
  imageUrls: string;
}

export interface BookingPayment {
  status: string;
  provider: string;
  paidAt?: string | null;
}

export interface BookingDetail {
  id: string;
  vehicleId: string;
  pickupLocation: string;
  startDate: string;
  endDate: string;
  dailyRate: number;
  totalAmount: number;
  platformFee: number;
  platformFeeRate: number;
  status: string;
  createdAt: string;
  vehicle: BookingVehicle;
  renter?: { companyName: string };
  driver?: { user?: { name?: string }; licenseNumber?: string } | null;
  payment?: BookingPayment | null;
}

export async function createBooking(
  body: {
    vehicleId: string;
    pickupLocation: string;
    startDate: string;
    endDate: string;
    driverId?: string;
  },
  token: string,
) {
  return apiFetch<ApiResponse<BookingDetail>>(`/bookings`, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getBooking(id: string, token: string) {
  return apiFetch<ApiResponse<BookingDetail>>(`/bookings/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

export async function getMyBookings(token: string) {
  return apiFetch<ApiResponse<BookingDetail[]>>(`/bookings`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

export async function createPayment(
  bookingId: string,
  provider: string,
  providerRef: string,
  token: string,
) {
  return apiFetch<ApiResponse<{ id: string; status: string }>>(`/payments/${bookingId}`, {
    method: 'POST',
    body: JSON.stringify({ provider, providerRef }),
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function confirmPayment(bookingId: string, token: string) {
  return apiFetch<ApiResponse<{ status: string }>>(`/payments/${bookingId}/confirm`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
  });
}
