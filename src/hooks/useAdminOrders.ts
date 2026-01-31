import { useState, useCallback, useEffect } from "react";
import { fetchAllOrders, updateOrderStatus, type Order } from "@/services/api";

export const useAdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [deliveryFilter, setDeliveryFilter] = useState<
    "all" | "pickup" | "delivery"
  >("all");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  const loadOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchAllOrders(
        statusFilter || undefined,
        dateRange.start,
        dateRange.end,
      );
      setOrders(data);
    } catch (err) {
      console.error("Failed to load orders:", err);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, dateRange.start, dateRange.end]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingStatus(orderId);
      await updateOrderStatus(orderId, newStatus);
      setOrders((prevOrders) =>
        prevOrders.map((o) =>
          o.id === orderId ? { ...o, status: newStatus } : o,
        ),
      );
    } catch (err) {
      console.error("Failed to update status:", err);
      throw err;
    } finally {
      setUpdatingStatus(null);
    }
  };

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrder((prev) => (prev === orderId ? null : orderId));
  };

  const filteredOrders = orders.filter((order) => {
    if (deliveryFilter === "all") return true;
    if (deliveryFilter === "pickup")
      return order.paymentMethod === "store_pickup";
    if (deliveryFilter === "delivery")
      return order.paymentMethod !== "store_pickup";
    return true;
  });

  return {
    orders,
    filteredOrders,
    isLoading,
    statusFilter,
    deliveryFilter,
    dateRange,
    expandedOrder,
    updatingStatus,
    setStatusFilter,
    setDeliveryFilter,
    setDateRange,
    toggleOrderExpansion,
    handleStatusChange,
    refreshOrders: loadOrders,
  };
};
