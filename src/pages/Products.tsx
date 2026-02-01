import Footer from "@/components/layout/Footer";
import ShopPage from "@/components/products/ShopPage";
import Seo from "@/components/common/Seo";

const Products = () => {
  return (
    <>
      <Seo
        title="Products"
        description="Explore our range of premium tech products including laptops, drones, specialized equipment, and custom software solutions."
        url="/products"
      />
      <ShopPage />
      <Footer />
    </>
  );
};

export default Products;
