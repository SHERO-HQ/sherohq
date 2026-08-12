import { Metadata } from "next";
import ProtectedRoute from "@/components/admin/ProtectedRoute";
import AdminCheckoutCRM from "@/views/admin/AdminCheckoutCRM";

export const metadata: Metadata = {
  title: "Checkout CRM",
};

export default function CheckoutCRMPage() {
  return (
    <ProtectedRoute>
      <AdminCheckoutCRM />
    </ProtectedRoute>
  );
}
