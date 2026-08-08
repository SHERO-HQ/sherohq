import { API_BASE, handleResponse, authFetch } from "./client";
import type { Order } from "./orders";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: string;
  phone?: string;
  avatar?: string;
  isActive?: boolean;
  mfaEnabled?: boolean;
  createdAt?: string;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  admin?: AdminUser;
  requiresMFA?: boolean;
  mfaToken?: string;
  mustReset?: boolean;
}

export interface KPIData {
  revenue: number;
  expenses: number;
  profit: number;
  orders: number;
  revenueGrowth: number;
  ordersGrowth: number;
  profitGrowth: number;
  newProducts: number;
}

export interface AdminStats {
  products: number;
  orders: number;
  revenue: number;
  profit: number;
  expenses: number;
  lowStock: number;
  outOfStock: number;
  pendingOrders: number;
  abandonedCarts: number;
  revenueGrowth: number;
  ordersGrowth: number;
  newProductsCount: number;
  pendingGrowth: number;
  lifetimeRevenue?: number;
  lifetimeExpenses?: number;
  kpis: {
    today: KPIData;
    week: KPIData;
    month: KPIData;
    year: KPIData;
    custom?: KPIData | null;
  };
}

export interface ActivityLog {
  id: string;
  adminId: string;
  adminName?: string;
  action: string;
  details?: string;
  type: "info" | "success" | "warning" | "error";
  createdAt: string;
}

export interface AdminUserListItem {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  avatar: string | null;
  emailVerified: boolean;
  isActive: boolean;
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
  success: boolean;
  users: AdminUser[];
}

export interface AdminUserDetailsResponse {
  success: boolean;
  user: AdminUser;
}

export interface CustomersResponse {
  users: AdminUserListItem[];
  pagination: AdminUsersPagination;
}

export interface CustomerDetailsResponse {
  user: AdminUserDetails;
  orders: Order[];
  stats: AdminUserStats;
}

export interface AIAnalyticsTotals {
  totalInteractions: number;
  imageInteractions: number;
  failedRecommendations: number;
  openGapRequests: number;
}

export interface AIAnalyticsSummary {
  topIntents: { intent: string; count: string | number }[];
  topGaps: { keyword: string; queryCount: number; lastRequested: string }[];
  dailyVolume: { day: string; count: string | number }[];
  totals: AIAnalyticsTotals;
}

export interface GlobalSearchResult {
  products: any[];
  orders: any[];
  users: any[];
  inquiries: any[];
}

// ---------------------------------------------------------------------------
// Admin Auth
// ---------------------------------------------------------------------------

export async function adminLogin(
  username: string,
  password: string,
): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE}/admin-auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Protection": "1",
    },
    credentials: "include",
    body: JSON.stringify({ username, password }),
  });

  return handleResponse<LoginResponse>(response);
}

export async function adminChangePassword(
  currentPassword: string,
  password: string,
): Promise<{ success: boolean }> {
  const response = await authFetch(`${API_BASE}/admin/change-password`, {
    method: "POST",
    body: JSON.stringify({ currentPassword, password }),
  });
  return handleResponse(response);
}

export async function adminLogout(): Promise<void> {
  await authFetch(`${API_BASE}/admin-auth/logout`, { method: "POST" }).catch(() => {});
}

export async function getAdminMe(): Promise<{
  success: boolean;
  admin: AdminUser;
}> {
  const response = await authFetch(`${API_BASE}/admin-auth/me`);
  return handleResponse(response);
}

