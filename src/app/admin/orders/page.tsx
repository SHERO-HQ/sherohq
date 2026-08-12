import { Metadata } from "next";
import ProtectedRoute from "@/components/admin/ProtectedRoute";
import AdminOrders from "@/views/admin/AdminOrders";

export const metadata: Metadata = {
  title: "Orders",
};

export default function OrdersPage() {
  return (
    <ProtectedRoute>
      <AdminOrders />
    </ProtectedRoute>
  );
}
