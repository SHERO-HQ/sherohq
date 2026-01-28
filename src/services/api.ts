import type { Product } from "@/data/products";

// Construct API_BASE: prioritize explicit env var, then current origin proxy, fallback to Railway
const getApiBase = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    console.log("📍 Using VITE_API_URL from env:", envUrl);
    return envUrl;
  }

  // If we are in local development, use the local proxy
  if (import.meta.env.DEV) {
    console.log("📍 Development mode: using /api local proxy");
    return "/api";
  }

  // In production, try to use the same-origin /api proxy first (Vercel/Netlify)
  // This is safer for CORS and deployment consistency
  console.log("📍 Production mode: defaulting to /api proxy");
  return "/api";
};

let apiBase = getApiBase();

// Fallback to Railway if absolutely necessary, but we prefer the proxy
// const RAILWAY_URL = "https://sherotech-production.up.railway.app/api";

// Remove trailing slash if present to avoid double slashes
if (apiBase.endsWith("/")) {
  apiBase = apiBase.slice(0, -1);
}

// Append /api if not present (unless it's already just /api)
if (!apiBase.endsWith("/api") && apiBase !== "/api") {
  apiBase = `${apiBase}/api`;
}

const API_BASE = apiBase;

console.log("🚀 Final API URL set to:", API_BASE);
console.log("ℹ️ Site Origin:", globalThis.location.origin);

// Helper to get auth token
function getAuthToken(): string | null {
  return localStorage.getItem("adminToken");
}

// Helper to make authenticated requests
async function authFetch(url: string, options: RequestInit = {}) {
  const token = getAuthToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...options, headers });

  // Clone response to check body
  if (!response.ok) {
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      // Let the caller handle the specific JSON error
      return response;
    } else {
      // It's likely HTML (404/500/Bad Gateway)
      const text = await response.text();
      console.error("API Error (Non-JSON):", text.substring(0, 200)); // Log first 200 chars
      throw new Error(
        `Server Error: ${response.status} ${response.statusText}`,
      );
    }
  }

  return response;
}

// ============ Products API ============

export interface ProductsResponse {
  products: Product[];
}

export async function fetchProducts(
  category?: string,
  search?: string,
): Promise<Product[]> {
  const params = new URLSearchParams();
  if (category && category !== "all") params.append("category", category);
  if (search) params.append("search", search);

  const url = `${API_BASE}/products${params.toString() ? "?" + params.toString() : ""}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }

  return response.json();
}

export async function fetchProduct(id: string): Promise<Product> {
  const response = await fetch(`${API_BASE}/products/${id}`);

  if (!response.ok) {
    throw new Error("Failed to fetch product");
  }

  return response.json();
}

export async function fetchCategories(): Promise<
  { id: string; name: string; icon: string }[]
> {
  const response = await fetch(`${API_BASE}/products/categories/list`);

  if (!response.ok) {
    throw new Error("Failed to fetch categories");
  }

  return response.json();
}

// ============ Orders API ============

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface ShippingInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  region: string;
  postalCode?: string;
}

export interface CreateOrderPayload {
  guestId: string;
  items: OrderItem[];
  total: number;
  shippingInfo: ShippingInfo;
  paymentMethod: string;
  userId?: string;
}

export interface CreateOrderResponse {
  success: boolean;
  orderId: string;
  message: string;
}

export async function createOrder(
  payload: CreateOrderPayload,
): Promise<CreateOrderResponse> {
  const response = await fetch(`${API_BASE}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to create order");
  }

  return response.json();
}

export interface Order {
  id: string;
  guestId: string;
  items: OrderItem[];
  total: number;
  shippingInfo: ShippingInfo;
  paymentMethod: string;
  status: string;
  createdAt: string;
}

export async function fetchGuestOrders(guestId: string): Promise<Order[]> {
  const response = await fetch(`${API_BASE}/orders/guest/${guestId}`);

  if (!response.ok) {
    throw new Error("Failed to fetch orders");
  }

  return response.json();
}

export async function trackOrder(orderId: string): Promise<Order> {
  const response = await fetch(`${API_BASE}/orders/track/${orderId}`);

  if (!response.ok) {
    throw new Error("Order not found");
  }

  return response.json();
}

// ============ User Auth API ============

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  region: string;
  postalCode?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  emailVerified?: boolean;
  shippingAddress?: ShippingAddress | null;
}

export interface UserLoginResponse {
  success: boolean;
  token: string;
  user: User;
}

