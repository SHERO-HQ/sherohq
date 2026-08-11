"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { AdminOrderRow } from "@/components/admin/orders/AdminOrderRow";
import { AdminOrdersHeader } from "@/components/admin/orders/AdminOrdersHeader";
import { AdminOrdersFilters } from "@/components/admin/orders/AdminOrdersFilters";
import { useAdminOrdersState } from "@/components/admin/orders/useAdminOrdersState";

export default function AdminOrders() {
  const {
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    currentPage,
    setCurrentPage,
    itemsPerPage,
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
  } = useAdminOrdersState();

  return (
    <ErrorBoundary>
      <div className="space-y-6 relative">
        {isPlaceholderData && (
          <div className="absolute inset-0 bg-card/10 z-10 pointer-events-none transition-opacity" />
        )}

        {/* Header & Filters Sticky Bar */}
        <div className="sticky top-20 z-20 bg-background/95 backdrop-blur-md py-3 pb-4 -mx-3 px-3 md:-mx-6 md:px-6 border-b border-border/50 space-y-4 shadow-xs rounded-b">
          <AdminOrdersHeader
            onRefetch={() => refetch()}
            isFetching={isFetching}
            onExport={handleExport}
          />

          {/* Filters */}
          <AdminOrdersFilters
            search={search}
            setSearch={setSearch}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            setCurrentPage={setCurrentPage}
          />
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded text-rose-400 text-sm">
            {error}
          </div>
        )}

        {/* Orders Table */}
        <div className="bg-card/40 border border-border rounded overflow-hidden max-h-[calc(100vh-16rem)] flex flex-col">
          <div className="overflow-auto flex-1">
            <table className="w-full text-left min-w-[1000px] border-separate border-spacing-0">
              <thead>
                <tr>
                  <th className="sticky top-0 z-10 bg-card border-b border-border px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="sticky top-0 z-10 bg-card border-b border-border px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="sticky top-0 z-10 bg-card border-b border-border px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Order Status
                  </th>
                  <th className="sticky top-0 z-10 bg-card border-b border-border px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Date
                  </th>
                  <th className="sticky top-0 z-10 bg-card border-b border-border px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Payment Status
                  </th>
                  <th className="sticky top-0 z-10 bg-card border-b border-border px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">
                    Total
                  </th>
                  <th className="sticky top-0 z-10 bg-card border-b border-border px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">
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
                    <AdminOrderRow
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
