import { clearSession, getToken } from './session';
import type { AdminUser } from './session';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

export class ApiError extends Error {
  status: number;
  constructor(message: string, status = 0) {
    super(message);
    this.status = status;
  }
}

async function request<T = unknown>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  const isForm = options.body instanceof FormData;
  if (options.body && !isForm && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');

  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  let res: Response;
  try {
    res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
  } catch {
    throw new ApiError('Tidak dapat terhubung ke server. Pastikan backend sudah berjalan.');
  }

  let json: { error?: string } & Record<string, unknown> = {};
  try {
    json = await res.json();
  } catch {
    if (res.ok) throw new ApiError('Respons server bukan JSON. Periksa VITE_API_URL (harus berakhiran /api).', res.status);
  }

  if (!res.ok) {
    // Sesi admin habis -> kembali ke halaman login
    if (res.status === 401 && token && !endpoint.startsWith('/auth/login')) {
      clearSession();
      if (location.pathname.startsWith('/admin') && location.pathname !== '/admin/login') location.replace('/admin/login');
    }
    throw new ApiError(json.error || `Server error (${res.status})`, res.status);
  }
  return json as T;
}

const body = (data: object) => JSON.stringify(data);

// ===== Types =====
export interface Envelope<T> { success: boolean; data: T }

export interface ConsignmentRequest {
  id: string;
  name: string;
  whatsapp: string;
  vehicle_type: 'Mobil' | 'Motor';
  brand: string;
  model: string;
  year: number;
  mileage: number;
  color: string;
  plate: string;
  expected_price: number;
  location: string;
  description: string | null;
  images: string[];
  status: ConsignmentStatus;
  created_at: string;
}

export const CONSIGNMENT_STATUSES = ['PENGAJUAN', 'VERIFIKASI', 'DISETUJUI', 'AKTIF', 'BOOKED', 'TERJUAL', 'SELESAI'] as const;
export type ConsignmentStatus = (typeof CONSIGNMENT_STATUSES)[number];

export interface Lead {
  id: string;
  vehicle_id: string | null;
  message: string | null;
  status: 'BARU' | 'DIPROSES';
  created_at: string;
  vehicles: { brand: string; model: string; variant: string | null; year: number } | null;
}

export interface Stats {
  vehicles: { total: number; available: number; booked: number; sold: number; titip_jual: number; featured: number };
  consignment: { total: number; pending: number };
  leads: { total: number; new: number };
}

// ===== VEHICLES =====
export const vehicleService = {
  getAll: (params?: Record<string, string>) => request<Envelope<unknown[]>>(`/vehicles${params ? '?' + new URLSearchParams(params) : ''}`),
  getById: (id: string) => request<Envelope<unknown>>(`/vehicles/${encodeURIComponent(id)}`),
  create: (data: object) => request<Envelope<unknown>>('/vehicles', { method: 'POST', body: body(data) }),
  update: (id: string, data: object) => request<Envelope<unknown>>(`/vehicles/${id}`, { method: 'PUT', body: body(data) }),
  updateStatus: (id: string, status: string) => request<Envelope<unknown>>(`/vehicles/${id}/status`, { method: 'PATCH', body: body({ status }) }),
  delete: (id: string) => request(`/vehicles/${id}`, { method: 'DELETE' }),
};

// ===== AUTH =====
export const authService = {
  login: (email: string, password: string) =>
    request<{ token: string; user: AdminUser }>('/auth/login', { method: 'POST', body: body({ email, password }) }),
  me: () => request<{ user: AdminUser }>('/auth/me'),
  logout: () => request('/auth/logout', { method: 'POST' }).catch(() => undefined),
};

// ===== CONSIGNMENT (TITIP JUAL) =====
export const consignmentService = {
  getAll: (status?: string) => request<Envelope<ConsignmentRequest[]>>(`/consignment${status ? `?status=${status}` : ''}`),
  create: (data: object) => request<Envelope<{ id: string }>>('/consignment', { method: 'POST', body: body(data) }),
  updateStatus: (id: string, status: string) => request<Envelope<ConsignmentRequest>>(`/consignment/${id}/status`, { method: 'PATCH', body: body({ status }) }),
};

// ===== WHATSAPP LEADS =====
export const leadsService = {
  getAll: () => request<Envelope<Lead[]>>('/leads'),
  create: (data: object) => request('/leads', { method: 'POST', body: body(data), keepalive: true }),
  updateStatus: (id: string, status: Lead['status']) => request<Envelope<Lead>>(`/leads/${id}/status`, { method: 'PATCH', body: body({ status }) }),
};

// ===== STATS =====
export const statsService = {
  get: () => request<Envelope<Stats>>('/stats'),
};

// ===== UPLOAD GAMBAR =====
const upload = async (path: string, files: File[]) => {
  const form = new FormData();
  files.forEach((f) => form.append('files', f));
  const res = await request<{ urls: string[] }>(path, { method: 'POST', body: form });
  return res.urls;
};

export const uploadService = {
  vehicleImages: (files: File[]) => upload('/uploads/vehicles', files),
  consignmentImages: (files: File[]) => upload('/uploads/consignment', files),
};