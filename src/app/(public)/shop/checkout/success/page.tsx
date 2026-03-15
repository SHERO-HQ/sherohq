import type { Metadata } from "next";
import CheckoutSuccessClient from "./client";

export const metadata: Metadata = {
 title: "Order Confirmed",
 description: "Your SHERO order has been successfully placed.",
 robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function CheckoutSuccessPage() {
 return <CheckoutSuccessClient />;
}
