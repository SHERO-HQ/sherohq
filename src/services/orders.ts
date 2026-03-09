import { API_BASE, handleResponse, authFetch } from "./client";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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
  referralCode?: string;
}

export interface CreateOrderResponse {
  success: boolean;
  orderId: string;
  message: string;
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
  referralCode?: string;
}

// ---------------------------------------------------------------------------
// Public Order API
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Admin Order API
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Payment
// ---------------------------------------------------------------------------

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
