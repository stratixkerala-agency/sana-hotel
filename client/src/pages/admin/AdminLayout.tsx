import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, ShoppingCart, Utensils, Star, Wallet, Armchair, ShoppingBag, LogOut, Menu, X, Bluetooth, Printer } from "lucide-react";
import { useState, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { orders } from "../../lib/api";
import { printOrder, connectBluetoothPrinter, disconnectPrinter, isBluetoothSupported, isPrinterConnected, onPrinterStatusChange } from "../../lib/printer";
import { useEffect } from "react";
import toast from "react-hot-toast";

function playAlertSound() {
  try {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new Ctx();
    const notes = [880, 660, 990];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.value = freq;
      const t = ctx.currentTime + i * 0.22;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.4, t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
      osc.start(t);
      osc.stop(t + 0.22);
    });
    setTimeout(() => ctx.close(), 900);
  } catch {}
}

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [newOrderCount, setNewOrderCount] = useState(0);
  const [popupOrder, setPopupOrder] = useState<any>(null);
  const [printerOn, setPrinterOn] = useState(isPrinterConnected());
  const lastSeen = useRef<string>("");
  const ringing = useRef<any>(null);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const stopRinging = () => {
    if (ringing.current) {
      clearInterval(ringing.current);
      ringing.current = null;
    }
  };

  const acknowledge = () => {
    stopRinging();
    setPopupOrder(null);
  };

  // Authenticated polling for new online orders (EventSource can't send auth headers)
  useEffect(() => {
    let cancelled = false;
    orders.adminLatest()
      .then((res) => { lastSeen.current = res.serverTime; })
      .catch(() => {});

    const poll = async () => {
      if (cancelled || popupOrder) return;
      try {
        const res = await orders.adminLatest(lastSeen.current);
        lastSeen.current = res.serverTime;
        const fresh = (res.orders || []).filter((o: any) => !String(o.orderNumber).startsWith("POS-"));
        if (fresh.length > 0 && !cancelled) {
          const newest = fresh[0];
          try {
            const full = await orders.adminGet(newest.id);
            if (cancelled) return;
            setPopupOrder(full);
            setNewOrderCount((c) => c + fresh.length);
            toast(`New online order: ${newest.orderNumber}`, { icon: "🔔", duration: 6000 });
            playAlertSound();
            stopRinging();
            ringing.current = setInterval(playAlertSound, 3000);
          } catch {}
        }
      } catch {}
    };

    const timer = setInterval(poll, 10000);
    return () => { cancelled = true; clearInterval(timer); stopRinging(); };
  }, [popupOrder]);

  useEffect(() => onPrinterStatusChange(setPrinterOn), []);

  const handlePrinter = async () => {
    if (isPrinterConnected()) {
      disconnectPrinter();
      toast.success("Printer disconnected");
      return;
    }
    try {
      const name = await connectBluetoothPrinter();
      toast.success(`Printer connected: ${name}`);
    } catch (err: any) {
      toast.error(err.message || "Could not connect printer");
    }
  };

  const handlePrintPopup = async () => {
    if (!popupOrder) return;
    try {
      const via = await printOrder(popupOrder);
      toast.success(via === "bluetooth" ? "Sent to Bluetooth printer" : "Print dialog opened");
    } catch (err: any) {
      toast.error(err.message || "Print failed");
    }
  };

  const nav = [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { to: "/admin/orders", label: "Orders", icon: ShoppingCart, badge: newOrderCount },
    { to: "/admin/tables", label: "Tables", icon: Armchair },
    { to: "/admin/takeaway", label: "Takeaway", icon: ShoppingBag },
    { to: "/admin/menu", label: "Menu", icon: Utensils },
    { to: "/admin/finance", label: "Finance", icon: Wallet },
    { to: "/admin/reviews", label: "Reviews", icon: Star },
  ];

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 lg:translate-x-0 lg:static lg:z-auto ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-6 border-b border-gray-100">
          <Link to="/admin" className="flex items-center gap-2 font-display text-xl font-bold text-primary-700">
            <img src="/logo.svg" alt="Finitix" className="h-8 w-auto" />
            Finitix Admin
          </Link>
          <div className="text-xs text-gray-400 mt-1">Finitix Solution Management</div>
        </div>
        <nav className="p-4 space-y-1">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                location.pathname === item.to || (item.to !== "/admin" && location.pathname.startsWith(item.to))
                  ? "bg-primary-50 text-primary-700"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
              {item.badge ? (
                <span className="ml-auto bg-red-500 text-white text-xs w-6 h-6 flex items-center justify-center rounded-full animate-pulse">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-bold">
              {user?.name?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{user?.name}</div>
              <div className="text-xs text-gray-400 truncate">{user?.email}</div>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 transition-colors w-full px-3 py-2 rounded-lg hover:bg-gray-50">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4 lg:px-6 gap-4">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 text-gray-600">
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex-1" />
          <button
            onClick={handlePrinter}
            title={printerOn ? "Printer connected - tap to disconnect" : "Connect Bluetooth printer"}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border transition-colors ${
              printerOn
                ? "bg-green-50 border-green-300 text-green-700"
                : "bg-white border-gray-200 text-gray-500 hover:text-primary-600"
            }`}
          >
            <Bluetooth className="w-4 h-4" />
            <span className={`w-2 h-2 rounded-full ${printerOn ? "bg-green-500" : "bg-gray-300"}`} />
            {printerOn ? "Printer" : isBluetoothSupported() ? "Connect Printer" : "Print"}
          </button>
          <Link to="/" target="_blank" className="text-sm text-gray-500 hover:text-primary-600">
            View Website
          </Link>
        </header>

        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>

      {/* New online order popup */}
      {popupOrder && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden animate-bounce-slow">
            <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-5 text-white text-center">
              <div className="text-4xl mb-2">🔔</div>
              <h2 className="font-display text-xl font-bold">New Online Order!</h2>
              <div className="font-mono font-semibold mt-1">{popupOrder.orderNumber}</div>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Customer</span>
                <span className="font-medium">{popupOrder.customerName} · {popupOrder.customerPhone}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Type</span>
                <span className="font-medium">
                  {popupOrder.deliveryType === "ROOM" ? `Room ${popupOrder.roomNumber}` : popupOrder.deliveryAddress || popupOrder.deliveryType}
                </span>
              </div>
              <div className="bg-gray-50 rounded-2xl p-3 text-sm max-h-40 overflow-y-auto">
                {(popupOrder.items || []).map((it: any) => (
                  <div key={it.id} className="flex justify-between py-0.5">
                    <span>{it.foodName} x {it.quantity}</span>
                    <span className="font-medium">Rs. {Number(it.totalPrice).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary-600">Rs. {Number(popupOrder.total).toLocaleString()}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={handlePrintPopup} className="btn-secondary !py-3 text-sm flex items-center justify-center gap-2">
                  <Printer className="w-4 h-4" /> Print Bill
                </button>
                <button onClick={() => { acknowledge(); navigate("/admin/orders"); }} className="btn-primary !py-3 text-sm">
                  View Orders
                </button>
              </div>
              <button onClick={acknowledge} className="w-full text-center text-sm text-gray-400 hover:text-gray-600 py-1">
                Acknowledge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
