import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  Users,
  Search,
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
  CheckCircle,
  XCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Trash2,
  X,
  Package,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useNotifications } from "@/hooks/useNotifications";
import {
  useAdminUsers,
  useAdminUserDetails,
  useDeleteAdminUser,
} from "@/hooks/queries/useUsers";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function AdminUsers() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const { addNotification } = useNotifications();

  // User details modal state
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to first page on search
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Main users query
  const {
    data: usersData,
    isLoading: loading,
    isPlaceholderData,
    refetch: refetchUsers,
    isFetching,
  } = useAdminUsers({
    page,
    limit: 20,
    search: debouncedSearch,
  });

  const users = usersData?.users || [];
  const pagination = usersData?.pagination || {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  };

  // User details query
  const { data: detailsData, isLoading: detailsLoading } = useAdminUserDetails(
    selectedUserId || "",
  );

  const selectedUser = detailsData?.user;
  const userOrders = detailsData?.orders || [];
  const userStats = detailsData?.stats;

  // Delete mutation
  const deleteMutation = useDeleteAdminUser();
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteMutation.mutateAsync(userId);
      addNotification("Success", "User deleted successfully", "success");
      setDeleteConfirmId(null);
    } catch (error) {
      console.error("Error deleting user:", error);
      addNotification("Error", "Failed to delete user", "error");
    }
  };

  const openDetails = (userId: string) => {
    setSelectedUserId(userId);
    setShowDetailsModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return `GH₵ ${amount.toLocaleString("en-GH", { minimumFractionDigits: 2 })}`;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-500/20 text-yellow-400",
      processing: "bg-blue-500/20 text-blue-400",
      shipped: "bg-purple-500/20 text-purple-400",
      delivered: "bg-emerald-500/20 text-emerald-400",
      cancelled: "bg-red-500/20 text-red-400",
    };
    return colors[status.toLowerCase()] || "bg-slate-500/20 text-slate-400";
  };

  return (
    <AdminLayout>
      <div className="space-y-6 relative">
        {isPlaceholderData && (
          <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[1px] z-10 pointer-events-none transition-opacity" />
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white font-sora flex items-center gap-3">
              <Users className="w-7 h-7 text-emerald-400" />
              Customers
            </h1>
            <p className="text-slate-400 text-sm">
              Manage your customer database and view their activity
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => refetchUsers()}
              disabled={isFetching}
              className="bg-slate-800/50 border-white/5"
            >
              <RefreshCw
                className={cn("w-4 h-4", isFetching && "animate-spin")}
              />
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-6">
              Export List
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-800/30 backdrop-blur-sm border border-white/5 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <Users className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-slate-400 text-sm">Total Customers</p>
                <p className="text-xl font-bold text-white">
                  {pagination.total}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-slate-800/30 backdrop-blur-sm border border-white/5 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <CheckCircle className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-slate-400 text-sm">Verified Users</p>
                <p className="text-xl font-bold text-white">
                  {users.filter((u) => u.emailVerified).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-slate-800/30 backdrop-blur-sm border border-white/5 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Calendar className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-slate-400 text-sm">This Month</p>
                <p className="text-xl font-bold text-white">
                  {
                    users.filter((u) => {
                      const created = new Date(u.createdAt);
                      const now = new Date();
                      return (
                        created.getMonth() === now.getMonth() &&
                        created.getFullYear() === now.getFullYear()
                      );
                    }).length
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-slate-800/30 backdrop-blur-sm border border-white/5 rounded-xl overflow-hidden relative">
          {loading && !users.length ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-20">
              <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No customers found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900/50">
                  <tr>
                    <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-4">
                      Customer
                    </th>
                    <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-4">
                      Contact
                    </th>
                    <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-4">
                      Status
                    </th>
                    <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-4">
                      Joined
                    </th>
                    <th className="text-right text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-4">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map((user) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-linear-to-br from-emerald-500 to-blue-500 flex items-center justify-center text-white font-medium">
                            {user.avatar ? (
                              <img
                                src={user.avatar}
                                alt={user.name}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              user.name.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-white">
                              {user.name}
                            </p>
                            <p className="text-sm text-slate-400">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-slate-300">
                            <Mail className="w-4 h-4 text-slate-500" />
                            {user.email}
                          </div>
                          {user.phone && (
                            <div className="flex items-center gap-2 text-sm text-slate-400">
                              <Phone className="w-4 h-4 text-slate-500" />
                              {user.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {user.emailVerified ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400">
                            <CheckCircle className="w-3 h-3" />
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">
                            <XCircle className="w-3 h-3" />
                            Unverified
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-300">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openDetails(user.id)}
                            className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(user.id)}
                            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-white/5">
              <p className="text-sm text-slate-400">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                of {pagination.total} customers
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={pagination.page === 1}
                  className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-slate-300">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() =>
                    setPage((p) => Math.min(pagination.totalPages, p + 1))
                  }
                  disabled={pagination.page === pagination.totalPages}
                  className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Details Modal */}
        <AnimatePresence>
          {showDetailsModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowDetailsModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/5">
                  <h2 className="text-xl font-bold text-white">
                    Customer Details
                  </h2>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {detailsLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                  </div>
                ) : selectedUser ? (
                  <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(80vh-80px)]">
                    {/* User Info */}
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-xl bg-linear-to-br from-emerald-500 to-blue-500 flex items-center justify-center text-white text-2xl font-bold">
                        {selectedUser.avatar ? (
                          <img
                            src={selectedUser.avatar}
                            alt={selectedUser.name}
                            className="w-full h-full rounded-xl object-cover"
                          />
                        ) : (
                          selectedUser.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white">
                          {selectedUser.name}
                        </h3>
                        <p className="text-slate-400">{selectedUser.email}</p>
                        {selectedUser.phone && (
                          <p className="text-slate-500 text-sm">
                            {selectedUser.phone}
                          </p>
                        )}
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          selectedUser.emailVerified
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-yellow-500/20 text-yellow-400"
                        }`}
                      >
                        {selectedUser.emailVerified ? "Verified" : "Unverified"}
                      </span>
                    </div>

                    {/* Stats */}
                    {userStats && (
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                          <ShoppingBag className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                          <p className="text-2xl font-bold text-white">
                            {userStats.totalOrders}
                          </p>
                          <p className="text-xs text-slate-400">Total Orders</p>
                        </div>
                        <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                          <Package className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                          <p className="text-2xl font-bold text-white">
                            {formatCurrency(userStats.totalSpent)}
                          </p>
                          <p className="text-xs text-slate-400">Total Spent</p>
                        </div>
                        <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                          <Calendar className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                          <p className="text-sm font-bold text-white">
                            {userStats.lastOrderDate
                              ? formatDate(userStats.lastOrderDate)
                              : "N/A"}
                          </p>
                          <p className="text-xs text-slate-400">Last Order</p>
                        </div>
                      </div>
                    )}

                    {/* Order History */}
                    <div>
                      <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">
                        Recent Orders
                      </h4>
                      {userOrders.length === 0 ? (
                        <div className="text-center py-8 bg-slate-800/30 rounded-xl">
                          <ShoppingBag className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                          <p className="text-slate-500">No orders yet</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {userOrders.slice(0, 5).map((order) => (
                            <div
                              key={order.id}
                              className="bg-slate-800/30 rounded-xl p-4 flex items-center justify-between"
                            >
                              <div>
                                <p className="text-white font-medium">
                                  Order #{order.id.slice(0, 8)}
                                </p>
                                <p className="text-sm text-slate-400">
                                  {order.items?.length || 0} item(s) •{" "}
                                  {formatDate(order.createdAt)}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-white font-medium">
                                  {formatCurrency(Number(order.total))}
                                </p>
                                <span
                                  className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}
                                >
                                  {order.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <p className="text-slate-400">User not found</p>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {deleteConfirmId && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setDeleteConfirmId(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-md"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trash2 className="w-8 h-8 text-red-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    Delete Customer?
                  </h3>
                  <p className="text-slate-400 mb-6">
                    This action cannot be undone. The customer's account and all
                    associated data will be permanently removed.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setDeleteConfirmId(null)}
                      className="flex-1 px-4 py-2.5 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleDeleteUser(deleteConfirmId)}
                      disabled={deleteMutation.isPending}
                      className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {deleteMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
}
