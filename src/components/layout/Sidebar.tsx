import {
  LayoutDashboard,
  ShoppingCart,
  Wallet,
  BookOpenText,
  FileBarChart,
  Package,
  Settings as SettingsIcon,
  Coffee,
  HandCoins,
} from "lucide-react";
import { Page } from "../../types";
import { cn } from "../../utils/cn";

interface NavItem {
  id: Page;
  label: string;
  icon: typeof LayoutDashboard;
}

export const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "sale", label: "New Sale", icon: ShoppingCart },
  { id: "expenses", label: "Expenses", icon: Wallet },
  { id: "hisaab", label: "Today's Hisaab", icon: BookOpenText },
  { id: "udhaar", label: "Udhaar", icon: HandCoins },
  { id: "reports", label: "Reports", icon: FileBarChart },
  { id: "items", label: "Items", icon: Package },
  { id: "settings", label: "Settings", icon: SettingsIcon },
];

interface SidebarProps {
  current: Page;
  onNavigate: (page: Page) => void;
  cafeName: string;
}

export function Sidebar({ current, onNavigate, cafeName }: SidebarProps) {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-stone-200 bg-white/80 px-4 py-6 backdrop-blur-sm lg:flex">
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-orange-900/20">
          <Coffee className="h-6 w-6" />
        </div>
        <div>
          <p className="font-display text-base font-bold leading-tight text-stone-900">{cafeName}</p>
          <p className="text-xs text-stone-500">Cafe & Hisaab</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = current === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3.5 py-3 text-left text-sm font-semibold transition-all",
                active
                  ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md shadow-orange-900/20"
                  : "text-stone-600 hover:bg-stone-100"
              )}
            >
              <Icon className={cn("h-5 w-5", active ? "text-white" : "text-stone-400")} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="rounded-2xl bg-stone-50 p-3 text-center text-xs text-stone-400">
        Works fully offline. Your data stays on this computer.
      </div>
    </aside>
  );
}
