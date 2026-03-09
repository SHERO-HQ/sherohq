import type { Product } from "@/types/product";
import type { Project } from "@/types/project";
import type { Testimonial } from "@/types/testimonial";
import type { SiteStat } from "@/types/stat";

// Re-export domain types for convenience
export type { Product, Project, Testimonial, SiteStat };

// ---------------------------------------------------------------------------
// API Base URL
// ---------------------------------------------------------------------------

const getApiBase = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;

  if (envUrl) {
    if (envUrl.startsWith("/")) return envUrl;
    if (envUrl.includes(".") && !envUrl.startsWith("http")) {
      return `https://${envUrl}`;
    }
    return envUrl;
  }

  // Same-origin /api proxy (Vercel/Netlify rewrites)
  return "/api";
};

let apiBase = getApiBase();

if (apiBase.endsWith("/")) {
  apiBase = apiBase.slice(0, -1);
}

if (!apiBase.endsWith("/api") && apiBase !== "/api") {
  apiBase = `${apiBase}/api`;
}

export const API_BASE = apiBase;
export const API_URL = API_BASE;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function getImageUrl(path: string | undefined): string {
  if (!path) return "";
  if (path.startsWith("http")) return path;

  if (path.startsWith("/uploads")) {
    const base = API_BASE.replace(/\/api$/, "");
    return `${base}${path}`;
  }

  return path;
}

function getAuthToken(): string | null {
  return localStorage.getItem("adminToken");
}

function getStatusErrorMessage(status: number): string | null {
  const statusMap: Record<number, string> = {
    400: "Bad Request: Please check your input.",
    401: "Unauthorized: Invalid credentials or session expired.",
    403: "Forbidden: You do not have permission to perform this action.",
    404: "Not Found: The requested resource does not exist.",
    422: "Unprocessable Entity: Please check your data format.",
    429: "Too Many Requests: Please try again later.",
    500: "Server Error: Something went wrong on our end.",
    502: "Service Unavailable: The server is temporarily down.",
    503: "Service Unavailable: The server is temporarily down.",
    504: "Service Unavailable: The server is temporarily down.",
  };
  return statusMap[status] || null;
}

export async function handleResponse<T>(response: Response): Promise<T> {
  const text = await response.text();

  if (!response.ok) {
    const contentType = response.headers.get("content-type");
    let errorMessage = `Error ${response.status}`;

    if (contentType?.includes("application/json")) {
      try {
        const errorData = JSON.parse(text);
        if (Array.isArray(errorData.issues) && errorData.issues.length > 0) {
          errorMessage = errorData.issues
            .map((i: { field?: string; message: string }) =>
              i.field ? `${i.field}: ${i.message}` : i.message,
            )
            .join("; ");
        } else {
          errorMessage =
            errorData.error ||
            errorData.message ||
            errorData.detail ||
            (Array.isArray(errorData.errors) && errorData.errors[0]?.message) ||
            errorMessage;
        }
      } catch {
        // Fallback to status-based messages
      }
    }

    if (errorMessage.startsWith("Error ")) {
      errorMessage = getStatusErrorMessage(response.status) || errorMessage;
    }

    throw new Error(errorMessage);
  }

  if (!text) {
    return (response.status === 204 ? {} : null) as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    console.error("JSON Parse Error:", text.substring(0, 200));
    throw new Error("Failed to parse server response.");
  }
}

export async function authFetch(url: string, options: RequestInit = {}) {
  const token = getAuthToken();
  const headers: HeadersInit = {
    ...options.headers,
  };

  if (!(options.body instanceof FormData)) {
    (headers as Record<string, string>)["Content-Type"] = "application/json";
  }

  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  (headers as Record<string, string>)["X-CSRF-Protection"] = "1";

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });
  return response;
}

// User-authenticated fetch (uses userToken instead of adminToken)
export async function userAuthFetch(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem("userToken");
  if (!token) throw new Error("Not authenticated");

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };

  return fetch(url, { ...options, headers });
}
