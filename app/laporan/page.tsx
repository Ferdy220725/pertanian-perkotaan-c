"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Document, Packer, Paragraph, Table, TableRow, TableCell, 
  WidthType, HeadingLevel, ImageRun, TextRun, AlignmentType 
} from 'docx';
import { saveAs } from 'file-saver';
import { createClient } from '@/utils/supabase/client';

export default function LaporanPage() {
  const router = useRouter();
  const supabase = createClient();
  const [dataRiwayat, setDataRiwayat] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State untuk menampung input parameter per kelompok
  const [parameters, setParameters] = useState<any>({});

  // FUNGSI AMBIL DATA DARI SUPABASE
  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('logbook')
        .select('*')
        .order('created_at', { ascending: true }); 
      
      if (error) throw error;
      setDataRiwayat(data || []);
    } catch (error: any) {
      alert("Gagal mengambil data dari cloud: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const kelompokGroups = dataRiwayat.reduce((groups, item) => {
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
      const komoditas = items[0].komoditas;
      const groupParams = parameters[noKelompok] || {};

      const imageRuns = items.map((item) => {
        if (!item.foto) return new Paragraph("Foto tidak tersedia");
        try {
          return new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new ImageRun({
                data: base64ToUint8Array(item.foto),
                // MENGGUNAKAN RASIO 4:3 (300x225) AGAR PROPORSIONAL HP
                transformation: { width: 300, height: 300 },
                type: "png",
              }),
              new TextRun({ 
                text: `\nTanggal: ${item.tanggal}`, 
                break: 1,
                size: 20,
                italics: true 
              }),
            ],
          });
        } catch (e) { return new Paragraph("Gagal memuat gambar"); }
      });

      const doc = new Document({
        sections: [{
          children: [
            new Paragraph({ text: "2. Laporan Mingguan", heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER }),
            new Paragraph({ text: "" }),
            new Paragraph({ children: [new TextRun({ text: "A. Identitas", bold: true })] }),
            new Paragraph({ text: `   Kelompok  : ${noKelompok}` }),
            new Paragraph({ text: `   Komoditas : ${komoditas}` }),
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
            ...imageRuns,
            new Paragraph({ text: "" }),
            new Paragraph({ children: [new TextRun({ text: "D. Kendala", bold: true })] }),
            new Paragraph({ text: "__________________________________________________________________" }),
            new Paragraph({ text: "" }),
            new Paragraph({ children: [new TextRun({ text: "E. Solusi", bold: true })] }),
            new Paragraph({ text: "__________________________________________________________________" }),
            new Paragraph({ text: "" }),
            new Paragraph({ children: [new TextRun({ text: "F. Kesimpulan", bold: true })] }),
            new Paragraph({ text: "__________________________________________________________________" }),
          ],
        }],
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `Laporan_Mingguan_Kelompok_${noKelompok}.docx`);
    } catch (error) { alert("❌ Gagal membuat file."); }
  };

  return (
    <main className="min-h-screen bg-[#f8fafc] p-6 md:p-12 font-sans text-slate-900">
      <div className="max-w-5xl mx-auto">
        <header className="mb-10">
          <button onClick={() => router.push('/')} className="text-sm font-bold text-slate-400 hover:text-black transition-colors">← Kembali ke Dashboard</button>
          <h1 className="text-4xl font-black mt-2 tracking-tighter uppercase">Penyusunan Laporan</h1>
          <p className="text-slate-500 italic">Data disinkronkan dari cloud. Lengkapi parameter sebelum download.</p>
        </header>

        {loading ? (
          <div className="text-center py-20 bg-white rounded-[3rem] shadow-sm">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
            <p className="mt-4 font-bold text-slate-400 uppercase text-[10px] tracking-widest">Sinkronisasi Data...</p>
          </div>
        ) : Object.keys(kelompokGroups).length === 0 ? (
          <div className="bg-white p-20 text-center rounded-[3rem] border-2 border-dashed border-slate-200">
            <p className="text-slate-400 font-medium italic">Belum ada data logbook di database cloud.</p>
          </div>
        ) : (
          Object.keys(kelompokGroups).sort().map((noKelompok) => (
            <div key={noKelompok} className="bg-white p-8 rounded-[3rem] shadow-xl mb-12 border border-slate-100 overflow-hidden">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-slate-50 pb-6">
                <div>
                  <span className="text-[10px] font-black bg-blue-600 text-white px-4 py-1 rounded-full uppercase tracking-widest">Kelompok {noKelompok}</span>
                  <h2 className="text-2xl font-bold mt-2 text-slate-800">{kelompokGroups[noKelompok][0].komoditas}</h2>
                </div>
                <button 
                  onClick={() => downloadWord(noKelompok, kelompokGroups[noKelompok])} 
                  className="mt-4 md:mt-0 bg-slate-950 text-white px-8 py-4 rounded-2xl font-black text-xs hover:bg-blue-600 transition-all shadow-lg active:scale-95"
                >
                  📥 DOWNLOAD .DOCX
                </button>
              </div>

              {/* INPUT PARAMETER SECTION */}
              <div className="mb-10">
                <h3 className="font-black text-xs uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span> Data Pertumbuhan Mingguan
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-separate border-spacing-2">
                    <thead>
                      <tr>
                        <th className="text-left p-2 text-slate-400 uppercase text-[10px] tracking-wider">Parameter</th>
                        <th className="p-2 text-slate-400 uppercase text-[10px] tracking-wider">Minggu 1</th>
                        <th className="p-2 text-slate-400 uppercase text-[10px] tracking-wider">Minggu 2</th>
                      </tr>
                    </thead>
                    <tbody>
                      {["Tinggi Tanaman", "Jumlah Daun", "Jumlah Bunga", "Jumlah Buah"].map((param) => (
                        <tr key={param}>
                          <td className="font-bold text-slate-700 p-2">{param}</td>
                          <td className="p-2">
                            <input 
                              type="text" placeholder="Hasil M1"
                              className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 ring-blue-600 outline-none text-center transition-all"
                              onChange={(e) => handleParamChange(noKelompok, param, 'm1', e.target.value)}
                            />
                          </td>
                          <td className="p-2">
                            <input 
                              type="text" placeholder="Hasil M2"
                              className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 ring-blue-600 outline-none text-center transition-all"
                              onChange={(e) => handleParamChange(noKelompok, param, 'm2', e.target.value)}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* PREVIEW DOKUMENTASI */}
              <div>
                <h3 className="font-black text-xs uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-600 rounded-full"></span> Dokumentasi Terdeteksi ({kelompokGroups[noKelompok].length} Foto)
                </h3>
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                  {kelompokGroups[noKelompok].map((log: any, idx: number) => (
                    <div key={idx} className="flex-shrink-0 relative group">
                      <img src={log.foto} className="w-28 h-28 object-cover rounded-2xl border-2 border-white shadow-md transition-transform group-hover:scale-105" />
                      <div className="absolute bottom-2 left-0 right-0 text-center">
                        <span className="bg-black/50 text-white text-[8px] px-2 py-1 rounded-full backdrop-blur-sm">Day {idx + 1}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}