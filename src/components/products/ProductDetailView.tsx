import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useUniversalNavigate } from "@/hooks/useUniversalNavigate";
import {
  ShoppingCart,
  Heart,
  Star,
  ChevronLeft,
  ChevronRight,
  Package,
  Shield,
  Truck,
  ArrowLeft,
  Plus,
  Minus,
  BadgeCheck,
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

interface ProductDetailViewProps {
  product: Product;
}

const ProductDetailView: React.FC<ProductDetailViewProps> = ({ product }) => {
  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const navigate = useUniversalNavigate();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const isWishlisted = isInWishlist(product.id);

  const images = product.images || [product.image];
  const discount = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100,
      )
    : 0;

  const { data: allCategoryProducts = [], isLoading: relatedLoading } =
    useProducts(product.category);

  const relatedProducts = allCategoryProducts
    .filter((p: Product) => p.id !== product.id)
    .slice(0, 4);

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
  };

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-20 pb-16">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate("/shop")}
          className="cursor-pointer flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Products
        </button>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square bg-slate-200 dark:bg-slate-900 rounded overflow-hidden border border-slate-200 dark:border-slate-800">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full h-full flex items-center justify-center"
                >
                  {images[selectedImage] &&
                  (images[selectedImage].startsWith("/uploads") ||
                    images[selectedImage].startsWith("http")) ? (
                    <img
                      src={getImageUrl(images[selectedImage])}
                      alt={product.name}
                      width={800}
                      height={800}
                      fetchPriority="high"
                      className="w-full h-full object-contain p-4"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src =
                          "https://placehold.co/600x400?text=No+Image";
                      }}
                    />
                  ) : (
                    <div className="text-8xl select-none">
                      {images[selectedImage]}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="cursor-pointer absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 dark:bg-slate-900/90 rounded-full hover:bg-white dark:hover:bg-slate-800 transition-colors z-10"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="cursor-pointer absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 dark:bg-slate-900/90 rounded-full hover:bg-white dark:hover:bg-slate-800 transition-colors z-10"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 flex gap-2 z-10">
                {product.badge && (
                  <span className="px-3 py-1 rounded text-xs font-bold uppercase bg-blue-600 text-white">
                    {product.badge}
                  </span>
                )}
                {discount > 0 && (
                  <span className="px-3 py-1 rounded text-xs font-bold uppercase bg-red-600 text-white">
                    -{discount}%
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail Gallery */}
            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-4">
                {images.map((img: string, idx: number) => (
                  <button
                    key={`thumb-${idx}-${img.slice(-10)}`}
                    onClick={() => setSelectedImage(idx)}
                    className={`aspect-square bg-slate-200 dark:bg-slate-900 rounded overflow-hidden border-2 transition-all ${
                      idx === selectedImage
                        ? "border-emerald-500 ring-2 ring-emerald-500/20"
                        : "border-slate-200 dark:border-slate-800 hover:border-emerald-500/50"
                    }`}
                  >
                    <div className="cursor-pointer w-full h-full flex items-center justify-center">
                      {img &&
                      (img.startsWith("/uploads") || img.startsWith("http")) ? (
                        <img
                          src={getImageUrl(img)}
                          alt={`Thumbnail ${idx}`}
                          width={200}
                          height={200}
                          loading="lazy"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src =
                              "https://placehold.co/200x200?text=NA";
                          }}
                        />
                      ) : (
                        <div className="text-2xl select-none">{img}</div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Category */}
            <div className="text-sm font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
              {product.category}
            </div>

            {/* Title */}
            <h1 className="text-lg md:text-2xl font-bold font-sora text-slate-900 dark:text-white">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={`star-${product.id}-${star}`}
                    className={`w-5 h-5 ${
                      star <= Math.floor(product.rating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-slate-300 dark:text-slate-600"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {product.rating} ({product.reviews} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-4">
              <span className="text-lg md:text-2xl font-bold font-sora text-slate-900 dark:text-white">
                GH₵{product.price}
              </span>
              {product.originalPrice && (
                <span className="text-xl text-slate-500 line-through">
                  GH₵{product.originalPrice}
                </span>
              )}
            </div>

            {/* Stock Status */}
            <div
              className={`inline-flex items-center gap-2 px-3 py-1 rounded text-sm font-medium ${
                product.inStock
                  ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                  : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
              }`}
            >
              <Package className="w-4 h-4" />
              {product.inStock ? "In Stock" : "Out of Stock"}
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                {product.description}
              </p>
            )}

            {/* Features */}
            {product.features && product.features.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-bold text-slate-900 dark:text-white">
                  Key Features
                </h3>
                <ul className="space-y-2">
                  {product.features.map((feature: string) => (
                    <li
                      key={`feature-${feature.substring(0, 20)}`}
                      className="flex items-start gap-2 text-slate-600 dark:text-slate-400"
                    >
                      <span className="text-emerald-600 dark:text-emerald-400 mt-1">
                        •
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="space-y-2">
              <label
                htmlFor="quantity-input"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Quantity
              </label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded overflow-hidden">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="cursor-pointer p-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    id="quantity-input"
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(
                        Math.max(1, Number.parseInt(e.target.value) || 1),
                      )
                    }
                    className="w-12 text-center font-bold text-slate-900 dark:text-white bg-transparent border-none focus:ring-0 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="cursor-pointer p-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-4">
              <button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className="cursor-pointer flex-1 flex items-center justify-center gap-2 px-8 py-2 border-2 border-emerald-600 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 disabled:border-slate-300 disabled:text-slate-400 dark:disabled:border-slate-700 dark:disabled:text-slate-600 rounded font-bold transition-all w-full"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>
              <div className="flex gap-2 w-full">
                <button
                  onClick={() => {
                    handleAddToCart();
                    navigate("/checkout");
                  }}
                  disabled={!product.inStock}
                  className="cursor-pointer flex-1 flex items-center justify-center gap-2 px-8 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white rounded font-bold transition-all shadow-lg shadow-emerald-500/20 w-full"
                >
                  <Package className="w-5 h-5" />
                  Buy Now
                </button>
                <button
                  onClick={() =>
                    toggleWishlist({
                      id: product.id,
                      name: product.name,
                      price: product.price,
                      image: product.image,
                      category: product.category,
                    })
                  }
                  className={`px-4 py-2 text-center w-fit rounded border-2 transition-all ${
                    isWishlisted
                      ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                      : "border-slate-200 dark:border-slate-700 hover:border-red-500"
                  }`}
                >
                  <Heart
                    className={`w-6 h-6 ${
                      isWishlisted
                        ? "fill-red-500 text-red-500"
                        : "text-slate-600 dark:text-slate-400"
                    }`}
                  />
                </button>
              </div>

              {/* WhatsApp Button */}
              <a
                href={`https://wa.me/${COMPANY_CONTACTS.WHATSAPP}?text=${encodeURIComponent(
                  `Hi, I'm interested in ${product.name} (Price: GH₵${product.price}). Is it still available?`,
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-8 py-2 w-full bg-[#25D366] hover:bg-[#20bd5a] text-white rounded font-bold transition-all shadow-lg shadow-[#25D366]/20"
              >
                <WhatsAppIcon className="w-5 h-5" />
                Chat on WhatsApp
              </a>
            </div>

            {/* Trust Badges */}
            <div className="cursor-pointer grid grid-cols-3 gap-4 pt-6 border-t border-slate-200 dark:border-slate-800">
              <div className="flex flex-col md:flex-row items-center gap-2 text-center">
                <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  Secure Payment
                </span>
              </div>
              <div className="flex flex-col md:flex-row items-center gap-2 text-center">
                <Truck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  Fast Delivery
                </span>
              </div>
              <div className="flex flex-col md:flex-row items-center gap-2 text-center">
                <BadgeCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  Quality Guaranteed
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Specifications Section */}
        {product.specifications &&
          Object.keys(product.specifications).length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-bold font-sora text-slate-900 dark:text-white mb-6">
                Technical Specifications
              </h2>
              <div className="bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="divide-y divide-slate-200 dark:divide-slate-800">
                  {Object.entries(product.specifications).map(
                    ([key, value]) => (
                      <div
                        key={`spec-${key}`}
                        className="grid grid-cols-1 sm:grid-cols-3"
                      >
                        <div className="px-6 py-3 font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950 sm:col-span-1">
                          {key}
                        </div>
                        <div className="px-6 py-3 text-slate-600 dark:text-slate-400 sm:col-span-2 wrap-break-word">
                          {value}
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>
          )}

        {/* Related Products */}
        {(relatedLoading || relatedProducts.length > 0) && (
          <div className="mt-20 border-t border-slate-200 dark:border-slate-800 pt-16">
            <h2 className="text-3xl font-bold font-sora text-slate-900 dark:text-white mb-8">
              You Might Also Like
            </h2>
            <div
              className={`grid grid-cols-1 min-[425px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3`}
            >
              {relatedLoading
                ? [1, 2, 3, 4].map((skeleton) => (
                    <div
                      key={`related-skeleton-${skeleton}`}
                      className="h-72 bg-slate-200 dark:bg-slate-900 animate-pulse rounded"
                    />
                  ))
                : relatedProducts.map((relatedProduct: Product) => (
                    <ProductCard
                      key={relatedProduct.id}
                      product={relatedProduct}
                    />
                  ))}
            </div>
          </div>
        )}

        {/* Product Reviews */}
        <ProductReviews productId={product.id} />
      </div>
    </div>
  );
};

export default ProductDetailView;
