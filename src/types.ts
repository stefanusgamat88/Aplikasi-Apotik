export type UserRole = 'admin' | 'kasir';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar: string;
  pin: string;
  username: string;
  shift?: string;
  phone?: string;
  status?: 'active' | 'inactive';
  lastLogin?: string;
  initialCash?: number;
}

export interface MedicineUnit {
  name: 'Tablet' | 'Kaplet' | 'Kapsul' | 'Strip' | 'Box' | 'Botol' | 'Sachet' | 'Pcs' | 'Tube';
  conversionFactor: number; // e.g. 1 Box = 10 Strip, 1 Strip = 10 Tablet. Base unit factor is 1.
  price: number; // Selling price for this unit
  barcode?: string;
}

export interface Medicine {
  id: string;
  sku: string;
  barcode: string;
  name: string;
  genericName: string;
  category: string;
  indication: string;
  requiresPrescription: boolean;
  baseUnit: 'Tablet' | 'Kaplet' | 'Kapsul' | 'Botol' | 'Sachet' | 'Pcs' | 'Tube';
  units: MedicineUnit[];
  stock: number; // in base units
  minStock: number;
  buyPrice: number; // HPP modal base unit
  sellPrice: number; // Default selling price base unit
  batchNumber: string;
  expiredDate: string; // YYYY-MM-DD
  manufacturer: string;
  locationRack: string;
  imageUrl?: string;
  totalSold: number;
  lastSoldDate?: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
  count?: number;
}

export interface CartItem {
  id: string;
  medicine: Medicine;
  selectedUnit: MedicineUnit;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  subtotal: number;
  prescriptionNote?: string;
}

export type PaymentMethod = 'cash' | 'qris' | 'dana' | 'debit' | 'transfer';

export interface Transaction {
  id: string;
  invoiceNumber: string;
  timestamp: string;
  cashierId: string;
  cashierName: string;
  customerId?: string;
  customerName: string;
  customerPhone?: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  amountPaid: number;
  change: number;
  paymentMethod: PaymentMethod;
  paymentRef?: string;
  branchId: string;
  branchName: string;
  status: 'completed' | 'voided';
  voidReason?: string;
  voidAt?: string;
  notes?: string;
  totalHPP: number; // for exact profit calculation
  netProfit: number;
}

export interface StockMovement {
  id: string;
  date: string;
  medicineId: string;
  medicineName: string;
  type: 'in' | 'out' | 'adjustment';
  qtyChange: number; // positive or negative in base unit
  unit: string;
  previousStock: number;
  currentStock: number;
  refNumber: string; // e.g. INV-... or PO-...
  notes: string;
  operator: string;
}

export interface Supplier {
  id: string;
  name: string;
  code: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  paymentTerms: string;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  date: string;
  supplierId: string;
  supplierName: string;
  items: {
    medicineId: string;
    medicineName: string;
    unit: string;
    qty: number;
    unitCost: number;
    batchNumber: string;
    expiredDate: string;
    subtotal: number;
  }[];
  totalAmount: number;
  status: 'received' | 'pending';
  receivedAt?: string;
  notes?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  allergies?: string;
  totalTransactions: number;
  totalSpent: number;
  registeredDate: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  details: string;
  type: 'auth' | 'sale' | 'stock' | 'system' | 'void';
}

export interface PharmacySettings {
  pharmacyName: string;
  pharmacyTagline: string;
  address: string;
  city: string;
  phone: string;
  siaNumber: string; // Surat Izin Apotek
  sipaNumber: string; // Surat Izin Praktik Apoteker
  pharmacistName: string;
  printerPaperWidth: '58mm' | '80mm';
  taxRate: number; // e.g. 11%
  enableTax: boolean;
  receiptFooter: string;
  activeBranch: string;
  branches: { id: string; name: string; address: string }[];
  transactionLimit: number; // e.g. 150 trial / plan
}
