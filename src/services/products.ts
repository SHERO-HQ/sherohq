import type { Product } from "@/types/product";
import { API_BASE, handleResponse, authFetch } from "./client";

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

export interface ProductsResponse {
  products: Product[];
}

export async function fetchProducts(
  category?: string,
  search?: string,
  stock?: "low" | "out",
): Promise<Product[]> {
  const params = new URLSearchParams();
  if (category && category !== "all") params.append("category", category);
  if (search) params.append("search", search);
  if (stock) params.append("stock", stock);

  const url = `${API_BASE}/products${params.toString() ? "?" + params.toString() : ""}`;
  const response = await fetch(url);
  const data = await handleResponse<any>(response);
  return Array.isArray(data) ? data : data?.products || [];
}

export async function fetchProduct(id: string): Promise<Product> {
  const response = await fetch(`${API_BASE}/products/${id}`);
  return handleResponse<Product>(response);
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Admin Product Management
// ---------------------------------------------------------------------------

export interface ProductInput {
  name: string;
  sku?: string;
  category: string;
  price: number;
  originalPrice?: number | null;
  costPrice?: number | null;
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
  condition?: "New" | "Used" | "Refurbished";
  slug?: string;
  isSpotlight?: boolean;
  isFeatured?: boolean;
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

// ---------------------------------------------------------------------------
// Reviews
// ---------------------------------------------------------------------------

export interface Review {
  id: string;
  productId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export async function getProductReviews(productId: string): Promise<Review[]> {
  const response = await fetch(`${API_BASE}/products/${productId}/reviews`);
  return handleResponse<Review[]>(response);
}

export async function submitProductReview(
  productId: string,
  data: { userName: string; rating: number; comment: string },
): Promise<{ success: boolean; review: Review }> {
  const response = await authFetch(`${API_BASE}/products/${productId}/reviews`, {
    method: "POST",
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

// ---------------------------------------------------------------------------
// Uploads
// ---------------------------------------------------------------------------

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

export async function publicUploadImage(
  file: File,
): Promise<{ success: boolean; imageUrl: string }> {
  const formData = new FormData();
  formData.append("image", file);

  const response = await authFetch(`${API_BASE}/upload/public`, {
    method: "POST",
    body: formData,
  });
  return handleResponse(response);
}
