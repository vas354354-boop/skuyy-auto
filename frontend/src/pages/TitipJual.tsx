import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle2, ImagePlus, Loader2, MapPin, MessageCircle, X } from 'lucide-react';
import { consignmentService, uploadService } from '../services/api';
import { InlineError } from '../components/AsyncState';

const WA_NUMBER = '62856972222227';
const thisYear = new Date().getFullYear();

const num = (label: string, min = 0) =>
  z.string().trim().min(1, `${label} wajib diisi`).refine((v) => /^\d+$/.test(v.replace(/[.,\s]/g, '')) && Number(v.replace(/[.,\s]/g, '')) >= min, `${label} tidak valid`);

const schema = z.object({
  name: z.string().trim().min(2, 'Nama wajib diisi'),
  whatsapp: z.string().trim().refine((v) => v.replace(/\D/g, '').length >= 9, 'Nomor WhatsApp tidak valid'),
  vehicle_type: z.enum(['Mobil', 'Motor']),
  brand: z.string().trim().min(1, 'Merek wajib diisi'),
  model: z.string().trim().min(1, 'Model wajib diisi'),
  year: num('Tahun', 1950).refine((v) => Number(v) <= thisYear + 1, 'Tahun tidak valid'),
  mileage: num('Kilometer'),
  color: z.string().trim().min(1, 'Warna wajib diisi'),
  plate: z.string().trim().min(1, 'Nomor polisi wajib diisi'),
  expected_price: num('Harga', 1),
  location: z.string().trim().min(1, 'Lokasi wajib diisi'),
  description: z.string().trim().optional(),
});
type FormValues = z.infer<typeof schema>;

