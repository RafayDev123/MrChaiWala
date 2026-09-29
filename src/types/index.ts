// Core domain types for Mr Chai Wala POS
// Keeping everything strongly typed & modular for future extensibility.

export type Page =
  | "dashboard"
  | "sale"
  | "expenses"
  | "hisaab"
  | "udhaar"
  | "reports"
  | "items"
  | "settings";

export type PaymentMethod = "cash" | "udhaar";

export interface Category {
  id: string;
  name: string;
  createdAt: string;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  icon?: string;
  createdAt: string;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  price: number; // in whole rupees (integer)
  categoryId: string;
  description?: string;
  enabled: boolean;
  createdAt: string;
}

export interface SaleItem {
  productId: string;
  code: string;
  name: string;
  price: number;
  qty: number;
}

export interface Sale {
  id: string;
  items: SaleItem[];
  total: number;
  paymentMethod: PaymentMethod;
  receivedAmount?: number;
  changeAmount?: number;
  customerName?: string;
  createdAt: string; // ISO
  dateKey: string; // YYYY-MM-DD
}

export interface Expense {
  id: string;
  categoryId: string;
  categoryName: string;
  amount: number;
  note?: string;
  createdAt: string;
  dateKey: string;
}

export type UdhaarStatus = "unpaid" | "paid";

export interface UdhaarRecord {
  id: string;
  saleId: string;
  customerName: string;
  amount: number;
  paidAmount?: number;
  status: UdhaarStatus;
  createdAt: string;
  dateKey: string;
  paidAt?: string;
}

export interface DailyClosing {
  id?: string;
  dateKey: string;
  closedAt: string;
  totalSales: number;
  totalExpenses: number;
  netHisaab: number;
  totalOrders: number;
  cashSales: number;
  udhaarSales: number;
  report?: DayTotals;
}

export interface Settings {
  cafeName: string;
  subtitle: string;
  currencySymbol: string;
  exportFolderLabel: string;
  theme: "cafe";
  setupCompleted: boolean;
  lastOpenedDateKey?: string;
}

export interface AppData {
  version: number;
  settings: Settings;
  categories: Category[];
  expenseCategories: ExpenseCategory[];
  products: Product[];
  sales: Sale[];
  expenses: Expense[];
  udhaar: UdhaarRecord[];
  closings: DailyClosing[];
}

export interface DayTotals {
  dateKey: string;
  totalSales: number;
  totalExpenses: number;
  netHisaab: number;
  totalOrders: number;
  cashSales: number;
  udhaarSales: number;
  categoryTotals: Record<string, { name: string; qty: number; total: number }>;
  expenseTotals: Record<string, { name: string; total: number }>;
  isClosed: boolean;
}
