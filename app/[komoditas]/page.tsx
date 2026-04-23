"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

// DAFTAR MAHASISWA AGROTEK C TERBARU
const DAFTAR_MAHASISWA = [
  { npm: "25025010093", nama: "SITI NUR FADILAH" },
  { npm: "25025010094", nama: "AGNIA LAQUINTA A-Abin" },
  { npm: "25025010095", nama: "AFIA DWI AGUSTIN" },
  { npm: "25025010096", nama: "APRILITA MASYFATAH" },
  { npm: "25025010097", nama: "SYAKILA BALQIS AL-FANEZA" },
  { npm: "25025010098", nama: "AULIA EKA SAFITRI" },
  { npm: "25025010099", nama: "CALLISTA ZAHRATUNNISA" },
  { npm: "25025010100", nama: "AHMAT CHOYRUL FERDYANSYAH" },
  { npm: "25025010101", nama: "DHEA FITRI RAMADHANI" },
  { npm: "25025010102", nama: "ALIEF RAHMAT AKBARANI" },
  { npm: "25025010103", nama: "KARISMA ZAHRA LAILATUL FUADAH" },
  { npm: "25025010104", nama: "JAZZICA AZZURRA ANINDYA ZANDRA" },
  { npm: "25025010105", nama: "ENDYATMA ADRIEL FABIAN DAVID" },
  { npm: "25025010106", nama: "RIZQI SURYA PRATAMA" },
  { npm: "25025010107", nama: "ANNISA AULIA RAMADANI" },
  { npm: "25025010108", nama: "EKA RISZIANA AGUSTIN" },
  { npm: "25025010109", nama: "KHULLATUL BARIROH" },
  { npm: "25025010110", nama: "AGATHA ZULEYKA RAMDAN" },
  { npm: "25025010110", nama: "ANDINI SALWA INGGRAINI" },
  { npm: "25025010111", nama: "FAQIHATUN NISA'" },
  { npm: "25025010112", nama: "SALSABILLA OCTAVIA RAMADHANI" },
  { npm: "25025010113", nama: "KEYSHA AULIA AZZAHRA" },
  { npm: "25025010114", nama: "ANGEL MONICA NH" },
  { npm: "25025010115", nama: "USWATUN KHASANAH" },
  { npm: "25025010116", nama: "DHARMA AJI WISNU Utama" },
  { npm: "25025010117", nama: "KEIKY RESVANTI RAMADHANTI" },
  { npm: "25025010119", nama: "TALITHA LISTYA SALSABILA" },
  { npm: "25025010120", nama: "ANDREA BENAYA PAGONGGANG" },
  { npm: "25025010121", nama: "AQDRIA YASHIRLY AMIRLLA" },
  { npm: "25025010122", nama: "MOHAMMAD RIZKY HIKMA PRAWIRA" },
  { npm: "25025010123", nama: "SAFRINA BR TINJKA" },
  { npm: "25025010124", nama: "CITRA PUTRI RAHMADANY" },
  { npm: "25025010125", nama: "ARJUNA WIRA KUSUMA" },
  { npm: "25025010126", nama: "NADIA FEBRISCA RACHMA" },
  { npm: "25025010127", nama: "KHANZA AFIFAH AMALINA" },
  { npm: "25025010128", nama: "FARINA PUTRI AURELIA" },
  { npm: "25025010129", nama: "M. FAREL AL FAHREZI" },
  { npm: "25025010130", nama: "LILIS DWI NURFADILAH" },
  { npm: "25025010131", nama: "AGNIA ALYA PUTRI" },
  { npm: "25025010132", nama: "CIKA RAHMA DWI ANJARSARI" },
  { npm: "25025010133", nama: "MARCELLY ELZA VARODIES" },
  { npm: "25025010134", nama: "MUHAMMAD DAFFA ABYANSYAH" },
  { npm: "25025010135", nama: "RAFINES AL MUSLIM" },
  { npm: "25025010137", nama: "SONYA DAMAYANTI AZ-ZAHARA" },
  { npm: "25025010138", nama: "PRATIWI CITRA OKTAVIA" }
];

