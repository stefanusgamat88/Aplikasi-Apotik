import React, { useState, useEffect, useRef } from 'react';
import {
  AlertTriangle,
  Building,
  CheckCircle2,
  Database,
  Download,
  FileCheck,
  FileJson,
  Printer,
  Receipt,
  RotateCcw,
  Save,
  Shield,
  Upload,
  Clock,
  Sparkles,
  Info,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    resetDemoData,
    exportBackupJSON,
    importBackupJSON,
    currentUser,
  } = useApp();

  const [pharmacyName, setPharmacyName] = useState(settings.pharmacyName);
  const [pharmacyTagline, setPharmacyTagline] = useState(settings.pharmacyTagline);
  const [address, setAddress] = useState(settings.address);
  const [city, setCity] = useState(settings.city);
  const [phone, setPhone] = useState(settings.phone);
  const [siaNumber, setSiaNumber] = useState(settings.siaNumber);
  const [sipaNumber, setSipaNumber] = useState(settings.sipaNumber);
  const [pharmacistName, setPharmacistName] = useState(settings.pharmacistName);
  const [receiptFooter, setReceiptFooter] = useState(settings.receiptFooter);
  const [printerPaperWidth, setPrinterPaperWidth] = useState<'58mm' | '80mm'>(settings.printerPaperWidth);
  const [enableTax, setEnableTax] = useState(settings.enableTax);
  const [taxRate, setTaxRate] = useState(settings.taxRate);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [restoreFeedback, setRestoreFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const [lastBackupTime, setLastBackupTime] = useState<string | null>(() => {
    return localStorage.getItem('apotekpos_last_backup_time');
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Synchronize local input state whenever context settings change (e.g. from restore or other views)
  useEffect(() => {
    setPharmacyName(settings.pharmacyName);
    setPharmacyTagline(settings.pharmacyTagline);
    setAddress(settings.address);
    setCity(settings.city);
    setPhone(settings.phone);
    setSiaNumber(settings.siaNumber);
    setSipaNumber(settings.sipaNumber);
    setPharmacistName(settings.pharmacistName);
    setReceiptFooter(settings.receiptFooter);
    setPrinterPaperWidth(settings.printerPaperWidth);
    setEnableTax(settings.enableTax);
    setTaxRate(settings.taxRate);
  }, [settings]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      pharmacyName,
      pharmacyTagline,
      address,
      city,
      phone,
      siaNumber,
      sipaNumber,
      pharmacistName,
      receiptFooter,
      printerPaperWidth,
      enableTax,
      taxRate: Number(taxRate),
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  const handleBackupNow = () => {
    exportBackupJSON();
    const nowStr = new Date().toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    setLastBackupTime(nowStr);
    localStorage.setItem('apotekpos_last_backup_time', nowStr);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (content) {
        const result = importBackupJSON(content);
        setRestoreFeedback(result);
        setTimeout(() => setRestoreFeedback(null), 5000);
      }
    };
    reader.readAsText(file);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-5xl mx-auto overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">
            Pengaturan Apotek & Printer Thermal
          </h2>
          <p className="text-xs text-slate-500">
            Kelola profil personal apotek, nama apoteker resmi (SIA & SIPA), printer struk kasir, serta backup & restore database JSON berkala.
          </p>
        </div>

        {savedSuccess && (
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200 flex items-center gap-1.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            Pengaturan & Profil Apoteker Berhasil Diperbarui!
          </span>
        )}
      </div>

      {/* SECTION: Backup & Restore Data JSON Secara Berkala */}
      <div className="bg-gradient-to-br from-white to-slate-50 p-6 rounded-3xl border border-emerald-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
          <div className="flex items-center gap-2.5 text-slate-900">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Database className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Backup & Restore Database JSON (Berkala)</h3>
              <p className="text-[11px] text-slate-500">
                Amankan seluruh data apotek (katalog obat, riwayat transaksi, mutasi stok, supplier, pelanggan, dan pengaturan) ke dalam file .JSON secara mandiri.
              </p>
            </div>
          </div>

          <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            Data Offline & Personal
          </span>
        </div>

        {restoreFeedback && (
          <div
            className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2 border animate-in fade-in ${
              restoreFeedback.success
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {restoreFeedback.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{restoreFeedback.message}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Download Backup */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <FileJson className="w-4 h-4 text-emerald-600" />
                  Download Backup JSON Sekarang
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Lengkap
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Unduh file cadangan data JSON kapan saja sebelum tutup toko atau secara berkala harian/mingguan untuk menjaga keamanan data personal Anda.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-100">
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {lastBackupTime ? `Terakhir: ${lastBackupTime}` : 'Belum pernah di-backup'}
              </span>
              <button
                id="btn-backup-json"
                type="button"
                onClick={handleBackupNow}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Backup JSON Berkala</span>
              </button>
            </div>
          </div>

          {/* Restore Backup */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-indigo-600" />
                  Pulihkan / Restore dari File JSON
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  Import
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Punya file backup dari komputer atau perangkat lain? Unggah file .json untuk memulihkan seluruh data apotek secara instan.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-100">
              <span className="text-[10px] text-slate-400">Format: .json resmi ApotekPOS</span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleFileUpload}
                className="hidden"
                id="file-restore-input"
              />
              <button
                id="btn-restore-json"
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 active:scale-95"
              >
                <Upload className="w-4 h-4" />
                <span>Pilih File Backup JSON</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Identitas Apotek */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-slate-800 pb-3 border-b border-slate-100">
            <Building className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-sm">Identitas & Kontak Apotek</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Nama Apotek *</label>
              <input
                type="text"
                required
                value={pharmacyName}
                onChange={(e) => setPharmacyName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Slogan / Tagline</label>
              <input
                type="text"
                value={pharmacyTagline}
                onChange={(e) => setPharmacyTagline(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-semibold text-slate-700 block mb-1">Alamat Lengkap Apotek *</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Kota / Kabupaten *</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Nomor Telepon / WhatsApp *</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Legalitas Apotek (SIA, SIPA, & Nama Apoteker Pengelola) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-slate-800 pb-3 border-b border-slate-100">
            <Shield className="w-5 h-5 text-teal-600" />
            <div>
              <h3 className="font-bold text-sm">Legalitas Farmasi & Nama Apoteker Pengelola</h3>
              <p className="text-[11px] text-slate-400">
                Nama apoteker pengelola akan otomatis disinkronkan ke akun profil login, struk cetak kasir, dan kartu stok.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                SIA (Surat Izin Apotek) *
              </label>
              <input
                type="text"
                required
                value={siaNumber}
                onChange={(e) => setSiaNumber(e.target.value)}
                placeholder="503/001/SIA/DPMPTSP/2024"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                SIPA (Surat Izin Praktik Apoteker) *
              </label>
              <input
                type="text"
                required
                value={sipaNumber}
                onChange={(e) => setSipaNumber(e.target.value)}
                placeholder="19920815/SIPA-32.73/2023/2001"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1 flex items-center justify-between">
                <span>Nama Apoteker Pengelola (APA) *</span>
                <span className="text-[10px] text-emerald-600 font-bold">Sinkron Profil</span>
              </label>
              <input
                id="input-pharmacist-name"
                type="text"
                required
                value={pharmacistName}
                onChange={(e) => setPharmacistName(e.target.value)}
                placeholder="Contoh: apt. Stefanus, S.Farm"
                className="w-full px-3 py-2 border border-emerald-400 ring-1 ring-emerald-500/20 rounded-xl font-bold text-slate-800 bg-emerald-50/20"
              />
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] text-slate-600 flex items-start gap-2">
            <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              Ketika Anda mengganti <strong>Nama Apoteker Pengelola</strong> di sini dan menekan <em>"Simpan Konfigurasi Apotek"</em>, nama akan otomatis langsung diperbarui pada profil admin yang sedang aktif (<strong>{currentUser.name}</strong>), kop struk belanja kasir, serta catatan mutasi.
            </span>
          </div>
        </div>

        {/* Printer Thermal & Struk */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-slate-800 pb-3 border-b border-slate-100">
            <Printer className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-sm">Printer Thermal Kasir & Desain Struk</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Ukuran Kertas Thermal</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPrinterPaperWidth('58mm')}
                  className={`py-2.5 rounded-xl border text-xs font-bold transition-all ${
                    printerPaperWidth === '58mm'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Thermal 58mm (Mobile / Portable)
                </button>
                <button
                  type="button"
                  onClick={() => setPrinterPaperWidth('80mm')}
                  className={`py-2.5 rounded-xl border text-xs font-bold transition-all ${
                    printerPaperWidth === '80mm'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Thermal 80mm (Desktop / Standart)
                </button>
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Pengaturan Pajak / PPN</label>
              <div className="flex items-center gap-3 mt-1">
                <input
                  type="checkbox"
                  id="enableTax"
                  checked={enableTax}
                  onChange={(e) => setEnableTax(e.target.checked)}
                  className="rounded text-emerald-600 w-4 h-4"
                />
                <label htmlFor="enableTax" className="text-slate-700 font-medium">
                  Aktifkan PPN (Default 0% untuk obat bebas apotek)
                </label>
              </div>
              {enableTax && (
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="number"
                    value={taxRate}
                    onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                    className="w-20 px-2.5 py-1 border border-slate-300 rounded-lg text-xs"
                  />
                  <span className="text-xs text-slate-500">% PPN</span>
                </div>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="font-semibold text-slate-700 block mb-1">
                Pesan Kaki Struk (Receipt Footer Notes)
              </label>
              <input
                type="text"
                value={receiptFooter}
                onChange={(e) => setReceiptFooter(e.target.value)}
                placeholder="Semoga Lekas Sembuh. Obat yang sudah dibeli tidak dapat ditukar."
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={resetDemoData}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Ulang Database Demo
          </button>

          <button
            id="btn-save-settings"
            type="submit"
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-lg shadow-emerald-700/20 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Save className="w-4 h-4" />
            Simpan Konfigurasi Apotek
          </button>
        </div>
      </form>
    </div>
  );
};