export async function userRegister(data: {
  email: string;
  password: string;
  name: string;
  phone?: string;
}): Promise<UserLoginResponse> {
  const response = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const error = await response.json();
      throw new Error(error.error || "Registration failed");
    } else {
      const text = await response.text();
      console.error("Register Error (Non-JSON):", text.substring(0, 200));
      throw new Error(
        `Server Error: ${response.status} ${response.statusText}`,
      );
    }
  }

  const result = await response.json();
  localStorage.setItem("userToken", result.token);
  return result;
}

export async function userLogin(data: {
  email: string;
  password: string;
}): Promise<UserLoginResponse> {
  const url = `${API_BASE}/auth/login`;
  console.log("🔑 Attempting Login:", url);

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const error = await response.json();
      throw new Error(error.error || "Login failed");
    } else {
      const text = await response.text();
      console.error("Login Error (Non-JSON):", text.substring(0, 200));
      throw new Error(
        `Server Error: ${response.status} ${response.statusText}`,
      );
    }
  }

  const result = await response.json();
  localStorage.setItem("userToken", result.token);
  return result;
}

export async function userLogout(): Promise<void> {
  const token = localStorage.getItem("userToken");
  if (token) {
    await fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
  }
  localStorage.removeItem("userToken");
}

export async function getUserMe(): Promise<{ user: User }> {
  const token = localStorage.getItem("userToken");
  if (!token) throw new Error("No token found");

  const response = await fetch(`${API_BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error("Not authenticated");
  }

  return response.json();
}

export async function getUserOrders(userId: string): Promise<Order[]> {
  const response = await fetch(`${API_BASE}/orders/user/${userId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch user orders");
  }
  return response.json();
}

// Email Verification
export async function verifyEmail(
  token: string,
): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_BASE}/auth/verify-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Verification failed");
  }

  return response.json();
}

export async function resendVerificationEmail(
  email: string,
): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_BASE}/auth/resend-verification`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to resend verification");
  }

  return response.json();
}

// Profile Update
export async function updateUserProfile(data: {
  name?: string;
  phone?: string;
  shippingAddress?: ShippingAddress;
}): Promise<{ success: boolean; user: User }> {
  const token = localStorage.getItem("userToken");
  if (!token) throw new Error("Not authenticated");

  const response = await fetch(`${API_BASE}/auth/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Profile update failed");
  }

  return response.json();
}

// Inquiry API
export async function scheduleConsultation(data: {
  service: string;
  date: Date;
  time: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
}): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_BASE}/inquiry/schedule`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to schedule consultation");
  }

  return response.json();
}

export async function sendContactMessage(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_BASE}/inquiry/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to send message");
  }

  return response.json();
}

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  admin: AdminUser;
}

export interface AdminStats {
  products: number;
  orders: number;
  revenue: number;
  lowStock: number;
  outOfStock: number;
  pendingOrders: number;
}

// Auth functions
export async function adminLogin(
  username: string,
  password: string,
): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE}/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Login failed");
  }

  const data = await response.json();
  localStorage.setItem("adminToken", data.token);
  return data;
}

export async function adminLogout(): Promise<void> {
  try {
    await authFetch(`${API_BASE}/admin/logout`, { method: "POST" });
  } finally {
    localStorage.removeItem("adminToken");
  }
}

export async function getAdminMe(): Promise<{
  success: boolean;
  admin: AdminUser;
}> {
  const response = await authFetch(`${API_BASE}/admin/me`);

  if (!response.ok) {
    throw new Error("Not authenticated");
  }

  return response.json();
}

export async function getAdminStats(): Promise<AdminStats> {
  const response = await authFetch(`${API_BASE}/admin/stats`);

  if (!response.ok) {
    throw new Error("Failed to fetch stats");
  }

  return response.json();
}

export async function updateAdminProfile(data: {
  username?: string;
  email?: string;
  password?: string;
}): Promise<{
  success: boolean;
  message: string;
  admin: AdminUser;
}> {
  const response = await authFetch(`${API_BASE}/admin/profile`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update profile");
  }

  return response.json();
}

// Admin Product functions
export interface ProductInput {
  name: string;
  category: string;
  price: number;
  originalPrice?: number | null;
  image?: string;
  images?: string[];
  rating?: number;
  reviews?: number;
  badge?: string | null;
  inStock?: boolean;
  stockQuantity?: number;
  description?: string;
  features?: string[];
  specifications?: Record<string, string>;
}

export async function createProduct(
  data: ProductInput,
): Promise<{ success: boolean; product: Product }> {
  const response = await authFetch(`${API_BASE}/products`, {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create product");
  }

  return response.json();
}

export async function updateProduct(
  id: string,
  data: Partial<ProductInput>,
): Promise<{ success: boolean; product: Product }> {
  const response = await authFetch(`${API_BASE}/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update product");
  }

  return response.json();
}

