"use client";

import ProtectedRoute from "@/components/admin/ProtectedRoute";
import AdminCategories from "@/views/admin/AdminCategories";

export default function CategoriesPage() {
  return (
    <ProtectedRoute>
      <AdminCategories />
    </ProtectedRoute>
  );
}
