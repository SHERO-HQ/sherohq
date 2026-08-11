"use client";

import React, { memo } from "react";
import Link from "next/link";
import {
  Edit2,
  Trash2,
  ExternalLink,
  X,
  CheckCircle2,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import AppImage from "@/components/common/AppImage";
import { formatCurrency } from "@/utils/format";
import { getImageUrl } from "@/services/api";
import type { Product } from "@/types/product";

interface ProductRowProps {
  product: Product;
  canDelete: boolean;
  handleDelete: (id: string) => void;
  handleToggleStock: (product: Product) => void;
}

export const ProductRow = memo(function ProductRow({
  product,
  canDelete,
  handleDelete,
  handleToggleStock,
}: ProductRowProps) {
  return (
    <tr className="hover:bg-accent transition-colors group">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded bg-muted overflow-hidden shrink-0 border border-border">
            <AppImage
              src={getImageUrl(product.image)}
              alt={product.name}
              fill
              sizes="40px"
              className="object-cover"
            />
          </div>
          <div>
            <Link
              href={`/admin/products/${product.slug || product.sku || product.id}/edit`}
              className="text-sm font-semibold text-foreground hover:text-brand-secondary-400 transition-colors"
            >
              {product.name}
            </Link>
            <p className="text-xs text-muted-foreground font-mono">
              ID: {product.id.slice(0, 8)}
            </p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className="text-xs font-mono text-muted-foreground bg-muted/50 px-2 py-1 rounded">
          {product.sku || "-"}
        </span>
      </td>
      <td className="px-6 py-4 bg-transparent">
        <Badge
          variant="outline"
          className="bg-brand-secondary-500/10 text-brand-secondary-400 border-none capitalize"
        >
          {product.category}
        </Badge>
      </td>
      <td className="px-6 py-4 text-sm font-bold text-foreground">
        {formatCurrency(product.price)}
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-col gap-1">
          <span
            className={cn(
              "text-sm font-medium",
              (product.quantity ?? 0) === 0
                ? "text-rose-400"
                : (product.quantity ?? 0) <= 5
                  ? "text-amber-400"
                  : "text-brand-secondary-400",
            )}
          >
            {(product.quantity || 0) === 0
              ? "Out of stock"
              : `${product.quantity || 0} in stock`}
          </span>
          <div className="w-12 h-1 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition duration-500",
                (product.quantity ?? 0) === 0
                  ? "bg-rose-500"
                  : (product.quantity ?? 0) <= 5
                    ? "bg-amber-500"
                    : "bg-brand-secondary-500",
              )}
              style={{
                width: `${Math.min(100, ((product.quantity || 0) / 20) * 100)}%`,
              }}
            />
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            asChild
          >
            <Link
              href={`/admin/products/${product.slug || product.sku || product.id}/edit`}
            >
              <Edit2 className="w-4 h-4" />
            </Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="bg-card border-border text-foreground"
              align="end"
            >
              <DropdownMenuItem
                className="hover:bg-accent cursor-pointer"
                asChild
              >
                <a
                  href={`/shop/${product.slug || product.sku || product.id}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ExternalLink className="w-4 h-4 mr-2" /> View on Site
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="hover:bg-accent cursor-pointer"
                onClick={() => handleToggleStock(product)}
              >
                {product.inStock ? (
                  <>
                    <X className="w-4 h-4 mr-2" /> Mark Out of Stock
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" /> Mark In Stock
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-accent/50" />
              {canDelete && (
                <DropdownMenuItem
                  className="text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                  onClick={() => handleDelete(product.id)}
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Delete Product
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </td>
    </tr>
  );
});
