import { useParams, Navigate } from "react-router-dom";
import Footer from "@/components/layout/Footer";
import ProductDetailView from "@/components/products/ProductDetailView";
import Seo from "@/components/common/Seo";
import { Loader2 } from "lucide-react";
import { useProduct } from "@/hooks/queries/useProducts";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();

  const { data: product, isLoading: loading, isError } = useProduct(id || "");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-slate-950">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (isError || (!loading && !product)) {
    return <Navigate to="/shop" replace />;
  }

  return (
    <>
      {product && (
        <Seo
          title={product.name}
          description={product.description}
          image={product.image}
          url={`/shop/${product.sku || product.id}`}
          type="product"
        />
      )}
      {product && <ProductDetailView product={product} />}
      <Footer />
    </>
  );
};

export default ProductDetail;
