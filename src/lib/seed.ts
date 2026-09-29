import { AppData, Category, ExpenseCategory, Product } from "../types";
import { newId } from "./id";
import { nowIso } from "./date";

export function buildDefaultData(): AppData {
  const now = nowIso();

  const categories: Category[] = [
    { id: newId("cat"), name: "Chai", createdAt: now },
    { id: newId("cat"), name: "Fries", createdAt: now },
    { id: newId("cat"), name: "Fast Food", createdAt: now },
    { id: newId("cat"), name: "Drinks", createdAt: now },
    { id: newId("cat"), name: "Snacks", createdAt: now },
    { id: newId("cat"), name: "Other", createdAt: now },
  ];

  const chai = categories[0].id;
  const fries = categories[1].id;

  const products: Product[] = [
    { id: newId("prod"), code: "C1", name: "Cut Chai", price: 60, categoryId: chai, enabled: true, createdAt: now },
    { id: newId("prod"), code: "C2", name: "Full Chai", price: 90, categoryId: chai, enabled: true, createdAt: now },
    { id: newId("prod"), code: "C3", name: "Chai", price: 100, categoryId: chai, enabled: true, createdAt: now },
    { id: newId("prod"), code: "C4", name: "Special Chai", price: 150, categoryId: chai, enabled: true, createdAt: now },
    { id: newId("prod"), code: "F1", name: "Fries", price: 70, categoryId: fries, enabled: true, createdAt: now },
    { id: newId("prod"), code: "F2", name: "Fries", price: 100, categoryId: fries, enabled: true, createdAt: now },
    { id: newId("prod"), code: "F3", name: "Masala Fries", price: 150, categoryId: fries, enabled: true, createdAt: now },
  ];

  const expenseCategories: ExpenseCategory[] = [
    { id: newId("exp"), name: "Milk", icon: "milk", createdAt: now },
    { id: newId("exp"), name: "Gas", icon: "flame", createdAt: now },
    { id: newId("exp"), name: "Ice", icon: "snowflake", createdAt: now },
    { id: newId("exp"), name: "Water", icon: "droplet", createdAt: now },
    { id: newId("exp"), name: "Tea", icon: "leaf", createdAt: now },
    { id: newId("exp"), name: "Sugar", icon: "candy", createdAt: now },
    { id: newId("exp"), name: "Masala", icon: "flower", createdAt: now },
    { id: newId("exp"), name: "Other", icon: "receipt", createdAt: now },
  ];

  return {
    version: 1,
    settings: {
      cafeName: "Mr Chai Wala",
      subtitle: "Cafe Sales & Daily Hisaab",
      currencySymbol: "Rs.",
      exportFolderLabel: "Documents/Mr Chai Wala/Daily Hisaab",
      theme: "cafe",
      setupCompleted: false,
    },
    categories,
    expenseCategories,
    products,
    sales: [],
    expenses: [],
    udhaar: [],
    closings: [],
  };
}
