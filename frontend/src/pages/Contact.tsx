import { MessageCircle, AtSign, MapPin } from 'lucide-react';

export default function Contact() {
  return (
    <div className="container mx-auto px-4 max-w-6xl py-12">
      <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-xl shadow-slate-200/60 mb-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="h-[360px] lg:h-full">
            <img
              src="https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&q=80&w=1200"
              alt="Showroom Lucky MotorCars 13"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-8 md:p-10 flex flex-col justify-center bg-gradient-to-br from-[#0f1c38] via-[#16284d] to-[#1a2744] text-white">
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-amber-300 mb-4">Hubungi Kami</p>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">Kunjungi Showroom Kami</h1>
            <p className="text-slate-200 text-lg leading-relaxed">
              Lucky MotorCars 13 menghadirkan pengalaman cek unit, tanya harga, dan datang langsung ke showroom dengan proses yang cepat, aman, dan nyaman.
            </p>
          </div>
        </div>
      </div>

      <div className="text-center mb-8">
        <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto">
          Pilih kendaraan yang sesuai kebutuhan Anda, lalu datang langsung atau hubungi kami untuk konsultasi cepat.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-slate-200 p-7 rounded-3xl flex flex-col items-center text-center hover:shadow-xl transition-all hover:-translate-y-1">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-5 shadow-sm">
            <MessageCircle className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-[#1a2744] mb-2">WhatsApp</h3>
          <p className="text-slate-500 mb-5">+62 856-9722-2227</p>
          <a
            href="https://wa.me/62856972222227"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3 px-8 rounded-full transition-colors w-full text-center"
          >
            Chat WhatsApp
          </a>
        </div>

        <div className="bg-white border border-slate-200 p-7 rounded-3xl flex flex-col items-center text-center hover:shadow-xl transition-all hover:-translate-y-1">
          <div className="w-16 h-16 bg-pink-100 text-pink-600 rounded-2xl flex items-center justify-center mb-5 shadow-sm">
            <AtSign className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-[#1a2744] mb-2">Instagram</h3>
          <p className="text-slate-500 mb-5">@luckymotorcars13</p>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#1a2744] hover:bg-[#243460] text-white font-bold py-3 px-8 rounded-full transition-colors w-full text-center"
          >
            Follow Instagram
          </a>
        </div>

        <div className="bg-white border border-slate-200 p-7 rounded-3xl flex flex-col items-center text-center hover:shadow-xl transition-all hover:-translate-y-1">
          <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-5 shadow-sm">
            <MapPin className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-[#1a2744] mb-2">Lokasi</h3>
          <p className="text-slate-500 mb-5 leading-relaxed">Pamulang, Tangerang Selatan</p>
          <a
            href="https://www.google.com/maps?q=Lucky+Motorcars+13+Perumahan+Jl.+Griya+Pamulang+2+Jl.+Melati+Pd.+Benda+Kec.+Pamulang+Kota+Tangerang+Selatan+Banten+16517"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-amber-500 hover:bg-amber-400 text-white font-bold py-3 px-8 rounded-full transition-colors w-full text-center"
          >
            Buka Maps
          </a>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-xl shadow-slate-200/60">
        <div className="p-6 md:p-8 border-b border-slate-200 bg-slate-50/70">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">Showroom</p>
              <h2 className="text-2xl font-black text-[#1a2744] mt-2">Lucky Motorcars 13</h2>
            </div>
            <a
              href="https://www.google.com/maps?q=Lucky+Motorcars+13+Perumahan+Jl.+Griya+Pamulang+2+Jl.+Melati+Pd.+Benda+Kec.+Pamulang+Kota+Tangerang+Selatan+Banten+16517"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-[#1a2744] text-white text-sm font-bold hover:bg-[#243460] transition-colors"
            >
              Arahkan ke lokasi
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="h-[420px] bg-slate-100">
            <iframe
              title="Lucky Motorcars 13 Maps"
              src="https://www.google.com/maps?q=Lucky+Motorcars+13+Perumahan+Jl.+Griya+Pamulang+2+Jl.+Melati+Pd.+Benda+Kec.+Pamulang+Kota+Tangerang+Selatan+Banten+16517&output=embed"
              className="w-full h-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          <div className="p-7 md:p-8 bg-white">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500 font-bold">Alamat</p>
                <p className="text-slate-700 mt-2 leading-relaxed">
                  Lucky Motorcars 13<br />
                  Perumahan, Jl. Griya Pamulang 2 Jl. Melati,<br />
                  Pd. Benda, Kec. Pamulang,<br />
                  Kota Tangerang Selatan, Banten 16517
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
              <p className="text-sm font-bold text-[#1a2744] mb-2">Keterangan</p>
              <p className="text-sm text-slate-600 leading-relaxed">
                Datang langsung ke showroom untuk melihat unit secara nyata, cek kondisi kendaraan, dan langsung berdiskusi dengan tim kami.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
