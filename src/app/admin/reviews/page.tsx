import { Metadata } from "next";
import ProtectedRoute from "@/components/admin/ProtectedRoute";
import AdminReviews from "@/views/admin/AdminReviews";

export const metadata: Metadata = {
  title: "Product Reviews",
};

export default function ReviewsPage() {
  return (
    <ProtectedRoute>
      <AdminReviews />
    </ProtectedRoute>
  );
}
