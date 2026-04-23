"use client";
import React from 'react';
import Link from 'next/link';

export default function Home() {
  const komoditas = [
    { id: 'cabai', nama: 'Cabai', icon: '🌶️', warna: 'bg-red-50 text-red-600 border-red-100' },
    { id: 'bunga-kol', nama: 'Bunga Kol', icon: '🥦', warna: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
    { id: 'tomat', nama: 'Tomat', icon: '🍅', warna: 'bg-orange-50 text-orange-600 border-orange-100' },
    { id: 'seledri', nama: 'Seledri', icon: '🌿', warna: 'bg-green-50 text-green-600 border-green-100' },
  ];

  return (
    <main className="min-h-screen bg-[#F8F9FA] p-5 md:p-10 font-sans text-slate-900 antialiased overflow-x-hidden">
      {/* Background Decor - Dioptimasi agar tidak menumpuk di layar kecil */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-5%] right-[-5%] w-[300px] md:w-[400px] h-[300px] md:h-[400px] rounded-full bg-[#800020]/5 blur-[80px] md:blur-[120px]"></div>
        <div className="absolute bottom-[-5%] left-[-5%] w-[250px] md:w-[300px] h-[250px] md:h-[300px] rounded-full bg-yellow-500/5 blur-[80px] md:blur-[100px]"></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* HEADER - Responsive alignment */}
        <header className="mb-10 md:mb-16 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="h-[3px] w-6 bg-[#800020] rounded-full"></span>
              <span className="text-[10px] font-bold tracking-[.3em] text-slate-400 uppercase">Dashboard v2.0</span>
            </div>
            {/* Ukuran teks adaptif: text-3xl di HP, text-5xl di Desktop */}
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight">
              Monitoring Projek <span className="text-[#800020] block md:inline">Pertanian Perkotaan</span>
            </h1>
            <p className="text-base md:text-lg font-medium text-slate-500">
              Agroteknologi C <span className="text-yellow-600">2025</span>
            </p>
          </div>
          
          <div className="flex items-center gap-4 bg-white p-2 pr-5 rounded-full shadow-sm border border-slate-100 self-start md:self-auto">
            <div className="w-10 h-10 rounded-full bg-[#800020] flex items-center justify-center text-white font-bold shadow-md shadow-[#800020]/20">A</div>
            <div className="text-sm">
              <p className="font-bold text-slate-800 leading-none">Sobat Agrotek C</p>
              <p className="text-[10px] text-green-600 font-bold uppercase mt-1 flex items-center gap-1.5">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Online
              </p>
            </div>
          </div>
        </header>

        {/* MAIN NAVIGATION GRID - 1 Kolom di HP, 2 Kolom di Desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 mb-12">
          {/* Card 1: Riwayat */}
          <Link href="/riwayat-logbook" className="group active:scale-[0.98] transition-transform">
            <div className="relative overflow-hidden bg-slate-900 rounded-[2.5rem] p-8 h-60 md:h-64 flex flex-col justify-between transition-all hover:shadow-xl">
              <div className="absolute top-0 right-0 p-6 md:p-8 opacity-10 group-hover:opacity-20 transition-opacity select-none">
                <span className="text-7xl md:text-9xl tracking-tighter font-black text-white italic">01</span>
              </div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-2xl mb-4 backdrop-blur-md border border-white/10">📁</div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Riwayat Logbook</h2>
                <p className="text-slate-400 text-sm mt-1 max-w-[220px]">Arsip data harian kelompok.</p>
              </div>
              <div className="relative z-10">
                <span className="inline-flex items-center gap-2 text-[10px] font-black text-white bg-[#800020] px-5 py-2.5 rounded-full tracking-widest uppercase transition-all group-hover:gap-4">
                  Lihat Arsip <span>→</span>
                </span>
              </div>
            </div>
          </Link>

          {/* Card 2: Laporan */}
          <Link href="/laporan" className="group active:scale-[0.98] transition-transform">
            <div className="relative overflow-hidden bg-white border border-slate-200 rounded-[2.5rem] p-8 h-60 md:h-64 flex flex-col justify-between transition-all hover:shadow-xl hover:border-yellow-500/30">
              <div className="absolute top-0 right-0 p-6 md:p-8 opacity-5 select-none">
                <span className="text-7xl md:text-9xl tracking-tighter font-black text-black italic">02</span>
              </div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-yellow-50 rounded-2xl flex items-center justify-center text-2xl mb-4 border border-yellow-100 shadow-sm">📄</div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Laporan Mingguan</h2>
                <p className="text-slate-500 text-sm mt-1 max-w-[220px]">Ekspor otomatis ke format .DOCS.</p>
              </div>
              <div className="relative z-10">
                <span className="inline-flex items-center gap-2 text-[10px] font-black text-slate-900 border border-slate-200 px-5 py-2.5 rounded-full tracking-widest uppercase group-hover:bg-slate-900 group-hover:text-white transition-all">
                  Susun Laporan
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* COMMODITY SECTION - Grid 2 kolom di HP sangat penting agar tidak kekecilan */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-8">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[.3em] whitespace-nowrap">Pilih Komoditas</h3>
            <div className="h-[1px] flex-1 bg-slate-200"></div>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {komoditas.map((item) => (
              <Link href={`/${item.id}`} key={item.id} className="group active:scale-95 transition-transform">
                <div className={`p-6 rounded-[2rem] border ${item.warna} transition-all group-hover:shadow-md flex flex-col items-center justify-center text-center h-44 md:h-48 bg-white`}>
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
                    {item.icon}
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm md:text-base tracking-tight">{item.nama}</h4>
                  <div className="mt-3 h-[2px] w-6 bg-slate-100 group-hover:bg-[#800020] transition-colors rounded-full"></div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* FOOTER - Minimalist & Mobile Friendly */}
        <footer className="mt-20 py-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
            <div className="text-lg font-black tracking-tighter text-slate-900">
              UPN <span className="text-[#800020]">VETERAN</span> JATIM
            </div>
            <div className="hidden md:block w-[1px] h-4 bg-slate-300"></div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Pertanian 2026</p>
          </div>
          <p className="text-[10px] text-slate-400 font-medium max-w-[200px] md:max-w-none">
            Dirancang untuk efisiensi data pertanian perkotaan.
          </p>
        </footer>
      </div>
    </main>
  );
}