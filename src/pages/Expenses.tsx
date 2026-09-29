import { useMemo, useState } from "react";
import {
  Milk,
  Flame,
  Snowflake,
  Droplet,
  Leaf,
  Candy,
  Flower2,
  Receipt,
  Plus,
  Wallet,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { useToast } from "../components/ui/Toast";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { EmptyState } from "../components/ui/EmptyState";
import { formatCurrency, clampNonNegative } from "../lib/money";
import { todayKey, formatTime } from "../lib/date";

const iconMap: Record<string, typeof Milk> = {
  milk: Milk,
  flame: Flame,
  snowflake: Snowflake,
  droplet: Droplet,
  leaf: Leaf,
  candy: Candy,
  flower: Flower2,
  receipt: Receipt,
};

export function Expenses() {
  const { data, addExpense, addExpenseCategory } = useApp();
  const toast = useToast();
  const dateKey = todayKey();

  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [addCatOpen, setAddCatOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");

  const todayExpenses = useMemo(
    () => data.expenses.filter((e) => e.dateKey === dateKey).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
    [data.expenses, dateKey]
  );

  const totalToday = todayExpenses.reduce((a, e) => a + e.amount, 0);
  const activeCategory = data.expenseCategories.find((c) => c.id === activeCategoryId);

  const openExpense = (categoryId: string) => {
    setActiveCategoryId(categoryId);
    setAmount("");
    setNote("");
  };

  const saveExpense = () => {
    const value = clampNonNegative(parseFloat(amount));
    if (!activeCategoryId || value <= 0) {
      toast?.show("Please enter a valid amount greater than 0.", "error");
      return;
    }
    addExpense(activeCategoryId, value, note.trim() || undefined);
    toast?.show(`${activeCategory?.name} expense of ${formatCurrency(value)} added.`, "success");
    setActiveCategoryId(null);
  };

  const saveCategory = () => {
    if (!newCatName.trim()) return;
    addExpenseCategory(newCatName.trim());
    toast?.show(`"${newCatName.trim()}" expense category added.`, "success");
    setNewCatName("");
    setAddCatOpen(false);
  };

  return (
    <div className="space-y-6">
      <Card className="flex items-center justify-between bg-gradient-to-br from-rose-500 to-red-600 text-white">
        <div>
          <p className="text-sm text-red-50/90">Total Expenses Today</p>
          <p className="font-display mt-1 text-3xl font-extrabold">{formatCurrency(totalToday)}</p>
        </div>
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
          <Wallet className="h-7 w-7" />
        </div>
      </Card>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-stone-900">Add an Expense</h3>
          <Button variant="ghost" size="sm" onClick={() => setAddCatOpen(true)}>
            <Plus className="h-4 w-4" /> New Category
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {data.expenseCategories.map((cat) => {
            const Icon = iconMap[cat.icon ?? "receipt"] ?? Receipt;
            return (
              <button
                key={cat.id}
                onClick={() => openExpense(cat.id)}
                className="flex flex-col items-center gap-2 rounded-2xl border-2 border-stone-200 bg-white p-5 shadow-sm transition-all hover:border-amber-300 active:scale-95"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                  <Icon className="h-6 w-6" />
                </div>
                <span className="text-sm font-bold text-stone-800">{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="font-display mb-3 text-lg font-bold text-stone-900">Today's Expenses</h3>
        {todayExpenses.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="No expenses recorded yet"
            message="Tap a category above like Milk or Gas to record today's expense in seconds."
          />
        ) : (
          <div className="space-y-2">
            {todayExpenses.map((exp) => {
              const cat = data.expenseCategories.find((c) => c.id === exp.categoryId);
              const Icon = iconMap[cat?.icon ?? "receipt"] ?? Receipt;
              return (
                <Card key={exp.id} className="flex items-center gap-4 !p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-stone-800">{exp.categoryName}</p>
                    {exp.note && <p className="truncate text-xs text-stone-500">{exp.note}</p>}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-rose-600">{formatCurrency(exp.amount)}</p>
                    <p className="text-xs text-stone-400">{formatTime(exp.createdAt)}</p>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Modal
        open={!!activeCategoryId}
        onClose={() => setActiveCategoryId(null)}
        title={`${activeCategory?.name ?? ""} Expense`}
        subtitle="Recorded with today's date and time automatically."
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-stone-600">Amount</label>
            <input
              autoFocus
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              inputMode="decimal"
              placeholder="e.g. 2500"
              className="w-full rounded-xl border border-stone-200 px-4 py-3 text-lg font-bold focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-stone-600">Note (optional)</label>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. 5 litres from Ali Dairy"
              className="w-full rounded-xl border border-stone-200 px-4 py-3 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
            />
          </div>
          <Button size="lg" fullWidth onClick={saveExpense}>
            Save Expense
          </Button>
        </div>
      </Modal>

      <Modal open={addCatOpen} onClose={() => setAddCatOpen(false)} title="New Expense Category">
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-stone-600">Category Name</label>
            <input
              autoFocus
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="e.g. Rent"
              className="w-full rounded-xl border border-stone-200 px-4 py-3 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
            />
          </div>
          <Button size="lg" fullWidth onClick={saveCategory}>
            Add Category
          </Button>
        </div>
      </Modal>
    </div>
  );
}
