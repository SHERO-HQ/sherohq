"use client";
import { ShoppingCart, Heart, Eye, Star, Flame } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/queries/useCartQuery";
import { useNotifications } from "@/hooks/useNotifications";
import { getImageUrl } from "@/services/api";
import { useWishlist } from "@/hooks/queries/useWishlistQuery";
import AppImage from "@/components/common/AppImage";
import type { Product } from "@/types/product";
import { COMPANY_CONTACTS } from "@/constants/contacts";
import { WhatsAppIcon } from "@/assets/icons/icons";
import { formatCurrency } from "@/utils/format";
import { trackAddToCart } from "@/lib/tracking";

import { getAbsoluteUrl } from "@/utils/subdomain";

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const router = useRouter();
  const { addItem } = useCart();
  const { addNotification } = useNotifications();
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
    trackAddToCart(product);
    addNotification(
      "Added to Cart",
      `${product.name} has been added to your cart.`,
      "success",
    );
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickView) {
      onQuickView(product);
    } else {
      window.location.href = getAbsoluteUrl(
        `/shop/${product.slug || product.sku || product.id}`,
      );
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
    window.location.href = getAbsoluteUrl(
      `/shop/${product.slug || product.sku || product.id}`,
    );
  };

  const shareLink = getAbsoluteUrl(
    `/shop/${product.slug || product.sku || product.id}`,
  );

  const whatsappMessage = encodeURIComponent(
    `Hello Shero, I'm interested in the ${product.name} (${formatCurrency(product.price)}). Here is the link:\n${shareLink}\n\nCould you please provide more details or assist me with the purchase? Thank you!`,
  );
  const whatsappUrl = `https://wa.me/${COMPANY_CONTACTS.WHATSAPP}?text=${whatsappMessage}`;

  return (
    <div
      onClick={handleCardClick}
      className="group relative rounded overflow-hidden
 dark:bg-white/5 bg-white
 border border-slate-200 dark:border-white/10
 hover:border-brand-secondary-500/50 dark:hover:border-brand-secondary-400/30
 hover:-translate-y-0.75 hover:shadow-sm dark:hover:shadow-black/20
 transition-all duration-300 ease-out cursor-pointer
 flex flex-col h-full will-change-transform"
      style={{
        isolation: "isolate",
        contain: "layout style paint",
      }}
    >
      {/* Immersive Hover Background */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-40 bg-linear-to-b from-brand-secondary-500/5 via-transparent to-transparent transition-opacity duration-500 pointer-events-none" />

      {/* Image Container */}
      <div className="relative aspect-3/4 sm:aspect-4/5 lg:aspect-3/4 bg-slate-100 dark:bg-slate-900 overflow-hidden shrink-0">
        {product.image &&
        (product.image.startsWith("/uploads") ||
          product.image.startsWith("http")) ? (
          <AppImage
            src={getImageUrl(product.image)}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-contain object-center sm:group-hover:scale-105 sm:transition-transform sm:duration-500 will-change-auto"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-6xl select-none opacity-30 group-hover:scale-105 transition-transform duration-700">
            {product.image}
          </div>
        )}

        {/* Floating Quick Actions (Top Right) */}
        <div className="absolute top-3 right-3 z-20 flex flex-col gap-2">
          {/* Primary Action - Always Visible */}
          <button
            onClick={toggleWishlist}
            className="w-9 h-9 rounded-full bg-white/90 dark:bg-black/60 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all duration-300 shadow-sm cursor-pointer"
            title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            aria-label={isWishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          >
            <Heart
              size={16}
              className={isWishlisted ? "fill-current text-red-500" : ""}
            />
          </button>

          {/* Secondary Actions - Slide in on Hover (Always visible on mobile) */}
          <div className="flex flex-col gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 translate-x-0 lg:translate-x-4 lg:group-hover:translate-x-0 transition-all duration-300 pointer-events-auto lg:pointer-events-none lg:group-hover:pointer-events-auto">
            <button
              onClick={handleQuickView}
              className="w-9 h-9 rounded-full bg-white/90 dark:bg-black/60 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-brand-secondary-500 hover:text-white transition-all duration-300 shadow-sm cursor-pointer"
              title="Quick view"
              aria-label={`Quick view ${product.name}`}
            >
              <Eye size={16} />
            </button>
          </div>
        </div>

        {/* Badges (Bottom Left) */}
        <div className="absolute bottom-3 left-3 z-20 flex flex-wrap gap-1">
          {product.badge && (
            <span className="px-2.5 py-1 rounded text-[9px] font-semibold uppercase tracking-tight bg-brand-secondary-600 text-white">
              {product.badge}
            </span>
          )}
          {discount > 0 && (
            <span className="px-2.5 py-1 rounded text-[9px] font-semibold uppercase tracking-tight bg-red-600 text-white">
              -{discount}%
            </span>
          )}
          {product.inStock &&
            typeof product.quantity === "number" &&
            product.quantity > 0 &&
            product.quantity <= 5 && (
              <span className="px-2.5 py-1 rounded text-[9px] font-bold uppercase tracking-tight bg-amber-500 text-slate-950 flex items-center gap-1 animate-pulse">
                <Flame size={10} className="fill-current" />
                Only {product.quantity} left!
              </span>
            )}
          {!product.inStock && (
            <span className="px-2.5 py-1 rounded text-[9px] font-semibold uppercase tracking-tight bg-slate-900/80 text-white ">
              Sold Out
            </span>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold font-mono text-brand-secondary-700 dark:text-brand-secondary-300 uppercase tracking-widest bg-brand-secondary-500/10 px-2 py-0.5 rounded">
              {product.category}
            </span>
            {product.rating > 0 && (
              <div className="flex items-center gap-1">
                <Star size={11} className="fill-amber-400 text-amber-400" />
                <span className="text-xs font-bold dark:text-slate-400">
                  {product.rating}
                </span>
              </div>
            )}
          </div>

          <h3 className="text-sm sm:text-base font-semibold dark:text-white text-slate-800 leading-tight group-hover:text-brand-secondary-500 transition-colors line-clamp-1 mb-1">
            <span>{product.name}</span>
          </h3>

          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed h-10">
            {product.description ||
              (product.specifications
                ? Object.values(product.specifications).slice(0, 2).join(" • ")
                : "")}
          </p>
        </div>

        {/* Pricing & CTA Bar */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/5 flex flex-col gap-4">
          <div className="flex flex-col">
            {product.originalPrice && (
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 line-through mb-1">
                {formatCurrency(product.originalPrice)}
              </span>
            )}
            <div className="flex flex-col-reverse justify-between gap-4">
              <span className="text-lg sm:text-xl font-semibold dark:text-white text-slate-900 leading-none">
                {formatCurrency(product.price)}
              </span>
              {!product.inStock && (
                <span className="shrink-0 text-[8px] font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20 w-fit">
                  Out of Stock
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleAddToCart}
              disabled={!product.inStock}
              aria-label={`Add ${product.name} to cart`}
              className="flex-1 h-10 rounded flex items-center justify-center gap-2 transition bg-brand-secondary-500/10 text-brand-secondary-700 dark:text-brand-secondary-300 hover:bg-brand-secondary-600 hover:text-white! disabled:opacity-50 disabled:cursor-not-allowed border border-brand-secondary-500/20 group/cart cursor-pointer"
            >
              <ShoppingCart
                size={14}
                className="group-hover/cart:scale-110 transition-transform"
              />
              <span className="text-xs font-bold uppercase tracking-wider hidden min-100:inline">
                Add
              </span>
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                addItem({
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  image: product.image,
                  category: product.category,
                });
                router.push("/shop/checkout");
              }}
              disabled={!product.inStock}
              aria-label={`Buy ${product.name} now`}
              className="flex-1 h-10 rounded bg-brand-secondary-800 text-white font-bold text-xs uppercase tracking-widest hover:bg-brand-secondary-700 disabled:opacity-50 transition cursor-pointer"
            >
              Buy
            </button>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              aria-label={`Inquire about ${product.name} on WhatsApp`}
              className="w-10 h-10 rounded flex items-center justify-center bg-[#25D366] text-white hover:bg-[#20bd5a] transition shrink-0"
            >
              <WhatsAppIcon className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
