"use client";
import React, { useState, useMemo } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { ADMIN_POLLING_INTERVAL } from "@/constants/admin";
import {
  Search,
  Eye,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Printer,
  PackageX,
  RefreshCw,
  PackageSearch,
  PackageCheck,
  Plus} from "lucide-react";
import { } from "@/context/AdminContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion } from "motion/react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { exportToCSV, exportToExcel, exportToPDF } from "@/utils/exportUtils";
import { toReadableOrderId } from "@/utils/orderId";
import {
  useAdminOrdersQuery,
  useUpdateOrderStatus} from "@/hooks/queries/useOrders";
import { Card } from "@/components/ui/card";
import { memo } from "react";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { getAdminOrderPaymentStatus } from "@/lib/paymentStatus";

// Memoized row component for maximum performance during polling
const OrderRow = memo(
  ({
    order,
    index,
    getStatusConfig,
    handleUpdateStatus}: {
    order: any;
    index: number;
    getStatusConfig: (status: string) => any;
    handleUpdateStatus: (id: string, status: string) => void;
  }) => {
    const status = getStatusConfig(order.status);
    const paymentStatus = getAdminOrderPaymentStatus({
      paymentStatus: order.paymentStatus,
      status: order.status,
      paymentMessage: order.paymentMessage});
    return (
      <motion.tr
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.03 }}
        className="hover:bg-accent transition-colors group"
      >
        <td className="px-6 py-4">
          <Link
            href={`/admin/orders/${order.id}`}
            className="text-xs font-mono text-muted-foreground hover:text-brand-secondary-400 transition-colors"
          >
            {toReadableOrderId(order.id)}
          </Link>
        </td>
        <td className="px-6 py-4">
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground group-hover:text-brand-secondary-400 transition-colors">
              {order.shippingInfo.firstName} {order.shippingInfo.lastName}
            </span>
            <span className="text-xs text-muted-foreground truncate max-w-[150px]">
              {order.shippingInfo.email}
            </span>
          </div>
        </td>
        <td className="px-6 py-4">
          <Badge
            className={cn(
              "text-[10px] font-bold uppercase border-none",
              status.color,
            )}
          >
            <status.icon className="w-3 h-3 mr-1" />
            {order.status}
          </Badge>
        </td>
        <td className="px-6 py-4">
          <p className="text-xs text-muted-foreground">
            {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </td>
        <td className="px-6 py-4">
          <Badge
            className={cn(
              "text-[10px] font-bold uppercase border-none",
              paymentStatus.tone === "success"
                ? "text-emerald-400 bg-emerald-500/10"
                : paymentStatus.tone === "danger"
                  ? "text-rose-400 bg-rose-500/10"
                  : "text-amber-400 bg-amber-500/10",
            )}
          >
            {paymentStatus.label}
          </Badge>
        </td>
        <td className="px-6 py-4 text-right">
          <p className="text-sm font-bold text-foreground">
            GH₵{order.total.toLocaleString()}
          </p>
          <p className="text-[10px] text-muted-foreground">
            {order.items?.length || 0} items
          </p>
        </td>
        <td className="px-6 py-4 text-right">
          <div className="flex items-center justify-end gap-2">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              asChild
            >
              <Link href={`/admin/orders/${order.id}`}>
                <Eye className="w-4 h-4" />
              </Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-card border-border text-foreground"
              >
                <DropdownMenuItem
                  onClick={() => handleUpdateStatus(order.id, "processing")}
                  className="cursor-pointer hover:bg-accent"
                >
                  <PackageSearch className="w-4 h-4 mr-2 text-blue-400" />{" "}
                  Processing
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleUpdateStatus(order.id, "intransit")}
                  className="cursor-pointer hover:bg-accent"
                >
                  <Truck className="w-4 h-4 mr-2 text-purple-400" /> Shipped
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleUpdateStatus(order.id, "delivered")}
                  className="cursor-pointer hover:bg-accent"
                >
                  <PackageCheck className="w-4 h-4 mr-2 text-brand-secondary-400" />{" "}
                  Delivered
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-accent/50" />
                <DropdownMenuItem
                  onClick={() => handleUpdateStatus(order.id, "cancelled")}
                  className="cursor-pointer text-rose-400 focus:text-rose-400 focus:bg-rose-500/10"
                >
                  <PackageX className="w-4 h-4 mr-2 text-rose-400" /> Cancelled
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </td>
      </motion.tr>
    );
  },
);

