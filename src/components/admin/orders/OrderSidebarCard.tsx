import { CreditCard, Package, Clock, Truck, CheckCircle2, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { type Order } from "@/services/api";

const getStatusConfig = (status: string) => {
  switch (status.toLowerCase()) {
    case "pending":
      return { color: "text-amber-400 bg-amber-500/10", icon: Clock };
    case "processing":
      return { color: "text-blue-400 bg-blue-500/10", icon: Truck };
    case "intransit":
      return { color: "text-purple-400 bg-purple-500/10", icon: Truck };
    case "delivered":
      return {
        color: "text-brand-secondary-400 bg-brand-secondary-500/10",
        icon: CheckCircle2,
      };
    case "cancelled":
      return { color: "text-rose-400 bg-rose-500/10", icon: XCircle };
    default:
      return { color: "text-muted-foreground bg-slate-500/10", icon: Clock };
  }
};

const getStatusStyles = (status: string) => {
  switch (status?.toLowerCase()) {
    case "delivered":
      return "bg-brand-secondary-500/10 border border-brand-secondary-500/20 text-brand-secondary-400";
    case "pending":
      return "bg-amber-500/10 border border-amber-500/20 text-amber-400";
    case "processing":
      return "bg-blue-500/10 border border-blue-500/20 text-blue-400";
    case "intransit":
      return "bg-purple-500/10 border border-purple-500/20 text-purple-400";
    default:
      return "bg-rose-500/10 border border-rose-500/20 text-rose-400";
  }
};

const formatPaymentMethod = (method: string) => {
  switch (method.toLowerCase()) {
    case "mobile_money":
    case "momo":
      return "MoMo";
    case "card":
    case "credit_card":
      return "Card";
    case "cash":
      return "Cash";
    default:
      return method.replaceAll("_", " ")[0].toUpperCase() + method.slice(1);
  }
};

export function OrderSidebarCard({ order }: { order: Order }) {
  const statusConfig = getStatusConfig(order.status);

  return (
    <Card className="bg-card/40 border-border p-6 space-y-6 hover:border-brand-secondary-500/20 duration-300 relative group overflow-hidden">
      <div className="absolute inset-0 bg-radial-gradient from-brand-secondary-500/2 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      <div className="relative z-10">
        <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">
          Order Status
        </h3>
        <div
          className={cn(
            "flex items-center justify-between p-3.5 rounded border",
            getStatusStyles(order.status),
          )}
        >
          <div className="flex items-center gap-3">
            <statusConfig.icon className="w-4.5 h-4.5" />
            <span className="font-bold capitalize text-sm">
              {order.status}
            </span>
          </div>
        </div>
        {order.paymentMessage && (
          <div className="mt-3 text-xs bg-card p-3 rounded border border-border text-muted-foreground leading-relaxed">
            <span className="font-semibold text-muted-foreground block mb-1">Payment Status:</span> 
            {order.paymentMessage}
          </div>
        )}
      </div>

      <div className="relative z-10">
        <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">
          Payment Information
        </h3>
        <div className="space-y-3 bg-card border border-border rounded p-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Method</span>
            <span className="text-foreground font-semibold flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5 text-muted-foreground" />
              {formatPaymentMethod(order.paymentMethod)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Date</span>
            <span className="text-foreground font-mono">
              {new Date(order.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-border relative z-10">
        <div className="bg-brand-secondary-500/5 p-4 rounded border border-brand-secondary-500/10">
          <div className="flex items-center gap-2 text-brand-secondary-400 mb-1.5">
            <Package className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Inventory Note
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Stock levels were adjusted automatically when this order was
            confirmed.
          </p>
        </div>
      </div>
    </Card>
  );
}
