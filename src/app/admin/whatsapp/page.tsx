import { Metadata } from "next";
import ProtectedRoute from "@/components/admin/ProtectedRoute";
import WhatsAppDashboard from "@/views/admin/WhatsAppDashboard";

export const metadata: Metadata = {
  title: "WhatsApp CRM",
};

export default function WhatsAppPage() {
  return (
    <ProtectedRoute>
      <WhatsAppDashboard />
    </ProtectedRoute>
  );
}
