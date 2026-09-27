import { useEffect, useMemo, useState } from "react";
import { TrendingUp, TrendingDown, Wallet, Landmark, RefreshCw, Trash2, Plus } from "lucide-react";
import { orders, cash } from "../../lib/api";
import { PAYMENT_METHOD_LABELS, type CashEntry } from "../../types";
import toast from "react-hot-toast";

const RANGES = [
  { label: "Today", days: 1 },
  { label: "7 Days", days: 7 },
  { label: "30 Days", days: 30 },
];

const CATEGORIES = ["Sales", "Supplies", "Salary", "Rent", "Utilities", "Maintenance", "Other Income", "Other"];
const METHODS = ["CASH", "BANK_TRANSFER", "CARD", "EWALLET"];

function methodLabel(m: string) {
  return PAYMENT_METHOD_LABELS[m] || m;
}

export default function AdminFinancePage() {
  const [days, setDays] = useState(7);
  const [daily, setDaily] = useState<{ date: string; revenue: number; orders: number }[]>([]);
  const [payments, setPayments] = useState<{ method: string; orders: number; revenue: number }[]>([]);
  const [entries, setEntries] = useState<CashEntry[]>([]);
  const [totalIn, setTotalIn] = useState(0);
  const [totalOut, setTotalOut] = useState(0);
  const [loading, setLoading] = useState(true);

  // Add-entry form
  const [entryType, setEntryType] = useState<"IN" | "OUT">("IN");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Sales");
  const [method, setMethod] = useState("CASH");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const rangeParams = useMemo(() => {
    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - (days - 1));
    from.setHours(0, 0, 0, 0);
    return { from: from.toISOString(), to: to.toISOString() };
  }, [days]);

  const fetchAll = () => {
    setLoading(true);
    Promise.all([
      orders.adminDaily(days),
      orders.adminPayments(days),
      cash.list(rangeParams),
    ])
      .then(([dailyRes, payRes, cashRes]) => {
        setDaily(dailyRes.series);
        setPayments(payRes.breakdown);
        setEntries(cashRes.entries);
        setTotalIn(cashRes.totalIn);
        setTotalOut(cashRes.totalOut);
      })
      .catch(() => toast.error("Failed to load finance data"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, [days]);

  const salesRevenue = useMemo(() => daily.reduce((s, d) => s + d.revenue, 0), [daily]);
  const salesOrders = useMemo(() => daily.reduce((s, d) => s + d.orders, 0), [daily]);
  const maxRevenue = useMemo(() => Math.max(1, ...daily.map((d) => d.revenue)), [daily]);
  const payTotal = useMemo(() => payments.reduce((s, p) => s + p.revenue, 0), [payments]);
  const net = totalIn - totalOut;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseFloat(amount);
    if (!Number.isFinite(value) || value <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    setSaving(true);
    try {
      await cash.create({ type: entryType, amount: value, category, paymentMethod: method, note: note || undefined });
      toast.success(`Cash ${entryType === "IN" ? "in" : "out"} recorded`);
      setAmount("");
      setNote("");
      fetchAll();
    } catch (err: any) {
      toast.error(err.message || "Failed to record entry");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this entry?")) return;
    try {
      await cash.remove(id);
      toast.success("Entry deleted");
      fetchAll();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete");
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="font-display text-2xl font-bold">Finance</h1>
        <div className="flex items-center gap-2">
          <div className="flex bg-white border border-gray-200 rounded-xl p-1">
            {RANGES.map((r) => (
              <button
                key={r.days}
                onClick={() => setDays(r.days)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  days === r.days ? "bg-primary-500 text-white" : "text-gray-500 hover:text-gray-800"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <button onClick={fetchAll} className="btn-secondary text-sm !py-2 flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card p-6"><div className="skeleton h-20 w-full" /></div>
          ))}
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="card p-5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Sales Revenue</div>
                  <div className="text-xl font-bold">Rs. {salesRevenue.toLocaleString()}</div>
                  <div className="text-xs text-gray-400">{salesOrders} orders</div>
                </div>
              </div>
            </div>
            <div className="card p-5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Cash In</div>
                  <div className="text-xl font-bold text-blue-600">Rs. {totalIn.toLocaleString()}</div>
                  <div className="text-xs text-gray-400">manual entries</div>
                </div>
              </div>
            </div>
            <div className="card p-5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-red-100 text-red-600 rounded-xl flex items-center justify-center">
                  <TrendingDown className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Cash Out</div>
                  <div className="text-xl font-bold text-red-600">Rs. {totalOut.toLocaleString()}</div>
                  <div className="text-xs text-gray-400">expenses</div>
                </div>
              </div>
            </div>
            <div className="card p-5">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${net >= 0 ? "bg-emerald-100 text-emerald-600" : "bg-orange-100 text-orange-600"}`}>
                  <Landmark className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Net Cash</div>
                  <div className={`text-xl font-bold ${net >= 0 ? "text-emerald-600" : "text-orange-600"}`}>
                    Rs. {net.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-400">in minus out</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            {/* Daily sales chart */}
            <div className="card p-5">
              <h2 className="font-semibold mb-1">Daily Sales</h2>
              <p className="text-xs text-gray-400 mb-4">Revenue per day (excludes cancelled)</p>
              {daily.length === 0 ? (
                <div className="text-sm text-gray-400 text-center py-8">No sales in this period</div>
              ) : (
                <div className="flex items-end gap-1.5 h-44">
                  {daily.map((d) => (
                    <div key={d.date} className="flex-1 flex flex-col items-center gap-1 min-w-0" title={`${d.date}: Rs. ${d.revenue.toLocaleString()} (${d.orders} orders)`}>
                      <div className="text-[10px] font-medium text-gray-500 truncate">
                        {d.revenue > 0 ? `Rs.${d.revenue >= 1000 ? `${(d.revenue / 1000).toFixed(1)}k` : d.revenue}` : ""}
                      </div>
                      <div
                        className={`w-full rounded-t-lg transition-all ${d.revenue === maxRevenue && d.revenue > 0 ? "bg-primary-600" : "bg-primary-300"}`}
                        style={{ height: `${Math.max(4, (d.revenue / maxRevenue) * 120)}px` }}
                      />
                      <div className="text-[10px] text-gray-400">
                        {d.date.slice(5)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Payment breakdown */}
            <div className="card p-5">
              <h2 className="font-semibold mb-1">Payment Methods</h2>
              <p className="text-xs text-gray-400 mb-4">Where the money came from (excludes cancelled)</p>
              {payments.length === 0 ? (
                <div className="text-sm text-gray-400 text-center py-8">No payments in this period</div>
              ) : (
                <div className="space-y-3">
                  {payments
                    .slice()
                    .sort((a, b) => b.revenue - a.revenue)
                    .map((p) => {
                      const pct = payTotal > 0 ? (p.revenue / payTotal) * 100 : 0;
                      return (
                        <div key={p.method}>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="font-medium">{methodLabel(p.method)}</span>
                            <span className="text-gray-500 text-xs">{p.orders} orders</span>
                          </div>
                          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${p.method.includes("BANK") ? "bg-blue-500" : p.method.includes("CARD") ? "bg-purple-500" : p.method.includes("EWALLET") ? "bg-indigo-500" : "bg-green-500"}`}
                              style={{ width: `${Math.max(2, pct)}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-xs mt-1">
                            <span className="font-semibold">Rs. {p.revenue.toLocaleString()}</span>
                            <span className="text-gray-400">{pct.toFixed(1)}%</span>
                          </div>
                        </div>
                      );
                    })}
                  <div className="border-t border-gray-100 pt-3 flex items-center justify-between text-sm font-bold">
                    <span>Total</span>
                    <span>Rs. {payTotal.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Add entry */}
            <div className="card p-5">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <Plus className="w-4 h-4 text-primary-500" /> Record Cash In / Out
              </h2>
              <form onSubmit={handleAdd} className="space-y-3">
                <div className="flex bg-gray-100 rounded-xl p-1">
                  {(["IN", "OUT"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setEntryType(t)}
                      className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
                        entryType === t
                          ? t === "IN" ? "bg-green-500 text-white" : "bg-red-500 text-white"
                          : "text-gray-500"
                      }`}
                    >
                      Cash {t === "IN" ? "In" : "Out"}
                    </button>
                  ))}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Amount (Rs.) *</label>
                  <input
                    type="number" min="0" step="0.01" value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="input" placeholder="e.g. 5000" required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)} className="input">
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Method</label>
                    <select value={method} onChange={(e) => setMethod(e.target.value)} className="input">
                      {METHODS.map((m) => <option key={m} value={m}>{methodLabel(m)}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Note (optional)</label>
                  <input value={note} onChange={(e) => setNote(e.target.value)} className="input" placeholder="e.g. vegetable purchase" maxLength={200} />
                </div>
                <button type="submit" disabled={saving} className="btn-primary w-full !py-3 text-sm">
                  {saving ? "Saving..." : `Add Cash ${entryType === "IN" ? "In" : "Out"}`}
                </button>
              </form>
            </div>

            {/* Ledger */}
            <div className="card lg:col-span-2">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-semibold">Cash Ledger</h2>
                <div className="text-xs text-gray-400">
                  In: <span className="text-blue-600 font-semibold">Rs. {totalIn.toLocaleString()}</span>
                  {" · "}Out: <span className="text-red-600 font-semibold">Rs. {totalOut.toLocaleString()}</span>
                </div>
              </div>
              <div className="divide-y divide-gray-50 max-h-[420px] overflow-y-auto">
                {entries.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 text-sm">No cash entries in this period</div>
                ) : (
                  entries.map((en) => (
                    <div key={en.id} className="p-4 flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${en.type === "IN" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
                        {en.type === "IN" ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{en.category} · {methodLabel(en.paymentMethod)}</div>
                        <div className="text-xs text-gray-400 truncate">
                          {en.note || "—"} · {new Date(en.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <div className={`text-sm font-bold whitespace-nowrap ${en.type === "IN" ? "text-green-600" : "text-red-600"}`}>
                        {en.type === "IN" ? "+" : "−"} Rs. {en.amount.toLocaleString()}
                      </div>
                      <button onClick={() => handleDelete(en.id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors" title="Delete entry">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
