"use client";

import React, { memo } from "react";
import Link from "next/link";
import { m } from "motion/react";
import {
  Eye,
  Truck,
  RefreshCw,
  PackageSearch,
  PackageCheck,
  PackageX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/format";
import { displayOrderId } from "@/utils/orderId";
import { getAdminOrderPaymentStatus } from "@/lib/paymentStatus";

interface AdminOrderRowProps {
  order: any;
  index: number;
  getStatusConfig: (status: string) => any;
  handleUpdateStatus: (id: string, status: string) => void;
}

export const AdminOrderRow = memo(function AdminOrderRow({
  order,
  index,
  getStatusConfig,
  handleUpdateStatus,
}: AdminOrderRowProps) {
  const status = getStatusConfig(order.status);
  const paymentStatus = getAdminOrderPaymentStatus({
    paymentStatus: order.paymentStatus,
    status: order.status,
    paymentMessage: order.paymentMessage,
  });

  return (
    <m.tr
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
          {displayOrderId(order.id)}
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
          {formatCurrency(order.total)}
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
    </m.tr>
  );
});
