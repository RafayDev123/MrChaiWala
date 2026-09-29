import { useMemo, useState, type ReactNode } from "react";
import { Plus, Pencil, Trash2, Package, PowerOff, Power } from "lucide-react";
import { useApp } from "../context/AppContext";
import { useToast } from "../components/ui/Toast";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { EmptyState } from "../components/ui/EmptyState";
import { formatCurrency, clampNonNegative } from "../lib/money";
import { Product } from "../types";
import { cn } from "../utils/cn";

interface FormState {
  name: string;
  code: string;
  price: string;
  categoryId: string;
  description: string;
}

const emptyForm: FormState = { name: "", code: "", price: "", categoryId: "", description: "" };

export function Items() {
  const { data, addProduct, updateProduct, deleteProduct, addCategory } = useApp();
  const toast = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const categoryName = (id: string) => data.categories.find((c) => c.id === id)?.name ?? "Uncategorised";

  const filteredProducts = useMemo(() => {
    if (filterCategory === "all") return data.products;
    return data.products.filter((p) => p.categoryId === filterCategory);
  }, [data.products, filterCategory]);

  const openAdd = () => {
    setEditingId(null);
    setForm({ ...emptyForm, categoryId: data.categories[0]?.id ?? "" });
    setModalOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      code: product.code,
      price: String(product.price),
      categoryId: product.categoryId,
      description: product.description ?? "",
    });
    setModalOpen(true);
  };

  const saveProduct = () => {
    const price = clampNonNegative(parseFloat(form.price));
    if (!form.name.trim() || !form.code.trim() || price <= 0 || !form.categoryId) {
      toast?.show("Please fill item name, code, a valid price and category.", "error");
      return;
    }
    const codeUsed = data.products.some(
      (p) => p.code.toLowerCase() === form.code.trim().toLowerCase() && p.id !== editingId
    );
    if (codeUsed) {
      toast?.show("This shortcut code is already used by another item.", "error");
      return;
    }

    if (editingId) {
      updateProduct(editingId, {
        name: form.name.trim(),
        code: form.code.trim().toUpperCase(),
        price,
        categoryId: form.categoryId,
        description: form.description.trim() || undefined,
      });
      toast?.show("Item updated successfully ✓", "success");
    } else {
      addProduct({
        name: form.name.trim(),
        code: form.code.trim().toUpperCase(),
        price,
        categoryId: form.categoryId,
        description: form.description.trim() || undefined,
        enabled: true,
      });
      toast?.show("New item added to your POS screen ✓", "success");
    }
    setModalOpen(false);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteProduct(deleteTarget.id);
    toast?.show(`"${deleteTarget.name}" was removed.`, "success");
    setDeleteTarget(null);
  };

  const toggleEnabled = (product: Product) => {
    updateProduct(product.id, { enabled: !product.enabled });
    toast?.show(
      product.enabled ? `${product.name} hidden from POS.` : `${product.name} is now visible on POS.`,
      "info"
    );
  };

  const saveCategory = () => {
    if (!newCatName.trim()) return;
    addCategory(newCatName.trim());
    toast?.show(`"${newCatName.trim()}" category added.`, "success");
    setNewCatName("");
    setCatModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterCategory("all")}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold transition-all",
              filterCategory === "all" ? "bg-orange-600 text-white shadow-md" : "bg-stone-100 text-stone-600"
            )}
          >
            All ({data.products.length})
          </button>
          {data.categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold transition-all",
                filterCategory === cat.id ? "bg-orange-600 text-white shadow-md" : "bg-stone-100 text-stone-600"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setCatModalOpen(true)}>
            <Plus className="h-4 w-4" /> Category
          </Button>
          <Button onClick={openAdd}>
            <Plus className="h-4 w-4" /> Add Item
          </Button>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No items yet"
          message="Add your first item, e.g. Chicken Roll, with a code and price. It will instantly appear on the POS screen."
          action={
            <Button onClick={openAdd}>
              <Plus className="h-4 w-4" /> Add Item
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <Card key={product.id} className={cn("flex flex-col gap-3", !product.enabled && "opacity-60")}>
              <div className="flex items-start justify-between">
                <div>
                  <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-700">
                    {product.code}
                  </span>
                  <h4 className="mt-1.5 font-display text-base font-bold text-stone-900">{product.name}</h4>
                  <p className="text-xs text-stone-500">{categoryName(product.categoryId)}</p>
                </div>
                <p className="text-lg font-extrabold text-orange-700">{formatCurrency(product.price)}</p>
              </div>
              {product.description && <p className="text-xs text-stone-500">{product.description}</p>}
              <div className="mt-1 flex gap-2 border-t border-stone-100 pt-3">
                <Button variant="ghost" size="sm" onClick={() => openEdit(product)}>
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </Button>
                <Button variant="ghost" size="sm" onClick={() => toggleEnabled(product)}>
                  {product.enabled ? (
                    <>
                      <PowerOff className="h-3.5 w-3.5" /> Disable
                    </>
                  ) : (
                    <>
                      <Power className="h-3.5 w-3.5" /> Enable
                    </>
                  )}
                </Button>
                <Button variant="ghost" size="sm" className="!text-rose-500" onClick={() => setDeleteTarget(product)}>
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Edit Item" : "Add New Item"}
      >
        <div className="space-y-4">
          <Field label="Name">
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Chicken Roll"
              className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Shortcut Code">
              <input
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                placeholder="e.g. R1"
                className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm uppercase focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
              />
            </Field>
            <Field label="Price (Rs.)">
              <input
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                inputMode="decimal"
                placeholder="e.g. 180"
                className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
              />
            </Field>
          </div>
          <Field label="Category">
            <select
              value={form.categoryId}
              onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
              className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
            >
              {data.categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Description (optional)">
            <input
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="e.g. Served with sauce"
              className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
            />
          </Field>
          <Button size="lg" fullWidth onClick={saveProduct}>
            {editingId ? "Save Changes" : "Add Item"}
          </Button>
        </div>
      </Modal>

      <Modal open={catModalOpen} onClose={() => setCatModalOpen(false)} title="New Category">
        <div className="space-y-4">
          <Field label="Category Name">
            <input
              autoFocus
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="e.g. Desserts"
              className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
            />
          </Field>
          <Button size="lg" fullWidth onClick={saveCategory}>
            Add Category
          </Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this item?"
        message={`"${deleteTarget?.name}" will be permanently removed from your item list and POS screen. Past sales records will not be affected.`}
        confirmLabel="Delete Item"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
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
