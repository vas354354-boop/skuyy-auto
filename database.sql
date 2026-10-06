-- =====================================================================
-- SKUYY AUTO — Skema Supabase / PostgreSQL
-- Aman dijalankan berulang kali (idempotent) di Supabase SQL Editor.
-- Backend memakai SERVICE ROLE KEY (melewati RLS), sedangkan RLS di sini
-- memastikan akses langsung via anon key tetap aman.
-- =====================================================================

-- ---------- ENUM ----------
DO $$ BEGIN
  CREATE TYPE vehicle_type AS ENUM ('Mobil', 'Motor');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE vehicle_status AS ENUM ('AVAILABLE', 'BOOKED', 'SOLD', 'TITIP JUAL');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE consignment_status AS ENUM ('PENGAJUAN', 'VERIFIKASI', 'DISETUJUI', 'AKTIF', 'BOOKED', 'TERJUAL', 'SELESAI');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---------- TABEL ----------
CREATE TABLE IF NOT EXISTS vehicles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type vehicle_type NOT NULL,
  brand VARCHAR(255) NOT NULL,
  model VARCHAR(255) NOT NULL,
  variant VARCHAR(255),
  year INTEGER NOT NULL,
  price BIGINT NOT NULL,
  mileage INTEGER NOT NULL DEFAULT 0,
  transmission VARCHAR(100),
  fuel VARCHAR(100),
  engine_capacity INTEGER,
  color VARCHAR(100),
  plate VARCHAR(50),
  tax_status VARCHAR(255),
  location VARCHAR(255) NOT NULL,
  description TEXT,
  status vehicle_status DEFAULT 'AVAILABLE',
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Migrasi dari skema lama (brand_id -> brand teks)
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS brand VARCHAR(255);
UPDATE vehicles SET brand = 'Unknown' WHERE brand IS NULL;
ALTER TABLE vehicles ALTER COLUMN brand SET NOT NULL;

CREATE TABLE IF NOT EXISTS vehicle_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  is_cover BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS consignment_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  whatsapp VARCHAR(50) NOT NULL,
  vehicle_type vehicle_type NOT NULL,
  brand VARCHAR(255) NOT NULL,
  model VARCHAR(255) NOT NULL,
  year INTEGER NOT NULL,
  mileage INTEGER NOT NULL,
  color VARCHAR(100) NOT NULL,
  plate VARCHAR(50) NOT NULL,
  expected_price BIGINT NOT NULL,
  location VARCHAR(255) NOT NULL,
  description TEXT,
  images TEXT[] DEFAULT '{}',
  status consignment_status DEFAULT 'PENGAJUAN',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS whatsapp_leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  message TEXT,
  status VARCHAR(20) DEFAULT 'BARU',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE whatsapp_leads ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'BARU';

-- ---------- INDEX ----------
CREATE INDEX IF NOT EXISTS idx_vehicles_type ON vehicles(type);
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);
CREATE INDEX IF NOT EXISTS idx_vehicles_featured ON vehicles(is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_vehicle_images_vehicle ON vehicle_images(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_consignment_status ON consignment_requests(status);
CREATE INDEX IF NOT EXISTS idx_leads_vehicle ON whatsapp_leads(vehicle_id);

-- ---------- ROW LEVEL SECURITY ----------
-- Data publik (katalog) hanya bisa DIBACA lewat anon key.
-- Semua penulisan & data sensitif (titip jual, leads) hanya lewat backend
-- (service role), jadi tidak ada policy tulis untuk anon/authenticated.
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE consignment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_leads ENABLE ROW LEVEL SECURITY;

-- Hapus policy lama yang terlalu longgar (semua user login = admin)
DROP POLICY IF EXISTS "Vehicles are insertable by authenticated users" ON vehicles;
DROP POLICY IF EXISTS "Vehicles are updatable by authenticated users" ON vehicles;
DROP POLICY IF EXISTS "Vehicles are deletable by authenticated users" ON vehicles;
DROP POLICY IF EXISTS "Vehicle images modifiable by authenticated users" ON vehicle_images;
DROP POLICY IF EXISTS "Authenticated users (admins) can view all requests" ON consignment_requests;
DROP POLICY IF EXISTS "Users can insert requests" ON consignment_requests;
DROP POLICY IF EXISTS "Admins can update requests" ON consignment_requests;
DROP POLICY IF EXISTS "Users can view their own requests" ON consignment_requests;

DROP POLICY IF EXISTS "Vehicles are viewable by everyone" ON vehicles;
CREATE POLICY "Vehicles are viewable by everyone" ON vehicles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Vehicle images viewable by everyone" ON vehicle_images;
CREATE POLICY "Vehicle images viewable by everyone" ON vehicle_images FOR SELECT USING (true);

-- ---------- STORAGE (gambar) ----------
INSERT INTO storage.buckets (id, name, public)
VALUES ('vehicle-images', 'vehicle-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('consignment-images', 'consignment-images', true)
ON CONFLICT (id) DO NOTHING;

-- ---------- DATA CONTOH (hanya jika tabel masih kosong) ----------
DO $$
DECLARE v_id UUID;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM vehicles) THEN
    INSERT INTO vehicles (type, brand, model, variant, year, price, mileage, transmission, fuel, engine_capacity, color, plate, tax_status, location, description, status, is_featured)
    VALUES ('Mobil','Toyota','Fortuner','2.4 VRZ',2022,485000000,42000,'Automatic','Diesel',2400,'Hitam','B 1234 XYZ','Aktif','Tangerang Selatan','Kondisi sangat mulus, service record resmi Toyota. Tangan pertama dari baru.','AVAILABLE',TRUE)
    RETURNING id INTO v_id;
    INSERT INTO vehicle_images (vehicle_id, image_url, is_cover, sort_order) VALUES
      (v_id,'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&q=80&w=1200',TRUE,0),
      (v_id,'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1200',FALSE,1);

    INSERT INTO vehicles (type, brand, model, variant, year, price, mileage, transmission, fuel, engine_capacity, color, plate, tax_status, location, description, status, is_featured)
    VALUES ('Mobil','Honda','Civic','1.5 RS Turbo',2023,520000000,15000,'Automatic','Bensin',1500,'Putih','B 5678 ABC','Aktif','Jakarta Selatan','Civic RS Turbo. Pajak panjang, siap pakai. Kondisi prima.','AVAILABLE',TRUE)
    RETURNING id INTO v_id;
    INSERT INTO vehicle_images (vehicle_id, image_url, is_cover, sort_order) VALUES
      (v_id,'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&q=80&w=1200',TRUE,0);

    INSERT INTO vehicles (type, brand, model, variant, year, price, mileage, transmission, fuel, engine_capacity, color, plate, tax_status, location, description, status, is_featured)
    VALUES ('Motor','Yamaha','NMAX','155 Connected ABS',2023,32000000,8000,'Automatic','Bensin',155,'Matte Black','B 9999 DEF','Aktif','Depok','Tangan pertama dari baru, kondisi istimewa.','AVAILABLE',FALSE)
    RETURNING id INTO v_id;
    INSERT INTO vehicle_images (vehicle_id, image_url, is_cover, sort_order) VALUES
      (v_id,'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=1200',TRUE,0);
  END IF;
END $$;
