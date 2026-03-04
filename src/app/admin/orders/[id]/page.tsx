"use client";

import ProtectedRoute from "@/components/admin/ProtectedRoute";
import OrderDetails from "@/views/admin/OrderDetails";

export default function OrderDetailPage() {
  return (
    <ProtectedRoute>
      <OrderDetails />
    </ProtectedRoute>
  );
}
