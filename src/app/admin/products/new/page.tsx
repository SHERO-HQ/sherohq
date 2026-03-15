"use client";

import ProtectedRoute from "@/components/admin/ProtectedRoute";
import ProductForm from "@/views/admin/ProductForm";

export default function NewProductPage() {
 return (
 <ProtectedRoute>
 <ProductForm />
 </ProtectedRoute>
 );
}
