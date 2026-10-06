import crypto from 'node:crypto';
import { config } from '../config.js';
import { HttpError } from '../lib/http.js';

const b64 = (buf) => Buffer.from(buf).toString('base64url');
const sign = (data) => crypto.createHmac('sha256', config.jwtSecret).update(data).digest('base64url');

const TOKEN_TTL_MS = 1000 * 60 * 60 * 12; // 12 jam

export function signToken(user) {
  const payload = b64(JSON.stringify({ ...user, exp: Date.now() + TOKEN_TTL_MS }));
  return `${payload}.${sign(payload)}`;
}

export function verifyToken(token) {
  if (typeof token !== 'string' || !token.includes('.')) return null;
  const [payload, sig] = token.split('.');
  const expected = sign(payload);
  const a = Buffer.from(sig || '');
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!data.exp || data.exp < Date.now()) return null;
    return data;
  } catch {
    return null;
  }
}

export function safeEqual(a = '', b = '') {
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

export function requireAdmin(req, _res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  const user = verifyToken(token);
  if (!user || user.role !== 'admin') {
    return next(new HttpError(401, 'Sesi admin tidak valid atau sudah berakhir. Silakan login ulang.'));
  }
  req.user = user;
  next();
}
