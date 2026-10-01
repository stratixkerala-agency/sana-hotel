import { useEffect, useMemo, useState } from "react";
import { Search, Plus, Minus, Trash2, Printer, Loader2 } from "lucide-react";
import { food, categories, orders } from "../lib/api";
import { printOrder } from "../lib/printer";
import type { FoodItem, Category } from "../types";
import toast from "react-hot-toast";

export interface BillLine {
  foodItemId: string;
  name: string;
  price: number;
  quantity: number;
}

interface Props {
  mode: "DINE_IN" | "TAKEAWAY";
  tableNumber?: string;
  lines: BillLine[];
  onLinesChange: (lines: BillLine[]) => void;
  onOrderPlaced?: (order: any) => void;
}

export default function POSBilling({ mode, tableNumber, lines, onLinesChange, onOrderPlaced }: Props) {
  const [menu, setMenu] = useState<FoodItem[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [placing, setPlacing] = useState(false);
  const [lastOrder, setLastOrder] = useState<any>(null);

  useEffect(() => {
    Promise.all([food.adminList(), categories.adminList()])
      .then(([foodRes, catRes]) => {
        const items = (foodRes as any).items || foodRes;
        setMenu(Array.isArray(items) ? items.filter((f: FoodItem) => f.isAvailable) : []);
        setCats(Array.isArray(catRes) ? catRes : []);
      })
      .catch(() => toast.error("Failed to load menu"));
  }, []);

  const filtered = useMemo(() => {
    return menu.filter((f) => {
      if (catFilter && (f.category?.slug || (f as any).categoryId) !== catFilter && f.categoryId !== catFilter) return false;
      if (search && !f.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [menu, search, catFilter]);

  const addItem = (item: FoodItem) => {
    const existing = lines.find((l) => l.foodItemId === item.id);
    if (existing) {
      onLinesChange(lines.map((l) => l.foodItemId === item.id ? { ...l, quantity: l.quantity + 1 } : l));
    } else {
      onLinesChange([...lines, { foodItemId: item.id, name: item.name, price: item.price, quantity: 1 }]);
    }
  };

  const setQty = (id: string, qty: number) => {
    if (qty <= 0) {
      onLinesChange(lines.filter((l) => l.foodItemId !== id));
    } else {
      onLinesChange(lines.map((l) => l.foodItemId === id ? { ...l, quantity: qty } : l));
    }
  };

  const total = lines.reduce((s, l) => s + l.price * l.quantity, 0);

  const placeOrder = async () => {
    if (lines.length === 0) {
      toast.error("Add at least one item to the bill");
      return;
    }
    setPlacing(true);
    try {
      const order = await orders.adminPos({
        orderType: mode,
        tableNumber,
        customerName: customerName || undefined,
        items: lines.map((l) => ({ foodItemId: l.foodItemId, quantity: l.quantity })),
        paymentMethod,
      });
      toast.success(`Bill placed: ${order.orderNumber} - Rs. ${Number(order.total).toLocaleString()}`);
      setLastOrder(order);
      onLinesChange([]);
      setCustomerName("");
      onOrderPlaced?.(order);
    } catch (err: any) {
      toast.error(err.message || "Failed to place order");
    } finally {
      setPlacing(false);
    }
  };

  const handlePrint = async (order: any) => {
    try {
      const via = await printOrder(order);
      toast.success(via === "bluetooth" ? "Sent to Bluetooth printer" : "Print dialog opened");
    } catch (err: any) {
      toast.error(err.message || "Print failed");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Menu picker */}
      <div className="card">
        <div className="p-4 border-b border-gray-100 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search menu..." className="input pl-10 text-sm" />
          </div>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            <button onClick={() => setCatFilter("")} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${!catFilter ? "bg-primary-600 text-white" : "bg-gray-100 text-gray-600"}`}>All</button>
            {cats.map((c) => (
              <button key={c.id} onClick={() => setCatFilter(c.slug)} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${catFilter === c.slug ? "bg-primary-600 text-white" : "bg-gray-100 text-gray-600"}`}>{c.name}</button>
            ))}
          </div>
        </div>
        <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[440px] overflow-y-auto">
          {filtered.map((f) => (
            <button key={f.id} onClick={() => addItem(f)} className="flex items-center justify-between gap-2 p-3 rounded-xl border border-gray-100 hover:border-primary-300 hover:bg-primary-50/50 text-left transition-colors">
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{f.name}</div>
                <div className="text-xs text-primary-600 font-semibold">Rs. {f.price.toLocaleString()}</div>
              </div>
              <Plus className="w-4 h-4 text-primary-500 shrink-0" />
            </button>
          ))}
          {filtered.length === 0 && <div className="col-span-2 text-center text-gray-400 text-sm py-8">No items found</div>}
        </div>
      </div>

      {/* Bill */}
      <div className="card">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold">
            {mode === "DINE_IN" ? `Table ${tableNumber} - Bill` : "Takeaway - Bill"}
          </h3>
        </div>
        <div className="p-4 space-y-3">
          {lines.length === 0 ? (
            <div className="text-center text-gray-400 text-sm py-6">Tap menu items to add them to the bill</div>
          ) : (
            <div className="space-y-2 max-h-[220px] overflow-y-auto">
              {lines.map((l) => (
                <div key={l.foodItemId} className="flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{l.name}</div>
                    <div className="text-xs text-gray-400">Rs. {l.price.toLocaleString()} each</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setQty(l.foodItemId, l.quantity - 1)} className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center"><Minus className="w-3.5 h-3.5" /></button>
                    <span className="w-7 text-center text-sm font-bold">{l.quantity}</span>
                    <button onClick={() => setQty(l.foodItemId, l.quantity + 1)} className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center"><Plus className="w-3.5 h-3.5" /></button>
                  </div>
                  <div className="w-20 text-right text-sm font-semibold">Rs. {(l.price * l.quantity).toLocaleString()}</div>
                  <button onClick={() => setQty(l.foodItemId, 0)} className="p-1.5 text-gray-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Customer (optional)</label>
              <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="input text-sm" placeholder={mode === "DINE_IN" ? `Table ${tableNumber}` : "Walk-in name"} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Payment</label>
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="input text-sm">
                <option value="CASH">Cash</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="CARD">Card</option>
                <option value="EWALLET">E-Wallet</option>
              </select>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-3 flex items-center justify-between font-bold text-lg">
            <span>Total</span>
            <span className="text-primary-600">Rs. {total.toLocaleString()}</span>
          </div>

          <button onClick={placeOrder} disabled={placing || lines.length === 0} className="btn-primary w-full flex items-center justify-center gap-2">
            {placing && <Loader2 className="w-4 h-4 animate-spin" />}
            {placing ? "Placing..." : `Place Bill - Rs. ${total.toLocaleString()}`}
          </button>

          {lastOrder && (
            <button onClick={() => handlePrint(lastOrder)} className="btn-secondary w-full flex items-center justify-center gap-2 text-sm">
              <Printer className="w-4 h-4" /> Print Last Bill ({lastOrder.orderNumber})
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