const input = 'w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition-all text-sm';
const MAX_FILES = 6;
const MAX_SIZE = 5 * 1024 * 1024;

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-slate-700">{label}</label>
      {children}
      {error && <p className="text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}

export default function TitipJual() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { vehicle_type: 'Mobil' },
  });
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<string | null>(null);

  const previews = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);
  useEffect(() => () => previews.forEach((u) => URL.revokeObjectURL(u)), [previews]);

  const addFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files || []);
    e.target.value = '';
    setFileError('');
    const valid = picked.filter((f) => f.type.startsWith('image/') && f.size <= MAX_SIZE);
    if (valid.length < picked.length) setFileError('Sebagian file dilewati: hanya gambar dengan ukuran maksimal 5 MB.');
    setFiles((prev) => {
      if (prev.length + valid.length > MAX_FILES) setFileError(`Maksimal ${MAX_FILES} foto.`);
      return [...prev, ...valid].slice(0, MAX_FILES);
    });
  };

  const onSubmit = async (values: FormValues) => {
    setSubmitError('');
    setSubmitting(true);
    try {
      const images = files.length ? await uploadService.consignmentImages(files) : [];
      const clean = (v: string) => Number(v.replace(/[.,\s]/g, ''));
      await consignmentService.create({
        ...values,
        year: clean(values.year),
        mileage: clean(values.mileage),
        expected_price: clean(values.expected_price),
        images,
      });
      setDone(`${values.brand} ${values.model} ${values.year}`);
      reset();
      setFiles([]);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Gagal mengirim pengajuan');
    } finally {
      setSubmitting(false);
    }
  };

  const waText = encodeURIComponent(`Halo Lucky MotorCars 13, saya baru saja mengajukan titip jual untuk ${done ?? 'kendaraan saya'}. Mohon dicek ya.`);

  return (
    <div className="container mx-auto px-4 max-w-5xl py-16">
      <div className="text-center mb-10">
        <p className="text-sm font-bold uppercase tracking-[0.28em] text-amber-600">Titip Jual</p>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mt-4">Punya mobil atau motor? Daftarkan sekarang.</h1>
        <p className="text-slate-600 mt-4 max-w-2xl mx-auto text-lg">
          Tim Lucky MotorCars 13 siap membantu jualan kendaraan Anda dengan proses yang cepat, aman, dan profesional.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_0.7fr] gap-8 items-start">
        <div className="bg-white border border-slate-200 rounded-[30px] p-8 md:p-10 shadow-xl shadow-slate-200/60">
          {done ? (
            <div className="text-center py-8">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-black text-[#1a2744]">Pengajuan terkirim!</h2>
              <p className="mt-3 text-slate-600">Tim kami akan mereview data kendaraan Anda dan menghubungi via WhatsApp.</p>
              <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
                <a href={`https://wa.me/${WA_NUMBER}?text=${waText}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-6 py-3.5 rounded-2xl transition-colors">
                  <MessageCircle className="w-4 h-4" /> Konfirmasi via WhatsApp
                </a>
                <button onClick={() => setDone(null)} className="px-6 py-3.5 rounded-2xl font-bold text-slate-600 hover:bg-slate-100 transition-colors">Ajukan kendaraan lain</button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500 font-bold">Form</p>
                <h2 className="text-2xl font-black text-[#1a2744]">Data kendaraan Anda</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Nama" error={errors.name?.message}><input {...register('name')} className={input} autoComplete="name" /></Field>
                <Field label="Nomor WhatsApp" error={errors.whatsapp?.message}><input {...register('whatsapp')} inputMode="tel" placeholder="08xxxxxxxxxx" className={input} autoComplete="tel" /></Field>
                <Field label="Jenis Kendaraan">
                  <select {...register('vehicle_type')} className={input}><option value="Mobil">Mobil</option><option value="Motor">Motor</option></select>
                </Field>
                <Field label="Merek" error={errors.brand?.message}><input {...register('brand')} placeholder="Toyota" className={input} /></Field>
                <Field label="Model" error={errors.model?.message}><input {...register('model')} placeholder="Avanza" className={input} /></Field>
                <Field label="Tahun" error={errors.year?.message}><input {...register('year')} inputMode="numeric" placeholder={String(thisYear - 3)} className={input} /></Field>
                <Field label="Kilometer" error={errors.mileage?.message}><input {...register('mileage')} inputMode="numeric" placeholder="45000" className={input} /></Field>
                <Field label="Warna" error={errors.color?.message}><input {...register('color')} className={input} /></Field>
                <Field label="Nomor Polisi" error={errors.plate?.message}><input {...register('plate')} placeholder="B 1234 ABC" className={input} /></Field>
                <Field label="Harga yang Diharapkan (Rp)" error={errors.expected_price?.message}><input {...register('expected_price')} inputMode="numeric" placeholder="150000000" className={input} /></Field>
                <div className="sm:col-span-2"><Field label="Lokasi Kendaraan" error={errors.location?.message}><input {...register('location')} placeholder="Pamulang, Tangerang Selatan" className={input} /></Field></div>
                <div className="sm:col-span-2"><Field label="Catatan (opsional)"><textarea {...register('description')} rows={3} className={input} placeholder="Kondisi, riwayat servis, kelengkapan surat..." /></Field></div>
              </div>

              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">Foto kendaraan (opsional)</p>
                    <p className="text-xs text-slate-500">Maksimal {MAX_FILES} foto, 5 MB per file</p>
                  </div>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-100 transition-colors">
                    <ImagePlus className="w-4 h-4" /> Pilih Foto
                    <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={addFiles} />
                  </label>
                </div>
                {fileError && <p className="mt-2 text-xs font-medium text-red-600">{fileError}</p>}
                {previews.length > 0 && (
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    {previews.map((src, i) => (
                      <div key={src} className="relative overflow-hidden rounded-xl border border-slate-200 bg-white">
                        <img src={src} alt={`Foto ${i + 1}`} className="h-24 w-full object-cover" />
                        <button type="button" onClick={() => setFiles((p) => p.filter((_, idx) => idx !== i))} className="absolute right-1 top-1 rounded-full bg-white/90 p-1 text-slate-700 hover:bg-white" aria-label="Hapus foto">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {submitError && <InlineError message={submitError} />}

              <button type="submit" disabled={submitting} className="inline-flex w-full items-center justify-center gap-2 bg-[#1a2744] hover:bg-[#243460] disabled:opacity-60 text-white font-bold px-6 py-3.5 rounded-2xl transition-colors">
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {submitting ? 'Mengirim...' : 'Kirim Pengajuan'}
              </button>
            </form>
          )}
        </div>

        <aside className="bg-[#0f1c38] text-white rounded-[30px] p-8 shadow-xl shadow-slate-200/80 lg:sticky lg:top-28">
          <p className="text-xs uppercase tracking-[0.28em] text-amber-300 font-bold">Proses</p>
          <ol className="mt-5 space-y-4 text-sm text-slate-200">
            {['Isi form data kendaraan Anda.', 'Tim kami mereview data & foto kendaraan.', 'Kami hubungi Anda via WhatsApp.', 'Kendaraan dipasarkan dengan strategi yang tepat.'].map((step, i) => (
              <li key={step} className="flex gap-3">
                <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-amber-400 text-xs font-bold text-slate-900">{i + 1}</span>
                <span className="pt-0.5">{step}</span>
              </li>
            ))}
          </ol>

          <div className="mt-8 space-y-4 border-t border-white/10 pt-6 text-sm text-slate-200">
            <p className="font-black text-lg text-white">Lucky MotorCars 13</p>
            <div className="flex items-start gap-3"><MapPin className="w-5 h-5 flex-shrink-0 text-amber-300 mt-0.5" /><p>Jl. Griya Pamulang 2, Perumahan Lucky MotorCars 13, Pamulang, Tangerang Selatan</p></div>
            <a href={`https://wa.me/${WA_NUMBER}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-amber-300 transition-colors"><MessageCircle className="w-5 h-5 text-amber-300" />+62 856-9722-2227</a>
          </div>
        </aside>
      </div>
    </div>
  );
}
