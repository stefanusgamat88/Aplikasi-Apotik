import React, { useState } from 'react';
import {
  AlertCircle,
  Banknote,
  Check,
  CreditCard,
  Minus,
  Pill,
  Plus,
  QrCode,
  RotateCcw,
  Search,
  ShoppingCart,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Medicine, MedicineUnit, PaymentMethod } from '../types';

export const PosView: React.FC = () => {
  const {
    medicines,
    categories,
    cart,
    addToCart,
    updateCartItemQty,
    setCartItemQty,
    updateCartItemUnit,
    updateCartItemDiscount,
    removeFromCart,
    clearCart,
    processTransaction,
    openScanner,
    customers,
    addCustomer,
    settings,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('cus-1');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [cashGiven, setCashGiven] = useState<string>('');
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newCustomerAllergies, setNewCustomerAllergies] = useState('');
  const [mobileCartView, setMobileCartView] = useState(false);

  // Filter medicines
  const filteredMedicines = medicines.filter((med) => {
    const matchesSearch =
      med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      med.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      med.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      med.barcode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      med.indication.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' || med.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const cartSubtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const cartTax = settings.enableTax ? Math.round((cartSubtotal * settings.taxRate) / 100) : 0;
  const grandTotal = cartSubtotal + cartTax;

  // Selected customer
  const currentCustomer =
    customers.find((c) => c.id === selectedCustomerId) || customers[0];

  // Auto cash amount handling
  const cashNum = parseFloat(cashGiven.replace(/\./g, '')) || 0;
  const changeAmount = Math.max(0, cashNum - grandTotal);
  const isPaymentValid = cart.length > 0 && (paymentMethod !== 'cash' || cashNum >= grandTotal);

  const handleQuickCash = (amount: number) => {
    setCashGiven(amount.toLocaleString('id-ID'));
  };

  const handleExactCash = () => {
    setCashGiven(grandTotal.toLocaleString('id-ID'));
  };

  const handleProcessPayment = () => {
    if (!isPaymentValid) return;

    const finalAmountPaid = paymentMethod === 'cash' ? cashNum : grandTotal;

    const res = processTransaction({
      customerName: currentCustomer.name,
      customerPhone: currentCustomer.phone !== '-' ? currentCustomer.phone : undefined,
      customerId: currentCustomer.id,
      paymentMethod,
      amountPaid: finalAmountPaid,
      notes: currentCustomer.allergies ? `Catatan: ${currentCustomer.allergies}` : undefined,
    });

    if (res) {
      setCashGiven('');
      setMobileCartView(false);
    }
  };

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerName.trim()) return;

    addCustomer({
      name: newCustomerName,
      phone: newCustomerPhone || '-',
      allergies: newCustomerAllergies || 'Tidak ada alergi',
    });

    setNewCustomerName('');
    setNewCustomerPhone('');
    setNewCustomerAllergies('');
    setShowAddCustomerModal(false);
  };

  return (
    <div className="h-[calc(100vh-4.2rem)] flex flex-col lg:flex-row overflow-hidden bg-slate-100">
      {/* LEFT / CENTER: Products Grid & Search */}
      <div className={`flex-1 flex flex-col overflow-hidden ${mobileCartView ? 'hidden lg:flex' : 'flex'}`}>
        {/* Top Control Bar: Search & Scan & Filter */}
        <div className="p-3 sm:p-4 bg-white border-b border-slate-200 shadow-2xs space-y-3 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                id="input-search-medicine"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama obat, indikasi, nomor SKU, atau barcode..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-3 text-xs text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              id="btn-scan-pos"
              onClick={openScanner}
              className="flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors shrink-0"
              title="Buka Kamera Barcode Scanner"
            >
              <QrCode className="w-4 h-4" />
              <span className="hidden sm:inline">Scan Barcode</span>
            </button>
          </div>

          {/* Categories Pill Scroller */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
            <button
              id="category-pill-all"
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Semua ({medicines.length})
            </button>
            {categories.map((cat) => {
              const count = medicines.filter((m) => m.category === cat.name).length;
              return (
                <button
                  key={cat.id}
                  id={`category-pill-${cat.id}`}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    selectedCategory === cat.name
                      ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat.name} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="flex-1 p-3 sm:p-4 overflow-y-auto custom-scrollbar">
          {filteredMedicines.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <Pill className="w-12 h-12 text-slate-300 mb-2" />
              <p className="font-semibold text-slate-700">Obat tidak ditemukan</p>
              <p className="text-xs mt-1">Coba kata kunci lain atau scan barcode produk.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3.5">
              {filteredMedicines.map((med) => {
                const isOutOfStock = med.stock <= 0;
                const isLowStock = med.stock > 0 && med.stock <= med.minStock;

                return (
                  <div
                    key={med.id}
                    id={`product-card-${med.id}`}
                    onClick={() => !isOutOfStock && addToCart(med)}
                    className={`group relative bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col overflow-hidden cursor-pointer select-none ${
                      isOutOfStock ? 'opacity-50 cursor-not-allowed bg-slate-50' : 'hover:border-emerald-400'
                    }`}
                  >
                    {/* Top Image or Banner */}
                    <div className="relative h-28 sm:h-32 bg-slate-100 overflow-hidden">
                      <img
                        src={med.imageUrl}
                        alt={med.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />

                      {/* Category Badge */}
                      <span
                        className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs backdrop-blur-xs ${
                          med.category === 'Obat Keras'
                            ? 'bg-rose-600 text-white'
                            : med.category === 'Obat Bebas Terbatas'
                            ? 'bg-blue-600 text-white'
                            : med.category === 'Herbal & Tradisional'
                            ? 'bg-teal-700 text-white'
                            : 'bg-emerald-600 text-white'
                        }`}
                      >
                        {med.category}
                      </span>

                      {/* Prescription Alert */}
                      {med.requiresPrescription && (
                        <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-rose-600 text-white text-[11px] font-extrabold flex items-center justify-center shadow-xs">
                          K
                        </span>
                      )}

                      {/* Stock Badge Overlay */}
                      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded backdrop-blur-md shadow-2xs ${
                            isOutOfStock
                              ? 'bg-rose-950/80 text-rose-300'
                              : isLowStock
                              ? 'bg-amber-950/80 text-amber-300'
                              : 'bg-slate-900/80 text-emerald-300'
                          }`}
                        >
                          Stok: {med.stock} {med.baseUnit}
                        </span>

                        <span className="text-[9px] bg-white/90 text-slate-600 px-1 py-0.5 rounded font-mono">
                          {med.locationRack.split(' ')[0]}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-3 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-xs sm:text-sm text-slate-800 line-clamp-1 group-hover:text-emerald-700 transition-colors">
                          {med.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 line-clamp-1 italic">
                          {med.genericName}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                          {med.indication}
                        </p>
                      </div>

                      {/* Price & Unit Options */}
                      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] text-slate-400 font-medium">Harga Dasar</p>
                          <p className="text-xs sm:text-sm font-extrabold text-emerald-700">
                            Rp {med.sellPrice.toLocaleString('id-ID')}
                            <span className="text-[10px] font-normal text-slate-500">/{med.baseUnit}</span>
                          </p>
                        </div>

                        <div className="w-7 h-7 rounded-lg bg-emerald-50 group-hover:bg-emerald-600 text-emerald-600 group-hover:text-white flex items-center justify-center transition-all shadow-2xs">
                          <Plus className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Mobile Floating Cart Trigger Bar */}
        <div className="lg:hidden p-3 bg-white border-t border-slate-200 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <div className="relative p-2 rounded-xl bg-emerald-600 text-white">
              <ShoppingCart className="w-5 h-5" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">
                {cart.length} Jenis Obat di Keranjang
              </p>
              <p className="text-sm font-extrabold text-emerald-700">
                Rp {grandTotal.toLocaleString('id-ID')}
              </p>
            </div>
          </div>

          <button
            onClick={() => setMobileCartView(true)}
            className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-md"
          >
            Lihat Keranjang & Bayar →
          </button>
        </div>
      </div>

      {/* RIGHT: POS CART & CHECKOUT PANEL */}
      <div
        className={`w-full lg:w-96 xl:w-[410px] bg-white border-l border-slate-200 flex flex-col shrink-0 shadow-lg ${
          mobileCartView ? 'flex' : 'hidden lg:flex'
        }`}
      >
        {/* Cart Header */}
        <div className="p-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-600 text-white">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800 leading-tight">Keranjang Belanja</h3>
              <p className="text-[11px] text-slate-500">
                {cart.reduce((sum, it) => sum + it.quantity, 0)} item dipilih
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {mobileCartView && (
              <button
                onClick={() => setMobileCartView(false)}
                className="lg:hidden text-xs text-slate-600 hover:text-slate-800 font-semibold px-2 py-1 bg-slate-200 rounded"
              >
                ← Kembali ke Obat
              </button>
            )}
            {cart.length > 0 && (
              <button
                id="btn-clear-cart"
                onClick={clearCart}
                className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 hover:bg-rose-50 px-2 py-1 rounded transition-colors"
                title="Kosongkan Keranjang"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Customer Select Bar */}
        <div className="px-3.5 py-2.5 bg-slate-100/70 border-b border-slate-200 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Users className="w-4 h-4 text-emerald-700 shrink-0" />
            <select
              id="pos-customer-select"
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg text-xs py-1.5 px-2 font-medium text-slate-800 focus:outline-none focus:border-emerald-500"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.phone !== '-' ? `(${c.phone})` : ''}
                </option>
              ))}
            </select>
          </div>

          <button
            id="btn-add-customer-pos"
            onClick={() => setShowAddCustomerModal(true)}
            className="p-1.5 rounded-lg bg-white border border-slate-300 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 transition-colors shrink-0"
            title="Tambah Pasien / Pelanggan Baru"
          >
            <UserPlus className="w-4 h-4" />
          </button>
        </div>

        {/* Allergy Alert if Customer has allergies */}
        {currentCustomer.allergies && currentCustomer.allergies !== 'Tidak ada alergi' && (
          <div className="px-3 py-1.5 bg-amber-50 border-b border-amber-200 text-amber-800 text-[11px] flex items-center gap-1.5 font-medium">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="truncate">Perhatian: {currentCustomer.allergies}</span>
          </div>
        )}

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5 custom-scrollbar">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <ShoppingCart className="w-12 h-12 text-slate-300 mb-2" />
              <p className="font-semibold text-slate-600 text-sm">Keranjang Masih Kosong</p>
              <p className="text-xs mt-1 text-slate-400 max-w-xs">
                Klik obat pada katalog atau scan barcode untuk menambahkan ke pesanan.
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                id={`cart-item-${item.id}`}
                className="p-2.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all space-y-2"
              >
                {/* Item title & delete */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h5 className="font-bold text-xs text-slate-800 truncate leading-tight">
                      {item.medicine.name}
                    </h5>
                    <p className="text-[10px] text-slate-400">
                      Batch: {item.medicine.batchNumber} • Exp: {item.medicine.expiredDate}
                    </p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-slate-400 hover:text-rose-500 p-1 rounded transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Multi-Unit Selector & Quantity Controls */}
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
                  {/* Satuan Dropdown */}
                  <select
                    value={item.selectedUnit.name}
                    onChange={(e) => {
                      const newUnit = item.medicine.units.find((u) => u.name === e.target.value);
                      if (newUnit) updateCartItemUnit(item.id, newUnit);
                    }}
                    className="text-xs bg-slate-50 border border-slate-300 rounded-md py-1 px-2 font-medium text-slate-700 focus:outline-none focus:border-emerald-500"
                  >
                    {item.medicine.units.map((u) => (
                      <option key={u.name} value={u.name}>
                        {u.name} (Rp {u.price.toLocaleString('id-ID')})
                      </option>
                    ))}
                  </select>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateCartItemQty(item.id, -1)}
                      className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => setCartItemQty(item.id, parseInt(e.target.value) || 1)}
                      className="w-10 text-center font-bold text-xs py-0.5 border border-slate-200 rounded"
                    />
                    <button
                      onClick={() => updateCartItemQty(item.id, 1)}
                      className="w-6 h-6 rounded-md bg-emerald-100 hover:bg-emerald-200 text-emerald-800 flex items-center justify-center font-bold text-xs transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Subtotal */}
                  <div className="text-right">
                    <span className="font-extrabold text-xs text-slate-800">
                      Rp {item.subtotal.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Checkout & Payment Controls */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 space-y-3 shrink-0">
          {/* Payment Method Selector */}
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { id: 'cash', label: 'Tunai', icon: Banknote },
              { id: 'qris', label: 'QRIS', icon: QrCode },
              { id: 'debit', label: 'Debit', icon: CreditCard },
              { id: 'transfer', label: 'Transfer', icon: RotateCcw },
            ].map((m) => {
              const Icon = m.icon;
              return (
                <button
                  key={m.id}
                  id={`pay-method-${m.id}`}
                  onClick={() => setPaymentMethod(m.id as PaymentMethod)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                    paymentMethod === m.id
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Cash Buttons if payment method is cash */}
          {paymentMethod === 'cash' && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-slate-500 whitespace-nowrap">
                  Uang Cepat:
                </span>
                <div className="flex flex-wrap gap-1 flex-1">
                  <button
                    type="button"
                    onClick={handleExactCash}
                    className="px-2 py-1 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-300 rounded-lg text-[10px] font-bold"
                  >
                    Uang Pas
                  </button>
                  {[20000, 50000, 100000, 200000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handleQuickCash(amt)}
                      className="px-2 py-1 bg-white hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg text-[10px] font-semibold"
                    >
                      {amt >= 1000 ? `${amt / 1000}k` : amt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cash Input & Change */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">
                    Uang Diterima (Rp)
                  </label>
                  <input
                    id="input-cash-received"
                    type="text"
                    value={cashGiven}
                    onChange={(e) => setCashGiven(e.target.value)}
                    placeholder="0"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">
                    Kembalian (Rp)
                  </label>
                  <div className="w-full px-2.5 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-extrabold text-emerald-800">
                    Rp {changeAmount.toLocaleString('id-ID')}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Subtotal & Total Display */}
          <div className="pt-2 border-t border-slate-200 space-y-1 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal Item</span>
              <span>Rp {cartSubtotal.toLocaleString('id-ID')}</span>
            </div>
            {settings.enableTax && (
              <div className="flex justify-between text-slate-500">
                <span>PPN ({settings.taxRate}%)</span>
                <span>Rp {cartTax.toLocaleString('id-ID')}</span>
              </div>
            )}
            <div className="flex justify-between items-baseline pt-1 text-slate-900 font-extrabold">
              <span className="text-sm">TOTAL BAYAR</span>
              <span className="text-lg text-emerald-700">
                Rp {grandTotal.toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          {/* MAIN ACTION BUTTON: 👉 PROSES PEMBAYARAN */}
          <button
            id="btn-process-payment"
            onClick={handleProcessPayment}
            disabled={!isPaymentValid}
            className={`w-full py-3.5 px-4 rounded-2xl font-extrabold text-sm text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
              isPaymentValid
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-700/30 hover:scale-[1.01] active:scale-[0.99] cursor-pointer'
                : 'bg-slate-300 text-slate-500 shadow-none cursor-not-allowed'
            }`}
          >
            <Check className="w-5 h-5" />
            👉 PROSES PEMBAYARAN (Rp {grandTotal.toLocaleString('id-ID')})
          </button>
        </div>
      </div>

      {/* MODAL: Tambah Pasien / Pelanggan Baru */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-5 animate-in zoom-in-95">
            <h3 className="font-bold text-base text-slate-800 mb-1">Tambah Pelanggan / Pasien Baru</h3>
            <p className="text-xs text-slate-500 mb-4">Catat data pasien untuk riwayat obat & catatan alergi.</p>

            <form onSubmit={handleSaveCustomer} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Nama Lengkap Pasien *</label>
                <input
                  type="text"
                  required
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  placeholder="Contoh: Ibu Rina Wardani"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Nomor WhatsApp / HP</label>
                <input
                  type="text"
                  value={newCustomerPhone}
                  onChange={(e) => setNewCustomerPhone(e.target.value)}
                  placeholder="Contoh: 0812-3456-7890"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Catatan Alergi Obat</label>
                <input
                  type="text"
                  value={newCustomerAllergies}
                  onChange={(e) => setNewCustomerAllergies(e.target.value)}
                  placeholder="Contoh: Alergi Amoxicillin / Paracetamol"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddCustomerModal(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                >
                  Simpan Pasien
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
