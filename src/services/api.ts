import type { Product } from "@/types/product";

// Construct API_BASE: prioritize explicit env var, then current origin proxy, fallback to Railway
const getApiBase = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    // If it's a relative path, use it as is
    if (envUrl.startsWith("/")) return envUrl;

    // If it's an absolute URL, ensure it has a protocol
    if (envUrl.includes(".") && !envUrl.startsWith("http")) {
      return `https://${envUrl}`;
    }

    return envUrl;
  }

  // In production, try to use the same-origin /api proxy first (Vercel/Netlify)
  // This is safer for CORS and deployment consistency
  return "/api";
};

let apiBase = getApiBase();

// Remove trailing slash if present to avoid double slashes
if (apiBase.endsWith("/")) {
  apiBase = apiBase.slice(0, -1);
}

// Append /api if not present (unless it's already just /api)
if (!apiBase.endsWith("/api") && apiBase !== "/api") {
  apiBase = `${apiBase}/api`;
}

export const API_BASE = apiBase;
export const API_URL = API_BASE;

// Helper to resolve image URLs
export function getImageUrl(path: string | undefined): string {
  if (!path) return "";

  // If it's already a full URL (http/https), return as is
  if (path.startsWith("http")) return path;

  // If it starts with /uploads, it's a backend upload
  if (path.startsWith("/uploads")) {
    // getApiBase might return /api, so we need the base host
    const base = API_BASE.replace(/\/api$/, "");
    return `${base}${path}`;
  }

  // If it's just a string (emoji/icon) or other local path, return as is
  return path;
}

// Helper to get auth token
function getAuthToken(): string | null {
  return localStorage.getItem("adminToken");
}

// Helper to safely parse JSON and handle errors
async function handleResponse<T>(response: Response): Promise<T> {
  const text = await response.text();

  if (!response.ok) {
    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      try {
        const errorData = JSON.parse(text);
        throw new Error(errorData.error || `Error ${response.status}`);
      } catch {
        throw new Error(
          `Server Error: ${response.status} ${response.statusText}`,
        );
      }
    }
    console.error("API Error (Non-JSON):", text.substring(0, 200));
    throw new Error(`Server Error: ${response.status} ${response.statusText}`);
  }

  if (!text) {
    if (response.status === 204) return {} as T;
    throw new Error("Server returned an empty response.");
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    console.error("JSON Parse Error:", text.substring(0, 200));
    throw new Error("Failed to parse server response.");
  }
}

// Helper to make authenticated requests
export async function authFetch(url: string, options: RequestInit = {}) {
  const token = getAuthToken();
  const headers: HeadersInit = {
    ...options.headers,
  };

  // Only set application/json if not FormData and not already set
  if (!(options.body instanceof FormData)) {
    (headers as Record<string, string>)["Content-Type"] = "application/json";
  }

  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  // Explicit CSRF Protection header
  (headers as Record<string, string>)["X-CSRF-Protection"] = "1";

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include", // Enable cookie-based auth
  });
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
  return handleResponse<Product[]>(response);
}

export async function fetchProduct(id: string): Promise<Product> {
  const response = await fetch(`${API_BASE}/products/${id}`);
  return handleResponse<Product>(response);
}

// ============ Categories API ============

export async function fetchCategories(): Promise<
  { id: string; name: string; icon: string }[]
> {
  const response = await fetch(`${API_BASE}/products/categories/list`);
  return handleResponse(response);
}

