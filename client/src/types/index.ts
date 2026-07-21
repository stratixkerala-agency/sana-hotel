export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "CUSTOMER" | "ADMIN";
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  sortOrder: number;
  isActive: boolean;
  _count?: { foodItems: number };
}

export interface FoodItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  categoryId?: string;
  category?: Category;
  image?: string;
  thumbnail?: string;
  ingredients?: string;
  preparationTime?: number;
  stockQuantity: number;
  isAvailable: boolean;
  isFeatured: boolean;
  avgRating?: number | null;
  reviewCount?: number;
  reviews?: Review[];
  _count?: { orderItems: number };
}

export interface CartItem {
  foodItemId: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  deliveryType: "ROOM" | "LOCATION";
  roomNumber?: string;
  deliveryAddress?: string;
  deliveryNotes?: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: string;
  status: OrderStatus;
  items: OrderItem[];
  createdAt: string;
}

export type OrderStatus = "PENDING" | "ACCEPTED" | "PREPARING" | "READY" | "DELIVERED" | "CANCELLED";

export interface OrderItem {
  id: string;
  foodItemId: string;
  foodItem?: { id: string; name: string; image?: string };
  foodName: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

export interface Review {
  id: string;
  foodItemId: string;
  foodItem?: { id: string; name: string; slug: string };
  customerId?: string;
  customerName: string;
  rating: number;
  comment?: string;
  isApproved: boolean;
  createdAt: string;
}

export interface DashboardStats {
  totalOrders: number;
  todayOrders: number;
  totalRevenue: number;
  todayRevenue: number;
  pendingOrders: number;
  lowStockItems: number;
}
