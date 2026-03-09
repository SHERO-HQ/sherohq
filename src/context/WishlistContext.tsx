"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { type WishlistItem, WishlistContext } from "./WishlistContextType";

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const { addNotification } = useNotifications();

  // Load wishlist from localStorage on client side only
  useEffect(() => {
    const savedWishlist = localStorage.getItem("wishlist");
    if (savedWishlist) {
      try {
        const parsed = JSON.parse(savedWishlist);
        queueMicrotask(() => setWishlist(parsed));
      } catch (e) {
        console.error("Failed to parse wishlist from localStorage", e);
      }
    }
    queueMicrotask(() => setIsLoaded(true));
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
  }, [wishlist, isLoaded]);

  const addToWishlist = useCallback(
    (product: WishlistItem) => {
      setWishlist((prev) => {
        if (!prev.some((item) => item.id === product.id)) {
          return [...prev, product];
        }
        return prev;
      });

      addNotification(
        "Added to Wishlist",
        `${product.name} has been added to your wishlist.`,
        "success",
      );
    },
    [addNotification],
  );

  const removeFromWishlist = useCallback(
    (productId: string) => {
      let removedItemName = "";

      setWishlist((prev) => {
        const item = prev.find((i) => i.id === productId);
        if (item) {
          removedItemName = item.name;
        }
        return prev.filter((item) => item.id !== productId);
      });

      if (removedItemName) {
        addNotification(
          "Removed from Wishlist",
          `${removedItemName} has been removed from your wishlist.`,
          "info",
        );
      }
    },
    [addNotification],
  );

  const isInWishlist = useCallback(
    (productId: string) => {
      return wishlist.some((item) => item.id === productId);
    },
    [wishlist],
  );

  const toggleWishlist = useCallback(
    (product: WishlistItem) => {
      if (wishlist.some((item) => item.id === product.id)) {
        removeFromWishlist(product.id);
      } else {
        addToWishlist(product);
      }
    },
    [wishlist, addToWishlist, removeFromWishlist],
  );

  const clearWishlist = useCallback(() => {
    setWishlist([]);
  }, []);

  const value = useMemo(
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
    ],
  );

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};
