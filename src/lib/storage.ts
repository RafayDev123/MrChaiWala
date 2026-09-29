import { AppData } from "../types";
import { buildDefaultData } from "./seed";

const STORAGE_KEY = "mrchaiwala.data.v1";

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const fresh = buildDefaultData();
      saveData(fresh);
      return fresh;
    }
    const parsed = JSON.parse(raw) as AppData;
    if (!validateAppData(parsed)) {
      throw new Error("Invalid data shape");
    }
    return parsed;
  } catch (err) {
    console.error("Failed to load local data, starting fresh.", err);
    const fresh = buildDefaultData();
    saveData(fresh);
    return fresh;
  }
}

export function saveData(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error("Failed to save data locally", err);
    throw new Error(
      "Something went wrong while saving your data. Please free up space or try again."
    );
  }
}

export function validateAppData(data: unknown): data is AppData {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  return (
    Array.isArray(d.categories) &&
    Array.isArray(d.expenseCategories) &&
    Array.isArray(d.products) &&
    Array.isArray(d.sales) &&
    Array.isArray(d.expenses) &&
    Array.isArray(d.udhaar) &&
    Array.isArray(d.closings) &&
    typeof d.settings === "object" &&
    d.settings !== null
  );
}

export function exportBackupFile(data: AppData): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const stamp = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `Mr-Chai-Wala-Backup-${stamp}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function readBackupFile(file: File): Promise<AppData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (!validateAppData(parsed)) {
          reject(new Error("This backup file does not look like a valid Mr Chai Wala backup."));
          return;
        }
        resolve(parsed);
      } catch {
        reject(new Error("This file could not be read. Please choose a valid backup file."));
      }
    };
    reader.onerror = () => reject(new Error("Could not read the selected file."));
    reader.readAsText(file);
  });
}
