import type { ApiResponse, PaginatedResponse, BaseVehicle } from '@rent-a-car/shared';

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
  return apiFetch<ApiResponse<PaginatedResponse<BaseVehicle>>>(`/vehicles${qs ? `?${qs}` : ''}`);
}

export async function getVehicle(id: string) {
  return apiFetch<ApiResponse<BaseVehicle>>(`/vehicles/${id}`);
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
  return apiFetch(`/bookings`, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getMyBookings(token: string) {
  return apiFetch(`/bookings`, { headers: { Authorization: `Bearer ${token}` } });
}