export async function createCategory(data: {
  name: string;
  icon: string;
}): Promise<{ id: string } & typeof data> {
  const response = await authFetch(`${API_BASE}/products/categories`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function updateCategory(
  id: string,
  data: { name: string; icon: string },
): Promise<{ id: string } & typeof data> {
  const response = await authFetch(`${API_BASE}/products/categories/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function deleteCategory(id: string): Promise<{ success: true }> {
  const response = await authFetch(`${API_BASE}/products/categories/${id}`, {
    method: "DELETE",
  });
  return handleResponse(response);
}

// ============ Orders API ============

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  sku?: string;
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
      "X-CSRF-Protection": "1",
    },
    body: JSON.stringify(payload),
  });

  return handleResponse<CreateOrderResponse>(response);
}

export interface Order {
  id: string;
  guestId: string;
  items: OrderItem[];
  total: number;
  shippingInfo: ShippingInfo;
  paymentMethod: string;
  status: string;
  createdAt: Date;
}

export async function createAdminOrder(data: {
  shippingInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    region: string;
  };
  items: {
    id?: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
    sku?: string;
  }[];
  total: number;
  status: "pending" | "quote";
}): Promise<{ success: true; order: Order }> {
  const response = await authFetch(`${API_BASE}/orders/admin`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function fetchGuestOrders(guestId: string): Promise<Order[]> {
  const response = await fetch(`${API_BASE}/orders/guest/${guestId}`);
  return handleResponse<Order[]>(response);
}

export async function trackOrder(orderId: string): Promise<Order> {
  const response = await fetch(`${API_BASE}/orders/track/${orderId}`);
  return handleResponse<Order>(response);
}

export async function updateOrderPaymentMethod(
  id: string,
  payload: { paymentMethod: string; guestId?: string; userId?: string },
): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE}/orders/${id}/payment-method`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Protection": "1",
    },
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
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
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Protection": "1",
    },
    body: JSON.stringify(data),
  });

  const result = await handleResponse<UserLoginResponse>(response);
  localStorage.setItem("userToken", result.token);
  return result;
}

export async function userLogin(data: {
  email: string;
  password: string;
}): Promise<UserLoginResponse> {
  const url = `${API_BASE}/auth/login`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Protection": "1",
      },
      body: JSON.stringify(data),
    });

    const result = await handleResponse<UserLoginResponse>(response);
    localStorage.setItem("userToken", result.token);
    return result;
  } catch (error) {
    console.error("Login API Network Error Details:", {
      message: error instanceof Error ? error.message : String(error),
      url,
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  }
}

export async function userLogout(): Promise<void> {
  const token = localStorage.getItem("userToken");
  if (token) {
    await fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "X-CSRF-Protection": "1",
      },
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

  return handleResponse<{ user: User }>(response);
}

export async function getUserOrders(userId: string): Promise<Order[]> {
  const response = await fetch(`${API_BASE}/orders/user/${userId}`);
  return handleResponse<Order[]>(response);
}

// Email Verification
export async function verifyEmail(
  token: string,
): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_BASE}/auth/verify-email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Protection": "1",
    },
    body: JSON.stringify({ token }),
  });

  return handleResponse(response);
}

export async function resendVerificationEmail(
  email: string,
): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_BASE}/auth/resend-verification`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Protection": "1",
    },
    body: JSON.stringify({ email }),
  });

  return handleResponse(response);
}

// Profile Update
export async function updateUserProfile(data: {
  name?: string;
  phone?: string;
  shippingAddress?: ShippingAddress | null;
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

  return handleResponse(response);
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
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Protection": "1",
    },
    body: JSON.stringify(data),
  });

  return handleResponse(response);
}

export async function sendContactMessage(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_BASE}/inquiry/contact`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Protection": "1",
    },
    body: JSON.stringify(data),
  });

  return handleResponse(response);
}

export async function createTicket(data: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  category: string;
  priority?: string;
  productId?: string;
  userId?: string;
}): Promise<{
  success: boolean;
  message: string;
  ticketId: string;
  ticketNo: number;
}> {
  const response = await fetch(`${API_BASE}/tickets`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Protection": "1",
    },
    body: JSON.stringify(data),
  });

  return handleResponse(response);
}

export interface SupportTicket {
  id: string;
  ticket_no: number;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  category: string;
  productId?: string;
  userId?: string;
  status: string;
  createdAt: string;
}

export interface Consultation {
  id: string;
  name: string;
  email: string;
  phone?: string;
  service: string;
  date: string;
  time: string;
  message?: string;
  status: string;
  createdAt: string;
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  status: string;
  createdAt: string;
}

export async function fetchSupportTickets(): Promise<SupportTicket[]> {
  const response = await authFetch(`${API_BASE}/tickets`);
  return handleResponse(response);
}

