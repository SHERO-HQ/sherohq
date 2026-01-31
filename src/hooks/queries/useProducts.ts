import { useQuery } from "@tanstack/react-query";
import { fetchProducts, fetchProduct, fetchCategories } from "@/services/api";

export const PRODUCT_KEYS = {
  all: ["products"] as const,
  lists: () => [...PRODUCT_KEYS.all, "list"] as const,
  list: (filters: { category?: string; search?: string }) =>
    [...PRODUCT_KEYS.lists(), filters] as const,
  details: () => [...PRODUCT_KEYS.all, "detail"] as const,
  detail: (id: string) => [...PRODUCT_KEYS.details(), id] as const,
  categories: () => ["categories"] as const,
};

export const useProducts = (category?: string, search?: string) => {
  return useQuery({
    queryKey: PRODUCT_KEYS.list({ category, search }),
    queryFn: () => fetchProducts(category, search),
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: PRODUCT_KEYS.detail(id),
    queryFn: () => fetchProduct(id),
    enabled: !!id,
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: PRODUCT_KEYS.categories(),
    queryFn: fetchCategories,
  });
};
