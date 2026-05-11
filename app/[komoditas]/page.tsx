"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

// DAFTAR MAHASISWA AGROTEK C TERBARU (Sesuai kode awal kamu)
const DAFTAR_MAHASISWA = [
  { npm: "25025010093", nama: "Siti Nur Fadilah" },
  { npm: "25025010094", nama: "Agnia Laquinta Al-Abin" },
  { npm: "25025010095", nama: "Afia Dwi Agustin" },
  { npm: "25025010096", nama: "Aprilita Masyfatah" },
  { npm: "25025010097", nama: "Syakila Balqis Al-Faneza" },
  { npm: "25025010098", nama: "Aulia Eka Safitri" },
  { npm: "25025010099", nama: "Callista Zahratunnisa" },
  { npm: "25025010100", nama: "Ahmat Choyrul Ferdyansyah" },
  { npm: "25025010101", nama: "Dhea Fitri Ramadhani" },
  { npm: "25025010102", nama: "Alief Rahmat Akbarani" },
  { npm: "25025010103", nama: "Karisma Zahra Lailatul Fuadah" },
  { npm: "25025010104", nama: "Jazzica Azzura Anindya Zandra" },
  { npm: "25025010105", nama: "Endyatma Adriel Fabian David" },
  { npm: "25025010106", nama: "Rizqi Surya Pratama" },
  { npm: "25025010107", nama: "Annisa Aulia Ramadani" },
  { npm: "25025010108", nama: "Eka Risziana Agustin" },
  { npm: "25025010109", nama: "Khullatul Bariroh" },
  { npm: "25025010110", nama: "Agatha Zuleyka Ramdan" },
  { npm: "25025010111", nama: "Faqihatun Nisa'" },
  { npm: "25025010112", nama: "Salsabilla Octavia Ramadhani" },
  { npm: "25025010113", nama: "Keysha Aulia Azzahra" },
  { npm: "25025010114", nama: "Angel Monica N.H" },
  { npm: "25025010115", nama: "Uswatun Khasanah" },
  { npm: "25025010116", nama: "Dharma Aji Wisnu Utama" },
  { npm: "25025010117", nama: "Keiky Resvanti Ramadhianti" },
  { npm: "25025010118", nama: "Andini Salwa Inggraini" },
  { npm: "25025010119", nama: "Talitha Listya Salsabila" },
  { npm: "25025010120", nama: "Andrea Benaya Pagonggang" },
  { npm: "25025010121", nama: "Aqdria Yashirly Amirlla" },
  { npm: "25025010122", nama: "Mohammad Rizky Hikmal Prawira" },
  { npm: "25025010123", nama: "Safrina BR Tinjak" },
  { npm: "25025010124", nama: "Citra Putri Rahmadany" },
  { npm: "25025010125", nama: "Arjuna Wira Kusuma" },
  { npm: "25025010126", nama: "Nadia Febrisca Rachma" },
  { npm: "25025010127", nama: "Khanza Afifah Amalina" },
  { npm: "25025010128", nama: "Farina Putri Aurelia" },
  { npm: "25025010129", nama: "M. Farel Al Fahrezi" },
  { npm: "25025010130", nama: "Lilis Dwi Nurfadilah" },
  { npm: "25025010131", nama: "Agnia Alya Putri" },
  { npm: "25025010132", nama: "Cika Rahma Dwi Anjarsari" },
  { npm: "25025010133", nama: "Marcelly Elza Varodies" },
  { npm: "25025010134", nama: "Muhammad Daffa Abyansyah" },
  { npm: "25025010135", nama: "Rafines Al Muslim" },
  { npm: "25025010137", nama: "Sonya Damayanti Az-Zahara" },
  { npm: "25025010138", nama: "Pratiwi Citra Oktavia" }
];

