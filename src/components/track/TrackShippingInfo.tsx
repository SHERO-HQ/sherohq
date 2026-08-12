"use client";

import Link from "next/link";
import { MapPin, Phone, Mail } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Order } from "@/services/orders";

interface TrackShippingInfoProps {
  shippingInfo: Order["shippingInfo"] | null;
  isStorePickupOrder: boolean;
}

export function TrackShippingInfo({
  shippingInfo,
  isStorePickupOrder,
}: TrackShippingInfoProps) {
  return (
    <div className="space-y-6">
      <Card className="p-6 dark:bg-slate-900 border-none shadow-sm space-y-6 border">
        <div>
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <MapPin className="w-3 h-3" />{" "}
            {isStorePickupOrder ? "Pickup Contact" : "Delivery Address"}
          </h4>
          <div className="space-y-1">
            {shippingInfo ? (
              <>
                <p className="text-sm font-bold dark:text-white">
                  {shippingInfo.firstName} {shippingInfo.lastName}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {isStorePickupOrder ? (
                    <>
                      In-store Pickup
                      <br />
                      {shippingInfo.city}, {shippingInfo.region}
                    </>
                  ) : (
                    <>
                      {shippingInfo.address}
                      <br />
                      {shippingInfo.city}, {shippingInfo.region}
                    </>
                  )}
                </p>
              </>
            ) : (
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Address details are hidden for this tracking link.
              </p>
            )}
          </div>
        </div>

        <div>
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Phone className="w-3 h-3" /> Contact Details
          </h4>
          <div className="space-y-2">
            {shippingInfo ? (
              <>
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <Mail className="w-3.5 h-3.5 text-brand-secondary-500" />
                  {shippingInfo.email}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <Phone className="w-3.5 h-3.5 text-brand-secondary-500" />
                  {shippingInfo.phone}
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Contact details are hidden for this tracking link.
              </p>
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-white/5">
          <Button
            variant="outline"
            className="w-full border-slate-200 dark:border-white/10"
            asChild
          >
            <Link href="/support">Need Help?</Link>
          </Button>
        </div>
      </Card>

      <div className="text-center">
        <p className="text-[10px] text-slate-400 uppercase tracking-widest leading-loose">
          Thank you for choosing
          <br />
          <span className="text-brand-secondary-500 font-bold">
            SHERO TECHNOLOGIES
          </span>
        </p>
      </div>
    </div>
  );
}
