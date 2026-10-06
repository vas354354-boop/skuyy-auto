import { useCallback, useEffect, useState } from 'react';
import { MessageCircle, MapPin } from 'lucide-react';
import clsx from 'clsx';
import { CONSIGNMENT_STATUSES, consignmentService } from '../../services/api';
import type { ConsignmentRequest, ConsignmentStatus } from '../../services/api';
import { ErrorBlock, InlineError, LoadingBlock } from '../../components/AsyncState';

const colors: Record<ConsignmentStatus, string> = {
  PENGAJUAN: 'bg-amber-100 text-amber-700',
  VERIFIKASI: 'bg-blue-100 text-blue-700',
  DISETUJUI: 'bg-teal-100 text-teal-700',
  AKTIF: 'bg-emerald-100 text-emerald-700',
  BOOKED: 'bg-violet-100 text-violet-700',
  TERJUAL: 'bg-slate-200 text-slate-700',
  SELESAI: 'bg-slate-100 text-slate-500',
};

const rupiah = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);
const waNumber = (raw: string) => {
  const d = raw.replace(/\D/g, '');
  return d.startsWith('0') ? `62${d.slice(1)}` : d;
};

export default function AdminConsignment() {
  const [items, setItems] = useState<ConsignmentRequest[]>([]);
  const [filter, setFilter] = useState<'' | ConsignmentStatus>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setItems((await consignmentService.getAll()).data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal memuat data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const changeStatus = async (id: string, status: ConsignmentStatus) => {
    setActionError('');
    try {
      const res = await consignmentService.updateStatus(id, status);
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...res.data } : i)));
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Gagal mengubah status');
    }
  };

  const shown = filter ? items.filter((i) => i.status === filter) : items;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pengajuan Titip Jual</h1>
          <p className="text-sm text-slate-500 mt-1">{items.length} pengajuan masuk dari website</p>
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value as '' | ConsignmentStatus)} className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700">
          <option value="">Semua status</option>
          {CONSIGNMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {actionError && <InlineError message={actionError} />}
      {loading && <LoadingBlock label="Memuat pengajuan..." />}
      {error && <ErrorBlock message={error} onRetry={() => void load()} />}
      {!loading && !error && shown.length === 0 && (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-500">Belum ada pengajuan.</div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {shown.map((r) => (
          <div key={r.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-600">{r.vehicle_type} • {r.brand}</p>
                <h3 className="mt-1 text-xl font-black text-[#1a2744]">{r.model} {r.year}</h3>
              </div>
              <span className={clsx('rounded-full px-3 py-1 text-xs font-bold', colors[r.status])}>{r.status}</span>
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <div><dt className="text-slate-400 text-xs">Harga diharapkan</dt><dd className="font-bold text-slate-800">{rupiah(r.expected_price)}</dd></div>
              <div><dt className="text-slate-400 text-xs">Kilometer</dt><dd className="font-bold text-slate-800">{r.mileage.toLocaleString('id-ID')} KM</dd></div>
              <div><dt className="text-slate-400 text-xs">Warna</dt><dd className="font-bold text-slate-800">{r.color}</dd></div>
              <div><dt className="text-slate-400 text-xs">Nomor polisi</dt><dd className="font-bold text-slate-800">{r.plate}</dd></div>
            </dl>

            <p className="mt-3 flex items-center gap-1.5 text-sm text-slate-500"><MapPin className="w-4 h-4" />{r.location}</p>
            {r.description && <p className="mt-3 rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">{r.description}</p>}

            {r.images?.length > 0 && (
              <div className="mt-4 flex gap-2 overflow-x-auto">
                {r.images.map((src) => (
                  <a key={src} href={src} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
                    <img src={src} alt="Foto kendaraan" className="h-20 w-28 rounded-xl border border-slate-200 object-cover" />
                  </a>
                ))}
              </div>
            )}

            <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm">
                <p className="font-bold text-slate-800">{r.name}</p>
                <p className="text-xs text-slate-400">{new Date(r.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</p>
              </div>
              <div className="flex items-center gap-2">
                <select value={r.status} onChange={(e) => changeStatus(r.id, e.target.value as ConsignmentStatus)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700">
                  {CONSIGNMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <a
                  href={`https://wa.me/${waNumber(r.whatsapp)}?text=${encodeURIComponent(`Halo ${r.name}, kami dari Lucky MotorCars 13 terkait pengajuan titip jual ${r.brand} ${r.model} ${r.year}.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-600 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" /> Hubungi
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
