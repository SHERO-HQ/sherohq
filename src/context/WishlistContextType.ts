import { createContext } from "react";

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image: string;
  category?: string;
}

export interface WishlistContextType {
  wishlist: WishlistItem[];
  isWishlistOpen: boolean;
  setIsWishlistOpen: (open: boolean) => void;
  addToWishlist: (product: WishlistItem) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (product: WishlistItem) => void;
  clearWishlist: () => void;
}

export const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined,
);
