import { BookOpenText, HandCoins, Package, Settings as SettingsIcon, X } from "lucide-react";
import { Page } from "../../types";

interface MoreSheetProps {
  open: boolean;
  onClose: () => void;
  onNavigate: (page: Page) => void;
}

const items: { id: Page; label: string; icon: typeof BookOpenText; desc: string }[] = [
  { id: "hisaab", label: "Today's Hisaab", icon: BookOpenText, desc: "Full daily summary" },
  { id: "udhaar", label: "Udhaar", icon: HandCoins, desc: "Customer credit records" },
  { id: "items", label: "Items", icon: Package, desc: "Manage products & prices" },
  { id: "settings", label: "Settings", icon: SettingsIcon, desc: "Cafe name, backup & more" },
];

export function MoreSheet({ open, onClose, onNavigate }: MoreSheetProps) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-end bg-stone-900/50 backdrop-blur-sm lg:hidden animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full rounded-t-3xl bg-white p-5 pb-8 shadow-2xl animate-modal-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-stone-900">More Options</h3>
          <button onClick={onClose} className="rounded-full p-2 text-stone-400 hover:bg-stone-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  onClose();
                }}
                className="flex flex-col items-start gap-2 rounded-2xl border border-stone-200 bg-stone-50 p-4 text-left active:scale-[0.98]"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="text-sm font-bold text-stone-800">{item.label}</p>
                <p className="text-xs text-stone-500">{item.desc}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
