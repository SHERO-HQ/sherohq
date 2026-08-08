import React from "react";
import AdminCheckoutCRM from "@/views/admin/AdminCheckoutCRM";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout CRM - Admin | SheroTech",
  description: "Track and manage abandoned carts and successful checkouts.",
};

export default function CheckoutCRMPage() {
  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <AdminCheckoutCRM />
    </main>
  );
}
