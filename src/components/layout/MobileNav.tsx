import { LayoutDashboard, ShoppingCart, Wallet, FileBarChart, Menu } from "lucide-react";
import { Page } from "../../types";
import { cn } from "../../utils/cn";

interface MobileNavProps {
  current: Page;
  onNavigate: (page: Page) => void;
  onMore: () => void;
}

const items: { id: Page; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "Home", icon: LayoutDashboard },
  { id: "sale", label: "Sale", icon: ShoppingCart },
  { id: "expenses", label: "Expense", icon: Wallet },
  { id: "reports", label: "Reports", icon: FileBarChart },
];

export function MobileNav({ current, onNavigate, onMore }: MobileNavProps) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex items-stretch border-t border-stone-200 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgba(0,0,0,0.06)] backdrop-blur-sm lg:hidden">
      {items.map((item) => {
        const Icon = item.icon;
        const active = current === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 text-[11px] font-semibold transition-colors",
              active ? "text-orange-600" : "text-stone-400"
            )}
          >
            <Icon className="h-5 w-5" />
            {item.label}
          </button>
        );
      })}
      <button
        onClick={onMore}
        className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 text-[11px] font-semibold text-stone-400"
      >
        <Menu className="h-5 w-5" />
        More
      </button>
    </nav>
  );
}
