"use client";

import ProtectedRoute from "@/components/admin/ProtectedRoute";
import AdminOrders from "@/views/admin/AdminOrders";

export default function OrdersPage() {
  return (
    <ProtectedRoute>
      <AdminOrders />
    </ProtectedRoute>
  );
}
