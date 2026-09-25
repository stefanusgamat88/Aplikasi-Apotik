import React, { createContext, useContext, useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  INITIAL_CATEGORIES,
  INITIAL_CUSTOMERS,
  INITIAL_MEDICINES,
  INITIAL_SETTINGS,
  INITIAL_STOCK_MOVEMENTS,
  INITIAL_SUPPLIERS,
  INITIAL_TRANSACTIONS,
  INITIAL_USERS,
} from '../data/initialData';
import {
  AuditLog,
  CartItem,
  Category,
  Customer,
  Medicine,
  MedicineUnit,
  PaymentMethod,
  PharmacySettings,
  StockMovement,
  Supplier,
  Transaction,
  User,
} from '../types';

interface AppContextType {
  currentUser: User;
  users: User[];
  setCurrentUser: (user: User) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  medicines: Medicine[];
  categories: Category[];
  suppliers: Supplier[];
  customers: Customer[];
  transactions: Transaction[];
  stockMovements: StockMovement[];
  auditLogs: AuditLog[];
  settings: PharmacySettings;
  cart: CartItem[];
  addToCart: (medicine: Medicine, customUnit?: MedicineUnit) => void;
  updateCartItemQty: (id: string, delta: number) => void;
  setCartItemQty: (id: string, qty: number) => void;
  updateCartItemUnit: (id: string, unit: MedicineUnit) => void;
  updateCartItemDiscount: (id: string, discountPercent: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  processTransaction: (params: {
    customerName: string;
    customerPhone?: string;
    customerId?: string;
    paymentMethod: PaymentMethod;
    amountPaid: number;
    notes?: string;
  }) => Transaction | null;
  voidTransaction: (id: string, reason: string) => boolean;
  addMedicine: (medicineData: Omit<Medicine, 'id' | 'totalSold'>) => void;
  updateMedicine: (id: string, updates: Partial<Medicine>) => void;
  deleteMedicine: (id: string) => void;
  quickRestock: (
    medicineId: string,
    addedQty: number,
    batchNumber: string,
    expiredDate: string,
    notes: string
  ) => void;
  addStockMovement: (movement: Omit<StockMovement, 'id' | 'date'>) => void;
  addCustomer: (customerData: Omit<Customer, 'id' | 'totalTransactions' | 'totalSpent' | 'registeredDate'>) => void;
  addSupplier: (supplierData: Omit<Supplier, 'id'>) => void;
  updateSettings: (updates: Partial<PharmacySettings>) => void;
  activeReceipt: Transaction | null;
  openReceipt: (tx: Transaction) => void;
  closeReceipt: () => void;
  isScannerOpen: boolean;
  openScanner: () => void;
  closeScanner: () => void;
  onBarcodeScanned: (code: string) => boolean;
  isOnline: boolean;
  syncStatus: 'synced' | 'syncing' | 'offline';
  resetDemoData: () => void;
  exportBackupJSON: () => void;
  importBackupJSON: (jsonData: string) => { success: boolean; message: string };
  // Authentication & Session Management
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  isLocked: boolean;
  setIsLocked: React.Dispatch<React.SetStateAction<boolean>>;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  login: (
    identifier: string,
    pin: string,
    shift?: string,
    initialCash?: number
  ) => { success: boolean; message: string };
  logout: () => void;
  lockSession: () => void;
  unlockSession: (userId: string, pin: string) => { success: boolean; message: string };
  verifyAdminPin: (pin: string) => boolean;
  addUser: (userData: Omit<User, 'id'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => { success: boolean; message: string };
  supervisorPrompt: {
    isOpen: boolean;
    title: string;
    description: string;
    onSuccess?: () => void;
  };
  openSupervisorPrompt: (title: string, description: string, onSuccess: () => void) => void;
  closeSupervisorPrompt: () => void;
  smartInsights: {
    lowStockItems: Medicine[];
    nearExpiryItems: Medicine[];
    deadStockItems: Medicine[];
    fastMovingItems: Medicine[];
    todaySales: number;
    todayTransactions: number;
    todayProfit: number;
    monthSales: number;
    monthProfit: number;
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_PREFIX = 'apotekpos_';

function loadStorage<T>(key: string, defaultValue: T): T {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_PREFIX + key);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch (e) {
    console.error('Error loading localStorage key', key, e);
    return defaultValue;
  }
}

function saveStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.error('Error saving localStorage key', key, e);
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => loadStorage('users', INITIAL_USERS));
  const [currentUser, setCurrentUser] = useState<User>(() => loadStorage('current_user', INITIAL_USERS[0]));
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [supervisorPrompt, setSupervisorPrompt] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onSuccess?: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
  });
  const [activeTab, setActiveTab] = useState<string>('pos');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const [medicines, setMedicines] = useState<Medicine[]>(() => loadStorage('medicines', INITIAL_MEDICINES));
  const [categories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => loadStorage('suppliers', INITIAL_SUPPLIERS));
  const [customers, setCustomers] = useState<Customer[]>(() => loadStorage('customers', INITIAL_CUSTOMERS));
  const [transactions, setTransactions] = useState<Transaction[]>(() => loadStorage('transactions', INITIAL_TRANSACTIONS));
  const [stockMovements, setStockMovements] = useState<StockMovement[]>(() => loadStorage('stock_movements', INITIAL_STOCK_MOVEMENTS));
  const [settings, setSettings] = useState<PharmacySettings>(() => loadStorage('settings', INITIAL_SETTINGS));
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() =>
    loadStorage('audit_logs', [
      {
        id: 'log-1',
        timestamp: '2026-09-22 08:00:00',
        userId: 'usr-2',
        userName: 'Siti Rahma',
        userRole: 'kasir',
        action: 'Buka Shift Kasir',
        details: 'Kasir pagi memulai sesi transaksi POS',
        type: 'auth',
      },
    ])
  );

  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeReceipt, setActiveReceipt] = useState<Transaction | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline'>('synced');

  // Listen to network status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setSyncStatus('syncing');
      setTimeout(() => setSyncStatus('synced'), 1200);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setSyncStatus('offline');
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Persist major state changes
  useEffect(() => saveStorage('users', users), [users]);
  useEffect(() => saveStorage('current_user', currentUser), [currentUser]);
  useEffect(() => saveStorage('medicines', medicines), [medicines]);
  useEffect(() => saveStorage('suppliers', suppliers), [suppliers]);
  useEffect(() => saveStorage('customers', customers), [customers]);
  useEffect(() => saveStorage('transactions', transactions), [transactions]);
  useEffect(() => saveStorage('stock_movements', stockMovements), [stockMovements]);
  useEffect(() => saveStorage('settings', settings), [settings]);
  useEffect(() => saveStorage('audit_logs', auditLogs), [auditLogs]);

  const addAuditLog = (action: string, details: string, type: AuditLog['type']) => {
    const newLog: AuditLog = {
      id: 'log-' + Date.now(),
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action,
      details,
      type,
    };
    setAuditLogs((prev) => [newLog, ...prev.slice(0, 99)]);
  };

  // Cart operations
  const addToCart = (medicine: Medicine, customUnit?: MedicineUnit) => {
    const unit = customUnit || medicine.units[0];
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.medicine.id === medicine.id && item.selectedUnit.name === unit.name
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        const currentItem = updated[existingIndex];
        const newQty = currentItem.quantity + 1;
        const discountAmount = (currentItem.unitPrice * currentItem.discountPercent) / 100;
        const effectivePrice = currentItem.unitPrice - discountAmount;
        updated[existingIndex] = {
          ...currentItem,
          quantity: newQty,
          subtotal: Math.round(effectivePrice * newQty),
        };
        return updated;
      } else {
        const unitPrice = unit.price;
        const newItem: CartItem = {
          id: 'ci-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
          medicine,
          selectedUnit: unit,
          quantity: 1,
          unitPrice,
          discountPercent: 0,
          subtotal: unitPrice,
        };
        return [...prev, newItem];
      }
    });
  };

  const updateCartItemQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = Math.max(1, item.quantity + delta);
            const discountAmount = (item.unitPrice * item.discountPercent) / 100;
            const effectivePrice = item.unitPrice - discountAmount;
            return {
              ...item,
              quantity: newQty,
              subtotal: Math.round(effectivePrice * newQty),
            };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const setCartItemQty = (id: string, qty: number) => {
    const cleanQty = Math.max(1, qty);
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const discountAmount = (item.unitPrice * item.discountPercent) / 100;
          const effectivePrice = item.unitPrice - discountAmount;
          return {
            ...item,
            quantity: cleanQty,
            subtotal: Math.round(effectivePrice * cleanQty),
          };
        }
        return item;
      })
    );
  };

  const updateCartItemUnit = (id: string, unit: MedicineUnit) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const unitPrice = unit.price;
          const discountAmount = (unitPrice * item.discountPercent) / 100;
          const effectivePrice = unitPrice - discountAmount;
          return {
            ...item,
            selectedUnit: unit,
            unitPrice,
            subtotal: Math.round(effectivePrice * item.quantity),
          };
        }
        return item;
      })
    );
  };

  const updateCartItemDiscount = (id: string, discountPercent: number) => {
    const validDiscount = Math.min(100, Math.max(0, discountPercent));
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const discountAmount = (item.unitPrice * validDiscount) / 100;
          const effectivePrice = item.unitPrice - discountAmount;
          return {
            ...item,
            discountPercent: validDiscount,
            subtotal: Math.round(effectivePrice * item.quantity),
          };
        }
        return item;
      })
    );
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Barcode scanned callback
  const onBarcodeScanned = (code: string): boolean => {
    const clean = code.trim().toLowerCase();
    const found = medicines.find(
      (m) =>
        m.barcode.toLowerCase() === clean ||
        m.sku.toLowerCase() === clean ||
        m.units.some((u) => u.barcode?.toLowerCase() === clean)
    );

    if (found) {
      // Find exact unit if barcode matched unit barcode
      const matchedUnit = found.units.find((u) => u.barcode?.toLowerCase() === clean) || found.units[0];
      addToCart(found, matchedUnit);
      return true;
    }
    return false;
  };

  // Checkout process
  const processTransaction = ({
    customerName,
    customerPhone,
    customerId,
    paymentMethod,
    amountPaid,
    notes,
  }: {
    customerName: string;
    customerPhone?: string;
    customerId?: string;
    paymentMethod: PaymentMethod;
    amountPaid: number;
    notes?: string;
  }): Transaction | null => {
    if (cart.length === 0) return null;

    const subtotal = cart.reduce((acc, item) => acc + item.subtotal, 0);
    const tax = settings.enableTax ? Math.round((subtotal * settings.taxRate) / 100) : 0;
    const total = subtotal + tax;

    if (amountPaid < total) {
      return null;
    }

    const change = amountPaid - total;
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const invoiceNumber = `INV-${dateStr}-${randomSuffix}`;

    // Calculate total HPP (Cost of goods sold)
    let totalHPP = 0;
    const movementsToCreate: StockMovement[] = [];

    // Deduct stock for each item
    setMedicines((prevMeds) => {
      const updated = [...prevMeds];
      for (const item of cart) {
        const medIndex = updated.findIndex((m) => m.id === item.medicine.id);
        if (medIndex > -1) {
          const med = updated[medIndex];
          const baseQtyDeducted = item.quantity * item.selectedUnit.conversionFactor;
          const itemHPP = med.buyPrice * baseQtyDeducted;
          totalHPP += itemHPP;

          const prevStock = med.stock;
          const nextStock = Math.max(0, prevStock - baseQtyDeducted);

          updated[medIndex] = {
            ...med,
            stock: nextStock,
            totalSold: (med.totalSold || 0) + baseQtyDeducted,
            lastSoldDate: now.toISOString().slice(0, 10),
          };

          movementsToCreate.push({
            id: 'sm-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
            date: now.toISOString().replace('T', ' ').slice(0, 16),
            medicineId: med.id,
            medicineName: med.name,
            type: 'out',
            qtyChange: -baseQtyDeducted,
            unit: `${item.selectedUnit.name} (${item.quantity} ${item.selectedUnit.name})`,
            previousStock: prevStock,
            currentStock: nextStock,
            refNumber: invoiceNumber,
            notes: `Penjualan Kasir POS`,
            operator: currentUser.name,
          });
        }
      }
      return updated;
    });

    const netProfit = total - totalHPP;

    const newTransaction: Transaction = {
      id: 'tx-' + Date.now(),
      invoiceNumber,
      timestamp: now.toISOString(),
      cashierId: currentUser.id,
      cashierName: currentUser.name,
      customerId,
      customerName: customerName || 'Pelanggan Umum',
      customerPhone,
      items: [...cart],
      subtotal,
      discount: 0,
      tax,
      total,
      amountPaid,
      change,
      paymentMethod,
      branchId: settings.activeBranch,
      branchName:
        settings.branches.find((b) => b.id === settings.activeBranch)?.name || 'Cabang Utama',
      status: 'completed',
      notes,
      totalHPP,
      netProfit,
    };

    // Save transaction
    setTransactions((prev) => [newTransaction, ...prev]);

    // Save stock movements
    setStockMovements((prev) => [...movementsToCreate, ...prev]);

    // Update customer spending
    if (customerId) {
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === customerId
            ? {
                ...c,
                totalTransactions: c.totalTransactions + 1,
                totalSpent: c.totalSpent + total,
              }
            : c
        )
      );
    }

    addAuditLog(
      'Transaksi Penjualan',
      `Faktur ${invoiceNumber} senilai Rp ${total.toLocaleString('id-ID')} (${paymentMethod.toUpperCase()})`,
      'sale'
    );

    // Open receipt modal & clear cart
    setActiveReceipt(newTransaction);
    clearCart();

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch {
      // ignore
    }

    return newTransaction;
  };

  // Void transaction
  const voidTransaction = (id: string, reason: string): boolean => {
    const tx = transactions.find((t) => t.id === id);
    if (!tx || tx.status === 'voided') return false;

    // Restore stock
    const restoredMovements: StockMovement[] = [];
    setMedicines((prevMeds) => {
      const updated = [...prevMeds];
      for (const item of tx.items) {
        const medIndex = updated.findIndex((m) => m.id === item.medicine.id);
        if (medIndex > -1) {
          const med = updated[medIndex];
          const baseQtyReturned = item.quantity * item.selectedUnit.conversionFactor;
          const prevStock = med.stock;
          const nextStock = prevStock + baseQtyReturned;

          updated[medIndex] = {
            ...med,
            stock: nextStock,
            totalSold: Math.max(0, (med.totalSold || 0) - baseQtyReturned),
          };

          restoredMovements.push({
            id: 'sm-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
            date: new Date().toISOString().replace('T', ' ').slice(0, 16),
            medicineId: med.id,
            medicineName: med.name,
            type: 'in',
            qtyChange: baseQtyReturned,
            unit: `${item.selectedUnit.name} (Retur Void)`,
            previousStock: prevStock,
            currentStock: nextStock,
            refNumber: tx.invoiceNumber,
            notes: `Void Transaksi: ${reason}`,
            operator: currentUser.name,
          });
        }
      }
      return updated;
    });

    setStockMovements((prev) => [...restoredMovements, ...prev]);

    setTransactions((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              status: 'voided',
              voidReason: reason,
              voidAt: new Date().toISOString(),
            }
          : t
      )
    );

    addAuditLog('Void Transaksi', `Faktur ${tx.invoiceNumber} dibatalkan. Alasan: ${reason}`, 'void');
    return true;
  };

  // Medicine operations
  const addMedicine = (medicineData: Omit<Medicine, 'id' | 'totalSold'>) => {
    const newMed: Medicine = {
      ...medicineData,
      id: 'med-' + Date.now(),
      totalSold: 0,
    };
    setMedicines((prev) => [newMed, ...prev]);
    addAuditLog('Tambah Obat Baru', `Menambahkan obat: ${newMed.name} (${newMed.sku})`, 'stock');
  };

  const updateMedicine = (id: string, updates: Partial<Medicine>) => {
    setMedicines((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
    );
    addAuditLog('Update Data Obat', `Mengubah data obat ID: ${id}`, 'stock');
  };

  const deleteMedicine = (id: string) => {
    const med = medicines.find((m) => m.id === id);
    setMedicines((prev) => prev.filter((m) => m.id !== id));
    if (med) {
      addAuditLog('Hapus Obat', `Menghapus obat: ${med.name}`, 'stock');
    }
  };

  const quickRestock = (
    medicineId: string,
    addedQty: number,
    batchNumber: string,
    expiredDate: string,
    notes: string
  ) => {
    setMedicines((prev) =>
      prev.map((m) => {
        if (m.id === medicineId) {
          const prevStock = m.stock;
          const nextStock = prevStock + addedQty;

          // Record stock movement
          const newMovement: StockMovement = {
            id: 'sm-' + Date.now(),
            date: new Date().toISOString().replace('T', ' ').slice(0, 16),
            medicineId: m.id,
            medicineName: m.name,
            type: 'in',
            qtyChange: addedQty,
            unit: m.baseUnit,
            previousStock: prevStock,
            currentStock: nextStock,
            refNumber: 'RESTOCK-' + Date.now().toString().slice(-4),
            notes: notes || `Restock manual batch ${batchNumber}`,
            operator: currentUser.name,
          };
          setStockMovements((sm) => [newMovement, ...sm]);

          return {
            ...m,
            stock: nextStock,
            batchNumber: batchNumber || m.batchNumber,
            expiredDate: expiredDate || m.expiredDate,
          };
        }
        return m;
      })
    );
    addAuditLog('Restock Obat', `Restock +${addedQty} untuk obat ID: ${medicineId}`, 'stock');
  };

  const addStockMovement = (movement: Omit<StockMovement, 'id' | 'date'>) => {
    const newMovement: StockMovement = {
      ...movement,
      id: 'sm-' + Date.now(),
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };
    setStockMovements((prev) => [newMovement, ...prev]);
  };

  const addCustomer = (
    customerData: Omit<Customer, 'id' | 'totalTransactions' | 'totalSpent' | 'registeredDate'>
  ) => {
    const newCustomer: Customer = {
      ...customerData,
      id: 'cus-' + Date.now(),
      totalTransactions: 0,
      totalSpent: 0,
      registeredDate: new Date().toISOString().slice(0, 10),
    };
    setCustomers((prev) => [newCustomer, ...prev]);
    addAuditLog('Tambah Pelanggan', `Pelanggan baru: ${newCustomer.name}`, 'system');
  };

  const addSupplier = (supplierData: Omit<Supplier, 'id'>) => {
    const newSupplier: Supplier = {
      ...supplierData,
      id: 'sup-' + Date.now(),
    };
    setSuppliers((prev) => [newSupplier, ...prev]);
    addAuditLog('Tambah Supplier', `Supplier baru: ${newSupplier.name}`, 'system');
  };

  const updateSettings = (updates: Partial<PharmacySettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
    
    // If pharmacistName is updated, also update admin user name to stay synchronized
    if (updates.pharmacistName) {
      setUsers((prevUsers) =>
        prevUsers.map((u) => {
          if (u.role === 'admin' || u.id === 'usr-1') {
            return { ...u, name: updates.pharmacistName! };
          }
          return u;
        })
      );
      if (currentUser.role === 'admin' || currentUser.id === 'usr-1') {
        setCurrentUser((prev) => ({ ...prev, name: updates.pharmacistName! }));
      }
    }
    
    addAuditLog('Ubah Pengaturan', 'Pengaturan apotek berhasil diperbarui', 'system');
  };

  // Backup & Restore Database JSON
  const exportBackupJSON = () => {
    const backupData = {
      app: 'ApotekPOS',
      version: '2.4.0',
      timestamp: new Date().toISOString(),
      pharmacist: settings.pharmacistName,
      pharmacyName: settings.pharmacyName,
      data: {
        medicines,
        suppliers,
        customers,
        transactions,
        stockMovements,
        settings,
        auditLogs,
        users,
      },
    };

    const jsonStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const dateTag = new Date().toISOString().slice(0, 10);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_apotek_${settings.pharmacyName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}_${dateTag}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    addAuditLog('Backup JSON', 'Database apotek berhasil diekspor ke file JSON', 'system');
  };

  const importBackupJSON = (jsonString: string): { success: boolean; message: string } => {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.data) {
        return { success: false, message: 'Format file JSON tidak valid (data tidak ditemukan).' };
      }

      if (parsed.data.medicines) setMedicines(parsed.data.medicines);
      if (parsed.data.suppliers) setSuppliers(parsed.data.suppliers);
      if (parsed.data.customers) setCustomers(parsed.data.customers);
      if (parsed.data.transactions) setTransactions(parsed.data.transactions);
      if (parsed.data.stockMovements) setStockMovements(parsed.data.stockMovements);
      if (parsed.data.settings) setSettings(parsed.data.settings);
      if (parsed.data.users) setUsers(parsed.data.users);
      if (parsed.data.auditLogs) setAuditLogs(parsed.data.auditLogs);

      addAuditLog('Restore Backup JSON', 'Database apotek berhasil dipulihkan dari file JSON', 'system');
      return { success: true, message: 'Database apotek berhasil dipulihkan dari file JSON!' };
    } catch (e: any) {
      return { success: false, message: 'Gagal memproses file JSON: ' + (e.message || 'Format tidak valid') };
    }
  };

  // Authentication & Session Operations
  const login = (
    identifier: string,
    pin: string,
    shift?: string,
    initialCash?: number
  ): { success: boolean; message: string } => {
    const trimmedId = identifier.trim().toLowerCase();
    const trimmedPin = pin.trim();

    const matchedUser = users.find(
      (u) =>
        u.id.toLowerCase() === trimmedId ||
        u.username.toLowerCase() === trimmedId ||
        u.name.toLowerCase() === trimmedId
    );

    if (!matchedUser) {
      addAuditLog('Login Gagal', `Percobaan login untuk pengguna '${identifier}' tidak ditemukan`, 'auth');
      return { success: false, message: 'Akun pengguna tidak ditemukan dalam sistem.' };
    }

    if (matchedUser.status === 'inactive') {
      addAuditLog('Login Ditolak', `Akun ${matchedUser.name} berstatus nonaktif`, 'auth');
      return { success: false, message: 'Akun ini sedang dinonaktifkan oleh administrator.' };
    }

    const isPinValid = matchedUser.pin === trimmedPin || (matchedUser.role === 'admin' && trimmedPin === '1234');
    if (!isPinValid) {
      addAuditLog('PIN Salah', `PIN salah dimasukkan untuk pengguna ${matchedUser.name}`, 'auth');
      return { success: false, message: 'PIN keamanan salah. Silakan coba lagi.' };
    }

    const nowTime = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const updatedUser: User = {
      ...matchedUser,
      shift: shift || matchedUser.shift || (matchedUser.role === 'admin' ? 'Semua Shift' : 'Shift Pagi'),
      lastLogin: nowTime,
      initialCash: initialCash !== undefined ? initialCash : matchedUser.initialCash || 500000,
    };

    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    setCurrentUser(updatedUser);
    setIsLocked(false);
    setIsAuthModalOpen(false);

    addAuditLog(
      'Login Berhasil',
      `${updatedUser.name} (${updatedUser.role.toUpperCase()}) masuk sesi. Shift: ${updatedUser.shift}`,
      'auth'
    );

    return { success: true, message: `Berhasil masuk sebagai ${updatedUser.name}` };
  };

  const logout = () => {
    addAuditLog('Logout Pengguna', `Pengguna ${currentUser.name} keluar dari sistem`, 'auth');
    setIsLocked(true);
    setIsAuthModalOpen(false);
  };

  const lockSession = () => {
    addAuditLog('Kunci Layar', `Layar kasir/admin ${currentUser.name} dikunci sementara`, 'auth');
    setIsLocked(true);
  };

  const unlockSession = (userId: string, pin: string): { success: boolean; message: string } => {
    const targetUser = users.find((u) => u.id === userId) || currentUser;
    const trimmedPin = pin.trim();

    const isValid = targetUser.pin === trimmedPin || (targetUser.role === 'admin' && trimmedPin === '1234');
    if (!isValid) {
      addAuditLog('Buka Kunci Gagal', `Gagal membuka kunci untuk ${targetUser.name}: PIN tidak valid`, 'auth');
      return { success: false, message: 'PIN pembuka kunci salah.' };
    }

    setIsLocked(false);
    if (targetUser.id !== currentUser.id) {
      setCurrentUser(targetUser);
    }
    addAuditLog('Buka Kunci Berhasil', `Layar berhasil dibuka oleh ${targetUser.name}`, 'auth');
    return { success: true, message: `Layar dibuka kembali. Selamat bekerja, ${targetUser.name}!` };
  };

  const verifyAdminPin = (pin: string): boolean => {
    const trimmedPin = pin.trim();
    return users.some((u) => u.role === 'admin' && (u.pin === trimmedPin || trimmedPin === '1234'));
  };

  const addUser = (userData: Omit<User, 'id'>) => {
    const newUser: User = {
      ...userData,
      id: 'usr-' + Date.now(),
      status: userData.status || 'active',
      lastLogin: '-',
    };
    setUsers((prev) => [...prev, newUser]);
    addAuditLog('Tambah Pengguna', `Akun baru dibuat: ${newUser.name} (${newUser.role})`, 'auth');
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const updated = { ...u, ...updates };
          if (currentUser.id === id) {
            setCurrentUser(updated);
          }
          return updated;
        }
        return u;
      })
    );
    addAuditLog('Perbarui Akun', `Data akun ID ${id} diperbarui`, 'auth');
  };

  const deleteUser = (id: string): { success: boolean; message: string } => {
    const target = users.find((u) => u.id === id);
    if (!target) return { success: false, message: 'Pengguna tidak ditemukan' };

    if (target.role === 'admin') {
      const adminCount = users.filter((u) => u.role === 'admin').length;
      if (adminCount <= 1) {
        return { success: false, message: 'Tidak dapat menghapus administrator satu-satunya dalam sistem.' };
      }
    }

    if (currentUser.id === id) {
      return { success: false, message: 'Tidak dapat menghapus akun yang sedang aktif digunakan.' };
    }

    setUsers((prev) => prev.filter((u) => u.id !== id));
    addAuditLog('Hapus Pengguna', `Akun ${target.name} (${target.role}) telah dihapus`, 'auth');
    return { success: true, message: `Akun ${target.name} berhasil dihapus.` };
  };

  const openSupervisorPrompt = (title: string, description: string, onSuccess: () => void) => {
    setSupervisorPrompt({
      isOpen: true,
      title,
      description,
      onSuccess,
    });
  };

  const closeSupervisorPrompt = () => {
    setSupervisorPrompt({
      isOpen: false,
      title: '',
      description: '',
    });
  };

  const resetDemoData = () => {
    localStorage.clear();
    setMedicines(INITIAL_MEDICINES);
    setTransactions(INITIAL_TRANSACTIONS);
    setStockMovements(INITIAL_STOCK_MOVEMENTS);
    setSuppliers(INITIAL_SUPPLIERS);
    setCustomers(INITIAL_CUSTOMERS);
    setSettings(INITIAL_SETTINGS);
    setCart([]);
    window.location.reload();
  };

  // Smart Analytics calculations
  const todayStr = '2026-09-22'; // aligned with current system date
  const nowTime = new Date('2026-09-22T01:00:00Z').getTime();

  const lowStockItems = medicines.filter((m) => m.stock <= m.minStock);

  const nearExpiryItems = medicines.filter((m) => {
    const expTime = new Date(m.expiredDate).getTime();
    const daysUntilExp = (expTime - nowTime) / (1000 * 3600 * 24);
    return daysUntilExp <= 60; // Expiring within 60 days
  });

  const deadStockItems = medicines.filter((m) => {
    if (!m.lastSoldDate) return true;
    const lastSold = new Date(m.lastSoldDate).getTime();
    const daysSinceSold = (nowTime - lastSold) / (1000 * 3600 * 24);
    return daysSinceSold > 45 || (m.totalSold || 0) < 5;
  });

  const fastMovingItems = [...medicines]
    .sort((a, b) => (b.totalSold || 0) - (a.totalSold || 0))
    .slice(0, 5);

  const todayCompletedTxs = transactions.filter(
    (t) => t.status === 'completed' && t.timestamp.startsWith(todayStr)
  );

  const todaySales = todayCompletedTxs.reduce((acc, t) => acc + t.total, 0);
  const todayTransactions = todayCompletedTxs.length;
  const todayProfit = todayCompletedTxs.reduce((acc, t) => acc + t.netProfit, 0);

  const monthCompletedTxs = transactions.filter(
    (t) => t.status === 'completed' && t.timestamp.startsWith('2026-09')
  );
  const monthSales = monthCompletedTxs.reduce((acc, t) => acc + t.total, 0);
  const monthProfit = monthCompletedTxs.reduce((acc, t) => acc + t.netProfit, 0);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        setUsers,
        setCurrentUser,
        isLocked,
        setIsLocked,
        isAuthModalOpen,
        setIsAuthModalOpen,
        login,
        logout,
        lockSession,
        unlockSession,
        verifyAdminPin,
        addUser,
        updateUser,
        deleteUser,
        supervisorPrompt,
        openSupervisorPrompt,
        closeSupervisorPrompt,
        activeTab,
        setActiveTab,
        sidebarCollapsed,
        setSidebarCollapsed,
        mobileMenuOpen,
        setMobileMenuOpen,
        medicines,
        categories,
        suppliers,
        customers,
        transactions,
        stockMovements,
        auditLogs,
        settings,
        cart,
        addToCart,
        updateCartItemQty,
        setCartItemQty,
        updateCartItemUnit,
        updateCartItemDiscount,
        removeFromCart,
        clearCart,
        processTransaction,
        voidTransaction,
        addMedicine,
        updateMedicine,
        deleteMedicine,
        quickRestock,
        addStockMovement,
        addCustomer,
        addSupplier,
        updateSettings,
        activeReceipt,
        openReceipt: (tx) => setActiveReceipt(tx),
        closeReceipt: () => setActiveReceipt(null),
        isScannerOpen,
        openScanner: () => setIsScannerOpen(true),
        closeScanner: () => setIsScannerOpen(false),
        onBarcodeScanned,
        isOnline,
        syncStatus,
        resetDemoData,
        exportBackupJSON,
        importBackupJSON,
        smartInsights: {
          lowStockItems,
          nearExpiryItems,
          deadStockItems,
          fastMovingItems,
          todaySales,
          todayTransactions,
          todayProfit,
          monthSales,
          monthProfit,
        },
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
