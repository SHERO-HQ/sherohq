"use client";
import React, { useState } from "react";
import { useAbandonedCarts } from "@/hooks/queries/useAdmin";
import { useQuery } from "@tanstack/react-query";
import { fetchAllOrders } from "@/services/api";
import { ShoppingCart, CheckCircle2, XCircle, Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function AdminCheckoutCRM() {
  const [activeTab, setActiveTab] = useState<"abandoned" | "completed">("abandoned");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: abandonedCarts, isLoading: isLoadingAbandoned } = useAbandonedCarts();
  
  const { data: completedOrders, isLoading: isLoadingCompleted } = useQuery({
    queryKey: ["admin-completed-orders"],
    queryFn: () => fetchAllOrders(),
  });

  const filteredCompletedOrders = completedOrders?.filter(o => 
    o.status === "completed" || o.paymentStatus === "confirmed" || o.status === "delivered" || o.status === "processing"
  ) || [];

  const searchedAbandoned = abandonedCarts?.filter(cart => {
    const term = searchTerm.toLowerCase();
    return (cart.name?.toLowerCase().includes(term) || cart.email?.toLowerCase().includes(term) || cart.phone?.toLowerCase().includes(term));
  });

  const searchedCompleted = filteredCompletedOrders.filter(order => {
    const term = searchTerm.toLowerCase();
    const name = [order.shippingInfo?.firstName, order.shippingInfo?.lastName].filter(Boolean).join(" ").toLowerCase();
    const email = order.shippingInfo?.email?.toLowerCase() || "";
    const phone = order.shippingInfo?.phone?.toLowerCase() || "";
    const id = order.id.toLowerCase();
    return name.includes(term) || email.includes(term) || phone.includes(term) || id.includes(term);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Checkout CRM</h1>
        <p className="text-slate-500 dark:text-slate-400">
          Track and manage your abandoned carts and successful checkouts for marketing campaigns.
        </p>
      </div>

      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          className={`px-4 py-2 border-b-2 font-medium text-sm flex items-center gap-2 ${
            activeTab === "abandoned"
              ? "border-primary text-primary"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
          onClick={() => setActiveTab("abandoned")}
        >
          <XCircle className="w-4 h-4" />
          Abandoned Carts ({abandonedCarts?.length || 0})
        </button>
        <button
          className={`px-4 py-2 border-b-2 font-medium text-sm flex items-center gap-2 ${
            activeTab === "completed"
              ? "border-primary text-primary"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
          onClick={() => setActiveTab("completed")}
        >
          <CheckCircle2 className="w-4 h-4" />
          Successful Checkouts ({searchedCompleted.length || 0})
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search by name, email, phone..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {activeTab === "abandoned" && (
        <div className="bg-white dark:bg-slate-900 rounded shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          {isLoadingAbandoned ? (
            <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : searchedAbandoned && searchedAbandoned.length > 0 ? (
            <div className="max-h-[600px] overflow-y-auto overflow-x-auto relative">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="px-6 py-3 font-medium">Contact</th>
                    <th className="px-6 py-3 font-medium">Cart Value</th>
                    <th className="px-6 py-3 font-medium">Items</th>
                    <th className="px-6 py-3 font-medium">Last Active</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {searchedAbandoned.map((cart) => (
                    <tr key={cart.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900 dark:text-white">{cart.name || "Guest"}</div>
                        <div className="text-slate-500 text-xs">{cart.email || "No Email"}</div>
                        {cart.phone && <div className="text-slate-500 text-xs">{cart.phone}</div>}
                      </td>
                      <td className="px-6 py-4 font-medium text-primary">GHS{cart.totalValue.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <ShoppingCart className="w-4 h-4 text-slate-400" />
                          <span>{cart.items.reduce((sum, item) => sum + (item.quantity || 1), 0)} items</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {new Date(cart.lastActive).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500">No abandoned carts found.</div>
          )}
        </div>
      )}

      {activeTab === "completed" && (
        <div className="bg-white dark:bg-slate-900 rounded shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          {isLoadingCompleted ? (
            <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : searchedCompleted && searchedCompleted.length > 0 ? (
            <div className="max-h-[600px] overflow-y-auto overflow-x-auto relative">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="px-6 py-3 font-medium">Order ID</th>
                    <th className="px-6 py-3 font-medium">Contact</th>
                    <th className="px-6 py-3 font-medium">Total</th>
                    <th className="px-6 py-3 font-medium">Method / Status</th>
                    <th className="px-6 py-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {searchedCompleted.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                        {order.id.substring(0, 8).toUpperCase()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900 dark:text-white">
                          {[order.shippingInfo?.firstName, order.shippingInfo?.lastName].filter(Boolean).join(" ") || "Customer"}
                        </div>
                        <div className="text-slate-500 text-xs">{order.shippingInfo?.email || "No Email"}</div>
                        {order.shippingInfo?.phone && <div className="text-slate-500 text-xs">{order.shippingInfo?.phone}</div>}
                      </td>
                      <td className="px-6 py-4 font-medium text-primary">GHS{Number(order.total).toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <div className="capitalize">{order.paymentMethod.replace(/_/g, " ")}</div>
                        <div className="text-xs text-slate-500">{order.status}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {new Date(order.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500">No successful checkouts found.</div>
          )}
        </div>
      )}
    </div>
  );
}
