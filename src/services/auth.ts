import { API_BASE, handleResponse, authFetch } from "./client";
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
  gpsAddress?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  emailVerified?: boolean;
  mfaEnabled?: boolean;
  shippingAddress?: ShippingAddress | null;
}

export interface UserLoginResponse {
  success: boolean;
  token?: string;
  user: User;
  mustReset?: boolean;
  requiresMFA?: boolean;
  mfaToken?: string;
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
  const response = await authFetch(`${API_BASE}/auth/register`, {
    method: "POST",
    body: JSON.stringify(data),
  });

  return handleResponse<UserLoginResponse>(response);
}

export async function userLogin(data: {
  email: string;
  password: string;
}): Promise<UserLoginResponse> {
  const response = await authFetch(`${API_BASE}/auth/login`, {
    method: "POST",
    body: JSON.stringify(data),
  });

  return handleResponse<UserLoginResponse>(response);
}

export async function userLogout(): Promise<void> {
  await authFetch(`${API_BASE}/auth/logout`, {
    method: "POST",
  }).catch(() => {});
}

export async function getUserMe(): Promise<{
  user: User;
  mustReset?: boolean;
}> {
  const response = await authFetch(`${API_BASE}/auth/me`);
  return handleResponse<{ user: User; mustReset?: boolean }>(response);
}

export async function getUserOrders(userId: string): Promise<Order[]> {
  const response = await authFetch(`${API_BASE}/orders/user/${userId}`);
  return handleResponse<Order[]>(response);
}

// ---------------------------------------------------------------------------
// Email Verification
// ---------------------------------------------------------------------------

export async function verifyEmail(
  token: string,
): Promise<{ success: boolean; message: string }> {
  const response = await authFetch(`${API_BASE}/auth/verify-email`, {
    method: "POST",
    body: JSON.stringify({ token }),
  });
  return handleResponse(response);
}

export async function resendVerificationEmail(
  email: string,
): Promise<{ success: boolean; message: string }> {
  const response = await authFetch(`${API_BASE}/auth/resend-verification`, {
    method: "POST",
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
  const response = await authFetch(`${API_BASE}/auth/profile`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function userChangePassword(
  currentPassword: string,
  password: string,
): Promise<{ success: boolean }> {
  const response = await authFetch(`${API_BASE}/auth/change-password`, {
    method: "POST",
    body: JSON.stringify({ currentPassword, password }),
  });
  return handleResponse(response);
}

// ---------------------------------------------------------------------------
// Password Recovery
// ---------------------------------------------------------------------------

export async function requestPasswordReset(
  email: string,
): Promise<{ success: boolean; message: string }> {
  const response = await authFetch(`${API_BASE}/auth/forgot-password`, {
    method: "POST",
    body: JSON.stringify({ email }),
  });
  return handleResponse(response);
}

export async function resetPassword(
  token: string,
  password: string,
): Promise<{ success: boolean; message: string }> {
  const response = await authFetch(`${API_BASE}/auth/reset-password`, {
    method: "POST",
    body: JSON.stringify({ token, password }),
  });
  return handleResponse(response);
}
