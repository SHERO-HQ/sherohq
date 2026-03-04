"use client";

import ProtectedRoute from "@/components/admin/ProtectedRoute";
import AdminProducts from "@/views/admin/AdminProducts";

export default function ProductsPage() {
  return (
    <ProtectedRoute>
      <AdminProducts />
    </ProtectedRoute>
  );
}
