import Footer from "@/components/layout/Footer";
import ShopPage from "@/components/products/ShopPage";
import SEO from "@/components/common/SEO";

const Products = () => {
  return (
    <>
      <SEO
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
