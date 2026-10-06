# SKUYY AUTO

Aplikasi digital showroom mobil & motor (Lucky MotorCars 13): katalog publik, form titip jual, pencatatan lead WhatsApp, dan panel admin.

## Arsitektur

| Bagian   | Teknologi                                    | Folder      |
|----------|----------------------------------------------|-------------|
| Frontend | React 19 + Vite + Tailwind v4 + Zustand      | `frontend/` |
| Backend  | Node.js + Express (REST API `/api/*`)        | `backend/`  |
| Database | Supabase (PostgreSQL + Storage) **atau** file JSON lokal | `database.sql`, `backend/data/` |

Frontend **hanya** berbicara ke backend. Backend memilih database otomatis:
- **Supabase** jika `SUPABASE_URL` & `SUPABASE_SERVICE_KEY` di `backend/.env` sudah diisi.
- **Database lokal** (`backend/data/db.json`, terisi data contoh) jika belum — langsung jalan tanpa setup apa pun.

## Menjalankan

```bash
npm run install:all   # sekali saja
npm run dev           # backend (:5000) + frontend (:5173) sekaligus
```

Atau terpisah: `npm run dev:backend` dan `npm run dev:frontend`.

Buka http://localhost:5173 — panel admin di http://localhost:5173/admin/login

## Konfigurasi (`backend/.env`, contoh di `backend/.env.example`)

| Variabel | Fungsi |
|---|---|
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Kredensial login admin. **Ganti password default sebelum production.** |
| `JWT_SECRET` | String acak panjang untuk menandatangani token login (`openssl rand -hex 32`). |
| `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` | Isi untuk memakai Supabase (gunakan **service_role key**, simpan rahasia). |
| `CORS_ORIGIN` | Opsional, daftar origin frontend dipisah koma (wajib diisi di production). |
| `PUBLIC_URL` | Opsional, URL publik backend (untuk URL gambar upload lokal). |

`frontend/.env`: `VITE_API_URL` = alamat API backend (default `http://localhost:5000/api`).

## Memakai Supabase

1. Buat project di Supabase.
2. Jalankan seluruh isi `database.sql` di **SQL Editor** (aman dijalankan ulang; juga membuat bucket `vehicle-images` & `consignment-images` dan data contoh).
3. Isi `SUPABASE_URL` dan `SUPABASE_SERVICE_KEY` di `backend/.env`, restart backend.
4. Cek `http://localhost:5000/api/health` → `database.driver` harus `supabase`.

## Fitur

**Publik:** katalog Home/Mobil/Motor dengan pencarian, filter merek, urutan; halaman cari; detail unit + galeri; tombol WhatsApp (tercatat sebagai lead); simpan favorit; form **Titip Jual** dengan upload foto.

**Admin (`/admin`):** login berbasis token; dashboard statistik nyata; CRUD kendaraan dengan upload multi-foto & pilih cover; ubah status unit; kelola pengajuan titip jual (alur status + tombol hubungi WhatsApp); daftar WhatsApp leads.

## API ringkas

Publik: `GET /api/vehicles`, `GET /api/vehicles/:id`, `POST /api/consignment`, `POST /api/leads`, `POST /api/uploads/consignment`, `POST /api/auth/login`, `GET /api/health`
Admin (header `Authorization: Bearer <token>`): `POST/PUT/PATCH/DELETE /api/vehicles…`, `GET/PATCH /api/consignment…`, `GET/PATCH /api/leads…`, `GET /api/stats`, `POST /api/uploads/vehicles`
