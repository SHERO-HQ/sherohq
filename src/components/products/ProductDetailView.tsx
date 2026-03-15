"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
// import { useRouter } from "next/navigation";
import {
  Heart,
  ShoppingCart,
  ChevronRight,
  ChevronLeft,
  Check,
  Star,
  ArrowLeft,
  Plus,
  Minus,
  BadgeCheck,
  Maximize2,
  X,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/hooks/useWishlist";
import { getImageUrl } from "@/services/api";
import type { Product } from "@/types/product";
import { useProducts } from "@/hooks/queries/useProducts";
import { COMPANY_CONTACTS } from "@/constants/contacts";
import ProductCard from "./ProductCard";
import ProductReviews from "./ProductReviews";
import { WhatsAppIcon } from "@/assets/icons/icons";
import ShareButton from "@/components/common/ShareButton";
import AppImage from "@/components/common/AppImage";
import { formatCurrency } from "@/utils/format";
import { getAbsoluteUrl } from "@/utils/subdomain";
import { ProductCardSkeleton } from "@/components/ui/Skeleton";

interface ProductDetailViewProps {
  product: Product;
}

const ProductDetailView: React.FC<ProductDetailViewProps> = ({ product }) => {
  const { addItem } = useCart();
  const { toggleWishlist: globalToggleWishlist, isInWishlist } = useWishlist();
  // const router = useRouter();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const isWishlisted = isInWishlist(product.id);

  const images = product.images || [product.image];
  const discount = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100,
      )
    : 0;

  const { data: allCategoryProducts = [], isLoading: relatedLoading } =
    useProducts(product.categoryId || product.category);

  const relatedProducts = allCategoryProducts
    .filter((p: Product) => p.id !== product.id)
    .slice(0, 4);

  const shareSlug = product.slug || product.sku || product.id;
  const shareUrl = getAbsoluteUrl(`/shop/${shareSlug}`);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
      });
    }
    setIsAddedToCart(true);
    setTimeout(() => setIsAddedToCart(false), 2000);
  };

  const nextImage = () =>
    setSelectedImage((prev) => (prev + 1) % images.length);
  const prevImage = () =>
    setSelectedImage((prev) => (prev - 1 + images.length) % images.length);

  useEffect(() => {
    if (isPreviewOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isPreviewOpen]);

  return (
    <div className="min-h-screen dark:bg-slate-950 bg-slate-50 pt-24 pb-24">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation & Actions Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => (window.location.href = getAbsoluteUrl("/shop"))}
            className="group flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-500 hover:text-emerald-500 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Shop
          </button>
          <div className="flex items-center gap-2">
            <ShareButton
              url={shareUrl}
              title={product.name}
              description={`Check out ${product.name}`}
              image={getImageUrl(product.image)}
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 lg:items-start">
          {/* STICKY Gallery Section (7 columns) */}
          <div className="lg:col-span-7 space-y-6 lg:sticky lg:top-28">
            <div className="group relative aspect-4/5 max-h-100 sm:max-h-125 lg:max-h-150 bg-white dark:bg-white/5 sm:rounded-xl overflow-hidden sm:border border-y sm:border-x border-slate-200 dark:border-white/10 sm:shadow-md flex items-center justify-center -mx-4 sm:mx-0 w-[calc(100%+2rem)] sm:w-full">
              <button
                onClick={() => setIsPreviewOpen(true)}
                className="absolute top-6 right-6 lg:opacity-0 group-hover:opacity-100 transition-opacity p-2.5 bg-white/90 dark:bg-slate-900/90 rounded border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-emerald-600 hover:border-emerald-500 z-20 shadow-sm"
                aria-label="View Fullscreen"
              >
                <Maximize2 size={20} />
              </button>
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedImage}
                  initial={false}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.4 }}
                  className="relative w-full h-full py-8 px-12 sm:px-20 flex items-center justify-center cursor-zoom-in"
                  onClick={() => setIsPreviewOpen(true)}
                >
                  {images[selectedImage] &&
                  (images[selectedImage].startsWith("/uploads") ||
                    images[selectedImage].startsWith("http")) ? (
                    <AppImage
                      src={getImageUrl(images[selectedImage])}
                      alt={product.name}
                      fill
                      priority
                      className="w-full h-full object-contain max-w-full max-h-full mx-auto"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-9xl select-none opacity-20">
                      {images[selectedImage]}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {images.length > 1 && (
                <div className="absolute inset-0 flex items-center justify-between px-4 pointer-events-none">
                  <button
                    onClick={prevImage}
                    className="pointer-events-auto p-3 bg-white/90 dark:bg-slate-900 rounded border border-slate-200 dark:border-white/10 hover:bg-emerald-500 hover:text-white transition-colors"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={nextImage}
                    className="pointer-events-auto p-3 bg-white/90 dark:bg-slate-900 rounded border border-slate-200 dark:border-white/10 hover:bg-emerald-500 hover:text-white transition-colors"
                  >
                    <ChevronRight size={24} />
                  </button>
                </div>
              )}

              {/* Badges Overlay */}
              <div className="absolute top-6 left-6 flex flex-col gap-2">
                {product.badge && (
                  <span className="px-2 py-1 rounded text-[9px] font-black uppercase tracking-tighter bg-emerald-600 text-white">
                    {product.badge}
                  </span>
                )}
                {discount > 0 && (
                  <span className="px-2 py-1 rounded text-[9px] font-black uppercase tracking-tighter bg-red-600 text-white">
                    -{discount}%
                  </span>
                )}
                {!product.inStock && (
                  <span className="px-2 py-1 rounded text-[9px] font-black uppercase tracking-tighter bg-slate-900/90 text-white">
                    Sold Out
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail Selection */}
            {images.length > 1 && (
              <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-2 pl-2">
                {images.map((img: string, idx: number) => (
                  <button
                    key={`detail-thumb-${idx}`}
                    onClick={() => setSelectedImage(idx)}
                    className={`shrink-0 w-14 h-14 rounded overflow-hidden border-2 transition duration-200 ${
                      idx === selectedImage
                        ? "border-emerald-500 scale-105"
                        : "border-transparent bg-white dark:bg-white/5 opacity-50 hover:opacity-100"
                    }`}
                  >
                    <div className="relative w-full h-full p-2 flex items-center justify-center">
                      {img &&
                      (img.startsWith("/uploads") || img.startsWith("http")) ? (
                        <AppImage
                          src={getImageUrl(img)}
                          alt="Thumbnail"
                          fill
                          className="w-full h-full object-contain mx-auto"
                        />
                      ) : (
                        <div className="text-3xl flex items-center justify-center h-full">
                          {img}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Content (5 columns) */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            <div className="p-8 rounded bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  {product.category}
                </span>
                <div className="flex items-center gap-1.5">
                  <Star size={14} className="fill-amber-400 text-amber-400" />
                  <span className="text-sm font-black dark:text-slate-300">
                    {product.rating}{" "}
                    <span className="text-slate-500 font-medium ml-1 text-xs">
                      ({product.reviews} Reviews)
                    </span>
                  </span>
                </div>
              </div>

              <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white leading-tight mb-4">
                {product.name}
              </h1>

              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-8">
                {product.description}
              </p>

              {/* Quantity Selector */}
              <div className="flex justify-between items-center gap-6 mb-8 px-4 py-3 rounded bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5">
                <span className="text-xs font-black uppercase tracking-widest text-slate-500">
                  Quantity
                </span>
                <div className="flex items-center gap-1 bg-white dark:bg-black/20 rounded border border-slate-200 dark:border-white/10 p-1">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-8 text-center font-black text-sm">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 px-1">
                <div className="flex flex-col">
                  {product.originalPrice && (
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 line-through">
                      Was {formatCurrency(product.originalPrice)}
                    </span>
                  )}
                  <span className="text-[2rem] font-black text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(product.price)}
                  </span>
                </div>
                <div
                  className={`px-4 py-1 rounded text-[10px] font-black uppercase tracking-tighter border-2 ${
                    product.inStock
                      ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-600"
                      : "bg-red-500/5 border-red-500/20 text-red-600"
                  }`}
                >
                  {product.inStock ? "In Stock" : "Out of Stock"}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={!product.inStock || isAddedToCart}
                    className={`flex-1 flex items-center justify-center gap-2 h-14 px-4 rounded font-black text-[11px] uppercase tracking-widest transition-colors border-2 ${
                      isAddedToCart
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : "bg-white dark:bg-white/5 border-emerald-600 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white"
                    }`}
                  >
                    {isAddedToCart ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <ShoppingCart className="w-5 h-5" />
                    )}
                    {isAddedToCart ? "Added" : "Add to Cart"}
                  </button>

                  <button
                    onClick={() => {
                      handleAddToCart();
                      window.location.href = getAbsoluteUrl("/checkout");
                    }}
                    disabled={!product.inStock}
                    className="flex-1 px-2 h-14 bg-emerald-600 text-white rounded font-black text-[11px] uppercase tracking-widest hover:bg-emerald-500 transition-colors disabled:opacity-50"
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
                    className={`w-14 h-14 rounded flex items-center justify-center border-2 transition-colors shrink-0 ${
                      isWishlisted
                        ? "bg-red-500 border-red-500 text-white"
                        : "border-slate-200 dark:border-white/10 text-slate-500 hover:border-red-500 hover:text-red-500"
                    }`}
                  >
                    <Heart
                      size={20}
                      className={isWishlisted ? "fill-current" : ""}
                    />
                  </button>
                </div>
                <a
                  href={`https://wa.me/${COMPANY_CONTACTS.WHATSAPP}?text=${encodeURIComponent(
                    `Hello Shero, I'm interested in the ${product.name} (GH₵${product.price}). Here is the link:\n${shareUrl}\n\nCould you please provide more details or assist me with the purchase? Thank you!`,
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 h-14 bg-[#25D366] text-white rounded font-black text-sm uppercase tracking-widest hover:bg-[#20bd5a] transition-colors"
                >
                  <WhatsAppIcon className="w-5 h-5" />
                  Chat on WhatsApp
                </a>
              </div>
            </div>

            {/* Features Minimalist Section */}
            {product.features && product.features.length > 0 && (
              <div className="p-8 rounded border border-slate-200 dark:border-white/10">
                <h3 className="text-lg font-black mb-6 flex items-center gap-2">
                  <BadgeCheck className="text-emerald-500" /> Key Features
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {product.features.map((feature: string, i: number) => (
                    <div
                      key={`feature-${i}`}
                      className="flex items-center gap-4"
                    >
                      <div className="mt-1 w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                        <Check size={10} className="text-emerald-600" />
                      </div>
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Specifications Section - Premium Table */}
        {product.specifications &&
          Object.keys(product.specifications).length > 0 && (
            <div className="mt-24">
              <div className="flex flex-col items-center mb-12">
                <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                  Technical{" "}
                  <span className="text-emerald-500">Specifications</span>
                </h2>
                <div className="h-1.5 w-12 bg-emerald-500 rounded-full mt-4" />
              </div>

              <div className="max-w-4xl mx-auto overflow-hidden rounded border border-slate-200 dark:border-white/10 shadow-sm bg-white dark:bg-white/5">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5">
                      <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                        Parameter
                      </th>
                      <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                        Specification
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {Object.entries(product.specifications).map(
                      ([key, value]) => (
                        <tr
                          key={`spec-${key}`}
                          className="group hover:bg-emerald-500/5 transition-colors"
                        >
                          <td className="px-8 py-6 text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white w-1/3 border-r border-slate-100 dark:border-white/5">
                            <span className="group-hover:text-emerald-500 transition-colors">
                              {key}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-sm font-bold text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                            {value as string}
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        {/* Related Products */}
        {(relatedLoading || relatedProducts.length > 0) && (
          <div className="mt-24 border-t border-slate-200 dark:border-white/10 pt-20">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                You Might <span className="text-emerald-500">Also Like</span>
              </h2>
              <button
                onClick={() => (window.location.href = getAbsoluteUrl("/shop"))}
                className="text-sm font-black uppercase tracking-widest text-emerald-600 hover:underline"
              >
                View Shop
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
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
        <div className="mt-24 border-t border-slate-200 dark:border-white/10 pt-20">
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
            <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
              {formatCurrency(product.price)}
            </span>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={!product.inStock || isAddedToCart}
            className="flex-1 h-12 bg-emerald-600 text-white rounded font-black text-xs uppercase tracking-widest active:scale-95 transition-transform"
          >
            {isAddedToCart ? "Added!" : "Quick Buy"}
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
            className={`w-12 h-12 rounded border flex items-center justify-center ${
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
      <AnimatePresence>
        {isPreviewOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-100 bg-black/95 backdrop-blur-md flex items-center justify-center"
            onClick={() => setIsPreviewOpen(false)}
          >
            <button
              className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded transition-colors z-110"
              onClick={() => setIsPreviewOpen(false)}
            >
              <X size={24} />
            </button>

            <div className="relative w-full h-full max-w-6xl mx-auto p-4 sm:p-12 flex items-center justify-center">
              {images[selectedImage] &&
              (images[selectedImage].startsWith("/uploads") ||
                images[selectedImage].startsWith("http")) ? (
                <AppImage
                  src={getImageUrl(images[selectedImage])}
                  alt={product.name}
                  fill
                  className="w-full h-full object-contain mx-auto"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-9xl select-none opacity-20 text-white">
                  {images[selectedImage]}
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-between px-2 sm:px-8 pointer-events-none">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                  className="pointer-events-auto p-2 bg-white/10 text-white rounded hover:bg-emerald-500 hover:text-white transition-colors backdrop-blur-sm border border-white/10"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                  className="pointer-events-auto p-2 bg-white/10 text-white rounded hover:bg-emerald-500 hover:text-white transition-colors backdrop-blur-sm border border-white/10"
                >
                  <ChevronRight size={24} />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductDetailView;
