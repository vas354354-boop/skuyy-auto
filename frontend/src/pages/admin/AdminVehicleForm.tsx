import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useVehicleStore } from '../../store/useVehicleStore';
import type { Vehicle, VehicleInput, VehicleStatus } from '../../store/useVehicleStore';
import { uploadService } from '../../services/api';
import { ErrorBlock, InlineError, LoadingBlock } from '../../components/AsyncState';
import { ArrowLeft, CarFront, Loader2, Plus, Sparkles, Upload } from 'lucide-react';

const inputCls = 'w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition-all';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-slate-700">{label}</label>
      {children}
    </div>
  );
}

// Wrapper: pastikan data unit sudah dimuat sebelum form (mode edit) ditampilkan
export default function AdminVehicleForm() {
  const { id } = useParams();
  const { vehicles, hasLoaded, error, fetchVehicles } = useVehicleStore();

  useEffect(() => { void fetchVehicles(); }, [fetchVehicles]);

  if (!id) return <VehicleForm />;

  const vehicle = vehicles.find((v) => v.id === id);
  if (!vehicle) {
    if (!hasLoaded && !error) return <LoadingBlock label="Memuat data unit..." />;
    if (error && !hasLoaded) return <ErrorBlock message={error} onRetry={() => void fetchVehicles()} />;
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center">
        <p className="text-lg font-bold text-[#1a2744]">Unit tidak ditemukan</p>
        <Link to="/admin/kendaraan" className="mt-4 inline-block font-semibold text-amber-600 hover:underline">← Kembali ke daftar</Link>
      </div>
    );
  }
  return <VehicleForm key={vehicle.id} existingVehicle={vehicle} />;
}

