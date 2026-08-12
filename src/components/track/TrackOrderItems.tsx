"use client";

import { ShoppingBag, Package } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { Order } from "@/services/orders";

interface TrackOrderItemsProps {
  order: Order;
  hasOrderItems: boolean;
  hasOrderTotal: boolean;
  orderItems: Order["items"];
}

export function TrackOrderItems({
  order,
  hasOrderItems,
  hasOrderTotal,
  orderItems,
}: TrackOrderItemsProps) {
  return (
    <Card className="dark:bg-slate-900 border-none shadow-sm overflow-hidden border">
      <div className="p-6 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5">
        <h3 className="font-bold flex items-center gap-2 dark:text-white">
          <ShoppingBag className="w-4 h-4 text-brand-secondary-500" />
          Package Contents
        </h3>
      </div>
      <div className="divide-y divide-slate-100 dark:divide-white/5">
        {hasOrderItems ? (
          orderItems.map((item) => (
            <div key={item.id} className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                {item.image ? (
                  <div className="w-12 h-12 rounded bg-slate-100 dark:bg-slate-800 overflow-hidden flex items-center justify-center">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                    <Package className="w-6 h-6" />
                  </div>
                )}
                <div>
                  <p className="font-bold text-sm dark:text-white">{item.name}</p>
                  <p className="text-xs text-slate-500">
                    Quantity: {item.quantity}
                  </p>
                </div>
              </div>
              <p className="font-bold text-sm dark:text-white">
                GHS
                {(item.price * item.quantity).toLocaleString("en-GH", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
          ))
        ) : (
          <div className="p-6 text-sm text-slate-500 dark:text-slate-400">
            Item details are hidden for this tracking link. Open the original
            checkout confirmation link or sign in to view full order contents.
          </div>
        )}
      </div>
      {hasOrderTotal && (
        <div className="p-6 bg-brand-secondary-500/5 border-t border-brand-secondary-500/10">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Total Payable
            </span>
            <span className="text-xl font-bold text-brand-secondary-600 dark:text-brand-secondary-400">
              GHS
              {Number(order.total).toLocaleString("en-GH", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>
      )}
    </Card>
  );
}
