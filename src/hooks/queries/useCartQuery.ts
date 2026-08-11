import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useCallback, useMemo } from "react";

export interface CartItem {
  id: string;
  sku?: string;
  name: string;
  price: number;
  image: string;
  category: string;
  quantity: number;
}

const CART_KEY = ["cart", "items"];
const CART_UI_KEY = ["cart", "ui", "isOpen"];
const GUEST_EMAIL_KEY = ["cart", "guest", "email"];
const GUEST_PHONE_KEY = ["cart", "guest", "phone"];

function getLocalCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem("sherotech_cart");
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function setLocalCart(cart: CartItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem("sherotech_cart", JSON.stringify(cart));
}

function syncCartWithServer(
  cart: CartItem[],
  guestEmail: string,
  guestPhone: string,
) {
  if (typeof window === "undefined") return;
  let guestId = localStorage.getItem("sherotech_guest_id");
  if (!guestId) {
    guestId = "guest-" + Math.random().toString(36).substring(2, 15);
    localStorage.setItem("sherotech_guest_id", guestId);
  }

  fetch("/api/carts/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items: cart, guestId, guestEmail, guestPhone }),
  }).catch(console.error);
}

export function useCart() {
  const queryClient = useQueryClient();

  // Cart items
  const { data: cart = [] } = useQuery({
    queryKey: CART_KEY,
    queryFn: getLocalCart,
    initialData: [], // Default to empty array for SSR
    staleTime: Infinity,
  });

  // UI state
  const { data: isCartOpen = false } = useQuery({
    queryKey: CART_UI_KEY,
    queryFn: () => false,
    initialData: false,
    staleTime: Infinity,
  });

  // Guest state
  const { data: guestEmail = "" } = useQuery({
    queryKey: GUEST_EMAIL_KEY,
    queryFn: () => "",
    initialData: "",
    staleTime: Infinity,
  });

  const { data: guestPhone = "" } = useQuery({
    queryKey: GUEST_PHONE_KEY,
    queryFn: () => "",
    initialData: "",
    staleTime: Infinity,
  });

  // Hydrate cart from localStorage on mount
  useEffect(() => {
    const saved = getLocalCart();
    if (saved.length > 0) {
      queryClient.setQueryData(CART_KEY, saved);
    }
  }, [queryClient]);

  // Setters
  const setIsCartOpen = useCallback(
    (open: boolean) => {
      queryClient.setQueryData(CART_UI_KEY, open);
    },
    [queryClient],
  );

  const setGuestEmail = useCallback(
    (email: string) => {
      queryClient.setQueryData(GUEST_EMAIL_KEY, email);
    },
    [queryClient],
  );

  const setGuestPhone = useCallback(
    (phone: string) => {
      queryClient.setQueryData(GUEST_PHONE_KEY, phone);
    },
    [queryClient],
  );

  // Mutations
  const updateCart = useCallback(
    (newCart: CartItem[]) => {
      setLocalCart(newCart);
      queryClient.setQueryData(CART_KEY, newCart);
    },
    [queryClient],
  );

  const addItem = useCallback(
    (newItem: Omit<CartItem, "quantity">) => {
      const existing = cart.find((item) => item.id === newItem.id);
      let updated;
      if (existing) {
        updated = cart.map((item) =>
          item.id === newItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      } else {
        updated = [...cart, { ...newItem, quantity: 1 }];
      }
      updateCart(updated);
    },
    [cart, updateCart],
  );

  const removeItem = useCallback(
    (id: string) => {
      const updated = cart.filter((item) => item.id !== id);
      updateCart(updated);
    },
    [cart, updateCart],
  );

  const updateQuantity = useCallback(
    (id: string, delta: number) => {
      const updated = cart
        .map((item) =>
          item.id === id
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item,
        )
        .filter((item) => item.quantity > 0);
      updateCart(updated);
    },
    [cart, updateCart],
  );

  const clearCart = useCallback(() => {
    updateCart([]);
  }, [updateCart]);

  // Sync effect
  useEffect(() => {
    // Only sync if we have something in the cart or we used to
    const timeoutId = setTimeout(() => {
      syncCartWithServer(cart, guestEmail, guestPhone);
    }, 3000);
    return () => clearTimeout(timeoutId);
  }, [cart, guestEmail, guestPhone]);

  // Computed
  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return useMemo(
    () => ({
      cart,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      totalQuantity,
      totalPrice,
      isCartOpen,
      setIsCartOpen,
      guestEmail,
      setGuestEmail,
      guestPhone,
      setGuestPhone,
    }),
    [
      cart,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      totalQuantity,
      totalPrice,
      isCartOpen,
      setIsCartOpen,
      guestEmail,
      setGuestEmail,
      guestPhone,
      setGuestPhone,
    ],
  );
}
