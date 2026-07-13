export interface ApiResponse<T> {
  data: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BaseVehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  plateNumber: string;
  fuelType: string;
  transmission: string;
  seatingCapacity: number;
  dailyRate: number;
  mileageLimit?: number | null;
  status: string;
  vehiclePhotos?: string; // JSON-encoded { front, back, side, interior }
  registrationDocs?: string; // JSON-encoded { or, cr }
  createdAt: string;
  updatedAt: string;
}

export function parseVehiclePhotos(raw?: string | null): Partial<VehiclePhotos> {
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function getPrimaryImage(
  imageUrls?: string | null,
  vehiclePhotos?: string | null,
): string | undefined {
  const photos = parseVehiclePhotos(vehiclePhotos);
  if (photos.front) return photos.front;
  const urls = parseImageUrlsArr(imageUrls);
  return urls[0];
}

function parseImageUrlsArr(raw?: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

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

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}/api/v1${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
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
  lat?: number;
  lng?: number;
  fuelType?: string;
  transmission?: string;
  minSeats?: number;
  minPrice?: number;
  maxPrice?: number;
  tag?: string;
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

export interface TopRenter {
  id: string;
  companyName: string;
  trustBadge: string;
  fleetCount: number;
}

export async function getTopRenters(limit = 6) {
  return apiFetch<ApiResponse<TopRenter[]>>(`/vehicles/renters?limit=${limit}`);
}

export interface RenterFleetVehicle extends BaseVehicle {
  imageUrls: string;
  averageRating: number | null;
  _count: { reviews: number };
}

export interface RenterPublicProfile {
  id: string;
  companyName: string;
  trustBadge: string;
  fleetCount: number;
  averageRating: number | null;
  vehicles: RenterFleetVehicle[];
}

export async function getRenterProfile(id: string) {
  return apiFetch<ApiResponse<RenterPublicProfile>>(`/vehicles/renters/${id}`);
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
  customer?: { id: string; user?: { name?: string; email?: string } } | null;
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

export interface CardDetails {
  cardNumber: string;
  expMonth: number;
  expYear: number;
  cvc: string;
  cardHolder: string;
}

export async function initiatePayment(
  bookingId: string,
  paymentMethod: string,
  token: string,
  cardDetails?: CardDetails,
): Promise<ApiResponse<{ checkoutUrl: string | null; directConfirm: boolean; bookingId: string }>> {
  return apiFetch(`/payments/${bookingId}/initiate`, {
    method: 'POST',
    body: JSON.stringify({ paymentMethod, cardDetails }),
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

export interface VehiclePhotos {
  front: string;
  back: string;
  side: string;
  interior: string;
}

export interface RegistrationDocs {
  or: string;
  cr: string;
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
  vehiclePhotos?: Partial<VehiclePhotos>;
  registrationDocs?: Partial<RegistrationDocs>;
  tags?: string[];
  operatingLocation?: string;
  operatingLat?: number;
  operatingLng?: number;
}

export async function getMyVehicles(token: string) {
  return apiFetch<ApiResponse<RenterVehicle[]>>(`/vehicles/my`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

export interface FleetAnalytics {
  totalVehicles: number;
  activeVehicles: number;
  utilizationRate: number;
  topVehicles: Array<{
    id: string;
    make: string;
    model: string;
    year: number;
    revenue: number;
    completedBookings: number;
    totalBookings: number;
    reviewCount: number;
    currentlyBooked: boolean;
  }>;
  monthlyRevenue: Array<{ label: string; revenue: number }>;
  maintenanceForecast?: Array<{
    id: string;
    make: string;
    model: string;
    year: number;
    totalUseDays: number;
    daysUntilMaintenance: number;
    weeksUntilMaintenance: number | null;
    status: string;
    needsMaintenance: boolean;
  }>;
}

export async function getFleetAnalytics(token: string) {
  return apiFetch<ApiResponse<FleetAnalytics>>(`/vehicles/my/analytics`, {
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
  renterAcquisition?: Array<{ label: string; count: number }>;
  platformHealth?: { cancellationRate: number; totalBookings: number };
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
  customerProfile?: { id: string } | null;
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

// ─── Legal pages (CMS) ───────────────────────────────────────────────────────

export interface LegalPage {
  id: string;
  slug: string;
  title: string;
  content: string;
  updatedAt: string;
}

export async function getLegalPages() {
  return apiFetch<LegalPage[]>(`/legal`);
}

export async function getLegalPage(slug: string) {
  return apiFetch<LegalPage>(`/legal/${slug}`);
}

export async function upsertLegalPage(slug: string, title: string, content: string, token: string) {
  return adminFetch<LegalPage>(`/legal/${slug}`, token, {
    method: 'PATCH',
    body: JSON.stringify({ title, content }),
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function createLegalPage(slug: string, title: string, content: string, token: string) {
  return adminFetch<LegalPage>(`/legal`, token, {
    method: 'POST',
    body: JSON.stringify({ slug, title, content }),
    headers: { 'Content-Type': 'application/json' },
  });
}

// ─── User profile / KYC ──────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  role: string;
  kycStatus: string;
  hasPassword?: boolean;
  customerProfile: {
    licenseUrl: string | null;
    licenseBackUrl: string | null;
    secondaryIdUrl: string | null;
    kycStatus: string;
  } | null;
  renterProfile: {
    companyName: string;
    businessPermitUrl: string | null;
    companyRegUrl: string | null;
    taxIdNumber: string | null;
    bankAccountDetails: string | null;
    trustBadge: string;
  } | null;
  driverProfile: {
    licenseUrl: string | null;
    backgroundCheckUrl: string | null;
    kycStatus: string;
  } | null;
}

export interface UpdateMeInput {
  name?: string;
  phone?: string;
  companyName?: string;
  taxIdNumber?: string;
  bankAccountDetails?: string;
}

export async function updateMe(input: UpdateMeInput, token: string) {
  return apiFetch<ApiResponse<UserProfile>>(`/users/me`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(input),
  });
}

export async function changePassword(
  input: { currentPassword?: string; newPassword: string },
  token: string,
) {
  return apiFetch<ApiResponse<{ changed: boolean }>>(`/users/me/password`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(input),
  });
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

// ─── Drivers ─────────────────────────────────────────────────────────────────

export interface DriverPublicProfile {
  id: string;
  userId: string;
  name: string;
  avatarUrl: string | null;
  kycStatus: string;
  completedTrips: number;
}

export interface RenterDriver {
  id: string;
  userId: string;
  renterId: string;
  licenseUrl: string | null;
  backgroundCheckUrl: string | null;
  kycStatus: string;
  createdAt: string;
  user: { id: string; name: string; email: string; avatarUrl: string | null; kycStatus: string };
  _count: { bookings: number };
}

export async function getMyDrivers(token: string) {
  return apiFetch<ApiResponse<RenterDriver[]>>(`/drivers/my`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

export async function createDriver(
  body: { email: string; name: string; licenseUrl?: string; backgroundCheckUrl?: string },
  token: string,
) {
  return apiFetch<ApiResponse<RenterDriver>>(`/drivers`, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function deleteDriver(driverProfileId: string, token: string) {
  return apiFetch<ApiResponse<{ deleted: boolean }>>(`/drivers/${driverProfileId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getDriverPublicProfile(id: string) {
  return apiFetch<ApiResponse<DriverPublicProfile>>(`/drivers/${id}`);
}

// ─── Customer profile ────────────────────────────────────────────────────────

export interface CustomerProfileDetail {
  id: string;
  userId: string;
  kycStatus: string;
  licenseUrl: string | null;
  secondaryIdUrl: string | null;
  averageRating: number | null;
  user: { id: string; name: string; email: string; avatarUrl: string | null; kycStatus: string };
  bookings: Array<{
    id: string;
    status: string;
    startDate: string;
    endDate: string;
    totalAmount: number;
    vehicle: { make: string; model: string; year: number };
  }>;
  reviews: Array<{ id: string; rating: number; comment: string | null; createdAt: string }>;
  renterReviews: Array<{
    id: string;
    rating: number;
    comment: string | null;
    createdAt: string;
    renterId: string;
  }>;
}

export async function getCustomerProfile(customerProfileId: string, token: string) {
  return apiFetch<ApiResponse<CustomerProfileDetail>>(`/users/customers/${customerProfileId}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

// ─── Fleet demographics ───────────────────────────────────────────────────────

export interface CustomerDemographics {
  totalCustomers: number;
  repeatCustomers: number;
  newCustomers: number;
  repeatRate: number;
  kycBreakdown: Array<{ status: string; count: number }>;
  monthlyNewCustomers: Array<{ label: string; count: number }>;
  topCustomers: Array<{ customerId: string; bookings: number }>;
}

export async function getCustomerDemographics(token: string) {
  return apiFetch<ApiResponse<CustomerDemographics>>(`/vehicles/my/demographics`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

// ─── Chat ─────────────────────────────────────────────────────────────────────

export async function sendChatMessage(
  message: string,
  token?: string,
): Promise<{ data: { reply: string } }> {
  const path = token ? '/chat/auth' : '/chat';
  return apiFetch<{ data: { reply: string } }>(path, {
    method: 'POST',
    body: JSON.stringify({ message }),
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

// ─── Disputes ─────────────────────────────────────────────────────────────────

export interface Dispute {
  id: string;
  bookingId: string;
  reporterId: string;
  description: string;
  status: string;
  resolution: string | null;
  createdAt: string;
}

export async function createDispute(
  bookingId: string,
  description: string,
  token: string,
): Promise<ApiResponse<Dispute>> {
  return apiFetch<ApiResponse<Dispute>>('/disputes', {
    method: 'POST',
    body: JSON.stringify({ bookingId, description }),
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getDisputes(token: string): Promise<ApiResponse<Dispute[]>> {
  return apiFetch<ApiResponse<Dispute[]>>('/disputes', {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}
