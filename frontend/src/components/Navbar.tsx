import { Link } from 'react-router-dom';
import { Menu, Search, User, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import clsx from 'clsx';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={clsx(
        'fixed top-0 w-full z-50 transition-all duration-300 border-b',
        isScrolled
          ? 'bg-white/90 backdrop-blur-xl border-slate-200 py-2 shadow-lg shadow-slate-200/60'
          : 'bg-white/95 border-transparent py-3 shadow-sm'
      )}
    >
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo.jpg" alt="Lucky MotorCars 13" className="h-12 md:h-14 w-auto object-contain" />
          </Link>

          <div className="hidden md:flex items-center space-x-1 rounded-full bg-slate-100/80 p-1.5 border border-slate-200">
            <Link to="/" className="px-4 py-2 rounded-full text-sm font-semibold text-slate-700 hover:bg-white hover:text-[#1a2744] transition-all">Home</Link>
            <Link to="/mobil" className="px-4 py-2 rounded-full text-sm font-semibold text-slate-700 hover:bg-white hover:text-[#1a2744] transition-all">Mobil</Link>
            <Link to="/motor" className="px-4 py-2 rounded-full text-sm font-semibold text-slate-700 hover:bg-white hover:text-[#1a2744] transition-all">Motor</Link>
            <Link to="/titip-jual" className="px-4 py-2 rounded-full text-sm font-semibold text-slate-700 hover:bg-white hover:text-[#1a2744] transition-all">Titip Jual</Link>
            <Link to="/tentang-kami" className="px-4 py-2 rounded-full text-sm font-semibold text-slate-700 hover:bg-white hover:text-[#1a2744] transition-all">Tentang Kami</Link>
            <Link to="/kontak" className="px-4 py-2 rounded-full text-sm font-semibold text-slate-700 hover:bg-white hover:text-[#1a2744] transition-all">Kontak</Link>
          </div>

          <div className="hidden md:flex items-center space-x-3">
            <Link to="/cari" className="flex items-center gap-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-4 py-2.5 rounded-full transition-colors">
              <Search className="w-4 h-4" />
              <span>Cari Kendaraan</span>
            </Link>
            <Link to="/admin/login" className="flex items-center gap-2 text-sm font-semibold text-white bg-[#1a2744] hover:bg-[#243460] px-4 py-2.5 rounded-full transition-colors shadow-lg shadow-slate-200">
              <User className="w-4 h-4" />
              <span>Admin</span>
            </Link>
          </div>

          <button className="md:hidden p-2.5 text-slate-700 rounded-full bg-slate-100" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-slate-200 py-4 px-6 flex flex-col space-y-3 shadow-lg">
          <Link to="/" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-slate-700 py-2 rounded-xl hover:bg-slate-100 px-2">Home</Link>
          <Link to="/mobil" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-slate-700 py-2 rounded-xl hover:bg-slate-100 px-2">Mobil</Link>
          <Link to="/motor" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-slate-700 py-2 rounded-xl hover:bg-slate-100 px-2">Motor</Link>
          <Link to="/titip-jual" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-slate-700 py-2 rounded-xl hover:bg-slate-100 px-2">Titip Jual</Link>
          <Link to="/tentang-kami" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-slate-700 py-2 rounded-xl hover:bg-slate-100 px-2">Tentang Kami</Link>
          <Link to="/kontak" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-slate-700 py-2 rounded-xl hover:bg-slate-100 px-2">Kontak</Link>
          <hr className="border-slate-100" />
          <Link to="/cari" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-center gap-2 text-sm font-semibold text-slate-700 bg-slate-100 px-4 py-3 rounded-full">
            <Search className="w-4 h-4" />
            <span>Cari Kendaraan</span>
          </Link>
          <Link to="/admin/login" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-center gap-2 text-sm font-semibold text-white bg-[#1a2744] px-4 py-3 rounded-full">
            <User className="w-4 h-4" />
            <span>Admin</span>
          </Link>
        </div>
      )}
    </nav>
  );
}
