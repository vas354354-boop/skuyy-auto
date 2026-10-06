import { HttpError } from './http.js';

export const VEHICLE_TYPES = ['Mobil', 'Motor'];
export const VEHICLE_STATUSES = ['AVAILABLE', 'BOOKED', 'SOLD', 'TITIP JUAL'];
export const CONSIGNMENT_STATUSES = ['PENGAJUAN', 'VERIFIKASI', 'DISETUJUI', 'AKTIF', 'BOOKED', 'TERJUAL', 'SELESAI'];
export const LEAD_STATUSES = ['BARU', 'DIPROSES'];

const str = (v, max = 255) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const optStr = (v, max = 255) => {
  const s = str(v, max);
  return s === '' ? null : s;
};
const int = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(n) : NaN;
};

const fail = (msg) => {
  throw new HttpError(400, msg);
};

const isUrl = (u) => typeof u === 'string' && /^(https?:\/\/|\/uploads\/)/i.test(u);

export function parseImages(input) {
  if (input === undefined) return undefined;
  if (!Array.isArray(input)) fail('images harus berupa array URL');
  const urls = input.map((u) => (typeof u === 'string' ? u.trim() : '')).filter(Boolean);
  if (urls.some((u) => !isUrl(u))) fail('Semua gambar harus berupa URL http(s) hasil upload');
  if (urls.length > 12) fail('Maksimal 12 gambar');
  return urls;
}

// partial = true untuk update (hanya field yang dikirim yang divalidasi)
export function parseVehicle(body = {}, { partial = false } = {}) {
  const out = {};
  const has = (k) => body[k] !== undefined;

  const requireStr = (key, label, max) => {
    if (!has(key)) {
      if (!partial) fail(`${label} wajib diisi`);
      return;
    }
    const v = str(body[key], max);
    if (!v) fail(`${label} wajib diisi`);
    out[key] = v;
  };
  const requireInt = (key, label, { min = 0, max = Number.MAX_SAFE_INTEGER } = {}) => {
    if (!has(key)) {
      if (!partial) fail(`${label} wajib diisi`);
      return;
    }
    const n = int(body[key]);
    if (Number.isNaN(n) || n < min || n > max) fail(`${label} tidak valid`);
    out[key] = n;
  };

  if (has('type') || !partial) {
    if (!VEHICLE_TYPES.includes(body.type)) fail('Jenis kendaraan harus Mobil atau Motor');
    out.type = body.type;
  }
  requireStr('brand', 'Merek', 255);
  requireStr('model', 'Model', 255);
  requireStr('location', 'Lokasi', 255);
  requireInt('year', 'Tahun', { min: 1950, max: new Date().getFullYear() + 1 });
  requireInt('price', 'Harga', { min: 0 });
  requireInt('mileage', 'Kilometer', { min: 0 });

  for (const [key, max] of [
    ['variant', 255], ['transmission', 100], ['fuel', 100], ['color', 100],
    ['plate', 50], ['tax_status', 255], ['description', 5000],
  ]) {
    if (has(key)) out[key] = optStr(body[key], max);
  }
  if (has('engine_capacity')) {
    const n = body.engine_capacity === '' || body.engine_capacity === null ? null : int(body.engine_capacity);
    if (Number.isNaN(n)) fail('Kapasitas mesin tidak valid');
    out.engine_capacity = n;
  }
  if (has('status')) {
    if (!VEHICLE_STATUSES.includes(body.status)) fail('Status kendaraan tidak valid');
    out.status = body.status;
  }
  if (has('is_featured')) out.is_featured = body.is_featured === true || body.is_featured === 'true';

  return out;
}

export function parseConsignment(body = {}) {
  const need = (key, label, max) => {
    const v = str(body[key], max);
    if (!v) fail(`${label} wajib diisi`);
    return v;
  };
  const needInt = (key, label, min = 0) => {
    const n = int(body[key]);
    if (Number.isNaN(n) || n < min) fail(`${label} tidak valid`);
    return n;
  };

  if (!VEHICLE_TYPES.includes(body.vehicle_type)) fail('Jenis kendaraan harus Mobil atau Motor');
  const whatsapp = need('whatsapp', 'Nomor WhatsApp', 30).replace(/[^\d+]/g, '');
  if (whatsapp.replace(/\D/g, '').length < 9) fail('Nomor WhatsApp tidak valid');

  return {
    name: need('name', 'Nama', 255),
    whatsapp,
    vehicle_type: body.vehicle_type,
    brand: need('brand', 'Merek', 255),
    model: need('model', 'Model', 255),
    year: (() => {
      const y = needInt('year', 'Tahun', 1950);
      if (y > new Date().getFullYear() + 1) fail('Tahun tidak valid');
      return y;
    })(),
    mileage: needInt('mileage', 'Kilometer'),
    color: need('color', 'Warna', 100),
    plate: need('plate', 'Nomor polisi', 50),
    expected_price: needInt('expected_price', 'Harga yang diharapkan', 1),
    location: need('location', 'Lokasi', 255),
    description: optStr(body.description, 5000),
    images: parseImages(body.images) ?? [],
  };
}

export function parseLead(body = {}) {
  const vehicle_id = optStr(body.vehicle_id, 64);
  return { vehicle_id, message: optStr(body.message, 1000) };
}

export function parseStatus(value, allowed, label = 'Status') {
  if (!allowed.includes(value)) fail(`${label} tidak valid`);
  return value;
}
