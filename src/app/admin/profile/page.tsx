import { Metadata } from "next";
import ProtectedRoute from "@/components/admin/ProtectedRoute";
import AdminProfile from "@/views/admin/AdminProfile";

export const metadata: Metadata = {
  title: "Admin Profile",
};

export default function AdminProfilePage() {
  return (
    <ProtectedRoute>
      <AdminProfile />
    </ProtectedRoute>
  );
}
