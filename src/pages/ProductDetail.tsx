import { useParams, Navigate } from "react-router-dom";
import Footer from "@/components/layout/Footer";
import ProductDetailView from "@/components/products/ProductDetailView";
import { products } from "@/data/products";
import SEO from "@/components/common/SEO";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const product = products.find((p) => p.id === id);

  if (!product) {
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
