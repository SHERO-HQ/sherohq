"use client";

import {
  ShoppingBag,
  Clock,
  Truck,
  PackageCheck,
  Package,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Order } from "@/services/orders";

interface TrackTimelineProps {
  order: Order;
  isStorePickupOrder: boolean;
}

const steps = [
  { label: "Ordered", icon: ShoppingBag },
  { label: "Processing", icon: Clock },
  { label: "In Transit", icon: Truck },
  { label: "Delivered", icon: PackageCheck },
];

function getStatusStep(status: string) {
  const s = status.toLowerCase();
  if (s === "pending" || s === "quote") return 1;
  if (s === "processing") return 2;
  if (s === "intransit") return 3;
  if (s === "delivered") return 4;
  if (s === "cancelled") return -1;
  return 1;
}

export function TrackTimeline({ order, isStorePickupOrder }: TrackTimelineProps) {
  const currentStep = getStatusStep(order.status);

  if (order.status === "cancelled") {
    return (
      <Card className="p-8 bg-rose-500/5 border-rose-500/10 flex flex-col md:flex-row items-center gap-4">
        <div className="w-12 h-12 bg-rose-500 text-white rounded-full flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold text-rose-600">Order Cancelled</h3>
          <p className="text-sm text-rose-500/80">
            This order has been cancelled and is no longer being processed.
          </p>
        </div>
      </Card>
    );
  }

  if (isStorePickupOrder) {
    return (
      <Card className="p-8 bg-brand-secondary-500/5 border-brand-secondary-500/10 flex flex-col md:flex-row items-center gap-4">
        <div className="w-12 h-12 bg-brand-secondary-500 text-white rounded-full flex items-center justify-center">
          <Package className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold text-brand-secondary-600">Store Pickup Order</h3>
          <p className="text-sm text-brand-secondary-600/80">
            This order will be collected in store, so delivery tracking is not available.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="py-6 dark:bg-slate-900 border-none shadow-sm overflow-hidden border">
      <div className="relative">
        {/* Progress Line Background */}
        <div className="absolute top-4 left-[12.5%] right-[12.5%] h-1 bg-slate-100 dark:bg-slate-800 z-0" />
        {/* Active Progress Line */}
        <div className="absolute top-4 left-[12.5%] right-[12.5%] h-1 z-0">
          <div
            className="absolute top-0 left-0 h-1 bg-brand-secondary-500 transition-all duration-1000 ease-out"
            style={{
              width: `${Math.max(0, (currentStep - 1) / (steps.length - 1)) * 100}%`,
            }}
          />
        </div>

        <div className="relative z-10 grid grid-cols-4 gap-2">
          {steps.map((step, idx) => {
            const stepNum = idx + 1;
            const isCompleted = currentStep > stepNum;
            const isActive = currentStep === stepNum;

            return (
              <div
                key={step.label}
                className="flex flex-col items-center text-center"
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 mx-auto",
                    isCompleted
                      ? "bg-brand-secondary-500 text-white"
                      : isActive
                        ? "bg-brand-secondary-500 text-white scale-110 shadow shadow-brand-secondary-500/20"
                        : "bg-white dark:bg-slate-800 text-slate-400 border-2 border-slate-100 dark:border-slate-800",
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : (
                    <step.icon className="w-4.5 h-4.5" />
                  )}
                </div>
                <span
                  className={cn(
                    "mt-2 text-[10px] md:text-xs font-bold tracking-wider",
                    isActive
                      ? "text-brand-secondary-500"
                      : "text-slate-400 dark:text-slate-500",
                  )}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
