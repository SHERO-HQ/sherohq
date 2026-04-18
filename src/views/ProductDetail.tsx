"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import ProductDetailView from "@/components/products/ProductDetailView";
import { Loader2 } from "lucide-react";
import { useProduct } from "@/hooks/queries/useProducts";

const ProductDetail = () => {
 const { id } = useParams<{ id: string }>();
 const router = useRouter();

 const { data: product, isLoading: loading, isError } = useProduct(id || "");

 useEffect(() => {
 if (isError || (!loading && !product)) {
 router.replace("/shop");
 }
 }, [isError, loading, product, router]);

 if (loading) {
 return (
 <div className="min-h-screen flex items-center justify-center dark:bg-slate-950">
 <Loader2 className="w-10 h-10 text-brand-secondary-500 animate-spin" />
 </div>
 );
 }

 if (isError || (!loading && !product)) {
 return null;
 }

 return <>{product && <ProductDetailView product={product} />}</>;
};

export default ProductDetail;
