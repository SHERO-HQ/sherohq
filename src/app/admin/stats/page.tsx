import { Metadata } from "next";
import ProtectedRoute from "@/components/admin/ProtectedRoute";
import AdminStats from "@/views/admin/AdminStats";

export const metadata: Metadata = {
  title: "Site Stats",
};

export default function StatsPage() {
  return (
    <ProtectedRoute>
      <AdminStats />
    </ProtectedRoute>
  );
}
