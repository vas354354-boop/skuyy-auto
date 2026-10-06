import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useVehicleStore } from '../../store/useVehicleStore';
import { Plus, Edit, Trash2 } from 'lucide-react';
import clsx from 'clsx';
import { ErrorBlock, InlineError, LoadingBlock } from '../../components/AsyncState';

export default function AdminVehicles() {
  const { vehicles, isLoading, error, fetchVehicles, deleteVehicle, updateStatus } = useVehicleStore();
  const [actionError, setActionError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => { void fetchVehicles(); }, [fetchVehicles]);

  const run = async (id: string, action: () => Promise<void>) => {
    setActionError('');
    setBusyId(id);
    try {
      await action();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Aksi gagal');
    } finally {
      setBusyId(null);
    }
  };

  const statusColors = {
    'AVAILABLE': 'bg-lime-100 text-lime-700',
    'BOOKED': 'bg-amber-100 text-amber-700',
    'SOLD': 'bg-slate-100 text-slate-700',
    'TITIP JUAL': 'bg-blue-100 text-blue-700'
  };

  const statusOptions = ['AVAILABLE', 'BOOKED', 'SOLD', 'TITIP JUAL'] as const;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Kelola Kendaraan</h1>
        <Link to="/admin/kendaraan/tambah" className="bg-lime-500 hover:bg-lime-400 text-slate-900 font-bold py-2 px-4 rounded-xl flex items-center gap-2 transition-colors">
          <Plus className="w-4 h-4" /> Tambah Unit
        </Link>
      </div>

      {actionError && <div className="mb-4"><InlineError message={actionError} /></div>}
      {isLoading && vehicles.length === 0 && <LoadingBlock label="Memuat kendaraan..." />}
      {error && vehicles.length === 0 && <ErrorBlock message={error} onRetry={() => void fetchVehicles()} />}

      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm">
              <th className="py-4 px-6 font-semibold">Kendaraan</th>
              <th className="py-4 px-6 font-semibold">Tipe</th>
              <th className="py-4 px-6 font-semibold">Harga</th>
              <th className="py-4 px-6 font-semibold">Status</th>
              <th className="py-4 px-6 font-semibold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((v) => {
              const cover = v.images?.[0] ?? v.vehicle_images?.find((image) => image.is_cover)?.image_url ?? v.vehicle_images?.[0]?.image_url ?? '';

              return (
                <tr key={v.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-4">
                      {cover ? (
                        <img src={cover} alt={v.model} className="w-16 h-12 object-cover rounded-lg" />
                      ) : (
                        <div className="w-16 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 text-xl">🚗</div>
                      )}
                      <div>
                        <div className="font-bold text-slate-900">{v.brand} {v.model} {v.variant}</div>
                        <div className="text-xs text-slate-500">{v.year} • {v.plate}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 font-medium text-slate-700">{v.type}</td>
                  <td className="py-4 px-6 font-bold text-slate-900">{formatPrice(v.price)}</td>
                  <td className="py-4 px-6">
                    <div className="flex flex-col gap-2">
                      <span className={clsx('px-2 py-1 rounded-full text-xs font-bold tracking-wide w-fit', statusColors[v.status])}>
                        {v.status}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {statusOptions.map((status) => (
                          <button
                            key={status}
                            type="button"
                            disabled={busyId === v.id}
                            onClick={() => run(v.id, () => updateStatus(v.id, status))}
                            className={clsx(
                              'px-2 py-1 rounded-md text-[10px] font-bold transition-colors',
                              status === v.status
                                ? 'bg-[#1a2744] text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            )}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-end gap-2">
                      <Link to={`/admin/kendaraan/edit/${v.id}`} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button 
                        onClick={() => {
                          if (confirm('Yakin ingin menghapus kendaraan ini?')) {
                            void run(v.id, () => deleteVehicle(v.id));
                          }
                        }}
                        disabled={busyId === v.id}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {vehicles.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500">
                  Belum ada kendaraan. Klik “Tambah Unit” untuk mulai.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
