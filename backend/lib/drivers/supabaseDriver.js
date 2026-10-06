import { supabase } from '../supabase.js';
import { computeStats } from './fileDriver.js';

const VEHICLE_SELECT = '*, vehicle_images (id, image_url, is_cover, sort_order)';

const check = ({ data, error }) => {
  if (error) throw error;
  return data;
};

const sortImages = (v) => (v ? { ...v, vehicle_images: [...(v.vehicle_images || [])].sort((a, b) => a.sort_order - b.sort_order) } : v);

async function replaceImages(vehicleId, urls) {
  check(await supabase.from('vehicle_images').delete().eq('vehicle_id', vehicleId));
  if (urls.length) {
    check(await supabase.from('vehicle_images').insert(
      urls.map((url, idx) => ({ vehicle_id: vehicleId, image_url: url, is_cover: idx === 0, sort_order: idx })),
    ));
  }
}

// Hilangkan karakter yang punya arti khusus di filter PostgREST
const cleanSearch = (s) => s.replace(/[,()*%\\]/g, ' ').trim();

export const supabaseDriver = {
  name: 'supabase',

  vehicles: {
    async list(f = {}) {
      let q = supabase.from('vehicles').select(VEHICLE_SELECT).order('created_at', { ascending: false });
      if (f.type) q = q.eq('type', f.type);
      if (f.status) q = q.eq('status', f.status);
      if (f.brand) q = q.ilike('brand', `%${cleanSearch(f.brand)}%`);
      if (f.transmission) q = q.eq('transmission', f.transmission);
      if (f.fuel) q = q.eq('fuel', f.fuel);
      if (f.min_price != null) q = q.gte('price', f.min_price);
      if (f.max_price != null) q = q.lte('price', f.max_price);
      if (f.search) {
        const s = cleanSearch(f.search);
        if (s) q = q.or(`brand.ilike.%${s}%,model.ilike.%${s}%,variant.ilike.%${s}%`);
      }
      return check(await q).map(sortImages);
    },
    async featured() {
      const data = check(await supabase.from('vehicles').select(VEHICLE_SELECT)
        .eq('is_featured', true).eq('status', 'AVAILABLE').order('created_at', { ascending: false }).limit(8));
      return data.map(sortImages);
    },
    async get(id) {
      return sortImages(check(await supabase.from('vehicles').select(VEHICLE_SELECT).eq('id', id).maybeSingle()));
    },
    async create(data, images = []) {
      const vehicle = check(await supabase.from('vehicles').insert([data]).select().single());
      try {
        await replaceImages(vehicle.id, images);
      } catch (e) {
        await supabase.from('vehicles').delete().eq('id', vehicle.id); // rollback
        throw e;
      }
      return this.get(vehicle.id);
    },
    async update(id, data, images) {
      const updated = check(await supabase.from('vehicles').update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id).select('id').maybeSingle());
      if (!updated) return null;
      if (images !== undefined) await replaceImages(id, images);
      return this.get(id);
    },
    async remove(id) {
      const rows = check(await supabase.from('vehicles').delete().eq('id', id).select('id'));
      return rows.length > 0;
    },
  },

  consignment: {
    async list(status) {
      let q = supabase.from('consignment_requests').select('*').order('created_at', { ascending: false });
      if (status) q = q.eq('status', status);
      return check(await q);
    },
    async get(id) {
      return check(await supabase.from('consignment_requests').select('*').eq('id', id).maybeSingle());
    },
    async create(data) {
      return check(await supabase.from('consignment_requests').insert([{ ...data, status: 'PENGAJUAN' }]).select().single());
    },
    async setStatus(id, status) {
      return check(await supabase.from('consignment_requests').update({ status, updated_at: new Date().toISOString() })
        .eq('id', id).select().maybeSingle());
    },
  },

  leads: {
    async list() {
      return check(await supabase.from('whatsapp_leads')
        .select('*, vehicles (brand, model, variant, year)').order('created_at', { ascending: false }));
    },
    async create(data) {
      return check(await supabase.from('whatsapp_leads').insert([{ ...data, status: 'BARU' }]).select().single());
    },
    async setStatus(id, status) {
      return check(await supabase.from('whatsapp_leads').update({ status }).eq('id', id).select().maybeSingle());
    },
  },

  async stats() {
    const [v, c, l] = await Promise.all([
      supabase.from('vehicles').select('status, is_featured'),
      supabase.from('consignment_requests').select('status'),
      supabase.from('whatsapp_leads').select('status'),
    ]);
    return computeStats(check(v), check(c), check(l));
  },
};
