import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, MapPin, CreditCard, Loader2, Check } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { orders } from "../../lib/api";
import toast from "react-hot-toast";

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    deliveryType: "ROOM",
    roomNumber: "",
    deliveryAddress: "",
    deliveryNotes: "",
  });

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-5">
        <h2 className="text-xl font-bold mb-4 text-gray-900">No items to checkout</h2>
        <Link to="/menu" className="btn-primary">Browse Menu</Link>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerName || !form.customerPhone) {
      toast.error("Please fill in your name and phone number");
      return;
    }
    if (form.deliveryType === "ROOM" && !form.roomNumber) {
      toast.error("Room number is required");
      return;
    }
    if (form.deliveryType === "LOCATION" && !form.deliveryAddress) {
      toast.error("Delivery address is required");
      return;
    }

    setLoading(true);
    try {
      const order = await orders.create({
        ...form,
        items: items.map((i) => ({ foodItemId: i.foodItemId, quantity: i.quantity })),
      });
      clearCart();
      navigate("/order/confirmation", { state: { order } });
    } catch (err: any) {
      toast.error(err.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-6">
      {/* Header */}
      <div className="bg-gradient-to-b from-primary-500 to-primary-400 px-5 pt-12 pb-8 rounded-b-3xl">
        <div className="flex items-center gap-3">
          <Link to="/cart" className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-white" />
          </Link>
          <h1 className="font-display text-xl font-bold text-white">Checkout</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-5 -mt-2 pt-4 space-y-4">
        {/* Your Details */}
        <div className="card p-5">
          <h2 className="font-semibold text-sm text-gray-900 mb-4">Your Details</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Full Name *</label>
              <input name="customerName" value={form.customerName} onChange={handleChange} className="input text-sm" placeholder="Enter your name" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Phone Number *</label>
              <input name="customerPhone" value={form.customerPhone} onChange={handleChange} className="input text-sm" placeholder="+92-300-0000000" required />
            </div>
          </div>
        </div>

        {/* Delivery */}
        <div className="card p-5">
          <h2 className="font-semibold text-sm text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary-500" />
            Delivery Location
          </h2>

          <div className="flex gap-2 mb-4">
            {[
              { value: "ROOM", label: "Room Delivery" },
              { value: "LOCATION", label: "Specific Location" },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setForm((p) => ({ ...p, deliveryType: opt.value }))}
                className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium border-2 transition-all ${
                  form.deliveryType === opt.value
                    ? "border-primary-500 bg-primary-50 text-primary-700"
                    : "border-orange-100 text-gray-500"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {form.deliveryType === "ROOM" ? (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Room Number *</label>
              <input name="roomNumber" value={form.roomNumber} onChange={handleChange} className="input text-sm" placeholder="e.g. 205" required />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Delivery Address *</label>
              <input name="deliveryAddress" value={form.deliveryAddress} onChange={handleChange} className="input text-sm" placeholder="Enter delivery address" required />
            </div>
          )}

          <div className="mt-3">
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Delivery Notes (optional)</label>
            <textarea name="deliveryNotes" value={form.deliveryNotes} onChange={handleChange} className="input text-sm min-h-[60px] resize-none" placeholder="Special instructions..." />
          </div>
        </div>

        {/* Payment */}
        <div className="card p-5">
          <h2 className="font-semibold text-sm text-gray-900 mb-3 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-primary-500" />
            Payment
          </h2>
          <div className="bg-green-50 border border-green-200 rounded-2xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <div className="text-sm font-semibold text-green-800">Cash on Delivery</div>
              <div className="text-xs text-green-600">Pay when your food arrives</div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="card p-5">
          <h2 className="font-semibold text-sm text-gray-900 mb-3">Order Summary</h2>
          <div className="space-y-2 mb-3">
            {items.map((item) => (
              <div key={item.foodItemId} className="flex justify-between text-xs">
                <span className="text-gray-500 truncate flex-1 mr-2">
                  {item.name} × {item.quantity}
                </span>
                <span className="font-medium text-gray-900 whitespace-nowrap">Rs. {(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-orange-100 pt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Subtotal</span>
              <span className="text-gray-900">Rs. {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Delivery</span>
              <span className="text-green-600 font-medium">Free</span>
            </div>
            <div className="flex justify-between font-bold pt-2 border-t border-orange-100">
              <span className="text-gray-900">Total</span>
              <span className="text-primary-600">Rs. {subtotal.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mb-4">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {loading ? "Placing Order..." : "Place Order (Cash on Delivery)"}
        </button>
      </form>
    </div>
  );
}
