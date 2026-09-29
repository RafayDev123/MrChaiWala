// Safe money helpers - avoid floating point drift by working in paisa (integer)
// All amounts in the app are treated as whole/decimal rupees but math is done
// via integer cents (paisa) internally to keep totals accurate.

export function toPaisa(rupees: number): number {
  return Math.round((rupees || 0) * 100);
}

export function toRupees(paisa: number): number {
  return Math.round(paisa) / 100;
}

export function sumRupees(values: number[]): number {
  const totalPaisa = values.reduce((acc, v) => acc + toPaisa(v), 0);
  return toRupees(totalPaisa);
}

export function multiplyRupees(price: number, qty: number): number {
  return toRupees(toPaisa(price) * qty);
}

export function formatCurrency(amount: number, symbol = "Rs."): string {
  const safe = Number.isFinite(amount) ? amount : 0;
  const rounded = Math.round(safe);
  return `${symbol} ${rounded.toLocaleString("en-PK")}`;
}

export function clampNonNegative(n: number): number {
  if (!Number.isFinite(n) || n < 0) return 0;
  return n;
}
