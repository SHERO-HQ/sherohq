import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminShell";
import { Badge } from "@/components/admin/Badge";
import { buttonClass } from "@/components/ui/Button";
import { requireAdmin } from "@/lib/admin/auth";
import { adminProducts } from "@/lib/admin/products";

export const metadata: Metadata = { title: "Products" };

export default async function ProductsPage() {
  await requireAdmin();
  const rows = await adminProducts();
  return (
    <>
      <AdminHeader title="Products" meta={rows.length === 1 ? "1 product" : `${rows.length} products`}>
        <Link href="/admin/products/new" className={buttonClass()}>
          <Plus aria-hidden="true" size={18} strokeWidth={1.5} />
          New product
        </Link>
      </AdminHeader>
      <div className="px-gutter py-6">
        <p className="mb-5 max-w-measure text-body-sm text-ink-secondary">
          SHERO&rsquo;s own products. Each has a page at sherohq.com/its-address, a card on Home, and a place in the menu
          and footer once it&rsquo;s shown on the site.
        </p>
        {rows.length === 0 ? (
          <p className="py-8 text-body text-ink-secondary">No products yet.</p>
        ) : (
          <div className="overflow-hidden rounded-md border border-border">
            <table className="w-full text-left">
              <thead className="bg-surface font-mono text-meta text-ink-muted">
                <tr>
                  <th scope="col" className="px-4 py-3 font-normal">product</th>
                  <th scope="col" className="hidden px-4 py-3 font-normal md:table-cell">page</th>
                  <th scope="col" className="px-4 py-3 font-normal">status</th>
                  <th scope="col" className="hidden px-4 py-3 font-normal sm:table-cell">on the site</th>
                  <th scope="col" className="hidden px-4 py-3 font-normal md:table-cell">waitlist</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ product, signups }) => (
                  <tr key={product.id} className="border-t border-border">
                    <td className="px-4 py-3">
                      <Link href={`/admin/products/${product.id}`} className="text-body-sm font-medium text-heading hover:underline">
                        {product.name}
                      </Link>
                    </td>
                    <td className="hidden px-4 py-3 font-mono text-meta text-ink-secondary md:table-cell">/{product.slug}</td>
                    <td className="px-4 py-3">
                      {product.status === "live" ? <Badge tone="done">Live</Badge> : <Badge tone="todo">In development</Badge>}
                    </td>
                    <td className="hidden px-4 py-3 sm:table-cell">
                      {product.published ? <Badge tone="info">Shown</Badge> : <Badge tone="none">Hidden</Badge>}
                    </td>
                    <td className="hidden px-4 py-3 font-mono text-body-sm text-ink md:table-cell">{signups}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
