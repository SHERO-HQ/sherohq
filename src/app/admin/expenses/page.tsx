"use client";

import ProtectedRoute from "@/components/admin/ProtectedRoute";
import AdminExpenses from "@/views/admin/AdminExpenses";

export default function ExpensesPage() {
 return (
 <ProtectedRoute>
 <AdminExpenses />
 </ProtectedRoute>
 );
}
