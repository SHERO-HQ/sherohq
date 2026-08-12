import { Metadata } from "next";
import ProtectedRoute from "@/components/admin/ProtectedRoute";
import AdminSupport from "@/views/admin/AdminSupport";

export const metadata: Metadata = {
  title: "Support Tickets",
};

export default function AdminSupportPage() {
  return (
    <ProtectedRoute>
      <AdminSupport />
    </ProtectedRoute>
  );
}