export async function updateTicketStatus(
  id: string,
  status: string,
): Promise<{ success: boolean; ticket: SupportTicket }> {
  const response = await authFetch(`${API_BASE}/tickets/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  return handleResponse(response);
}

export async function fetchConsultations(): Promise<Consultation[]> {
  const response = await authFetch(`${API_BASE}/inquiry/consultations`);
  return handleResponse(response);
}

export async function updateConsultationStatus(
  id: string,
  status: string,
): Promise<{ success: boolean; consultation: Consultation }> {
  const response = await authFetch(
    `${API_BASE}/inquiry/consultations/${id}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    },
  );
  return handleResponse(response);
}

export async function deleteConsultation(
  id: string,
): Promise<{ success: boolean; message: string }> {
  const response = await authFetch(`${API_BASE}/inquiry/consultations/${id}`, {
    method: "DELETE",
  });
  return handleResponse(response);
}

export async function fetchInquiries(): Promise<Inquiry[]> {
  const response = await authFetch(`${API_BASE}/inquiry/list`);
  return handleResponse(response);
}

export async function updateInquiryStatus(
  id: string,
  status: string,
): Promise<{ success: boolean; inquiry: Inquiry }> {
  const response = await authFetch(
    `${API_BASE}/inquiry/inquiries/${id}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    },
  );
  return handleResponse(response);
}

export async function deleteInquiry(
  id: string,
): Promise<{ success: boolean; message: string }> {
  const response = await authFetch(`${API_BASE}/inquiry/inquiries/${id}`, {
    method: "DELETE",
  });
  return handleResponse(response);
}

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: string;
  avatar?: string;
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
  revenueGrowth: number;
  ordersGrowth: number;
  newProductsCount: number;
  pendingGrowth: number;
}

// Auth functions
export async function adminLogin(
  username: string,
  password: string,
): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE}/admin/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Protection": "1",
    },
    body: JSON.stringify({ username, password }),
  });

  const data = await handleResponse<LoginResponse>(response);
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
  return handleResponse(response);
}

export async function fetchRegionalReport(): Promise<RegionalData[]> {
  const response = await authFetch(`${API_BASE}/reports/regional`);
  return handleResponse<RegionalData[]>(response);
}

export async function getAdminStats(): Promise<AdminStats> {
  const response = await authFetch(`${API_BASE}/reports/stats`);
  return handleResponse(response);
}

export async function updateAdminProfile(data: {
  username?: string;
  email?: string;
  password?: string;
  avatar?: string;
}): Promise<{
  success: boolean;
  message: string;
  admin: AdminUser;
}> {
  const response = await authFetch(`${API_BASE}/admin/profile`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

  return handleResponse(response);
}

// Admin Product functions
export interface ProductInput {
  name: string;
  sku?: string;
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

  return handleResponse(response);
}

export async function updateProduct(
  id: string,
  data: Partial<ProductInput>,
): Promise<{ success: boolean; product: Product }> {
  const response = await authFetch(`${API_BASE}/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

  return handleResponse(response);
}

export async function updateProductStock(
  id: string,
  stockQuantity: number,
): Promise<{ success: boolean; product: Product }> {
  const response = await authFetch(`${API_BASE}/products/${id}/stock`, {
    method: "PATCH",
    body: JSON.stringify({ stockQuantity }),
  });

  return handleResponse(response);
}

export async function deleteProduct(
  id: string,
): Promise<{ success: boolean; message: string }> {
  const response = await authFetch(`${API_BASE}/products/${id}`, {
    method: "DELETE",
  });

  return handleResponse(response);
}

export async function uploadImage(
  file: File,
): Promise<{ success: boolean; imageUrl: string; filename: string }> {
  const formData = new FormData();
  formData.append("image", file);

  const response = await authFetch(`${API_BASE}/upload`, {
    method: "POST",
    body: formData,
  });

  return handleResponse(response);
}

export async function uploadImages(
  files: File[],
): Promise<{ success: boolean; imageUrls: string[]; filenames: string[] }> {
  const formData = new FormData();
  files.forEach((file) => formData.append("images", file));

  const response = await authFetch(`${API_BASE}/upload/multiple`, {
    method: "POST",
    body: formData,
  });

  return handleResponse(response);
}

// ============ Report API ============

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

export async function fetchDashboardStats(): Promise<AdminStats> {
  const response = await authFetch(`${API_BASE}/reports/stats`);
  return handleResponse<AdminStats>(response);
}

export interface RegionalData {
  name: string;
  orders: number;
  revenue: number;
}

export async function fetchAnalytics(
  range: string = "7d",
): Promise<AnalyticsData[]> {
  const response = await authFetch(
    `${API_BASE}/reports/analytics?range=${range}`,
  );
  return handleResponse<AnalyticsData[]>(response);
}

export async function fetchTopProducts(): Promise<TopProduct[]> {
  const response = await authFetch(`${API_BASE}/reports/top-products`);
  return handleResponse<TopProduct[]>(response);
}

export interface StockDistribution {
  name: string;
  value: number;
  color: string;
}

export async function fetchStockDistribution(): Promise<StockDistribution[]> {
  const response = await authFetch(`${API_BASE}/reports/stock-distribution`);
  return handleResponse<StockDistribution[]>(response);
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
  return handleResponse<OrderStatusDistribution[]>(response);
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
  return handleResponse<RecentOrder[]>(response);
}

// Activity Log functions
export interface ActivityLog {
  id: string;
  adminId: string;
  adminName?: string;
  action: string;
  details?: string;
  type: "info" | "success" | "warning" | "error";
  createdAt: string;
}

export async function fetchActivityLogs(): Promise<ActivityLog[]> {
  const response = await authFetch(`${API_BASE}/admin/activity`);
  return handleResponse<ActivityLog[]>(response);
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
  return handleResponse<Order[]>(response);
}

export async function fetchOrderById(id: string): Promise<Order> {
  const response = await authFetch(`${API_BASE}/orders/${id}`);
  return handleResponse<Order>(response);
}

export async function updateOrderStatus(
  id: string,
  status: string,
): Promise<{ success: boolean; order: Order }> {
  const response = await authFetch(`${API_BASE}/orders/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });

  return handleResponse(response);
}

// ============ Payment API ============

export async function initializePayment(
  orderId: string,
  totalAmount: number,
  description?: string,
  provider?: "hubtel" | "paystack",
): Promise<{ success: boolean; checkoutUrl: string }> {
  const response = await fetch(`${API_BASE}/payments/initialize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId, totalAmount, description, provider }),
  });

  return handleResponse(response);
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
  return handleResponse<Review[]>(response);
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

  return handleResponse(response);
}

