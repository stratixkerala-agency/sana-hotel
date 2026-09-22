const BASE_URL = "/api";

function getToken(): string | null {
  return localStorage.getItem("finitix_token") || localStorage.getItem("sana_token");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || `HTTP ${res.status}`);
  }

  return res.json();
}

// Auth
export const auth = {
  login: (email: string, password: string) =>
    request<{ token: string; user: any }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  register: (data: { name: string; email: string; password: string; phone?: string }) =>
    request<{ token: string; user: any }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  me: () => request<any>("/auth/me"),
};

// Food
export const food = {
  list: (params?: { category?: string; search?: string; featured?: string }) => {
    const query = new URLSearchParams();
    if (params?.category) query.set("category", params.category);
    if (params?.search) query.set("search", params.search);
    if (params?.featured) query.set("featured", params.featured);
    const qs = query.toString();
    return request<{ items: any[]; total: number }>(`/food${qs ? `?${qs}` : ""}`);
  },
  get: (slug: string) => request<any>(`/food/${slug}`),
  adminList: (params?: { category?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.category) query.set("category", params.category);
    if (params?.search) query.set("search", params.search);
    const qs = query.toString();
    return request<{ items: any[]; total: number }>(`/food/admin/all${qs ? `?${qs}` : ""}`);
  },
  create: (data: any) =>
    request<any>("/food", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: any) =>
    request<any>(`/food/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: string) =>
    request<any>(`/food/${id}`, { method: "DELETE" }),
};

// Categories
export const categories = {
  list: () => request<any[]>("/categories"),
  adminList: () => request<any[]>("/categories/admin"),
  create: (data: any) =>
    request<any>("/categories", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: any) =>
    request<any>(`/categories/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: string) =>
    request<any>(`/categories/${id}`, { method: "DELETE" }),
};

// Orders
export const orders = {
  create: (data: any) =>
    request<any>("/orders", { method: "POST", body: JSON.stringify(data) }),
  track: (phone: string, orderNumber?: string) => {
    const query = new URLSearchParams({ phone });
    if (orderNumber) query.set("orderNumber", orderNumber);
    return request<any[]>(`/orders/track?${query}`);
  },
  adminList: (params?: { status?: string }) => {
    const query = new URLSearchParams();
    if (params?.status) query.set("status", params.status);
    const qs = query.toString();
    return request<{ orders: any[]; total: number }>(`/orders/admin${qs ? `?${qs}` : ""}`);
  },
  adminGet: (id: string) => request<any>(`/orders/admin/${id}`),
  adminUpdateStatus: (id: string, status: string) =>
    request<any>(`/orders/admin/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
  adminStats: () => request<any>("/orders/admin/stats/summary"),
};

// Reviews
export const reviews = {
  getByFood: (foodItemId: string) => request<any[]>(`/reviews/food/${foodItemId}`),
  create: (data: any) =>
    request<any>("/reviews", { method: "POST", body: JSON.stringify(data) }),
  adminList: (approved?: string) => {
    const query = new URLSearchParams();
    if (approved) query.set("approved", approved);
    const qs = query.toString();
    return request<any[]>(`/reviews/admin${qs ? `?${qs}` : ""}`);
  },
  adminApprove: (id: string) =>
    request<any>(`/reviews/admin/${id}/approve`, { method: "PATCH" }),
  adminHide: (id: string) =>
    request<any>(`/reviews/admin/${id}/hide`, { method: "PATCH" }),
  adminDelete: (id: string) =>
    request<any>(`/reviews/admin/${id}`, { method: "DELETE" }),
};

// Uploads
export const uploads = {
  image: async (file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    const token = getToken();
    const res = await fetch(`${BASE_URL}/admin/uploads`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    if (!res.ok) throw new Error("Upload failed");
    return res.json();
  },
  delete: (filename: string) =>
    request<any>(`/admin/uploads/${filename}`, { method: "DELETE" }),
};

// SSE for admin notifications
export function subscribeToOrders(callback: (event: any) => void): () => void {
  const eventSource = new EventSource(`${BASE_URL}/admin/notifications/stream`);

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      callback(data);
    } catch {}
  };

  eventSource.onerror = () => {
    setTimeout(() => eventSource.close(), 3000);
  };

  return () => eventSource.close();
}
