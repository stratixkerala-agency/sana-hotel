import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// Client pages
import ClientLayout from "./pages/client/ClientLayout";
import HomePage from "./pages/client/HomePage";
import MenuPage from "./pages/client/MenuPage";
import FoodDetailPage from "./pages/client/FoodDetailPage";
import CartPage from "./pages/client/CartPage";
import CheckoutPage from "./pages/client/CheckoutPage";
import OrderConfirmationPage from "./pages/client/OrderConfirmationPage";
import TrackOrderPage from "./pages/client/TrackOrderPage";

// Admin pages
import AdminLayout from "./pages/admin/AdminLayout";
import LoginPage from "./pages/admin/LoginPage";
import DashboardPage from "./pages/admin/DashboardPage";
import AdminOrdersPage from "./pages/admin/AdminOrdersPage";
import AdminMenuPage from "./pages/admin/AdminMenuPage";
import AdminFoodFormPage from "./pages/admin/AdminFoodFormPage";
import AdminReviewsPage from "./pages/admin/AdminReviewsPage";

function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/admin/login" replace />;
  if (adminOnly && user.role !== "ADMIN") return <Navigate to="/" replace />;

  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      {/* Client Routes */}
      <Route element={<ClientLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/menu/:slug" element={<FoodDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order/confirmation" element={<OrderConfirmationPage />} />
        <Route path="/track" element={<TrackOrderPage />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin/login" element={<LoginPage />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="menu" element={<AdminMenuPage />} />
        <Route path="menu/new" element={<AdminFoodFormPage />} />
        <Route path="menu/:id/edit" element={<AdminFoodFormPage />} />
        <Route path="reviews" element={<AdminReviewsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
