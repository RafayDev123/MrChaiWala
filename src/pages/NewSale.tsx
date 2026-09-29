import { useMemo, useState } from "react";
import {
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  Banknote,
  HandCoins,
  X,
  Search,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { useToast } from "../components/ui/Toast";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { EmptyState } from "../components/ui/EmptyState";
import { formatCurrency, clampNonNegative, sumRupees } from "../lib/money";
import { cn } from "../utils/cn";

interface CartLine {
  productId: string;
  code: string;
  name: string;
  price: number;
  qty: number;
}

export function NewSale() {
  const { data, addSale } = useApp();
  const toast = useToast();

  const activeCategories = useMemo(
    () => data.categories.filter((c) => data.products.some((p) => p.categoryId === c.id && p.enabled)),
    [data.categories, data.products]
  );

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [payOpen, setPayOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "udhaar">("cash");
  const [received, setReceived] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [mobileCartOpen, setMobileCartOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    return data.products.filter((p) => {
      if (!p.enabled) return false;
      if (selectedCategory !== "all" && p.categoryId !== selectedCategory) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        return p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q);
      }
      return true;
    });
  }, [data.products, selectedCategory, search]);

  const total = useMemo(() => sumRupees(cart.map((c) => c.price * c.qty)), [cart]);
  const receivedNum = clampNonNegative(parseFloat(received) || 0);
  const change = sumRupees([receivedNum, -total]);

  const addToCart = (productId: string) => {
    const product = data.products.find((p) => p.id === productId);
    if (!product) return;
    setCart((prev) => {
      const existing = prev.find((c) => c.productId === productId);
      if (existing) {
        return prev.map((c) => (c.productId === productId ? { ...c, qty: c.qty + 1 } : c));
      }
      return [...prev, { productId: product.id, code: product.code, name: product.name, price: product.price, qty: 1 }];
    });
  };

  const changeQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) => (c.productId === productId ? { ...c, qty: c.qty + delta } : c))
        .filter((c) => c.qty > 0)
    );
  };

  const setQtyDirect = (productId: string, qty: number) => {
    const safe = Math.max(0, Math.floor(qty) || 0);
    setCart((prev) =>
      safe === 0
        ? prev.filter((c) => c.productId !== productId)
        : prev.map((c) => (c.productId === productId ? { ...c, qty: safe } : c))
    );
  };

  const removeItem = (productId: string) => {
    setCart((prev) => prev.filter((c) => c.productId !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setReceived("");
    setCustomerName("");
    setPaymentMethod("cash");
  };

  const openPayment = () => {
    if (cart.length === 0) return;
    setReceived(String(total));
    setPayOpen(true);
  };

  const confirmSale = () => {
    if (cart.length === 0) return;
    if (paymentMethod === "udhaar" && !customerName.trim()) {
      toast?.show("Please enter the customer's name for udhaar.", "error");
      return;
    }
    if (paymentMethod === "cash" && receivedNum < total) {
      toast?.show("Received amount is less than the total.", "error");
      return;
    }

    addSale({
      items: cart.map((c) => ({ productId: c.productId, code: c.code, name: c.name, price: c.price, qty: c.qty })),
      paymentMethod,
      receivedAmount: paymentMethod === "cash" ? receivedNum : undefined,
      customerName: paymentMethod === "udhaar" ? customerName.trim() : undefined,
    });

    toast?.show("Sale saved successfully ✓", "success");
    setPayOpen(false);
    setMobileCartOpen(false);
    clearCart();
  };

  const cartPanel = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4">
        <h3 className="font-display flex items-center gap-2 text-lg font-bold text-stone-900">
          <ShoppingCart className="h-5 w-5 text-orange-600" /> Current Bill
        </h3>
        {cart.length > 0 && (
          <button
            onClick={clearCart}
            className="text-xs font-semibold text-rose-500 hover:text-rose-600"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-3">
        {cart.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center py-10 text-center">
            <ShoppingCart className="mb-3 h-10 w-10 text-stone-200" />
            <p className="text-sm font-medium text-stone-400">No items yet.</p>
            <p className="text-xs text-stone-400">Tap a product to add it here.</p>
          </div>
        ) : (
          <ul className="space-y-2.5">
            {cart.map((line) => (
              <li
                key={line.productId}
                className="flex items-center gap-3 rounded-2xl bg-stone-50 p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-stone-800">{line.name}</p>
                  <p className="text-xs text-stone-500">{formatCurrency(line.price)} each</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => changeQty(line.productId, -1)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-stone-200 bg-white text-stone-500 active:scale-90"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <input
                    value={line.qty}
                    onChange={(e) => setQtyDirect(line.productId, parseInt(e.target.value, 10) || 0)}
                    inputMode="numeric"
                    className="w-9 rounded-lg border border-stone-200 bg-white py-1 text-center text-sm font-bold"
                  />
                  <button
                    onClick={() => changeQty(line.productId, 1)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-stone-200 bg-white text-stone-500 active:scale-90"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
                <p className="w-16 shrink-0 text-right text-sm font-bold text-stone-800">
                  {formatCurrency(line.price * line.qty)}
                </p>
                <button
                  onClick={() => removeItem(line.productId)}
                  className="text-stone-300 hover:text-rose-500"
                  aria-label="Remove item"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="border-t border-stone-100 px-5 py-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-semibold text-stone-500">TOTAL</span>
          <span className="font-display text-3xl font-extrabold text-stone-900">
            {formatCurrency(total)}
          </span>
        </div>
        <Button size="lg" fullWidth disabled={cart.length === 0} onClick={openPayment}>
          Proceed to Payment
        </Button>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_380px]">
      <div>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search item name or code (e.g. C1)..."
              className="w-full rounded-2xl border border-stone-200 bg-white py-3 pl-10 pr-4 text-sm shadow-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
            />
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          <CategoryPill
            label="All Items"
            active={selectedCategory === "all"}
            onClick={() => setSelectedCategory("all")}
          />
          {activeCategories.map((cat) => (
            <CategoryPill
              key={cat.id}
              label={cat.name}
              active={selectedCategory === cat.id}
              onClick={() => setSelectedCategory(cat.id)}
            />
          ))}
        </div>

        {filteredProducts.length === 0 ? (
          <EmptyState
            icon={ShoppingCart}
            title="No items found"
            message="Try a different search, or add new items from the Items page."
          />
        ) : (
          <div className="grid grid-cols-2 gap-3 pb-24 sm:grid-cols-3 lg:grid-cols-4 lg:pb-0">
            {filteredProducts.map((product) => {
              const inCart = cart.find((c) => c.productId === product.id);
              return (
                <button
                  key={product.id}
                  onClick={() => addToCart(product.id)}
                  className={cn(
                    "group relative flex flex-col items-start rounded-2xl border-2 bg-white p-4 text-left shadow-sm transition-all active:scale-[0.97]",
                    inCart ? "border-amber-400 bg-amber-50/60" : "border-stone-200 hover:border-amber-300"
                  )}
                >
                  {inCart && (
                    <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-orange-600 text-xs font-bold text-white shadow-md">
                      {inCart.qty}
                    </span>
                  )}
                  <span className="rounded-md bg-stone-100 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-stone-500 group-hover:bg-amber-100 group-hover:text-amber-700">
                    {product.code}
                  </span>
                  <span className="mt-2 text-base font-bold leading-tight text-stone-900">
                    {product.name}
                  </span>
                  <span className="mt-2 text-lg font-extrabold text-orange-700">
                    {formatCurrency(product.price)}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="hidden rounded-3xl border border-stone-200 bg-white shadow-sm lg:block">
        {cartPanel}
      </div>

      {/* Mobile floating bar */}
      {cart.length > 0 && (
        <button
          onClick={() => setMobileCartOpen(true)}
          className="fixed inset-x-4 bottom-20 z-30 flex items-center justify-between rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-4 text-white shadow-xl shadow-orange-900/30 lg:hidden"
        >
          <span className="flex items-center gap-2 text-sm font-bold">
            <ShoppingCart className="h-5 w-5" /> {cart.reduce((a, c) => a + c.qty, 0)} items
          </span>
          <span className="font-display text-lg font-extrabold">{formatCurrency(total)}</span>
        </button>
      )}

      {mobileCartOpen && (
        <div className="fixed inset-0 z-40 flex flex-col bg-white lg:hidden">
          <div className="flex items-center justify-between border-b border-stone-100 px-4 py-3">
            <span className="font-display text-lg font-bold">Your Bill</span>
            <button onClick={() => setMobileCartOpen(false)} className="rounded-full p-2 hover:bg-stone-100">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-hidden">{cartPanel}</div>
        </div>
      )}

      <Modal open={payOpen} onClose={() => setPayOpen(false)} title="Complete Payment" subtitle={`Total: ${formatCurrency(total)}`}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setPaymentMethod("cash")}
              className={cn(
                "flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition",
                paymentMethod === "cash" ? "border-emerald-500 bg-emerald-50" : "border-stone-200"
              )}
            >
              <Banknote className={cn("h-7 w-7", paymentMethod === "cash" ? "text-emerald-600" : "text-stone-400")} />
              <span className="text-sm font-bold">CASH</span>
            </button>
            <button
              onClick={() => setPaymentMethod("udhaar")}
              className={cn(
                "flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition",
                paymentMethod === "udhaar" ? "border-amber-500 bg-amber-50" : "border-stone-200"
              )}
            >
              <HandCoins className={cn("h-7 w-7", paymentMethod === "udhaar" ? "text-amber-600" : "text-stone-400")} />
              <span className="text-sm font-bold">UDHAAR</span>
            </button>
          </div>

          {paymentMethod === "cash" ? (
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-stone-600">Received Amount</label>
              <input
                value={received}
                onChange={(e) => setReceived(e.target.value)}
                inputMode="decimal"
                className="w-full rounded-xl border border-stone-200 px-4 py-3 text-lg font-bold focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
              />
              <div className="mt-3 flex items-center justify-between rounded-xl bg-stone-50 px-4 py-3">
                <span className="text-sm font-medium text-stone-500">Change to return</span>
                <span className={cn("text-lg font-bold", change < 0 ? "text-rose-600" : "text-emerald-600")}>
                  {formatCurrency(Math.max(change, 0))}
                </span>
              </div>
            </div>
          ) : (
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-stone-600">Customer Name</label>
              <input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Ali"
                className="w-full rounded-xl border border-stone-200 px-4 py-3 text-lg font-medium focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
              />
              <p className="mt-2 text-xs text-stone-500">
                This amount will be saved in the Udhaar page until marked as paid.
              </p>
            </div>
          )}

          <Button size="lg" fullWidth onClick={confirmSale}>
            Confirm & Save Sale
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function CategoryPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full px-4 py-2 text-sm font-semibold transition-all",
        active
          ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md shadow-orange-900/20"
          : "bg-white text-stone-600 border border-stone-200 hover:border-amber-300"
      )}
    >
      {label}
    </button>
  );
}
