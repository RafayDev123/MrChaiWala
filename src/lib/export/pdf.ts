import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { DayTotals } from "../../types";
import { formatDateKeyLong } from "../date";
import { formatCurrency } from "../money";

export function buildDailyPdf(totals: DayTotals, cafeName: string, subtitle: string) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFillColor(180, 83, 9); // amber-ish cafe brand color
  doc.rect(0, 0, pageWidth, 90, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text(cafeName.toUpperCase(), 40, 40);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(subtitle, 40, 58);
  doc.text(`Daily Hisaab Report - ${formatDateKeyLong(totals.dateKey)}`, 40, 75);

  doc.setTextColor(30, 30, 30);

  let y = 115;
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Sales Summary", 40, y);

  const salesBody = Object.values(totals.categoryTotals).map((c) => [
    c.name,
    String(c.qty),
    formatCurrency(c.total),
  ]);

  autoTable(doc, {
    startY: y + 10,
    head: [["Item", "Qty", "Total"]],
    body: salesBody.length ? salesBody : [["No sales yet", "-", "Rs. 0"]],
    theme: "striped",
    headStyles: { fillColor: [180, 83, 9] },
    margin: { left: 40, right: 40 },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable.finalY + 25;
  doc.setFont("helvetica", "bold");
  doc.text("Expense Summary", 40, y);

  const expenseBody = Object.values(totals.expenseTotals).map((e) => [
    e.name,
    formatCurrency(e.total),
  ]);

  autoTable(doc, {
    startY: y + 10,
    head: [["Expense", "Amount"]],
    body: expenseBody.length ? expenseBody : [["No expenses yet", "Rs. 0"]],
    theme: "striped",
    headStyles: { fillColor: [180, 83, 9] },
    margin: { left: 40, right: 40 },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable.finalY + 25;
  doc.setFont("helvetica", "bold");
  doc.text("Payment Summary", 40, y);

  autoTable(doc, {
    startY: y + 10,
    head: [["Method", "Amount"]],
    body: [
      ["Cash Sales", formatCurrency(totals.cashSales)],
      ["Udhaar Sales", formatCurrency(totals.udhaarSales)],
      ["Total Sales", formatCurrency(totals.totalSales)],
    ],
    theme: "striped",
    headStyles: { fillColor: [180, 83, 9] },
    margin: { left: 40, right: 40 },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable.finalY + 30;

  doc.setFillColor(255, 247, 237);
  doc.roundedRect(40, y, pageWidth - 80, 110, 8, 8, "F");
  doc.setTextColor(120, 53, 15);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("FINAL SUMMARY", 56, y + 26);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(`Total Sales: ${formatCurrency(totals.totalSales)}`, 56, y + 48);
  doc.text(`Total Expenses: ${formatCurrency(totals.totalExpenses)}`, 56, y + 66);
  doc.setFont("helvetica", "bold");
  doc.text(`Net Hisaab: ${formatCurrency(totals.netHisaab)}`, 56, y + 84);
  doc.setFont("helvetica", "normal");
  doc.text(`Total Orders: ${totals.totalOrders}`, 300, y + 48);

  return doc;
}

export function downloadDailyPdf(totals: DayTotals, cafeName: string, subtitle: string) {
  const doc = buildDailyPdf(totals, cafeName, subtitle);
  const fileName = `Mr-Chai-Wala-${totals.dateKey}.pdf`;
  doc.save(fileName);
  return fileName;
}
