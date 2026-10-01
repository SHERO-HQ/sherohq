import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { shopUrl, whatsappLink } from "@/lib/site";

export const metadata: Metadata = { title: "Not in the shop" };

// An unknown or old laptop link (sold devices leave the shop). The shop layout
// already has the header, footer and <main>.
export default function ShopNotFound() {
  return (
    <div className="container-site flex flex-col items-start gap-5 py-section">
      <p className="font-mono text-meta font-medium text-secondary">error 404</p>
      <h1 className="max-w-measure font-display text-h1 text-heading">That device isn&rsquo;t in the shop.</h1>
      <p className="max-w-measure text-body-lg text-ink-secondary">
        It may have sold: each listing is one device, and it leaves the shop once it&rsquo;s gone. Here&rsquo;s what&rsquo;s
        in stock now, or tell us what you need and we&rsquo;ll look out for one.
      </p>
      <div className="flex flex-wrap gap-3">
        <ButtonLink href={shopUrl.home} size="lg">
          See what&rsquo;s in stock
        </ButtonLink>
        <ButtonLink href={whatsappLink("Hi SHERO, I'm looking for: ")} variant="secondary" size="lg" external>
          Ask on WhatsApp
        </ButtonLink>
      </div>
      <Link href={shopUrl.track} className="text-label text-primary hover:underline">
        Looking for an order? Track it
      </Link>
    </div>
  );
}
