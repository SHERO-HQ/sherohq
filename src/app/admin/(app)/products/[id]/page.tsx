import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminHeader } from "@/components/admin/AdminShell";
import { Badge } from "@/components/admin/Badge";
import { ImageManager } from "@/components/admin/ImageManager";
import { removePreview, setPreview } from "../actions";
import { ProductEditor } from "@/components/admin/ProductEditor";
import { InlineArrow } from "@/components/ui/InlineArrow";
import { requireAdmin } from "@/lib/admin/auth";
import { adminProduct } from "@/lib/admin/products";
import { productPath } from "@/lib/products";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await requireAdmin();
  const row = await adminProduct((await params).id);
  return { title: row?.product.name ?? "Product" };
}

export default async function ProductAdminPage({ params, searchParams }: Props) {
  await requireAdmin();
  const [row, { saved }] = await Promise.all([adminProduct((await params).id), searchParams]);
  if (!row) notFound();
  const { product, signups } = row;
  return (
    <>
      <AdminHeader
        title={product.name}
        badge={product.published ? <Badge tone="info">Shown</Badge> : <Badge tone="none">Hidden</Badge>}
      />
      <div className="flex flex-col gap-5 px-gutter py-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/admin/products" className="text-label text-primary hover:underline">
            <InlineArrow direction="left" /> All products
          </Link>
          {product.published && (
            <a href={productPath(product.slug)} target="_blank" rel="noopener noreferrer" className="text-label text-primary hover:underline">
              See its page <InlineArrow />
            </a>
          )}
        </div>
        <ProductEditor
          product={product}
          signups={signups}
          saved={saved === "1"}
          preview={
            <ImageManager
              id={product.id}
              url={product.previewUrl}
              title="Dashboard preview"
              empty="No preview yet: the page shows a marked placeholder."
              hint={
                product.status === "in_development"
                  ? "A screenshot, 16:9 works best. While in development it's shown with a \"Preview · in development\" tag."
                  : "A screenshot, 16:9 works best."
              }
              actions={{ set: setPreview, remove: removePreview }}
            />
          }
        />
      </div>
    </>
  );
}
