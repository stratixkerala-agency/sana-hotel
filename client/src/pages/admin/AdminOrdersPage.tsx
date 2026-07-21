import { useEffect, useState } from "react";
import { RefreshCw, Search } from "lucide-react";
import { orders } from "../../lib/api";
import toast from "react-hot-toast";
import type { Order, OrderStatus } from "../../types";

const STATUS_OPTIONS: OrderStatus[] = ["PENDING", "ACCEPTED", "PREPARING", "READY", "DELIVERED", "CANCELLED"];

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  ACCEPTED: "bg-blue-100 text-blue-700",
  PREPARING: "bg-indigo-100 text-indigo-700",
  READY: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default function AdminOrdersPage() {
  const [ordersList, setOrdersList] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = () => {
    setLoading(true);
    orders.adminList(filter ? { status: filter } : undefined)
      .then((res) => setOrdersList(res.orders))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, [filter]);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await orders.adminUpdateStatus(orderId, newStatus);
      toast.success(`Order status updated to ${newStatus}`);
      fetchOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    }
  };

  const filtered = ordersList.filter((o) =>
    !searchTerm || o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) || o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || o.customerPhone.includes(searchTerm)
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="font-display text-2xl font-bold">Orders</h1>
        <button onClick={fetchOrders} className="btn-secondary text-sm flex items-center gap-2">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by order number, name, or phone..."
            className="input pl-10 text-sm"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          <button onClick={() => setFilter("")} className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${!filter ? "bg-primary-600 text-white" : "bg-white border text-gray-600"}`}>
            All
          </button>
          {STATUS_OPTIONS.map((s) => (
            <button key={s} onClick={() => setFilter(s)} className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${filter === s ? "bg-primary-600 text-white" : "bg-white border text-gray-600"}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="card p-4"><div className="skeleton h-16 w-full" /></div>)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center text-gray-400">No orders found</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => (
            <div key={order.id} className="card p-4 cursor-pointer hover:border-primary-200" onClick={() => setSelectedOrder(order)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
                    <span className="font-mono text-xs font-bold text-primary-600">
                      {order.orderNumber.split("-")[1]?.substring(0, 4)}
                    </span>
                  </div>
                  <div>
                    <div className="font-mono text-sm font-semibold">{order.orderNumber}</div>
                    <div className="text-sm text-gray-500">{order.customerName} · {order.customerPhone}</div>
                    <div className="text-xs text-gray-400">
                      {order.deliveryType === "ROOM" ? `Room ${order.roomNumber}` : order.deliveryAddress} · {order.items?.length} items
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">Rs. {order.total.toLocaleString()}</div>
                  <span className={`badge text-xs mt-1 ${STATUS_COLORS[order.status] || ""}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSelectedOrder(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <div className="font-mono font-bold">{selectedOrder.orderNumber}</div>
                <div className="text-sm text-gray-500">Placed at {new Date(selectedOrder.createdAt).toLocaleString()}</div>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-500">Customer</div>
                  <div className="font-medium">{selectedOrder.customerName}</div>
                </div>
                <div>
                  <div className="text-gray-500">Phone</div>
                  <div className="font-medium">{selectedOrder.customerPhone}</div>
                </div>
                <div>
                  <div className="text-gray-500">Delivery</div>
                  <div className="font-medium">
                    {selectedOrder.deliveryType === "ROOM" ? `Room ${selectedOrder.roomNumber}` : selectedOrder.deliveryAddress}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">Payment</div>
                  <div className="font-medium text-green-600">Cash on Delivery</div>
                </div>
              </div>

              {selectedOrder.deliveryNotes && (
                <div className="bg-gray-50 rounded-xl p-3 text-sm">
                  <div className="text-gray-500 text-xs mb-1">Notes</div>
                  {selectedOrder.deliveryNotes}
                </div>
              )}

              <div className="border-t pt-4">
                <div className="text-sm font-medium mb-2">Items</div>
                {selectedOrder.items?.map((item: any) => (
                  <div key={item.id} className="flex justify-between text-sm py-1">
                    <span>{item.foodName} x {item.quantity}</span>
                    <span className="font-medium">Rs. {item.totalPrice.toLocaleString()}</span>
                  </div>
                ))}
                <div className="border-t mt-2 pt-2 flex justify-between font-bold">
                  <span>Total</span>
                  <span>Rs. {selectedOrder.total.toLocaleString()}</span>
                </div>
              </div>

              {/* Status Controls */}
              <div className="border-t pt-4">
                <div className="text-sm font-medium mb-3">Update Status</div>
                <div className="grid grid-cols-3 gap-2">
                  {STATUS_OPTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(selectedOrder.id, s)}
                      disabled={selectedOrder.status === s}
                      className={`py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                        selectedOrder.status === s
                          ? "bg-primary-100 text-primary-700 ring-2 ring-primary-300"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      } ${s === "CANCELLED" ? "bg-red-50 text-red-600 hover:bg-red-100" : ""}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
