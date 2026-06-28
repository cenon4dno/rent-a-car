// Shared API client for React Native — mirrors apps/web/lib/api.ts types

const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(err.message ?? `API error ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  plateNumber: string;
  fuelType: string;
  transmission: string;
  seatingCapacity: number;
  dailyRate: number;
  mileageLimit: number | null;
  imageUrls: string[];
  status: string;
  renter: { companyName: string; trustBadge: string };
  avgRating?: number;
  reviewCount?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface BookingDetail {
  id: string;
  vehicleId: string;
  startDate: string;
  endDate: string;
  pickupLocation: string;
  dailyRate: number;
  addonsAmount: number;
  totalAmount: number;
  platformFee: number;
  status: string;
  createdAt: string;
  vehicle: { make: string; model: string; year: number; imageUrls: string[] };
  renter?: { companyName: string };
  payment?: { status: string; provider: string } | null;
}

export function searchVehicles(params: {
  location?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined) q.set(k, String(v));
  });
  return apiFetch<PaginatedResponse<Vehicle>>(`/vehicles?${q.toString()}`);
}

export function getVehicle(id: string) {
  return apiFetch<ApiResponse<Vehicle>>(`/vehicles/${id}`);
}

export function getMyBookings(token: string) {
  return apiFetch<ApiResponse<BookingDetail[]>>(`/bookings`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function getBooking(id: string, token: string) {
  return apiFetch<ApiResponse<BookingDetail>>(`/bookings/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function createBooking(
  body: {
    vehicleId: string;
    pickupLocation: string;
    startDate: string;
    endDate: string;
    childSeat?: boolean;
    chauffeur?: boolean;
  },
  token: string,
) {
  return apiFetch<ApiResponse<BookingDetail>>(`/bookings`, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function initiatePayment(bookingId: string, paymentMethod: string, token: string) {
  return apiFetch<
    ApiResponse<{ checkoutUrl: string | null; directConfirm: boolean; bookingId: string }>
  >(`/payments/${bookingId}/initiate`, {
    method: 'POST',
    body: JSON.stringify({ paymentMethod }),
    headers: { Authorization: `Bearer ${token}` },
  });
}
