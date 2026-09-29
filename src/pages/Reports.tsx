import { useMemo, useState } from "react";
import { FileBarChart, Eye, FileSpreadsheet, FileText, CheckCircle2 } from "lucide-react";
import { isWithinInterval, parseISO, startOfMonth, startOfWeek, subDays } from "date-fns";
import { useApp } from "../context/AppContext";
import { useToast } from "../components/ui/Toast";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { EmptyState } from "../components/ui/EmptyState";
import { formatCurrency } from "../lib/money";
import { formatDateKeyLong, todayKey } from "../lib/date";
import { computeDayTotals } from "../lib/aggregate";
import { downloadDailyExcel } from "../lib/export/excel";
import { downloadDailyPdf } from "../lib/export/pdf";
import { cn } from "../utils/cn";

type FilterMode = "all" | "today" | "yesterday" | "week" | "month" | "custom";

interface ReportRow {
  key: string;
  dateKey: string;
  totals: ReturnType<typeof computeDayTotals>;
}

export function Reports() {
  const { data } = useApp();
  const toast = useToast();
  const [filter, setFilter] = useState<FilterMode>("all");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [viewingReport, setViewingReport] = useState<ReportRow | null>(null);

  const reportRows = useMemo(() => {
    const rows: ReportRow[] = data.closings.map((closing, index) => ({
      key: closing.id ?? `${closing.dateKey}-closed-${index}`,
      dateKey: closing.dateKey,
      totals: closing.report ?? { ...computeDayTotals(data, closing.dateKey), isClosed: true },
    }));
    const activeDateKeys = new Set([
      ...data.sales.map((sale) => sale.dateKey),
      ...data.expenses.map((expense) => expense.dateKey),
    ]);
    for (const dateKey of activeDateKeys) {
      const hasSnapshot = data.closings.some((closing) => closing.dateKey === dateKey && closing.report);
      const hasLegacyClosing = data.closings.some((closing) => closing.dateKey === dateKey);
      if (!hasLegacyClosing || hasSnapshot) {
        rows.push({ key: `${dateKey}-active`, dateKey, totals: computeDayTotals(data, dateKey) });
      }
    }
    return rows.sort((a, b) =>
      a.dateKey === b.dateKey ? (a.key < b.key ? 1 : -1) : a.dateKey < b.dateKey ? 1 : -1
    );
  }, [data]);

  const today = todayKey();

  const filteredRows = useMemo(() => {
    if (filter === "all") return reportRows;
    return reportRows.filter(({ dateKey }) => {
      const d = parseISO(dateKey);
      if (filter === "today") return dateKey === today;
      if (filter === "yesterday") return dateKey === subDays(parseISO(today), 1).toISOString().slice(0, 10);
      if (filter === "week")
        return isWithinInterval(d, { start: startOfWeek(parseISO(today)), end: parseISO(today) });
      if (filter === "month")
        return isWithinInterval(d, { start: startOfMonth(parseISO(today)), end: parseISO(today) });
      if (filter === "custom" && customFrom && customTo) {
        return isWithinInterval(d, { start: parseISO(customFrom), end: parseISO(customTo) });
      }
      return true;
    });
  }, [filter, reportRows, today, customFrom, customTo]);

  const viewingTotals = viewingReport?.totals ?? null;

  const handleExcel = (totals: ReportRow["totals"]) => {
    try {
      const fileName = downloadDailyExcel(totals, data.settings.cafeName);
      toast?.show(`Excel report saved: ${fileName}`, "success");
    } catch {
      toast?.show("Could not generate the Excel report. Please try again.", "error");
    }
  };

  const handlePdf = (totals: ReportRow["totals"]) => {
    try {
      const fileName = downloadDailyPdf(totals, data.settings.cafeName, data.settings.subtitle);
      toast?.show(`PDF report saved: ${fileName}`, "success");
    } catch {
      toast?.show("Could not generate the PDF report. Please try again.", "error");
    }
  };

  return (
    <div className="space-y-6">
      <Card className="flex flex-wrap items-center gap-2">
        {(
          [
            ["all", "All Time"],
            ["today", "Today"],
            ["yesterday", "Yesterday"],
            ["week", "This Week"],
            ["month", "This Month"],
            ["custom", "Custom Range"],
          ] as [FilterMode, string][]
        ).map(([mode, label]) => (
          <button
            key={mode}
            onClick={() => setFilter(mode)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold transition-all",
              filter === mode
                ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            )}
          >
            {label}
          </button>
        ))}
        {filter === "custom" && (
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="rounded-lg border border-stone-200 px-3 py-1.5 text-sm"
            />
            <span className="text-stone-400">to</span>
            <input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              className="rounded-lg border border-stone-200 px-3 py-1.5 text-sm"
            />
          </div>
        )}
      </Card>

      {filteredRows.length === 0 ? (
        <EmptyState
          icon={FileBarChart}
          title="No reports for this period"
          message="Once you record sales or expenses, a daily report will appear here automatically."
        />
      ) : (
        <div className="space-y-3">
          {filteredRows.map(({ key, dateKey, totals }) => {
            const isArchived = totals.isClosed;
            return (
              <Card key={key} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-display text-base font-bold text-stone-900">
                      {formatDateKeyLong(dateKey)}
                    </p>
                    {isArchived && (
                      <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                        <CheckCircle2 className="h-3 w-3" /> Closed
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-stone-500">
                    Sales <span className="font-semibold text-stone-800">{formatCurrency(totals.totalSales)}</span>
                    {" · "}Expenses <span className="font-semibold text-stone-800">{formatCurrency(totals.totalExpenses)}</span>
                    {" · "}Net <span className="font-semibold text-emerald-700">{formatCurrency(totals.netHisaab)}</span>
                  </p>
                </div>
                <div className="flex gap-2">
                      <Button variant="secondary" size="sm" onClick={() => setViewingReport({ key, dateKey, totals })}>
                    <Eye className="h-4 w-4" /> View
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleExcel(totals)}>
                    <FileSpreadsheet className="h-4 w-4" /> Excel
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handlePdf(totals)}>
                    <FileText className="h-4 w-4" /> PDF
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        open={!!viewingReport}
        onClose={() => setViewingReport(null)}
        title={viewingReport ? formatDateKeyLong(viewingReport.dateKey) : ""}
        subtitle="Full daily report"
        maxWidth="max-w-lg"
      >
        {viewingTotals && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <MiniStat label="Total Sales" value={formatCurrency(viewingTotals.totalSales)} />
              <MiniStat label="Total Expenses" value={formatCurrency(viewingTotals.totalExpenses)} />
              <MiniStat label="Net Hisaab" value={formatCurrency(viewingTotals.netHisaab)} />
              <MiniStat label="Total Orders" value={String(viewingTotals.totalOrders)} />
            </div>
            <div>
              <p className="mb-2 text-sm font-bold text-stone-700">Sales Breakdown</p>
              <ul className="space-y-1.5 text-sm">
                {Object.values(viewingTotals.categoryTotals).map((c) => (
                  <li key={c.name} className="flex justify-between text-stone-600">
                    <span>{c.name} × {c.qty}</span>
                    <span className="font-semibold">{formatCurrency(c.total)}</span>
                  </li>
                ))}
                {Object.keys(viewingTotals.categoryTotals).length === 0 && (
                  <li className="text-stone-400">No sales.</li>
                )}
              </ul>
            </div>
            <div>
              <p className="mb-2 text-sm font-bold text-stone-700">Expense Breakdown</p>
              <ul className="space-y-1.5 text-sm">
                {Object.values(viewingTotals.expenseTotals).map((c) => (
                  <li key={c.name} className="flex justify-between text-stone-600">
                    <span>{c.name}</span>
                    <span className="font-semibold">{formatCurrency(c.total)}</span>
                  </li>
                ))}
                {Object.keys(viewingTotals.expenseTotals).length === 0 && (
                  <li className="text-stone-400">No expenses.</li>
                )}
              </ul>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" fullWidth onClick={() => handleExcel(viewingTotals!)}>
                <FileSpreadsheet className="h-4 w-4" /> Excel
              </Button>
              <Button variant="outline" fullWidth onClick={() => handlePdf(viewingTotals!)}>
                <FileText className="h-4 w-4" /> PDF
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-stone-50 p-3">
      <p className="text-xs text-stone-500">{label}</p>
      <p className="text-base font-bold text-stone-900">{value}</p>
    </div>
  );
}
