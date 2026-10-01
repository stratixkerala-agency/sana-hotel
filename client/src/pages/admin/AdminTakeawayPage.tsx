import { useCallback, useEffect, useState } from "react";
import { ShoppingBag, RefreshCw, Printer } from "lucide-react";
import { orders } from "../../lib/api";
import { printOrder } from "../../lib/printer";
import POSBilling, { type BillLine } from "../../components/POSBilling";
import toast from "react-hot-toast";

export default function AdminTakeawayPage() {
  const [lines, setLines] = useState<BillLine[]>([]);
  const [recent, setRecent] = useState<any[]>([]);

  const fetchRecent = useCallback(() => {
    orders.adminList({} as any)
      .then((res) => {
        const today = new Date().toDateString();
        setRecent(
          (res.orders || [])
            .filter((o: any) => o.deliveryType === "TAKEAWAY" && new Date(o.createdAt).toDateString() === today)
            .slice(0, 10)
        );
      })
      .catch(() => {});
  }, []);

  useEffect(() => { fetchRecent(); }, [fetchRecent]);

  const handlePrint = async (id: string) => {
    try {
      const full = await orders.adminGet(id);
      const via = await printOrder(full);
      toast.success(via === "bluetooth" ? "Sent to Bluetooth printer" : "Print dialog opened");
    } catch (err: any) {
      toast.error(err.message || "Print failed");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="font-display text-2xl font-bold flex items-center gap-2">
          <ShoppingBag className="w-6 h-6 text-primary-600" /> Takeaway Counter
        </h1>
        <button onClick={fetchRecent} className="btn-secondary text-sm !py-2 flex items-center gap-2">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <POSBilling mode="TAKEAWAY" lines={lines} onLinesChange={setLines} onOrderPlaced={fetchRecent} />

      <div className="card mt-4">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-semibold text-sm">Today's Takeaway Bills</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {recent.length === 0 ? (
            <div className="p-6 text-center text-gray-400 text-sm">No takeaway bills today</div>
          ) : (
            recent.map((o) => (
              <div key={o.id} className="p-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-xs font-semibold">{o.orderNumber}</div>
                  <div className="text-xs text-gray-500">{o.customerName} · {o.items?.length} items · {o.status}</div>
                </div>
                <div className="text-sm font-bold">Rs. {Number(o.total).toLocaleString()}</div>
                <button onClick={() => handlePrint(o.id)} className="p-2 text-gray-400 hover:text-primary-600" title="Print bill">
                  <Printer className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
