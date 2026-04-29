"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Document, Packer, Paragraph, Table, TableRow, TableCell, 
  WidthType, HeadingLevel, ImageRun, TextRun, AlignmentType, BorderStyle 
} from 'docx';
import { saveAs } from 'file-saver';
import { createClient } from '@/utils/supabase/client';

export default function LaporanPage() {
  const router = useRouter();
  const supabase = createClient();
  const [dataRiwayat, setDataRiwayat] = useState<any[]>([]);
  const [loading, setLoading] = useState(false); 
  const [parameters, setParameters] = useState<any>({});
  const [extraInfo, setExtraInfo] = useState<any>({});

  const [unlockedGroups, setUnlockedGroups] = useState<string[]>([]);
  const [passInput, setPassInput] = useState<{ [key: string]: string }>({});
  
  // State baru untuk memberikan informasi "manis" saat proses verifikasi
  const [verifyingGroup, setVerifyingGroup] = useState<string | null>(null);

  const daftarKelompok = Array.from({ length: 20 }, (_, i) => (i + 1).toString());

  const getNamaIlmiah = (komoditas: string) => {
    const namaLower = komoditas?.toLowerCase() || "";
    if (namaLower.includes("cabai")) return "Cabai rawit Capsicum frutescens L.";
    if (namaLower.includes("kembang kol")) return "Kembang Kol: Brassica oleracea var. botrytis L.";
    if (namaLower.includes("seledri")) return "Seledri: Apium graveolens L.";
    if (namaLower.includes("tomat")) return "Tomat: Solanum lycopersicum L.";
    return komoditas;
  };

  const fetchGroupLogs = async (noKelompok: string) => {
    // Tetap menggunakan loading global untuk sinkronisasi cloud
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
      alert("Gagal sinkronisasi data cloud: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPassword = async (noKelompok: string) => {
    // Mulai proses verifikasi (tampilan manis muncul)
    setVerifyingGroup(noKelompok);
    try {
      const { data: config, error } = await supabase
        .from('config_password')
        .select('password')
        .eq('kelompok', parseInt(noKelompok))
        .maybeSingle();

      if (error) throw error;
      
      if (!config) {
        alert(`Admin belum mengatur password untuk Kelompok ${noKelompok}`);
        setVerifyingGroup(null);
        return;
      }

      if (passInput[noKelompok]?.trim() === config.password.trim()) {
        // Jika benar, ambil data logbook
        await fetchGroupLogs(noKelompok);
        setUnlockedGroups([...unlockedGroups, noKelompok]);
      } else {
        alert("❌ Password Salah!");
      }
    } catch (err: any) {
      alert("Gagal verifikasi: " + err.message);
    } finally {
      // Selesai proses verifikasi
      setVerifyingGroup(null);
    }
  };

  const fetchLogs = async () => {
    if (unlockedGroups.length === 0) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('logbook')
        .select('*')
        .in('unlockedGroups', unlockedGroups.map(g => parseInt(g))) // Perbaikan minor: mapping unlocked
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      setDataRiwayat(data || []);
    } catch (error: any) {
      alert("Gagal menyegarkan data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const kelompokGroups = dataRiwayat.reduce((groups: any, item: any) => {
    const group = groups[item.kelompok] || [];
    group.push(item);
    groups[item.kelompok] = group;
    return groups;
  }, {});

  const handleParamChange = (noKelompok: string, param: string, minggu: string, value: string) => {
    setParameters((prev: any) => ({
      ...prev,
      [noKelompok]: {
        ...prev[noKelompok],
        [param]: {
          ...(prev[noKelompok]?.[param] || { m1: "", m2: "" }),
          [minggu]: value
        }
      }
    }));
  };

  const handleExtraChange = (noKelompok: string, field: string, value: string) => {
    setExtraInfo((prev: any) => ({
      ...prev,
      [noKelompok]: {
        ...prev[noKelompok],
        [field]: value
      }
    }));
  };

  const generateNarrative = (noKelompok: string) => {
    const p = parameters[noKelompok] || {};
    const t1 = parseFloat(p["Tinggi Tanaman"]?.m1) || 0;
    const t2 = parseFloat(p["Tinggi Tanaman"]?.m2) || 0;
    const selisihTinggi = (t2 - t1).toFixed(1);
    const d1 = parseFloat(p["Jumlah Daun"]?.m1) || 0;
    const d2 = parseFloat(p["Jumlah Daun"]?.m2) || 0;
    const selisihDaun = (d2 - d1).toFixed(1);
    const bunga2 = p["Jumlah Bunga"]?.m2 || "0";
    const buah2 = p["Jumlah Buah"]?.m2 || "0";

    return `Berdasarkan hasil pengamatan yang telah dilakukan pada tanaman yang dibudidayakan di area rooftop, dapat disimpulkan bahwa pertumbuhan tanaman menunjukkan variasi pada setiap parameter yang diamati. Tinggi tanaman mengalami peningkatan dari ${t1} cm pada awal pengamatan menjadi ${t2} cm pada akhir pengamatan, dengan rata-rata pertambahan sebesar ${selisihTinggi} cm per minggu. Hal ini menunjukkan bahwa pertumbuhan vegetatif tanaman berlangsung dengan cukup baik meskipun ditanam pada lingkungan rooftop yang memiliki intensitas cahaya matahari tinggi. Jumlah daun yang terbentuk sebanyak ${d2} helai dengan pertambahan rata-rata ${selisihDaun} helai per minggu. Kondisi daun secara umum hijau segar, yang mengindikasikan bahwa tanaman masih mampu beradaptasi dengan kondisi lingkungan rooftop yang cenderung panas dan memiliki paparan angin yang cukup kuat. Pada fase generatif, tanaman mulai menghasilkan bunga sebanyak ${bunga2} bunga dan berkembang menjadi buah sebanyak ${buah2} buah. Munculnya bunga dan buah ini menunjukkan bahwa tanaman mampu melewati fase vegetatif dengan baik dan melanjutkan ke fase generatif meskipun berada pada kondisi lingkungan yang relatif lebih ekstrem dibandingkan lahan biasa. Secara keseluruhan, pertumbuhan tanaman di rooftop dipengaruhi oleh beberapa faktor lingkungan seperti intensitas cahaya matahari yang tinggi, ketersediaan air yang cepat menguap, serta terpaan angin. Meskipun demikian, tanaman tetap menunjukkan pertumbuhan yang cukup optimal.`;
  };

  const base64ToUint8Array = (base64String: string) => {
    const base64Data = base64String.split(',')[1];
    const binaryString = window.atob(base64Data);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const downloadWord = async (noKelompok: string, items: any[]) => {
    try {
      const komoditasIlmiah = getNamaIlmiah(items[0].komoditas);
      const groupParams = parameters[noKelompok] || {};
      const extra = extraInfo[noKelompok] || {};

      const photoCells = items.map((item) => {
        if (!item.foto) return new TableCell({ children: [new Paragraph("Foto N/A")] });
        try {
          return new TableCell({
            borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new ImageRun({
                    data: base64ToUint8Array(item.foto),
                    transformation: { width: 100, height: 100 },
                    type: "png",
                  }),
                  new TextRun({ text: `\nTanggal: ${item.tanggal}`, break: 1, size: 16, italics: true }),
                  new TextRun({ text: `\nOleh: ${item.nama || 'Anonim'}`, break: 1, size: 16, bold: true }),
                ],
              }),
            ],
          });
        } catch (e) { return new TableCell({ children: [new Paragraph("Error Foto")] }); }
      });

      const photoRows = [];
      for (let i = 0; i < photoCells.length; i += 2) {
        photoRows.push(new TableRow({
          children: [
            photoCells[i],
            photoCells[i + 1] || new TableCell({ children: [], borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } } })
          ]
        }));
      }

      const doc = new Document({
        sections: [{
          children: [
            new Paragraph({ text: "2. Laporan Mingguan", heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER }),
            new Paragraph({ text: "" }),
            new Paragraph({ children: [new TextRun({ text: "A. Identitas", bold: true })] }),
            new Paragraph({ text: `   Kelompok  : ${noKelompok}` }),
            new Paragraph({ text: `   Komoditas : ${komoditasIlmiah}` }),
            new Paragraph({ text: "" }),
            new Paragraph({ children: [new TextRun({ text: "B. Data Pertumbuhan dan Perkembangan Tanaman", bold: true })] }),
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph({ text: "Parameter", alignment: AlignmentType.CENTER })], shading: { fill: "F2F2F2" } }),
                    new TableCell({ children: [new Paragraph({ text: "Minggu 1", alignment: AlignmentType.CENTER })], shading: { fill: "F2F2F2" } }),
                    new TableCell({ children: [new Paragraph({ text: "Minggu 2", alignment: AlignmentType.CENTER })], shading: { fill: "F2F2F2" } }),
                  ],
                }),
                ...["Tinggi Tanaman", "Jumlah Daun", "Jumlah Bunga", "Jumlah Buah"].map(param => 
                  new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph(param)] }),
                      new TableCell({ children: [new Paragraph(groupParams[param]?.m1 || "-")] }),
                      new TableCell({ children: [new Paragraph(groupParams[param]?.m2 || "-")] }),
                    ]
                  })
                )
              ],
            }),
            new Paragraph({ text: "" }),
            new Paragraph({ children: [new TextRun({ text: "C. Dokumentasi", bold: true })] }),
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: photoRows,
              borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE }, insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE } }
            }),
            new Paragraph({ text: "" }),
            new Paragraph({ children: [new TextRun({ text: "D. Kendala", bold: true })] }),
            new Paragraph({ text: extra.kendala || "Tidak ada kendala." }),
            new Paragraph({ text: "" }),
            new Paragraph({ children: [new TextRun({ text: "E. Solusi", bold: true })] }),
            new Paragraph({ text: extra.solusi || "Tidak ada solusi khusus." }),
            new Paragraph({ text: "" }),
            new Paragraph({ children: [new TextRun({ text: "F. Kesimpulan", bold: true })] }),
            new Paragraph({ text: extra.kesimpulan || generateNarrative(noKelompok) }),
          ],
        }],
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `Laporan_Mingguan_Kelompok_${noKelompok}.docx`);
    } catch (error) { alert("❌ Gagal membuat file."); }
  };

  return (
    <main className="min-h-screen bg-[#f8fafc] p-4 md:p-12 font-sans text-slate-900">
      <div className="max-w-5xl mx-auto">
        <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <button onClick={() => router.push('/')} className="text-sm font-bold text-slate-400 hover:text-black transition-colors">← Kembali ke Dashboard</button>
            <h1 className="text-3xl md:text-4xl font-black mt-2 tracking-tighter uppercase">Penyusunan Laporan</h1>
            <p className="text-slate-500 italic text-sm">Data disinkronkan dari cloud. Masukkan password kelompok untuk mengunduh laporan.</p>
          </div>
          <button 
            onClick={fetchLogs}
            className="text-[10px] font-bold bg-slate-200 px-4 py-2 rounded-full hover:bg-slate-300 transition-all w-full md:w-auto"
          >
            {loading ? "Sinkronisasi..." : "🔄 Refresh Data Terbuka"}
          </button>
        </header>

        {daftarKelompok.map((noKelompok) => (
            <div key={noKelompok} className="bg-white p-6 md:p-8 rounded-3xl md:rounded-[3rem] shadow-xl mb-12 border border-slate-100 overflow-hidden">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-slate-50 pb-6 gap-4">
                <div>
                  <span className="text-[10px] font-black bg-blue-600 text-white px-4 py-1 rounded-full uppercase tracking-widest">Kelompok {noKelompok}</span>
                  {unlockedGroups.includes(noKelompok) && kelompokGroups[noKelompok] && (
                    <h2 className="text-xl md:text-2xl font-bold mt-2 text-slate-800">{getNamaIlmiah(kelompokGroups[noKelompok][0]?.komoditas)}</h2>
                  )}
                </div>
                
                {unlockedGroups.includes(noKelompok) && kelompokGroups[noKelompok] && (
                  <button 
                    onClick={() => downloadWord(noKelompok, kelompokGroups[noKelompok])} 
                    className="w-full md:w-auto bg-slate-950 text-white px-8 py-4 rounded-2xl font-black text-xs hover:bg-blue-600 transition-all shadow-lg active:scale-95"
                  >
                    📥 DOWNLOAD .DOCX
                  </button>
                )}
              </div>

              {!unlockedGroups.includes(noKelompok) ? (
                <div className="py-10 px-4 text-center bg-slate-50 rounded-3xl border border-slate-200 relative overflow-hidden">
                  {/* LOGIKA LOADING MANIS: Hanya muncul pada kelompok yang sedang diverifikasi */}
                  {verifyingGroup === noKelompok ? (
                    <div className="flex flex-col items-center justify-center space-y-3 animate-in fade-in duration-500">
                       <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                       <p className="text-sm font-medium text-blue-600 italic">
                         Tunggu sebentar ya, sedang menjemput data kamu di cloud... ✨
                       </p>
                    </div>
                  ) : (
                    <>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Input Password Kelompok untuk Mengisi & Unduh</p>
                      <div className="flex flex-col sm:flex-row justify-center gap-2 max-w-sm mx-auto">
                        <input 
                          type="password" 
                          placeholder="Password..."
                          className="w-full sm:flex-1 p-3 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 ring-blue-600"
                          onChange={(e) => setPassInput({...passInput, [noKelompok]: e.target.value})}
                          onKeyDown={(e) => e.key === 'Enter' && handleVerifyPassword(noKelompok)}
                        />
                        <button 
                          onClick={() => handleVerifyPassword(noKelompok)}
                          className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-xs hover:bg-slate-900 transition-all"
                        >
                          BUKA
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : !kelompokGroups[noKelompok] || kelompokGroups[noKelompok].length === 0 ? (
                <div className="bg-slate-50 p-10 text-center rounded-3xl border border-dashed border-slate-200">
                   <p className="text-slate-400 font-medium italic">Kelompok ini belum memiliki data logbook.</p>
                </div>
              ) : (
                <>
                  <div className="mb-10">
                    <h3 className="font-black text-xs uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span> Data Pertumbuhan Mingguan
                    </h3>
                    <div className="overflow-x-auto -mx-6 md:mx-0 px-6 md:px-0">
                      <table className="w-full text-sm border-separate border-spacing-1 md:border-spacing-2 min-w-[400px]">
                        <thead>
                          <tr>
                            <th className="text-left p-2 text-slate-400 uppercase text-[10px] tracking-wider">Parameter</th>
                            <th className="p-2 text-slate-400 uppercase text-[10px] tracking-wider text-center">Minggu 1</th>
                            <th className="p-2 text-slate-400 uppercase text-[10px] tracking-wider text-center">Minggu 2</th>
                          </tr>
                        </thead>
                        <tbody>
                          {["Tinggi Tanaman", "Jumlah Daun", "Jumlah Bunga", "Jumlah Buah"].map((param) => (
                            <tr key={param}>
                              <td className="font-bold text-slate-700 p-2 text-xs md:text-sm">{param}</td>
                              <td className="p-1 md:p-2">
                                <input 
                                  type="text" placeholder="H1"
                                  className="w-full p-2 md:p-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 ring-blue-600 outline-none text-center transition-all text-xs"
                                  onChange={(e) => handleParamChange(noKelompok, param, 'm1', e.target.value)}
                                />
                              </td>
                              <td className="p-1 md:p-2">
                                <input 
                                  type="text" placeholder="H2"
                                  className="w-full p-2 md:p-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 ring-blue-600 outline-none text-center transition-all text-xs"
                                  onChange={(e) => handleParamChange(noKelompok, param, 'm2', e.target.value)}
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">D. Kendala</label>
                      <textarea 
                        className="p-4 bg-slate-50 border border-slate-100 rounded-2xl h-24 text-xs outline-none focus:ring-2 ring-red-500"
                        placeholder="Contoh: Serangan hama kutu daun..."
                        onChange={(e) => handleExtraChange(noKelompok, 'kendala', e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">E. Solusi</label>
                      <textarea 
                        className="p-4 bg-slate-50 border border-slate-100 rounded-2xl h-24 text-xs outline-none focus:ring-2 ring-green-500"
                        placeholder="Contoh: Pemberian pestisida nabati..."
                        onChange={(e) => handleExtraChange(noKelompok, 'solusi', e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">F. Kesimpulan</label>
                      <textarea 
                        className="p-4 bg-slate-50 border border-slate-100 rounded-2xl h-24 text-xs outline-none focus:ring-2 ring-blue-500"
                        placeholder="Biarkan kosong untuk menggunakan narasi otomatis..."
                        value={extraInfo[noKelompok]?.kesimpulan || ""}
                        onChange={(e) => handleExtraChange(noKelompok, 'kesimpulan', e.target.value)}
                      />
                      <button 
                        onClick={() => handleExtraChange(noKelompok, 'kesimpulan', generateNarrative(noKelompok))}
                        className="text-[8px] font-bold text-blue-600 hover:underline text-left mt-1"
                      >
                        ✨ Gunakan Template Kesimpulan
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-black text-xs uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-600 rounded-full"></span> Dokumentasi Terdeteksi ({kelompokGroups[noKelompok].length} Foto)
                    </h3>
                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0">
                      {kelompokGroups[noKelompok].map((log: any, idx: number) => (
                        <div key={idx} className="flex-shrink-0 relative group flex flex-col items-center">
                          <img src={log.foto} className="w-24 h-24 md:w-28 md:h-28 object-cover rounded-2xl border-2 border-white shadow-md transition-transform group-hover:scale-105" loading="lazy" />
                          <div className="mt-2 flex flex-col items-center gap-1">
                            <span className="bg-black/50 text-white text-[8px] px-2 py-1 rounded-full backdrop-blur-sm">Day {idx + 1}</span>
                            <span className="text-[9px] font-bold text-slate-600 max-w-[90px] md:max-w-[100px] truncate">Oleh: {log.nama || 'Anonim'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
      </div>
    </main>
  );
}