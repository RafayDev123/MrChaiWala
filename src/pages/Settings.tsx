import { useRef, useState, type ReactNode } from "react";
import { Save, Download, Upload, AlertTriangle, Coffee, FolderOpen, RotateCcw } from "lucide-react";
import { useApp } from "../context/AppContext";
import { useToast } from "../components/ui/Toast";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { exportBackupFile, readBackupFile } from "../lib/storage";

export function Settings() {
  const { data, updateSettings, restoreData, resetAllData } = useApp();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [cafeName, setCafeName] = useState(data.settings.cafeName);
  const [subtitle, setSubtitle] = useState(data.settings.subtitle);
  const [currencySymbol, setCurrencySymbol] = useState(data.settings.currencySymbol);
  const [exportFolder, setExportFolder] = useState(data.settings.exportFolderLabel);

  const [pendingRestore, setPendingRestore] = useState<null | (() => void)>(null);
  const [resetOpen, setResetOpen] = useState(false);

  const saveGeneral = () => {
    updateSettings({
      cafeName: cafeName.trim() || "Mr Chai Wala",
      subtitle: subtitle.trim() || "Cafe Sales & Daily Hisaab",
      currencySymbol: currencySymbol.trim() || "Rs.",
      exportFolderLabel: exportFolder.trim() || "Documents/Mr Chai Wala/Daily Hisaab",
    });
    toast?.show("Settings saved successfully ✓", "success");
  };

  const handleBackup = () => {
    try {
      exportBackupFile(data);
      toast?.show("Backup file downloaded successfully ✓", "success");
    } catch {
      toast?.show("Could not create a backup right now. Please try again.", "error");
    }
  };

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    readBackupFile(file)
      .then((parsed) => {
        setPendingRestore(() => () => {
          restoreData(parsed);
          toast?.show("Backup restored successfully ✓", "success");
        });
      })
      .catch((err: Error) => {
        toast?.show(err.message, "error");
      })
      .finally(() => {
        if (fileInputRef.current) fileInputRef.current.value = "";
      });
  };

  return (
    <div className="space-y-6">
      <Card>
        <h3 className="font-display mb-4 flex items-center gap-2 text-lg font-bold text-stone-900">
          <Coffee className="h-5 w-5 text-orange-600" /> Cafe Details
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Cafe Name">
            <input
              value={cafeName}
              onChange={(e) => setCafeName(e.target.value)}
              className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
            />
          </Field>
          <Field label="Subtitle">
            <input
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
            />
          </Field>
          <Field label="Currency Symbol">
            <input
              value={currencySymbol}
              onChange={(e) => setCurrencySymbol(e.target.value)}
              className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
            />
          </Field>
          <Field label="Reports Folder (label only)">
            <div className="relative">
              <FolderOpen className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <input
                value={exportFolder}
                onChange={(e) => setExportFolder(e.target.value)}
                className="w-full rounded-xl border border-stone-200 py-2.5 pl-10 pr-4 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
              />
            </div>
          </Field>
        </div>
        <Button className="mt-4" onClick={saveGeneral}>
          <Save className="h-4 w-4" /> Save Settings
        </Button>
      </Card>

      <Card>
        <h3 className="font-display mb-2 text-lg font-bold text-stone-900">Backup & Restore</h3>
        <p className="mb-4 text-sm text-stone-500">
          Your data lives only on this computer. Create a backup regularly and keep it somewhere safe
          (a USB drive or cloud folder) so you never lose your daily hisaab.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={handleBackup}>
            <Download className="h-4 w-4" /> Export Backup
          </Button>
          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4" /> Restore Backup
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={handleRestoreFile}
          />
        </div>
      </Card>

      <Card className="border-rose-200">
        <h3 className="font-display mb-2 flex items-center gap-2 text-lg font-bold text-rose-700">
          <AlertTriangle className="h-5 w-5" /> Danger Zone
        </h3>
        <p className="mb-4 text-sm text-stone-500">
          This will permanently erase all sales, expenses and udhaar history. Your items and
          categories will be kept. This cannot be undone — export a backup first.
        </p>
        <Button variant="danger" onClick={() => setResetOpen(true)}>
          <RotateCcw className="h-4 w-4" /> Reset Sales & Expenses Data
        </Button>
      </Card>

      <ConfirmDialog
        open={!!pendingRestore}
        title="Restore this backup?"
        message="Restoring will replace all current data (products, sales, expenses, udhaar) with the data from this backup file. This cannot be undone."
        confirmLabel="Yes, Restore Backup"
        danger
        onConfirm={() => {
          pendingRestore?.();
          setPendingRestore(null);
        }}
        onCancel={() => setPendingRestore(null)}
      />

      <ConfirmDialog
        open={resetOpen}
        title="Reset all sales & expenses?"
        message="All sales, expenses, udhaar and daily reports history will be permanently deleted. Products and categories will remain. Please make sure you have exported a backup."
        confirmLabel="Yes, Erase Everything"
        danger
        onConfirm={() => {
          resetAllData();
          toast?.show("All sales and expense data has been reset.", "success");
          setResetOpen(false);
        }}
        onCancel={() => setResetOpen(false)}
      />
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-stone-600">{label}</label>
      {children}
    </div>
  );
}
