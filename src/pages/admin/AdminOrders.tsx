import { useState, useEffect } from "react";
import { fetchAllOrders, updateOrderStatus, type Order } from "@/services/api";
import {
  ShoppingCart,
  Clock,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Loader2,
  ChevronDown,
  Phone,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";

const ORDER_STATUSES = [
  { value: "pending", label: "Pending", icon: Clock, color: "text-yellow-400" },
  {
    value: "processing",
    label: "Processing",
    icon: Package,
    color: "text-blue-400",
  },
  { value: "shipped", label: "Shipped", icon: Truck, color: "text-purple-400" },
  {
    value: "delivered",
    label: "Delivered",
    icon: CheckCircle,
    color: "text-emerald-400",
  },
  {
    value: "cancelled",
    label: "Cancelled",
    icon: XCircle,
    color: "text-red-400",
  },
];

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  useEffect(() => {
    loadOrders();
  }, [statusFilter, dateRange.start, dateRange.end]);

  async function loadOrders() {
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
  }

  async function handleStatusChange(orderId: string, newStatus: string) {
    try {
      setUpdatingStatus(orderId);
      await updateOrderStatus(orderId, newStatus);
      setOrders(
        orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)),
      );
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setUpdatingStatus(null);
    }
  }

  function getStatusInfo(status: string) {
    return ORDER_STATUSES.find((s) => s.value === status) || ORDER_STATUSES[0];
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded bg-gradient-to-br from-purple-500 to-blue-600">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Orders</h1>
              <p className="text-slate-400">{orders.length} orders found</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex bg-slate-900 border border-slate-800 rounded p-1">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, start: e.target.value }))
              }
              className="bg-transparent text-white px-2 py-1 text-sm focus:outline-none"
            />
            <span className="text-slate-500 px-2 self-center">-</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, end: e.target.value }))
              }
              className="bg-transparent text-white px-2 py-1 text-sm focus:outline-none"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-slate-900 border border-slate-800 rounded text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All Statuses</option>
            {ORDER_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* Orders List */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No orders found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const statusInfo = getStatusInfo(order.status);
              const StatusIcon = statusInfo.icon;
              const isExpanded = expandedOrder === order.id;

              return (
                <div
                  key={order.id}
                  className="bg-slate-900/50 border border-slate-800 rounded overflow-hidden"
                >
                  {/* Order Header */}
                  <div
                    className="p-6 cursor-pointer hover:bg-slate-800/30 transition-colors"
                    onClick={() =>
                      setExpandedOrder(isExpanded ? null : order.id)
                    }
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div
                          className={`p-2 rounded bg-slate-800 ${statusInfo.color}`}
                        >
                          <StatusIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium text-white">
                            Order #{order.id.slice(0, 8)}
                          </p>
                          <p className="text-sm text-slate-400">
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className="hidden md:block">
                        <p className="font-medium text-white text-sm">
                          {order.shippingInfo.firstName}{" "}
                          {order.shippingInfo.lastName}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-slate-400">
                          <Phone className="w-3 h-3" />
                          {order.shippingInfo.phone || "No phone"}
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-bold text-white">
                            ${order.total.toLocaleString()}
                          </p>
                          <p className="text-sm text-slate-400">
                            {order.items.length} items
                          </p>
                        </div>

                        {/* Status Dropdown */}
                        <div onClick={(e) => e.stopPropagation()}>
                          <select
                            value={order.status}
                            onChange={(e) =>
                              handleStatusChange(order.id, e.target.value)
                            }
                            disabled={updatingStatus === order.id}
                            className={`px-3 py-1.5 rounded border text-sm font-medium ${statusInfo.color} bg-slate-800 border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500`}
                          >
                            {ORDER_STATUSES.map((s) => (
                              <option key={s.value} value={s.value}>
                                {s.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <ChevronDown
                          className={`w-5 h-5 text-slate-400 transition-transform ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Order Details (Expanded) */}
                  {isExpanded && (
                    <div className="px-6 pb-6 border-t border-slate-800 pt-4">
                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Customer Info */}
                        <div>
                          <h3 className="text-sm font-medium text-slate-400 mb-3">
                            Customer Information
                          </h3>
                          <div className="space-y-2 text-sm">
                            <p className="text-white">
                              {order.shippingInfo.firstName}{" "}
                              {order.shippingInfo.lastName}
                            </p>
                            <p className="text-slate-400">
                              {order.shippingInfo.email}
                            </p>
                            <p className="text-slate-400">
                              {order.shippingInfo.phone}
                            </p>
                            <p className="text-slate-400">
                              {order.shippingInfo.address},{" "}
                              {order.shippingInfo.city}
                            </p>
                            <p className="text-slate-400">
                              {order.shippingInfo.region}{" "}
                              {order.shippingInfo.postalCode}
                            </p>
                          </div>
                        </div>

                        {/* Order Items */}
                        <div>
                          <h3 className="text-sm font-medium text-slate-400 mb-3">
                            Order Items
                          </h3>
                          <div className="space-y-3">
                            {order.items.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center gap-3"
                              >
                                <span className="text-xl">{item.image}</span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-white text-sm truncate">
                                    {item.name}
                                  </p>
                                  <p className="text-slate-400 text-xs">
                                    Qty: {item.quantity} × ${item.price}
                                  </p>
                                </div>
                                <p className="text-white font-medium">
                                  ${(item.price * item.quantity).toFixed(2)}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
