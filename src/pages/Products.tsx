import Footer from "@/components/Footer";
import ShopPage from "@/components/ShopPage";
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