export async function updateAdminProfile(data: {
  username?: string;
  email?: string;
  password?: string;
  phone?: string;
  avatar?: string;
}): Promise<AdminUserDetailsResponse> {
  const response = await authFetch(`${API_BASE}/admin/profile`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

// ---------------------------------------------------------------------------
// MFA Operations
// ---------------------------------------------------------------------------

export async function setupAdminMFA(): Promise<{
  success: boolean;
  secret: string;
  qrCode: string;
  otpAuthUrl: string;
}> {
  const response = await authFetch(`${API_BASE}/admin-auth/mfa/setup`, {
    method: "POST",
  });
  return handleResponse(response);
}

export async function verifyAdminMFASetup(code: string): Promise<{
  success: boolean;
  message: string;
}> {
  const response = await authFetch(`${API_BASE}/admin-auth/mfa/verify`, {
    method: "POST",
    body: JSON.stringify({ code }),
  });
  return handleResponse(response);
}

export async function loginWithMFA(
  mfaToken: string,
  code: string,
): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE}/admin-auth/login/mfa`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ mfaToken, code }),
  });
  return handleResponse<LoginResponse>(response);
}

// ---------------------------------------------------------------------------
// Admin User Management
// ---------------------------------------------------------------------------

export async function fetchAdminUsers(): Promise<AdminUsersResponse> {
  const response = await authFetch(`${API_BASE}/admin/users`);
  return handleResponse<AdminUsersResponse>(response);
}

export async function fetchCustomers(
  page = 1,
  limit = 20,
  search = "",
): Promise<CustomersResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (search) params.append("search", search);

  const response = await authFetch(
    `${API_BASE}/admin/customers?${params.toString()}`,
  );
  return handleResponse<CustomersResponse>(response);
}

export async function registerAdminUser(data: {
  username: string;
  email: string;
  password: string;
  phone?: string;
  role: string;
}): Promise<{ success: boolean; admin: AdminUser }> {
  const payload: Record<string, string> = {
    username: data.username,
    email: data.email,
    password: data.password,
    role: data.role,
  };
  if (data.phone && data.phone.trim() !== "") {
    payload.phone = data.phone.trim();
  }
  const response = await authFetch(`${API_BASE}/admin/register`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
}

export async function updateAdminUserRole(
  id: string,
  role: string,
): Promise<{ success: boolean; message: string }> {
  const response = await authFetch(`${API_BASE}/admin/users/${id}`, {
    method: "PUT",
    body: JSON.stringify({ role }),
  });
  return handleResponse(response);
}

export async function fetchAdminUserDetails(
  userId: string,
): Promise<AdminUserDetailsResponse> {
  const response = await authFetch(`${API_BASE}/admin/users/${userId}`);
  return handleResponse<AdminUserDetailsResponse>(response);
}

export async function fetchCustomerDetails(
  userId: string,
): Promise<CustomerDetailsResponse> {
  const response = await authFetch(`${API_BASE}/admin/customers/${userId}`);
  return handleResponse<CustomerDetailsResponse>(response);
}

export async function deleteAdminUser(
  userId: string,
): Promise<{ success: boolean; message: string }> {
  const response = await authFetch(`${API_BASE}/admin/users/${userId}`, {
    method: "DELETE",
  });
  return handleResponse(response);
}

export async function adminResetStaffPassword(
  userId: string,
): Promise<{ success: boolean; message: string }> {
  const response = await authFetch(
    `${API_BASE}/admin/users/${userId}/reset-password`,
    { method: "POST" },
  );
  return handleResponse(response);
}

export async function adminToggleStaffActive(
  userId: string,
  isActive: boolean,
): Promise<{ success: boolean }> {
  const response = await authFetch(`${API_BASE}/admin/users/${userId}`, {
    method: "PATCH",
    body: JSON.stringify({ isActive }),
  });
  return handleResponse(response);
}

export async function deleteCustomer(
  userId: string,
): Promise<{ success: boolean; message: string }> {
  const response = await authFetch(`${API_BASE}/admin/customers/${userId}`, {
    method: "DELETE",
  });
  return handleResponse(response);
}

export async function adminResetUserPassword(
  userId: string,
): Promise<{ success: boolean; message: string }> {
  const response = await authFetch(
    `${API_BASE}/admin/customers/${userId}/reset-password`,
    { method: "POST" },
  );
  return handleResponse(response);
}

export async function adminToggleUserActive(
  userId: string,
  isActive: boolean,
): Promise<{ success: boolean }> {
  const response = await authFetch(`${API_BASE}/admin/customers/${userId}`, {
    method: "PATCH",
    body: JSON.stringify({ isActive }),
  });
  return handleResponse(response);
}

// ---------------------------------------------------------------------------
// Activity Logs
// ---------------------------------------------------------------------------

export async function fetchActivityLogs(): Promise<ActivityLog[]> {
  const response = await authFetch(`${API_BASE}/admin/activity`);
  return handleResponse<ActivityLog[]>(response);
}

// ---------------------------------------------------------------------------
// Reports
// ---------------------------------------------------------------------------

export interface AnalyticsData {
  date: string;
  revenue: number;
  expenses: number;
  profit: number;
  orders: number;
}

export interface TopProduct {
  name: string;
  quantity: number;
  revenue: number;
}

export interface RegionalData {
  name: string;
  orders: number;
  revenue: number;
}

export interface StockDistribution {
  name: string;
  value: number;
  color: string;
}

export interface OrderStatusDistribution {
  name: string;
  value: number;
  color: string;
  fill?: string;
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

export async function getAdminStats(): Promise<AdminStats> {
  const response = await authFetch(`${API_BASE}/reports/stats`);
  return handleResponse(response);
}

export async function fetchDashboardStats(
  startDate?: string,
  endDate?: string,
): Promise<AdminStats> {
  const params = new URLSearchParams();
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);
  const url = `${API_BASE}/reports/stats${params.toString() ? "?" + params.toString() : ""}`;
  const response = await authFetch(url);
  return handleResponse<AdminStats>(response);
}

export async function fetchAnalytics(
  range: string = "7d",
  startDate?: string,
  endDate?: string,
): Promise<AnalyticsData[]> {
  let url = `${API_BASE}/reports/analytics?range=${range}`;
  if (startDate && endDate) {
    url += `&startDate=${startDate}&endDate=${endDate}`;
  }
  const response = await authFetch(url);
  return handleResponse<AnalyticsData[]>(response);
}

export async function fetchTopProducts(
  startDate?: string,
  endDate?: string,
): Promise<TopProduct[]> {
  const params = new URLSearchParams();
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);
  const url = `${API_BASE}/reports/top-products${params.toString() ? "?" + params.toString() : ""}`;
  const response = await authFetch(url);
  return handleResponse<TopProduct[]>(response);
}

export async function fetchStockDistribution(): Promise<StockDistribution[]> {
  const response = await authFetch(`${API_BASE}/reports/stock-distribution`);
  return handleResponse<StockDistribution[]>(response);
}

export async function fetchOrderStatusDistribution(
  startDate?: string,
  endDate?: string,
): Promise<OrderStatusDistribution[]> {
  const params = new URLSearchParams();
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);
  const url = `${API_BASE}/reports/order-status${params.toString() ? "?" + params.toString() : ""}`;
  const response = await authFetch(url);
  return handleResponse<OrderStatusDistribution[]>(response);
}

export async function fetchRegionalReport(
  startDate?: string,
  endDate?: string,
): Promise<RegionalData[]> {
  const params = new URLSearchParams();
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);
  const url = `${API_BASE}/reports/regional${params.toString() ? "?" + params.toString() : ""}`;
  const response = await authFetch(url);
  return handleResponse<RegionalData[]>(response);
}

export async function fetchRecentOrders(
  startDate?: string,
  endDate?: string,
): Promise<RecentOrder[]> {
  const params = new URLSearchParams();
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);
  const url = `${API_BASE}/reports/recent-orders${params.toString() ? "?" + params.toString() : ""}`;
  const response = await authFetch(url);
  return handleResponse<RecentOrder[]>(response);
}

export async function fetchAIAnalyticsSummary(): Promise<{
  success: boolean;
  data: AIAnalyticsSummary;
}> {
  const response = await authFetch(`${API_BASE}/analytics/summary`);
  return handleResponse(response);
}

export async function globalAdminSearch(
  query: string,
): Promise<GlobalSearchResult> {
  const response = await authFetch(
    `${API_BASE}/admin/search?q=${encodeURIComponent(query)}`,
  );
  return handleResponse<GlobalSearchResult>(response);
}
