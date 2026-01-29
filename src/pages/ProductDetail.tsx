import { useParams, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Footer from "@/components/layout/Footer";
import ProductDetailView from "@/components/products/ProductDetailView";
import { fetchProduct } from "@/services/api";
import type { Product } from "@/data/products";
import SEO from "@/components/common/SEO";
import { Loader2 } from "lucide-react";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await fetchProduct(id);
        setProduct(data);
      } catch (err) {
        console.error("Failed to fetch product:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-slate-950">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (error || !product) {
    return <Navigate to="/products" replace />;
  }

  return (
    <>
      <SEO
        title={product.name}
        description={product.description}
        image={product.image}
        url={`/products/${product.id}`}
        type="product"
      />
      <ProductDetailView product={product} />
      <Footer />
    </>
  );
};

export default ProductDetail;
