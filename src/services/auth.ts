import { API_BASE, handleResponse } from "./client";
import type { Order } from "./orders";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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
  mustReset?: boolean;
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

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
  const response = await fetch(`${API_BASE}/auth/login`, {
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

export async function getUserMe(): Promise<{
  user: User;
  mustReset?: boolean;
}> {
  const token = localStorage.getItem("userToken");
  if (!token) throw new Error("No token found");

  const response = await fetch(`${API_BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse<{ user: User; mustReset?: boolean }>(response);
}

export async function getUserOrders(userId: string): Promise<Order[]> {
  const response = await fetch(`${API_BASE}/orders/user/${userId}`);
  return handleResponse<Order[]>(response);
}

// ---------------------------------------------------------------------------
// Email Verification
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------

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

export async function userChangePassword(
  password: string,
): Promise<{ success: boolean }> {
  const token = localStorage.getItem("userToken");
  if (!token) throw new Error("Not authenticated");

  const response = await fetch(`${API_BASE}/auth/change-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "X-CSRF-Protection": "1",
    },
    body: JSON.stringify({ password }),
  });
  return handleResponse(response);
}
