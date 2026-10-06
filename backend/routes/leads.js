import express from 'express';
import { db } from '../lib/db.js';
import { asyncHandler, HttpError, rateLimit } from '../lib/http.js';
import { LEAD_STATUSES, parseLead, parseStatus } from '../lib/validate.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const leadLimiter = rateLimit({ windowMs: 60 * 1000, max: 20 });

// POST /api/leads — dicatat saat pengunjung klik tombol WhatsApp (publik)
router.post('/', leadLimiter, asyncHandler(async (req, res) => {
  const lead = parseLead(req.body);
  if (lead.vehicle_id && !UUID.test(lead.vehicle_id)) lead.vehicle_id = null;
  const data = await db.leads.create(lead);
  res.status(201).json({ success: true, data: { id: data.id } });
}));

// ===== Admin =====
router.get('/', requireAdmin, asyncHandler(async (_req, res) => {
  res.json({ success: true, data: await db.leads.list() });
}));

router.patch('/:id/status', requireAdmin, asyncHandler(async (req, res) => {
  const status = parseStatus(req.body?.status, LEAD_STATUSES);
  if (!UUID.test(req.params.id)) throw new HttpError(404, 'Lead tidak ditemukan');
  const data = await db.leads.setStatus(req.params.id, status);
  if (!data) throw new HttpError(404, 'Lead tidak ditemukan');
  res.json({ success: true, data });
}));

export default router;
