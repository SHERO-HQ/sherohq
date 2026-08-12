import { Metadata } from "next";
import ProtectedRoute from "@/components/admin/ProtectedRoute";
import AdminUsers from "@/views/admin/AdminUsers";

export const metadata: Metadata = {
  title: "Customers & Users",
};

export default function UsersPage() {
  return (
    <ProtectedRoute allowedRoles={["superadmin", "admin", "manager"]}>
      <AdminUsers />
    </ProtectedRoute>
  );
}
