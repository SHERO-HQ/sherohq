import { useState, useCallback } from "react";
import { getUserOrders, type Order } from "@/services/api";

export const useProfileOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const loadOrders = useCallback(async (userId: string) => {
    setLoading(true);
    try {
      const data = await getUserOrders(userId);
      setOrders(data);
    } catch (error) {
      console.error("Failed to load orders", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrder((prev) => (prev === orderId ? null : orderId));
  };

  return {
    orders,
    loading,
    expandedOrder,
    loadOrders,
    toggleOrderExpansion,
  };
};
