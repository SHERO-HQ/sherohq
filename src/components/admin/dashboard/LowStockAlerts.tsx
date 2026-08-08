"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchProducts } from "@/services/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/Skeleton";
import { AlertTriangle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ADMIN_KEYS } from "@/hooks/queries/useAdmin";

export function LowStockAlerts() {
  const { data: products, isLoading } = useQuery({
    queryKey: [...ADMIN_KEYS.all, "low-stock-products"],
    queryFn: () => fetchProducts(undefined, undefined, "low"),
    refetchInterval: 60000, // 1m
  });

  return (
    <Card className="bg-card/40 border-border overflow-hidden">
      <CardHeader className="pb-4 border-b border-border">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm text-foreground flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Low Stock Alerts
          </CardTitle>
          <div className="text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
            {products?.length || 0} items
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border max-h-[350px] overflow-y-auto custom-scrollbar">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-8 w-16" />
              </div>
            ))
          ) : !products || products.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground flex flex-col items-center justify-center gap-2">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center mb-2">
                <AlertTriangle className="w-5 h-5 text-emerald-500 opacity-50" />
              </div>
              <p>Inventory is healthy.</p>
              <p className="text-xs">No low stock items detected.</p>
            </div>
          ) : (
            products.slice(0, 5).map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-4 hover:bg-card/50 transition-colors group"
              >
                <div>
                  <h4 className="text-sm font-medium text-foreground line-clamp-1 group-hover:text-amber-400 transition-colors">
                    {product.name}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    SKU: {product.sku || "N/A"}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-bold text-amber-500">
                      {product.stockQuantity} left
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      In Stock
                    </span>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent"
                    asChild
                  >
                    <Link href={`/admin/products/${product.id}/edit`}>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))
          )}
          
          {products && products.length > 5 && (
            <div className="p-3 border-t border-border bg-card/30">
              <Button
                variant="ghost"
                className="w-full text-xs text-brand-secondary-400 hover:text-brand-secondary-300 hover:bg-brand-secondary-500/10"
                asChild
              >
                <Link href="/admin/products?stock=low">
                  View all {products.length} alerts
                </Link>
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
