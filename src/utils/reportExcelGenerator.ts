import * as XLSX from 'xlsx';
import { Transaction, StockMovement, PharmacySettings } from '../types';
import { FinancialMetrics, ReportFilterInfo } from './reportPdfGenerator';

/**
 * Format currency to match user image format e.g. "Rp 24.500"
 */
const formatRp = (val: number): string => {
  return 'Rp ' + Math.round(val).toLocaleString('id-ID');
};

/**
 * Format timestamp to match user image format: "DD/MM/YYYY, HH.mm" e.g. "22/09/2026, 08.15"
 */
const formatDateTime = (ts: string): string => {
  const d = new Date(ts);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year}, ${hours}.${minutes}`;
};

/**
 * Generate and download Sales Report in Excel (.xlsx) format
 * Table header and row format precisely matched to user specification:
 * [No, No. Faktur, Waktu, Pelanggan, Kasir, Metode, Rincian Obat & Alkes, Subtotal, Diskon, Total Akhir, Laba Bersih, Status]
 */
export const exportSalesReportXLSX = (
  transactions: Transaction[],
  settings: PharmacySettings,
  filters: ReportFilterInfo,
  metrics: FinancialMetrics,
  printedBy: string = 'Administrator / Apoteker'
) => {
  const wb = XLSX.utils.book_new();

  const currentDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const currentTime = new Date().toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const rows: any[][] = [
    // Header Kop Apotek
    [settings.pharmacyName.toUpperCase()],
    [`${settings.address} • Telp: ${settings.phone} • SIA: ${settings.siaNumber || '-'} • SIPA: ${settings.sipaNumber || '-'}`],
    ['LAPORAN PENJUALAN APOTEK (SALES REPORT)'],
    [`Periode: ${filters.periodLabel} | Tanggal Ekspor: ${currentDate} ${currentTime} | Dicetak Oleh: ${printedBy}`],
    [''],
    // EXACT TABLE HEADERS AS SPECIFIED BY USER
    [
      'No',
      'No. Faktur',
      'Waktu',
      'Pelanggan',
      'Kasir',
      'Metode',
      'Rincian Obat & Alkes',
      'Subtotal',
      'Diskon',
      'Total Akhir',
      'Laba Bersih',
      'Status',
    ],
  ];

  // Data Rows matching screenshot format
  transactions.forEach((t, idx) => {
    const timeFormatted = formatDateTime(t.timestamp);
    const itemsSummary = t.items
      .map((it) => `${it.medicine.name} (${it.quantity} ${it.selectedUnit.name})`)
      .join(', ');

    const subtotalFormatted = formatRp(t.subtotal || t.total);
    const discountFormatted = t.discount > 0 ? formatRp(t.discount) : '-';
    const totalFormatted = formatRp(t.total);
    const profitFormatted = formatRp(t.netProfit || 0);
    const statusText = t.status === 'completed' ? 'LUNAS' : 'VOID';

    rows.push([
      idx + 1,
      t.invoiceNumber,
      timeFormatted,
      t.customerName || 'Pelanggan Umum',
      t.cashierName,
      t.paymentMethod.toUpperCase(),
      itemsSummary,
      subtotalFormatted,
      discountFormatted,
      totalFormatted,
      profitFormatted,
      statusText,
    ]);
  });

  // GRAND TOTAL ROW MATCHING EXACT SCREENSHOT
  rows.push([
    '',
    'GRAND TOTAL',
    `${transactions.length} Faktur`,
    '',
    '',
    '',
    '',
    formatRp(metrics.totalGrossSales),
    metrics.totalDiscount > 0 ? formatRp(metrics.totalDiscount) : '-',
    formatRp(metrics.totalNetSales),
    formatRp(metrics.netProfit),
    '',
  ]);

  const ws = XLSX.utils.aoa_to_sheet(rows);

  // Column widths for optimal display in Excel without truncation
  ws['!cols'] = [
    { wch: 6 },  // No
    { wch: 22 }, // No. Faktur
    { wch: 20 }, // Waktu
    { wch: 22 }, // Pelanggan
    { wch: 24 }, // Kasir
    { wch: 12 }, // Metode
    { wch: 55 }, // Rincian Obat & Alkes
    { wch: 18 }, // Subtotal
    { wch: 14 }, // Diskon
    { wch: 18 }, // Total Akhir
    { wch: 18 }, // Laba Bersih
    { wch: 12 }, // Status
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Laporan_Penjualan');

  const filename = `Laporan_Penjualan_${settings.pharmacyName.replace(/\s+/g, '_')}_${filters.periodLabel.replace(/\s+/g, '_')}.xlsx`;
  XLSX.writeFile(wb, filename);
};

/**
 * Generate and download Profit & Loss Report in Excel (.xlsx) format
 * Matched with standard executive layout
 */
export const exportProfitLossXLSX = (
  transactions: Transaction[],
  settings: PharmacySettings,
  filters: ReportFilterInfo,
  metrics: FinancialMetrics,
  printedBy: string = 'Administrator / Apoteker'
) => {
  const wb = XLSX.utils.book_new();

  const currentDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const currentTime = new Date().toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Sheet 1: Formal Income Statement
  const packagingCost = Math.round(metrics.totalNetSales * 0.008);
  const paymentFeeCost = Math.round(metrics.totalNetSales * 0.002);
  const totalOperatingExpenses = packagingCost + paymentFeeCost;
  const netOperatingProfit = metrics.grossProfit - totalOperatingExpenses;
  const netOperatingMargin = metrics.totalNetSales > 0 ? ((netOperatingProfit / metrics.totalNetSales) * 100).toFixed(1) : '0';

  const incomeStatementRows: any[][] = [
    [settings.pharmacyName.toUpperCase()],
    [`${settings.address} • Telp: ${settings.phone} • SIA: ${settings.siaNumber || '-'} • SIPA: ${settings.sipaNumber || '-'}`],
    ['LAPORAN LABA RUGI KOMPREHENSIF APOTEK (INCOME STATEMENT)'],
    [`Periode: ${filters.periodLabel} | Tanggal Ekspor: ${currentDate} ${currentTime} | Dicetak Oleh: ${printedBy}`],
    [''],
    ['URAIAN KEUANGAN APOTEK', 'SUBTOTAL', 'TOTAL AKUMULASI'],
    ['1. PENDAPATAN OPERASIONAL USAHA', '', ''],
    ['   Penjualan Kotor Obat & Alkes (Gross Sales)', formatRp(metrics.totalGrossSales), ''],
    ['   Potongan & Diskon Promosi Penjualan (-)', `(${metrics.totalDiscount > 0 ? formatRp(metrics.totalDiscount) : 'Rp 0'})`, ''],
    ['   TOTAL PENDAPATAN BERSIH (NET REVENUE)', '', formatRp(metrics.totalNetSales)],
    ['2. BEBAN POKOK PENJUALAN (HPP)', '', ''],
    ['   Harga Pokok Pembelian Obat Terjual (COGS PBF Resmi)', '', `(${formatRp(metrics.totalHPP)})`],
    ['3. LABA KOTOR APOTEK (GROSS PROFIT)', '', formatRp(metrics.grossProfit)],
    ['   Persentase Margin Laba Kotor (%)', '', `${metrics.marginPercent}%`],
    ['4. ESTIMASI BEBAN OPERASIONAL PENJUALAN', '', ''],
    ['   Beban Kemasan, Klip & Plastik Etiket Obat (0.8%)', formatRp(packagingCost), ''],
    ['   Biaya Administrasi Transaksi & MDR QRIS (0.2%)', formatRp(paymentFeeCost), ''],
    ['   Total Beban Operasional Terkait', '', `(${formatRp(totalOperatingExpenses)})`],
    ['5. LABA BERSIH OPERASIONAL AKHIR (NET PROFIT)', '', formatRp(netOperatingProfit)],
    ['   Persentase Margin Bersih Akhir (%)', '', `${netOperatingMargin}%`],
  ];

  const wsIncome = XLSX.utils.aoa_to_sheet(incomeStatementRows);
  wsIncome['!cols'] = [
    { wch: 55 },
    { wch: 22 },
    { wch: 25 },
  ];
  XLSX.utils.book_append_sheet(wb, wsIncome, 'Laba_Rugi_Akuntansi');

  // Sheet 2: Margin per Faktur following the user's styled column structure
  const marginRows: any[][] = [
    [settings.pharmacyName.toUpperCase()],
    ['RINCIAN MARGIN LABA PER FAKTUR PENJUALAN'],
    [`Periode: ${filters.periodLabel}`],
    [''],
    [
      'No',
      'No. Faktur',
      'Waktu',
      'Pelanggan',
      'Kasir',
      'Metode',
      'Rincian Obat & Alkes',
      'Omzet Jual',
      'HPP Modal',
      'Laba Bersih',
      'Margin %',
      'Tingkat Profit',
    ],
  ];

  transactions.forEach((t, idx) => {
    const margin = t.total > 0 ? (t.netProfit / t.total) * 100 : 0;
    const marginStr = margin.toFixed(1);
    const itemsSummary = t.items.map((it) => `${it.medicine.name} (${it.quantity} ${it.selectedUnit.name})`).join(', ');

    let profitLevel = 'Tipis (<15%)';
    if (margin >= 30) profitLevel = 'Tinggi (>30%)';
    else if (margin >= 15) profitLevel = 'Normal (15-30%)';

    marginRows.push([
      idx + 1,
      t.invoiceNumber,
      formatDateTime(t.timestamp),
      t.customerName || 'Pelanggan Umum',
      t.cashierName,
      t.paymentMethod.toUpperCase(),
      itemsSummary,
      formatRp(t.total),
      formatRp(t.totalHPP || 0),
      formatRp(t.netProfit || 0),
      `${marginStr}%`,
      profitLevel,
    ]);
  });

  marginRows.push([
    '',
    'GRAND TOTAL',
    `${transactions.length} Faktur`,
    '',
    '',
    '',
    '',
    formatRp(metrics.totalNetSales),
    formatRp(metrics.totalHPP),
    formatRp(metrics.netProfit),
    `${metrics.marginPercent}%`,
    '',
  ]);

  const wsMargin = XLSX.utils.aoa_to_sheet(marginRows);
  wsMargin['!cols'] = [
    { wch: 6 },
    { wch: 22 },
    { wch: 20 },
    { wch: 20 },
    { wch: 24 },
    { wch: 12 },
    { wch: 55 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
    { wch: 14 },
    { wch: 20 },
  ];
  XLSX.utils.book_append_sheet(wb, wsMargin, 'Margin_per_Faktur');

  const filename = `Laporan_Laba_Rugi_${settings.pharmacyName.replace(/\s+/g, '_')}_${filters.periodLabel.replace(/\s+/g, '_')}.xlsx`;
  XLSX.writeFile(wb, filename);
};

/**
 * Generate and download Stock Movements Report in Excel (.xlsx) format
 */
export const exportStockMovementsXLSX = (
  movements: StockMovement[],
  settings: PharmacySettings,
  periodLabel: string
) => {
  const wb = XLSX.utils.book_new();

  const rows: any[][] = [
    [settings.pharmacyName.toUpperCase()],
    [`${settings.address} • Telp: ${settings.phone}`],
    ['LAPORAN MUTASI & KARTU STOK PERSEDIAAN OBAT'],
    [`Periode: ${periodLabel} | Total: ${movements.length} Log Mutasi`],
    [''],
    [
      'No',
      'Waktu',
      'Nama Obat & Alkes',
      'Tipe Mutasi',
      'Perubahan Qty',
      'Satuan',
      'Saldo Awal',
      'Saldo Akhir',
      'No. Referensi',
      'Petugas Operator',
    ],
  ];

  movements.forEach((s, idx) => {
    rows.push([
      idx + 1,
      s.date,
      s.medicineName,
      s.type === 'in' ? 'Masuk (In)' : s.type === 'out' ? 'Keluar (Out)' : 'Penyesuaian',
      s.qtyChange,
      s.unit,
      s.previousStock,
      s.currentStock,
      s.refNumber,
      s.operator,
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [
    { wch: 6 },
    { wch: 20 },
    { wch: 35 },
    { wch: 18 },
    { wch: 16 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 25 },
    { wch: 24 },
  ];
  XLSX.utils.book_append_sheet(wb, ws, 'Mutasi_Stok');

  const filename = `Laporan_Mutasi_Stok_${settings.pharmacyName.replace(/\s+/g, '_')}_${periodLabel.replace(/\s+/g, '_')}.xlsx`;
  XLSX.writeFile(wb, filename);
};

/**
 * Generate and download Transactions Register in Excel (.xlsx) format
 * Also adopting the exact 12-column header format:
 * [No, No. Faktur, Waktu, Pelanggan, Kasir, Metode, Rincian Obat & Alkes, Subtotal, Diskon, Total Akhir, Laba Bersih, Status]
 */
export const exportTransactionsRegisterXLSX = (
  transactions: Transaction[],
  settings: PharmacySettings,
  periodLabel: string = 'Seluruh Transaksi'
) => {
  const wb = XLSX.utils.book_new();

  const rows: any[][] = [
    [settings.pharmacyName.toUpperCase()],
    [`${settings.address} • Telp: ${settings.phone}`],
    ['DAFTAR RIWAYAT TRANSAKSI PENJUALAN KASIR'],
    [`Periode / Filter: ${periodLabel} | Total: ${transactions.length} Faktur`],
    [''],
    [
      'No',
      'No. Faktur',
      'Waktu',
      'Pelanggan',
      'Kasir',
      'Metode',
      'Rincian Obat & Alkes',
      'Subtotal',
      'Diskon',
      'Total Akhir',
      'Laba Bersih',
      'Status',
    ],
  ];

  let totalGross = 0;
  let totalDisc = 0;
  let totalNet = 0;
  let totalProfit = 0;

  transactions.forEach((tx, idx) => {
    const items = tx.items
      .map((it) => `${it.medicine.name} (${it.quantity} ${it.selectedUnit.name})`)
      .join(', ');

    if (tx.status === 'completed') {
      totalGross += tx.subtotal || tx.total;
      totalDisc += tx.discount || 0;
      totalNet += tx.total;
      totalProfit += tx.netProfit || 0;
    }

    rows.push([
      idx + 1,
      tx.invoiceNumber,
      formatDateTime(tx.timestamp),
      tx.customerName || 'Pelanggan Umum',
      tx.cashierName,
      tx.paymentMethod.toUpperCase(),
      items,
      formatRp(tx.subtotal || tx.total),
      tx.discount > 0 ? formatRp(tx.discount) : '-',
      formatRp(tx.total),
      formatRp(tx.netProfit || 0),
      tx.status === 'completed' ? 'LUNAS' : 'VOID',
    ]);
  });

  rows.push([
    '',
    'GRAND TOTAL',
    `${transactions.length} Faktur`,
    '',
    '',
    '',
    '',
    formatRp(totalGross),
    totalDisc > 0 ? formatRp(totalDisc) : '-',
    formatRp(totalNet),
    formatRp(totalProfit),
    '',
  ]);

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [
    { wch: 6 },
    { wch: 22 },
    { wch: 20 },
    { wch: 22 },
    { wch: 24 },
    { wch: 12 },
    { wch: 55 },
    { wch: 18 },
    { wch: 14 },
    { wch: 18 },
    { wch: 18 },
    { wch: 12 },
  ];
  XLSX.utils.book_append_sheet(wb, ws, 'Riwayat_Transaksi');

  const filename = `Riwayat_Transaksi_${settings.pharmacyName.replace(/\s+/g, '_')}.xlsx`;
  XLSX.writeFile(wb, filename);
};
