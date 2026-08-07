import { ShoppingBag } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import AppImage from "@/components/common/AppImage";
import { type Order, getImageUrl } from "@/services/api";

const getStatusStyles = (status: string) => {
  switch (status?.toLowerCase()) {
    case "delivered":
      return "bg-brand-secondary-500/10 border border-brand-secondary-500/20 text-brand-secondary-400";
    case "pending":
      return "bg-amber-500/10 border border-amber-500/20 text-amber-400";
    case "processing":
      return "bg-brand-primary-500/10 border border-brand-primary-500/20 text-brand-primary-400";
    case "intransit":
      return "bg-purple-500/10 border border-purple-500/20 text-purple-400";
    default:
      return "bg-rose-500/10 border border-rose-500/20 text-rose-400";
  }
};

export function OrderItemsCard({ order }: { order: Order }) {
  return (
    <Card className="bg-card/40 border-border overflow-hidden relative group duration-300 hover:border-brand-secondary-500/20">
      <div className="absolute inset-0 bg-radial-gradient from-brand-secondary-500/2 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      <div className="p-6 border-b border-border flex items-center justify-between relative z-10">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-brand-secondary-400" />
          Order Items
        </h2>
        <span
          className={cn(
            "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase",
            getStatusStyles(order.status),
          )}
        >
          {order.status}
        </span>
      </div>
      <div className="divide-y divide-border relative z-10">
        {order.items.map((item) => (
          <div
            key={item.id || item.name}
            className="p-6 flex items-center gap-6 group/item hover:bg-accent/50 transition-colors duration-200"
          >
            <div className="relative w-20 h-20 rounded bg-muted border border-border overflow-hidden flex items-center justify-center shrink-0">
              {item.image &&
              (item.image.startsWith("/uploads") ||
                item.image.startsWith("http")) ? (
                <AppImage
                  src={getImageUrl(item.image)}
                  alt={item.name}
                  fill
                  sizes="80px"
                  className="object-cover group-hover/item:scale-110 transition-transform duration-500"
                />
              ) : (
                <div className="text-3xl select-none">
                  {item.image || "📦"}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-foreground font-bold truncate group-hover/item:text-brand-secondary-400 transition-colors">
                {item.name}
              </p>
              <p className="text-sm text-muted-foreground mt-1 font-mono">
                {item.sku ? `SKU: ${item.sku}` : "No SKU"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-foreground font-bold font-mono">
                GH₵{item.price.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Qty: {item.quantity}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="p-6 bg-accent/20 border-t border-border relative z-10">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Total Amount</span>
          <span className="text-2xl font-bold text-brand-secondary-400 font-mono">
            GH₵{order.total.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </Card>
  );
}
