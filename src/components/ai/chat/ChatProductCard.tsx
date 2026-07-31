import React from "react";
import AppImage from "@/components/common/AppImage";
import { getImageUrl } from "@/services/api";
import { useCart } from "@/context/CartContext";
import { Product } from "@/types/product";

export const ChatProductCard = ({ product }: { product: Product }) => {
  const { addItem, setIsCartOpen } = useCart();
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div
      onClick={() => {
        window.location.href = `/shop/${product.slug || product.sku || product.id}`;
      }}
      className="group relative rounded overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 hover:border-brand-secondary-500/80 dark:hover:border-brand-secondary-500/80 hover:shadow-lg transition-all duration-300 flex flex-col h-full cursor-pointer w-full"
    >
      {/* Compact Image */}
      <div className="relative aspect-video w-full bg-slate-50 dark:bg-slate-950 overflow-hidden shrink-0 border-b border-slate-150 dark:border-slate-800/60">
        {product.image && (product.image.startsWith("/uploads") || product.image.startsWith("http")) ? (
          <AppImage
            src={getImageUrl(product.image)}
            alt={product.name}
            fill
            sizes="160px"
            className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-3xl select-none opacity-30">
            {product.image}
          </div>
        )}
        {/* Badges */}
        <div className="absolute top-1.5 left-1.5 flex gap-1">
          {discount > 0 && (
            <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase bg-red-500 text-white leading-none">
              -{discount}%
            </span>
          )}
          {!product.inStock && (
            <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase bg-slate-950/80 text-white leading-none">
              Sold Out
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-2.5 flex flex-col flex-1 gap-1">
        <span className="text-[8px] font-bold font-mono text-brand-secondary-600 dark:text-brand-secondary-400 uppercase tracking-widest block">
          {product.category}
        </span>
        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight line-clamp-1 group-hover:text-brand-secondary-600 dark:group-hover:text-brand-secondary-400 transition-colors">
          {product.name}
        </h4>
        <div className="flex items-center justify-between mt-auto pt-2 gap-2">
          <span className="text-xs font-extrabold text-slate-900 dark:text-white leading-none">
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
            className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider bg-brand-secondary-600 hover:bg-brand-secondary-700 text-white rounded transition-colors disabled:opacity-50 cursor-pointer active:scale-95 shrink-0"
          >
            + Add
          </button>
        </div>
      </div>
    </div>
  );
};
