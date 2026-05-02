"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function RiwayatPage() {
  const router = useRouter();
  const supabase = createClient();
  const [dataRiwayat, setDataRiwayat] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // STATE LOGIKA ASLI
  const [userRole, setUserRole] = useState<'mahasiswa' | 'dosen' | null>(null);
  const [identitasUser, setIdentitasUser] = useState({ kelompok: '', nama: '', npm: '' });
  const [isVerified, setIsVerified] = useState(false);

  const [unlockedGroups, setUnlockedGroups] = useState<string[]>([]);
  const [passInput, setPassInput] = useState<{ [key: string]: string }>({});

  const mahasiswaList = [
    { npm: "25025010093", nama: "SITI NUR FADILAH" },
    { npm: "25025010094", nama: "AGNIA LAQUINTA Al-Abin" },
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
    { npm: "25025010111", nama: "FAQIHATUN NISA'" },
    { npm: "25025010112", nama: "SALSABILLA OCTAVIA RAMADHANI" },
    { npm: "25025010113", nama: "KEYSHA AULIA AZZAHRA" },
    { npm: "25025010114", nama: "ANGEL MONICA NH" },
    { npm: "25025010115", nama: "USWATUN KHASANAH" },
    { npm: "25025010116", nama: "DHARMA AJI WISNU Utama" },
    { npm: "25025010117", nama: "KEIKY RESVANTI RAMADHIANTI" },
    { npm: "25025010118", nama: "ANDINI SALWA INGGRAINI" },
    { npm: "25025010119", nama: "TALITHA LISTYA SALSABILA" },
    { npm: "25025010120", nama: "ANDREA BENAYA PAGONGGANG" },
    { npm: "25025010121", nama: "AQDRIA YASHIRLY AMIRLLA" },
    { npm: "25025010122", nama: "MOHAMMAD RIZKY HIKMA PRAWIRA" },
    { npm: "25025010123", nama: "SAFRINA BR TINJAK" },
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

  const getNamaIlmiah = (komoditas: string) => {
    const namaLower = komoditas?.toLowerCase() || "";
    if (namaLower.includes("cabai")) return "Cabai rawit (Capsicum frutescens L.)";
    if (namaLower.includes("bunga kol") || namaLower.includes("kembang kol")) return "Bunga Kol (Brassica oleracea var. botrytis L.)";
    if (namaLower.includes("seledri")) return "Seledri (Apium graveolens L.)";
    if (namaLower.includes("tomat")) return "Tomat (Solanum lycopersicum L.)";
    return komoditas;
  };

  const renderKeaktifan = (noKelompok: string) => {
    if (userRole === 'dosen') return null;
    const logs = kelompokGroups[noKelompok] || [];
    
    // Logic filter: Hanya menampilkan anggota yang terdeteksi di log kelompok ini
    const npmTerdeteksi = Array.from(new Set(logs.flatMap((log: any) => log.npm ? log.npm.split(/[\s,]+/) : [])));

    const summary = mahasiswaList
      .filter(mhs => npmTerdeteksi.includes(mhs.npm))
      .map(mhs => {
        const count = logs.filter((log: any) => log.npm && log.npm.includes(mhs.npm)).length;
        const namaSplit = mhs.nama.split(' ');
        const duaNama = namaSplit.slice(0, 2).join(' ');
        const tigaDigitNpm = mhs.npm.slice(-3);
        return { label: `(${tigaDigitNpm}-${duaNama}: ${count})`, count };
      });

    if (summary.length === 0) return null;

    return (
      <div className="mb-4 no-print">
        <h3 className="text-[11px] font-black uppercase mb-2">Total Pengamatan & Pemeliharaan</h3>
        <div className="flex flex-wrap gap-2 text-[10px] font-bold text-slate-700">
          {summary.map((s, i) => (
            <span key={i} className="bg-slate-100 px-2 py-1 rounded border border-black whitespace-nowrap">{s.label}</span>
          ))}
        </div>
      </div>
    );
  };

  const fetchGroupLogs = async (noKelompok: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('logbook')
        .select('*')
        .eq('kelompok', parseInt(noKelompok))
        .order('created_at', { ascending: true });

      if (error) throw error;
      setDataRiwayat(prev => {
        const filteredPrev = prev.filter(item => item.kelompok !== parseInt(noKelompok));
        return [...filteredPrev, ...(data || [])];
      });
    } catch (error: any) {
      alert("Gagal mengambil data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    if (unlockedGroups.length === 0) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('logbook')
        .select('*')
        .in('kelompok', unlockedGroups.map(g => parseInt(g)))
        .order('created_at', { ascending: true });
      if (error) throw error;
      setDataRiwayat(data || []);
    } catch (error: any) {
      alert("Gagal menyegarkan data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPassword = async (noKelompok: string) => {
    try {
      const { data: configData, error } = await supabase.from('config_password').select('password').eq('kelompok', parseInt(noKelompok)).maybeSingle();
      if (error) throw error;
      if (!configData) { alert(`❌ Kelompok ${noKelompok} belum mengatur password!`); return; }
      if (passInput[noKelompok]?.trim() === configData.password.trim()) {
        setUnlockedGroups(prev => [...prev, noKelompok]);
        await fetchGroupLogs(noKelompok);
      } else { alert("❌ Password Salah!"); }
    } catch (error: any) { alert("Kesalahan: " + error.message); }
  };

  const handleHapusData = async (id: string, noKelompok: string) => {
    if (confirm("Hapus data secara permanen?")) {
      try {
        const { error } = await supabase.from('logbook').delete().eq('id', id);
        if (error) throw error;
        alert("✅ Berhasil dihapus!Refresh halaman kamu ya");
        fetchGroupLogs(noKelompok);
      } catch (error: any) { alert("Gagal menghapus: " + error.message); }
    }
  };

  const downloadPDFPerKelompok = async (noKelompok: string) => {
    const doc = new jsPDF('l', 'mm', 'a4');
    const dataSpesifik = kelompokGroups[noKelompok];
    if (!dataSpesifik) return;

    doc.setFontSize(16);
    doc.text(`RIWAYAT LOGBOOK - KELOMPOK ${noKelompok}`, 14, 15);
    doc.setFontSize(10);
    doc.text(`Komoditas: ${getNamaIlmiah(dataSpesifik[0].komoditas)}`, 14, 22);

    const tableData = dataSpesifik.map((row: any) => [row.tanggal, row.nama.toUpperCase(), row.npm, row.kegiatan, row.keterangan, '']);

    autoTable(doc, {
      startY: 30,
      head: [['Hari/Tanggal', 'Nama', 'NPM', 'Kegiatan', 'Keterangan', 'Dokumentasi']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
      styles: { fontSize: 8, cellPadding: 2, valign: 'middle', lineColor: [0, 0, 0], lineWidth: 0.5, textColor: [0, 0, 0] }, // Teks Hitam
      columnStyles: { 5: { cellWidth: 30 } },
      didDrawCell: (data) => {
        if (data.section === 'body' && data.column.index === 5) {
          const rowIndex = data.row.index;
          const imageData = dataSpesifik[rowIndex].foto;
          if (imageData && imageData.startsWith('data:image')) {
            try { doc.addImage(imageData, 'JPEG', data.cell.x + 2, data.cell.y + 2, 26, 16); } catch (e) { doc.setFontSize(6); doc.text('Gbr Bermasalah', data.cell.x + 2, data.cell.y + 10); }
          }
        }
      },
      bodyStyles: { minCellHeight: 20 }
    });

    if (userRole !== 'dosen') {
      const finalY = (doc as any).lastAutoTable.finalY + 10;
      doc.setFontSize(12);
      doc.setFont("Times New Roman", "bold");
      doc.setTextColor(0, 0, 0); 
      doc.text("Total Pengamatan & Pemeliharaan", 14, finalY);
      const npmTerPdf = Array.from(new Set(dataSpesifik.flatMap((log: any) => log.npm ? log.npm.split(/[\s,]+/) : [])));
      const sumStr = mahasiswaList.filter(mhs => npmTerPdf.includes(mhs.npm)).map(mhs => {
        const count = dataSpesifik.filter((log: any) => log.npm && log.npm.includes(mhs.npm)).length;
        return `(${mhs.npm.slice(-3)}-${mhs.nama.split(' ').slice(0, 2).join(' ')}: ${count})`;
      });
      doc.setFontSize(7);
      doc.text(sumStr.join('  '), 14, finalY + 7, { maxWidth: 270 });
    }
    doc.save(`Logbook_Kelompok_${noKelompok}.pdf`);
  };

  const kelompokGroups = dataRiwayat.reduce((groups: any, item: any) => {
    const group = groups[item.kelompok] || [];
    group.push(item);
    groups[item.kelompok] = group;
    return groups;
  }, {});

  const daftarKelompok = Array.from({ length: 20 }, (_, i) => (i + 1).toString());

  if (!isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 font-serif">
        <div className="bg-white border-2 border-black p-8 rounded-2xl shadow-xl max-w-md w-full">
          <h1 className="text-2xl font-black mb-6 uppercase tracking-tighter text-center">Verifikasi Akses</h1>
          <div className="flex gap-2 mb-6">
            <button onClick={() => setUserRole('mahasiswa')} className={`flex-1 py-3 rounded-lg font-bold text-xs border ${userRole === 'mahasiswa' ? 'bg-black text-white' : 'bg-white border-black'}`}>Mahasiswa</button>
            <button onClick={() => setUserRole('dosen')} className={`flex-1 py-3 rounded-lg font-bold text-xs border ${userRole === 'dosen' ? 'bg-black text-white' : 'bg-white border-black'}`}>Dosen</button>
          </div>
          {userRole === 'mahasiswa' && (
            <div className="space-y-4">
              <input type="number" placeholder="Nomor Kelompok" className="w-full p-3 border-2 border-black rounded-lg text-sm" onChange={(e) => setIdentitasUser({...identitasUser, kelompok: e.target.value})} />
              <select className="w-full p-3 border-2 border-black rounded-lg text-sm bg-white" onChange={(e) => { const m = mahasiswaList.find(x => x.nama === e.target.value); if(m) setIdentitasUser({...identitasUser, nama: m.nama, npm: m.npm}); }}>
                <option value="">-- Pilih Nama --</option>
                {mahasiswaList.map(m => <option key={m.npm} value={m.nama}>{m.nama}</option>)}
              </select>
              <input type="text" placeholder="NPM" className="w-full p-3 border-2 border-black rounded-lg text-sm bg-slate-50" value={identitasUser.npm} readOnly />
              <button onClick={() => {if(identitasUser.kelompok && identitasUser.nama) setIsVerified(true)}} className="w-full bg-blue-600 text-white py-3 rounded-lg font-black uppercase hover:bg-black">Masuk Riwayat</button>
            </div>
          )}
          {userRole === 'dosen' && (
            <div className="space-y-4">
              <button onClick={() => {setIdentitasUser({nama: "Ir.Purnomo Edi Sasongko, M.P.", kelompok: "ALL", npm: "D1"}); setIsVerified(true)}} className="w-full p-3 border border-black rounded-lg text-xs font-bold text-left hover:bg-slate-50">1. Ir.Purnomo Edi Sasongko, M.P.</button>
              <button onClick={() => {setIdentitasUser({nama: "Bahrul Rizki Ramadhan, S.P., M.P.", kelompok: "ALL", npm: "D2"}); setIsVerified(true)}} className="w-full p-3 border border-black rounded-lg text-xs font-bold text-left hover:bg-slate-50">2. Bahrul Rizki Ramadhan, S.P., M.P.</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white p-6 md:p-12 text-slate-900 font-serif">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-10 no-print">
          <div>
            <button onClick={() => router.push('/')} className="text-sm font-bold text-slate-400 hover:text-black">← Dashboard</button>
            <h1 className="text-3xl font-black mt-2 uppercase tracking-tighter">Riwayat Logbook Cloud</h1>
            <p className="text-[10px] font-bold text-blue-600 mt-1 uppercase tracking-widest">{userRole === 'dosen' ? 'Akses Khusus Dosen' : `User: ${identitasUser.nama} | Kelompok: ${identitasUser.kelompok}`}</p>
          </div>
          <button onClick={fetchLogs} className="bg-slate-100 hover:bg-slate-200 px-6 py-2 rounded-full font-bold text-xs">{loading ? "Memuat..." : "🔄 Refresh"}</button>
        </header>

        {daftarKelompok.map((no) => (
          <div key={no} className="mb-16 border-b border-slate-100 pb-10">
            <div className="mb-6 flex justify-between items-end">
              <h2 className="text-xl font-black text-blue-600 uppercase">Kelompok {no}</h2>
              {unlockedGroups.includes(no) && kelompokGroups[no] && (
                <button onClick={() => downloadPDFPerKelompok(no)} className="border border-slate-200 px-4 py-2 rounded-lg font-bold text-[10px] no-print">📩 UNDUH PDF</button>
              )}
            </div>
            {!unlockedGroups.includes(no) ? (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center shadow-inner">
                <div className="flex gap-2 max-w-xs mx-auto">
                  <input type="password" placeholder="Password..." className="flex-1 p-2 border border-slate-300 rounded-lg text-xs" onChange={(e) => setPassInput({...passInput, [no]: e.target.value})} />
                  <button onClick={() => handleVerifyPassword(no)} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-[10px] font-bold">BUKA</button>
                </div>
              </div>
            ) : !kelompokGroups[no] || kelompokGroups[no].length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-8">Data sedang dijemput nih, sabar ya...</p>
            ) : (
              <>
                {renderKeaktifan(no)}
                <div className="overflow-x-auto rounded-xl border-2 border-black">
                  <table className="w-full border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-950 text-white">
                        <th className="border border-black p-3">Hari/Tanggal</th>
                        <th className="border border-black p-3">Nama</th>
                        <th className="border border-black p-3">NPM</th>
                        <th className="border border-black p-3">Kegiatan</th>
                        <th className="border border-black p-3">Keterangan</th>
                        <th className="border border-black p-3">Dokumentasi</th>
                        <th className="border border-black p-3 no-print">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {kelompokGroups[no].map((row: any) => (
                        <tr key={row.id}>
                          <td className="border border-black p-3 text-center">{row.tanggal}</td>
                          <td className="border border-black p-3 text-center font-bold uppercase">{row.nama}</td>
                          <td className="border border-black p-3 text-center font-mono">{row.npm}</td>
                          <td className="border border-black p-3 text-center italic">({row.kegiatan})</td>
                          <td className="border border-black p-3 text-center">{row.keterangan}</td>
                          <td className="border border-black p-3 text-center">
                            {row.foto && <img src={row.foto} className="w-24 h-16 object-cover rounded mx-auto" alt="Bukti" />}
                          </td>
                          <td className="border border-black p-3 text-center no-print">
                            <button onClick={() => handleHapusData(row.id, no)} className="text-red-600 font-bold hover:underline">Hapus</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}