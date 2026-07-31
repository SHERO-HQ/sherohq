import { Mail, Phone, MapPin, Truck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { type Order } from "@/services/api";

export function OrderCustomerCard({ order }: { order: Order }) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card className="bg-card/40 border-border p-6 hover:border-blue-500/20 duration-300 relative group overflow-hidden">
        <div className="absolute inset-0 bg-radial-gradient from-blue-500/2 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        <h3 className="text-foreground font-bold mb-4 flex items-center gap-2 relative z-10">
          <Mail className="w-4 h-4 text-blue-400" />
          Customer Contact
        </h3>
        <div className="space-y-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-muted border border-border flex items-center justify-center text-muted-foreground font-bold font-mono uppercase">
              {order.shippingInfo.firstName[0]}
              {order.shippingInfo.lastName[0]}
            </div>
            <div>
              <p className="text-foreground font-semibold">
                {order.shippingInfo.firstName} {order.shippingInfo.lastName}
              </p>
              <p className="text-xs text-muted-foreground">
                {order.shippingInfo.email}
              </p>
            </div>
          </div>
          <div className="pt-2 space-y-2 border-t border-border">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="w-3.5 h-3.5 text-muted-foreground" />
              <span>{order.shippingInfo.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="w-3.5 h-3.5 text-muted-foreground" />
              <span>{order.shippingInfo.phone || "No phone provided"}</span>
            </div>
          </div>
        </div>
      </Card>

      <Card className="bg-card/40 border-border p-6 hover:border-amber-500/20 duration-300 relative group overflow-hidden">
        <div className="absolute inset-0 bg-radial-gradient from-amber-500/2 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        <h3 className="text-foreground font-bold mb-4 flex items-center gap-2 relative z-10">
          <MapPin className="w-4 h-4 text-amber-400" />
          Shipping Address
        </h3>
        <div className="text-sm text-muted-foreground space-y-2 relative z-10">
          <p className="text-foreground font-medium">
            {order.shippingInfo.address}
          </p>
          <p className="text-xs">
            {order.shippingInfo.city}, {order.shippingInfo.region}
          </p>
          <div className="pt-2.5 flex items-center gap-2 border-t border-border mt-2">
            <Truck className="w-4 h-4 text-brand-secondary-400" />
            <span className="text-[10px] uppercase font-bold tracking-wider text-brand-secondary-400">
              Standard Delivery
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
