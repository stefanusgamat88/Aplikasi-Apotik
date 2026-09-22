import React, { useState } from 'react';
import {
  AlertTriangle,
  Building,
  CheckCircle2,
  FileCheck,
  Printer,
  Receipt,
  RotateCcw,
  Save,
  Shield,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, resetDemoData } = useApp();

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
    setTimeout(() => setSavedSuccess(false), 3000);
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
            Konfigurasi identitas apotek, nomor legalitas resmi (SIA & SIPA), dan preferensi cetak struk kasir.
          </p>
        </div>

        {savedSuccess && (
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Pengaturan Tersimpan!
          </span>
        )}
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

        {/* Legalitas Apotek (SIA & SIPA) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-slate-800 pb-3 border-b border-slate-100">
            <Shield className="w-5 h-5 text-teal-600" />
            <div>
              <h3 className="font-bold text-sm">Legalitas Farmasi Resmi (Dinkes & BPOM)</h3>
              <p className="text-[11px] text-slate-400">Nomor izin akan tercetak pada kop struk dan kwitansi resmi pasien.</p>
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
              <label className="font-semibold text-slate-700 block mb-1">
                Nama Apoteker Pengelola (APA) *
              </label>
              <input
                type="text"
                required
                value={pharmacistName}
                onChange={(e) => setPharmacistName(e.target.value)}
                placeholder="apt. Sari Dewi, S.Farm"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-semibold"
              />
            </div>
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
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-lg shadow-emerald-700/20 transition-all flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            Simpan Konfigurasi Apotek
          </button>
        </div>
      </form>
    </div>
  );
};
