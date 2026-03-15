"use client";

import ProtectedRoute from "@/components/admin/ProtectedRoute";
import AdminGuideEditor from "@/views/admin/AdminGuideEditor";

export default function EditGuidePage() {
 return (
 <ProtectedRoute>
 <AdminGuideEditor />
 </ProtectedRoute>
 );
}