export default function AdminOrders() {
  const { addNotification } = useNotifications();

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // React Query Hooks
  const {
    data: orders = [],
    isLoading,
    isPlaceholderData,
    refetch,
    isFetching,
    error: queryError} = useAdminOrdersQuery(
    {
      status: statusFilter === "all" ? undefined : statusFilter},
    ADMIN_POLLING_INTERVAL,
  );

  const updateStatusMutation = useUpdateOrderStatus();

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      // Hook expects { id, status }
      await updateStatusMutation.mutateAsync({
        id: orderId,
        status: newStatus});
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
          icon: CheckCircle2};
      case "cancelled":
        return { color: "text-rose-400 bg-rose-500/10", icon: XCircle };
      default:
        return { color: "text-muted-foreground bg-slate-500/10", icon: Clock };
    }
  };

  const toExportOrderId = (orderId: string) => {
    return toReadableOrderId(orderId);
  };

  const handleExport = async (format: "csv" | "excel" | "pdf") => {
    const dataToExport = filteredOrders.map((order) => ({
      ID: toExportOrderId(order.id),
      Customer: `${order.shippingInfo.firstName} ${order.shippingInfo.lastName}`,
      Email: order.shippingInfo.email,
      Total: `GH₵ ${order.total.toLocaleString()}`,
      Status: order.status.toUpperCase(),
      Method: formatPaymentMethod(order.paymentMethod).toUpperCase(),
      Items: order.items?.length || 0,
      Date: new Date(order.createdAt).toLocaleDateString()}));

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

  return (
    <ErrorBoundary>
      <div className="space-y-6 relative">
        {isPlaceholderData && (
          <div className="absolute inset-0 bg-card/10 -[1px] z-10 pointer-events-none transition-opacity" />
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Orders</h1>
            <p className="text-muted-foreground text-sm">
              Monitor and manage customer transactions
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => refetch()}
              disabled={isFetching}
              className="bg-muted/50 border-border"
            >
              <RefreshCw
                className={cn("w-4 h-4", isFetching && "animate-spin")}
              />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="bg-muted/50 border-border text-foreground hover:bg-accent"
                >
                  <Printer className="mr-2 h-4 w-4" /> Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-card border-border text-foreground"
              >
                <DropdownMenuItem
                  onClick={() => handleExport("csv")}
                  className="cursor-pointer hover:bg-accent"
                >
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleExport("excel")}
                  className="cursor-pointer hover:bg-accent"
                >
                  Export as Excel
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleExport("pdf")}
                  className="cursor-pointer hover:bg-accent"
                >
                  Export as PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link href="/admin/orders/new">
              <Button className="bg-brand-secondary-600 hover:bg-brand-secondary-500 text-white font-bold transition shadow shadow-brand-secondary-500/20">
                <Plus className="mr-2 h-4 w-4" /> Create Order
              </Button>
            </Link>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded text-rose-400 text-sm">
            {error}
          </div>
        )}

        {/* Filters */}
        <Card className="bg-card/40 border-border p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by Order ID, customer name or email..."
                className="pl-10 bg-muted/50 border-border text-foreground placeholder:text-muted-foreground"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2 lg:gap-0 lg:bg-card lg:p-1 lg:rounded lg:border lg:border-border overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
              {[
                { id: "all", label: "All" },
                { id: "pending", label: "Pending" },
                { id: "processing", label: "Processing" },
                { id: "intransit", label: "In Transit" },
                { id: "delivered", label: "Delivered" },
                { id: "cancelled", label: "Cancelled" },
              ].map((status) => (
                <button
                  key={status.id}
                  onClick={() => {
                    setStatusFilter(status.id);
                    setCurrentPage(1);
                  }}
                  className={cn(
                    "px-4 py-1 rounded text-sm font-medium transition whitespace-nowrap",
                    statusFilter === status.id
                      ? "bg-brand-secondary-600 text-white shadow shadow-brand-secondary-500/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent",
                  )}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Orders Table */}
        <div className="bg-card/40  border border-border rounded overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[1000px]">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Order Status
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Payment Status
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">
                    Total
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {isLoading ? (
                  new Array(5).fill(0).map((_, i) => (
                    <tr
                      key={`skel-${i}`}
                      className="animate-pulse border-b border-border"
                    >
                      <td className="px-6 py-4">
                        <div className="h-3 bg-muted rounded w-20" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <div className="h-4 bg-muted rounded w-32" />
                          <div className="h-3 bg-muted rounded w-24 opacity-50" />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-5 bg-muted rounded w-24" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-muted rounded w-16" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-muted rounded w-20" />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex flex-col items-end gap-1">
                          <div className="h-4 bg-muted rounded w-16" />
                          <div className="h-3 bg-muted rounded w-8 opacity-50" />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <div className="w-8 h-8 rounded bg-muted" />
                          <div className="w-8 h-8 rounded bg-muted" />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : currentOrders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-12 text-center text-muted-foreground"
                    >
                      No orders found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  currentOrders.map((order, index) => (
                    <OrderRow
                      key={order.id}
                      order={order}
                      index={index}
                      getStatusConfig={getStatusConfig}
                      handleUpdateStatus={handleUpdateStatus}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {!isLoading && filteredOrders.length > itemsPerPage && (
          <div className="flex items-center justify-center gap-4 py-6">
            <Button
              variant="ghost"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              className="text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="w-4 h-4 mr-2" /> Previous
            </Button>
            <span className="text-sm font-medium text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="ghost"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className="text-muted-foreground hover:text-foreground"
            >
              Next <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}
