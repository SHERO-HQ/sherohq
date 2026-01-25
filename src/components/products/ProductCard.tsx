import { motion } from "motion/react";
import { ShoppingCart, Heart, Eye, Star } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import type { Product } from "@/data/products"; // Import shared type

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const { addItem } = useCart();
  const navigate = useNavigate();
  const [isWishlisted, setIsWishlisted] = useState(false);

  const discount = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100,
      )
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
    });
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onQuickView?.(product);
  };

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  const handleCardClick = () => {
    navigate(`/products/${product.id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -8 }}
      onClick={handleCardClick}
      className="group relative rounded overflow-hidden
               dark:bg-slate-900/40 bg-slate-200/60 backdrop-blur-md
               border border-white/5 dark:border-white/5 shadow
               hover:border-emerald-500/30
               hover:shadow-2xl hover:shadow-emerald-500/10
               transition-all duration-500 cursor-pointer"
    >
      {/* Hover Glow Effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-linear-to-b from-emerald-500/5 to-transparent transition-opacity duration-500 pointer-events-none" />

      {/* Badges */}
      <div className="absolute top-3 left-3 z-20 flex  gap-2">
        {product.badge && (
          <span className="px-2 py-1 rounded text-[12px] font-bold uppercase tracking-wider bg-emerald-600 text-white shadow-lg shadow-emerald-900/20">
            {product.badge}
          </span>
        )}
        {discount > 0 && (
          <span className="px-2 py-1 rounded text-[12px] font-bold uppercase tracking-wider bg-red-600 text-white shadow-lg shadow-red-900/20 w-fit">
            -{discount}%
          </span>
        )}
        {!product.inStock && (
          <span className="px-2 py-1 rounded text-[12px] font-bold uppercase tracking-wider bg-slate-700 text-slate-300">
            Sold Out
          </span>
        )}
      </div>

      {/* Wishlist Button */}
      <button
        onClick={toggleWishlist}
        aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        className="absolute top-3 right-3 z-20 w-8 h-8 rounded
                 bg-black/20 backdrop-blur-md border border-white/10
                 flex items-center justify-center
                 hover:bg-red-500 hover:border-red-400
                 transition-all duration-300 group/heart cursor-pointer"
      >
        <Heart
          className={`w-4 h-4 transition-all duration-300 ${
            isWishlisted
              ? "fill-red-600 text-red-600 group-hover/heart:text-white hover:scale-110"
              : "text-white/70 group-hover/heart:text-white"
          }`}
        />
      </button>

      {/* Image Container */}
      <div className="relative h-60 bg-linear-to-br from-slate-800 to-slate-900 overflow-hidden">
        {/* Render Image or Emoji */}
        {product.image &&
        (product.image.startsWith("/uploads") ||
          product.image.startsWith("http")) ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-6xl select-none opacity-50 grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-500">
            {product.image}
          </div>
        )}

        {/* Quick View Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <button
            onClick={handleQuickView}
            aria-label={`View details for ${product.name}`}
            className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300
                           flex items-center gap-2 px-5 py-2.5 rounded
                           bg-white/10 backdrop-blur-md border border-white/20
                           text-white font-medium text-sm
                           hover:bg-emerald-600 hover:border-emerald-500 cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            View Details
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-5 relative z-10 cursor-pointer">
        <div className="flex flex-col justify-between items-start">
          <div className="inline-flex items-center justify-between w-full mb-2">
            <p className="text-xs font-medium dark:bg-white/5 bg-emerald-100 px-1.5 py-0.5 rounded dark:text-emerald-400 text-emerald-800 mb-1 uppercase tracking-wide">
              {product.category}
            </p>
            <span className="flex items-center gap-1 dark:bg-white/5 bg-slate-300/60 px-1.5 py-0.5 rounded text-sm dark:text-slate-300 text-slate-900">
              <Star className="text-amber-400 inline-flex fill-amber-400 size-4" />
              {product.rating}
            </span>
          </div>
          <h3 className="text-base font-bold dark:text-white text-slate-900 leading-tight dark:group-hover:text-emerald-300 group-hover:text-emerald-600 transition-colors">
            {product.name}
          </h3>
        </div>

        <div className="flex items-end justify-between mt-3">
          <div className="flex flex-col">
            {product.originalPrice && (
              <span className="text-xs text-slate-500 line-through">
                GH₵{product.originalPrice}
              </span>
            )}
            <span className="text-lg font-sora font-bold dark:text-white text-slate-900">
              GH₵{product.price}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            aria-label={`Add ${product.name} to cart`}
            className={`px-8 py-2 rounded flex items-center justify-center transition-all duration-300 cursor-pointer
                         ${
                           product.inStock
                             ? "dark:bg-emerald-600 bg-emerald-600 text-white hover:bg-emerald-500 hover:scale-105 shadow-lg shadow-emerald-500/20"
                             : "bg-slate-800 text-slate-600 cursor-not-allowed"
                         }`}
          >
            <ShoppingCart className="cursor-pointer w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
