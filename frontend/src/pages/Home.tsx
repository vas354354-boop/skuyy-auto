import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useVehicleStore } from '../store/useVehicleStore';
import VehicleCard from '../components/VehicleCard';
import { MessageCircle, Search, ShieldCheck, Car } from 'lucide-react';
import { ErrorBlock, LoadingBlock } from '../components/AsyncState';

export default function Home() {
  const { vehicles, isLoading, error, fetchVehicles } = useVehicleStore();
  const [filterType, setFilterType] = useState<'Semua' | 'Mobil' | 'Motor'>('Semua');

  useEffect(() => { void fetchVehicles(); }, [fetchVehicles]);

  const readyCount = vehicles.filter(v => v.status === 'AVAILABLE').length;

  const filteredVehicles = filterType === 'Semua'
    ? vehicles
    : vehicles.filter(v => v.type === filterType);

  return (
    <div className="flex flex-col gap-24 pb-24">

      {/* HERO SECTION */}
      <section className="relative px-4 mt-[-96px] pt-40 pb-24 md:pt-64 md:pb-40 bg-[#0f1c38] overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-30">
          <img
            src="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=2000"
            alt="Showroom"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#0f1c38] via-[#0f1c38]/70 to-[#0f1c38]/20"></div>

        <div className="container mx-auto max-w-7xl relative z-10 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] items-center gap-12">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-slate-300 text-xs font-semibold tracking-widest uppercase mb-6">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              Quality Used Car Solutions
            </div>

            <div className="flex items-center gap-4 mb-6">
              <img
                src="/logo.jpg"
                alt="Lucky MotorCars 13"
                className="h-20 md:h-24 w-auto object-contain drop-shadow-2xl brightness-0 invert opacity-90"
              />
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-slate-300">Lucky MotorCars 13</p>
              </div>
            </div>

            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-4 leading-tight">
              TEMUKAN KENDARAAN <br className="hidden md:block"/>
              <span className="text-amber-400">IMPIAN ANDA.</span>
            </h1>
            <p className="text-lg text-slate-300 mb-8 max-w-xl font-medium">
              Mobil & motor pilihan berkualitas. Siap dilihat, siap dibawa pulang.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/mobil" className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold py-4 px-8 rounded-full transition-colors text-center shadow-lg">
                Lihat Kendaraan
              </Link>
              <Link to="/titip-jual" className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold py-4 px-8 rounded-full transition-colors text-center backdrop-blur-sm">
                Titip Jual
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-4 text-sm text-slate-200">
              <span className="px-3 py-2 rounded-full bg-white/10 border border-white/15">{readyCount > 0 ? `${readyCount} Unit Ready` : 'Unit Pilihan'}</span>
              <span className="px-3 py-2 rounded-full bg-white/10 border border-white/15">100% Transparan</span>
              <span className="px-3 py-2 rounded-full bg-white/10 border border-white/15">Fast Response WA</span>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-[32px] overflow-hidden border border-white/15 bg-white/5 backdrop-blur-sm shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=1200"
                alt="Showroom Lucky MotorCars 13"
                className="w-full h-[480px] object-cover"
              />
            </div>
            <div className="absolute -bottom-6 left-6 right-6 bg-[#1a2744] text-white rounded-2xl border border-white/10 p-4 shadow-2xl">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-300">Showroom</p>
                  <p className="font-bold text-lg mt-1">Lucky MotorCars 13</p>
                </div>
                <span className="px-3 py-1.5 rounded-full bg-amber-400 text-slate-900 text-xs font-bold">Aktif</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST FEATURES */}
      <section className="container mx-auto px-4 max-w-7xl -mt-36 relative z-20">
        <div className="bg-[#1a2744] border border-[#243460] rounded-3xl p-8 md:p-12 shadow-2xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex flex-col gap-3">
            <ShieldCheck className="w-8 h-8 text-amber-400" />
            <h3 className="text-white font-bold text-base">UNIT TERPILIH</h3>
            <p className="text-slate-400 text-sm">Kendaraan pilihan dengan informasi yang jelas dan transparan.</p>
          </div>
          <div className="flex flex-col gap-3">
            <Search className="w-8 h-8 text-amber-400" />
            <h3 className="text-white font-bold text-base">PROSES MUDAH</h3>
            <p className="text-slate-400 text-sm">Cari, lihat, lalu langsung hubungi kami.</p>
          </div>
          <div className="flex flex-col gap-3">
            <MessageCircle className="w-8 h-8 text-amber-400" />
            <h3 className="text-white font-bold text-base">LANGSUNG WHATSAPP</h3>
            <p className="text-slate-400 text-sm">Komunikasi cepat tanpa ribet langsung ke tim kami.</p>
          </div>
          <div className="flex flex-col gap-3">
            <Car className="w-8 h-8 text-amber-400" />
            <h3 className="text-white font-bold text-base">TITIP JUAL</h3>
            <p className="text-slate-400 text-sm">Kami bantu pasarkan kendaraan Anda.</p>
          </div>
        </div>
      </section>

      {/* VEHICLE SECTION */}
      <section className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black text-[#1a2744] tracking-tighter mb-3">PILIH KENDARAAN ANDA</h2>
          <p className="text-slate-500 font-medium text-lg">Temukan mobil atau motor yang sesuai kebutuhan dan budget Anda.</p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-2 mb-10">
          {(['Semua', 'Mobil', 'Motor'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilterType(tab)}
              className={`px-6 py-3 rounded-full font-bold transition-colors text-sm ${
                filterType === tab
                  ? 'bg-[#1a2744] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab === 'Mobil' ? '🚗 ' : tab === 'Motor' ? '🏍️ ' : ''}{tab}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading && vehicles.length === 0 ? (
            <LoadingBlock label="Memuat kendaraan..." />
          ) : error && vehicles.length === 0 ? (
            <ErrorBlock message={error} onRetry={() => void fetchVehicles()} />
          ) : filteredVehicles.length === 0 ? (
            <div className="col-span-full text-center py-20 text-slate-400">
              Belum ada kendaraan tersedia.
            </div>
          ) : (
            filteredVehicles.map(vehicle => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))
          )}
        </div>
      </section>

      {/* TITIP JUAL CTA */}
      <section className="container mx-auto px-4 max-w-7xl">
        <div className="bg-[#1a2744] rounded-3xl p-12 md:p-20 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <img src="/logo.jpg" alt="" className="w-full h-full object-contain" />
          </div>
          <div className="relative z-10">
            <h2 className="text-4xl font-black text-white tracking-tighter mb-4">PUNYA MOBIL ATAU MOTOR?</h2>
            <p className="text-slate-300 font-medium text-xl mb-10 max-w-2xl mx-auto">
              Titip jual di Lucky MotorCars 13. Biar kami yang bantu pasarkan untuk Anda.
            </p>
            <Link to="/titip-jual" className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold py-4 px-10 rounded-full transition-colors shadow-lg">
              🚗 Mulai Titip Jual
            </Link>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="container mx-auto px-4 max-w-5xl">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="flex-shrink-0">
            <img src="/logo.jpg" alt="Lucky MotorCars 13" className="h-40 w-auto object-contain" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-[#1a2744] tracking-tighter mb-4">TENTANG LUCKY MOTORCARS 13</h2>
            <p className="text-lg text-slate-600 font-medium leading-relaxed">
              Lucky MotorCars 13 hadir untuk membuat proses mencari dan menjual kendaraan menjadi lebih mudah, transparan, dan nyaman. Dengan motto <em>"Quality Used Car Solutions"</em>, kami berkomitmen memberikan pengalaman jual beli kendaraan terbaik untuk Anda.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
