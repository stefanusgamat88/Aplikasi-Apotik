import React, { useState } from 'react';
import {
  Calendar,
  Coins,
  DollarSign,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  Package,
  Printer,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ReportsView: React.FC = () => {
  const { transactions, stockMovements, medicines, settings } = useApp();
  const [reportType, setReportType] = useState<'sales' | 'profit' | 'stock'>('sales');
  const [selectedMonth, setSelectedMonth] = useState('2026-09');

  const completedTxs = transactions.filter((t) => t.status === 'completed');

  const totalOmzet = completedTxs.reduce((sum, t) => sum + t.total, 0);
  const totalHPP = completedTxs.reduce((sum, t) => sum + t.totalHPP, 0);
  const totalLaba = totalOmzet - totalHPP;
  const marginPercent = totalOmzet > 0 ? ((totalLaba / totalOmzet) * 100).toFixed(1) : '0';

  // Export to CSV
  const handleExportCSV = () => {
    if (reportType === 'sales') {
      let csv = 'No. Faktur;Tanggal;Kasir;Pelanggan;Metode Bayar;Subtotal;Diskon;Total;Laba Bersih\n';
      completedTxs.forEach((t) => {
        csv += `"${t.invoiceNumber}";"${t.timestamp}";"${t.cashierName}";"${t.customerName}";"${t.paymentMethod}";${t.subtotal};${t.discount};${t.total};${t.netProfit}\n`;
      });
      downloadFile(csv, `Laporan_Penjualan_Apotek_${selectedMonth}.csv`, 'text/csv;charset=utf-8;');
    } else if (reportType === 'profit') {
      let csv = 'No. Faktur;Tanggal;Total Omzet;HPP Modal;Laba Kotor;Margin%\n';
      completedTxs.forEach((t) => {
        const margin = t.total > 0 ? ((t.netProfit / t.total) * 100).toFixed(1) : '0';
        csv += `"${t.invoiceNumber}";"${t.timestamp}";${t.total};${t.totalHPP};${t.netProfit};${margin}%\n`;
      });
      downloadFile(csv, `Laporan_Laba_Rugi_Apotek_${selectedMonth}.csv`, 'text/csv;charset=utf-8;');
    } else {
      let csv = 'Tanggal;Nama Obat;Tipe;Perubahan Qty;Satuan;Saldo Awal;Saldo Akhir;Referensi;Operator\n';
      stockMovements.forEach((s) => {
        csv += `"${s.date}";"${s.medicineName}";"${s.type}";${s.qtyChange};"${s.unit}";${s.previousStock};${s.currentStock};"${s.refNumber}";"${s.operator}"\n`;
      });
      downloadFile(csv, `Laporan_Mutasi_Stok_Apotek_${selectedMonth}.csv`, 'text/csv;charset=utf-8;');
    }
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-7xl mx-auto overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">
            Laporan Keuangan & Stok Apotek
          </h2>
          <p className="text-xs text-slate-500">
            Audit pembukuan omzet, analisis margin laba kotor / bersih, dan pergerakan mutasi persediaan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            Cetak Laporan
          </button>
          <button
            id="btn-export-excel"
            onClick={handleExportCSV}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-700/20 transition-all flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Ekspor Excel (CSV)
          </button>
        </div>
      </div>

      {/* Tabs & Month Selector */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setReportType('sales')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              reportType === 'sales'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Laporan Penjualan
          </button>
          <button
            onClick={() => setReportType('profit')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              reportType === 'profit'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Laba Rugi (Income Statement)
          </button>
          <button
            onClick={() => setReportType('stock')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              reportType === 'stock'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Mutasi Stok Barang
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-semibold text-slate-500">Total Omzet Penjualan</p>
          <p className="text-xl font-black text-slate-900 mt-1">
            Rp {totalOmzet.toLocaleString('id-ID')}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">{completedTxs.length} transaksi lunas</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-semibold text-slate-500">Total HPP Modal Pembelian</p>
          <p className="text-xl font-black text-slate-700 mt-1">
            Rp {totalHPP.toLocaleString('id-ID')}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Biaya pokok barang terjual</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-xs">
          <p className="text-xs font-semibold text-emerald-800">Laba Bersih Apotek</p>
          <p className="text-xl font-black text-emerald-700 mt-1">
            Rp {totalLaba.toLocaleString('id-ID')}
          </p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
            Margin Keuntungan: {marginPercent}%
          </p>
        </div>
      </div>

      {/* Dynamic Report Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-800">
            {reportType === 'sales'
              ? 'Rincian Penjualan per Faktur'
              : reportType === 'profit'
              ? 'Rincian Margin Laba Bersih'
              : 'Rincian Keluar Masuk Persediaan'}
          </h3>
          <span className="text-xs text-slate-400">Periode: September 2026</span>
        </div>

        <div className="overflow-x-auto">
          {reportType === 'sales' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">No. Faktur</th>
                  <th className="py-3 px-3">Waktu</th>
                  <th className="py-3 px-3">Kasir</th>
                  <th className="py-3 px-3">Pelanggan</th>
                  <th className="py-3 px-3">Metode</th>
                  <th className="py-3 px-3 text-right">Subtotal</th>
                  <th className="py-3 px-4 text-right">Total Akhir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {completedTxs.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-mono font-bold text-slate-800">{t.invoiceNumber}</td>
                    <td className="py-2.5 px-3 text-slate-500">{new Date(t.timestamp).toLocaleDateString('id-ID')}</td>
                    <td className="py-2.5 px-3">{t.cashierName}</td>
                    <td className="py-2.5 px-3">{t.customerName}</td>
                    <td className="py-2.5 px-3 uppercase font-bold text-[10px] text-slate-600">{t.paymentMethod}</td>
                    <td className="py-2.5 px-3 text-right text-slate-600">Rp {t.subtotal.toLocaleString('id-ID')}</td>
                    <td className="py-2.5 px-4 text-right font-black text-slate-900">Rp {t.total.toLocaleString('id-ID')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'profit' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">No. Faktur</th>
                  <th className="py-3 px-3">Item Terjual</th>
                  <th className="py-3 px-3 text-right">Omzet Jual</th>
                  <th className="py-3 px-3 text-right">HPP Modal</th>
                  <th className="py-3 px-3 text-right">Laba Bersih</th>
                  <th className="py-3 px-4 text-right">Margin %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {completedTxs.map((t) => {
                  const margin = t.total > 0 ? ((t.netProfit / t.total) * 100).toFixed(1) : '0';
                  return (
                    <tr key={t.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-4 font-mono font-bold text-slate-800">{t.invoiceNumber}</td>
                      <td className="py-2.5 px-3 text-slate-600">
                        {t.items.map((it) => it.medicine.name).join(', ')}
                      </td>
                      <td className="py-2.5 px-3 text-right font-semibold">Rp {t.total.toLocaleString('id-ID')}</td>
                      <td className="py-2.5 px-3 text-right text-slate-500">Rp {t.totalHPP.toLocaleString('id-ID')}</td>
                      <td className="py-2.5 px-3 text-right font-black text-emerald-700">Rp {t.netProfit.toLocaleString('id-ID')}</td>
                      <td className="py-2.5 px-4 text-right font-bold text-slate-800">{margin}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {reportType === 'stock' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Waktu</th>
                  <th className="py-3 px-3">Nama Obat</th>
                  <th className="py-3 px-3">Tipe</th>
                  <th className="py-3 px-3 text-right">Perubahan</th>
                  <th className="py-3 px-3 text-center">Saldo Akhir</th>
                  <th className="py-3 px-4">Faktur / Operator</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stockMovements.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-mono text-slate-500">{s.date}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-800">{s.medicineName}</td>
                    <td className="py-2.5 px-3 uppercase text-[10px] font-bold text-slate-600">{s.type}</td>
                    <td className="py-2.5 px-3 text-right font-bold">
                      <span className={s.qtyChange > 0 ? 'text-emerald-600' : 'text-rose-600'}>
                        {s.qtyChange > 0 ? `+${s.qtyChange}` : s.qtyChange} {s.unit}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-900">{s.currentStock}</td>
                    <td className="py-2.5 px-4 text-slate-600">
                      {s.refNumber} • {s.operator}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
