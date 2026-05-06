"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

// Inisialisasi Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminControl() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [masterPass, setMasterPass] = useState('');
  const [passwords, setPasswords] = useState<{ [key: number]: string }>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // LOGIKA BARU: State untuk jam operasional
  const [opHours, setOpHours] = useState({ start: 15, end: 20 });

  // 1. Verifikasi Admin
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (masterPass === "ferdy22") { 
      setIsAdmin(true);
      fetchPasswords();
      fetchOpHours(); // Ambil jam operasional saat login
    } else {
      alert("Password Admin Salah!");
    }
  };

  // 2. Ambil data password dari Supabase (Logika Lama Tetap Ada)
  const fetchPasswords = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('config_password')
      .select('*');
    
    if (data) {
      const pwMap: { [key: number]: string } = {};
      data.forEach(item => pwMap[item.kelompok] = item.password);
      setPasswords(pwMap);
    }
    setLoading(false);
  };

  // LOGIKA BARU: Ambil jam operasional dari tabel 'config_jam'
  const fetchOpHours = async () => {
    const { data, error } = await supabase.from('config_jam').select('*').eq('id', 1).single();
    if (data) {
      setOpHours({ start: data.start_hour, end: data.end_hour });
    }
  };

  // 3. Update atau Simpan Password Kelompok (Logika Lama Tetap Ada)
  const savePassword = async (kelompok: number, newPassword: string) => {
    setMessage({ type: 'loading', text: 'Menyimpan...' });
    
    const { error } = await supabase
      .from('config_password')
      .upsert({ kelompok, password: newPassword }, { onConflict: 'kelompok' });

    if (error) {
      setMessage({ type: 'error', text: 'Gagal update: ' + error.message });
    } else {
      setMessage({ type: 'success', text: `Password Kelompok ${kelompok} diperbarui!` });
      fetchPasswords();
    }
    
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  // LOGIKA BARU: Simpan pengaturan jam operasional
  const saveOpHours = async () => {
    setMessage({ type: 'loading', text: 'Mengupdate Jam...' });
    const { error } = await supabase
      .from('config_jam')
      .upsert({ id: 1, start_hour: opHours.start, end_hour: opHours.end });

    if (error) {
      setMessage({ type: 'error', text: 'Gagal update jam: ' + error.message });
    } else {
      setMessage({ type: 'success', text: 'Waktu operasional berhasil diperbarui!' });
    }
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-200 w-full max-w-md">
          <h1 className="text-xl font-black text-[#800020] uppercase tracking-tighter mb-4">Admin Authentication</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password" 
              placeholder="Masukkan Master Password Admin"
              className="w-full p-4 rounded-2xl bg-slate-100 border-none focus:ring-2 focus:ring-[#800020] outline-none"
              value={masterPass}
              onChange={(e) => setMasterPass(e.target.value)}
            />
            <button className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition-all">
              Buka Panel Kontrol
            </button>
            <Link href="/" className="block text-center text-xs font-bold text-slate-400 uppercase tracking-widest mt-4">Kembali ke Dashboard</Link>
          </form>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8F9FA] p-5 md:p-10 font-sans">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter">ADMIN <span className="text-[#800020]">CONTROL</span></h1>
            <p className="text-slate-500 font-medium">Kelola password kelompok dan waktu akses operasional.</p>
          </div>
          <Link href="/" className="bg-white px-6 py-3 rounded-full text-xs font-black shadow-sm border border-slate-200 uppercase tracking-widest hover:bg-slate-50">Tutup</Link>
        </header>

        {message.text && (
          <div className={`mb-6 p-4 rounded-2xl text-sm font-bold text-center ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message.text}
          </div>
        )}

        {/* --- LOGIKA BARU: KONTROL JAM OPERASIONAL --- */}
        <div className="mb-10 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
          <h2 className="text-sm font-black text-[#800020] uppercase tracking-widest mb-6">Pengaturan Jam Operasional (WIB)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Jam Buka (Contoh: 15)</label>
              <input 
                type="number" min="0" max="23"
                className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-[#800020] outline-none font-bold"
                value={opHours.start}
                onChange={(e) => setOpHours({...opHours, start: parseInt(e.target.value)})}
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Jam Tutup (Contoh: 20)</label>
              <input 
                type="number" min="0" max="23"
                className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-[#800020] outline-none font-bold"
                value={opHours.end}
                onChange={(e) => setOpHours({...opHours, end: parseInt(e.target.value)})}
              />
            </div>
          </div>
          <button 
            onClick={saveOpHours}
            className="mt-6 w-full bg-[#800020] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all"
          >
            Update Jam Operasional
          </button>
        </div>

        {/* --- LOGIKA LAMA: PENGELOLAAN PASSWORD (TETAP DI SINI) --- */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-8 border-b border-slate-100">
             <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Manajemen Password Kelompok</h2>
          </div>
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-bottom border-slate-100">
              <tr>
                <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Nomor Kelompok</th>
                <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Password Riwayat</th>
                <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <tr key={num} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-6 font-bold text-slate-900">Kelompok {num}</td>
                  <td className="p-6">
                    <input 
                      type="text"
                      placeholder="Belum diatur"
                      className="bg-slate-100 px-4 py-2 rounded-xl text-sm font-medium border-none focus:ring-2 focus:ring-[#800020] w-full max-w-[200px]"
                      value={passwords[num] || ''}
                      onChange={(e) => setPasswords({...passwords, [num]: e.target.value})}
                    />
                  </td>
                  <td className="p-6 text-right">
                    <button 
                      onClick={() => savePassword(num, passwords[num])}
                      className="text-[10px] font-black uppercase tracking-widest bg-[#800020] text-white px-5 py-2 rounded-full hover:bg-black transition-all"
                    >
                      Update
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <footer className="mt-10 text-center">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em]">Sistem Keamanan Logbook Agrotek C 2026</p>
        </footer>
      </div>
    </main>
  );
}