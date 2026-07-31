import React from "react";
import AppImage from "@/components/common/AppImage";
import { getImageUrl } from "@/services/api";
import { useCart } from "@/context/CartContext";
import { Product } from "@/types/product";
import Link from "next/link";
import { Plus } from "lucide-react";

export const ChatProductCard = ({ product }: { product: Product }) => {
  const { addItem, setIsCartOpen } = useCart();
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <Link
      href={`/shop/${product.slug || product.sku || product.id}`}
      className="group relative rounded-2xl overflow-hidden bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md transition-all duration-300 flex flex-col h-full w-full block"
    >
      {/* Compact Image */}
      <div className="relative aspect-square w-full bg-slate-50 dark:bg-slate-900/50 overflow-hidden shrink-0 border-b border-slate-100 dark:border-slate-700/30">
        {product.image && (product.image.startsWith("/uploads") || product.image.startsWith("http")) ? (
          <AppImage
            src={getImageUrl(product.image)}
            alt={product.name}
            fill
            sizes="160px"
            className="object-contain p-4 group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-3xl select-none opacity-30">
            {product.image}
          </div>
        )}
        {/* Badges */}
        <div className="absolute top-2 left-2 flex gap-1.5">
          {discount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm leading-none tracking-wide">
              -{discount}%
            </span>
          )}
          {!product.inStock && (
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-red-500 text-white shadow-sm leading-none tracking-wide">
              Sold Out
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col flex-1 gap-1.5">
        <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
          {product.category}
        </span>
        <h4 className="text-[13px] font-semibold text-slate-800 dark:text-slate-100 leading-snug line-clamp-2 group-hover:text-brand-secondary-600 dark:group-hover:text-brand-secondary-400 transition-colors">
          {product.name}
        </h4>
        <div className="flex items-center justify-between mt-auto pt-2 gap-2">
          <span className="text-xs font-bold text-slate-900 dark:text-white leading-none">
            GHS {product.price.toLocaleString("en-GH")}
          </span>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!product.inStock) return;
              addItem({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                category: product.category,
              });
              setIsCartOpen(true);
            }}
            disabled={!product.inStock}
            className="w-7 h-7 flex items-center justify-center bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-full transition-colors disabled:opacity-50 cursor-pointer shrink-0"
            aria-label="Add to cart"
          >
            <Plus size={14} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </Link>
  );
};
