import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
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
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { getImageUrl } from "@/services/api";
import { products, type Product } from "@/data/products";
import ProductCard from "./ProductCard";
import ProductReviews from "./ProductReviews";

interface ProductDetailViewProps {
  product: Product;
}

const ProductDetailView: React.FC<ProductDetailViewProps> = ({ product }) => {
  const { addItem } = useCart();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const images = product.images || [product.image];
  const discount = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100,
      )
    : 0;

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
          onClick={() => navigate("/products")}
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
                    key={idx}
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
            <h1 className="text-3xl md:text-4xl font-bold font-sora text-slate-900 dark:text-white">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(product.rating)
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
              <span className="text-4xl font-bold font-sora text-slate-900 dark:text-white">
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
                  {product.features.map((feature: string, idx: number) => (
                    <li
                      key={idx}
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
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
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
                  <span className="px-6 font-bold text-slate-900 dark:text-white">
                    {quantity}
                  </span>
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
            <div className="flex gap-4 pt-4">
              <button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className="cursor-pointer flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white rounded font-bold transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>
              <button
                onClick={() => setIsWishlisted(!isWishlisted)}
                className={`p-4 rounded border-2 transition-all ${
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

            {/* Trust Badges */}
            <div className="cursor-pointer grid grid-cols-3 gap-4 pt-6 border-t border-slate-200 dark:border-slate-800">
              <div className="flex flex-col items-center gap-2 text-center">
                <Shield className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  Secure Payment
                </span>
              </div>
              <div className="flex flex-col items-center gap-2 text-center">
                <Truck className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  Fast Delivery
                </span>
              </div>
              <div className="flex flex-col items-center gap-2 text-center">
                <Package className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  Easy Returns
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
                <table className="w-full">
                  <tbody>
                    {Object.entries(product.specifications).map(
                      ([key, value], idx: number) => (
                        <tr
                          key={idx}
                          className="border-b border-slate-200 dark:border-slate-800 last:border-0"
                        >
                          <td className="px-6 py-4 font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950 w-1/3">
                            {key}
                          </td>
                          <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                            {value}
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
        <div className="mt-20 border-t border-slate-200 dark:border-slate-800 pt-16">
          <h2 className="text-3xl font-bold font-sora text-slate-900 dark:text-white mb-8">
            You Might Also Like
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products
              .filter(
                (p) => p.category === product.category && p.id !== product.id,
              )
              .slice(0, 4)
              .map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
          </div>
        </div>

        {/* Product Reviews */}
        <ProductReviews productId={product.id} />
      </div>
    </div>
  );
};

export default ProductDetailView;
