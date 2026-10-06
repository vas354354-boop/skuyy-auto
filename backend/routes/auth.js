import express from 'express';
import { config } from '../config.js';
import { asyncHandler, HttpError, rateLimit } from '../lib/http.js';
import { requireAdmin, safeEqual, signToken } from '../middleware/auth.js';

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Terlalu banyak percobaan login. Coba lagi dalam 15 menit.',
});

// POST /api/auth/login — hanya kredensial admin dari .env yang diterima
router.post('/login', loginLimiter, asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};
  const { admin } = config;

  if (!admin.email || !admin.password) {
    throw new HttpError(503, 'Admin belum dikonfigurasi. Isi ADMIN_EMAIL dan ADMIN_PASSWORD di backend/.env.');
  }

  const valid = typeof email === 'string' && typeof password === 'string'
    && safeEqual(email.trim().toLowerCase(), admin.email.toLowerCase())
    && safeEqual(password, admin.password);

  if (!valid) throw new HttpError(401, 'Email atau password salah');

  const user = { id: 'admin', email: admin.email, role: 'admin', name: admin.name };
  res.json({ success: true, user, token: signToken(user) });
}));

// GET /api/auth/me — validasi token yang tersimpan di browser
router.get('/me', requireAdmin, (req, res) => {
  const { id, email, role, name } = req.user;
  res.json({ success: true, user: { id, email, role, name } });
});

// Token bersifat stateless; logout cukup menghapus token di sisi klien.
router.post('/logout', (_req, res) => res.json({ success: true, message: 'Logout berhasil' }));

export default router;
