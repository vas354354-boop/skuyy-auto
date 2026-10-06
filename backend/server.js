import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'node:fs';
import { config } from './config.js';
import { supabaseStatus } from './lib/supabase.js';
import { db } from './lib/db.js';
import { HttpError } from './lib/http.js';
import vehiclesRouter from './routes/vehicles.js';
import authRouter from './routes/auth.js';
import consignmentRouter from './routes/consignment.js';
import leadsRouter from './routes/leads.js';
import statsRouter from './routes/stats.js';
import uploadsRouter from './routes/uploads.js';

const app = express();
app.set('trust proxy', 1);

app.use(cors({
  origin: config.corsOrigins || true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// File upload lokal (hanya dipakai saat Supabase belum aktif)
fs.mkdirSync(config.uploadDir, { recursive: true });
app.use('/uploads', express.static(config.uploadDir, { maxAge: '7d', index: false }));

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'OK',
    message: 'SKUYY AUTO Backend is running 🚀',
    database: { driver: db.name, configured: supabaseStatus.configured, status: supabaseStatus.message },
  });
});

app.use('/api/vehicles', vehiclesRouter);
app.use('/api/auth', authRouter);
app.use('/api/consignment', consignmentRouter);
app.use('/api/leads', leadsRouter);
app.use('/api/stats', statsRouter);
app.use('/api/uploads', uploadsRouter);

app.use('/api', (_req, _res, next) => next(new HttpError(404, 'Endpoint tidak ditemukan')));

// Error handler terpusat
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
  let status = err.status || err.statusCode || 500;
  let message = err.message || 'Terjadi kesalahan pada server';

  if (err instanceof multer.MulterError) {
    status = 400;
    message = err.code === 'LIMIT_FILE_SIZE' ? 'Ukuran gambar maksimal 5 MB per file'
      : err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_UNEXPECTED_FILE' ? 'Jumlah file melebihi batas'
      : 'Upload gagal';
  } else if (err.type === 'entity.parse.failed') {
    status = 400;
    message = 'Format JSON tidak valid';
  } else if (status >= 500) {
    console.error(`❌ ${req.method} ${req.originalUrl}:`, err);
    if (config.isProduction) message = 'Terjadi kesalahan pada server';
  }

  res.status(status).json({ success: false, error: message });
});

const server = app.listen(config.port, () => {
  console.log(`✅ SKUYY AUTO Backend berjalan di http://localhost:${config.port}`);
  console.log(`📦 Database: ${db.name} — ${supabaseStatus.message}`);
  if (!config.admin.email || !config.admin.password) console.warn('⚠️  ADMIN_EMAIL / ADMIN_PASSWORD belum diisi — login admin tidak bisa dipakai.');
  if (config.jwtSecretIsEphemeral) console.warn('⚠️  JWT_SECRET belum diisi — token dibuat acak dan akan hangus setiap server restart.');
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') console.error(`❌ Port ${config.port} sudah digunakan. Tutup proses lama lalu jalankan ulang backend.`);
  else console.error('❌ Server error:', error.message);
  process.exit(1);
});
