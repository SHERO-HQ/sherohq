import type { Metadata } from "next";
import Checkout from "@/views/Checkout";

export const metadata: Metadata = {
 title: "Checkout",
};

export default function CheckoutPage() {
 return <Checkout />;
}
