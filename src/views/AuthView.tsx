import React, { useState } from 'react';
import {
  ShieldCheck,
  KeyRound,
  UserCheck,
  Lock,
  Unlock,
  LogOut,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Shield,
  Briefcase,
  History,
  Check,
  X,
  Sparkles,
  Phone,
  Calendar,
  DollarSign,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { User, UserRole } from '../types';

export const AuthView: React.FC = () => {
  const {
    currentUser,
    users,
    login,
    logout,
    lockSession,
    addUser,
    updateUser,
    deleteUser,
    auditLogs,
    settings,
    setActiveTab,
  } = useApp();

  // Active sub-tab in Auth view: 'login' | 'users' | 'matrix' | 'logs'
  const [activeSubTab, setActiveSubTab] = useState<'login' | 'users' | 'matrix' | 'logs'>('login');

  // Login form state for Cashier
  const [selectedCashierId, setSelectedCashierId] = useState<string>(
    users.find((u) => u.role === 'kasir')?.id || users[0].id
  );
  const [cashierPin, setCashierPin] = useState<string>('');
  const [cashierShift, setCashierShift] = useState<string>('Shift Pagi (07:00 - 15:00)');
  const [cashierInitialCash, setCashierInitialCash] = useState<number>(500000);
  const [cashierError, setCashierError] = useState<string>('');
  const [cashierSuccess, setCashierSuccess] = useState<string>('');

  // Login form state for Admin
  const [adminUsername, setAdminUsername] = useState<string>('admin');
  const [adminPin, setAdminPin] = useState<string>('');
  const [adminError, setAdminError] = useState<string>('');
  const [adminSuccess, setAdminSuccess] = useState<string>('');

  // Manage Users state
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [showPinUserId, setShowPinUserId] = useState<string | null>(null);

  // New User Form State
  const [newUserName, setNewUserName] = useState('');
  const [newUserUsername, setNewUserUsername] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('kasir');
  const [newUserPin, setNewUserPin] = useState('');
  const [newUserShift, setNewUserShift] = useState('Shift Pagi (07:00 - 15:00)');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [formError, setFormError] = useState('');

  // Handle Cashier Login
  const handleCashierLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setCashierError('');
    setCashierSuccess('');

    if (!cashierPin) {
      setCashierError('Silakan masukkan PIN kasir 4-digit.');
      return;
    }

    const res = login(selectedCashierId, cashierPin, cashierShift, cashierInitialCash);
    if (res.success) {
      setCashierSuccess(res.message);
      setCashierPin('');
      setTimeout(() => {
        setActiveTab('pos');
      }, 1000);
    } else {
      setCashierError(res.message);
    }
  };

  // Handle Admin Login
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');
    setAdminSuccess('');

    if (!adminPin) {
      setAdminError('Silakan masukkan PIN Administrator.');
      return;
    }

    const res = login(adminUsername, adminPin, 'Semua Shift (Owner / Apoteker)');
    if (res.success) {
      setAdminSuccess(res.message);
      setAdminPin('');
      setTimeout(() => {
        setActiveTab('dashboard');
      }, 1000);
    } else {
      setAdminError(res.message);
    }
  };

  // Quick fill demo credentials
  const handleQuickFillCashier = (userId: string, pin: string, shift: string) => {
    setSelectedCashierId(userId);
    setCashierPin(pin);
    setCashierShift(shift);
    setCashierError('');
  };

  const handleQuickFillAdmin = () => {
    setAdminUsername('admin');
    setAdminPin('1234');
    setAdminError('');
  };

  // Handle creating a new user
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!newUserName.trim() || !newUserUsername.trim() || !newUserPin.trim()) {
      setFormError('Nama, Username, dan PIN wajib diisi.');
      return;
    }

    if (newUserPin.length < 4) {
      setFormError('PIN keamanan minimal 4 digit angka.');
      return;
    }

    // Check username uniqueness
    const exists = users.some(
      (u) => u.username.toLowerCase() === newUserUsername.trim().toLowerCase()
    );
    if (exists) {
      setFormError(`Username '${newUserUsername}' sudah digunakan. Pilih username lain.`);
      return;
    }

    const defaultAvatars = [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    ];

    addUser({
      name: newUserName.trim(),
      username: newUserUsername.trim().toLowerCase(),
      role: newUserRole,
      pin: newUserPin.trim(),
      shift: newUserRole === 'admin' ? 'Semua Shift' : newUserShift,
      phone: newUserPhone.trim() || '0812-0000-0000',
      avatar: defaultAvatars[Math.floor(Math.random() * defaultAvatars.length)],
      status: 'active',
      initialCash: 500000,
    });

    setIsAddUserModalOpen(false);
    setNewUserName('');
    setNewUserUsername('');
    setNewUserPin('');
    setNewUserPhone('');
  };

  // Filter auth logs
  const authAuditLogs = auditLogs.filter(
    (log) => log.type === 'auth' || log.type === 'void' || log.type === 'system'
  );

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto custom-scrollbar">
      {/* Top Banner: Current Active Session */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 lg:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
        <div className="flex items-center gap-4 z-10">
          <div className="relative">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500 shadow-md"
            />
            <span
              className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-[10px] text-white font-bold ${
                currentUser.role === 'admin' ? 'bg-purple-600' : 'bg-emerald-600'
              }`}
            >
              {currentUser.role === 'admin' ? 'A' : 'K'}
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">
                {currentUser.name}
              </h2>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                  currentUser.role === 'admin'
                    ? 'bg-purple-100 text-purple-800 border-purple-200'
                    : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                }`}
              >
                {currentUser.role === 'admin' ? 'Administrator / Apoteker' : 'Kasir POS Aktif'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-3">
              <span className="flex items-center gap-1 font-medium text-slate-600">
                <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                {currentUser.shift || 'Semua Shift'}
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:flex items-center gap-1 text-slate-500">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Masuk Sesi: {currentUser.lastLogin || 'Aktif'}
              </span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3 z-10 flex-wrap">
          <button
            id="btn-lock-session"
            onClick={lockSession}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold transition-all shadow-xs"
            title="Kunci layar POS kasir saat meninggalkan meja"
          >
            <Lock className="w-4 h-4 text-amber-600" />
            <span>Kunci Layar</span>
          </button>

          <button
            id="btn-switch-shift-tab"
            onClick={() => setActiveSubTab('login')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs"
          >
            <KeyRound className="w-4 h-4" />
            <span>Ganti Sesi / Login</span>
          </button>

          <button
            id="btn-logout-session"
            onClick={logout}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 border border-slate-200 text-xs font-bold transition-all"
            title="Keluar dari sesi"
          >
            <LogOut className="w-4 h-4 text-slate-500" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1 overflow-x-auto custom-scrollbar">
        <button
          id="tab-auth-login"
          onClick={() => setActiveSubTab('login')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSubTab === 'login'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Form Login & Ganti Shift</span>
        </button>

        <button
          id="tab-auth-users"
          onClick={() => setActiveSubTab('users')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSubTab === 'users'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Kelola Akun & PIN ({users.length})</span>
        </button>

        <button
          id="tab-auth-matrix"
          onClick={() => setActiveSubTab('matrix')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSubTab === 'matrix'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Matriks Hak Akses (Kasir vs Admin)</span>
        </button>

        <button
          id="tab-auth-logs"
          onClick={() => setActiveSubTab('logs')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSubTab === 'logs'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Log Aktivitas & Audit Trail</span>
        </button>
      </div>

      {/* SUB-TAB 1: Form Login & Ganti Shift */}
      {activeSubTab === 'login' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form Login KASIR */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Autentikasi Kasir POS</h3>
                  <p className="text-xs text-slate-500">Masuk sesi transaksi kasir dengan PIN 4-digit</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                Kasir POS
              </span>
            </div>

            <form onSubmit={handleCashierLogin} className="space-y-4">
              {/* Select Cashier */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Pilih Petugas Kasir:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {users
                    .filter((u) => u.role === 'kasir')
                    .map((c) => {
                      const isSelected = c.id === selectedCashierId;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            setSelectedCashierId(c.id);
                            setCashierPin('');
                            setCashierError('');
                          }}
                          className={`p-2.5 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                            isSelected
                              ? 'border-emerald-500 bg-emerald-50/80 ring-2 ring-emerald-500/20'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <img
                            src={c.avatar}
                            alt={c.name}
                            className="w-9 h-9 rounded-full object-cover border border-slate-200"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-slate-800 truncate">{c.name}</p>
                            <p className="text-[10px] text-slate-400 truncate">{c.shift || 'Kasir'}</p>
                          </div>
                        </button>
                      );
                    })}
                </div>
              </div>

              {/* Shift Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Shift Kerja:
                </label>
                <select
                  value={cashierShift}
                  onChange={(e) => setCashierShift(e.target.value)}
                  className="w-full text-xs py-2.5 px-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Shift Pagi (07:00 - 15:00)">Shift Pagi (07:00 - 15:00)</option>
                  <option value="Shift Sore (15:00 - 22:00)">Shift Sore (15:00 - 22:00)</option>
                  <option value="Shift Malam (22:00 - 07:00)">Shift Malam (22:00 - 07:00)</option>
                </select>
              </div>

              {/* Cash Drawer Floating Cash */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Modal Kas Awal Laci Kasir (Rp):
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-semibold">Rp</span>
                  <input
                    type="number"
                    value={cashierInitialCash}
                    onChange={(e) => setCashierInitialCash(Number(e.target.value))}
                    step={50000}
                    min={0}
                    className="w-full text-xs font-bold pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Uang kembalian pecahan di laci sebelum transaksi dimulai.</p>
              </div>

              {/* PIN Keypad input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  PIN Kasir (4 Digit):
                </label>
                <div className="relative">
                  <input
                    id="input-cashier-pin"
                    type="password"
                    maxLength={6}
                    value={cashierPin}
                    onChange={(e) => {
                      setCashierPin(e.target.value);
                      setCashierError('');
                    }}
                    placeholder="Masukkan PIN 4-digit..."
                    className="w-full text-center tracking-widest text-lg font-bold py-2.5 px-3 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                </div>
              </div>

              {/* Feedback messages */}
              {cashierError && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{cashierError}</span>
                </div>
              )}
              {cashierSuccess && (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{cashierSuccess}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                id="btn-submit-cashier-login"
                type="submit"
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-md shadow-emerald-900/10 flex items-center justify-center gap-2"
              >
                <Unlock className="w-4 h-4" />
                <span>Mulai Shift & Masuk Sesi Kasir POS</span>
              </button>
            </form>

            {/* Quick Fill Shortcuts */}
            <div className="pt-3 border-t border-slate-100">
              <p className="text-[11px] text-slate-400 mb-2 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                <span>Shortcut Uji Coba Cepat Kasir:</span>
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() =>
                    handleQuickFillCashier('usr-2', '1111', 'Shift Pagi (07:00 - 15:00)')
                  }
                  className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[11px] font-semibold transition-colors"
                >
                  Siti Rahma (PIN: 1111)
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleQuickFillCashier('usr-3', '2222', 'Shift Sore (15:00 - 22:00)')
                  }
                  className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-[11px] font-semibold transition-colors"
                >
                  Budi Santoso (PIN: 2222)
                </button>
              </div>
            </div>
          </div>

          {/* Form Login ADMINISTRATOR / APOTEKER */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Autentikasi Administrator / Apoteker</h3>
                  <p className="text-xs text-slate-500">Akses penuh pemilik apotek & penanggung jawab teknis</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold">
                Akses Penuh
              </span>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-4">
              {/* Username input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Username Administrator:
                </label>
                <div className="relative">
                  <input
                    id="input-admin-username"
                    type="text"
                    value={adminUsername}
                    onChange={(e) => {
                      setAdminUsername(e.target.value);
                      setAdminError('');
                    }}
                    placeholder="Contoh: admin"
                    className="w-full text-xs font-bold py-2.5 pl-9 pr-3 rounded-xl border border-slate-300 focus:outline-none focus:border-purple-500"
                  />
                  <Shield className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              {/* Admin PIN */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  PIN Administrator (Demo: 1234):
                </label>
                <div className="relative">
                  <input
                    id="input-admin-pin"
                    type="password"
                    maxLength={6}
                    value={adminPin}
                    onChange={(e) => {
                      setAdminPin(e.target.value);
                      setAdminError('');
                    }}
                    placeholder="Masukkan PIN Admin..."
                    className="w-full text-center tracking-widest text-lg font-bold py-2.5 px-3 rounded-xl border border-slate-300 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                  />
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                </div>
              </div>

              {/* Privileges Preview */}
              <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200/80 space-y-1.5 text-xs text-purple-900">
                <p className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  Wewenang Penuh Administrator:
                </p>
                <ul className="text-[11px] text-purple-700 space-y-1 pl-4 list-disc">
                  <li>Laporan Laba Rugi, HPP, & Nilai Aset Stok Farmasi</li>
                  <li>Otorisasi pembatalan / void transaksi penjualan</li>
                  <li>Pemesanan & penerimaan stok dari Pedagang Besar Farmasi (PBF)</li>
                  <li>Manajemen akun kasir, penggantian PIN & izin akses shift</li>
                </ul>
              </div>

              {/* Feedback */}
              {adminError && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{adminError}</span>
                </div>
              )}
              {adminSuccess && (
                <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 text-xs font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{adminSuccess}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                id="btn-submit-admin-login"
                type="submit"
                className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all shadow-md shadow-slate-950/20 flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span>Masuk Sebagai Administrator</span>
              </button>
            </form>

            {/* Quick Fill Admin */}
            <div className="pt-3 border-t border-slate-100">
              <p className="text-[11px] text-slate-400 mb-2 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-purple-600" />
                <span>Shortcut Uji Coba Cepat Admin:</span>
              </p>
              <button
                type="button"
                onClick={handleQuickFillAdmin}
                className="px-3 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-[11px] font-semibold transition-colors"
              >
                Isi Otomatis Akun Admin (User: admin / PIN: 1234)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: Kelola Akun & PIN Pengguna */}
      {activeSubTab === 'users' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-800">Daftar Akun Petugas & Kasir</h3>
              <p className="text-xs text-slate-500">
                Atur wewenang peran, reset PIN keamanan, dan tambah akun kasir apotek
              </p>
            </div>
            <button
              id="btn-open-add-user-modal"
              onClick={() => setIsAddUserModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Akun Baru</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {users.map((u) => {
              const isCurrentUser = u.id === currentUser.id;
              const isRevealed = showPinUserId === u.id;
              return (
                <div
                  key={u.id}
                  className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.avatar}
                          alt={u.name}
                          className="w-12 h-12 rounded-2xl object-cover border border-slate-200"
                        />
                        <div>
                          <p className="text-sm font-bold text-slate-800 truncate">{u.name}</p>
                          <p className="text-xs text-slate-400 font-mono">@{u.username}</p>
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          u.role === 'admin'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        {u.role.toUpperCase()}
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="flex items-center gap-1.5 text-[11px] text-slate-400">
                          <Briefcase className="w-3.5 h-3.5" />
                          Shift
                        </span>
                        <span className="font-semibold">{u.shift || '-'}</span>
                      </div>

                      <div className="flex items-center justify-between text-slate-600">
                        <span className="flex items-center gap-1.5 text-[11px] text-slate-400">
                          <Phone className="w-3.5 h-3.5" />
                          No. HP
                        </span>
                        <span>{u.phone || '0812-xxxx-xxxx'}</span>
                      </div>

                      <div className="flex items-center justify-between text-slate-600 pt-1 border-t border-slate-200/60">
                        <span className="flex items-center gap-1.5 text-[11px] text-slate-400">
                          <KeyRound className="w-3.5 h-3.5" />
                          PIN Keamanan
                        </span>
                        <div className="flex items-center gap-1.5 font-mono font-bold">
                          <span>{isRevealed ? u.pin : '••••'}</span>
                          <button
                            type="button"
                            onClick={() => setShowPinUserId(isRevealed ? null : u.id)}
                            className="text-slate-400 hover:text-slate-600 p-0.5"
                            title={isRevealed ? 'Sembunyikan PIN' : 'Tampilkan PIN'}
                          >
                            {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    {isCurrentUser ? (
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Sesi Sedang Aktif
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          login(u.id, u.pin);
                        }}
                        className="text-xs font-bold text-slate-700 hover:text-emerald-700 transition-colors"
                      >
                        Beralih ke Akun Ini →
                      </button>
                    )}

                    {!isCurrentUser && (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Yakin ingin menghapus akun ${u.name}?`)) {
                            deleteUser(u.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Hapus Akun"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: Matriks Hak Akses (RBAC Guidance) */}
      {activeSubTab === 'matrix' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-800">Matriks Hak Akses Wewenang (RBAC Matrix)</h3>
            <p className="text-xs text-slate-500">
              Perbandingan hak wewenang antara Peran Kasir POS dan Peran Administrator / Apoteker
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-700">
                  <th className="py-3 px-4 font-bold">Modul & Fitur Aplikasi</th>
                  <th className="py-3 px-4 font-bold text-center w-36">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                      Kasir POS
                    </span>
                  </th>
                  <th className="py-3 px-4 font-bold text-center w-36">
                    <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 font-bold">
                      Admin / Owner
                    </span>
                  </th>
                  <th className="py-3 px-4 font-bold">Keterangan Aturan Keamanan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <td className="py-3 px-4 font-semibold">Transaksi POS & Pembayaran</td>
                  <td className="py-3 px-4 text-center text-emerald-600 font-bold">
                    <Check className="w-4 h-4 mx-auto" />
                  </td>
                  <td className="py-3 px-4 text-center text-emerald-600 font-bold">
                    <Check className="w-4 h-4 mx-auto" />
                  </td>
                  <td className="py-3 px-4 text-slate-500">Bisa memproses tunai, QRIS, debit, dan transfer</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold">Cetak Struk Thermal & Scan Barcode</td>
                  <td className="py-3 px-4 text-center text-emerald-600 font-bold">
                    <Check className="w-4 h-4 mx-auto" />
                  </td>
                  <td className="py-3 px-4 text-center text-emerald-600 font-bold">
                    <Check className="w-4 h-4 mx-auto" />
                  </td>
                  <td className="py-3 px-4 text-slate-500">Mendukung printer thermal 58mm & 80mm</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold">Buka / Tutup Shift & Rekonsiliasi Kas</td>
                  <td className="py-3 px-4 text-center text-emerald-600 font-bold">
                    <Check className="w-4 h-4 mx-auto" />
                  </td>
                  <td className="py-3 px-4 text-center text-emerald-600 font-bold">
                    <Check className="w-4 h-4 mx-auto" />
                  </td>
                  <td className="py-3 px-4 text-slate-500">Mencatat kas awal, total omzet shift, dan serah terima</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold">Pencarian Obat & Cek Stok Rak</td>
                  <td className="py-3 px-4 text-center text-emerald-600 font-bold">
                    <Check className="w-4 h-4 mx-auto" />
                  </td>
                  <td className="py-3 px-4 text-center text-emerald-600 font-bold">
                    <Check className="w-4 h-4 mx-auto" />
                  </td>
                  <td className="py-3 px-4 text-slate-500">Bisa melihat sisa stok dan nomor rak penyimpanan</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold">Void / Pembatalan Struk Transaksi</td>
                  <td className="py-3 px-4 text-center text-amber-600 font-bold">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                      Perlu PIN Admin
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center text-emerald-600 font-bold">
                    <Check className="w-4 h-4 mx-auto" />
                  </td>
                  <td className="py-3 px-4 text-slate-500">Mencegah manipulasi kasir tanpa izin supervisor</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold">Melihat HPP Modal & Laba Bersih</td>
                  <td className="py-3 px-4 text-center text-slate-300 font-bold">
                    <X className="w-4 h-4 mx-auto text-rose-500" />
                  </td>
                  <td className="py-3 px-4 text-center text-emerald-600 font-bold">
                    <Check className="w-4 h-4 mx-auto" />
                  </td>
                  <td className="py-3 px-4 text-slate-500">Informasi keuntungan apotek hanya untuk pemilik/admin</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold">Pembelian Stok dari PBF / Supplier</td>
                  <td className="py-3 px-4 text-center text-slate-300 font-bold">
                    <X className="w-4 h-4 mx-auto text-rose-500" />
                  </td>
                  <td className="py-3 px-4 text-center text-emerald-600 font-bold">
                    <Check className="w-4 h-4 mx-auto" />
                  </td>
                  <td className="py-3 px-4 text-slate-500">Penerimaan faktur dan penambahan utang tempo apotek</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold">Laporan Keuangan & Ekspor Pajak</td>
                  <td className="py-3 px-4 text-center text-slate-300 font-bold">
                    <X className="w-4 h-4 mx-auto text-rose-500" />
                  </td>
                  <td className="py-3 px-4 text-center text-emerald-600 font-bold">
                    <Check className="w-4 h-4 mx-auto" />
                  </td>
                  <td className="py-3 px-4 text-slate-500">Laporan omzet bulanan, PPN, dan akuntansi apotek</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold">Manajemen Akun, PIN & Pengaturan Apotek</td>
                  <td className="py-3 px-4 text-center text-slate-300 font-bold">
                    <X className="w-4 h-4 mx-auto text-rose-500" />
                  </td>
                  <td className="py-3 px-4 text-center text-emerald-600 font-bold">
                    <Check className="w-4 h-4 mx-auto" />
                  </td>
                  <td className="py-3 px-4 text-slate-500">Nomor SIA/SIPA apoteker, printer, dan reset akun</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: Log Aktivitas & Audit Trail */}
      {activeSubTab === 'logs' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-800">Log Keamanan & Sesi Autentikasi</h3>
              <p className="text-xs text-slate-500">
                Pencatatan riwayat login, logout, penguncian layar, dan otorisasi wewenang
              </p>
            </div>
            <span className="text-xs text-slate-400 font-mono font-medium">
              Total: {authAuditLogs.length} Aktivitas
            </span>
          </div>

          <div className="overflow-x-auto divide-y divide-slate-100 max-h-96 overflow-y-auto custom-scrollbar">
            {authAuditLogs.map((log) => (
              <div key={log.id} className="py-3 px-2 flex items-start gap-3 hover:bg-slate-50 rounded-xl transition-colors">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    log.type === 'auth'
                      ? 'bg-emerald-100 text-emerald-700'
                      : log.type === 'void'
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  <History className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-slate-800">{log.action}</p>
                    <span className="text-[11px] text-slate-400 font-mono">{log.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">{log.details}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Oleh: <span className="font-semibold text-slate-700">{log.userName}</span> ({log.userRole.toUpperCase()})
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Tambah Akun Baru */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm">Tambah Akun Petugas / Kasir</h3>
              </div>
              <button
                onClick={() => setIsAddUserModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap:
                </label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="Contoh: Rina Anggraini"
                  className="w-full text-xs py-2.5 px-3 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Username:
                  </label>
                  <input
                    type="text"
                    required
                    value={newUserUsername}
                    onChange={(e) => setNewUserUsername(e.target.value)}
                    placeholder="rina_kasir"
                    className="w-full text-xs py-2.5 px-3 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Peran (Role):
                  </label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                    className="w-full text-xs py-2.5 px-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="kasir">Kasir POS</option>
                    <option value="admin">Administrator / Owner</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    PIN Keamanan (4 Digit):
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    required
                    value={newUserPin}
                    onChange={(e) => setNewUserPin(e.target.value)}
                    placeholder="Contoh: 3344"
                    className="w-full text-xs font-bold py-2.5 px-3 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    No. Handphone:
                  </label>
                  <input
                    type="text"
                    value={newUserPhone}
                    onChange={(e) => setNewUserPhone(e.target.value)}
                    placeholder="0812-xxxx-xxxx"
                    className="w-full text-xs py-2.5 px-3 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {newUserRole === 'kasir' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Shift Default:
                  </label>
                  <select
                    value={newUserShift}
                    onChange={(e) => setNewUserShift(e.target.value)}
                    className="w-full text-xs py-2.5 px-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Shift Pagi (07:00 - 15:00)">Shift Pagi (07:00 - 15:00)</option>
                    <option value="Shift Sore (15:00 - 22:00)">Shift Sore (15:00 - 22:00)</option>
                    <option value="Shift Malam (22:00 - 07:00)">Shift Malam (22:00 - 07:00)</option>
                  </select>
                </div>
              )}

              {formError && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white shadow-md shadow-emerald-900/10"
                >
                  Simpan Akun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
