import { Outlet, Link, useLocation } from "react-router-dom";
import { Home, Search, Heart, ShoppingCart, User } from "lucide-react";
import { useCart } from "../../context/CartContext";
import Footer from "../../components/Footer";

const tabs = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/menu", icon: Search, label: "Menu" },
  { to: "/track", icon: Heart, label: "Orders" },
  { to: "/cart", icon: ShoppingCart, label: "Cart" },
];

export default function ClientLayout() {
  const location = useLocation();
  const { totalItems } = useCart();

  return (
    <div className="min-h-screen bg-cream pb-24">
      <main className="max-w-lg mx-auto">
        <Outlet />
      </main>

      <div className="max-w-lg mx-auto px-0 mt-6">
        <Footer />
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-orange-100">
        <div className="max-w-lg mx-auto flex items-center justify-around py-2 px-4">
          {tabs.map((tab) => {
            const isActive = tab.to === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(tab.to);
            const Icon = tab.icon;

            return (
              <Link
                key={tab.to}
                to={tab.to}
                className={`bottom-nav-item relative ${
                  isActive ? "text-primary-500" : "text-gray-400"
                }`}
              >
                <div className="relative">
                  <Icon className={`w-6 h-6 ${isActive ? "stroke-[2.5px]" : "stroke-[1.5px]"}`} />
                  {tab.to === "/cart" && totalItems > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-primary-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                      {totalItems}
                    </span>
                  )}
                </div>
                <span className="text-[10px]">{tab.label}</span>
                {isActive && (
                  <div className="absolute -bottom-2 w-5 h-1 bg-primary-500 rounded-full" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
