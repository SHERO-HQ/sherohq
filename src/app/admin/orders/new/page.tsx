"use client";

import ProtectedRoute from "@/components/admin/ProtectedRoute";
import AdminCreateInvoice from "@/views/admin/AdminCreateInvoice";

export default function NewOrderPage() {
 return (
 <ProtectedRoute>
 <AdminCreateInvoice />
 </ProtectedRoute>
 );
}
