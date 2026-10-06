import express from 'express';
import { db } from '../lib/db.js';
import { asyncHandler } from '../lib/http.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET /api/stats — ringkasan dashboard admin
router.get('/', requireAdmin, asyncHandler(async (_req, res) => {
  res.json({ success: true, data: await db.stats() });
}));

export default router;
