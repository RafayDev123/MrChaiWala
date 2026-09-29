import { useMemo, useState } from "react";
import { HandCoins, CheckCircle2, Clock } from "lucide-react";
import { useApp } from "../context/AppContext";
import { useToast } from "../components/ui/Toast";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { EmptyState } from "../components/ui/EmptyState";
import { formatCurrency } from "../lib/money";
import { formatDateKeyShort } from "../lib/date";
import { UdhaarRecord } from "../types";
import { cn } from "../utils/cn";

export function Udhaar() {
  const { data, markUdhaarPaid } = useApp();
  const toast = useToast();
  const [tab, setTab] = useState<"unpaid" | "paid">("unpaid");
  const [confirmTarget, setConfirmTarget] = useState<UdhaarRecord | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");

  const records = useMemo(
    () =>
      [...data.udhaar]
        .filter((u) => u.status === tab)
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
    [data.udhaar, tab]
  );

  const totalOutstanding = useMemo(
    () =>
      data.udhaar
        .filter((u) => u.status === "unpaid")
        .reduce((total, record) => total + record.amount - (record.paidAmount ?? 0), 0),
    [data.udhaar]
  );

  const confirmPaid = () => {
    if (!confirmTarget) return;
    const remaining = confirmTarget.amount - (confirmTarget.paidAmount ?? 0);
    const amount = Number(paymentAmount);
    if (!Number.isFinite(amount) || amount <= 0 || amount > remaining) {
      toast?.show(`Enter an amount from 1 to ${formatCurrency(remaining)}.`, "error");
      return;
    }
    markUdhaarPaid(confirmTarget.id, amount);
    toast?.show(
      amount === remaining
        ? `Udhaar from ${confirmTarget.customerName} fully paid ✓`
        : `Payment recorded. ${formatCurrency(remaining - amount)} remains due.`,
      "success"
    );
    setConfirmTarget(null);
    setPaymentAmount("");
  };

  return (
    <div className="space-y-6">
      <Card className="flex items-center justify-between bg-gradient-to-br from-amber-500 to-orange-600 text-white">
        <div>
          <p className="text-sm text-orange-50/90">Total Outstanding Udhaar</p>
          <p className="font-display mt-1 text-3xl font-extrabold">{formatCurrency(totalOutstanding)}</p>
        </div>
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
          <HandCoins className="h-7 w-7" />
        </div>
      </Card>

      <div className="flex gap-2">
        <button
          onClick={() => setTab("unpaid")}
          className={cn(
            "rounded-full px-4 py-2 text-sm font-semibold transition-all",
            tab === "unpaid" ? "bg-orange-600 text-white shadow-md" : "bg-stone-100 text-stone-600"
          )}
        >
          Unpaid
        </button>
        <button
          onClick={() => setTab("paid")}
          className={cn(
            "rounded-full px-4 py-2 text-sm font-semibold transition-all",
            tab === "paid" ? "bg-orange-600 text-white shadow-md" : "bg-stone-100 text-stone-600"
          )}
        >
          Paid
        </button>
      </div>

      {records.length === 0 ? (
        <EmptyState
          icon={HandCoins}
          title={tab === "unpaid" ? "No outstanding udhaar" : "No paid udhaar yet"}
          message={
            tab === "unpaid"
              ? "When you record a sale as Udhaar on the New Sale screen, it will show up here."
              : "Udhaar marked as paid will appear here for your records."
          }
        />
      ) : (
        <div className="space-y-2.5">
          {records.map((record) => (
            <Card key={record.id} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-2xl",
                    record.status === "paid" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                  )}
                >
                  {record.status === "paid" ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <Clock className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <p className="font-bold text-stone-800">{record.customerName}</p>
                  <p className="text-xs text-stone-500">{formatDateKeyShort(record.dateKey)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-lg font-extrabold text-stone-900">
                    {formatCurrency(record.status === "unpaid" ? record.amount - (record.paidAmount ?? 0) : record.amount)}
                  </p>
                  {record.status === "unpaid" && record.paidAmount ? (
                    <p className="text-xs text-stone-500">Remaining</p>
                  ) : null}
                </div>
                {record.status === "unpaid" && (
                  <Button size="sm" variant="success" onClick={() => {
                    setConfirmTarget(record);
                    setPaymentAmount(String(record.amount - (record.paidAmount ?? 0)));
                  }}>
                    Add Payment
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={!!confirmTarget}
        title="Record Udhaar Payment"
        subtitle={confirmTarget?.customerName}
        onClose={() => setConfirmTarget(null)}
      >
        <p className="text-sm text-stone-600">
          Remaining balance: <strong>{formatCurrency(
            (confirmTarget?.amount ?? 0) - (confirmTarget?.paidAmount ?? 0)
          )}</strong>
        </p>
        <label className="mt-4 block text-sm font-semibold text-stone-700" htmlFor="udhaar-payment">
          Amount received
        </label>
        <input
          id="udhaar-payment"
          type="number"
          min="1"
          max={(confirmTarget?.amount ?? 0) - (confirmTarget?.paidAmount ?? 0)}
          step="1"
          inputMode="decimal"
          value={paymentAmount}
          onChange={(event) => setPaymentAmount(event.target.value)}
          className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
        />
        <div className="mt-5 flex gap-3">
          <Button variant="secondary" fullWidth onClick={() => setConfirmTarget(null)}>
            Cancel
          </Button>
          <Button fullWidth onClick={confirmPaid}>Save Payment</Button>
        </div>
      </Modal>
    </div>
  );
}
