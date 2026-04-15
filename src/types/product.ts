export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface Product {
  id: string;
  name: string;
  createdAt?: string;
  sku?: string;
  slug?: string;
  category: string;
  categoryId?: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  rating: number;
  reviews: number;
  badge?: string;
  inStock: boolean;
  condition?: "New" | "Used" | "Refurbished";
  quantity?: number;
  stockQuantity?: number;
  description?: string;
  features?: string[];
  specifications?: Record<string, string>;
  isSpotlight?: boolean;
  isFeatured?: boolean;
}
