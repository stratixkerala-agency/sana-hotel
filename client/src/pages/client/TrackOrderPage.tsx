import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Package, ChefHat, Clock, CheckCircle, XCircle, Phone, ArrowLeft } from "lucide-react";
import { orders } from "../../lib/api";
import toast from "react-hot-toast";
import type { Order, OrderStatus } from "../../types";

const STATUS_STEPS: { key: OrderStatus; label: string; icon: any }[] = [
  { key: "PENDING", label: "Received", icon: Package },
  { key: "ACCEPTED", label: "Accepted", icon: CheckCircle },
  { key: "PREPARING", label: "Preparing", icon: ChefHat },
  { key: "READY", label: "Ready", icon: Clock },
  { key: "DELIVERED", label: "Delivered", icon: CheckCircle },
];

function getStatusIndex(status: string) {
  return STATUS_STEPS.findIndex((s) => s.key === status);
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  ACCEPTED: "bg-blue-100 text-blue-700",
  PREPARING: "bg-indigo-100 text-indigo-700",
  READY: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default function TrackOrderPage() {
  const [phone, setPhone] = useState("");
  const [orderList, setOrderList] = useState<Order[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      toast.error("Please enter your phone number");
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const result = await orders.track(phone.trim());
      setOrderList(result);
      if (result.length > 0) setExpandedId(result[0].id);
    } catch (err: any) {
      toast.error(err.message || "No orders found");
      setOrderList([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-b from-primary-500 to-primary-400 px-5 pt-12 pb-8 rounded-b-3xl">
        <div className="flex items-center gap-3 mb-5">
          <Link to="/" className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-white" />
          </Link>
          <h1 className="font-display text-xl font-bold text-white">Track Orders</h1>
        </div>

        {/* Search Form */}
        <form onSubmit={handleTrack} className="flex gap-2">
          <div className="relative flex-1">
            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
              placeholder="Enter your phone number"
            />
          </div>
          <button type="submit" disabled={loading} className="bg-white/20 backdrop-blur-sm text-white font-semibold py-3 px-5 rounded-2xl text-sm hover:bg-white/30 transition-colors disabled:opacity-50">
            {loading ? "..." : "Track"}
          </button>
        </form>
      </div>

      <div className="px-5 -mt-2 pt-4 pb-6">
        {/* No Results */}
        {searched && orderList.length === 0 && !loading && (
          <div className="card p-10 text-center">
            <div className="text-4xl mb-3">📱</div>
            <h3 className="font-semibold mb-1 text-gray-900">No orders found</h3>
            <p className="text-gray-400 text-sm">No orders found for this phone number</p>
          </div>
        )}

        {/* Order List */}
        {orderList.length > 0 && (
          <div className="space-y-3">
            {orderList.map((order) => (
              <div
                key={order.id}
                className="card overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
              >
                {/* Header */}
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <div className="font-mono text-xs font-bold text-gray-900">{order.orderNumber}</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString()} · {new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-sm text-gray-900">Rs. {order.total.toLocaleString()}</div>
                    <span className={`badge text-[10px] mt-1 ${STATUS_COLORS[order.status] || ""}`}>
                      {order.status}
                    </span>
                  </div>
                </div>

                {/* Expanded */}
                {expandedId === order.id && (
                  <div className="border-t border-orange-100 bg-warm-50 p-4 space-y-4">
                    {/* Status Timeline */}
                    {order.status !== "CANCELLED" ? (
                      <div className="flex items-center justify-between relative px-1">
                        <div className="absolute top-4 left-0 right-0 h-0.5 bg-orange-200" />
                        {STATUS_STEPS.map((step, i) => {
                          const currentIdx = getStatusIndex(order.status);
                          const isActive = i <= currentIdx;
                          const Icon = step.icon;
                          return (
                            <div key={step.key} className="relative flex flex-col items-center z-10">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                                isActive ? "bg-primary-500 text-white shadow-md shadow-primary-500/20" : "bg-white text-gray-400 border border-gray-200"
                              }`}>
                                <Icon className="w-3.5 h-3.5" />
                              </div>
                              <span className={`text-[9px] mt-1 font-medium ${isActive ? "text-primary-600" : "text-gray-400"}`}>
                                {step.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-red-500" />
                        <span className="text-red-700 text-xs font-medium">Cancelled</span>
                      </div>
                    )}

                    {/* Delivery info */}
                    <div className="text-xs text-gray-500">
                      {order.deliveryType === "ROOM" ? `Room ${order.roomNumber}` : order.deliveryAddress}
                    </div>

                    {/* Items */}
                    <div className="space-y-2">
                      {order.items?.map((item: any) => (
                        <div key={item.id} className="flex justify-between items-center text-xs">
                          <span className="flex items-center gap-2">
                            <span className="w-5 h-5 bg-primary-100 text-primary-700 rounded-md flex items-center justify-center text-[9px] font-bold">
                              {item.quantity}x
                            </span>
                            {item.foodName}
                          </span>
                          <span className="font-medium text-gray-900">Rs. {item.totalPrice.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-orange-100 pt-2 flex justify-between font-bold text-xs">
                      <span className="text-gray-900">Total (Cash on Delivery)</span>
                      <span className="text-primary-600">Rs. {order.total.toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
