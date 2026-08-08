"use client";

import { useTopProducts } from "@/hooks/queries/useAdmin";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Trophy, TrendingUp } from "lucide-react";
import Link from "next/link";

export function TopProductsWidget() {
  const { data: topProducts, isLoading } = useTopProducts();

  return (
    <Card className="bg-card/40 border-border overflow-hidden">
      <CardHeader className="pb-4 border-b border-border">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm text-foreground flex items-center gap-2">
            <Trophy className="w-4 h-4 text-brand-secondary-400" />
            Top Selling Products
          </CardTitle>
          <Link
            href="/admin/reports"
            className="text-xs text-brand-secondary-400 hover:text-brand-secondary-300 transition-colors"
          >
            View Full Report
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            ))
          ) : !topProducts || topProducts.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              No sales data available.
            </div>
          ) : (
            topProducts.slice(0, 4).map((product, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 hover:bg-card/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 text-center text-sm font-bold text-muted-foreground">
                    #{index + 1}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-foreground line-clamp-1">
                      {product.name}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {product.quantity} units sold
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-sm font-bold text-brand-secondary-400">
                    GHS
                    {product.revenue.toLocaleString("en-GH", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                  <div className="flex items-center text-[10px] text-brand-secondary-400/70">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Trending
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
