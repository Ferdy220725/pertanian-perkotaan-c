"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
// Import library untuk PDF
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function RiwayatPage() {
  const router = useRouter();
  const supabase = createClient();
  const [dataRiwayat, setDataRiwayat] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const getNamaIlmiah = (komoditas: string) => {
    const namaLower = komoditas?.toLowerCase() || "";
    
    if (namaLower.includes("cabai")) {
      return "Cabai rawit (Capsicum frutescens L.)";
    }
    // DITAMBAH: Cek "bunga" atau "kembang" supaya sinkron dengan SQL kamu
    if (namaLower.includes("bunga kol") || namaLower.includes("kembang kol")) {
      return "Bunga Kol (Brassica oleracea var. botrytis L.)";
    }
    if (namaLower.includes("seledri")) {
      return "Seledri (Apium graveolens L.)";
    }
    if (namaLower.includes("tomat")) {
      return "Tomat (Solanum lycopersicum L.)";
    }
    
    return komoditas; 
  };

  // Fungsi untuk mengambil data dari Supabase dengan urutan kronologis
  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('logbook')
        .select('*')
        // MENGUBAH URUTAN: Data paling awal di atas, data terbaru di bawah
        .order('created_at', { ascending: true }); 
      
      if (error) throw error;
      setDataRiwayat(data || []);
    } catch (error: any) {
      alert("Gagal mengambil data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // FUNGSI HAPUS DATA DARI SUPABASE
  const handleHapusData = async (id: string) => {
    const confirmHapus = confirm("Apakah Anda yakin ingin menghapus data ini secara permanen dari database cloud?");
    
    if (confirmHapus) {
      try {
        const { error } = await supabase
          .from('logbook')
          .delete()
          .eq('id', id);

        if (error) throw error;

        alert("✅ Data berhasil dihapus!");
        fetchLogs();
      } catch (error: any) {
        alert("Gagal menghapus: " + error.message);
      }
    }
  };

  // LOGIKA BARU: FUNGSI DOWNLOAD PDF PER KELOMPOK (DIPINDAH KE DALAM TABEL)
  const downloadPDFPerKelompok = async (noKelompok: string) => {
    const doc = new jsPDF('l', 'mm', 'a4');
    const dataSpesifik = kelompokGroups[noKelompok];

    doc.setFontSize(16);
    doc.text(`RIWAYAT LOGBOOK - KELOMPOK ${noKelompok}`, 14, 15);
    doc.setFontSize(10);
    // Menggunakan fungsi getNamaIlmiah untuk PDF
    doc.text(`Komoditas: ${getNamaIlmiah(dataSpesifik[0].komoditas)}`, 14, 22);

    const tableData = dataSpesifik.map((row: any) => [
      row.tanggal,
      row.nama.toUpperCase(),
      row.npm,
      row.kegiatan,
      row.keterangan,
      '' // Placeholder foto
    ]);

    autoTable(doc, {
      startY: 30,
      head: [['Hari/Tanggal', 'Nama', 'NPM', 'Kegiatan', 'Keterangan', 'Dokumentasi']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42] },
      styles: { fontSize: 8, cellPadding: 2, valign: 'middle' },
      columnStyles: { 5: { cellWidth: 30 } },
      didDrawCell: (data) => {
        if (data.section === 'body' && data.column.index === 5) {
          const rowIndex = data.row.index;
          const imageData = dataSpesifik[rowIndex].foto;
          if (imageData) {
            try {
              doc.addImage(imageData, 'JPEG', data.cell.x + 2, data.cell.y + 2, 26, 16);
            } catch (e) {
              doc.setFontSize(6);
              doc.text('Gagal memuat', data.cell.x + 2, data.cell.y + 10);
            }
          }
        }
      },
      bodyStyles: { minCellHeight: 20 }
    });

    doc.save(`Logbook_Kelompok_${noKelompok}.pdf`);
  };

  // Mengelompokkan data berdasarkan nomor kelompok
  const kelompokGroups = dataRiwayat.reduce((groups: any, item: any) => {
    const group = groups[item.kelompok] || [];
    group.push(item);
    groups[item.kelompok] = group;
    return groups;
  }, {});

  return (
    <main className="min-h-screen bg-white p-6 md:p-12 text-slate-900 font-serif">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-10 no-print">
          <div>
            <button onClick={() => router.push('/')} className="text-sm font-bold text-slate-400 hover:text-black transition-colors">← Dashboard</button>
            <h1 className="text-3xl font-black mt-2 uppercase tracking-tighter">Riwayat Logbook Cloud</h1>
          </div>
          <div className="flex gap-3">
            <button onClick={fetchLogs} className="bg-slate-100 hover:bg-slate-200 px-6 py-2 rounded-full font-bold text-xs transition-all shadow-sm">
              {loading ? "Memuat..." : "🔄 Refresh Data"}
            </button>
          </div>
        </header>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full"></div>
            <p className="mt-4 font-bold text-slate-400 uppercase tracking-widest text-[10px]">Menghubungkan ke Supabase...</p>
          </div>
        ) : Object.keys(kelompokGroups).length === 0 ? (
          <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem] p-20 text-center">
            <p className="text-slate-400 italic font-medium">Belum ada laporan yang masuk ke database.</p>
          </div>
        ) : (
          Object.keys(kelompokGroups).sort().map((noKelompok) => (
            <div key={noKelompok} className="mb-16 border-b border-slate-100 pb-10">
              <div className="mb-6 flex justify-between items-end">
                <div>
                  <h2 className="text-xl font-black text-blue-600 uppercase tracking-tight">Kelompok {noKelompok}</h2>
                  {/* Menggunakan fungsi getNamaIlmiah untuk tampilan Web */}
                  <p className="text-sm text-slate-500 italic font-medium">Komoditas: {getNamaIlmiah(kelompokGroups[noKelompok][0].komoditas)}</p>
                </div>
                <button 
                  onClick={() => downloadPDFPerKelompok(noKelompok)}
                  className="bg-white hover:bg-slate-50 text-black border border-slate-200 px-4 py-2 rounded-lg font-bold text-[10px] transition-all shadow-sm flex items-center gap-2 no-print"
                >
                  📩 UNDUH KELOMPOK {noKelompok}
                </button>
              </div>

              <div className="overflow-x-auto rounded-xl border border-black shadow-sm">
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
                  <tbody>
                    {kelompokGroups[noKelompok].map((row: any) => (
                      <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                        <td className="border border-black p-3 text-center">{row.tanggal}</td>
                        <td className="border border-black p-3 text-center font-bold uppercase">{row.nama}</td>
                        <td className="border border-black p-3 text-center font-mono">{row.npm}</td>
                        <td className="border border-black p-3 italic text-center text-slate-600">({row.kegiatan})</td>
                        <td className="border border-black p-3 text-center">{row.keterangan}</td>
                        <td className="border border-black p-3 text-center">
                          <img src={row.foto} className="w-24 h-16 object-cover rounded-md mx-auto shadow-sm" alt="Bukti" />
                        </td>
                        <td className="border border-black p-3 text-center no-print">
                          <div className="flex flex-col gap-2">
                             <button 
                              onClick={() => handleHapusData(row.id)}
                              className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white px-3 py-1 rounded-lg font-bold transition-all border border-red-100"
                            >
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}