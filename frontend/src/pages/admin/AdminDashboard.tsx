import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useVehicleStore } from '../../store/useVehicleStore';
import { statsService } from '../../services/api';
import type { Stats } from '../../services/api';
import { ErrorBlock } from '../../components/AsyncState';
import { CarFront, CheckCircle, FileText, MessageCircle, Plus, ArrowRight, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
  const { vehicles, error, fetchVehicles } = useVehicleStore();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    void fetchVehicles();
    statsService.get().then((r) => setStats(r.data)).catch(() => undefined);
  }, [fetchVehicles]);

  const total = vehicles.length;
  const available = vehicles.filter(v => v.status === 'AVAILABLE').length;
  const booked = vehicles.filter(v => v.status === 'BOOKED').length;
  const sold = vehicles.filter(v => v.status === 'SOLD').length;
  const tip = vehicles.filter(v => v.status === 'TITIP JUAL').length;
  const featured = vehicles.filter(v => v.is_featured).length;
  const recentVehicles = vehicles.slice(0, 4);

  const summaryCards = [
    { label: 'Total Unit', value: total, icon: CarFront, bg: 'bg-blue-100 text-blue-600', tone: 'text-blue-600' },
    { label: 'Available', value: available, icon: CheckCircle, bg: 'bg-emerald-100 text-emerald-600', tone: 'text-emerald-600' },
    { label: 'Booked', value: booked, icon: TrendingUp, bg: 'bg-amber-100 text-amber-600', tone: 'text-amber-600' },
    { label: 'Titip Jual', value: tip, icon: FileText, bg: 'bg-violet-100 text-violet-600', tone: 'text-violet-600' },
  ];

  return (
    <div className="space-y-8">
      {error && <ErrorBlock message={error} onRetry={() => void fetchVehicles()} />}
      <div className="rounded-[32px] bg-gradient-to-r from-[#0f1c38] via-[#16284d] to-[#1a2744] p-6 md:p-8 text-white shadow-xl shadow-slate-200/80">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-amber-300 font-bold">Dashboard</p>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight mt-2">Lucky MotorCars 13 Admin</h1>
          </div>
          <Link
            to="/admin/kendaraan/tambah"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-5 py-3 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Tambah Unit
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {summaryCards.map(({ label, value, icon: Icon, bg, tone }) => (
          <div key={label} className="bg-white border border-slate-200 rounded-[28px] p-5 shadow-sm hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${bg}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className={`text-xs font-bold uppercase tracking-[0.2em] ${tone}`}>{label}</span>
            </div>
            <div className="text-3xl font-black text-[#1a2744]">{value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-6">
        <div className="bg-white border border-slate-200 rounded-[28px] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500 font-bold">Ringkasan</p>
              <h2 className="text-2xl font-black text-[#1a2744] mt-2">Status Inventory</h2>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-500">Featured</div>
              <div className="text-xl font-black text-[#1a2744]">{featured}</div>
            </div>
          </div>

          <div className="space-y-4">
            {[
              { label: 'Available', value: available, total: Math.max(total, 1), color: 'bg-emerald-500' },
              { label: 'Booked', value: booked, total: Math.max(total, 1), color: 'bg-amber-500' },
              { label: 'Sold', value: sold, total: Math.max(total, 1), color: 'bg-slate-500' },
              { label: 'Titip Jual', value: tip, total: Math.max(total, 1), color: 'bg-violet-500' },
            ].map(({ label, value, total: maxTotal, color }) => (
              <div key={label}>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="font-semibold text-slate-700">{label}</span>
                  <span className="font-bold text-slate-900">{value}</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`${color} h-full rounded-full`} style={{ width: `${(value / maxTotal) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-[28px] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500 font-bold">Quick Action</p>
              <h2 className="text-2xl font-black text-[#1a2744] mt-2">Aksi Cepat</h2>
            </div>
          </div>

          <div className="space-y-3">
            <Link to="/admin/kendaraan/tambah" className="flex items-center justify-between rounded-2xl bg-[#1a2744] text-white p-4 hover:bg-[#243460] transition-colors">
              <div>
                <div className="font-bold">Tambah Unit Baru</div>
                <div className="text-sm text-slate-300">Kelola kendaraan baru</div>
              </div>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link to="/admin/kendaraan" className="flex items-center justify-between rounded-2xl bg-slate-100 text-slate-800 p-4 hover:bg-slate-200 transition-colors">
              <div>
                <div className="font-bold">Lihat Semua Unit</div>
                <div className="text-sm text-slate-500">Kelola daftar kendaraan</div>
              </div>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link to="/admin/leads" className="block rounded-2xl bg-amber-50 border border-amber-100 p-4 hover:bg-amber-100/60 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-[#1a2744]">WhatsApp Leads</div>
                  <div className="text-sm text-slate-600">{stats?.leads.new ?? 0} lead belum diproses</div>
                </div>
              </div>
            </Link>

            <Link to="/admin/titip-jual" className="block rounded-2xl bg-violet-50 border border-violet-100 p-4 hover:bg-violet-100/60 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-[#1a2744]">Pengajuan Titip Jual</div>
                  <div className="text-sm text-slate-600">{stats?.consignment.pending ?? 0} pengajuan baru</div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-[28px] p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500 font-bold">Inventory</p>
            <h2 className="text-2xl font-black text-[#1a2744] mt-2">Unit Terbaru</h2>
          </div>
          <Link to="/admin/kendaraan" className="text-sm font-bold text-amber-600 hover:text-amber-500">Lihat semua</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {recentVehicles.length === 0 && <p className="col-span-full py-8 text-center text-slate-500">Belum ada unit. Tambahkan unit pertama Anda.</p>}
          {recentVehicles.map((vehicle) => (
            <div key={vehicle.id} className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-50">
              <img src={vehicle.images?.[0] || vehicle.vehicle_images?.[0]?.image_url || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=1000'} alt={vehicle.model} className="w-full h-40 object-cover" />
              <div className="p-4">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-amber-600">{vehicle.brand}</span>
                  <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${{ AVAILABLE: 'bg-emerald-100 text-emerald-700', BOOKED: 'bg-amber-100 text-amber-700', SOLD: 'bg-slate-100 text-slate-700', 'TITIP JUAL': 'bg-blue-100 text-blue-700' }[vehicle.status]}`}>{vehicle.status}</span>
                </div>
                <h3 className="font-black text-[#1a2744] text-lg">{vehicle.model}</h3>
                <p className="text-sm text-slate-500 mt-1">{vehicle.variant}</p>
                <div className="mt-3 text-base font-black text-slate-900">
                  {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(vehicle.price)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
