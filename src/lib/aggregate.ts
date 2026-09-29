import { AppData, DayTotals } from "../types";
import { sumRupees } from "./money";

export function computeDayTotals(data: AppData, dateKey: string): DayTotals {
  const sales = data.sales.filter((s) => s.dateKey === dateKey);
  const expenses = data.expenses.filter((e) => e.dateKey === dateKey);

  const totalSales = sumRupees(sales.map((s) => s.total));
  const totalExpenses = sumRupees(expenses.map((e) => e.amount));
  const cashSales = sumRupees(sales.filter((s) => s.paymentMethod === "cash").map((s) => s.total));
  const udhaarSales = sumRupees(
    sales.filter((s) => s.paymentMethod === "udhaar").map((s) => s.total)
  );

  const categoryTotals: DayTotals["categoryTotals"] = {};
  for (const sale of sales) {
    for (const item of sale.items) {
      const key = item.name;
      if (!categoryTotals[key]) {
        categoryTotals[key] = { name: item.name, qty: 0, total: 0 };
      }
      categoryTotals[key].qty += item.qty;
      categoryTotals[key].total = sumRupees([categoryTotals[key].total, item.price * item.qty]);
    }
  }

  const expenseTotals: DayTotals["expenseTotals"] = {};
  for (const exp of expenses) {
    const key = exp.categoryName;
    if (!expenseTotals[key]) {
      expenseTotals[key] = { name: exp.categoryName, total: 0 };
    }
    expenseTotals[key].total = sumRupees([expenseTotals[key].total, exp.amount]);
  }

  const isClosed =
    sales.length === 0 &&
    expenses.length === 0 &&
    data.closings.some((c) => c.dateKey === dateKey);

  return {
    dateKey,
    totalSales,
    totalExpenses,
    netHisaab: sumRupees([totalSales, -totalExpenses]),
    totalOrders: sales.length,
    cashSales,
    udhaarSales,
    categoryTotals,
    expenseTotals,
    isClosed,
  };
}

export interface CategoryBreakdownItem {
  categoryId: string;
  name: string;
  qty: number;
  total: number;
}

export function computeCategorySalesBreakdown(
  data: AppData,
  dateKey: string
): CategoryBreakdownItem[] {
  const sales = data.sales.filter((s) => s.dateKey === dateKey);
  const productMap = new Map(data.products.map((p) => [p.id, p]));
  const categoryMap = new Map(data.categories.map((c) => [c.id, c.name]));

  const breakdown = new Map<string, CategoryBreakdownItem>();
  for (const sale of sales) {
    for (const item of sale.items) {
      const product = productMap.get(item.productId);
      const categoryId = product?.categoryId ?? "unknown";
      const name = categoryMap.get(categoryId) ?? "Other";
      if (!breakdown.has(categoryId)) {
        breakdown.set(categoryId, { categoryId, name, qty: 0, total: 0 });
      }
      const entry = breakdown.get(categoryId)!;
      entry.qty += item.qty;
      entry.total = sumRupees([entry.total, item.price * item.qty]);
    }
  }
  return Array.from(breakdown.values()).sort((a, b) => b.total - a.total);
}

export function getUnclosedPastDays(data: AppData, todayKey: string): string[] {
  const dateKeys = new Set<string>();
  for (const s of data.sales) dateKeys.add(s.dateKey);
  for (const e of data.expenses) dateKeys.add(e.dateKey);
  const closedKeys = new Set(data.closings.map((c) => c.dateKey));
  return Array.from(dateKeys)
    .filter((k) => k !== todayKey && !closedKeys.has(k))
    .sort();
}
