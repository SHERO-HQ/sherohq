// import ProductHero from '@/components/ProductsHero'

import Footer from "@/components/Footer";
import ShopPage from "@/components/ShopPage";
import { useTitle } from "@/hooks/useTitle";

const Products = () => {
  useTitle("Products");
  return (
    <>
      {/* <ProductHero/> */}
      {/* <ProductGrid /> */}
      <ShopPage />
      <Footer />
    </>
  );
};

export default Products;
