import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useCallback, useMemo } from "react";
import { useNotifications } from "@/hooks/useNotifications";

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image: string;
  category?: string;
}

const WISHLIST_KEY = ["wishlist", "items"];
const WISHLIST_UI_KEY = ["wishlist", "ui", "isOpen"];

function getLocalWishlist(): WishlistItem[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem("wishlist");
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function setLocalWishlist(wishlist: WishlistItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem("wishlist", JSON.stringify(wishlist));
}

export function useWishlist() {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  // Wishlist items
  const { data: wishlist = [] } = useQuery({
    queryKey: WISHLIST_KEY,
    queryFn: getLocalWishlist,
    initialData: [],
    staleTime: Infinity,
  });

  // UI state
  const { data: isWishlistOpen = false } = useQuery({
    queryKey: WISHLIST_UI_KEY,
    queryFn: () => false,
    initialData: false,
    staleTime: Infinity,
  });

  // Hydrate on mount
  useEffect(() => {
    const saved = getLocalWishlist();
    if (saved.length > 0) {
      queryClient.setQueryData(WISHLIST_KEY, saved);
    }
  }, [queryClient]);

  // Setters
  const setIsWishlistOpen = useCallback(
    (open: boolean) => {
      queryClient.setQueryData(WISHLIST_UI_KEY, open);
    },
    [queryClient]
  );

  const updateWishlist = useCallback(
    (newWishlist: WishlistItem[]) => {
      setLocalWishlist(newWishlist);
      queryClient.setQueryData(WISHLIST_KEY, newWishlist);
    },
    [queryClient]
  );

  const addToWishlist = useCallback(
    (product: WishlistItem) => {
      const existing = wishlist.some((item) => item.id === product.id);
      if (!existing) {
        updateWishlist([...wishlist, product]);
        addNotification(
          "Added to Wishlist",
          `${product.name} has been added to your wishlist.`,
          "success"
        );
      }
    },
    [wishlist, updateWishlist, addNotification]
  );

  const removeFromWishlist = useCallback(
    (productId: string) => {
      const item = wishlist.find((i) => i.id === productId);
      if (item) {
        updateWishlist(wishlist.filter((i) => i.id !== productId));
        addNotification(
          "Removed from Wishlist",
          `${item.name} has been removed from your wishlist.`,
          "info"
        );
      }
    },
    [wishlist, updateWishlist, addNotification]
  );

  const isInWishlist = useCallback(
    (productId: string) => {
      return wishlist.some((item) => item.id === productId);
    },
    [wishlist]
  );

  const toggleWishlist = useCallback(
    (product: WishlistItem) => {
      if (isInWishlist(product.id)) {
        removeFromWishlist(product.id);
      } else {
        addToWishlist(product);
      }
    },
    [isInWishlist, addToWishlist, removeFromWishlist]
  );

  const clearWishlist = useCallback(() => {
    updateWishlist([]);
  }, [updateWishlist]);

  return useMemo(
    () => ({
      wishlist,
      isWishlistOpen,
      setIsWishlistOpen,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      toggleWishlist,
      clearWishlist,
    }),
    [
      wishlist,
      isWishlistOpen,
      setIsWishlistOpen,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      toggleWishlist,
      clearWishlist,
    ]
  );
}
