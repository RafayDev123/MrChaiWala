import { useMemo, useState } from "react";
import {
  Wallet,
  TrendingUp,
  ShoppingBag,
  Receipt,
  Banknote,
  HandCoins,
  Coffee,
  Sparkles,
  Plus,
  Minus,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { useToast } from "../components/ui/Toast";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { formatCurrency } from "../lib/money";
import { todayKey } from "../lib/date";
import { computeDayTotals, computeCategorySalesBreakdown } from "../lib/aggregate";
import { Page } from "../types";

interface DashboardProps {
  onNavigate: (page: Page) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { data, addSale } = useApp();
  const toast = useToast();
  const dateKey = todayKey();
  const totals = useMemo(() => computeDayTotals(data, dateKey), [data, dateKey]);
  const categoryBreakdown = useMemo(
    () => computeCategorySalesBreakdown(data, dateKey),
    [data, dateKey]
  );

  const chaiCategory = data.categories.find((c) => c.name.toLowerCase().includes("chai"));
  const friesCategory = data.categories.find((c) => c.name.toLowerCase().includes("fries"));
  const chaiOrders = categoryBreakdown.find((c) => c.categoryId === chaiCategory?.id)?.qty ?? 0;
  const friesOrders = categoryBreakdown.find((c) => c.categoryId === friesCategory?.id)?.qty ?? 0;
  const otherSales = categoryBreakdown
    .filter((c) => c.categoryId !== chaiCategory?.id && c.categoryId !== friesCategory?.id)
    .reduce((acc, c) => acc + c.total, 0);

  const quickProducts = useMemo(
    () => data.products.filter((p) => p.enabled).slice(0, 8),
    [data.products]
  );

  const [qty, setQty] = useState<Record<string, number>>({});

  const getQty = (id: string) => qty[id] ?? 1;
  const bump = (id: string, delta: number) => {
    setQty((prev) => ({ ...prev, [id]: Math.max(1, (prev[id] ?? 1) + delta) }));
  };

  const quickSell = (productId: string) => {
    const product = data.products.find((p) => p.id === productId);
    if (!product) return;
    const q = getQty(productId);
    addSale({
      items: [{ productId: product.id, code: product.code, name: product.name, price: product.price, qty: q }],
      paymentMethod: "cash",
      receivedAmount: product.price * q,
    });
    toast?.show(`${product.name} × ${q} sold for ${formatCurrency(product.price * q)} ✓`, "success");
    setQty((prev) => ({ ...prev, [productId]: 1 }));
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-gradient-to-br from-amber-500 via-orange-500 to-orange-700 p-6 text-white shadow-xl shadow-orange-900/20 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-sm font-medium text-orange-50/90">
              <Sparkles className="h-4 w-4" /> Welcome back to
            </p>
            <h2 className="font-display mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">
              {data.settings.cafeName.toUpperCase()}
            </h2>
            <p className="mt-1 text-orange-50/90">{data.settings.subtitle}</p>
          </div>
          <Button size="lg" variant="secondary" onClick={() => onNavigate("sale")} className="!text-orange-700">
            <ShoppingBag className="h-5 w-5" /> Start New Sale
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <SummaryCard
          icon={TrendingUp}
          label="Today's Sales"
          value={formatCurrency(totals.totalSales)}
          accent="from-emerald-500 to-green-600"
        />
        <SummaryCard
          icon={Wallet}
          label="Today's Expenses"
          value={formatCurrency(totals.totalExpenses)}
          accent="from-rose-500 to-red-600"
        />
        <SummaryCard
          icon={Receipt}
          label="Estimated Net Hisaab"
          value={formatCurrency(totals.netHisaab)}
          accent="from-amber-500 to-orange-600"
        />
        <SummaryCard
          icon={ShoppingBag}
          label="Total Orders"
          value={String(totals.totalOrders)}
          accent="from-sky-500 to-blue-600"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
            <Banknote className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-stone-500">Cash Sales</p>
            <p className="text-lg font-bold text-stone-900">{formatCurrency(totals.cashSales)}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
            <HandCoins className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-stone-500">Udhaar Sales</p>
            <p className="text-lg font-bold text-stone-900">{formatCurrency(totals.udhaarSales)}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-orange-700">
            <Coffee className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-stone-500">Chai / Fries / Other</p>
            <p className="text-sm font-bold text-stone-900">
              {chaiOrders} chai &middot; {friesOrders} fries &middot; {formatCurrency(otherSales)} other
            </p>
          </div>
        </Card>
      </div>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-display text-lg font-bold text-stone-900">Quick Sale</h3>
            <p className="text-sm text-stone-500">Tap an item to record an instant cash sale.</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => onNavigate("sale")}>
            Full POS Screen
          </Button>
        </div>
        {quickProducts.length === 0 ? (
          <p className="text-sm text-stone-500">Add items from the Items page to enable quick sale.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {quickProducts.map((product) => (
              <div
                key={product.id}
                className="flex flex-col rounded-2xl border border-stone-200 bg-stone-50 p-3 transition hover:border-amber-300 hover:bg-amber-50"
              >
                <span className="text-[11px] font-bold uppercase tracking-wide text-amber-600">
                  {product.code}
                </span>
                <span className="mt-0.5 text-sm font-bold text-stone-800 leading-tight">
                  {product.name}
                </span>
                <span className="mt-1 text-sm font-semibold text-orange-700">
                  {formatCurrency(product.price)}
                </span>
                <div className="mt-2 flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1 rounded-lg bg-white">
                    <button
                      onClick={() => bump(product.id, -1)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-stone-200 text-stone-500 active:scale-90"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-5 text-center text-sm font-bold">{getQty(product.id)}</span>
                    <button
                      onClick={() => bump(product.id, 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-stone-200 text-stone-500 active:scale-90"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <Button size="sm" onClick={() => quickSell(product.id)}>
                    Sell
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof Wallet;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <Card className="relative overflow-hidden">
      <div
        className={`absolute -right-4 -top-4 h-20 w-20 rounded-full bg-gradient-to-br ${accent} opacity-10`}
      />
      <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${accent} text-white shadow-md`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-xs font-medium text-stone-500">{label}</p>
      <p className="mt-1 text-xl font-extrabold text-stone-900 sm:text-2xl">{value}</p>
    </Card>
  );
}
