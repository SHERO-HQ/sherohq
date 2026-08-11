"use client";
import React from "react";
import {
  Package,
  ShoppingCart,
  Users,
  MessageSquare,
  ChevronRight,
  Command,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import AppImage from "@/components/common/AppImage";

interface ResultItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  image?: string;
  isSelected: boolean;
  onClick: () => void;
}

const ResultItem = ({
  icon,
  title,
  subtitle,
  image,
  isSelected,
  onClick,
}: ResultItemProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2 rounded transition-all text-left group",
        isSelected
          ? "bg-brand-secondary-500/10 border-l-2 border-brand-secondary-500 pl-2.5"
          : "hover:bg-accent border-l-2 border-transparent",
      )}
    >
      <div
        className={cn(
          "relative shrink-0 w-8 h-8 rounded flex items-center justify-center overflow-hidden border",
          isSelected
            ? "bg-brand-secondary-500/20 border-brand-secondary-500/30 text-brand-secondary-400"
            : "bg-muted border-border text-muted-foreground",
        )}
      >
        {image ? (
          <AppImage
            src={image}
            alt=""
            fill
            sizes="32px"
            className="object-cover"
          />
        ) : (
          icon
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div
          className={cn(
            "text-sm font-medium truncate",
            isSelected ? "text-foreground" : "text-muted-foreground",
          )}
        >
          {title}
        </div>
        <div className="text-xs text-muted-foreground truncate">{subtitle}</div>
      </div>
      <ChevronRight
        className={cn(
          "w-4 h-4 transition-transform",
          isSelected
            ? "text-brand-secondary-500 translate-x-0"
            : "text-slate-700 -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0",
        )}
      />
    </button>
  );
};

interface SearchResultsProps {
  normalizedResults: any | null;
  flatResults: any[];
  isLoading: boolean;
  query: string;
  selectedIndex: number;
  handleSelect: (item: any) => void;
}

export function SearchResults({
  normalizedResults,
  flatResults,
  isLoading,
  query,
  selectedIndex,
  handleSelect,
}: SearchResultsProps) {
  return (
    <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-2">
      {!normalizedResults && !isLoading && query.length < 2 && (
        <div className="py-12 flex flex-col items-center justify-center text-muted-foreground text-sm">
          <Command className="w-12 h-12 mb-4 opacity-10" />
          <p>Type at least 2 characters to search...</p>
          <div className="mt-6 flex items-center gap-4 text-[10px] text-muted-foreground uppercase tracking-widest">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-accent/50 border border-border text-foreground">
                ↑↓
              </kbd>{" "}
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-accent/50 border border-border text-foreground">
                ↵
              </kbd>{" "}
              Select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-accent/50 border border-border text-foreground">
                ESC
              </kbd>{" "}
              Close
            </span>
          </div>
        </div>
      )}

      {isLoading && !normalizedResults && (
        <div className="py-12 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-brand-secondary-400 animate-spin opacity-50" />
        </div>
      )}

      {normalizedResults && flatResults.length === 0 && (
        <div className="py-12 flex flex-col items-center justify-center text-muted-foreground">
          <p>No results found for "{query}"</p>
        </div>
      )}

      {normalizedResults && (
        <div className="space-y-4 py-2">
          {/* Products Section */}
          {normalizedResults.products.length > 0 && (
            <div>
              <h3 className="px-3 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <Package className="w-3 h-3" />
                Products
              </h3>
              <div className="mt-1 space-y-1">
                {normalizedResults.products.map((item: any) => (
                  <ResultItem
                    key={item.id}
                    icon={<Package className="w-4 h-4" />}
                    title={item.name}
                    subtitle={`SKU: ${item.sku} • $${item.price}`}
                    image={item.image}
                    isSelected={flatResults[selectedIndex]?.id === item.id}
                    onClick={() => handleSelect({ ...item, url: `/admin/products?edit=${item.id}` })}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Orders Section */}
          {normalizedResults.orders.length > 0 && (
            <div>
              <h3 className="px-3 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <ShoppingCart className="w-3 h-3" />
                Orders
              </h3>
              <div className="mt-1 space-y-1">
                {normalizedResults.orders.map((item: any) => (
                  <ResultItem
                    key={item.id}
                    icon={<ShoppingCart className="w-4 h-4" />}
                    title={`Order #${item.id.slice(0, 8)}`}
                    subtitle={`${item.shippingInfo?.firstName} ${item.shippingInfo?.lastName} • $${item.total} • ${item.status}`}
                    isSelected={flatResults[selectedIndex]?.id === item.id}
                    onClick={() => handleSelect({ ...item, url: `/admin/orders/${item.id}` })}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Customers Section */}
          {normalizedResults.users.length > 0 && (
            <div>
              <h3 className="px-3 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <Users className="w-3 h-3" />
                Customers
              </h3>
              <div className="mt-1 space-y-1">
                {normalizedResults.users.map((item: any) => (
                  <ResultItem
                    key={item.id}
                    icon={<Users className="w-4 h-4" />}
                    title={item.name}
                    subtitle={item.email}
                    image={item.avatar}
                    isSelected={flatResults[selectedIndex]?.id === item.id}
                    onClick={() => handleSelect({ ...item, url: `/admin/customers/${item.id}` })}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Inquiries Section */}
          {normalizedResults.inquiries.length > 0 && (
            <div>
              <h3 className="px-3 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <MessageSquare className="w-3 h-3" />
                Inquiries
              </h3>
              <div className="mt-1 space-y-1">
                {normalizedResults.inquiries.map((item: any) => (
                  <ResultItem
                    key={item.id}
                    icon={<MessageSquare className="w-4 h-4" />}
                    title={item.subject}
                    subtitle={`${item.name} • ${item.status}`}
                    isSelected={flatResults[selectedIndex]?.id === item.id}
                    onClick={() => handleSelect({ ...item, url: `/admin/inquiries?id=${item.id}` })}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
