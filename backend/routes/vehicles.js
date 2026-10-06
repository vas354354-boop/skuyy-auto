import express from 'express';
import { db } from '../lib/db.js';
import { asyncHandler, HttpError } from '../lib/http.js';
import { parseImages, parseStatus, parseVehicle, VEHICLE_STATUSES, VEHICLE_TYPES } from '../lib/validate.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const idOr404 = (id) => {
  if (!UUID.test(id)) throw new HttpError(404, 'Kendaraan tidak ditemukan');
  return id;
};
const optNum = (v) => (v === undefined || v === '' || Number.isNaN(Number(v)) ? undefined : Number(v));

// GET /api/vehicles — katalog (publik) dengan filter opsional
router.get('/', asyncHandler(async (req, res) => {
  const { type, status, brand, transmission, fuel, search } = req.query;
  if (type && !VEHICLE_TYPES.includes(type)) throw new HttpError(400, 'Filter type tidak valid');
  if (status && !VEHICLE_STATUSES.includes(status)) throw new HttpError(400, 'Filter status tidak valid');

  const data = await db.vehicles.list({
    type, status, brand, transmission, fuel, search,
    min_price: optNum(req.query.min_price),
    max_price: optNum(req.query.max_price),
  });
  res.json({ success: true, data });
}));

router.get('/featured', asyncHandler(async (_req, res) => {
  res.json({ success: true, data: await db.vehicles.featured() });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const data = await db.vehicles.get(idOr404(req.params.id));
  if (!data) throw new HttpError(404, 'Kendaraan tidak ditemukan');
  res.json({ success: true, data });
}));

// ===== Admin =====
router.post('/', requireAdmin, asyncHandler(async (req, res) => {
  const data = parseVehicle(req.body);
  const images = parseImages(req.body.images) ?? [];
  const vehicle = await db.vehicles.create(data, images);
  res.status(201).json({ success: true, data: vehicle });
}));

router.put('/:id', requireAdmin, asyncHandler(async (req, res) => {
  const data = parseVehicle(req.body, { partial: true });
  const images = parseImages(req.body.images);
  const vehicle = await db.vehicles.update(idOr404(req.params.id), data, images);
  if (!vehicle) throw new HttpError(404, 'Kendaraan tidak ditemukan');
  res.json({ success: true, data: vehicle });
}));

router.patch('/:id/status', requireAdmin, asyncHandler(async (req, res) => {
  const status = parseStatus(req.body?.status, VEHICLE_STATUSES, 'Status kendaraan');
  const vehicle = await db.vehicles.update(idOr404(req.params.id), { status });
  if (!vehicle) throw new HttpError(404, 'Kendaraan tidak ditemukan');
  res.json({ success: true, data: vehicle });
}));

router.delete('/:id', requireAdmin, asyncHandler(async (req, res) => {
  const removed = await db.vehicles.remove(idOr404(req.params.id));
  if (!removed) throw new HttpError(404, 'Kendaraan tidak ditemukan');
  res.json({ success: true, message: 'Kendaraan berhasil dihapus' });
}));

export default router;
