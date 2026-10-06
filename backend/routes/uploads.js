import express from 'express';
import multer from 'multer';
import { asyncHandler, HttpError, rateLimit } from '../lib/http.js';
import { ALLOWED_MIME, saveImage } from '../lib/storage.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

const upload = (maxFiles) => multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: maxFiles },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME.includes(file.mimetype)) return cb(new HttpError(400, 'Hanya file gambar (JPG, PNG, WEBP, GIF) yang diperbolehkan'));
    cb(null, true);
  },
}).array('files', maxFiles);

const handle = (kind, maxFiles) => asyncHandler(async (req, res) => {
  if (!req.files?.length) throw new HttpError(400, 'Tidak ada file yang diunggah');
  const urls = await Promise.all(req.files.map((f) => saveImage(f, kind, req)));
  res.status(201).json({ success: true, urls });
});

// Admin: foto unit (maks 10 file/permintaan, 5 MB per file)
router.post('/vehicles', requireAdmin, upload(10), handle('vehicles'));

// Publik: foto pengajuan titip jual (maks 6 file, dibatasi per IP)
router.post('/consignment', rateLimit({ windowMs: 60 * 60 * 1000, max: 15, message: 'Terlalu banyak upload. Coba lagi nanti.' }), upload(6), handle('consignment'));

export default router;
