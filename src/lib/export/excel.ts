import * as XLSX from "xlsx";
import { DayTotals } from "../../types";
import { formatDateKeyLong } from "../date";

export function buildDailyExcel(totals: DayTotals, cafeName: string) {
  const wb = XLSX.utils.book_new();

  const header = [
    [cafeName.toUpperCase()],
    ["Daily Hisaab Report"],
    [`Date: ${formatDateKeyLong(totals.dateKey)}`],
    [],
  ];

  const salesRows = [
    ["Item", "Quantity", "Total (Rs.)"],
    ...Object.values(totals.categoryTotals).map((c) => [c.name, c.qty, c.total]),
    [],
    ["Total Sales", "", totals.totalSales],
  ];

  const expenseRows = [
    ["Expense", "Amount (Rs.)"],
    ...Object.values(totals.expenseTotals).map((e) => [e.name, e.total]),
    [],
    ["Total Expenses", totals.totalExpenses],
  ];

  const paymentRows = [
    ["Payment Method", "Amount (Rs.)"],
    ["Cash Sales", totals.cashSales],
    ["Udhaar Sales", totals.udhaarSales],
    ["Total Sales", totals.totalSales],
  ];

  const finalRows = [
    ["Final Summary", ""],
    ["Total Sales", totals.totalSales],
    ["Total Expenses", totals.totalExpenses],
    ["Net Hisaab", totals.netHisaab],
    ["Total Orders", totals.totalOrders],
  ];

  const sheetData = [
    ...header,
    ["SALES SUMMARY"],
    ...salesRows,
    [],
    ["EXPENSE SUMMARY"],
    ...expenseRows,
    [],
    ["PAYMENT SUMMARY"],
    ...paymentRows,
    [],
    ...finalRows,
  ];

  const ws = XLSX.utils.aoa_to_sheet(sheetData);
  ws["!cols"] = [{ wch: 26 }, { wch: 16 }, { wch: 16 }];
  XLSX.utils.book_append_sheet(wb, ws, "Daily Hisaab");

  return wb;
}

export function downloadDailyExcel(totals: DayTotals, cafeName: string) {
  const wb = buildDailyExcel(totals, cafeName);
  const fileName = `Mr-Chai-Wala-${totals.dateKey}.xlsx`;
  XLSX.writeFile(wb, fileName);
  return fileName;
}
