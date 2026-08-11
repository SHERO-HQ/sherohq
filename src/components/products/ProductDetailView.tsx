"use client";

import React from "react";
import { Heart, ChevronRight, Star, ArrowLeft } from "lucide-react";
import type { Product } from "@/types/product";
import ProductCard from "./ProductCard";
import ProductReviews from "./ProductReviews";
import { formatCurrency } from "@/utils/format";
import { getAbsoluteUrl } from "@/utils/subdomain";
import { ProductCardSkeleton } from "@/components/ui/Skeleton";
import { ProductGallerySection } from "./detail/ProductGallerySection";
import { ProductBuyBox } from "./detail/ProductBuyBox";
import { ProductSpecificationsTable } from "./detail/ProductSpecificationsTable";
import { ProductImagePreviewModal } from "./detail/ProductImagePreviewModal";
import { useProductDetailState } from "./detail/useProductDetailState";

interface ProductDetailViewProps {
  product: Product;
}

const ProductDetailView: React.FC<ProductDetailViewProps> = ({ product }) => {
  const {
    router,
    selectedImage,
    setSelectedImage,
    quantity,
    setQuantity,
    isAddedToCart,
    isPreviewOpen,
    setIsPreviewOpen,
    isWishlisted,
    mounted,
    images,
    discount,
    relatedLoading,
    relatedProducts,
    shareUrl,
    jsonLd,
    handleAddToCart,
    nextImage,
    prevImage,
    globalToggleWishlist,
    handleShare,
    handleMaximize,
  } = useProductDetailState(product);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen dark:bg-slate-950 bg-slate-50 pt-8 pb-12">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Navigation & Actions Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => (window.location.href = getAbsoluteUrl("/shop"))}
              className="group flex items-center gap-2 text-sm tracking-widest text-slate-500 hover:text-brand-secondary-500 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Shop
            </button>
            {product.rating > 0 && (
              <div className="flex items-center gap-1.5">
                <Star size={14} className="fill-amber-400 text-amber-400" />
                <span className="text-sm font-bold dark:text-slate-300">
                  {product.rating}
                  <span className="text-slate-500 font-medium ml-1 text-xs">
                    ({product.reviews} Reviews)
                  </span>
                </span>
              </div>
            )}
          </div>

          <div className="grid lg:grid-cols-12 gap-8 lg:items-start">
            {/* STICKY Gallery Section */}
            <ProductGallerySection
              product={product}
              images={images}
              selectedImage={selectedImage}
              setSelectedImage={setSelectedImage}
              discount={discount}
              handleShare={handleShare}
              handleMaximize={handleMaximize}
              nextImage={nextImage}
              prevImage={prevImage}
            />

            {/* Details Content & Buy Box */}
            <ProductBuyBox
              product={product}
              quantity={quantity}
              setQuantity={setQuantity}
              handleAddToCart={handleAddToCart}
              isAddedToCart={isAddedToCart}
              globalToggleWishlist={globalToggleWishlist}
              isWishlisted={isWishlisted}
              shareUrl={shareUrl}
            />
          </div>

          {/* Specifications Section */}
          <ProductSpecificationsTable
            specifications={product.specifications}
          />

          {/* Related Products */}
          {(relatedLoading || relatedProducts.length > 0) && (
            <div className="mt-8 border-t border-slate-200 dark:border-white/10 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tighter">
                  You Might{" "}
                  <span className="text-brand-secondary-500">Also Like</span>
                </h2>
                <button
                  onClick={() =>
                    (window.location.href = getAbsoluteUrl("/shop"))
                  }
                  className="text-sm font-medium tracking-widest text-brand-secondary-600 hover:underline"
                >
                  View Shop
                  <ChevronRight className="w-4 h-4 inline-block ml-1" />
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {relatedLoading
                  ? [1, 2, 3, 4].map((i) => (
                      <ProductCardSkeleton key={`related-skeleton-${i}`} />
                    ))
                  : relatedProducts.map((p: Product) => (
                      <ProductCard key={p.id} product={p} />
                    ))}
              </div>
            </div>
          )}

          {/* Product Reviews */}
          <div className="mt-8 border-t border-slate-200 dark:border-white/10 pt-8">
            <ProductReviews productId={product.id} />
          </div>
        </div>

        {/* MOBILE FLOATING CTA BAR */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 p-4 bg-white/95 dark:bg-slate-900/95 border-t border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex flex-col shrink-0">
              <span className="text-[10px] text-slate-500 font-bold uppercase">
                Price
              </span>
              <span className="text-lg font-bold text-brand-secondary-600 dark:text-brand-secondary-400">
                {formatCurrency(product.price)}
              </span>
            </div>
            <button
              onClick={() => {
                handleAddToCart();
                router.push("/shop/checkout");
              }}
              disabled={!product.inStock}
              className="flex-1 h-10 bg-brand-secondary-600 text-white rounded font-bold text-xs uppercase tracking-widest active:scale-95 transition-transform"
            >
              Buy Now
            </button>
            <button
              onClick={() =>
                globalToggleWishlist({
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  image: product.image,
                  category: product.category,
                })
              }
              className={`w-10 h-10 rounded border flex items-center justify-center ${
                isWishlisted
                  ? "bg-red-500 border-red-500 text-white"
                  : "border-slate-200 dark:border-white/10 text-slate-500"
              }`}
            >
              <Heart size={20} className={isWishlisted ? "fill-current" : ""} />
            </button>
          </div>
        </div>

        {/* Fullscreen Image Preview */}
        <ProductImagePreviewModal
          mounted={mounted}
          isPreviewOpen={isPreviewOpen}
          setIsPreviewOpen={setIsPreviewOpen}
          images={images}
          selectedImage={selectedImage}
          productName={product.name}
          prevImage={prevImage}
          nextImage={nextImage}
        />
      </div>
    </>
  );
};

export default ProductDetailView;
