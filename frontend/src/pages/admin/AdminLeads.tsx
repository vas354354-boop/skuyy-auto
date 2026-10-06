import { useCallback, useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import clsx from 'clsx';
import { leadsService } from '../../services/api';
import type { Lead } from '../../services/api';
import { ErrorBlock, InlineError, LoadingBlock } from '../../components/AsyncState';

export default function AdminLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setLeads((await leadsService.getAll()).data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal memuat data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const toggle = async (lead: Lead) => {
    setActionError('');
    const next = lead.status === 'BARU' ? 'DIPROSES' : 'BARU';
    try {
      const res = await leadsService.updateStatus(lead.id, next);
      setLeads((prev) => prev.map((l) => (l.id === lead.id ? { ...l, status: res.data.status } : l)));
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Gagal mengubah status');
    }
  };

  const newCount = leads.filter((l) => l.status === 'BARU').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">WhatsApp Leads</h1>
        <p className="text-sm text-slate-500 mt-1">Dicatat otomatis saat pengunjung menekan tombol “Tanya via WhatsApp” • {newCount} belum diproses</p>
      </div>

      {actionError && <InlineError message={actionError} />}
      {loading && <LoadingBlock label="Memuat leads..." />}
      {error && <ErrorBlock message={error} onRetry={() => void load()} />}

      {!loading && !error && (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-sm text-slate-500">
                <th className="px-6 py-4 font-semibold">Kendaraan</th>
                <th className="px-6 py-4 font-semibold">Pesan</th>
                <th className="px-6 py-4 font-semibold">Waktu</th>
                <th className="px-6 py-4 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => (
                <tr key={l.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900">
                    {l.vehicles ? `${l.vehicles.brand} ${l.vehicles.model} ${l.vehicles.variant ?? ''} (${l.vehicles.year})` : <span className="font-medium text-slate-400">Unit sudah dihapus</span>}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{l.message || '-'}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{new Date(l.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => toggle(l)}
                      className={clsx('inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-colors',
                        l.status === 'BARU' ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200')}
                    >
                      {l.status === 'DIPROSES' && <Check className="w-3.5 h-3.5" />}
                      {l.status === 'BARU' ? 'BARU — tandai diproses' : 'DIPROSES'}
                    </button>
                  </td>
                </tr>
              ))}
              {leads.length === 0 && (
                <tr><td colSpan={4} className="py-10 text-center text-slate-500">Belum ada lead.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
