import { Metadata } from "next";
import ProtectedRoute from "@/components/admin/ProtectedRoute";
import AdminCategories from "@/views/admin/AdminCategories";

export const metadata: Metadata = {
  title: "Product Categories",
};

export default function CategoriesPage() {
  return (
    <ProtectedRoute>
      <AdminCategories />
    </ProtectedRoute>
  );
}
