"use client";
import Footer from "@/components/layout/Footer";
import ShopPage from "@/components/products/ShopPage";
import Seo from "@/components/common/Seo";

const Products = () => {
  return (
    <>
      <Seo
        title="Shop"
        description="Explore our range of premium tech products including laptops, drones, specialized equipment, and custom software solutions."
        url="/shop"
      />
      <ShopPage />
      <Footer />
    </>
  );
};

export default Products;
