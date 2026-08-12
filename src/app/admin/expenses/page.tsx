import { Metadata } from "next";
import ProtectedRoute from "@/components/admin/ProtectedRoute";
import AdminExpenses from "@/views/admin/AdminExpenses";

export const metadata: Metadata = {
  title: "Expenses",
};

export default function ExpensesPage() {
  return (
    <ProtectedRoute>
      <AdminExpenses />
    </ProtectedRoute>
  );
}