export default function InputLogbook({ params }: { params: { komoditas: string } }) {
  const router = useRouter();
  const supabase = createClient();
  const komoditasRaw = decodeURIComponent(params.komoditas);

  const [selectedObservers, setSelectedObservers] = useState<any[]>([]);
  const [isLocked, setIsLocked] = useState(false);
  const [countdown, setCountdown] = useState("");
  const [loading, setLoading] = useState(false);

  // LOGIKA BARU: Jam dinamis dari database
  const [timeConfig, setTimeConfig] = useState({ start: 15, end: 20 });

  const [formData, setFormData] = useState({
    nama: '',
    npm: '',
    kelompok: '',
    tanggal: new Date().toISOString().split('T')[0],
    kegiatan: '',
    keterangan: '',
    foto: '',
    status_akses: 'Normal'
  });

  // 1. Ambil Pengaturan Jam dari Database
  useEffect(() => {
    const fetchTime = async () => {
      const { data } = await supabase.from('config_jam').select('*').eq('id', 1).single();
      if (data) {
        setTimeConfig({ start: data.start_hour, end: data.end_hour });
      }
    };
    fetchTime();
  }, []);

  // 2. Countdown dan Pengecekan Operasional (Menggunakan Jam Dinamis)
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const wibTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
      
      const currentHour = wibTime.getHours();
      
      // Menggunakan data dari state timeConfig
      const startHour = timeConfig.start;
      const endHour = timeConfig.end;

      if (currentHour < startHour || currentHour >= endHour) {
        setIsLocked(true);
        let target = new Date(wibTime);
        if (currentHour >= endHour) target.setDate(target.getDate() + 1);
        target.setHours(startHour, 0, 0, 0);
        const diff = target.getTime() - wibTime.getTime();
        setCountdown(formatDiff(diff));
      } else {
        setIsLocked(false);
        let target = new Date(wibTime);
        target.setHours(endHour, 0, 0, 0);
        const diff = target.getTime() - wibTime.getTime();
        setCountdown(formatDiff(diff));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [timeConfig]); // Render ulang jika jam diubah admin

  const formatDiff = (ms: number) => {
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${h}j ${m}m ${s}d`;
  };

  // Efek jika status_akses berubah (TETAP SAMA)
  useEffect(() => {
    if (formData.status_akses === "Terkunci") {
      setSelectedObservers([]);
      setFormData(prev => ({ ...prev, nama: 'Libur', npm: 'Libur' }));
    } else {
      setFormData(prev => ({ ...prev, nama: '', npm: '' }));
    }
  }, [formData.status_akses]);

  const handleAddObserver = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedNama = e.target.value;
    const mhs = DAFTAR_MAHASISWA.find(item => item.nama === selectedNama);
    if (mhs && !selectedObservers.find(o => o.npm === mhs.npm)) {
      const newObservers = [...selectedObservers, mhs];
      setSelectedObservers(newObservers);
      setFormData({
        ...formData,
        nama: newObservers.map(o => o.nama).join(', '),
        npm: newObservers.map(o => o.npm).join(', ')
      });
    }
  };

  const removeObserver = (npm: string) => {
    const filtered = selectedObservers.filter(o => o.npm !== npm);
    setSelectedObservers(filtered);
    setFormData({
      ...formData,
      nama: filtered.map(o => o.nama).join(', '),
      npm: filtered.map(o => o.npm).join(', ')
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        alert("❌ Error: Format file harus Gambar (JPG/PNG)!");
        return;
      }

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        
        img.onload = () => {
          // KONFIGURASI KOMPRESI
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800; // Ukuran lebar maksimal (sudah cukup tajam untuk PDF)
          const scaleSize = MAX_WIDTH / img.width;
          
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;

          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            // Kualitas 0.7 artinya kompresi 70% (keseimbangan terbaik ukuran & ketajaman)
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
            
            setFormData({ ...formData, foto: compressedBase64 });
          }
        };
      };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return alert("⚠️ Maaf, akses pengisian sedang ditutup!");
    if (formData.status_akses === "Normal" && selectedObservers.length === 0) return alert("Pilih minimal 1 nama pengamat!");
    if (!formData.foto) return alert("Wajib upload foto dokumentasi!");
    
    setLoading(true);
    let komoditasFix = komoditasRaw.toLowerCase().includes("kol") ? "Bunga Kol" : komoditasRaw;

    try {
      const { error } = await supabase.from('logbook').insert([{ ...formData, komoditas: komoditasFix }]);
      if (error) throw error;
      alert("✅ Laporan Berhasil Disinkronkan!");
      router.push('/riwayat-logbook');
    } catch (error: any) {
      alert("❌ Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 p-6 font-sans text-slate-900">
      <div className="max-w-md mx-auto bg-white rounded-[3rem] shadow-2xl p-8 border border-slate-100">
        <header className="text-center mb-10">
          <button onClick={() => router.push('/')} className="text-[10px] font-black text-slate-300 hover:text-black uppercase tracking-widest mb-4 inline-block">← Batal</button>
          <h1 className="text-2xl font-black uppercase tracking-tighter leading-none">Isi Logbook</h1>
          <p className="text-blue-600 font-bold text-xs mt-2 uppercase tracking-widest">{komoditasRaw}</p>
          
          <div className={`mt-4 p-3 rounded-2xl border-2 inline-block px-6 ${isLocked ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
             <p className={`text-[9px] font-black uppercase tracking-widest ${isLocked ? 'text-red-500' : 'text-green-600'}`}>
                {isLocked ? "Akses Terkunci - Buka Dalam:" : "Akses Terbuka - Sisa Waktu:"}
             </p>
             <p className={`text-lg font-mono font-black ${isLocked ? 'text-red-600' : 'text-green-700'}`}>
                {countdown}
             </p>
          </div>
        </header>

        {isLocked ? (
          <div className="text-center py-10">
            <span className="text-5xl">🔒</span>
            <h2 className="text-xl font-black uppercase mt-4">Akses Ditutup</h2>
            <p className="text-sm text-slate-500 font-medium mt-2">
              Pengisian logbook hanya tersedia pukul <br/>
              <span className="font-black text-slate-900">{timeConfig.start}.00 - {timeConfig.end}.00 WIB</span>
            </p>
            <button onClick={() => router.push('/')} className="mt-8 bg-slate-900 text-white px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-widest">Kembali Nanti</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-[10px] font-black uppercase ml-4 text-slate-400 tracking-wider">Status Akses Lokasi</label>
              <select className="w-full p-4 bg-yellow-50 border-2 border-yellow-200 focus:border-blue-600 rounded-3xl outline-none font-bold text-sm"
                value={formData.status_akses} onChange={(e) => setFormData({...formData, status_akses: e.target.value})}>
                <option value="Normal">🔓 Akses Normal</option>
                <option value="Terkunci">🔒 Akses Terkunci (Hari Libur)</option>
              </select>
            </div>

            {formData.status_akses === "Normal" ? (
              <>
                <div>
                  <label className="text-[10px] font-black uppercase ml-4 text-slate-400 tracking-wider">Pilih Pengamat</label>
                  <select className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-blue-600 rounded-3xl font-bold text-sm"
                    onChange={handleAddObserver} value="">
                    <option value="">-- Tambah Nama --</option>
                    {DAFTAR_MAHASISWA.map((mhs, idx) => (<option key={idx} value={mhs.nama}>{mhs.nama}</option>))}
                  </select>
                  <div className="flex flex-wrap gap-2 mt-3 px-2">
                    {selectedObservers.map((o) => (
                      <div key={o.npm} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-2 border border-blue-100">
                        {o.nama} <button type="button" onClick={() => removeObserver(o.npm)} className="hover:text-red-600 text-lg">&times;</button>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase ml-4 text-slate-400 tracking-wider">NPM Pengamat</label>
                  <input type="text" readOnly className="w-full p-4 bg-slate-100 border-none rounded-3xl font-mono text-slate-500 text-[10px]" value={formData.npm} />
                </div>
              </>
            ) : (
              <div className="p-4 bg-red-50 rounded-3xl border border-red-100 text-center font-black text-red-600 text-[10px] uppercase">Data Nama & NPM otomatis diatur sebagai "Libur"</div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <input type="number" required placeholder="Kelompok" className="p-4 bg-slate-50 border-2 border-transparent focus:border-blue-600 rounded-3xl font-bold" onChange={(e) => setFormData({...formData, kelompok: e.target.value})} />
              <input type="date" required className="p-4 bg-slate-50 border-2 border-transparent focus:border-blue-600 rounded-3xl font-bold text-sm" value={formData.tanggal} onChange={(e) => setFormData({...formData, tanggal: e.target.value})} />
            </div>

            <input type="text" required placeholder="Kegiatan" className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-blue-600 rounded-3xl text-sm font-medium" onChange={(e) => setFormData({...formData, kegiatan: e.target.value})} />
            <textarea placeholder="Keterangan..." className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-blue-600 rounded-3xl h-24 text-sm resize-none" onChange={(e) => setFormData({...formData, keterangan: e.target.value})}></textarea>

            <input type="file" accept=".jpg,.jpeg" onChange={handleFileChange} className="hidden" id="upload-foto" />
            <label htmlFor="upload-foto" className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-3xl cursor-pointer hover:border-blue-600">
              <span className="text-2xl">{formData.foto ? "✅" : "📸"}</span>
              <span className="text-[10px] font-black uppercase text-slate-400 text-center">{formData.foto ? "Foto Terpilih" : "Upload Foto (Maks 2MB)"}</span>
            </label>

            <button type="submit" disabled={loading} className="w-full bg-slate-950 text-white p-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs hover:bg-blue-600 transition-all shadow-xl disabled:opacity-50">
              {loading ? "Menyinkronkan..." : "Kirim Laporan"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}