function VehicleForm({ existingVehicle }: { existingVehicle?: Vehicle }) {
  const navigate = useNavigate();
  const { addVehicle, updateVehicle } = useVehicleStore();
  const isEdit = !!existingVehicle;

  const [galleryImages, setGalleryImages] = useState<string[]>(existingVehicle?.images || []);
  const [urlInput, setUrlInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    if (files.length === 0) return;

    setError('');
    setUploading(true);
    try {
      const urls = await uploadService.vehicleImages(files);
      setGalleryImages((prev) => [...prev, ...urls]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal mengunggah gambar');
    } finally {
      setUploading(false);
    }
  };

  const addUrl = () => {
    const url = urlInput.trim();
    if (!url) return;
    if (!/^https?:\/\//i.test(url)) {
      setError('URL gambar harus diawali http:// atau https://');
      return;
    }
    setError('');
    setGalleryImages((prev) => (prev.includes(url) ? prev : [...prev, url]));
    setUrlInput('');
  };

  const makeCover = (index: number) =>
    setGalleryImages((prev) => [prev[index], ...prev.filter((_, i) => i !== index)]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (uploading) return;
    const formData = new FormData(e.currentTarget);
    const text = (k: string) => ((formData.get(k) as string) ?? '').trim();

    const vehicleData: VehicleInput = {
      type: text('type') as 'Mobil' | 'Motor',
      brand: text('brand'),
      model: text('model'),
      variant: text('variant'),
      year: Number(text('year')),
      price: Number(text('price')),
      mileage: Number(text('mileage')),
      transmission: text('transmission'),
      fuel: text('fuel'),
      engine_capacity: Number(text('engine_capacity')),
      color: text('color'),
      plate: text('plate'),
      tax_status: text('tax_status'),
      location: text('location'),
      description: text('description'),
      status: text('status') as VehicleStatus,
      is_featured: formData.get('is_featured') === 'on',
      images: galleryImages,
    };

    setError('');
    setSaving(true);
    try {
      if (existingVehicle) await updateVehicle(existingVehicle.id, vehicleData);
      else await addVehicle(vehicleData);
      navigate('/admin/kendaraan');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan kendaraan');
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[30px] bg-gradient-to-r from-[#0f1c38] via-[#16284d] to-[#1a2744] p-6 md:p-8 text-white shadow-xl shadow-slate-200/80">
        <div className="flex items-center gap-4 mb-4">
          <Link to="/admin/kendaraan" className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/15 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-amber-300 font-bold">Inventory</p>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight mt-2">
              {isEdit ? 'Edit Kendaraan' : 'Tambah Kendaraan'}
            </h1>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-[30px] p-6 md:p-8 shadow-xl shadow-slate-200/70">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500 font-bold">Form</p>
            <h2 className="text-2xl font-black text-[#1a2744] mt-1">Data Unit</h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            <Field label="Jenis Kendaraan">
              <select name="type" required defaultValue={existingVehicle?.type || 'Mobil'} className={inputCls}>
                <option value="Mobil">Mobil</option>
                <option value="Motor">Motor</option>
              </select>
            </Field>
            <Field label="Merek"><input name="brand" required defaultValue={existingVehicle?.brand} type="text" className={inputCls} /></Field>
            <Field label="Model"><input name="model" required defaultValue={existingVehicle?.model} type="text" className={inputCls} /></Field>
            <Field label="Varian"><input name="variant" defaultValue={existingVehicle?.variant} type="text" className={inputCls} /></Field>
            <Field label="Tahun"><input name="year" required min={1950} max={new Date().getFullYear() + 1} defaultValue={existingVehicle?.year} type="number" className={inputCls} /></Field>
            <Field label="Harga (Rp)"><input name="price" required min={0} defaultValue={existingVehicle?.price} type="number" className={inputCls} /></Field>
            <Field label="Kilometer"><input name="mileage" required min={0} defaultValue={existingVehicle?.mileage} type="number" className={inputCls} /></Field>
            <Field label="Transmisi">
              <input name="transmission" required list="transmission-options" defaultValue={existingVehicle?.transmission} type="text" className={inputCls} />
              <datalist id="transmission-options"><option value="Automatic" /><option value="Manual" /></datalist>
            </Field>
            <Field label="Bahan Bakar">
              <input name="fuel" required list="fuel-options" defaultValue={existingVehicle?.fuel} type="text" className={inputCls} />
              <datalist id="fuel-options"><option value="Bensin" /><option value="Diesel" /><option value="Hybrid" /><option value="Listrik" /></datalist>
            </Field>
            <Field label="Kapasitas Mesin (cc)"><input name="engine_capacity" required min={0} defaultValue={existingVehicle?.engine_capacity || ''} type="number" className={inputCls} /></Field>
            <Field label="Warna"><input name="color" required defaultValue={existingVehicle?.color} type="text" className={inputCls} /></Field>
            <Field label="Nomor Polisi"><input name="plate" required defaultValue={existingVehicle?.plate} type="text" className={inputCls} /></Field>
            <Field label="Status Pajak"><input name="tax_status" required defaultValue={existingVehicle?.tax_status} type="text" className={inputCls} /></Field>
            <Field label="Lokasi"><input name="location" required defaultValue={existingVehicle?.location} type="text" className={inputCls} /></Field>
            <Field label="Status Penjualan">
              <select name="status" required defaultValue={existingVehicle?.status || 'AVAILABLE'} className={inputCls}>
                <option value="AVAILABLE">AVAILABLE</option>
                <option value="BOOKED">BOOKED</option>
                <option value="SOLD">SOLD</option>
                <option value="TITIP JUAL">TITIP JUAL</option>
              </select>
            </Field>

            <div className="flex items-center gap-3 pt-8">
              <input type="checkbox" name="is_featured" id="is_featured" defaultChecked={existingVehicle?.is_featured} className="w-5 h-5 rounded border-slate-300 text-amber-500 focus:ring-amber-500" />
              <label htmlFor="is_featured" className="text-sm font-semibold text-slate-700">Tampilkan di halaman utama</label>
            </div>
          </div>

          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Galeri Gambar Kendaraan</label>
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-3">
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addUrl(); } }}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition-all"
                placeholder="Tempel URL gambar (https://...)"
              />
              <button type="button" onClick={addUrl} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-100 transition-colors">
                <Plus className="w-4 h-4" /> Tambah URL
              </button>
              <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-100 transition-colors">
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {uploading ? 'Mengunggah...' : 'Upload File'}
                <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple disabled={uploading} className="hidden" onChange={handleImageUpload} />
              </label>
            </div>
            <p className="mt-2 text-xs text-slate-500">Gambar pertama menjadi cover. Maksimal 5 MB per file.</p>

            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
              {galleryImages.length > 0 ? (
                galleryImages.map((image, index) => (
                  <div key={`${image}-${index}`} className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-1">
                    <img src={image} alt={`Preview ${index + 1}`} className="h-28 w-full rounded-xl object-cover" />
                    {index === 0 ? (
                      <span className="absolute left-2 top-2 rounded-full bg-[#1a2744] px-2 py-1 text-[10px] font-bold text-white">Cover</span>
                    ) : (
                      <button type="button" onClick={() => makeCover(index)} className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-1 text-[10px] font-bold text-slate-700 hover:bg-white">Jadikan cover</button>
                    )}
                    <button
                      type="button"
                      onClick={() => setGalleryImages((prev) => prev.filter((_, i) => i !== index))}
                      className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-1 text-[10px] font-bold text-slate-700 hover:bg-white"
                    >
                      X
                    </button>
                  </div>
                ))
              ) : (
                <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500">
                  Belum ada gambar yang dipilih.
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Deskripsi</label>
            <textarea name="description" rows={5} defaultValue={existingVehicle?.description} className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition-all"></textarea>
          </div>

          {error && <InlineError message={error} />}

          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-slate-100">
            <Link to="/admin/kendaraan" className="px-6 py-3 rounded-2xl font-bold text-slate-600 hover:bg-slate-100 transition-colors text-center">
              Batal
            </Link>
            <button type="submit" disabled={saving || uploading} className="inline-flex items-center justify-center gap-2 bg-[#1a2744] hover:bg-[#243460] disabled:opacity-60 text-white px-8 py-3 rounded-2xl font-bold transition-colors shadow-lg shadow-slate-200">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CarFront className="w-4 h-4" />}
              {saving ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Publish Kendaraan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
