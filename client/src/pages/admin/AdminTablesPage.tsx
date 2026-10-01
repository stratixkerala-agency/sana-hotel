import { useCallback, useEffect, useState } from "react";
import { Armchair, RefreshCw, Printer } from "lucide-react";
import { orders } from "../../lib/api";
import { printOrder } from "../../lib/printer";
import POSBilling, { type BillLine } from "../../components/POSBilling";
import toast from "react-hot-toast";

const COUNT_KEY = "finitix_table_count";

interface OpenBill {
  table: string;
  total: number;
  items: number;
  orders: any[];
}

export default function AdminTablesPage() {
  const [tableCount, setTableCount] = useState(() => {
    const saved = parseInt(localStorage.getItem(COUNT_KEY) || "12");
    return Number.isFinite(saved) && saved > 0 && saved <= 60 ? saved : 12;
  });
  const [selected, setSelected] = useState<string>("1");
  const [drafts, setDrafts] = useState<Record<string, BillLine[]>>({});
  const [openBills, setOpenBills] = useState<Record<string, OpenBill>>({});
  const [loading, setLoading] = useState(true);

  const fetchOpen = useCallback(() => {
    orders.adminList({} as any)
      .then((res) => {
        const map: Record<string, OpenBill> = {};
        for (const o of res.orders || []) {
          if (o.deliveryType !== "DINE_IN" || !o.tableNumber) continue;
          if (["DELIVERED", "CANCELLED"].includes(o.status)) continue;
          const t = String(o.tableNumber);
          if (!map[t]) map[t] = { table: t, total: 0, items: 0, orders: [] };
          map[t].total += Number(o.total) || 0;
          map[t].items += o.items?.length || 0;
          map[t].orders.push(o);
        }
        setOpenBills(map);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchOpen(); }, [fetchOpen]);

  const changeCount = (n: number) => {
    const v = Math.min(60, Math.max(1, n || 12));
    setTableCount(v);
    localStorage.setItem(COUNT_KEY, String(v));
  };

  const tables = Array.from({ length: tableCount }, (_, i) => String(i + 1));

  const handlePrintTable = async (t: string) => {
    const bill = openBills[t];
    if (!bill) return;
    for (const o of bill.orders) {
      try {
        const full = await orders.adminGet(o.id);
        await printOrder(full);
      } catch (err: any) {
        toast.error(err.message || "Print failed");
        return;
      }
    }
    toast.success(`Table ${t} bill(s) sent to print`);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="font-display text-2xl font-bold flex items-center gap-2">
          <Armchair className="w-6 h-6 text-primary-600" /> Dine-In Tables
        </h1>
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500">Tables:</label>
          <input
            type="number" min={1} max={60} value={tableCount}
            onChange={(e) => changeCount(parseInt(e.target.value))}
            className="input !w-20 !py-2 text-sm"
          />
          <button onClick={fetchOpen} className="btn-secondary text-sm !py-2 flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="card p-4"><div className="skeleton h-14 w-full" /></div>)}
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
          {tables.map((t) => {
            const bill = openBills[t];
            const active = selected === t;
            return (
              <button
                key={t}
                onClick={() => setSelected(t)}
                className={`card p-4 text-center transition-all ${
                  active ? "ring-2 ring-primary-500 border-primary-300" : "hover:border-primary-200"
                } ${bill ? "bg-orange-50/60" : ""}`}
              >
                <div className={`w-10 h-10 mx-auto mb-2 rounded-xl flex items-center justify-center font-bold ${
                  bill ? "bg-orange-500 text-white" : "bg-green-100 text-green-700"
                }`}>
                  {t}
                </div>
                {bill ? (
                  <>
                    <div className="text-xs font-semibold text-orange-600">Occupied</div>
                    <div className="text-xs text-gray-500">Rs. {bill.total.toLocaleString()}</div>
                  </>
                ) : (
                  <div className="text-xs font-medium text-green-600">Free</div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Open bills for selected table */}
      {openBills[selected] && (
        <div className="card p-4 mb-4 flex flex-wrap items-center gap-3">
          <div className="text-sm">
            <span className="font-semibold">Table {selected}</span>
            <span className="text-gray-500"> · {openBills[selected].orders.length} open bill(s) · </span>
            <span className="font-bold text-primary-600">Rs. {openBills[selected].total.toLocaleString()}</span>
          </div>
          <button onClick={() => handlePrintTable(selected)} className="btn-secondary text-xs !py-2 flex items-center gap-1.5 ml-auto">
            <Printer className="w-3.5 h-3.5" /> Print Table Bills
          </button>
        </div>
      )}

      <POSBilling
        key={selected}
        mode="DINE_IN"
        tableNumber={selected}
        lines={drafts[selected] || []}
        onLinesChange={(lines) => setDrafts((d) => ({ ...d, [selected]: lines }))}
        onOrderPlaced={fetchOpen}
      />
    </div>
  );
}
