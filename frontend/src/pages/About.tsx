export default function About() {
  const values = [
    {
      title: 'Transparan',
      text: 'Setiap unit kami hadir dengan informasi yang jelas, jujur, dan dapat dipercaya agar keputusan Anda lebih aman.'
    },
    {
      title: 'Nyaman',
      text: 'Proses jual beli terasa lebih mudah karena kami membantu dari awal sampai transaksi selesai dengan komunikasi yang jelas.'
    },
    {
      title: 'Berkualitas',
      text: 'Kami fokus pada kendaraan pilihan yang siap dipakai, siap dikendarai, dan siap memberikan kepuasan bagi pembeli.'
    }
  ];

  return (
    <div className="container mx-auto px-4 max-w-6xl py-12 md:py-20">
      <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-xl shadow-slate-200/60 mb-10">
        <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="bg-gradient-to-br from-[#0f1c38] via-[#16284d] to-[#1a2744] p-8 md:p-12 text-white flex flex-col justify-center">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-amber-300 mb-4">Tentang Kami</p>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">Lucky MotorCars 13</h1>
            <p className="text-slate-200 text-lg leading-relaxed">
              Platform jual beli kendaraan yang menghadirkan solusi praktis, transparan, dan terpercaya untuk kebutuhan mobil dan motor Anda.
            </p>
          </div>

          <div className="p-4 md:p-6 bg-slate-50">
            <img
              src="https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&q=80&w=1200"
              alt="Lucky MotorCars 13 showroom"
              className="w-full h-full min-h-[300px] object-cover rounded-[24px]"
            />
          </div>
        </div>
      </div>

      <div className="mb-10 text-center max-w-3xl mx-auto">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-amber-600 mb-3">Our Story</p>
        <h2 className="text-3xl md:text-4xl font-black text-[#1a2744] tracking-tighter mb-4">
          Solusi kendaraan yang lebih mudah, lebih aman, dan lebih nyaman.
        </h2>
        <p className="text-lg text-slate-600 leading-relaxed">
          Lucky MotorCars 13 hadir untuk membuat proses mencari, membeli, menjual, dan titip jual kendaraan menjadi pengalaman yang lebih simpel dan menyenangkan. Dengan moto <span className="font-semibold text-[#1a2744]">"Quality Used Car Solutions"</span>, kami berkomitmen memberikan layanan yang profesional, jujur, dan berdampak positif bagi pelanggan.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {values.map((item) => (
          <div key={item.title} className="bg-white border border-slate-200 rounded-3xl p-7 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
              <span className="text-xl font-black">✓</span>
            </div>
            <h3 className="text-xl font-black text-[#1a2744] mb-3">{item.title}</h3>
            <p className="text-slate-600 leading-relaxed">{item.text}</p>
          </div>
        ))}
      </div>

      <div className="bg-[#1a2744] rounded-[32px] p-8 md:p-12 text-white">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-amber-300 mb-4">Komitmen Kami</p>
            <h3 className="text-3xl font-black tracking-tighter mb-4">Membantu Anda menemukan kendaraan yang tepat.</h3>
            <p className="text-slate-200 leading-relaxed text-lg">
              Kami percaya setiap pembeli maupun penjual membutuhkan proses yang tidak hanya cepat, tapi juga aman dan menguntungkan. Oleh karena itu, Lucky MotorCars 13 selalu menghadirkan pelayanan yang ramah, profesional, dan berorientasi pada kebutuhan pelanggan.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <p className="text-3xl font-black text-amber-400">150+</p>
              <p className="text-slate-200 mt-2">Unit siap jual</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <p className="text-3xl font-black text-amber-400">24/7</p>
              <p className="text-slate-200 mt-2">Respons cepat</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 col-span-2">
              <p className="text-3xl font-black text-amber-400">100%</p>
              <p className="text-slate-200 mt-2">Transparan dan customer first</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
