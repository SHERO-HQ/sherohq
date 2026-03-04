"use client";

/**
 * Seo — lightweight client-side title updater.
 *
 * Static marketing pages export `generateMetadata` from their page.tsx
 * (server-rendered), which handles <title>, description, OG, and canonical
 * tags in the initial HTML for crawlers and social sharing.
 *
 * This component handles dynamic titles (e.g. product name loaded from API)
 * by updating document.title after hydration.
 */
import { useEffect } from "react";

interface SeoProps {
  title?: string;
  /** Kept for API compatibility — set description via generateMetadata in page.tsx */
  description?: string;
  image?: string;
  url?: string;
  type?: string;
}

const Seo = ({ title }: SeoProps) => {
  const metaTitle = title ? `${title} | SHERO` : "SHERO - Redefine Possible";

  useEffect(() => {
    document.title = metaTitle;
  }, [metaTitle]);

  return null;
};

export default Seo;
