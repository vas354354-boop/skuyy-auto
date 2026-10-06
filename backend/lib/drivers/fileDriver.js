// Driver database lokal berbasis file JSON — dipakai otomatis jika Supabase belum dikonfigurasi.
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { config } from '../../config.js';
import { seedVehicles } from '../seed.js';

const FILE = path.join(config.dataDir, 'db.json');
const now = () => new Date().toISOString();
const uid = () => crypto.randomUUID();

let cache = null;
let queue = Promise.resolve();

function buildSeed() {
  const db = { vehicles: [], vehicle_images: [], consignment_requests: [], whatsapp_leads: [] };
  seedVehicles.forEach((v, i) => {
    const { images, ...vehicle } = v;
    const id = uid();
    const created = new Date(Date.now() - i * 3600_000).toISOString();
    db.vehicles.push({ id, ...vehicle, created_at: created, updated_at: created });
    images.forEach((url, idx) => db.vehicle_images.push({ id: uid(), vehicle_id: id, image_url: url, is_cover: idx === 0, sort_order: idx }));
  });
  return db;
}

async function load() {
  if (cache) return cache;
  await fs.mkdir(config.dataDir, { recursive: true });
  try {
    cache = JSON.parse(await fs.readFile(FILE, 'utf8'));
  } catch {
    cache = buildSeed();
    await fs.writeFile(FILE, JSON.stringify(cache, null, 2));
  }
  return cache;
}

// Semua penulisan diserialisasi agar file tidak rusak saat request bersamaan
function persist() {
  const snapshot = JSON.stringify(cache, null, 2);
  queue = queue.then(() => fs.writeFile(FILE, snapshot)).catch((e) => console.error('Gagal menyimpan db.json:', e.message));
  return queue;
}

const withImages = (db, v) => ({
  ...v,
  vehicle_images: db.vehicle_images
    .filter((i) => i.vehicle_id === v.id)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(({ id, image_url, is_cover, sort_order }) => ({ id, image_url, is_cover, sort_order })),
});

const byNewest = (a, b) => new Date(b.created_at) - new Date(a.created_at);

function setImages(db, vehicleId, urls) {
  db.vehicle_images = db.vehicle_images.filter((i) => i.vehicle_id !== vehicleId);
  urls.forEach((url, idx) => db.vehicle_images.push({ id: uid(), vehicle_id: vehicleId, image_url: url, is_cover: idx === 0, sort_order: idx }));
}

export const fileDriver = {
  name: 'file',

  vehicles: {
    async list(f = {}) {
      const db = await load();
      const q = f.search?.toLowerCase();
      return db.vehicles
        .filter((v) => (!f.type || v.type === f.type)
          && (!f.status || v.status === f.status)
          && (!f.brand || v.brand.toLowerCase().includes(f.brand.toLowerCase()))
          && (!f.transmission || v.transmission === f.transmission)
          && (!f.fuel || v.fuel === f.fuel)
          && (f.min_price == null || v.price >= f.min_price)
          && (f.max_price == null || v.price <= f.max_price)
          && (!q || [v.brand, v.model, v.variant].some((s) => s?.toLowerCase().includes(q))))
        .sort(byNewest)
        .map((v) => withImages(db, v));
    },
    async featured() {
      const db = await load();
      return db.vehicles.filter((v) => v.is_featured && v.status === 'AVAILABLE').sort(byNewest).slice(0, 8).map((v) => withImages(db, v));
    },
    async get(id) {
      const db = await load();
      const v = db.vehicles.find((x) => x.id === id);
      return v ? withImages(db, v) : null;
    },
    async create(data, images = []) {
      const db = await load();
      const vehicle = { id: uid(), status: 'AVAILABLE', is_featured: false, ...data, created_at: now(), updated_at: now() };
      db.vehicles.push(vehicle);
      setImages(db, vehicle.id, images);
      await persist();
      return withImages(db, vehicle);
    },
    async update(id, data, images) {
      const db = await load();
      const v = db.vehicles.find((x) => x.id === id);
      if (!v) return null;
      Object.assign(v, data, { updated_at: now() });
      if (images !== undefined) setImages(db, id, images);
      await persist();
      return withImages(db, v);
    },
    async remove(id) {
      const db = await load();
      const before = db.vehicles.length;
      db.vehicles = db.vehicles.filter((v) => v.id !== id);
      db.vehicle_images = db.vehicle_images.filter((i) => i.vehicle_id !== id);
      db.whatsapp_leads.forEach((l) => { if (l.vehicle_id === id) l.vehicle_id = null; });
      await persist();
      return db.vehicles.length < before;
    },
  },

  consignment: {
    async list(status) {
      const db = await load();
      return db.consignment_requests.filter((r) => !status || r.status === status).sort(byNewest);
    },
    async get(id) {
      const db = await load();
      return db.consignment_requests.find((r) => r.id === id) || null;
    },
    async create(data) {
      const db = await load();
      const row = { id: uid(), user_id: null, status: 'PENGAJUAN', ...data, created_at: now(), updated_at: now() };
      db.consignment_requests.push(row);
      await persist();
      return row;
    },
    async setStatus(id, status) {
      const db = await load();
      const row = db.consignment_requests.find((r) => r.id === id);
      if (!row) return null;
      Object.assign(row, { status, updated_at: now() });
      await persist();
      return row;
    },
  },

  leads: {
    async list() {
      const db = await load();
      return db.whatsapp_leads.sort(byNewest).map((l) => {
        const v = db.vehicles.find((x) => x.id === l.vehicle_id);
        return { ...l, vehicles: v ? { brand: v.brand, model: v.model, variant: v.variant, year: v.year } : null };
      });
    },
    async create(data) {
      const db = await load();
      if (data.vehicle_id && !db.vehicles.some((v) => v.id === data.vehicle_id)) data = { ...data, vehicle_id: null };
      const row = { id: uid(), user_id: null, status: 'BARU', ...data, created_at: now() };
      db.whatsapp_leads.push(row);
      await persist();
      return row;
    },
    async setStatus(id, status) {
      const db = await load();
      const row = db.whatsapp_leads.find((l) => l.id === id);
      if (!row) return null;
      row.status = status;
      await persist();
      return row;
    },
  },

  async stats() {
    const db = await load();
    return computeStats(db.vehicles, db.consignment_requests, db.whatsapp_leads);
  },
};

export function computeStats(vehicles, consignments, leads) {
  const count = (list, fn) => list.filter(fn).length;
  return {
    vehicles: {
      total: vehicles.length,
      available: count(vehicles, (v) => v.status === 'AVAILABLE'),
      booked: count(vehicles, (v) => v.status === 'BOOKED'),
      sold: count(vehicles, (v) => v.status === 'SOLD'),
      titip_jual: count(vehicles, (v) => v.status === 'TITIP JUAL'),
      featured: count(vehicles, (v) => v.is_featured),
    },
    consignment: { total: consignments.length, pending: count(consignments, (r) => r.status === 'PENGAJUAN') },
    leads: { total: leads.length, new: count(leads, (l) => l.status === 'BARU') },
  };
}
