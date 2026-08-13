"use client";
import { toReadableOrderId } from "@/utils/orderId";
import React from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  MapPin,
  CreditCard,
  Phone,
  Mail,
  Truck,
  Clock,
  ArrowRight,
} from "lucide-react";
import type { Order, User } from "@/services/api";
import { getImageUrl } from "@/services/api";
import AppImage from "@/components/common/AppImage";

interface OrderItemProps {
  order: Order;
  user: User | null;
  isExpanded: boolean;
  onToggle: () => void;
}

const OrderItem: React.FC<OrderItemProps> = ({
  order,
  user,
  isExpanded,
  onToggle,
}) => {
  const [copied, setCopied] = React.useState(false);
  const isPending = order.status.toLowerCase() === "pending";

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "bg-brand-secondary-100 text-brand-secondary-700 dark:bg-brand-secondary-900/30 dark:text-brand-secondary-400";
      case "pending":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
      default:
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    }
  };

  const handleCopyOrderId = async () => {
    try {
      await navigator.clipboard.writeText(toReadableOrderId(order.id));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Failed to copy order ID:", err);
    }
  };

  const readableOrderId = toReadableOrderId(order.id);

  return (
    <div className={`bg-white dark:bg-slate-900 rounded border ${isPending ? 'border-amber-300/60 dark:border-amber-700/50 shadow-sm' : 'border-slate-200 dark:border-slate-800'} overflow-hidden`}>
      {/* Order Header (Clickable row) */}
      <div
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle();
          }
        }}
        className="w-full text-left p-6 flex flex-wrap items-center justify-between gap-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer select-none"
      >
        <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Order ID
            </p>
            <p className="font-mono text-sm font-bold text-slate-900 dark:text-white">
              {readableOrderId}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Date
            </p>
            <p className="text-sm font-medium text-slate-900 dark:text-white flex items-center gap-1">
              {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Total
            </p>
            <p className="text-sm font-bold text-brand-secondary-600 dark:text-brand-secondary-400">
              GHS{order.total.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div
            className={`px-3 py-1 rounded text-xs font-bold capitalize ${getStatusBadgeColor(
              order.status,
            )}`}
          >
            {order.status}
          </div>

          {isPending && (
            <Link
              href={`/checkout/pay?id=${order.id}`}
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-xs font-semibold rounded shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500"
              title="Complete payment for this order"
            >
              <CreditCard className="w-3.5 h-3.5 shrink-0" />
              <span>Complete Payment</span>
            </Link>
          )}

          <Link
            href={`/track/${readableOrderId}`}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-secondary-600 hover:bg-brand-secondary-700 active:bg-brand-secondary-800 text-white text-xs font-semibold rounded shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-brand-secondary-500"
            title={`Track order ${readableOrderId}`}
          >
            <Truck className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Track Order</span>
            <span className="sm:hidden">Track</span>
          </Link>

          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          )}
        </div>
      </div>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Pending Order Notice Banner */}
          {isPending && (
            <div className="mb-6 p-4 rounded-lg bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-full shrink-0 mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                    Payment Pending Confirmation
                  </h4>
                  <p className="text-xs text-amber-800/80 dark:text-amber-300/80 mt-0.5">
                    This order is waiting for payment. Complete payment now to secure your items before the reservation expires.
                  </p>
                </div>
              </div>
              <Link
                href={`/checkout/pay?id=${order.id}`}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-xs font-bold rounded shadow-sm transition-colors shrink-0"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Pay GHS {order.total.toFixed(2)}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          <div className="mb-4 flex items-center justify-between gap-4 flex-wrap">
            <button
              type="button"
              onClick={() => void handleCopyOrderId()}
              className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 hover:text-brand-secondary-600 dark:hover:text-brand-secondary-400 transition-colors"
              aria-label="Copy order ID"
              title="Copy order ID"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" /> Copied
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Copy Order ID
                </>
              )}
            </button>

            <Link
              href={`/track/${readableOrderId}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-secondary-600 hover:text-brand-secondary-700 dark:text-brand-secondary-400 dark:hover:text-brand-secondary-300 transition-colors"
            >
              <Truck className="w-3.5 h-3.5" />
              <span>View Full Tracking Timeline</span>
            </Link>
          </div>

          {/* Items List */}
          <div className="space-y-4 mb-8">
            <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
              Items in Order
            </h5>
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col md:flex-row md:items-center gap-4 bg-slate-50 dark:bg-slate-800/30 p-3 rounded"
              >
                <div className="relative w-12 h-12 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800 flex items-center justify-center overflow-hidden shrink-0">
                  {item.image &&
                    (item.image.startsWith("/uploads") ||
                      item.image.startsWith("http")) ? (
                    <AppImage
                      src={getImageUrl(item.image)}
                      alt={item.name}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="text-xl select-none">{item.image}</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
                    {item.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    GHS{item.price.toFixed(2)} × {item.quantity}
                  </p>
                </div>
                <p className="font-bold text-sm text-slate-900 dark:text-white">
                  GHS{(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          {/* Details Grid */}
          <div className="grid md:grid-cols-2 gap-8 pt-6 border-t border-slate-100 dark:border-slate-800">
            <div>
              <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5" />
                Shipping Address
              </h5>
              <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                <p className="font-bold text-slate-900 dark:text-white">
                  {order.shippingInfo.firstName} {order.shippingInfo.lastName}
                </p>
                <p>{order.shippingInfo.address}</p>
                <p>
                  {order.shippingInfo.city}, {order.shippingInfo.region}
                </p>
                <p>{order.shippingInfo.postalCode}</p>
              </div>
            </div>

            <div>
              <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <CreditCard className="w-3.5 h-3.5" />
                Contact & Payment
              </h5>
              <div className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{order.shippingInfo.phone || "No phone"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{user?.email}</span>
                </div>
                {isPending ? (
                  <div className="mt-2 p-2.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded flex items-center justify-between gap-3">
                    <span className="text-amber-800 dark:text-amber-300 text-xs font-medium">
                      Awaiting Payment Confirmation
                    </span>
                    <Link
                      href={`/checkout/pay?id=${order.id}`}
                      className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline inline-flex items-center gap-1 shrink-0"
                    >
                      Pay Now <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                ) : (
                  <div className="mt-2 p-2 bg-brand-secondary-50 dark:bg-brand-secondary-900/10 rounded text-brand-secondary-700 dark:text-brand-secondary-400 text-xs font-medium inline-block">
                    Paid via Mobile Money / Card
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderItem;
