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
  // Client-side must ALWAYS use relative same-origin /api proxy
  // to avoid CORS issues across subdomains (e.g., admin.localhost vs localhost)
  if (typeof window !== "undefined") {
    return "/api";
  }

  // Server-side (SSR) requires absolute URLs
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  const serverEnvUrl = process.env.API_URL;
  const resolvedEnvUrl = envUrl || serverEnvUrl;

  if (resolvedEnvUrl) {
    if (resolvedEnvUrl.startsWith("/")) return resolvedEnvUrl;
    if (resolvedEnvUrl.includes(".") && !resolvedEnvUrl.startsWith("http")) {
      return `https://${resolvedEnvUrl}`;
    }
    return resolvedEnvUrl;
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
    process.env.URL ||
    "http://localhost:3000";
  return `${siteUrl.replace(/\/$/, "")}/api`;
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

    // Append status to aid debugging in production
    const error = new Error(`${errorMessage} (Status: ${response.status})`);
    (error as any).status = response.status;
    
    // Automatically redirect on 401 Unauthorized
    if (response.status === 401 && typeof window !== "undefined") {
      const isApiAuthRoute = response.url.includes("/api/auth/") || response.url.includes("/api/admin/auth/");
      if (!isApiAuthRoute) {
        if (window.location.pathname.startsWith("/admin")) {
          window.location.href = "/admin/login?expired=1";
        } else {
          window.location.href = "/login?expired=1";
        }
      }
    }
    
    throw error;
  }

  if (!text) {
    return (response.status === 204 ? {} : null) as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(
      `Failed to parse server response. The server might be returning an error page instead of JSON. (Status: ${response.status})`,
    );
  }
}

export function getCsrfToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)shero_csrf=([^;]*)/);
  if (match && match[1]) {
    return match[1];
  }

  // If no CSRF cookie exists in the client browser yet, initialize one
  try {
    if (typeof window !== "undefined" && window.crypto) {
      const array = new Uint8Array(32);
      window.crypto.getRandomValues(array);
      const token = Array.from(array, (byte) =>
        byte.toString(16).padStart(2, "0")
      ).join("");
      const isSecure = window.location.protocol === "https:";
      document.cookie = `shero_csrf=${token}; path=/; SameSite=Lax${isSecure ? "; Secure" : ""}`;
      return token;
    }
  } catch (e) {
    console.error("Failed to generate client CSRF token", e);
  }

  return null;
}

export async function authFetch(url: string, options: RequestInit = {}) {
  const headers: HeadersInit = {
    ...options.headers,
  };

  if (!(options.body instanceof FormData) && !(headers as Record<string, string>)["Content-Type"]) {
    (headers as Record<string, string>)["Content-Type"] = "application/json";
  }

  (headers as Record<string, string>)["X-CSRF-Protection"] = "1";
  const csrfToken = getCsrfToken();
  if (csrfToken) {
    (headers as Record<string, string>)["x-csrf-token"] = csrfToken;
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });
  return response;
}

// User-authenticated fetch (uses userToken instead of adminToken)
export async function userAuthFetch(url: string, options: RequestInit = {}) {
  const headers: HeadersInit = {
    ...(options.body instanceof FormData
      ? {}
      : { "Content-Type": "application/json" }),
    "X-CSRF-Protection": "1",
    ...options.headers,
  };

  const csrfToken = getCsrfToken();
  if (csrfToken) {
    (headers as Record<string, string>)["x-csrf-token"] = csrfToken;
  }

  return fetch(url, { ...options, headers, credentials: "include" });
}
