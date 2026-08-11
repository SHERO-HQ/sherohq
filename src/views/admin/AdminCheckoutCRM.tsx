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
  const [filterType, setFilterType] = useState<"all" | "actionable" | "anonymous">("actionable");

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
    const matchesSearch = (cart.name?.toLowerCase().includes(term) || cart.email?.toLowerCase().includes(term) || cart.phone?.toLowerCase().includes(term));
    
    if (!matchesSearch) return false;
    
    const hasContact = !!(cart.email || cart.phone);
    if (filterType === "actionable") return hasContact;
    if (filterType === "anonymous") return !hasContact;
    return true;
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
        <h1 className="text-3xl font-bold text-foreground">Checkout CRM</h1>
        <p className="text-muted-foreground">
          Track and manage your abandoned carts and successful checkouts for marketing campaigns.
        </p>
      </div>

      <div className="flex border-b border-border">
        <button
          className={`px-4 py-2 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
            activeTab === "abandoned"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("abandoned")}
        >
          <XCircle className="w-4 h-4" />
          Abandoned Carts ({abandonedCarts?.length || 0})
        </button>
        <button
          className={`px-4 py-2 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
            activeTab === "completed"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("completed")}
        >
          <CheckCircle2 className="w-4 h-4" />
          Successful Checkouts ({searchedCompleted.length || 0})
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name, email, phone..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        {activeTab === "abandoned" && (
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="border border-border bg-card rounded-md text-sm py-2 px-3 focus:ring-2 focus:ring-primary text-foreground"
          >
            <option value="actionable" className="bg-card text-foreground">Actionable (Has Contact)</option>
            <option value="all" className="bg-card text-foreground">All Carts</option>
            <option value="anonymous" className="bg-card text-foreground">Anonymous (No Contact)</option>
          </select>
        )}
      </div>

      {activeTab === "abandoned" && (
        <div className="bg-card rounded shadow-sm border border-border overflow-hidden">
          {isLoadingAbandoned ? (
            <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : searchedAbandoned && searchedAbandoned.length > 0 ? (
            <div className="max-h-[600px] overflow-y-auto overflow-x-auto relative">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted text-muted-foreground sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="px-6 py-3 font-medium">Contact</th>
                    <th className="px-6 py-3 font-medium">Cart Value</th>
                    <th className="px-6 py-3 font-medium">Items</th>
                    <th className="px-6 py-3 font-medium">Last Active</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {searchedAbandoned.map((cart) => (
                    <tr key={cart.id} className="hover:bg-accent/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-foreground">{cart.name || "Guest"}</div>
                        <div className="text-muted-foreground text-xs">{cart.email || "No Email"}</div>
                        {cart.phone && <div className="text-muted-foreground text-xs">{cart.phone}</div>}
                      </td>
                      <td className="px-6 py-4 font-medium text-primary">GHS{cart.totalValue.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 mb-2">
                          <ShoppingCart className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium text-foreground">{cart.items.reduce((sum, item) => sum + (item.quantity || 1), 0)} items</span>
                        </div>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          {cart.items.map((item, idx) => (
                            <li key={idx} className="flex justify-between items-center bg-muted p-1.5 rounded">
                              <span className="truncate max-w-[150px]" title={item.name}>{item.name}</span>
                              <span className="font-medium whitespace-nowrap ml-2">x{item.quantity}</span>
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {new Date(cart.lastActive).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">No abandoned carts found.</div>
          )}
        </div>
      )}

      {activeTab === "completed" && (
        <div className="bg-card rounded shadow-sm border border-border overflow-hidden">
          {isLoadingCompleted ? (
            <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : searchedCompleted && searchedCompleted.length > 0 ? (
            <div className="max-h-[600px] overflow-y-auto overflow-x-auto relative">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted text-muted-foreground sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="px-6 py-3 font-medium">Order ID</th>
                    <th className="px-6 py-3 font-medium">Contact</th>
                    <th className="px-6 py-3 font-medium">Total</th>
                    <th className="px-6 py-3 font-medium">Method / Status</th>
                    <th className="px-6 py-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {searchedCompleted.map((order) => (
                    <tr key={order.id} className="hover:bg-accent/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-foreground">
                        {order.id.substring(0, 8).toUpperCase()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-foreground">
                          {[order.shippingInfo?.firstName, order.shippingInfo?.lastName].filter(Boolean).join(" ") || "Customer"}
                        </div>
                        <div className="text-muted-foreground text-xs">{order.shippingInfo?.email || "No Email"}</div>
                        {order.shippingInfo?.phone && <div className="text-muted-foreground text-xs">{order.shippingInfo?.phone}</div>}
                      </td>
                      <td className="px-6 py-4 font-medium text-primary">GHS{Number(order.total).toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <div className="capitalize text-foreground">{order.paymentMethod.replace(/_/g, " ")}</div>
                        <div className="text-xs text-muted-foreground">{order.status}</div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {new Date(order.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">No successful checkouts found.</div>
          )}
        </div>
      )}
    </div>
  );
}
