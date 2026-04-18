"use client";
import { useEffect, useState } from "react";
import type { Product } from "@/types/product";
import ProductCard from "./ProductCard";
import { ProductCardSkeleton } from "@/components/ui/Skeleton";
import { getAIRecommendations } from "@/services/ai/recommendations";
import { Sparkles } from "lucide-react";

interface AIRecommendationsProps {
  currentProductId?: string;
  cartItemIds?: string[];
  title?: string;
}

/**
 * Placeholder component for future AI-powered product recommendations.
 */
export default function AIRecommendations({
  currentProductId,
  cartItemIds = [],
  title = "AI Recommends for You",
}: AIRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function fetchRecommendations() {
      setIsLoading(true);
      try {
        const data = await getAIRecommendations({
          viewedProductIds: currentProductId ? [currentProductId] : [],
          cartItemIds,
          limit: 4,
        });

        if (active) {
          setRecommendations(data);
        }
      } catch (error) {
        console.error("Failed to fetch AI recommendations", error);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    fetchRecommendations();

    return () => {
      active = false;
    };
  }, [currentProductId, cartItemIds]);

  // Hidden strictly until AI is actually implemented over the network
  if (!isLoading && recommendations.length === 0) {
    return null;
  }

  return (
    <div className="mt-24 border-t border-slate-200 dark:border-white/10 pt-20">
      <div className="flex flex-col items-center mb-12">
        <h2 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter text-center flex items-center gap-2">
          <Sparkles className="size-5 sm:size-8 text-brand-secondary-500" />
          {title}
        </h2>
        <p className="text-sm text-slate-500 mt-2">Powered by SHERO AI</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {isLoading
          ? [1, 2, 3, 4].map((i) => (
              <ProductCardSkeleton key={`ai-skeleton-${i}`} />
            ))
          : recommendations.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  );
}
