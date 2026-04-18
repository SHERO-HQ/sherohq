"use client";
import React from "react";
import {
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  MapPin,
  CreditCard,
  Phone,
  Mail,
} from "lucide-react";
import type { Order, User } from "@/services/api";
import { getImageUrl } from "@/services/api";
import AppImage from "@/components/common/AppImage";
import { toReadableOrderId } from "@/utils/orderId";

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

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
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

  return (
    <div className="bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800 overflow-hidden">
      {/* Order Header (Clickable) */}
      <button
        onClick={onToggle}
        className="w-full text-left p-6 flex flex-wrap items-center justify-between gap-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
      >
        <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Order ID
            </p>
            <p className="font-mono text-sm font-bold text-slate-900 dark:text-white">
              {toReadableOrderId(order.id)}
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
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
              GH₵{order.total.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div
            className={`px-3 py-1 rounded text-xs font-bold capitalize ${getStatusBadgeColor(
              order.status,
            )}`}
          >
            {order.status}
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          )}
        </div>
      </button>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="mb-4">
            <button
              type="button"
              onClick={() => void handleCopyOrderId()}
              className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
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
                    GH₵{item.price.toFixed(2)} × {item.quantity}
                  </p>
                </div>
                <p className="font-bold text-sm text-slate-900 dark:text-white">
                  GH₵{(item.price * item.quantity).toFixed(2)}
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
                <div className="mt-2 p-2 bg-emerald-50 dark:bg-emerald-900/10 rounded text-emerald-700 dark:text-emerald-400 text-xs font-medium inline-block">
                  Paid via Mobile Money / Card
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderItem;
