import React, { useState } from 'react';
import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  Clock,
  CreditCard,
  Eye,
  FileText,
  Printer,
  RotateCcw,
  Search,
  Trash2,
  User,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Transaction } from '../types';

export const TransactionsView: React.FC = () => {
  const { transactions, openReceipt, voidTransaction, currentUser } = useApp();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'voided'>('all');
  const [filterMethod, setFilterMethod] = useState('all');

  // Void modal state
  const [voidTarget, setVoidTarget] = useState<Transaction | null>(null);
  const [voidReason, setVoidReason] = useState('');

  const filteredTransactions = transactions.filter((t) => {
    const matchSearch =
      t.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      t.customerName.toLowerCase().includes(search.toLowerCase()) ||
      t.cashierName.toLowerCase().includes(search.toLowerCase()) ||
      t.items.some((it) => it.medicine.name.toLowerCase().includes(search.toLowerCase()));

    const matchStatus = filterStatus === 'all' || t.status === filterStatus;
    const matchMethod = filterMethod === 'all' || t.paymentMethod === filterMethod;

    return matchSearch && matchStatus && matchMethod;
  });

  const handleConfirmVoid = (e: React.FormEvent) => {
    e.preventDefault();
    if (!voidTarget || !voidReason.trim()) return;

    voidTransaction(voidTarget.id, voidReason);
    setVoidTarget(null);
    setVoidReason('');
  };

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-7xl mx-auto overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">
            Riwayat Transaksi Penjualan
          </h2>
          <p className="text-xs text-slate-500">
            Daftar seluruh faktur penjualan kasir, cetak ulang struk thermal, dan pembatalan void transaksi.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
            Total {transactions.length} Faktur
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari no. faktur, nama pasien, obat..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Status filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-slate-700 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">Semua Status</option>
            <option value="completed">Selesai / Lunas</option>
            <option value="voided">Dibatalkan (Void)</option>
          </select>

          {/* Payment method filter */}
          <select
            value={filterMethod}
            onChange={(e) => setFilterMethod(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-slate-700 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">Semua Pembayaran</option>
            <option value="cash">Tunai</option>
            <option value="qris">QRIS</option>
            <option value="debit">Debit Card</option>
            <option value="transfer">Transfer Bank</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">No. Faktur</th>
                <th className="py-3.5 px-3">Waktu Transaksi</th>
                <th className="py-3.5 px-3">Pasien / Pelanggan</th>
                <th className="py-3.5 px-3">Kasir & Cabang</th>
                <th className="py-3.5 px-3">Item Dibeli</th>
                <th className="py-3.5 px-3">Total & Metode</th>
                <th className="py-3.5 px-3 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.map((tx) => {
                const isVoided = tx.status === 'voided';

                return (
                  <tr
                    key={tx.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isVoided ? 'bg-rose-50/30' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">
                      {tx.invoiceNumber}
                    </td>

                    <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                      {new Date(tx.timestamp).toLocaleString('id-ID')}
                    </td>

                    <td className="py-3 px-3">
                      <p className="font-bold text-slate-800">{tx.customerName}</p>
                      {tx.customerPhone && (
                        <p className="text-[10px] text-slate-400">{tx.customerPhone}</p>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      <p className="font-medium text-slate-700">{tx.cashierName}</p>
                      <p className="text-[10px] text-slate-400">{tx.branchName}</p>
                    </td>

                    <td className="py-3 px-3">
                      <div className="space-y-0.5 max-w-xs">
                        {tx.items.slice(0, 2).map((item, idx) => (
                          <p key={idx} className="text-[11px] text-slate-600 truncate">
                            {item.quantity} {item.selectedUnit.name} • {item.medicine.name}
                          </p>
                        ))}
                        {tx.items.length > 2 && (
                          <p className="text-[10px] text-slate-400 font-semibold">
                            +{tx.items.length - 2} obat lainnya...
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="space-y-0.5">
                        <p className="font-extrabold text-xs text-slate-900">
                          Rp {tx.total.toLocaleString('id-ID')}
                        </p>
                        <span className="text-[10px] px-1.5 py-0.2 rounded font-bold uppercase bg-slate-100 text-slate-600">
                          {tx.paymentMethod}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-center">
                      {isVoided ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
                          Void / Batal
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                          Lunas Selesai
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openReceipt(tx)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 text-xs font-semibold transition-colors flex items-center gap-1"
                          title="Cetak Ulang Struk Thermal"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          Struk
                        </button>

                        {!isVoided && (
                          <button
                            onClick={() => setVoidTarget(tx)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Batalkan / Void Transaksi"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Batalkan / Void Transaksi */}
      {voidTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95 text-xs">
            <div className="flex items-center gap-2.5 text-rose-600 mb-2">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-bold text-base text-slate-900">
                Batalkan Faktur #{voidTarget.invoiceNumber}
              </h3>
            </div>

            <p className="text-slate-600 mb-4">
              Pembatalan (Void) akan secara otomatis mengembalikan seluruh stok obat ke gudang dan mencatat ke audit log keamanan.
            </p>

            <form onSubmit={handleConfirmVoid} className="space-y-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Alasan Pembatalan Transaksi *
                </label>
                <textarea
                  required
                  rows={3}
                  value={voidReason}
                  onChange={(e) => setVoidReason(e.target.value)}
                  placeholder="Contoh: Pasien salah membeli varian obat, permintaan retur tunai"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setVoidTarget(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Tutup
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold"
                >
                  Konfirmasi Void & Kembalikan Stok
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
