"use client";

import ProtectedRoute from "@/components/admin/ProtectedRoute";
import AdminReviews from "@/views/admin/AdminReviews";

export default function ReviewsPage() {
 return (
 <ProtectedRoute>
 <AdminReviews />
 </ProtectedRoute>
 );
}
