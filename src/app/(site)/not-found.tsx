import type { Metadata } from "next";
import { NotFoundContent, notFoundClass } from "@/components/layout/NotFoundContent";

export const metadata: Metadata = { title: "Page not found" };

// For notFound() inside the site (e.g. /login matching the product route, or a
// sold laptop's old link): the (site) layout already has the header, footer
// and <main>, so this adds only the message.
export default function SiteNotFound() {
  return (
    <div className={notFoundClass}>
      <NotFoundContent />
    </div>
  );
}
