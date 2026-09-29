import { useState } from "react";
import { Coffee, ArrowRight } from "lucide-react";
import { useApp } from "../context/AppContext";
import { Button } from "../components/ui/Button";

export function FirstLaunch() {
  const { completeSetup } = useApp();
  const [cafeName, setCafeName] = useState("Mr Chai Wala");
  const [currencySymbol, setCurrencySymbol] = useState("Rs.");
  const [exportFolder, setExportFolder] = useState("Documents/Mr Chai Wala/Daily Hisaab");

  const start = () => {
    completeSetup({
      cafeName: cafeName.trim() || "Mr Chai Wala",
      currencySymbol: currencySymbol.trim() || "Rs.",
      exportFolderLabel: exportFolder.trim() || "Documents/Mr Chai Wala/Daily Hisaab",
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-stone-100 p-4">
      <div className="w-full max-w-md rounded-3xl border border-white bg-white/90 p-8 shadow-2xl shadow-orange-900/10 backdrop-blur">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-orange-900/30">
            <Coffee className="h-8 w-8" />
          </div>
          <h1 className="font-display text-2xl font-extrabold text-stone-900">
            Welcome to Mr Chai Wala ☕
          </h1>
          <p className="mt-1.5 text-sm text-stone-500">
            Let's set up your cafe in a few seconds. No technical steps needed.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-stone-600">Cafe Name</label>
            <input
              value={cafeName}
              onChange={(e) => setCafeName(e.target.value)}
              className="w-full rounded-xl border border-stone-200 px-4 py-3 text-base font-medium focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-stone-600">Currency</label>
            <input
              value={currencySymbol}
              onChange={(e) => setCurrencySymbol(e.target.value)}
              className="w-full rounded-xl border border-stone-200 px-4 py-3 text-base font-medium focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-stone-600">
              Default Export Folder
            </label>
            <input
              value={exportFolder}
              onChange={(e) => setExportFolder(e.target.value)}
              className="w-full rounded-xl border border-stone-200 px-4 py-3 text-sm text-stone-600 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
            />
          </div>
        </div>

        <Button size="lg" fullWidth className="mt-7" onClick={start}>
          Start Using Mr Chai Wala <ArrowRight className="h-5 w-5" />
        </Button>
        <p className="mt-4 text-center text-xs text-stone-400">
          Works fully offline. Your sales and hisaab stay safely on this computer.
        </p>
      </div>
    </div>
  );
}
