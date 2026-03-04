"use client";
import { motion } from "motion/react";
import { ShoppingCart, Heart, Eye, Star, CreditCard } from "lucide-react";
import { useUniversalNavigate } from "@/hooks/useUniversalNavigate";
import { useCart } from "@/context/CartContext";
import { useNotifications } from "@/hooks/useNotifications";
import { getImageUrl } from "@/services/api";
import { useWishlist } from "@/hooks/useWishlist";
import type { Product } from "@/types/product";
import { COMPANY_CONTACTS } from "@/constants/contacts";
import { WhatsAppIcon } from "@/assets/icons/icons";
import { formatCurrency } from "@/utils/format";

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const { addItem } = useCart();
  const { addNotification } = useNotifications();
  const navigate = useUniversalNavigate();
  const { toggleWishlist: globalToggleWishlist, isInWishlist } = useWishlist();
  const isWishlisted = isInWishlist(product.id);

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
    addNotification(
      "Added to Cart",
      `${product.name} has been added to your cart.`,
      "success",
    );
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
    });
    navigate("/checkout");
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickView) {
      onQuickView(product);
    } else {
      navigate(`/products/${product.slug || product.sku || product.id}`);
    }
  };

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    globalToggleWishlist({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
    });
  };

  const handleCardClick = () => {
    navigate(`/products/${product.slug || product.sku || product.id}`);
  };

  const getConditionStyles = (condition: string) => {
    switch (condition) {
      case "New":
        return "bg-emerald-600 shadow-emerald-900/20";
      case "Refurbished":
        return "bg-blue-600 shadow-blue-900/20";
      default:
        return "bg-amber-600 shadow-amber-900/20";
    }
  };

  const whatsappMessage = encodeURIComponent(
    `Hi SHERO, I'm interested in inquiring about ${product.name}. Is it still available?`,
  );
  const whatsappUrl = `https://wa.me/${COMPANY_CONTACTS.WHATSAPP}?text=${whatsappMessage}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -8 }}
      onClick={handleCardClick}
      className="group relative rounded overflow-hidden
               dark:bg-slate-900/60 bg-white backdrop-blur-md
               border border-slate-300 dark:border-white/10 shadow-md
               hover:border-emerald-500/50 dark:hover:border-emerald-400/40
               hover:shadow-2xl hover:shadow-emerald-500/20 dark:hover:shadow-emerald-400/10
               transition-all duration-500 cursor-pointer
               flex flex-col h-full"
    >
      {/* Hover Glow Effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-linear-to-b from-emerald-500/15 dark:from-emerald-400/8 to-transparent transition-opacity duration-500 pointer-events-none" />

      {/* Badges */}
      <div className="absolute top-2 sm:top-3 left-2 sm:left-3 z-20 flex flex-col items-start gap-1">
        {product.badge && (
          <span className="px-2 py-1 rounded text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-emerald-600 text-white shadow-lg shadow-emerald-900/20">
            {product.badge}
          </span>
        )}
        {discount > 0 && (
          <span className="px-2 py-1 rounded text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-red-600 text-white shadow-lg shadow-red-900/20 w-fit">
            -{discount}%
          </span>
        )}
      </div>

      {/* Wishlist Button */}
      <button
        onClick={toggleWishlist}
        aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        className="absolute top-2 sm:top-3 right-2 sm:right-3 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded
                 bg-black/20 backdrop-blur-md border border-white/10
                 flex items-center justify-center
                 hover:bg-red-500 hover:border-red-400
                 transition-all duration-300 group/heart cursor-pointer"
      >
        <Heart
          className={`w-4 h-4 sm:w-5 sm:h-5 transition-all duration-300 ${
            isWishlisted
              ? "fill-red-600 text-red-600 group-hover/heart:text-white hover:scale-110"
              : "text-white/70 group-hover/heart:text-white"
          }`}
        />
      </button>

      {/* Image Container */}
      <div className="relative aspect-square bg-linear-to-br from-slate-800 to-slate-900 overflow-hidden shrink-0">
        {/* Render Image or Emoji */}
        {product.image &&
        (product.image.startsWith("/uploads") ||
          product.image.startsWith("http")) ? (
          <img
            src={getImageUrl(product.image)}
            alt={product.name}
            width={400}
            height={400}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src =
                "https://placehold.co/600x400?text=No+Image";
            }}
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
                           flex items-center gap-2 px-5 py-2 rounded
                           bg-white/10 backdrop-blur-md border border-white/20
                           text-white font-medium text-sm
                           hover:bg-emerald-600 hover:border-emerald-500 cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            View Details
          </button>
        </div>
        <div className="absolute bottom-2 left-2 z-20 pointer-events-none flex flex-wrap gap-1">
          {product.condition && (
            <span
              className={`px-2 py-1 rounded text-[10px] sm:text-xs font-bold uppercase tracking-wider text-white shadow-lg ${getConditionStyles(product.condition)}`}
            >
              {product.condition}
            </span>
          )}
          {!product.inStock && (
            <span className="px-2 py-1 rounded text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-slate-700 text-slate-300 shadow-lg shadow-black/20">
              Sold Out
            </span>
          )}
        </div>
      </div>

      {/* Product Info */}
      <div className="p-3 sm:p-4 relative z-10 cursor-pointer flex-1 flex flex-col">
        <div className="flex flex-col justify-between items-start flex-1">
          <div className="inline-flex items-center justify-between w-full mb-1.5 sm:mb-2">
            <p className="text-[10px] sm:text-xs font-medium dark:bg-white/5 bg-emerald-100 px-1 sm:px-1.5 py-0.5 rounded dark:text-emerald-400 text-emerald-800 uppercase tracking-wide">
              {product.category}
            </p>
            <span className="flex items-center gap-0.5 sm:gap-1 dark:bg-white/5 bg-slate-300/60 px-1 sm:px-1.5 py-0.5 rounded text-[11px] sm:text-sm dark:text-slate-300 text-slate-900">
              <Star className={`w-3 h-3 fill-amber-400 text-amber-400`} />
              <span className="ml-0.5 sm:ml-1 text-xs">{product.rating}</span>
            </span>
          </div>
          <h3 className="text-sm sm:text-base font-bold dark:text-white text-slate-900 leading-tight dark:group-hover:text-emerald-300 group-hover:text-emerald-600 transition-colors line-clamp-2">
            {product.name}
          </h3>
          {product.specifications &&
            Object.values(product.specifications).length > 0 && (
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 min-h-[2.5em]">
                {Object.values(product.specifications).slice(0, 3).join(" •")}
              </p>
            )}
          {!product.specifications && product.description && (
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 min-h-[2.5em]">
              {product.description}
            </p>
          )}
        </div>

        <div className="flex items-end justify-between mt-2 sm:mt-3 gap-1">
          <div className="flex flex-col gap-1 min-w-0 shrink">
            {product.originalPrice && (
              <span className="text-[10px] sm:text-xs text-slate-500 line-through truncate">
                {formatCurrency(product.originalPrice)}
              </span>
            )}
            <span className="text-sm sm:text-lg font-sora font-bold dark:text-white text-slate-900 truncate">
              {formatCurrency(product.price)}
            </span>
          </div>
        </div>
        <div className="flex gap-1 sm:gap-2 shrink-0 mt-2">
          <button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            aria-label={`Add ${product.name} to cart`}
            className={` p-2 rounded flex items-center justify-center transition-all duration-300 cursor-pointer border w-full
                           ${
                             product.inStock
                               ? "border-emerald-600 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                               : "border-slate-700 bg-slate-800 text-slate-600 cursor-not-allowed"
                           }`}
          >
            <ShoppingCart className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
          </button>

          <button
            onClick={handleBuyNow}
            disabled={!product.inStock}
            className={`p-2 rounded flex items-center justify-center gap-1 transition-all duration-300 cursor-pointer text-[10px] sm:text-sm font-bold w-full
                           ${
                             product.inStock
                               ? "dark:bg-emerald-600 bg-emerald-600 text-white hover:bg-emerald-500 hover:scale-105 shadow-lg shadow-emerald-500/20"
                               : "bg-slate-800 text-slate-600 cursor-not-allowed"
                           }`}
          >
            <CreditCard className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>Buy</span>
          </button>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="w-full p-2 rounded flex items-center justify-center bg-[#25D366] hover:bg-[#20bd5a] text-white transition-all duration-300 shadow-lg shadow-[#25D366]/20"
            aria-label="Inquire via WhatsApp"
          >
            <WhatsAppIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          </a>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
