import { HttpError } from './http.js'

export const VEHICLE_TYPES = ['Mobil', 'Motor']
export const VEHICLE_STATUSES = ['AVAILABLE', 'BOOKED', 'SOLD', 'TITIP JUAL']
export const CONSIGNMENT_STATUSES = ['PENGAJUAN', 'VERIFIKASI', 'DISETUJUI', 'AKTIF', 'BOOKED', 'TERJUAL', 'SELESAI']
export const LEAD_STATUSES = ['BARU', 'DIPROSES']

const str = (v, max = 255) => (typeof v === 'string' ? v.trim().slice(0, max) : '')
const optStr = (v, max = 255) => {
  const s = str(v, max)
  return s === '' ? null : s
}
const int = (v) => {
  const n = Number(v)
  return Number.isFinite(n) ? Math.round(n) : NaN
}

const fail = (msg) => {
  throw new HttpError(400, msg)
}

const isUrl = (u) => typeof u === 'string' && /^(https?:\/\/|\/uploads\/)/.test(u)

export function parseImages(input) {
  if (input === undefined) return undefined
  if (!Array.isArray(input)) fail('images harus berupa array URL')
  const urls = input.map((u) => (typeof u === 'string' ? u.trim() : '')).filter(Boolean)
  if (urls.some((u) => !isUrl(u))) fail('Semua gambar harus berupa URL http(s) hasil upload')
  if (urls.length > 12) fail('Maksimal 12 gambar')
  return urls
}

export function parseVehicle(body = {}, { partial = false } = {}) {
  const out = {}
  const has = (k) => body[k] !== undefined

  const requireStr = (key, label, max) => {
    if (!has(key)) {
      if (!partial) fail(`${label} wajib diisi`)
      return
    }
    const v = str(body[key], max)
    if (!v) fail(`${label} wajib diisi`)
    out[key] = v
  }
  const requireInt = (key, label, { min = 0, max = Number.MAX_SAFE_INTEGER } = {}) => {
    if (!has(key)) {
      if (!partial) fail(`${label} wajib diisi`)
      return
    }
    const n = int(body[key])
    if (Number.isNaN(n) || n < min || n > max) fail(`${label} tidak valid`)
    out[key] = n
  }

  if (has('type') || !partial) {
    if (!VEHICLE_TYPES.includes(body.type)) fail('Jenis kendaraan harus Mobil atau Motor')
    out.type = body.type
  }
  requireStr('brand', 'Merek', 255)
  requireStr('model', 'Model', 255)
  requireStr('location', 'Lokasi', 255)
  requireInt('year', 'Tahun', { min: 1950, max: new Date().getFullYear() + 1 })
  requireInt('price', 'Harga', { min: 0 })
  requireInt('mileage', 'Kilometer', { min: 0 })

  if (has('transmission')) out.transmission = str(body.transmission, 50)
  if (has('fuel')) out.fuel = str(body.fuel, 50)
  if (has('color')) out.color = str(body.color, 50)
  if (has('status')) {
    if (!VEHICLE_STATUSES.includes(body.status)) fail('Status kendaraan tidak valid')
    out.status = body.status
  }
  if (has('is_featured')) out.is_featured = Boolean(body.is_featured)

  return out
}

export function parseLead(body = {}) {
  const out = {}
  
  const name = str(body.name, 255)
  if (!name) throw new HttpError(400, 'Nama wajib diisi')
  out.name = name

  const phone = str(body.phone, 20)
  if (!phone) throw new HttpError(400, 'Nomor HP wajib diisi')
  out.phone = phone

  out.vehicle_id = body.vehicle_id || null
  out.message = optStr(body.message, 500)
  out.status = 'BARU'

  return out
}

export function parseConsignment(body = {}) {
  const out = {}
  
  const owner_name = str(body.owner_name, 255)
  if (!owner_name) throw new HttpError(400, 'Nama pemilik wajib diisi')
  out.owner_name = owner_name

  const owner_phone = str(body.owner_phone, 20)
  if (!owner_phone) throw new HttpError(400, 'Nomor HP wajib diisi')
  out.owner_phone = owner_phone

  out.vehicle_type = body.vehicle_type || 'Mobil'
  out.vehicle_brand = str(body.vehicle_brand, 255) || 'Unknown'
  out.vehicle_model = str(body.vehicle_model, 255) || 'Unknown'
  out.vehicle_year = int(body.vehicle_year) || new Date().getFullYear()
  out.vehicle_mileage = int(body.vehicle_mileage) || 0
  out.asking_price = int(body.asking_price) || 0
  out.images = parseImages(body.images) || []
  out.notes = optStr(body.notes, 500)
  out.status = 'PENGAJUAN'

  return out
}

export function parseStatus(status, validStatuses, label = 'Status') {
  if (!validStatuses.includes(status)) {
    throw new HttpError(400, `${label} harus salah satu: ${validStatuses.join(', ')}`)
  }
  return status
}
