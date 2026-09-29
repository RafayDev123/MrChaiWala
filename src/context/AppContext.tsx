import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  AppData,
  Category,
  Expense,
  ExpenseCategory,
  Product,
  Sale,
  Settings,
  UdhaarRecord,
} from "../types";
import { loadData, saveData } from "../lib/storage";
import { newId } from "../lib/id";
import { nowIso, todayKey } from "../lib/date";
import { sumRupees } from "../lib/money";
import { computeDayTotals } from "../lib/aggregate";
import { useToast } from "../components/ui/Toast";

interface NewSalePayload {
  items: { productId: string; code: string; name: string; price: number; qty: number }[];
  paymentMethod: "cash" | "udhaar";
  receivedAmount?: number;
  customerName?: string;
}

interface AppContextValue {
  data: AppData;
  addSale: (payload: NewSalePayload) => Sale;
  addExpense: (categoryId: string, amount: number, note?: string) => Expense;
  addProduct: (product: Omit<Product, "id" | "createdAt">) => void;
  updateProduct: (id: string, patch: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addCategory: (name: string) => Category;
  addExpenseCategory: (name: string) => ExpenseCategory;
  deleteCategory: (id: string) => void;
  deleteExpenseCategory: (id: string) => void;
  markUdhaarPaid: (id: string, paidAmount: number) => void;
  closeDay: (dateKey: string) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  completeSetup: (settings: Partial<Settings>) => void;
  restoreData: (next: AppData) => void;
  resetAllData: () => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(() => loadData());
  const toast = useToast();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    try {
      saveData(data);
    } catch (err) {
      toast?.show((err as Error).message ?? "Could not save data.", "error");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const addSale: AppContextValue["addSale"] = (payload) => {
    const total = sumRupees(payload.items.map((i) => i.price * i.qty));
    const sale: Sale = {
      id: newId("sale"),
      items: payload.items,
      total,
      paymentMethod: payload.paymentMethod,
      receivedAmount: payload.receivedAmount,
      changeAmount:
        payload.paymentMethod === "cash" && payload.receivedAmount !== undefined
          ? sumRupees([payload.receivedAmount, -total])
          : undefined,
      customerName: payload.customerName,
      createdAt: nowIso(),
      dateKey: todayKey(),
    };

    setData((prev) => {
      const next: AppData = { ...prev, sales: [...prev.sales, sale] };
      if (payload.paymentMethod === "udhaar") {
        const record: UdhaarRecord = {
          id: newId("udhaar"),
          saleId: sale.id,
          customerName: payload.customerName?.trim() || "Unknown Customer",
          amount: total,
          status: "unpaid",
          createdAt: sale.createdAt,
          dateKey: sale.dateKey,
        };
        next.udhaar = [...prev.udhaar, record];
      }
      return next;
    });

    return sale;
  };

  const addExpense: AppContextValue["addExpense"] = (categoryId, amount, note) => {
    const cat = data.expenseCategories.find((c) => c.id === categoryId);
    const expense: Expense = {
      id: newId("exp"),
      categoryId,
      categoryName: cat?.name ?? "Other",
      amount,
      note,
      createdAt: nowIso(),
      dateKey: todayKey(),
    };
    setData((prev) => ({ ...prev, expenses: [...prev.expenses, expense] }));
    return expense;
  };

  const addProduct: AppContextValue["addProduct"] = (product) => {
    setData((prev) => ({
      ...prev,
      products: [...prev.products, { ...product, id: newId("prod"), createdAt: nowIso() }],
    }));
  };

  const updateProduct: AppContextValue["updateProduct"] = (id, patch) => {
    setData((prev) => ({
      ...prev,
      products: prev.products.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }));
  };

  const deleteProduct: AppContextValue["deleteProduct"] = (id) => {
    setData((prev) => ({ ...prev, products: prev.products.filter((p) => p.id !== id) }));
  };

  const addCategory: AppContextValue["addCategory"] = (name) => {
    const category: Category = { id: newId("cat"), name: name.trim(), createdAt: nowIso() };
    setData((prev) => ({ ...prev, categories: [...prev.categories, category] }));
    return category;
  };

  const addExpenseCategory: AppContextValue["addExpenseCategory"] = (name) => {
    const category: ExpenseCategory = { id: newId("exp"), name: name.trim(), createdAt: nowIso() };
    setData((prev) => ({ ...prev, expenseCategories: [...prev.expenseCategories, category] }));
    return category;
  };

  const deleteCategory: AppContextValue["deleteCategory"] = (id) => {
    setData((prev) => ({ ...prev, categories: prev.categories.filter((c) => c.id !== id) }));
  };

  const deleteExpenseCategory: AppContextValue["deleteExpenseCategory"] = (id) => {
    setData((prev) => ({
      ...prev,
      expenseCategories: prev.expenseCategories.filter((c) => c.id !== id),
    }));
  };

  const markUdhaarPaid: AppContextValue["markUdhaarPaid"] = (id, paidAmount) => {
    setData((prev) => ({
      ...prev,
      udhaar: prev.udhaar.map((record) => {
        if (record.id !== id) return record;
        const alreadyPaid = record.paidAmount ?? (record.status === "paid" ? record.amount : 0);
        const remaining = Math.max(0, sumRupees([record.amount, -alreadyPaid]));
        const nextPaid = sumRupees([alreadyPaid, Math.min(remaining, Math.max(0, paidAmount))]);
        const isPaid = nextPaid >= record.amount;
        return {
          ...record,
          paidAmount: nextPaid,
          status: isPaid ? "paid" : "unpaid",
          paidAt: isPaid ? nowIso() : undefined,
        };
      }),
    }));
  };

  const closeDay: AppContextValue["closeDay"] = (dateKey) => {
    setData((prev) => {
      const report = { ...computeDayTotals(prev, dateKey), isClosed: true };
      const legacyClosingIndex = prev.closings.findIndex(
        (closing) => closing.dateKey === dateKey && !closing.report
      );
      const closing = {
        id: newId("closing"),
        dateKey,
        closedAt: nowIso(),
        totalSales: report.totalSales,
        totalExpenses: report.totalExpenses,
        netHisaab: report.netHisaab,
        totalOrders: report.totalOrders,
        cashSales: report.cashSales,
        udhaarSales: report.udhaarSales,
        report,
      };
      return {
        ...prev,
        sales: prev.sales.filter((sale) => sale.dateKey !== dateKey),
        expenses: prev.expenses.filter((expense) => expense.dateKey !== dateKey),
        closings:
          legacyClosingIndex >= 0
            ? prev.closings.map((entry, index) =>
                index === legacyClosingIndex ? { ...entry, report } : entry
              )
            : [...prev.closings, closing],
      };
    });
  };

  const updateSettings: AppContextValue["updateSettings"] = (patch) => {
    setData((prev) => ({ ...prev, settings: { ...prev.settings, ...patch } }));
  };

  const completeSetup: AppContextValue["completeSetup"] = (settings) => {
    setData((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...settings, setupCompleted: true },
    }));
  };

  const restoreData: AppContextValue["restoreData"] = (next) => {
    setData(next);
  };

  const resetAllData: AppContextValue["resetAllData"] = () => {
    setData((prev) => ({
      ...prev,
      sales: [],
      expenses: [],
      udhaar: [],
      closings: [],
    }));
  };

  const value = useMemo<AppContextValue>(
    () => ({
      data,
      addSale,
      addExpense,
      addProduct,
      updateProduct,
      deleteProduct,
      addCategory,
      addExpenseCategory,
      deleteCategory,
      deleteExpenseCategory,
      markUdhaarPaid,
      closeDay,
      updateSettings,
      completeSetup,
      restoreData,
      resetAllData,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