export async function fetchAdminReviews(): Promise<Review[]> {
  const response = await authFetch(`${API_BASE}/admin/reviews`);
  return handleResponse<Review[]>(response);
}

export async function deleteReview(id: string): Promise<{ success: boolean }> {
  const response = await authFetch(`${API_BASE}/admin/reviews/${id}`, {
    method: "DELETE",
  });
  return handleResponse(response);
}

// ============ Team API ============

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  image?: string;
  bio?: string;
  social: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    [key: string]: string | undefined;
  };
  order?: number;
}

export async function fetchTeam(): Promise<TeamMember[]> {
  const response = await fetch(`${API_BASE}/team`);
  return handleResponse<TeamMember[]>(response);
}

export async function createTeamMember(
  data: Omit<TeamMember, "id">,
): Promise<TeamMember> {
  const response = await authFetch(`${API_BASE}/team`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<TeamMember>(response);
}

export async function updateTeamMember(
  id: string,
  data: Partial<TeamMember>,
): Promise<TeamMember> {
  const response = await authFetch(`${API_BASE}/team/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<TeamMember>(response);
}

export async function deleteTeamMember(
  id: string,
): Promise<{ message: string }> {
  const response = await authFetch(`${API_BASE}/team/${id}`, {
    method: "DELETE",
  });
  return handleResponse<{ message: string }>(response);
}

// ============ Admin Users API ============

export interface AdminUserListItem {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  avatar: string | null;
  emailVerified: boolean;
  createdAt: string;
}

export interface AdminUserDetails extends AdminUserListItem {
  shippingAddress: string | null;
}

export interface AdminUserStats {
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string | null;
}

export interface AdminUsersPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AdminUsersResponse {
  users: AdminUserListItem[];
  pagination: AdminUsersPagination;
}

export interface AdminUserDetailsResponse {
  user: AdminUserDetails;
  orders: Order[];
  stats: AdminUserStats;
}

export async function fetchAdminUsers(
  page = 1,
  limit = 20,
  search = "",
): Promise<AdminUsersResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(search && { search }),
  });

  const response = await authFetch(`${API_BASE}/admin/users?${params}`);
  return handleResponse<AdminUsersResponse>(response);
}

export async function fetchAdminUserDetails(
  userId: string,
): Promise<AdminUserDetailsResponse> {
  const response = await authFetch(`${API_BASE}/admin/users/${userId}`);
  return handleResponse<AdminUserDetailsResponse>(response);
}

export async function deleteAdminUser(
  userId: string,
): Promise<{ success: boolean; message: string }> {
  const response = await authFetch(`${API_BASE}/admin/users/${userId}`, {
    method: "DELETE",
  });
  return handleResponse(response);
}

// ============ Projects API ============

import type { Project } from "@/types/project";
import type { Testimonial } from "@/types/testimonial";
import type { SiteStat } from "@/types/stat";

export type { Project, Testimonial, SiteStat };

export async function fetchProjects(category?: string): Promise<Project[]> {
  const params = new URLSearchParams();
  if (category && category !== "All") params.append("category", category);
  const response = await fetch(`${API_BASE}/projects?${params.toString()}`);
  return handleResponse<Project[]>(response);
}

export async function fetchProjectById(id: string): Promise<Project> {
  const response = await fetch(`${API_BASE}/projects/${id}`);
  return handleResponse<Project>(response);
}

export async function createProject(
  data: Partial<Project>,
): Promise<{ success: boolean; project: Project }> {
  const response = await authFetch(`${API_BASE}/projects`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function updateProject(
  id: string,
  data: Partial<Project>,
): Promise<{ success: boolean; project: Project }> {
  const response = await authFetch(`${API_BASE}/projects/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function deleteProject(
  id: string,
): Promise<{ success: boolean; message: string }> {
  const response = await authFetch(`${API_BASE}/projects/${id}`, {
    method: "DELETE",
  });
  return handleResponse(response);
}

// ============ Testimonials API ============

export async function fetchTestimonials(): Promise<Testimonial[]> {
  const response = await fetch(`${API_BASE}/testimonials`);
  return handleResponse<Testimonial[]>(response);
}

export async function fetchAdminTestimonials(): Promise<Testimonial[]> {
  const response = await authFetch(`${API_BASE}/testimonials/admin`);
  return handleResponse<Testimonial[]>(response);
}

export async function createTestimonial(
  data: Partial<Testimonial>,
): Promise<Testimonial> {
  const response = await authFetch(`${API_BASE}/testimonials`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<Testimonial>(response);
}

export async function updateTestimonial(
  id: string,
  data: Partial<Testimonial>,
): Promise<Testimonial> {
  const response = await authFetch(`${API_BASE}/testimonials/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<Testimonial>(response);
}

export async function deleteTestimonial(
  id: string,
): Promise<{ message: string }> {
  const response = await authFetch(`${API_BASE}/testimonials/${id}`, {
    method: "DELETE",
  });
  return handleResponse<{ message: string }>(response);
}

// ============ Stats API ============

export async function fetchStats(): Promise<SiteStat[]> {
  const response = await fetch(`${API_BASE}/stats`);
  return handleResponse<SiteStat[]>(response);
}

export async function createStat(data: Partial<SiteStat>): Promise<SiteStat> {
  const response = await authFetch(`${API_BASE}/stats`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<SiteStat>(response);
}

export async function updateStat(
  id: string,
  data: Partial<SiteStat>,
): Promise<SiteStat> {
  const response = await authFetch(`${API_BASE}/stats/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<SiteStat>(response);
}

export async function deleteStat(id: string): Promise<{ message: string }> {
  const response = await authFetch(`${API_BASE}/stats/${id}`, {
    method: "DELETE",
  });
  return handleResponse<{ message: string }>(response);
}
