import React, { useState } from 'react';
import {
  AlertTriangle,
  Clock,
  Edit2,
  Filter,
  Layers,
  PackagePlus,
  Pill,
  Plus,
  QrCode,
  Search,
  Tag,
  Trash2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Medicine, MedicineUnit } from '../types';

export const MedicinesView: React.FC = () => {
  const {
    medicines,
    categories,
    addMedicine,
    updateMedicine,
    deleteMedicine,
    quickRestock,
    setActiveTab,
  } = useApp();

  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'low' | 'near_expiry'>('all');

  // Add / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Quick Restock Modal state
  const [restockMedicine, setRestockMedicine] = useState<Medicine | null>(null);
  const [restockQty, setRestockQty] = useState<number>(10);
  const [restockBatch, setRestockBatch] = useState<string>('');
  const [restockExp, setRestockExp] = useState<string>('');
  const [restockNotes, setRestockNotes] = useState<string>('');

  // Form Fields for Add/Edit
  const [name, setName] = useState('');
  const [genericName, setGenericName] = useState('');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [category, setCategory] = useState('Obat Bebas');
  const [indication, setIndication] = useState('');
  const [requiresPrescription, setRequiresPrescription] = useState(false);
  const [baseUnit, setBaseUnit] = useState<Medicine['baseUnit']>('Tablet');
  const [stock, setStock] = useState(100);
  const [minStock, setMinStock] = useState(20);
  const [buyPrice, setBuyPrice] = useState(500);
  const [sellPrice, setSellPrice] = useState(800);
  const [batchNumber, setBatchNumber] = useState('B-240901');
  const [expiredDate, setExpiredDate] = useState('2027-12-31');
  const [manufacturer, setManufacturer] = useState('Kimia Farma');
  const [locationRack, setLocationRack] = useState('Rak A-01');

  // Multi-unit configuration
  const [stripPrice, setStripPrice] = useState(7500);
  const [boxPrice, setBoxPrice] = useState(70000);
  const [hasStrip, setHasStrip] = useState(true);
  const [hasBox, setHasBox] = useState(true);

  const filteredMedicines = medicines.filter((m) => {
    const matchSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.genericName.toLowerCase().includes(search.toLowerCase()) ||
      m.sku.toLowerCase().includes(search.toLowerCase()) ||
      m.barcode.toLowerCase().includes(search.toLowerCase());

    const matchCategory = filterCategory === 'all' || m.category === filterCategory;

    let matchStatus = true;
    if (filterStatus === 'low') {
      matchStatus = m.stock <= m.minStock;
    } else if (filterStatus === 'near_expiry') {
      const days = (new Date(m.expiredDate).getTime() - new Date('2026-09-22').getTime()) / (1000 * 3600 * 24);
      matchStatus = days <= 60;
    }

    return matchSearch && matchCategory && matchStatus;
  });

  const handleOpenAdd = () => {
    setEditingId(null);
    setName('');
    setGenericName('');
    setSku('MED-' + Math.floor(1000 + Math.random() * 9000));
    setBarcode('899' + Math.floor(1000000000 + Math.random() * 9000000000));
    setCategory('Obat Bebas');
    setIndication('');
    setRequiresPrescription(false);
    setBaseUnit('Tablet');
    setStock(100);
    setMinStock(20);
    setBuyPrice(500);
    setSellPrice(800);
    setBatchNumber('B-' + new Date().toISOString().slice(2, 7).replace('-', ''));
    setExpiredDate('2028-01-01');
    setManufacturer('Kimia Farma');
    setLocationRack('Rak A-01');
    setStripPrice(7500);
    setBoxPrice(70000);
    setHasStrip(true);
    setHasBox(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (med: Medicine) => {
    setEditingId(med.id);
    setName(med.name);
    setGenericName(med.genericName);
    setSku(med.sku);
    setBarcode(med.barcode);
    setCategory(med.category);
    setIndication(med.indication);
    setRequiresPrescription(med.requiresPrescription);
    setBaseUnit(med.baseUnit);
    setStock(med.stock);
    setMinStock(med.minStock);
    setBuyPrice(med.buyPrice);
    setSellPrice(med.sellPrice);
    setBatchNumber(med.batchNumber);
    setExpiredDate(med.expiredDate);
    setManufacturer(med.manufacturer);
    setLocationRack(med.locationRack);

    const stripUnit = med.units.find((u) => u.name === 'Strip');
    const boxUnit = med.units.find((u) => u.name === 'Box');
    setHasStrip(!!stripUnit);
    setHasBox(!!boxUnit);
    if (stripUnit) setStripPrice(stripUnit.price);
    if (boxUnit) setBoxPrice(boxUnit.price);

    setIsModalOpen(true);
  };

  const handleSaveMedicine = (e: React.FormEvent) => {
    e.preventDefault();

    const units: MedicineUnit[] = [
      { name: baseUnit, conversionFactor: 1, price: Number(sellPrice) },
    ];
    if (hasStrip) {
      units.push({ name: 'Strip', conversionFactor: 10, price: Number(stripPrice) });
    }
    if (hasBox) {
      units.push({ name: 'Box', conversionFactor: 100, price: Number(boxPrice) });
    }

    const medData = {
      name,
      genericName,
      sku,
      barcode,
      category,
      indication,
      requiresPrescription,
      baseUnit,
      units,
      stock: Number(stock),
      minStock: Number(minStock),
      buyPrice: Number(buyPrice),
      sellPrice: Number(sellPrice),
      batchNumber,
      expiredDate,
      manufacturer,
      locationRack,
      imageUrl:
        'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=80',
    };

    if (editingId) {
      updateMedicine(editingId, medData);
    } else {
      addMedicine(medData);
    }

    setIsModalOpen(false);
  };

  const handleOpenRestock = (med: Medicine) => {
    setRestockMedicine(med);
    setRestockQty(50);
    setRestockBatch(med.batchNumber);
    setRestockExp(med.expiredDate);
    setRestockNotes('Restock rutin PBF distributor');
  };

  const handleConfirmRestock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockMedicine) return;

    quickRestock(
      restockMedicine.id,
      Number(restockQty),
      restockBatch,
      restockExp,
      restockNotes
    );

    setRestockMedicine(null);
  };

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-7xl mx-auto overflow-y-auto custom-scrollbar">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">
            Katalog & Manajemen Stok Obat
          </h2>
          <p className="text-xs text-slate-500">
            Kelola master data obat, nomor batch, masa kadaluarsa & konversi multi-satuan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('stock-cards')}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
          >
            Lihat Kartu Stok
          </button>
          <button
            id="btn-add-medicine"
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-700/20 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Tambah Obat Baru
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari obat, generik, SKU, barcode..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Category filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-slate-700 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                filterStatus === 'all' ? 'bg-white text-slate-800 shadow-2xs font-bold' : 'text-slate-600'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setFilterStatus('low')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                filterStatus === 'low' ? 'bg-rose-500 text-white shadow-2xs font-bold' : 'text-slate-600'
              }`}
            >
              Stok Menipis
            </button>
            <button
              onClick={() => setFilterStatus('near_expiry')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                filterStatus === 'near_expiry' ? 'bg-amber-500 text-white shadow-2xs font-bold' : 'text-slate-600'
              }`}
            >
              Exp Dekat
            </button>
          </div>
        </div>
      </div>

      {/* Medicines Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Nama Obat & Generik</th>
                <th className="py-3.5 px-3">Golongan & Lokasi</th>
                <th className="py-3.5 px-3">Multi Satuan</th>
                <th className="py-3.5 px-3 text-center">Stok Fisik</th>
                <th className="py-3.5 px-3">Batch & Kadaluarsa</th>
                <th className="py-3.5 px-3">HPP & Harga Jual</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMedicines.map((med) => {
                const isLow = med.stock <= med.minStock;
                const daysToExp =
                  (new Date(med.expiredDate).getTime() - new Date('2026-09-22').getTime()) /
                  (1000 * 3600 * 24);
                const isNearExp = daysToExp <= 60;

                return (
                  <tr key={med.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={med.imageUrl}
                          alt={med.name}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 text-xs truncate">{med.name}</p>
                          <p className="text-[11px] text-slate-400 italic truncate">{med.genericName}</p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            SKU: {med.sku} • Barcode: {med.barcode}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="space-y-1">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md inline-block ${
                            med.category === 'Obat Keras'
                              ? 'bg-rose-100 text-rose-700'
                              : med.category === 'Obat Bebas Terbatas'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {med.category}
                        </span>
                        <p className="text-[10px] text-slate-500 font-mono">{med.locationRack}</p>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex flex-wrap gap-1">
                        {med.units.map((u) => (
                          <span
                            key={u.name}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-medium"
                          >
                            {u.name}: Rp {u.price.toLocaleString('id-ID')}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span
                          className={`font-black text-xs px-2 py-0.5 rounded-md ${
                            isLow
                              ? 'bg-rose-100 text-rose-700 animate-pulse'
                              : 'bg-emerald-50 text-emerald-800'
                          }`}
                        >
                          {med.stock} {med.baseUnit}
                        </span>
                        <span className="text-[9px] text-slate-400 mt-0.5">Min: {med.minStock}</span>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="space-y-0.5">
                        <p className="font-mono text-[11px] text-slate-700">{med.batchNumber}</p>
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded inline-block ${
                            isNearExp
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'text-slate-500'
                          }`}
                        >
                          Exp: {med.expiredDate}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="space-y-0.5">
                        <p className="text-[11px] text-slate-400">
                          HPP: Rp {med.buyPrice.toLocaleString('id-ID')}
                        </p>
                        <p className="font-bold text-xs text-emerald-700">
                          Jual: Rp {med.sellPrice.toLocaleString('id-ID')}
                        </p>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenRestock(med)}
                          className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-bold transition-colors flex items-center gap-1"
                          title="Tambah Stok Masuk / Restock"
                        >
                          <PackagePlus className="w-3.5 h-3.5" />
                          +Stok
                        </button>
                        <button
                          onClick={() => handleOpenEdit(med)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                          title="Edit Obat"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteMedicine(med.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          title="Hapus Obat"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Tambah / Edit Obat */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-6 my-8 animate-in zoom-in-95">
            <h3 className="font-bold text-lg text-slate-800 mb-1">
              {editingId ? 'Edit Data Obat' : 'Tambah Obat Baru ke Master Data'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Lengkapi informasi obat, nomor registrasi, satuan konversi dan harga jual.
            </p>

            <form onSubmit={handleSaveMedicine} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Nama Dagang Obat *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Paracetamol 500 mg"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Nama Zat Aktif / Generik *</label>
                  <input
                    type="text"
                    required
                    value={genericName}
                    onChange={(e) => setGenericName(e.target.value)}
                    placeholder="Contoh: Paracetamol"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Golongan Obat *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Barcode / EAN-13 *</label>
                  <input
                    type="text"
                    required
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    placeholder="Contoh: 8992772001015"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Nomor Batch *</label>
                  <input
                    type="text"
                    required
                    value={batchNumber}
                    onChange={(e) => setBatchNumber(e.target.value)}
                    placeholder="Contoh: B-240901"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tanggal Kadaluarsa (Expired) *</label>
                  <input
                    type="date"
                    required
                    value={expiredDate}
                    onChange={(e) => setExpiredDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Stok Fisik Awal (Base Unit) *</label>
                  <input
                    type="number"
                    required
                    value={stock}
                    onChange={(e) => setStock(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Batas Minimum Stok *</label>
                  <input
                    type="number"
                    required
                    value={minStock}
                    onChange={(e) => setMinStock(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Harga Beli HPP (Rp) *</label>
                  <input
                    type="number"
                    required
                    value={buyPrice}
                    onChange={(e) => setBuyPrice(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Harga Jual Dasar (Rp) *</label>
                  <input
                    type="number"
                    required
                    value={sellPrice}
                    onChange={(e) => setSellPrice(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-emerald-700"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Satuan Dasar *</label>
                  <select
                    value={baseUnit}
                    onChange={(e) => setBaseUnit(e.target.value as Medicine['baseUnit'])}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  >
                    <option value="Tablet">Tablet</option>
                    <option value="Kaplet">Kaplet</option>
                    <option value="Kapsul">Kapsul</option>
                    <option value="Botol">Botol</option>
                    <option value="Sachet">Sachet</option>
                    <option value="Pcs">Pcs</option>
                    <option value="Tube">Tube</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Lokasi Rak Obat</label>
                  <input
                    type="text"
                    value={locationRack}
                    onChange={(e) => setLocationRack(e.target.value)}
                    placeholder="Contoh: Rak A-01"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              {/* Multi Satuan Config */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <p className="font-bold text-slate-800">Konfigurasi Multi Satuan (Strip / Box):</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="check-has-strip"
                      checked={hasStrip}
                      onChange={(e) => setHasStrip(e.target.checked)}
                      className="rounded text-emerald-600"
                    />
                    <label htmlFor="check-has-strip" className="font-semibold text-slate-700">
                      Ada Satuan Strip (10 {baseUnit})
                    </label>
                  </div>
                  {hasStrip && (
                    <input
                      type="number"
                      value={stripPrice}
                      onChange={(e) => setStripPrice(parseInt(e.target.value) || 0)}
                      placeholder="Harga Jual Strip"
                      className="px-2.5 py-1.5 border border-slate-300 rounded-lg"
                    />
                  )}

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="check-has-box"
                      checked={hasBox}
                      onChange={(e) => setHasBox(e.target.checked)}
                      className="rounded text-emerald-600"
                    />
                    <label htmlFor="check-has-box" className="font-semibold text-slate-700">
                      Ada Satuan Box (100 {baseUnit})
                    </label>
                  </div>
                  {hasBox && (
                    <input
                      type="number"
                      value={boxPrice}
                      onChange={(e) => setBoxPrice(parseInt(e.target.value) || 0)}
                      placeholder="Harga Jual Box"
                      className="px-2.5 py-1.5 border border-slate-300 rounded-lg"
                    />
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md"
                >
                  {editingId ? 'Simpan Perubahan' : 'Tambah Obat'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Quick Restock Obat */}
      {restockMedicine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95 text-xs">
            <h3 className="font-bold text-base text-slate-800 mb-1">
              Restock Stok Masuk: {restockMedicine.name}
            </h3>
            <p className="text-slate-500 mb-4">
              Stok sekarang: <span className="font-bold text-slate-800">{restockMedicine.stock} {restockMedicine.baseUnit}</span>
            </p>

            <form onSubmit={handleConfirmRestock} className="space-y-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Jumlah Tambahan Stok ({restockMedicine.baseUnit}) *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={restockQty}
                  onChange={(e) => setRestockQty(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-emerald-700 text-sm"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nomor Batch Baru</label>
                <input
                  type="text"
                  required
                  value={restockBatch}
                  onChange={(e) => setRestockBatch(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Tanggal Expired Baru</label>
                <input
                  type="date"
                  required
                  value={restockExp}
                  onChange={(e) => setRestockExp(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Catatan Penerimaan</label>
                <input
                  type="text"
                  value={restockNotes}
                  onChange={(e) => setRestockNotes(e.target.value)}
                  placeholder="Contoh: Faktur PBF Enseval No. 99124"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRestockMedicine(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  Konfirmasi Stok Masuk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
