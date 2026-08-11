"use client";

import { useState, useMemo } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { ADMIN_POLLING_INTERVAL } from "@/constants/admin";
import { formatCurrency } from "@/utils/format";
import { Clock, Truck, CheckCircle2, XCircle } from "lucide-react";
import { exportToCSV, exportToExcel, exportToPDF } from "@/utils/exportUtils";
import { displayOrderId } from "@/utils/orderId";
import {
  useAdminOrdersQuery,
  useUpdateOrderStatus,
} from "@/hooks/queries/useOrders";

export function useAdminOrdersState() {
  const { addNotification } = useNotifications();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const {
    data: orders = [],
    isLoading,
    isPlaceholderData,
    refetch,
    isFetching,
    error: queryError,
  } = useAdminOrdersQuery(
    {
      status: statusFilter === "all" ? undefined : statusFilter,
    },
    ADMIN_POLLING_INTERVAL,
  );

  const updateStatusMutation = useUpdateOrderStatus();

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateStatusMutation.mutateAsync({
        id: orderId,
        status: newStatus,
      });
      addNotification(
        "Success",
        `Order status updated to ${newStatus}`,
        "success",
      );
    } catch (err) {
      addNotification(
        "Error",
        "Failed to update status: " +
          (err instanceof Error ? err.message : "Unknown error"),
        "error",
      );
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const searchLower = search.toLowerCase();
      return (
        order.id.toLowerCase().includes(searchLower) ||
        order.shippingInfo.firstName.toLowerCase().includes(searchLower) ||
        order.shippingInfo.lastName.toLowerCase().includes(searchLower) ||
        order.shippingInfo.email.toLowerCase().includes(searchLower)
      );
    });
  }, [orders, search]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const currentOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const formatPaymentMethod = (method: string) => {
    switch (method.toLowerCase()) {
      case "mobile_money":
      case "momo":
        return "MoMo";
      case "card":
      case "credit_card":
        return "Card";
      case "cash":
        return "Cash";
      default:
        return method.replaceAll("_", " ");
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return { color: "text-amber-400 bg-amber-500/10", icon: Clock };
      case "processing":
        return { color: "text-blue-400 bg-blue-500/10", icon: Truck };
      case "intransit":
        return { color: "text-purple-400 bg-purple-500/10", icon: Truck };
      case "delivered":
        return {
          color: "text-brand-secondary-400 bg-brand-secondary-500/10",
          icon: CheckCircle2,
        };
      case "cancelled":
        return { color: "text-rose-400 bg-rose-500/10", icon: XCircle };
      default:
        return { color: "text-muted-foreground bg-muted", icon: Clock };
    }
  };

  const handleExport = async (format: "csv" | "excel" | "pdf") => {
    const dataToExport = filteredOrders.map((order) => ({
      ID: displayOrderId(order.id),
      Customer: `${order.shippingInfo.firstName} ${order.shippingInfo.lastName}`,
      Email: order.shippingInfo.email,
      Total: formatCurrency(order.total),
      Status: order.status.toUpperCase(),
      Method: formatPaymentMethod(order.paymentMethod).toUpperCase(),
      Items: order.items?.length || 0,
      Date: new Date(order.createdAt).toLocaleDateString(),
    }));

    const fileName = `SHERO-Orders-${new Date().toISOString().split("T")[0]}`;
    const columns = [
      "ID",
      "Customer",
      "Email",
      "Total",
      "Status",
      "Method",
      "Items",
      "Date",
    ];

    if (format === "csv") await exportToCSV(dataToExport, fileName);
    else if (format === "excel") await exportToExcel(dataToExport, fileName);
    else await exportToPDF(dataToExport, columns, fileName, "Orders Report");
  };

  const error = queryError instanceof Error ? queryError.message : "";

  return {
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    orders,
    isLoading,
    isPlaceholderData,
    refetch,
    isFetching,
    error,
    filteredOrders,
    totalPages,
    currentOrders,
    handleUpdateStatus,
    getStatusConfig,
    handleExport,
  };
}
