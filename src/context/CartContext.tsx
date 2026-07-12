"use client";
import React, {
 createContext,
 useContext,
 useEffect,
 useState,
 useCallback,
 useMemo,
} from "react";

export interface CartItem {
 id: string;
 sku?: string;
 name: string;
 price: number;
 image: string;
 category: string;
 quantity: number;
}

interface CartContextType {
 cart: CartItem[];
 addItem: (item: Omit<CartItem, "quantity">) => void;
 removeItem: (id: string) => void;
 updateQuantity: (id: string, delta: number) => void;
 clearCart: () => void;
 totalQuantity: number;
 totalPrice: number;
 isCartOpen: boolean;
 setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
 children,
}) => {
 const [cart, setCart] = useState<CartItem[]>([]);
 const [isCartOpen, setIsCartOpen] = useState(false);
 const [isLoaded, setIsLoaded] = useState(false);

 // Load cart from localStorage on client side only
 useEffect(() => {
 const saved = localStorage.getItem("sherotech_cart");
 if (saved) {
 try {
 const parsed = JSON.parse(saved);
 queueMicrotask(() => setCart(parsed));
 } catch (e) {
 console.error("Failed to parse cart from localStorage", e);
 }
 }
 queueMicrotask(() => setIsLoaded(true));
 }, []);

 useEffect(() => {
 if (!isLoaded) return;
 localStorage.setItem("sherotech_cart", JSON.stringify(cart));

 // Sync cart with server for abandoned carts recovery
 const timeoutId = setTimeout(() => {
   let guestId = localStorage.getItem("sherotech_guest_id");
   if (!guestId) {
     guestId = "guest-" + Math.random().toString(36).substring(2, 15);
     localStorage.setItem("sherotech_guest_id", guestId);
   }

   fetch("/api/carts/sync", {
     method: "POST",
     headers: { "Content-Type": "application/json" },
     body: JSON.stringify({ items: cart, guestId })
   }).catch(console.error);
 }, 3000);

 return () => clearTimeout(timeoutId);
 }, [cart, isLoaded]);

 const addItem = useCallback((newItem: Omit<CartItem, "quantity">) => {
 setCart((prev) => {
 const existing = prev.find((item) => item.id === newItem.id);
 let updated;
 if (existing) {
 updated = prev.map((item) =>
 item.id === newItem.id
 ? { ...item, quantity: item.quantity + 1 }
 : item,
 );
 } else {
 updated = [...prev, { ...newItem, quantity: 1 }];
 }
 localStorage.setItem("sherotech_cart", JSON.stringify(updated));
 return updated;
 });
 }, []);

 const removeItem = useCallback((id: string) => {
 setCart((prev) => {
 const updated = prev.filter((item) => item.id !== id);
 localStorage.setItem("sherotech_cart", JSON.stringify(updated));
 return updated;
 });
 }, []);

 const updateQuantity = useCallback((id: string, delta: number) => {
 setCart((prev) => {
 const updated = prev
 .map((item) =>
 item.id === id
 ? { ...item, quantity: Math.max(0, item.quantity + delta) }
 : item,
 )
 .filter((item) => item.quantity > 0);
 localStorage.setItem("sherotech_cart", JSON.stringify(updated));
 return updated;
 });
 }, []);

 const clearCart = useCallback(() => {
 // Avoid setting a new empty array when cart is already empty.
 setCart((prev) => (prev.length === 0 ? prev : []));
 localStorage.removeItem("sherotech_cart");
 }, []);

 const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
 const totalPrice = cart.reduce(
 (sum, item) => sum + item.price * item.quantity,
 0,
 );

 const value = useMemo(
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
 }),
 [
 cart,
 addItem,
 removeItem,
 updateQuantity,
 clearCart,
 isCartOpen,
 totalQuantity,
 totalPrice,
 ],
 );

 return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => {
 const context = useContext(CartContext);
 if (!context) throw new Error("useCart must be used within a CartProvider");
 return context;
};
