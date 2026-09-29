import { useMemo, useState } from "react";
import { CalendarCheck, TrendingUp, Wallet, Receipt, ShoppingBag, Lock, CheckCircle2 } from "lucide-react";
import { useApp } from "../context/AppContext";
import { useToast } from "../components/ui/Toast";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { formatCurrency } from "../lib/money";
import { todayKey, formatDateKeyLong } from "../lib/date";
import { computeDayTotals } from "../lib/aggregate";
import { downloadDailyPdf } from "../lib/export/pdf";

export function TodayHisaab() {
  const { data, closeDay } = useApp();
  const toast = useToast();
  const dateKey = todayKey();
  const totals = useMemo(() => computeDayTotals(data, dateKey), [data, dateKey]);
  const [closeOpen, setCloseOpen] = useState(false);

  const handleCloseDay = () => {
    try {
      downloadDailyPdf(totals, data.settings.cafeName, data.settings.subtitle);
      closeDay(dateKey);
      toast?.show("Day closed and report generated successfully ✓", "success");
      setCloseOpen(false);
    } catch (err) {
      console.error(err);
      toast?.show("Something went wrong while generating the report. Please try again.", "error");
    }
  };

  return (
    <div className="space-y-6">
      <Card className="flex flex-wrap items-center justify-between gap-4 bg-gradient-to-br from-stone-800 to-stone-900 text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
            <CalendarCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-stone-300">Today's Hisaab</p>
            <p className="font-display text-lg font-bold">{formatDateKeyLong(dateKey)}</p>
          </div>
        </div>
        {totals.isClosed ? (
          <span className="flex items-center gap-2 rounded-full bg-emerald-500/20 px-4 py-2 text-sm font-semibold text-emerald-300">
            <CheckCircle2 className="h-4 w-4" /> Day Closed
          </span>
        ) : (
          <Button variant="success" onClick={() => setCloseOpen(true)}>
            <Lock className="h-4 w-4" /> Close Day
          </Button>
        )}
      </Card>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat icon={TrendingUp} label="Total Sales" value={formatCurrency(totals.totalSales)} color="text-emerald-600 bg-emerald-100" />
        <Stat icon={Wallet} label="Total Expenses" value={formatCurrency(totals.totalExpenses)} color="text-rose-600 bg-rose-100" />
        <Stat icon={Receipt} label="Net Hisaab" value={formatCurrency(totals.netHisaab)} color="text-amber-600 bg-amber-100" />
        <Stat icon={ShoppingBag} label="Total Orders" value={String(totals.totalOrders)} color="text-sky-600 bg-sky-100" />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <h3 className="font-display mb-4 text-lg font-bold text-stone-900">Sales Breakdown</h3>
          {Object.keys(totals.categoryTotals).length === 0 ? (
            <p className="text-sm text-stone-500">No sales recorded yet today.</p>
          ) : (
            <ul className="space-y-3">
              {Object.values(totals.categoryTotals)
                .sort((a, b) => b.total - a.total)
                .map((item) => (
                  <li key={item.name} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-stone-800">{item.name}</p>
                      <p className="text-xs text-stone-500">{item.qty} sold</p>
                    </div>
                    <p className="font-bold text-emerald-600">{formatCurrency(item.total)}</p>
                  </li>
                ))}
            </ul>
          )}
        </Card>

        <Card>
          <h3 className="font-display mb-4 text-lg font-bold text-stone-900">Expense Breakdown</h3>
          {Object.keys(totals.expenseTotals).length === 0 ? (
            <p className="text-sm text-stone-500">No expenses recorded yet today.</p>
          ) : (
            <ul className="space-y-3">
              {Object.values(totals.expenseTotals)
                .sort((a, b) => b.total - a.total)
                .map((item) => (
                  <li key={item.name} className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-stone-800">{item.name}</p>
                    <p className="font-bold text-rose-600">{formatCurrency(item.total)}</p>
                  </li>
                ))}
            </ul>
          )}
        </Card>
      </div>

      <Card className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-stone-500">Payment Split</p>
          <p className="text-sm text-stone-600">
            Cash: <span className="font-bold text-stone-900">{formatCurrency(totals.cashSales)}</span> &middot; Udhaar:{" "}
            <span className="font-bold text-stone-900">{formatCurrency(totals.udhaarSales)}</span>
          </p>
        </div>
      </Card>

      <Modal
        open={closeOpen}
        onClose={() => setCloseOpen(false)}
        title="Close Today's Day"
        subtitle="This saves today's report and resets the active sales and expense totals."
      >
        <div className="space-y-3 rounded-2xl bg-stone-50 p-4">
          <Row label="Today's Sales" value={formatCurrency(totals.totalSales)} />
          <Row label="Today's Expenses" value={formatCurrency(totals.totalExpenses)} />
          <Row label="Today's Net Hisaab" value={formatCurrency(totals.netHisaab)} bold />
          <Row label="Today's Orders" value={String(totals.totalOrders)} />
        </div>
        <p className="mt-4 text-xs text-stone-500">
          Closing saves this report and resets today's active sales and expenses. Historical reports
          and Udhaar balances are kept.
        </p>
        <Button size="lg" fullWidth className="mt-5" onClick={handleCloseDay}>
          Close Day & Generate Report
        </Button>
      </Modal>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-stone-500">{label}</span>
      <span className={bold ? "text-lg font-extrabold text-stone-900" : "font-semibold text-stone-800"}>
        {value}
      </span>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof TrendingUp;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <Card>
      <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-xs font-medium text-stone-500">{label}</p>
      <p className="mt-1 text-xl font-extrabold text-stone-900">{value}</p>
    </Card>
  );
}
