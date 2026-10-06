import express from 'express';
import { db } from '../lib/db.js';
import { asyncHandler, HttpError, rateLimit } from '../lib/http.js';
import { CONSIGNMENT_STATUSES, parseConsignment, parseStatus } from '../lib/validate.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const idOr404 = (id) => {
  if (!UUID.test(id)) throw new HttpError(404, 'Pengajuan tidak ditemukan');
  return id;
};

const submitLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 10, message: 'Terlalu banyak pengajuan dari perangkat ini. Coba lagi nanti.' });

// POST /api/consignment — pengajuan titip jual dari website (publik)
router.post('/', submitLimiter, asyncHandler(async (req, res) => {
  const data = await db.consignment.create(parseConsignment(req.body));
  res.status(201).json({ success: true, data: { id: data.id, status: data.status } });
}));

// ===== Admin =====
router.get('/', requireAdmin, asyncHandler(async (req, res) => {
  const { status } = req.query;
  if (status) parseStatus(status, CONSIGNMENT_STATUSES);
  res.json({ success: true, data: await db.consignment.list(status) });
}));

router.get('/:id', requireAdmin, asyncHandler(async (req, res) => {
  const data = await db.consignment.get(idOr404(req.params.id));
  if (!data) throw new HttpError(404, 'Pengajuan tidak ditemukan');
  res.json({ success: true, data });
}));

router.patch('/:id/status', requireAdmin, asyncHandler(async (req, res) => {
  const status = parseStatus(req.body?.status, CONSIGNMENT_STATUSES);
  const data = await db.consignment.setStatus(idOr404(req.params.id), status);
  if (!data) throw new HttpError(404, 'Pengajuan tidak ditemukan');
  res.json({ success: true, data });
}));

export default router;
