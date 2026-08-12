import { Metadata } from "next";
import ProtectedRoute from "@/components/admin/ProtectedRoute";
import AdminUserManagement from "@/views/admin/AdminUserManagement";

export const metadata: Metadata = {
  title: "Staff & Role Management",
};

export default function StaffPage() {
  return (
    <ProtectedRoute allowedRoles={["superadmin", "admin"]}>
      <AdminUserManagement />
    </ProtectedRoute>
  );
}
