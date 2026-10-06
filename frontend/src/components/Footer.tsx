import { Link } from 'react-router-dom';
import { MessageCircle, AtSign, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0f1c38] text-slate-300 pt-16 pb-10 border-t border-slate-800">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="space-y-4">
            <img src="/logo.jpg" alt="Lucky MotorCars 13" className="h-20 w-auto object-contain brightness-0 invert" />
            <p className="text-slate-300 font-semibold text-lg">Lucky MotorCars 13</p>
            <p className="text-slate-400 font-medium text-sm">Quality Used Car Solutions</p>
            <p className="text-slate-500 text-sm">Buy • Sell • Consign • Trade In</p>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-[0.22em] text-xs">Menu</h4>
            <div className="flex flex-col space-y-3 text-sm">
              <Link to="/" className="text-slate-300 hover:text-amber-400 transition-colors">Home</Link>
              <Link to="/mobil" className="text-slate-300 hover:text-amber-400 transition-colors">Mobil</Link>
              <Link to="/motor" className="text-slate-300 hover:text-amber-400 transition-colors">Motor</Link>
              <Link to="/titip-jual" className="text-slate-300 hover:text-amber-400 transition-colors">Titip Jual</Link>
              <Link to="/tentang-kami" className="text-slate-300 hover:text-amber-400 transition-colors">Tentang Kami</Link>
              <Link to="/kontak" className="text-slate-300 hover:text-amber-400 transition-colors">Kontak</Link>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-[0.22em] text-xs">Hubungi Kami</h4>
            <div className="flex flex-col space-y-4 text-sm">
              <a href="https://wa.me/62856972222227" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-slate-300 hover:text-amber-400 transition-colors">
                <MessageCircle className="w-5 h-5 text-amber-400" />
                +62 856-9722-2227
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-slate-300 hover:text-amber-400 transition-colors">
                <AtSign className="w-5 h-5 text-amber-400" />
                @luckymotorcars13
              </a>
              <a href="https://www.google.com/maps?q=Lucky+Motorcars+13+Perumahan+Jl.+Griya+Pamulang+2+Jl.+Melati+Pd.+Benda+Kec.+Pamulang+Kota+Tangerang+Selatan+Banten+16517" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-slate-300 hover:text-amber-400 transition-colors">
                <MapPin className="w-5 h-5 text-amber-400" />
                Pamulang, Tangerang Selatan
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-700 text-xs text-slate-500 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© 2026 Lucky MotorCars 13. All rights reserved.</p>
          <p className="text-slate-400">Quality Used Car Solutions</p>
        </div>
      </div>
    </footer>
  );
}
