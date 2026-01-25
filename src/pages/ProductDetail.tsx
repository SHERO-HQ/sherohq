import { useParams, Navigate } from "react-router-dom";
import Footer from "@/components/layout/Footer";
import ProductDetailView from "@/components/products/ProductDetailView";
import { useTitle } from "@/hooks/useTitle";
import { products } from "@/data/products";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const product = products.find((p) => p.id === id);

  useTitle(product?.name || "Product");

  if (!product) {
    return <Navigate to="/products" replace />;
  }

  return (
    <>
      <ProductDetailView product={product} />
      <Footer />
    </>
  );
};

export default ProductDetail;
