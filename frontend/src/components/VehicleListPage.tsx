import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useVehicleStore } from '../store/useVehicleStore';
import VehicleCard from './VehicleCard';
import { ErrorBlock, LoadingBlock } from './AsyncState';

type Sort = 'terbaru' | 'termurah' | 'termahal' | 'tahun' | 'km';

interface Props {
  type?: 'Mobil' | 'Motor';
  title: string;
  subtitle: string;
  emptyText: string;
}

const field = 'rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400';

export default function VehicleListPage({ type, title, subtitle, emptyText }: Props) {
  const { vehicles, isLoading, error, fetchVehicles } = useVehicleStore();
  const [params, setParams] = useSearchParams();
  const [brand, setBrand] = useState('');
  const [sort, setSort] = useState<Sort>('terbaru');
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const q = params.get('q') ?? '';

  useEffect(() => { void fetchVehicles(); }, [fetchVehicles]);

  const ofType = useMemo(() => vehicles.filter((v) => !type || v.type === type), [vehicles, type]);
  const brands = useMemo(() => [...new Set(ofType.map((v) => v.brand))].sort(), [ofType]);

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    const filtered = ofType.filter((v) =>
      (!brand || v.brand === brand)
      && (!onlyAvailable || v.status === 'AVAILABLE')
      && (!term || `${v.brand} ${v.model} ${v.variant} ${v.location} ${v.year}`.toLowerCase().includes(term)));
    const sorters: Record<Sort, (a: typeof filtered[number], b: typeof filtered[number]) => number> = {
      terbaru: () => 0, // urutan bawaan server (terbaru lebih dulu)
      termurah: (a, b) => a.price - b.price,
      termahal: (a, b) => b.price - a.price,
      tahun: (a, b) => b.year - a.year,
      km: (a, b) => a.mileage - b.mileage,
    };
    return [...filtered].sort(sorters[sort]);
  }, [ofType, q, brand, onlyAvailable, sort]);

  return (
    <div className="container mx-auto px-4 max-w-7xl py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-4">{title}</h1>
        <p className="text-slate-500 font-medium text-lg">{subtitle}</p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto_auto_auto] md:items-center">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setParams(e.target.value ? { q: e.target.value } : {}, { replace: true })}
            placeholder="Cari merek, model, lokasi..."
            autoFocus={!type}
            className={`${field} w-full pl-11`}
          />
        </div>
        <select value={brand} onChange={(e) => setBrand(e.target.value)} className={field}>
          <option value="">Semua merek</option>
          {brands.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className={field}>
          <option value="terbaru">Terbaru</option>
          <option value="termurah">Harga termurah</option>
          <option value="termahal">Harga termahal</option>
          <option value="tahun">Tahun terbaru</option>
          <option value="km">KM terendah</option>
        </select>
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <input type="checkbox" checked={onlyAvailable} onChange={(e) => setOnlyAvailable(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500" />
          Tersedia saja
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {isLoading && vehicles.length === 0 ? (
          <LoadingBlock label="Memuat kendaraan..." />
        ) : error && vehicles.length === 0 ? (
          <ErrorBlock message={error} onRetry={() => void fetchVehicles()} />
        ) : list.length === 0 ? (
          <div className="col-span-full text-center py-24 text-slate-500">{q || brand || onlyAvailable ? 'Tidak ada kendaraan yang cocok dengan filter Anda.' : emptyText}</div>
        ) : (
          list.map((vehicle) => <VehicleCard key={vehicle.id} vehicle={vehicle} />)
        )}
      </div>
    </div>
  );
}
