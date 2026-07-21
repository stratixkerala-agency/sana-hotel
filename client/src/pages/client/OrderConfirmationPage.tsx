import { useLocation, Link } from "react-router-dom";
import { CheckCircle, ArrowRight, Home } from "lucide-react";

export default function OrderConfirmationPage() {
  const location = useLocation();
  const order = (location.state as any)?.order;

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-5">
        <h2 className="text-xl font-bold mb-4 text-gray-900">No order found</h2>
        <Link to="/menu" className="btn-primary">Browse Menu</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5">
      {/* Success Icon */}
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
        <CheckCircle className="w-10 h-10 text-green-500" />
      </div>

      <h1 className="font-display text-2xl font-bold mb-2 text-gray-900">Order Confirmed!</h1>
      <p className="text-gray-400 text-sm mb-8 text-center">Your food is being prepared. We'll deliver it soon.</p>

      {/* Order Card */}
      <div className="card p-5 w-full max-w-sm mb-8">
        <div className="flex justify-between items-center mb-4">
          <span className="text-xs text-gray-400">Order Number</span>
          <span className="font-mono font-bold text-primary-600 text-sm">{order.orderNumber}</span>
        </div>
        <div className="space-y-2.5 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Name</span>
            <span className="font-medium text-gray-900">{order.customerName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Phone</span>
            <span className="font-medium text-gray-900">{order.customerPhone}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Delivery</span>
            <span className="font-medium text-gray-900">
              {order.deliveryType === "ROOM" ? `Room ${order.roomNumber}` : order.deliveryAddress}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Payment</span>
            <span className="font-medium text-green-600">Cash on Delivery</span>
          </div>
          <div className="border-t border-orange-100 pt-2.5 flex justify-between font-bold">
            <span className="text-gray-900">Total</span>
            <span className="text-primary-600">Rs. {order.total.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 w-full max-w-sm">
        <Link to="/" className="btn-secondary flex items-center justify-center gap-2">
          <Home className="w-4 h-4" /> Go Home
        </Link>
        <Link to="/track" className="btn-primary flex items-center justify-center gap-2">
          Track Order <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
