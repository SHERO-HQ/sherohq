"use client";
import { motion } from "motion/react";
import { ShoppingCart, Heart, Eye, Star } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useNotifications } from "@/hooks/useNotifications";
import { getImageUrl } from "@/services/api";
import { useWishlist } from "@/hooks/useWishlist";
import AppImage from "@/components/common/AppImage";
import type { Product } from "@/types/product";
import { COMPANY_CONTACTS } from "@/constants/contacts";
import { WhatsAppIcon } from "@/assets/icons/icons";
import { formatCurrency } from "@/utils/format";

import { getAbsoluteUrl } from "@/utils/subdomain";

interface ProductCardProps {
 product: Product;
 onQuickView?: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
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
 `/products/${product.slug || product.sku || product.id}`,
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
 `/products/${product.slug || product.sku || product.id}`,
 );
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
 whileHover={{ y: -5 }}
 onClick={handleCardClick}
 className="group relative rounded overflow-hidden
 dark:bg-white/5 bg-white backdrop-blur-sm
 border border-slate-200 dark:border-white/10 shadow-md shadow-black/5
 hover:border-emerald-500/50 dark:hover:border-emerald-400/30
 transition duration-500 cursor-pointer
 flex flex-col h-full"
 >
 {/* Immersive Hover Background */}
 <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-linear-to-b from-emerald-500/5 via-transparent to-transparent transition-opacity duration-500 pointer-events-none" />

 {/* Image Container */}
 <div className="relative aspect-square bg-slate-100 dark:bg-slate-900 overflow-hidden shrink-0">
 {product.image &&
 (product.image.startsWith("/uploads") ||
 product.image.startsWith("http")) ? (
 <AppImage
 src={getImageUrl(product.image)}
 alt={product.name}
 fill
 sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
 className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
 />
 ) : (
 <div className="absolute inset-0 flex items-center justify-center text-6xl select-none opacity-30 group-hover:scale-110 transition-transform duration-700">
 {product.image}
 </div>
 )}

 {/* Floating Quick Actions (Top) */}
 <div className="absolute top-3 right-3 z-20 flex flex-col gap-2">
 <button
 onClick={toggleWishlist}
 className="w-9 h-9 rounded-full bg-white/80 dark:bg-black/40 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-red-500 hover:text-white transition duration-300 shadow-lg"
 >
 <Heart
 size={16}
 className={isWishlisted ? "fill-current text-red-500" : ""}
 />
 </button>
 <button
 onClick={handleQuickView}
 className="w-9 h-9 rounded-full bg-white/80 dark:bg-black/40 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition duration-300 shadow-lg"
 >
 <Eye size={16} />
 </button>
 </div>

 {/* Badges (Bottom Left) */}
 <div className="absolute bottom-3 left-3 z-20 flex flex-wrap gap-1">
 {product.badge && (
 <span className="px-2 py-1 rounded text-[9px] font-black uppercase tracking-tighter bg-emerald-600 text-white shadow-lg shadow-emerald-900/40">
 {product.badge}
 </span>
 )}
 {discount > 0 && (
 <span className="px-2 py-1 rounded text-[9px] font-black uppercase tracking-tighter bg-red-600 text-white shadow-lg shadow-red-900/40">
 -{discount}%
 </span>
 )}
 {!product.inStock && (
 <span className="px-2 py-1 rounded text-[9px] font-black uppercase tracking-tighter bg-slate-900/80 text-white backdrop-blur-sm">
 Sold Out
 </span>
 )}
 </div>
 </div>

 {/* Content Area */}
 <div className="p-4 flex flex-col flex-1">
 <div className="flex-1">
 <div className="flex items-center justify-between mb-2">
 <span className="text-[10px] font-bold font-mono text-emerald-600 dark:text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded">
 {product.category}
 </span>
 <div className="flex items-center gap-1">
 <Star size={10} className="fill-amber-400 text-amber-400" />
 <span className="text-[10px] font-bold dark:text-slate-400">
 {product.rating}
 </span>
 </div>
 </div>

 <h3 className="text-sm sm:text-base font-black dark:text-white text-slate-800 leading-tight group-hover:text-emerald-500 transition-colors line-clamp-1 mb-1">
 {product.name}
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
 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 line-through mb-1">
 {formatCurrency(product.originalPrice)}
 </span>
 )}
 <div className="flex items-center justify-between gap-4">
 <span className="text-xl sm:text-2xl font-black dark:text-white text-slate-900 leading-none">
 {formatCurrency(product.price)}
 </span>
 {!product.inStock && (
 <span className="shrink-0 text-[8px] font-black uppercase text-red-500 bg-red-500/10 px-2 py-1 rounded border border-red-500/20">
 Out of Stock
 </span>
 )}
 </div>
 </div>

 <div className="flex items-center gap-1.5">
 <button
 onClick={handleAddToCart}
 disabled={!product.inStock}
 className="flex-1 h-10 rounded flex items-center justify-center gap-2 transition bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed border border-emerald-500/20 shadow-lg shadow-emerald-500/5 group/cart"
 >
 <ShoppingCart
 size={14}
 className="group-hover/cart:scale-110 transition-transform"
 />
 <span className="text-[10px] font-black uppercase tracking-wider hidden min-[400px]:inline">
 Add
 </span>
 </button>
 <button
 onClick={() => {
 addItem({
 id: product.id,
 name: product.name,
 price: product.price,
 image: product.image,
 category: product.category,
 });
 window.location.href = getAbsoluteUrl("/checkout");
 }}
 disabled={!product.inStock}
 className="flex-1 h-10 rounded bg-emerald-600 text-white font-black text-[10px] uppercase tracking-widest hover:bg-emerald-500 shadow-lg shadow-emerald-600/20 disabled:opacity-50 transition"
 >
 Buy
 </button>
 <a
 href={whatsappUrl}
 target="_blank"
 rel="noopener noreferrer"
 onClick={(e) => e.stopPropagation()}
 className="w-10 h-10 rounded flex items-center justify-center bg-[#25D366] text-white hover:bg-[#20bd5a] transition shadow-lg shadow-[#25D366]/20 shrink-0"
 >
 <WhatsAppIcon className="w-4 h-4" />
 </a>
 </div>
 </div>
 </div>
 </motion.div>
 );
};

export default ProductCard;
