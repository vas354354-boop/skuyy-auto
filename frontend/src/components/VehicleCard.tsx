import { Link } from 'react-router-dom';
import type { Vehicle } from '../store/useVehicleStore';
import clsx from 'clsx';
import { ArrowRight, MapPin } from 'lucide-react';

interface VehicleCardProps {
  vehicle: Vehicle;
}

export default function VehicleCard({ vehicle }: VehicleCardProps) {
  const formatPrice = (price: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

  const statusConfig = {
    'AVAILABLE': { cls: 'bg-emerald-500 text-white', label: 'Tersedia' },
    'BOOKED': { cls: 'bg-amber-500 text-white', label: 'Booked' },
    'SOLD': { cls: 'bg-slate-700 text-white', label: 'Terjual' },
    'TITIP JUAL': { cls: 'bg-blue-500 text-white', label: 'Titip Jual' },
  };

  const cover = vehicle.images?.[0] || vehicle.vehicle_images?.find(i => i.is_cover)?.image_url || vehicle.vehicle_images?.[0]?.image_url || '';
  const cfg = statusConfig[vehicle.status];

  return (
    <Link to={`/kendaraan/${vehicle.id}`} className="group block bg-white rounded-2xl overflow-hidden border border-slate-200 hover:shadow-xl hover:border-amber-300 transition-all duration-300 hover:-translate-y-1">
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        {cover ? (
          <img
            src={cover}
            alt={`${vehicle.brand} ${vehicle.model}`}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300 text-4xl">🚗</div>
        )}
        <div className="absolute top-3 left-3">
          <span className={clsx('px-3 py-1 text-xs font-bold rounded-full tracking-wide', cfg.cls)}>
            {cfg.label}
          </span>
        </div>
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-slate-700 px-2 py-1 rounded-lg text-xs font-bold">
          {vehicle.type}
        </div>
      </div>

      <div className="p-5">
        <div className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">{vehicle.brand}</div>
        <h3 className="text-lg font-black text-[#1a2744] mb-3 line-clamp-1">{vehicle.model} {vehicle.variant}</h3>

        <div className="flex flex-wrap gap-1.5 mb-4">
          <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-md text-xs font-semibold">{vehicle.year}</span>
          <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-md text-xs font-semibold">{vehicle.mileage.toLocaleString('id-ID')} KM</span>
          <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-md text-xs font-semibold">{vehicle.transmission}</span>
          <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-md text-xs font-semibold">{vehicle.fuel}</span>
        </div>

        <div className="text-2xl font-black text-[#1a2744] mb-4">
          {formatPrice(vehicle.price)}
        </div>

        <div className="flex items-center justify-between text-sm pt-3 border-t border-slate-100">
          <span className="text-slate-500 flex items-center gap-1 text-xs">
            <MapPin className="w-3 h-3" /> {vehicle.location}
          </span>
          <span className="font-bold text-amber-600 flex items-center gap-1 group-hover:gap-2 transition-all text-xs">
            Lihat Detail <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
