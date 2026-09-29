import { useMemo, useState } from "react";
import { CalendarClock, FileCheck2 } from "lucide-react";
import { useApp } from "../context/AppContext";
import { useToast } from "./ui/Toast";
import { Modal } from "./ui/Modal";
import { Button } from "./ui/Button";
import { getUnclosedPastDays, computeDayTotals } from "../lib/aggregate";
import { todayKey, formatDateKeyLong } from "../lib/date";
import { downloadDailyExcel } from "../lib/export/excel";
import { downloadDailyPdf } from "../lib/export/pdf";

export function PendingDaysModal() {
  const { data, closeDay } = useApp();
  const toast = useToast();
  const [dismissed, setDismissed] = useState(false);
  const [working, setWorking] = useState(false);

  const pendingDays = useMemo(() => getUnclosedPastDays(data, todayKey()), [data]);

  if (pendingDays.length === 0 || dismissed) return null;

  const generateAll = () => {
    setWorking(true);
    try {
      for (const dateKey of pendingDays) {
        const totals = computeDayTotals(data, dateKey);
        downloadDailyExcel(totals, data.settings.cafeName);
        downloadDailyPdf(totals, data.settings.cafeName, data.settings.subtitle);
        closeDay(dateKey);
      }
      toast?.show(`Generated ${pendingDays.length} missing daily report(s) ✓`, "success");
      setDismissed(true);
    } catch (err) {
      console.error(err);
      toast?.show("Could not generate one or more reports. Please try again from Reports.", "error");
    } finally {
      setWorking(false);
    }
  };

  return (
    <Modal
      open
      onClose={() => setDismissed(true)}
      title="Unfinished Daily Reports Found"
      subtitle="It looks like the app was closed before some earlier days were finalized."
    >
      <div className="flex items-start gap-3 rounded-2xl bg-amber-50 p-4">
        <CalendarClock className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
        <div className="text-sm text-stone-700">
          <p className="mb-1.5 font-semibold">Missing reports for:</p>
          <ul className="list-inside list-disc space-y-0.5 text-stone-600">
            {pendingDays.map((d) => (
              <li key={d}>{formatDateKeyLong(d)}</li>
            ))}
          </ul>
        </div>
      </div>
      <p className="mt-4 text-xs text-stone-500">
        Nothing will be deleted. This will simply generate the Excel & PDF reports for these days
        and mark them as closed, so your records stay complete.
      </p>
      <div className="mt-5 flex gap-3">
        <Button variant="secondary" fullWidth onClick={() => setDismissed(true)}>
          Remind Me Later
        </Button>
        <Button fullWidth disabled={working} onClick={generateAll}>
          <FileCheck2 className="h-4 w-4" /> Generate Reports Now
        </Button>
      </div>
    </Modal>
  );
}
