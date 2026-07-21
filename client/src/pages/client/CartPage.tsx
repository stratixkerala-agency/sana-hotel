import { Link } from "react-router-dom";
import { Trash2, Minus, Plus, ArrowLeft, ShoppingBag } from "lucide-react";
import { useCart } from "../../context/CartContext";
import LazyImage from "../../components/LazyImage";

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-5">
        <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-10 h-10 text-primary-400" />
        </div>
        <h2 className="text-xl font-bold mb-2 text-gray-900">Your Cart is Empty</h2>
        <p className="text-gray-400 text-sm mb-6 text-center">Browse our menu to add delicious items</p>
        <Link to="/menu" className="btn-primary inline-flex items-center gap-2">
          <ShoppingBag className="w-4 h-4" /> Browse Menu
        </Link>
      </div>
    );
  }

  const total = subtotal;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-b from-primary-500 to-primary-400 px-5 pt-12 pb-8 rounded-b-3xl">
        <div className="flex items-center gap-3">
          <Link to="/menu" className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-white" />
          </Link>
          <h1 className="font-display text-xl font-bold text-white">Cart ({items.length})</h1>
        </div>
      </div>

      <div className="px-5 -mt-2 pt-4 pb-6">
        {/* Cart Items */}
        <div className="space-y-3 mb-6">
          {items.map((item) => (
            <div key={item.foodItemId} className="card p-3 flex gap-3">
              <div className="w-16 h-16 flex-shrink-0 rounded-2xl overflow-hidden bg-warm-100 relative">
                <LazyImage src={item.image || ""} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-sm text-gray-900 truncate">{item.name}</h3>
                  <button onClick={() => removeItem(item.foodItemId)} className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-primary-600 font-bold text-sm mt-0.5">Rs. {item.price.toLocaleString()}</p>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center bg-warm-50 rounded-xl border border-orange-100">
                    <button
                      onClick={() => updateQuantity(item.foodItemId, item.quantity - 1)}
                      className="p-1.5 hover:bg-warm-100 rounded-l-xl transition-colors"
                    >
                      <Minus className="w-3 h-3 text-gray-600" />
                    </button>
                    <span className="w-7 text-center text-xs font-bold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.foodItemId, item.quantity + 1)}
                      className="p-1.5 hover:bg-warm-100 rounded-r-xl transition-colors"
                    >
                      <Plus className="w-3 h-3 text-gray-600" />
                    </button>
                  </div>
                  <span className="font-bold text-sm text-gray-900">
                    Rs. {(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="card p-5">
          <h2 className="font-semibold text-sm text-gray-900 mb-4">Order Summary</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
              <span className="font-medium text-gray-900">Rs. {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Delivery Fee</span>
              <span className="font-medium text-green-600">Free</span>
            </div>
            <div className="border-t border-orange-100 pt-3 flex justify-between">
              <span className="font-semibold text-gray-900">Total</span>
              <span className="font-bold text-lg text-primary-600">Rs. {total.toLocaleString()}</span>
            </div>
          </div>
          <p className="text-[10px] text-gray-400 mt-2 mb-4">Cash on delivery</p>
          <Link to="/checkout" className="btn-primary w-full flex items-center justify-center gap-2">
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
