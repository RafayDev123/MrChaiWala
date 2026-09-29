import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Coffee } from "lucide-react";

interface TopBarProps {
  title: string;
  subtitle?: string;
  cafeName: string;
}

export function TopBar({ title, subtitle, cafeName }: TopBarProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-stone-200 bg-white/80 px-4 py-4 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md shadow-orange-900/20 lg:hidden">
          <Coffee className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-display text-lg font-bold text-stone-900 sm:text-xl">{title}</h1>
          {subtitle && <p className="text-xs text-stone-500 sm:text-sm">{subtitle}</p>}
        </div>
      </div>
      <div className="hidden text-right sm:block">
        <p className="text-sm font-semibold text-stone-700">{format(now, "d MMMM yyyy")}</p>
        <p className="text-xs text-stone-400">{format(now, "h:mm a")}</p>
      </div>
      <div className="text-right sm:hidden">
        <p className="text-xs font-semibold text-stone-600">{format(now, "d MMM")}</p>
        <p className="text-[10px] text-stone-400">{format(now, "h:mm a")}</p>
      </div>
      <span className="hidden text-xs font-medium text-stone-400 lg:inline">{cafeName}</span>
    </header>
  );
}
