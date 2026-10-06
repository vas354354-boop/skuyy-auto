import { create } from 'zustand';
import { vehicleService } from '../services/api';

export type VehicleStatus = 'AVAILABLE' | 'BOOKED' | 'SOLD' | 'TITIP JUAL';

export interface VehicleImage {
  id: string;
  image_url: string;
  is_cover: boolean;
  sort_order: number;
}

export interface Vehicle {
  id: string;
  type: 'Mobil' | 'Motor';
  brand: string;
  model: string;
  variant: string;
  year: number;
  price: number;
  mileage: number;
  transmission: string;
  fuel: string;
  engine_capacity: number;
  color: string;
  plate: string;
  tax_status: string;
  location: string;
  description: string;
  status: VehicleStatus;
  is_featured: boolean;
  vehicle_images?: VehicleImage[];
  // Dihitung dari vehicle_images (urut sesuai sort_order, pertama = cover)
  images: string[];
}

// Data yang dikirim ke API saat tambah/ubah unit
export type VehicleInput = Partial<Omit<Vehicle, 'id' | 'vehicle_images'>>;

export function normalizeVehicle(raw: unknown): Vehicle {
  const v = raw as Vehicle;
  const images = [...(v.vehicle_images ?? [])].sort((a, b) => a.sort_order - b.sort_order).map((i) => i.image_url);
  return {
    ...v,
    variant: v.variant ?? '',
    transmission: v.transmission ?? '',
    fuel: v.fuel ?? '',
    color: v.color ?? '',
    plate: v.plate ?? '',
    tax_status: v.tax_status ?? '',
    description: v.description ?? '',
    engine_capacity: v.engine_capacity ?? 0,
    price: Number(v.price),
    images,
  };
}

interface VehicleStore {
  vehicles: Vehicle[];
  isLoading: boolean;
  hasLoaded: boolean;
  error: string | null;
  fetchVehicles: () => Promise<void>;
  addVehicle: (vehicle: VehicleInput) => Promise<Vehicle>;
  updateVehicle: (id: string, vehicle: VehicleInput) => Promise<Vehicle>;
  updateStatus: (id: string, status: VehicleStatus) => Promise<void>;
  deleteVehicle: (id: string) => Promise<void>;
}

let inflight: Promise<void> | null = null;
const message = (e: unknown) => (e instanceof Error ? e.message : 'Terjadi kesalahan');

export const useVehicleStore = create<VehicleStore>((set) => ({
  vehicles: [],
  isLoading: false,
  hasLoaded: false,
  error: null,

  // Selalu ambil data terbaru; spinner hanya muncul jika belum ada data sama sekali
  fetchVehicles: () => {
    if (inflight) return inflight;
    set((s) => ({ isLoading: !s.hasLoaded, error: null }));
    inflight = vehicleService
      .getAll()
      .then((res) => set({ vehicles: res.data.map(normalizeVehicle), isLoading: false, hasLoaded: true }))
      .catch((e) => set({ error: message(e), isLoading: false }))
      .finally(() => { inflight = null; });
    return inflight;
  },

  addVehicle: async (data) => {
    const res = await vehicleService.create(data);
    const vehicle = normalizeVehicle(res.data);
    set((s) => ({ vehicles: [vehicle, ...s.vehicles] }));
    return vehicle;
  },

  updateVehicle: async (id, data) => {
    const res = await vehicleService.update(id, data);
    const vehicle = normalizeVehicle(res.data);
    set((s) => ({ vehicles: s.vehicles.map((v) => (v.id === id ? vehicle : v)) }));
    return vehicle;
  },

  updateStatus: async (id, status) => {
    const res = await vehicleService.updateStatus(id, status);
    const vehicle = normalizeVehicle(res.data);
    set((s) => ({ vehicles: s.vehicles.map((v) => (v.id === id ? vehicle : v)) }));
  },

  deleteVehicle: async (id) => {
    await vehicleService.delete(id);
    set((s) => ({ vehicles: s.vehicles.filter((v) => v.id !== id) }));
  },
}));
