import React, { useState, useEffect } from 'react';
import {
  Lock,
  Unlock,
  Shield,
  KeyRound,
  UserCheck,
  Delete,
  Store,
  Clock,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const LockScreenModal: React.FC = () => {
  const {
    isLocked,
    currentUser,
    users,
    unlockSession,
    login,
    settings,
  } = useApp();

  const [selectedUserId, setSelectedUserId] = useState<string>(currentUser.id);
  const [pin, setPin] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');

  useEffect(() => {
    if (currentUser) {
      setSelectedUserId(currentUser.id);
    }
    setPin('');
    setErrorMessage('');
  }, [isLocked, currentUser]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
      setCurrentDate(
        now.toLocaleDateString('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!isLocked) return null;

  const targetUser = users.find((u) => u.id === selectedUserId) || currentUser;

  const handleKeyPress = (digit: string) => {
    if (pin.length < 6) {
      setPin((prev) => prev + digit);
      setErrorMessage('');
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setErrorMessage('');
  };

  const handleClear = () => {
    setPin('');
    setErrorMessage('');
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!pin) {
      setErrorMessage('Masukkan PIN keamanan 4-digit');
      return;
    }

    const result = unlockSession(selectedUserId, pin);
    if (!result.success) {
      setErrorMessage(result.message);
      setPin('');
    }
  };

  const handleQuickDemoFill = (uId: string, demoPin: string) => {
    setSelectedUserId(uId);
    setPin(demoPin);
    setErrorMessage('');
  };

  return (
    <div
      id="lock-screen-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-200"
    >
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col">
        {/* Header with Pharmacy brand */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 p-6 text-white text-center relative overflow-hidden">
          <div className="absolute top-2 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold">
            <Lock className="w-3 h-3" />
            <span>Layar Terkunci</span>
          </div>

          <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center mb-3 text-emerald-400">
            <Lock className="w-6 h-6" />
          </div>

          <h2 className="text-xl font-bold tracking-tight">{settings.pharmacyName}</h2>
          <p className="text-xs text-slate-300 mt-0.5 flex items-center justify-center gap-1.5">
            <Store className="w-3.5 h-3.5 text-emerald-400" />
            <span>Sistem Kasir POS & Farmasi</span>
          </p>

          <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-400">
            <span>{currentDate}</span>
            <span className="font-mono font-bold text-emerald-300 text-sm">{currentTime} WIB</span>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-5">
          {/* User selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">
              Pilih Pengguna / Kasir:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {users.map((u) => {
                const isSelected = u.id === selectedUserId;
                return (
                  <button
                    key={u.id}
                    id={`lock-user-${u.id}`}
                    type="button"
                    onClick={() => {
                      setSelectedUserId(u.id);
                      setPin('');
                      setErrorMessage('');
                    }}
                    className={`p-2.5 rounded-2xl border text-left flex flex-col items-center gap-1.5 transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/80 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                    }`}
                  >
                    <img
                      src={u.avatar}
                      alt={u.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-xs"
                    />
                    <span className="text-[11px] font-bold text-slate-800 text-center truncate w-full">
                      {u.name.split(' ')[0]}
                    </span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded-full font-semibold uppercase ${
                        u.role === 'admin'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {u.role}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active selected user info banner */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center gap-2.5">
              <img
                src={targetUser.avatar}
                alt={targetUser.name}
                className="w-9 h-9 rounded-full object-cover border border-emerald-500/40"
              />
              <div>
                <p className="text-xs font-bold text-slate-800">{targetUser.name}</p>
                <p className="text-[10px] text-slate-500 capitalize">
                  {targetUser.role === 'admin' ? 'Akses Admin / Apoteker' : targetUser.shift || 'Kasir POS'}
                </p>
              </div>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${
                targetUser.role === 'admin'
                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}
            >
              {targetUser.role === 'admin' ? 'Admin' : 'Kasir'}
            </span>
          </div>

          {/* PIN Input Dots */}
          <div>
            <label className="block text-center text-xs font-semibold text-slate-600 mb-2">
              Masukkan PIN Keamanan
            </label>
            <div className="flex items-center justify-center gap-3 mb-2">
              {[0, 1, 2, 3].map((index) => (
                <div
                  key={index}
                  className={`w-4 h-4 rounded-full border-2 transition-all ${
                    pin.length > index
                      ? 'bg-emerald-600 border-emerald-600 scale-110 shadow-sm'
                      : 'border-slate-300 bg-slate-100'
                  }`}
                />
              ))}
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="flex items-center justify-center gap-1.5 text-xs text-rose-600 font-medium py-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>

          {/* Keypad */}
          <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                id={`keypad-${digit}`}
                type="button"
                onClick={() => handleKeyPress(digit)}
                className="h-12 rounded-2xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-800 font-bold text-lg transition-all active:scale-95 border border-slate-200/60 shadow-xs flex items-center justify-center"
              >
                {digit}
              </button>
            ))}
            <button
              id="keypad-clear"
              type="button"
              onClick={handleClear}
              className="h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs transition-all active:scale-95 border border-slate-200/60 flex items-center justify-center"
            >
              C
            </button>
            <button
              id="keypad-0"
              type="button"
              onClick={() => handleKeyPress('0')}
              className="h-12 rounded-2xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-800 font-bold text-lg transition-all active:scale-95 border border-slate-200/60 shadow-xs flex items-center justify-center"
            >
              0
            </button>
            <button
              id="keypad-backspace"
              type="button"
              onClick={handleBackspace}
              className="h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all active:scale-95 border border-slate-200/60 flex items-center justify-center"
              title="Hapus Digit"
            >
              <Delete className="w-5 h-5" />
            </button>
          </div>

          {/* Unlock Submit Button */}
          <button
            id="btn-submit-unlock"
            type="button"
            onClick={() => handleSubmit()}
            className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-md shadow-emerald-950/20 flex items-center justify-center gap-2 active:scale-98"
          >
            <Unlock className="w-4 h-4" />
            <span>Buka Kunci Layar POS</span>
          </button>

          {/* Demo Quick Fill helper */}
          <div className="pt-2 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400 mb-1.5 flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-500" />
              <span>Shortcut Demo PIN:</span>
            </p>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => handleQuickDemoFill('usr-1', '1234')}
                className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-[10px] font-semibold transition-colors"
              >
                Admin (PIN: 1234)
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoFill('usr-2', '1111')}
                className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[10px] font-semibold transition-colors"
              >
                Kasir Pagi (PIN: 1111)
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoFill('usr-3', '2222')}
                className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-[10px] font-semibold transition-colors"
              >
                Kasir Sore (PIN: 2222)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
