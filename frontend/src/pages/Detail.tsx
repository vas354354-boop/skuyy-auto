import { useParams, Link } from 'react-router-dom';
import { normalizeVehicle, useVehicleStore } from '../store/useVehicleStore';
import type { Vehicle } from '../store/useVehicleStore';
import { vehicleService, leadsService } from '../services/api';
import { useFavorites } from '../hooks/useFavorites';
import { LoadingBlock } from '../components/AsyncState';
import { MessageCircle, Heart, ArrowLeft, MapPin, Gauge, Palette, Fuel, ShieldCheck, CheckCircle } from 'lucide-react';
import clsx from 'clsx';
import { useEffect, useState } from 'react';

export default function Detail() {
  const { id } = useParams();
  const { vehicles } = useVehicleStore();
  const { isFavorite, toggle } = useFavorites();
  const [activeImg, setActiveImg] = useState(0);
  const [fetched, setFetched] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);

  const fromStore = vehicles.find(v => v.id === id);

  // Selalu ambil data terbaru dari server (juga untuk akses langsung via link)
  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    vehicleService.getById(id)
      .then(res => { if (!cancelled) setFetched(normalizeVehicle(res.data)); })
      .catch(() => { if (!cancelled) setFetched(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  const vehicle = fetched?.id === id ? fetched : fromStore;

  if (!vehicle && loading) return <LoadingBlock label="Memuat detail kendaraan..." />;

  if (!vehicle) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-bold text-[#1a2744]">Kendaraan tidak ditemukan</h2>
        <Link to="/" className="text-amber-600 mt-4 inline-block font-semibold hover:underline">← Kembali ke Home</Link>
      </div>
    );
  }

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

  const allImages = vehicle.images?.length
    ? vehicle.images
    : vehicle.vehicle_images?.map(i => i.image_url) || [];

  const activeImage = allImages[activeImg] || allImages[0];

  const whatsappMsg = encodeURIComponent(
    `Halo Lucky MotorCars 13, saya tertarik dengan ${vehicle.brand} ${vehicle.model} ${vehicle.variant} tahun ${vehicle.year} dengan harga ${formatPrice(vehicle.price)}. Apakah unitnya masih tersedia?`
  );
  const whatsappUrl = `https://wa.me/62856972222227?text=${whatsappMsg}`;

  const statusConfig = {
    'AVAILABLE': 'bg-emerald-100 text-emerald-700',
    'BOOKED': 'bg-amber-100 text-amber-700',
    'SOLD': 'bg-slate-100 text-slate-700',
    'TITIP JUAL': 'bg-blue-100 text-blue-700',
  };

  const infoCards = [
    { label: 'Tahun', value: vehicle.year },
    { label: 'Kilometer', value: `${vehicle.mileage.toLocaleString('id-ID')} KM` },
    { label: 'Transmisi', value: vehicle.transmission },
    { label: 'Bahan Bakar', value: vehicle.fuel },
    { label: 'Warna', value: vehicle.color },
    { label: 'Lokasi', value: vehicle.location },
  ];

  const featureBadges = [
    { icon: Gauge, label: `${vehicle.mileage.toLocaleString('id-ID')} KM` },
    { icon: Fuel, label: vehicle.fuel },
    { icon: Palette, label: vehicle.color },
    { icon: ShieldCheck, label: vehicle.tax_status },
  ];

  return (
    <div className="container mx-auto px-4 max-w-7xl py-8 md:py-12">
      <Link to={vehicle.type === 'Motor' ? '/motor' : '/mobil'} className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1a2744] font-semibold mb-8 transition-colors">
        <ArrowLeft className="w-5 h-5" /> Kembali
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_0.65fr] gap-8 lg:gap-10">
        <div className="space-y-5">
          <div className="rounded-[32px] overflow-hidden border border-slate-200 bg-white shadow-xl shadow-slate-200/70 p-3">
            <div className="aspect-[4/3] bg-slate-100 rounded-[22px] overflow-hidden">
              {activeImage ? (
                <img src={activeImage} alt={vehicle.model} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300 text-6xl">🚗</div>
              )}
            </div>
          </div>

          {allImages.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {allImages.map((img, i) => (
                <button
                  key={`${img}-${i}`}
                  onClick={() => setActiveImg(i)}
                  className={clsx(
                    'aspect-[4/3] rounded-2xl overflow-hidden border-2 transition-all',
                    i === activeImg ? 'border-amber-500 shadow-lg shadow-amber-200' : 'border-slate-200 hover:border-slate-300'
                  )}
                >
                  <img src={img} alt={`Foto kendaraan ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="lg:pt-1">
          <div className="sticky top-28 bg-white border border-slate-200 rounded-[30px] p-6 md:p-8 shadow-xl shadow-slate-200/70">
            <div className="flex items-center justify-between gap-3 mb-3">
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-amber-600">{vehicle.brand}</span>
              <span className={clsx('px-3 py-1.5 rounded-full text-xs font-bold tracking-wide', statusConfig[vehicle.status])}>
                {vehicle.status}
              </span>
            </div>

            <h1 className="text-3xl font-black text-[#1a2744] leading-tight mb-3">
              {vehicle.model} {vehicle.variant}
            </h1>

            <div className="flex items-center gap-2 mb-5">
              <span className="text-sm text-slate-500">{vehicle.type}</span>
              <span className="text-slate-300">•</span>
              <span className="text-sm text-slate-500">{vehicle.year}</span>
            </div>

            <div className="text-4xl font-black text-amber-500 mb-6">
              {formatPrice(vehicle.price)}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {infoCards.map(({ label, value }) => (
                <div key={label} className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold mb-2">{label}</div>
                  <div className="font-bold text-slate-800 text-sm">{value}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {featureBadges.map(({ icon: Icon, label }) => (
                <span key={label} className="inline-flex items-center gap-2 rounded-full bg-slate-100 text-slate-700 px-3 py-2 text-xs font-semibold border border-slate-200">
                  <Icon className="w-3.5 h-3.5 text-amber-600" />
                  {label}
                </span>
              ))}
            </div>

            <div className="space-y-3">
              <a
                href={whatsappUrl}
                onClick={() => { void leadsService.create({ vehicle_id: vehicle.id, message: `Klik WhatsApp: ${vehicle.brand} ${vehicle.model} ${vehicle.variant}`.trim() }).catch(() => undefined); }}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-200"
              >
                <MessageCircle className="w-5 h-5" /> Tanya via WhatsApp
              </a>

              <a
                href={`https://www.google.com/maps?q=${encodeURIComponent(vehicle.location)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-white hover:bg-slate-50 text-[#1a2744] border border-slate-200 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-colors"
              >
                <MapPin className="w-5 h-5" /> Lihat Lokasi
              </a>

              <button
                type="button"
                onClick={() => toggle(vehicle.id)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-[#1a2744] font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-colors"
              >
                <Heart className={clsx('w-5 h-5', isFavorite(vehicle.id) && 'fill-red-500 text-red-500')} />
                {isFavorite(vehicle.id) ? 'Tersimpan' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-16 grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-8">
        <div className="bg-white border border-slate-200 rounded-[30px] p-6 md:p-8 shadow-xl shadow-slate-200/70">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <CheckCircle className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-black text-[#1a2744] tracking-tight">Detail Kendaraan</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
            {[
              ['Merek', vehicle.brand],
              ['Model', `${vehicle.model} ${vehicle.variant}`],
              ['Tahun', vehicle.year],
              ['Kilometer', `${vehicle.mileage.toLocaleString('id-ID')} KM`],
              ['Transmisi', vehicle.transmission],
              ['Bahan Bakar', vehicle.fuel],
              ['Kapasitas Mesin', `${vehicle.engine_capacity} cc`],
              ['Warna', vehicle.color],
              ['Nomor Polisi', vehicle.plate],
              ['Pajak', vehicle.tax_status],
              ['Lokasi', vehicle.location],
            ].map(([label, value]) => (
              <div key={label as string} className="flex justify-between gap-4 border-b border-slate-100 pb-3">
                <span className="text-slate-500 text-sm">{label}</span>
                <span className="font-bold text-slate-800 text-sm text-right">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {vehicle.description && (
          <div className="bg-white border border-slate-200 rounded-[30px] p-6 md:p-8 shadow-xl shadow-slate-200/70">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-black text-[#1a2744] tracking-tight">Deskripsi</h3>
            </div>
            <p className="text-slate-600 leading-relaxed text-base">
              {vehicle.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