export async function updateProductStock(
  id: string,
  stockQuantity: number,
): Promise<{ success: boolean; product: Product }> {
  const response = await authFetch(`${API_BASE}/products/${id}/stock`, {
    method: "PATCH",
    body: JSON.stringify({ stockQuantity }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update stock");
  }

  return response.json();
}

export async function deleteProduct(
  id: string,
): Promise<{ success: boolean; message: string }> {
  const response = await authFetch(`${API_BASE}/products/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete product");
  }

  return response.json();
}

// ============ Report API ============

export interface DashboardStats {
  revenue: number;
  orders: number;
  products: number;
  lowStock: number;
}

export interface AnalyticsData {
  date: string;
  revenue: number;
  orders: number;
}

export interface TopProduct {
  name: string;
  quantity: number;
  revenue: number;
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const response = await authFetch(`${API_BASE}/reports/stats`);
  if (!response.ok) throw new Error("Failed to fetch stats");
  return response.json();
}

export async function fetchAnalytics(
  range: string = "7d",
): Promise<AnalyticsData[]> {
  const response = await authFetch(
    `${API_BASE}/reports/analytics?range=${range}`,
  );
  if (!response.ok) throw new Error("Failed to fetch analytics");
  return response.json();
}

export async function fetchTopProducts(): Promise<TopProduct[]> {
  const response = await authFetch(`${API_BASE}/reports/top-products`);
  if (!response.ok) throw new Error("Failed to fetch top products");
  return response.json();
}

export interface StockDistribution {
  name: string;
  value: number;
  color: string;
}

export async function fetchStockDistribution(): Promise<StockDistribution[]> {
  const response = await authFetch(`${API_BASE}/reports/stock-distribution`);
  if (!response.ok) throw new Error("Failed to fetch stock distribution");
  return response.json();
}

export interface OrderStatusDistribution {
  name: string;
  value: number;
  color: string;
}

export async function fetchOrderStatusDistribution(): Promise<
  OrderStatusDistribution[]
> {
  const response = await authFetch(`${API_BASE}/reports/order-status`);
  if (!response.ok) throw new Error("Failed to fetch order status");
  return response.json();
}

export interface RecentOrder {
  id: string;
  total: number;
  status: string;
  createdAt: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export async function fetchRecentOrders(): Promise<RecentOrder[]> {
  const response = await authFetch(`${API_BASE}/reports/recent-orders`);
  if (!response.ok) throw new Error("Failed to fetch recent orders");
  return response.json();
}

// Admin Orders functions
export async function fetchAllOrders(
  status?: string,
  startDate?: string,
  endDate?: string,
): Promise<Order[]> {
  const params = new URLSearchParams();
  if (status) params.append("status", status);
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);

  const response = await authFetch(`${API_BASE}/orders?${params.toString()}`);

  if (!response.ok) {
    throw new Error("Failed to fetch orders");
  }

  return response.json();
}

export async function updateOrderStatus(
  id: string,
  status: string,
): Promise<{ success: boolean; order: Order }> {
  const response = await authFetch(`${API_BASE}/orders/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update order status");
  }

  return response.json();
}

// ============ Upload API ============

export async function uploadImage(
  file: File,
): Promise<{ success: boolean; imageUrl: string }> {
  const token = getAuthToken();
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(`${API_BASE}/upload`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to upload image");
  }

  return response.json();
}

// ============ Payment API ============

export async function initializePayment(
  orderId: string,
  totalAmount: number,
  description?: string,
): Promise<{ success: boolean; checkoutUrl: string }> {
  const response = await fetch(`${API_BASE}/payments/initialize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId, totalAmount, description }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to initialize payment");
  }

  return response.json();
}

export async function uploadImages(
  files: File[],
): Promise<{ success: boolean; imageUrls: string[] }> {
  const token = getAuthToken();
  const formData = new FormData();
  files.forEach((file) => formData.append("images", file));

  const response = await fetch(`${API_BASE}/upload/multiple`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to upload images");
  }

  return response.json();
}

// ============ Reviews API ============

export interface Review {
  id: string;
  productId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export async function getProductReviews(productId: string): Promise<Review[]> {
  const response = await fetch(`${API_BASE}/reviews/${productId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch reviews");
  }
  return response.json();
}

export async function submitProductReview(
  productId: string,
  data: { userName: string; rating: number; comment: string },
): Promise<{ success: boolean; review: Review }> {
  const response = await fetch(`${API_BASE}/reviews/${productId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to submit review");
  }

  return response.json();
}
