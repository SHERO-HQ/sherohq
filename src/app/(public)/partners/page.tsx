import type { Metadata } from "next";
import Partners from "@/views/Partners";

export const metadata: Metadata = {
 title: "Partners",
 description:
 "Meet our trusted technology and business partners who help us deliver world-class solutions.",
};

export default function PartnersPage() {
 return <Partners />;
}
