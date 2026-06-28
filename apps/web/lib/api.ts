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

export async function initiatePayment(
  bookingId: string,
  paymentMethod: string,
  token: string,
): Promise<ApiResponse<{ checkoutUrl: string | null; directConfirm: boolean; bookingId: string }>> {
  return apiFetch(`/payments/${bookingId}/initiate`, {
    method: 'POST',
    body: JSON.stringify({ paymentMethod }),
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ─── Booking actions ──────────────────────────────────────────────────────────

function bookingAction(id: string, action: string, token: string) {
  return apiFetch<ApiResponse<BookingDetail>>(`/bookings/${id}/${action}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
  });
}

export const confirmBooking = (id: string, token: string) => bookingAction(id, 'confirm', token);
export const cancelBooking = (id: string, token: string) => bookingAction(id, 'cancel', token);
export const completeBooking = (id: string, token: string) => bookingAction(id, 'complete', token);

// ─── Vehicle management (RENTER) ─────────────────────────────────────────────

export interface RenterVehicle extends VehicleWithRenter {
  description?: string | null;
  mileageLimit?: number | null;
  bookings: { id: string; status: string; startDate: string; endDate: string }[];
  _count: { reviews: number };
}

export interface CreateVehicleBody {
  make: string;
  model: string;
  year: number;
  plateNumber: string;
  description?: string;
  fuelType: string;
  transmission: string;
  seatingCapacity: number;
  dailyRate: number;
  mileageLimit?: number;
  imageUrls?: string[];
}

export async function getMyVehicles(token: string) {
  return apiFetch<ApiResponse<RenterVehicle[]>>(`/vehicles/my`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

export async function createVehicle(body: CreateVehicleBody, token: string) {
  return apiFetch<ApiResponse<RenterVehicle>>(`/vehicles`, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function updateVehicle(
  id: string,
  body: Partial<CreateVehicleBody> & { status?: string },
  token: string,
) {
  return apiFetch<ApiResponse<RenterVehicle>>(`/vehicles/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function deleteVehicle(id: string, token: string) {
  return apiFetch<ApiResponse<RenterVehicle>>(`/vehicles/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export interface AdminStats {
  users: Record<string, number>;
  vehicles: Record<string, number>;
  bookings: Record<string, number>;
  gmv: { total: number; mtd: number };
  commission: { total: number; mtd: number };
  recentBookings: Array<{
    id: string;
    status: string;
    totalAmount: number;
    createdAt: string;
    vehicle: { make: string; model: string };
    renter: { companyName: string };
  }>;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  kycStatus: string;
  createdAt: string;
  renterProfile?: {
    id: string;
    companyName: string;
    trustBadge: string;
    commissionRate: number;
  } | null;
}

export interface AdminRenter {
  id: string;
  companyName: string;
  trustBadge: string;
  commissionRate: number;
  user: { id: string; name: string; email: string; kycStatus: string };
}

function adminFetch<T>(path: string, token: string, options?: RequestInit) {
  return apiFetch<ApiResponse<T>>(`/admin${path}`, {
    ...options,
    headers: { Authorization: `Bearer ${token}`, ...options?.headers },
    cache: 'no-store',
  });
}

export const getAdminStats = (token: string) => adminFetch<AdminStats>('/stats', token);

export const getAdminUsers = (token: string) => adminFetch<AdminUser[]>('/users', token);

export const getAdminRenters = (token: string) => adminFetch<AdminRenter[]>('/renters', token);

export async function updateUserKyc(userId: string, kycStatus: string, token: string) {
  return adminFetch<AdminUser>(`/users/${userId}/kyc`, token, {
    method: 'PATCH',
    body: JSON.stringify({ kycStatus }),
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function updateRenterCommission(
  renterId: string,
  commissionRate: number,
  token: string,
) {
  return adminFetch<AdminRenter>(`/renters/${renterId}/commission`, token, {
    method: 'PATCH',
    body: JSON.stringify({ commissionRate }),
    headers: { 'Content-Type': 'application/json' },
  });
}

// ─── User profile / KYC ──────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: string;
  kycStatus: string;
  customerProfile: {
    licenseUrl: string | null;
    secondaryIdUrl: string | null;
    kycStatus: string;
  } | null;
  renterProfile: {
    companyName: string;
    businessPermitUrl: string | null;
    companyRegUrl: string | null;
    taxIdNumber: string | null;
    trustBadge: string;
  } | null;
}

export async function getMe(token: string) {
  return apiFetch<ApiResponse<UserProfile>>(`/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

export async function uploadDocument(
  type: string,
  file: File,
  token: string,
): Promise<{ data: { fileUrl: string } }> {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/documents/${type}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? 'Upload failed');
  }
  return res.json() as Promise<{ data: { fileUrl: string } }>;
}
