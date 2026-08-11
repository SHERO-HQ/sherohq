"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { toReadableOrderId } from "@/utils/orderId";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { RecentOrder } from "@/services/api";

const getStatusStyles = (status: string) => {
  switch (status?.toLowerCase()) {
    case "delivered":
      return "bg-brand-secondary-500/10 border border-brand-secondary-500/20 text-brand-secondary-400";
    case "pending":
      return "bg-amber-500/10 border border-amber-500/20 text-amber-400";
    case "processing":
      return "bg-blue-500/10 border border-blue-500/20 text-blue-400";
    default:
      return "bg-rose-500/10 border border-rose-500/20 text-rose-400";
  }
};

interface DashboardRecentOrdersProps {
  recentOrders: RecentOrder[] | undefined;
  isLoading: boolean;
}

export function DashboardRecentOrders({
  recentOrders,
  isLoading,
}: DashboardRecentOrdersProps) {
  const hasNoOrders =
    !recentOrders || !Array.isArray(recentOrders) || recentOrders.length === 0;

  return (
    <Card className="bg-card/40 border-border overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between border-b border-border">
        <div>
          <CardTitle className="text-lg text-foreground">
            Recent Incoming Orders
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Real-time order tracking
          </CardDescription>
        </div>
        <Button
          variant="ghost"
          className="text-brand-secondary-400 hover:text-brand-secondary-300 hover:bg-brand-secondary-500/10"
          asChild
        >
          <Link href="/admin/orders">
            View All Orders <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <div className="overflow-auto max-h-120 custom-scrollbar">
        <table className="w-full text-left border-separate border-spacing-0">
          <thead>
            <tr className="bg-muted/50">
              <th className="sticky top-0 z-10 bg-card border-b border-border px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Order ID
              </th>
              <th className="sticky top-0 z-10 bg-card border-b border-border px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Customer
              </th>
              <th className="sticky top-0 z-10 bg-card border-b border-border px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Date
              </th>
              <th className="sticky top-0 z-10 bg-card border-b border-border px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Amount
              </th>
              <th className="sticky top-0 z-10 bg-card border-b border-border px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Status
              </th>
              <th className="sticky top-0 z-10 bg-card border-b border-border px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {(() => {
              if (isLoading) {
                return new Array(5).fill(0).map((_, i) => (
                  <tr
                    key={`skeleton-recent-order-${i}`}
                    className="animate-pulse border-b border-border last:border-0"
                  >
                    <td className="px-6 py-4">
                      <div className="h-4 bg-accent/50 rounded w-16" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div className="h-4 bg-accent rounded w-32" />
                        <div className="h-3 bg-accent/50 rounded w-24" />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-accent/50 rounded w-20" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-accent rounded w-16" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-5 bg-accent/50 rounded-full w-20" />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="h-8 bg-accent/50 rounded w-16 ml-auto" />
                    </td>
                  </tr>
                ));
              }

              if (hasNoOrders) {
                return (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-8 text-center text-muted-foreground italic"
                    >
                      No recent orders found
                    </td>
                  </tr>
                );
              }

              return (recentOrders || []).map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-border last:border-0 hover:bg-accent transition-colors"
                >
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-sm font-mono text-muted-foreground group-hover:text-brand-secondary-400 transition-colors"
                    >
                      {toReadableOrderId(order.id)}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="flex flex-col"
                    >
                      <span className="text-sm font-semibold text-foreground group-hover:text-brand-secondary-400 transition-colors">
                        {order.customer.firstName} {order.customer.lastName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {order.customer.email}
                      </span>
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-brand-secondary-400">
                    GHS
                    {order.total.toLocaleString("en-GH", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase",
                        getStatusStyles(order.status),
                      )}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 px-2 text-muted-foreground hover:text-foreground hover:bg-accent"
                      asChild
                    >
                      <Link href={`/admin/orders/${order.id}`}>Details</Link>
                    </Button>
                  </td>
                </tr>
              ));
            })()}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
