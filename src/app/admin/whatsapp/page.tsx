"use client";

import dynamic from "next/dynamic";
import ProtectedRoute from "@/components/admin/ProtectedRoute";

const WhatsAppDashboard = dynamic(() => import("@/views/admin/WhatsAppDashboard"), {
  loading: () => (
    <div className="min-h-screen flex items-center justify-center dark:bg-slate-950 bg-slate-50">
      <div className="w-10 h-10 border-4 border-brand-secondary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

export default function WhatsAppDashboardPage() {
  return (
    <ProtectedRoute>
      <WhatsAppDashboard />
    </ProtectedRoute>
  );
}
