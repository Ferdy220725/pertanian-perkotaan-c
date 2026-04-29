"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
// Import Supabase client
import { createClient } from '@/utils/supabase/client';

export default function Home() {
  const supabase = createClient();
  const [showGuide, setShowGuide] = useState(false);

  // --- LOGIKA BARU: STATE IDENTITAS & JADWAL ---
  const [showGroupInput, setShowGroupInput] = useState(false);
  const [inputKelompok, setInputKelompok] = useState("");
  const [groupNumber, setGroupNumber] = useState("");
  const [showJadwalLock, setShowJadwalLock] = useState(false);
  const [currentTask, setCurrentTask] = useState<{ type: string, msg: string, detail: React.ReactNode } | null>(null);

  // --- LOGIKA BARU: STATE MAHASISWA TERRAJIN ---
  const [weeklyHero, setWeeklyHero] = useState<{
    nama: string,
    npm: string,
    kelompok: string,
    count: number
  } | null>(null);

  // Data Jadwal Universal
  const JADWAL_PUPUK = ["2026-04-28", "2026-05-02", "2026-05-06", "2026-05-10", "2026-05-14", "2026-05-18", "2026-05-22", "2026-05-26", "2026-05-30", "2026-06-03"];
  const JADWAL_PESTISIDA = ["2026-04-28", "2026-05-05", "2026-05-12", "2026-05-19", "2026-05-26", "2026-06-02"];

  // LOGIKA: Cek apakah user pernah menutup panduan secara permanen
  useEffect(() => {
    // 1. Cek Identitas Kelompok
    const savedGroup = localStorage.getItem('agrotek_group_identity');
    if (!savedGroup) {
      setShowGroupInput(true);
    } else {
      setGroupNumber(savedGroup);
      checkDailyJadwal();
    }

    // 2. Cek Panduan (Logika Asli)
    const isGuideHidden = localStorage.getItem('hideAgrotekGuide');
    if (!isGuideHidden) {
      setShowGuide(true);
    }

    // 3. Ambil Data Mahasiswa Ter-Rajin (Mingguan)
    fetchWeeklyHero();
  }, []);

  // --- LOGIKA BARU: FUNGSI AMBIL PEMENANG MINGGUAN (DENGAN FALLBACK MINGGU LALU) ---
  const fetchWeeklyHero = async () => {
    try {
      const now = new Date();
      
      // A. LOGIKA MINGGU LALU (Tujuan Utama)
      const lastMonday = new Date(now);
      lastMonday.setDate(now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1) - 7);
      lastMonday.setHours(0, 0, 0, 0);

      const lastSunday = new Date(lastMonday);
      lastSunday.setDate(lastMonday.getDate() + 6);
      lastSunday.setHours(23, 59, 59, 999);

      // B. LOGIKA MINGGU BERJALAN (Untuk Fallback Minggu Pertama)
      const thisMonday = new Date(now);
      thisMonday.setDate(now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1));
      thisMonday.setHours(0, 0, 0, 0);

      // Coba ambil data minggu lalu dulu
      let { data, error } = await supabase
        .from('logbook')
        .select('nama, npm, kelompok, created_at')
        .gte('created_at', lastMonday.toISOString())
        .lte('created_at', lastSunday.toISOString());

      if (error) throw error;

      // FALLBACK: Jika minggu lalu kosong (karena ini minggu pertama), ambil data minggu berjalan
      if (!data || data.length === 0) {
        const { data: currentData, error: currentError } = await supabase
          .from('logbook')
          .select('nama, npm, kelompok, created_at')
          .gte('created_at', thisMonday.toISOString())
          .lte('created_at', now.toISOString());
        
        if (currentError) throw currentError;
        data = currentData;
      }

      if (data && data.length > 0) {
        const counts: { [key: string]: { nama: string, npm: string, kelompok: string, count: number, lastEntry: string } } = {};
        
        data.forEach(log => {
          const userKey = log.npm;
          if (!counts[userKey]) {
            counts[userKey] = { 
              nama: log.nama, 
              npm: log.npm, 
              kelompok: log.kelompok.toString(), 
              count: 0, 
              lastEntry: log.created_at 
            };
          }

          counts[userKey].count += 1;
          if (new Date(log.created_at) > new Date(counts[userKey].lastEntry)) {
            counts[userKey].lastEntry = log.created_at;
          }
        });

        const sorted = Object.values(counts).sort((a, b) => {
          if (b.count !== a.count) return b.count - a.count;
          return new Date(b.lastEntry).getTime() - new Date(a.lastEntry).getTime();
        });

        if (sorted[0]) setWeeklyHero(sorted[0]);
      }
    } catch (err) {
      console.error("Error Hero:", err);
    }
  };

  // --- LOGIKA BARU: FUNGSI PENGECEKAN JADWAL ---
  const checkDailyJadwal = () => {
    const today = new Date().toLocaleDateString('en-CA'); 
    const hasFinishedToday = localStorage.getItem(`finished_task_${today}`);

    if (hasFinishedToday) return; 

    const isPupukDay = JADWAL_PUPUK.includes(today);
    const isPestisidaDay = JADWAL_PESTISIDA.includes(today);

    if (isPupukDay || isPestisidaDay) {
      setCurrentTask({
        type: isPupukDay && isPestisidaDay ? "Pupuk & Pestisida" : isPupukDay ? "Pupuk" : "Pestisida",
        msg: isPupukDay && isPestisidaDay ? "Hari ini jadwal Pemupukan & Pestisida!" : isPupukDay ? "Hari ini jadwal Pemberian Pupuk!" : "Hari ini jadwal Penyemprotan Pestisida!",
        detail: (
          <div className="space-y-4">
            {isPupukDay && (
              <div className={isPestisidaDay ? "border-b border-slate-200 pb-3" : ""}>
                <p className="font-bold text-emerald-700">🌱 Pemberian Pupuk</p>
                <p className="text-xs text-slate-600 leading-relaxed">Dilakukan setiap 4 hari sekali dengan dosis 5 sendok makan pupuk per 10 liter air. Pengaplikasian dilakukan secukupnya, dengan ketentuan 1 gayung digunakan untuk 2–3 tanaman.</p>
              </div>
            )}
            {isPestisidaDay && (
              <div className="pt-1">
                <p className="font-bold text-red-700">🐛 Penyemprotan Pestisida</p>
                <p className="text-xs text-slate-600 leading-relaxed">Dilakukan setiap 1 minggu sekali untuk mencegah dan mengendalikan hama tanaman secara rutin.</p>
              </div>
            )}
          </div>
        )
      });
      setShowJadwalLock(true);
    }
  };

  const handleSaveGroup = () => {
    if (inputKelompok.trim() !== "") {
      localStorage.setItem('agrotek_group_identity', inputKelompok);
      setGroupNumber(inputKelompok);
      setShowGroupInput(false);
      checkDailyJadwal();
    } else {
      alert("Mohon masukkan nomor kelompok Anda.");
    }
  };

  const handleFinishTask = () => {
    const today = new Date().toLocaleDateString('en-CA');
    localStorage.setItem(`finished_task_${today}`, 'true');
    setShowJadwalLock(false);
  };

  const closeGuidePermanently = () => {
    localStorage.setItem('hideAgrotekGuide', 'true');
    setShowGuide(false);
  };

  const komoditas = [
    { id: 'cabai', nama: 'Cabai rawit (Capsicum frutescens L.)', icon: '🌶️', warna: 'bg-red-50 text-red-600 border-red-100' },
    { id: 'bunga-kol', nama: 'Bunga Kol (Brassica oleracea var. botrytis L.)', icon: '🥦', warna: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
    { id: 'tomat', nama: 'Tomat (Solanum lycopersicum)', icon: '🍅', warna: 'bg-orange-50 text-orange-600 border-orange-100' },
    { id: 'seledri', nama: 'Seledri (Apium groweolens L.)', icon: '🌿', warna: 'bg-green-50 text-green-600 border-green-100' },
  ];

  return (
    <main className="min-h-screen bg-[#F8F9FA] p-5 md:p-10 font-sans text-slate-900 antialiased overflow-x-hidden">
      
      {/* MODAL IDENTITAS KELOMPOK */}
      {showGroupInput && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-10 text-center border-4 border-[#800020]">
            <span className="text-5xl mb-4 block">👋</span>
            <h2 className="text-2xl font-black uppercase tracking-tighter mb-2 text-slate-900">Selamat Datang!</h2>
            <p className="text-sm text-slate-500 mb-8">Sebelum melanjutkan, beri tahu kami Anda dari kelompok berapa?</p>
            <input 
              type="number" 
              placeholder="Contoh: 1"
              value={inputKelompok}
              onChange={(e) => setInputKelompok(e.target.value)}
              className="w-full p-4 border-2 border-slate-100 rounded-2xl mb-4 text-center text-xl font-bold focus:border-[#800020] outline-none transition-all text-slate-900"
            />
            <button 
              onClick={handleSaveGroup}
              className="w-full bg-[#800020] text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-black transition-all"
            >
              KONFIRMASI IDENTITAS
            </button>
          </div>
        </div>
      )}

      {/* MODAL JADWAL LOCKDOWN */}
      {showJadwalLock && !showGroupInput && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-[#800020]/90 backdrop-blur-md">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl p-10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-yellow-400"></div>
            <div className="text-center mb-6">
              <span className="text-5xl mb-4 block animate-bounce">
                {currentTask?.type.includes("Pupuk") ? "🌱" : "🐛"}
              </span>
              <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 italic">
                Panggilan Aksi: Kelompok {groupNumber}
              </h2>
              <p className="text-sm font-bold text-[#800020] mt-1 uppercase tracking-widest">{currentTask?.msg}</p>
            </div>

            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 mb-8">
              <h3 className="text-[10px] font-black uppercase tracking-[.2em] text-slate-400 mb-4">Instruksi Khusus:</h3>
              <div className="text-sm leading-relaxed text-slate-700">
                {currentTask?.detail}
              </div>
            </div>

            <button 
              onClick={handleFinishTask}
              className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-sm tracking-[.2em] hover:bg-green-600 transition-all flex items-center justify-center gap-3 shadow-xl"
            >
              SAYA SUDAH SELESAI MENGERJAKAN ✅
            </button>
            <p className="text-[9px] text-center text-slate-400 mt-4 uppercase font-bold tracking-widest">Akses website terkunci hingga tugas dilaporkan selesai.</p>
          </div>
        </div>
      )}

      {/* MODAL PANDUAN */}
      {showGuide && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-[2.5rem] shadow-2xl p-8 md:p-10 relative">
            <button onClick={() => setShowGuide(false)} className="absolute top-6 right-6 text-slate-300 hover:text-slate-900 text-2xl font-black">&times;</button>
            
            <article className="prose prose-slate max-w-none">
              <h2 className="text-2xl font-black tracking-tighter uppercase mb-4 text-[#800020]">📑 Panduan Penggunaan Sistem Logbook Agrotek C</h2>
              <p className="text-sm font-medium text-slate-500 mb-6">
                Website ini dirancang untuk memudahkan kita monitoring pertumbuhan & perkembangan tanaman di rooftop secara kolektif.
              </p>
              
              <div className="space-y-6 text-sm leading-relaxed">
                <section>
                  <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs">1. Cara Mengisi Logbook Harian</h3>
                  <p className="text-slate-600 mt-1">Bagian ini digunakan setiap kali kamu melakukan pengamatan di rooftop.</p>
                  <ul className="list-disc ml-5 space-y-1 text-slate-600">
                    <li><b>Pilih Komoditas:</b> Klik tombol komoditas di halaman utama.</li>
                    <li><b>Input Nama Pengamat:</b> Klik dropdown, pilih nama yang bertugas.</li>
                    <li><b>Ketentuan Foto:</b> Format JPG, maksimal 2 MB, rasio 1:1.</li>
                  </ul>
                </section>

                <div className="bg-amber-50 p-5 rounded-3xl border border-amber-100">
                  <h3 className="font-black text-amber-800 uppercase tracking-wider text-[10px] mb-2">⚠️ Rutinitas Penyiraman</h3>
                  <ul className="list-none space-y-2 text-amber-900 font-medium">
                    <li>💧 <b>Wajib Siram 2x Sehari:</b> Pagi dan Sore.</li>
                    <li>🕒 <b>Logbook Diisi Sore:</b> Setelah penyiraman kedua selesai.</li>
                  </ul>
                </div>
              </div>

              <div className="mt-8 flex flex-col md:flex-row gap-4">
                <button onClick={() => setShowGuide(false)} className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-bold text-sm hover:bg-black transition-all">Paham, Mengerti</button>
                <button onClick={closeGuidePermanently} className="flex-1 bg-slate-100 text-slate-500 py-4 rounded-2xl font-bold text-sm hover:bg-red-50 hover:text-red-600 transition-all">Jangan Tampilkan Lagi</button>
              </div>
            </article>
          </div>
        </div>
      )}

      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-5%] right-[-5%] w-[300px] md:w-[400px] h-[300px] md:h-[400px] rounded-full bg-[#800020]/5 blur-[80px] md:blur-[120px]"></div>
        <div className="absolute bottom-[-5%] left-[-5%] w-[250px] md:w-[300px] h-[250px] md:h-[300px] rounded-full bg-yellow-500/5 blur-[80px] md:blur-[100px]"></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* HEADER */}
        <header className="mb-10 md:mb-16 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="h-[3px] w-6 bg-[#800020] rounded-full"></span>
              <span className="text-[10px] font-bold tracking-[.3em] text-slate-400 uppercase">Dashboard v2.0</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight">
              Monitoring Projek <span className="text-[#800020] block md:inline">Pertanian Perkotaan</span>
            </h1>
            <p className="text-base md:text-lg font-medium text-slate-500">
              Agroteknologi C <span className="text-yellow-600">2025</span>
            </p>
          </div>
          
          <div className="flex flex-col items-end gap-2 self-start md:self-auto">
            <div className="flex items-center gap-4 bg-white p-2 pr-5 rounded-full shadow-sm border border-slate-100">
              <div className="w-10 h-10 rounded-full bg-[#800020] flex items-center justify-center text-white font-bold shadow-md shadow-[#800020]/20">A</div>
              <div className="text-sm">
                <p className="font-bold text-slate-800 leading-none">
                  Kelompok {groupNumber || '...'} 
                  {/* EMOTE API LOGIC: Tampil jika kelompok ini adalah kelompok pemenang mingguan */}
                  {weeklyHero && weeklyHero.kelompok === groupNumber && <span className="ml-1 animate-pulse">🔥</span>}
                </p>
                <p className="text-[10px] text-green-600 font-bold uppercase mt-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Online
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 mr-4">
              <Link href="/admin-control" className="text-[9px] font-black uppercase tracking-widest text-slate-300 hover:text-[#800020] transition-colors">
                🔒 Admin Panel
              </Link>
              <span className="w-[1px] h-3 bg-slate-200"></span>
              <button onClick={() => setShowGuide(true)} className="text-[10px] font-black uppercase tracking-widest text-[#800020] hover:underline transition-all">
                📖 Panduan Penggunaan
              </button>
            </div>
          </div>
        </header>

        {/* --- WEEKLY HERO SECTION (Unique & Luxurious) --- */}
        {weeklyHero && (
          <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-1000">
             <div className="relative overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 rounded-[2.5rem] p-6 md:p-10 border-2 border-yellow-500/30 shadow-[0_20px_50px_rgba(0,0,0,0.2)]">
                {/* Efek Kilau Gold */}
                <div className="absolute top-0 left-[-100%] w-full h-full bg-gradient-to-r from-transparent via-yellow-500/10 to-transparent skew-x-[-20deg] animate-[shimmer_5s_infinite]"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                   <div className="flex-shrink-0 relative">
                      <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-yellow-400 to-yellow-700 rounded-3xl flex items-center justify-center text-4xl shadow-lg border-4 border-slate-900 transform -rotate-3 rotate-3 hover:rotate-0 transition-transform">
                        🏆
                      </div>
                      <div className="absolute -bottom-2 -right-2 bg-white text-black text-[10px] font-black px-3 py-1 rounded-full shadow-sm border border-yellow-500">
                        HERO
                      </div>
                   </div>
                   
                   <div className="text-center md:text-left space-y-3">
                      <h3 className="text-[10px] font-black uppercase tracking-[.4em] text-yellow-500/80">Mahasiswa Ter-Rajin Minggu Ini</h3>
                      <p className="text-white text-sm md:text-base font-medium leading-relaxed italic">
                        "SELAMAT, <span className="text-yellow-400 font-black not-italic underline decoration-yellow-500/50 underline-offset-4">{weeklyHero.nama}</span>! Kamu mahasiswa ter rajin minggu ini. Effortmu secerah sinar matahari pagi. Pertahankan ritme kerjamu!"
                      </p>
                      <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
                         <div className="bg-white/5 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl">
                            <p className="text-[8px] text-slate-400 uppercase font-bold">NPM</p>
                            <p className="text-xs text-white font-mono">{weeklyHero.npm}</p>
                         </div>
                         <div className="bg-white/5 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl">
                            <p className="text-[8px] text-slate-400 uppercase font-bold">Kelompok</p>
                            <p className="text-xs text-white font-bold">{weeklyHero.kelompok} <span className="animate-pulse">🔥</span></p>
                         </div>
                         <div className="bg-white/5 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl">
                            <p className="text-[8px] text-slate-400 uppercase font-bold">Total Log</p>
                            <p className="text-xs text-white font-bold">{weeklyHero.count} Aktivitas</p>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        )}

        {/* MAIN NAVIGATION GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 mb-12">
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

        {/* COMMODITY SECTION */}
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

        {/* FOOTER */}
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
      
      {/* Tambahkan CSS Animasi Shimmer untuk kartu mewah */}
      <style jsx global>{`
        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 100%; }
        }
      `}</style>
    </main>
  );
}