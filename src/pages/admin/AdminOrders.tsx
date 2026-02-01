import { useState, useMemo } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import {
  Search,
  Eye,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Calendar,
  Printer,
  Phone,
  Mail,
  PackageX,
  RefreshCw,
  PackageSearch,
  PackageCheck,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { exportToCSV, exportToExcel, exportToPDF } from "@/utils/exportUtils";
import {
  useAdminOrdersQuery,
  useUpdateOrderStatus,
} from "@/hooks/queries/useOrders";
import { Card } from "@/components/ui/card";

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
    error: queryError,
  } = useAdminOrdersQuery({
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  const updateStatusMutation = useUpdateOrderStatus();

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      // Hook expects { id, status }
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
      case "shipped":
        return { color: "text-purple-400 bg-purple-500/10", icon: Truck };
      case "delivered":
        return {
          color: "text-emerald-400 bg-emerald-500/10",
          icon: CheckCircle2,
        };
      case "cancelled":
        return { color: "text-rose-400 bg-rose-500/10", icon: XCircle };
      default:
        return { color: "text-slate-400 bg-slate-500/10", icon: Clock };
    }
  };

  const handleExport = (format: "csv" | "excel" | "pdf") => {
    const dataToExport = filteredOrders.map((order) => ({
      id: order.id,
      customer: `${order.shippingInfo.firstName} ${order.shippingInfo.lastName}`,
      email: order.shippingInfo.email,
      total: order.total,
      status: order.status,
      paymentMethod: formatPaymentMethod(order.paymentMethod),
      items: order.items.length,
      date: new Date(order.createdAt).toLocaleDateString(),
    }));

    const fileName = `orders_${new Date().toISOString().split("T")[0]}`;
    const columns = [
      "id",
      "customer",
      "email",
      "total",
      "status",
      "paymentMethod",
      "items",
      "date",
    ];

    if (format === "csv") exportToCSV(dataToExport, fileName);
    else if (format === "excel") exportToExcel(dataToExport, fileName);
    else exportToPDF(dataToExport, columns, fileName, "Orders Report");
  };

  const error = queryError instanceof Error ? queryError.message : "";

  return (
    <AdminLayout>
      <div className="space-y-6 relative">
        {isPlaceholderData && (
          <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[1px] z-10 pointer-events-none transition-opacity" />
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white font-sora">Orders</h1>
            <p className="text-slate-400 text-sm">
              Monitor and manage customer transactions
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => refetch()}
              disabled={isFetching}
              className="bg-slate-800/50 border-white/5"
            >
              <RefreshCw
                className={cn("w-4 h-4", isFetching && "animate-spin")}
              />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="bg-slate-800/50 border-white/10 text-white hover:bg-white/5"
                >
                  <Printer className="mr-2 h-4 w-4" /> Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-slate-900 border-white/10 text-white"
              >
                <DropdownMenuItem
                  onClick={() => handleExport("csv")}
                  className="cursor-pointer hover:bg-white/5"
                >
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleExport("excel")}
                  className="cursor-pointer hover:bg-white/5"
                >
                  Export as Excel
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleExport("pdf")}
                  className="cursor-pointer hover:bg-white/5"
                >
                  Export as PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded text-rose-400 text-sm">
            {error}
          </div>
        )}

        {/* Filters */}
        <Card className="bg-slate-900/40 border-white/5 p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                placeholder="Search by Order ID, customer name or email..."
                className="pl-10 bg-slate-800/50 border-white/5 text-white placeholder:text-slate-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
              {[
                "all",
                "pending",
                "processing",
                "shipped",
                "delivered",
                "cancelled",
              ].map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    setStatusFilter(status);
                    setCurrentPage(1);
                  }}
                  className={cn(
                    "px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap border",
                    statusFilter === status
                      ? "bg-emerald-600 border-emerald-500 text-white"
                      : "bg-slate-800 border-white/5 text-slate-400 hover:text-white hover:border-white/10",
                  )}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Orders List */}
        <div className="space-y-4">
          {isLoading &&
            ["skel-1", "skel-2", "skel-3", "skel-4"].map((skelKey) => (
              <div
                key={skelKey}
                className="h-32 rounded bg-slate-900 animate-pulse border border-white/5"
              />
            ))}

          {!isLoading && currentOrders.length === 0 && (
            <div className="p-12 text-center bg-slate-900 border border-white/5 rounded">
              <ClipboardList className="w-12 h-12 text-slate-700 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">No orders found</p>
            </div>
          )}

          {!isLoading &&
            currentOrders.length > 0 &&
            currentOrders.map((order, index) => {
              const status = getStatusConfig(order.status);
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="bg-slate-900/40 border-white/5 hover:border-white/10 transition-all p-4 md:p-6 group">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      {/* Order Core Info */}
                      <div className="flex items-start gap-4">
                        <div
                          className={cn("p-3 rounded shrink-0", status.color)}
                        >
                          <status.icon className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Link
                              to={`/admin/orders/${order.id}`}
                              className="text-sm font-mono text-slate-400 hover:text-emerald-400 transition-colors"
                            >
                              #{order.id.slice(0, 12)}
                            </Link>
                            <Badge
                              className={cn(
                                "text-[10px] font-bold uppercase",
                                status.color,
                              )}
                            >
                              {order.status}
                            </Badge>
                          </div>
                          <Link to={`/admin/orders/${order.id}`}>
                            <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                              {order.shippingInfo.firstName}{" "}
                              {order.shippingInfo.lastName}
                            </h3>
                          </Link>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-slate-500">
                            <div className="flex items-center gap-1.5">
                              <Mail className="w-3 h-3" />
                              <span className="truncate max-w-[150px]">
                                {order.shippingInfo.email}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Phone className="w-3 h-3" />
                              <span>{order.shippingInfo.phone}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 flex-1 lg:max-w-2xl">
                        <div className="space-y-1">
                          <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                            Date
                          </p>
                          <div className="flex items-center gap-2 text-sm text-slate-300">
                            <Calendar className="w-3 h-3 text-slate-500" />
                            {new Date(order.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                            Total(GH₵)
                          </p>
                          <div className="flex items-center gap-2 text-sm font-bold text-emerald-400">
                            {order.total.toLocaleString()}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                            Items
                          </p>
                          <p className="text-sm text-slate-300">
                            {order.items?.length || 0} product(s)
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                            Payment
                          </p>
                          <p className="text-xs text-slate-300 font-medium">
                            {formatPaymentMethod(order.paymentMethod)}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3">
                        <Button
                          variant="ghost"
                          className="text-slate-400 hover:text-white hover:bg-white/5"
                          asChild
                        >
                          <Link to={`/admin/orders/${order.id}`}>
                            <Eye className="w-4 h-4 mr-2" /> Details
                          </Link>
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              className="border-white/10 text-white hover:bg-white/5"
                            >
                              Update Status
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="bg-slate-900 border-white/10 text-white"
                          >
                            <DropdownMenuItem
                              onClick={() =>
                                handleUpdateStatus(order.id, "processing")
                              }
                              className="cursor-pointer hover:bg-white/5"
                            >
                              <PackageSearch className="w-4 h-4 mr-2 text-blue-400" />{" "}
                              Processing
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleUpdateStatus(order.id, "shipped")
                              }
                              className="cursor-pointer hover:bg-white/5"
                            >
                              <Truck className="w-4 h-4 mr-2 text-purple-400" />{" "}
                              Shipped
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleUpdateStatus(order.id, "delivered")
                              }
                              className="cursor-pointer hover:bg-white/5"
                            >
                              <PackageCheck className="w-4 h-4 mr-2 text-emerald-400" />{" "}
                              Delivered
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-white/5" />
                            <DropdownMenuItem
                              onClick={() =>
                                handleUpdateStatus(order.id, "cancelled")
                              }
                              className="cursor-pointer text-rose-400 focus:text-rose-400 focus:bg-rose-500/10"
                            >
                              <PackageX className="w-4 h-4 mr-2 text-rose-400" />{" "}
                              Cancelled
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
        </div>

        {/* Pagination */}
        {!isLoading && filteredOrders.length > itemsPerPage && (
          <div className="flex items-center justify-center gap-4 py-6">
            <Button
              variant="ghost"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              className="text-slate-400 hover:text-white"
            >
              <ChevronLeft className="w-4 h-4 mr-2" /> Previous
            </Button>
            <span className="text-sm font-medium text-slate-400">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="ghost"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className="text-slate-400 hover:text-white"
            >
              Next <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
