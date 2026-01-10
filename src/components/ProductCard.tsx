import { motion } from "framer-motion";
import { ShoppingCart, Heart, Eye, Star } from "lucide-react";
import { useState } from "react";

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviews: number;
  badge?: string;
  inStock: boolean;
}

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onQuickView?: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onQuickView,
}) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const discount = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      )
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    onAddToCart?.(product);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    onQuickView?.(product);
  };

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsWishlisted(!isWishlisted);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      className="group relative bg-white dark:bg-slate-900 rounded overflow-hidden
               border border-slate-200 dark:border-slate-800
               hover:border-emerald-500 dark:hover:border-emerald-500
               hover:shadow-2xl hover:shadow-emerald-500/10
               transition-all duration-300"
    >
      {/* Badges */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
        {product.badge && (
          <span
            className="px-3 py-1 rounded text-xs font-semibold
                         bg-emerald-600 text-white"
          >
            {product.badge}
          </span>
        )}
        {discount > 0 && (
          <span
            className="px-3 py-1 rounded text-xs font-semibold
                         bg-red-600 text-white"
          >
            -{discount}%
          </span>
        )}
        {!product.inStock && (
          <span
            className="px-3 py-1 rounded text-xs font-semibold
                         bg-slate-600 text-white"
          >
            Out of Stock
          </span>
        )}
      </div>

      {/* Wishlist Button */}
      <button
        onClick={toggleWishlist}
        className="absolute top-4 right-4 z-20 w-10 h-10 rounded
                 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm
                 flex items-center justify-center
                 hover:bg-white dark:hover:bg-slate-800
                 transition-all duration-300
                 group/heart"
      >
        <Heart
          className={`w-5 h-5 transition-all duration-300 ${
            isWishlisted
              ? "fill-red-500 text-red-500 scale-110"
              : "text-slate-600 dark:text-slate-400 group-hover/heart:text-red-500"
          }`}
        />
      </button>

      {/* Image Container */}
      <div
        className="relative h-64 bg-linear-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700
                    overflow-hidden"
      >
        {/* Placeholder/Loading */}
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-slate-400 border-t-emerald-500 rounded-full animate-spin" />
          </div>
        )}

        {/* Product Image */}
        <img
          src={product.image}
          alt={product.name}
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-cover transition-all duration-300
                   group-hover:scale-110 ${
                     imageLoaded ? "opacity-100" : "opacity-0"
                   }`}
        />

        {/* Quick View Overlay */}
        <div
          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100
                      flex items-center justify-center gap-3
                      transition-opacity duration-300"
        >
          <button
            onClick={handleQuickView}
            className="flex items-center gap-2 px-6 py-3 rounded
                     bg-white text-slate-900 font-semibold
                     hover:bg-emerald-600 hover:text-white
                     transition-all duration-300
                     transform translate-y-4 group-hover:translate-y-0"
          >
            <Eye className="w-4 h-4" />
            <span>Quick View</span>
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-6">
        {/* Category */}
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {product.category}
        </span>

        {/* Product Name */}
        <h3
          className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-2 mb-3
                     group-hover:text-emerald-600 dark:group-hover:text-emerald-400
                     transition-colors duration-300 line-clamp-2"
        >
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(product.rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-slate-300 dark:text-slate-600"
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-slate-600 dark:text-slate-400">
            ({product.reviews})
          </span>
        </div>

        {/* Price & CTA */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-sora font-bold text-slate-900 dark:text-slate-100">
              GH₵{product.price.toFixed(2)}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-slate-500 dark:text-slate-400 line-through">
                GH₵{product.originalPrice}
              </span>
            )}
          </div>

          {product.inStock ? (
            <button
              onClick={handleAddToCart}
              className="inline-flex justify-center items-center gap-2 px-4 py-2 rounded
                       bg-emerald-600 hover:bg-emerald-700
                       text-white font-semibold text-sm
                       transition-all duration-300
                       group-hover:gap-3"
            >
              <span className="">Add</span>
              <ShoppingCart className="w-4 h-4" />
            </button>
          ) : (
            <button
              disabled
              className="inline-flex items-center gap-2 px-4 py-2 rounded
                       bg-slate-300 dark:bg-slate-700
                       text-slate-500 dark:text-slate-400 font-semibold text-sm
                       cursor-not-allowed"
            >
              <span>Sold Out</span>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