export default function InputLogbook({ params }: { params: { komoditas: string } }) {
  const router = useRouter();
  const supabase = createClient();
  const komoditas = decodeURIComponent(params.komoditas);

  const [formData, setFormData] = useState({
    nama: '',
    npm: '',
    kelompok: '',
    tanggal: new Date().toISOString().split('T')[0],
    kegiatan: '',
    keterangan: '',
    foto: ''
  });

  const [loading, setLoading] = useState(false);

  // Auto-fill NPM saat nama dipilih
  const handleSelectMahasiswa = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedNama = e.target.value;
    const mhs = DAFTAR_MAHASISWA.find(item => item.nama === selectedNama);
    if (mhs) {
      setFormData({ ...formData, nama: mhs.nama, npm: mhs.npm });
    } else {
      setFormData({ ...formData, nama: '', npm: '' });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, foto: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.foto) return alert("Wajib upload foto dokumentasi!");
    setLoading(true);

    try {
      const { error } = await supabase.from('logbook').insert([{
        ...formData,
        komoditas: komoditas
      }]);

      if (error) throw error;

      alert("✅ Laporan Berhasil Disinkronkan ke Cloud!");
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
          <button onClick={() => router.push('/')} className="text-[10px] font-black text-slate-300 hover:text-black uppercase tracking-widest mb-4 inline-block transition-colors">← Batal</button>
          <h1 className="text-2xl font-black uppercase tracking-tighter leading-none">Isi Logbook</h1>
          <p className="text-blue-600 font-bold text-xs mt-2 uppercase tracking-widest">{komoditas}</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Dropdown Nama Mahasiswa */}
          <div>
            <label className="text-[10px] font-black uppercase ml-4 text-slate-400 tracking-wider">Nama Mahasiswa</label>
            <select 
              required
              className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-blue-600 rounded-3xl outline-none transition-all appearance-none cursor-pointer font-bold text-sm"
              onChange={handleSelectMahasiswa}
              value={formData.nama}
            >
              <option value="">-- Pilih Nama Kamu --</option>
              {DAFTAR_MAHASISWA.map((mhs, idx) => (
                <option key={idx} value={mhs.nama}>{mhs.nama}</option>
              ))}
            </select>
          </div>

          {/* NPM Terisi Otomatis */}
          <div>
            <label className="text-[10px] font-black uppercase ml-4 text-slate-400 tracking-wider">NPM (Otomatis)</label>
            <input 
              type="text" readOnly
              className="w-full p-4 bg-slate-100 border-none rounded-3xl outline-none font-mono text-slate-500 text-sm"
              value={formData.npm}
              placeholder="Pilih nama untuk isi NPM..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black uppercase ml-4 text-slate-400 tracking-wider">Kelompok</label>
              <input 
                type="number" required placeholder="No"
                className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-blue-600 rounded-3xl outline-none font-bold"
                onChange={(e) => setFormData({...formData, kelompok: e.target.value})}
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase ml-4 text-slate-400 tracking-wider">Tanggal</label>
              <input 
                type="date" required
                className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-blue-600 rounded-3xl outline-none font-bold text-sm"
                value={formData.tanggal}
                onChange={(e) => setFormData({...formData, tanggal: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase ml-4 text-slate-400 tracking-wider">Kegiatan</label>
            <input 
              type="text" required placeholder="Contoh: Penyiangan gulma"
              className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-blue-600 rounded-3xl outline-none text-sm font-medium"
              onChange={(e) => setFormData({...formData, kegiatan: e.target.value})}
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase ml-4 text-slate-400 tracking-wider">Keterangan</label>
            <textarea 
              placeholder="Jelaskan detail pengamatan/kegiatan..."
              className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-blue-600 rounded-3xl outline-none h-24 text-sm resize-none"
              onChange={(e) => setFormData({...formData, keterangan: e.target.value})}
            ></textarea>
          </div>

          <div className="relative group">
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="upload-foto" />
            <label htmlFor="upload-foto" className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-3xl cursor-pointer group-hover:border-blue-600 transition-all">
              <span className="text-2xl mb-2">{formData.foto ? "✅" : "📸"}</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-blue-600 text-center">
                {formData.foto ? "Foto Berhasil Dipilih" : "Upload Dokumentasi"}
              </span>
            </label>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-slate-950 text-white p-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs hover:bg-blue-600 transition-all shadow-xl active:scale-95 disabled:opacity-50"
          >
            {loading ? "Menyinkronkan..." : "Kirim Laporan"}
          </button>
        </form>
      </div>
    </main>
  );
}