"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/queries/useCartQuery";
import { useWishlist } from "@/hooks/queries/useWishlistQuery";
import { useNotifications } from "@/hooks/useNotifications";
import { getImageUrl } from "@/services/api";
import type { Product } from "@/types/product";
import { useProducts } from "@/hooks/queries/useProducts";
import { getAbsoluteUrl } from "@/utils/subdomain";

export function useProductDetailState(product: Product) {
  const router = useRouter();
  const { addItem } = useCart();
  const { toggleWishlist: globalToggleWishlist, isInWishlist } = useWishlist();
  const { addNotification } = useNotifications();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const isWishlisted = isInWishlist(product.id);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const images = product.images || [product.image];
  const discount = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100,
      )
    : 0;

  const { data: allCategoryProducts = [], isLoading: relatedLoading } =
    useProducts(product.categoryId || product.category);

  const relatedProducts = allCategoryProducts
    .filter((p: Product) => p.id !== product.id)
    .slice(0, 4);

  const shareSlug = product.slug || product.sku || product.id;
  const shareUrl = getAbsoluteUrl(`/shop/${shareSlug}`);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
      });
    }
    setIsAddedToCart(true);
    setTimeout(() => setIsAddedToCart(false), 2000);
  };

  const nextImage = () =>
    setSelectedImage((prev) => (prev + 1) % images.length);
  const prevImage = () =>
    setSelectedImage((prev) => (prev - 1 + images.length) % images.length);

  useEffect(() => {
    if (isPreviewOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isPreviewOpen]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: images.map((img) => getImageUrl(img)),
    description: product.description || `Buy ${product.name} at SHERO`,
    sku: product.sku || product.id,
    brand: {
      "@type": "Brand",
      name: "SHERO",
    },
    offers: {
      "@type": "Offer",
      url: shareUrl,
      priceCurrency: "GHS",
      price: product.price,
      itemCondition:
        product.condition === "Used"
          ? "https://schema.org/UsedCondition"
          : product.condition === "Refurbished"
            ? "https://schema.org/RefurbishedCondition"
            : "https://schema.org/NewCondition",
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "SHERO",
      },
    },
    aggregateRating:
      product.reviews > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            reviewCount: product.reviews,
          }
        : undefined,
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (navigator.share) {
      navigator
        .share({
          title: product.name,
          url: shareUrl,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(shareUrl);
      addNotification(
        "Link Copied",
        "Product link copied to clipboard!",
        "success",
      );
    }
  };

  const handleMaximize = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsPreviewOpen(true);
  };

  return {
    router,
    selectedImage,
    setSelectedImage,
    quantity,
    setQuantity,
    isAddedToCart,
    isPreviewOpen,
    setIsPreviewOpen,
    isWishlisted,
    mounted,
    images,
    discount,
    relatedLoading,
    relatedProducts,
    shareUrl,
    jsonLd,
    handleAddToCart,
    nextImage,
    prevImage,
    globalToggleWishlist,
    handleShare,
    handleMaximize,
  };
}
