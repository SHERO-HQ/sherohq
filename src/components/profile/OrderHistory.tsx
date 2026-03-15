"use client";
import React from "react";
import { Loader2, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import OrderItem from "./OrderItem";
import type { Order, User } from "@/services/api";

interface OrderHistoryProps {
 orders: Order[];
 loading: boolean;
 user: User | null;
 expandedOrder: string | null;
 onToggleExpand: (id: string) => void;
}

const OrderHistory: React.FC<OrderHistoryProps> = ({
 orders,
 loading,
 user,
 expandedOrder,
 onToggleExpand,
}) => {
 const router = useRouter();

 if (loading) {
 return (
 <div className="flex flex-col items-center justify-center py-20 text-slate-500">
 <Loader2 className="w-8 h-8 animate-spin mb-4" />
 <p>Loading your orders...</p>
 </div>
 );
 }

 if (orders.length === 0) {
 return (
 <div className="bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800 p-12 text-center">
 <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
 <ShoppingBag className="w-10 h-10" />
 </div>
 <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
 No orders yet
 </h3>
 <p className="text-slate-500 dark:text-slate-400 mb-8">
 Looks like you haven't made any purchases yet.
 </p>
 <button
 onClick={() => router.push("/products")}
 className="cursor-pointer px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded transition-colors"
 >
 Start Shopping
 </button>
 </div>
 );
 }

 return (
 <div className="space-y-4">
 {orders.map((order) => (
 <OrderItem
 key={order.id}
 order={order}
 user={user}
 isExpanded={expandedOrder === order.id}
 onToggle={() => onToggleExpand(order.id)}
 />
 ))}
 </div>
 );
};

export default OrderHistory;
