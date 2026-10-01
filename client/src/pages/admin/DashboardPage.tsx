import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, DollarSign, Clock, AlertTriangle, Package, Armchair, ShoppingBag, BellRing } from "lucide-react";
import { orders } from "../../lib/api";
import type { DashboardStats } from "../../types";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [occupiedTables, setOccupiedTables] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      orders.adminStats(),
      orders.adminList(),
    ]).then(([statsRes, ordersRes]) => {
      setStats(statsRes);
      const all = ordersRes.orders || [];
      setRecentOrders(all.slice(0, 5));
      const tables = new Set(
        all
          .filter((o: any) => o.deliveryType === "DINE_IN" && o.tableNumber && !["DELIVERED", "CANCELLED"].includes(o.status))
          .map((o: any) => String(o.tableNumber))
      );
      setOccupiedTables(tables.size);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card p-6"><div className="skeleton h-20 w-full" /></div>
        ))}
      </div>
    );
  }

  const cards = [
    { title: "Today's Orders", value: stats?.todayOrders || 0, icon: ShoppingCart, color: "bg-blue-100 text-blue-600", link: "/admin/orders" },
    { title: "Today's Revenue", value: `Rs. ${(stats?.todayRevenue || 0).toLocaleString()}`, icon: DollarSign, color: "bg-green-100 text-green-600" },
    { title: "Pending Orders", value: stats?.pendingOrders || 0, icon: Clock, color: "bg-amber-100 text-amber-600", link: "/admin/orders" },
    { title: "Low Stock Items", value: stats?.lowStockItems || 0, icon: AlertTriangle, color: "bg-red-100 text-red-600", link: "/admin/menu" },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-6">Dashboard</h1>

      {/* Counter shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Link to="/admin/tables" className="card p-6 flex items-center gap-4 hover:shadow-lg hover:-translate-y-0.5 transition-all border-2 !border-orange-200">
          <div className="w-14 h-14 bg-orange-500 text-white rounded-2xl flex items-center justify-center shrink-0">
            <Armchair className="w-7 h-7" />
          </div>
          <div>
            <div className="font-bold text-lg">Select Tables</div>
            <div className="text-sm text-gray-500">Dine-in billing per table</div>
            {occupiedTables > 0 && <div className="text-xs font-semibold text-orange-600 mt-1">{occupiedTables} table(s) occupied</div>}
          </div>
        </Link>
        <Link to="/admin/takeaway" className="card p-6 flex items-center gap-4 hover:shadow-lg hover:-translate-y-0.5 transition-all border-2 !border-blue-200">
          <div className="w-14 h-14 bg-blue-500 text-white rounded-2xl flex items-center justify-center shrink-0">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <div>
            <div className="font-bold text-lg">Select Takeaway</div>
            <div className="text-sm text-gray-500">Counter billing for pickup</div>
          </div>
        </Link>
        <Link to="/admin/orders" className="card p-6 flex items-center gap-4 hover:shadow-lg hover:-translate-y-0.5 transition-all border-2 !border-green-200">
          <div className="w-14 h-14 bg-green-500 text-white rounded-2xl flex items-center justify-center shrink-0 relative">
            <BellRing className="w-7 h-7" />
            {(stats?.pendingOrders || 0) > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 flex items-center justify-center rounded-full font-bold animate-pulse">
                {stats?.pendingOrders}
              </span>
            )}
          </div>
          <div>
            <div className="font-bold text-lg">Online Orders</div>
            <div className="text-sm text-gray-500">Live orders from customers</div>
            <div className="text-xs font-semibold text-green-600 mt-1">{stats?.pendingOrders || 0} pending now</div>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => (
          <div key={card.title} className="card p-5">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.color}`}>
                <card.icon className="w-6 h-6" />
              </div>
              <div>
                <div className="text-sm text-gray-500">{card.title}</div>
                <div className="text-2xl font-bold">{card.value}</div>
              </div>
            </div>
            {card.link && (
              <Link to={card.link} className="text-xs text-primary-600 hover:text-primary-700 mt-3 inline-block">
                View All →
              </Link>
            )}
          </div>
        ))}
      </div>

      {/* Total Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="card p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm text-gray-500">Total Orders</div>
            <div className="text-xl font-bold">{stats?.totalOrders || 0}</div>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm text-gray-500">Total Revenue</div>
            <div className="text-xl font-bold">Rs. {(stats?.totalRevenue || 0).toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold">Recent Orders</h2>
          <Link to="/admin/orders" className="text-sm text-primary-600 hover:text-primary-700">View All</Link>
        </div>
        <div className="divide-y divide-gray-50">
          {recentOrders.length === 0 ? (
            <div className="p-8 text-center text-gray-400">No orders yet</div>
          ) : (
            recentOrders.map((order) => (
              <div key={order.id} className="p-4 flex items-center justify-between">
                <div>
                  <div className="font-mono text-sm font-semibold">{order.orderNumber}</div>
                  <div className="text-xs text-gray-500">{order.customerName} · {order.items?.length} items</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-sm">Rs. {order.total.toLocaleString()}</div>
                  <span className={`badge text-xs ${
                    order.status === "PENDING" ? "bg-amber-100 text-amber-700" :
                    order.status === "DELIVERED" ? "bg-green-100 text-green-700" :
                    order.status === "CANCELLED" ? "bg-red-100 text-red-700" :
                    "bg-blue-100 text-blue-700"
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
