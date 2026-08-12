import { Metadata } from "next";
import ProtectedRoute from "@/components/admin/ProtectedRoute";
import AdminProducts from "@/views/admin/AdminProducts";

export const metadata: Metadata = {
  title: "Products",
};

export default function ProductsPage() {
  return (
    <ProtectedRoute>
      <AdminProducts />
    </ProtectedRoute>
  );
}
