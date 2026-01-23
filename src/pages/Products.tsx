import Footer from "@/components/layout/Footer";
import ShopPage from "@/components/products/ShopPage";
import { useTitle } from "@/hooks/useTitle";

const Products = () => {
  useTitle("Products");
  return (
    <>
      <ShopPage />
      <Footer />
    </>
  );
};

export default Products;
