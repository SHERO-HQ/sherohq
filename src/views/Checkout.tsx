"use client";
import Footer from "@/components/layout/Footer";
import CheckoutFlow from "@/components/checkout/CheckoutFlow";
import { useTitle } from "@/hooks/useTitle";

const Checkout = () => {
  useTitle("Checkout");

  return (
    <>
      <CheckoutFlow />
      <Footer />
    </>
  );
};

export default Checkout;
