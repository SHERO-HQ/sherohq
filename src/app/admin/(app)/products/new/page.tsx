import type { Metadata } from "next";
import Link from "next/link";
import { AdminHeader } from "@/components/admin/AdminShell";
import { ProductEditor } from "@/components/admin/ProductEditor";
import { InlineArrow } from "@/components/ui/InlineArrow";
import { requireAdmin } from "@/lib/admin/auth";

export const metadata: Metadata = { title: "New product" };

export default async function NewProductPage() {
  await requireAdmin();
  return (
    <>
      <AdminHeader title="New product" />
      <div className="flex flex-col gap-5 px-gutter py-6">
        <Link href="/admin/products" className="self-start text-label text-primary hover:underline">
          <InlineArrow direction="left" /> All products
        </Link>
        <ProductEditor product={null} signups={0} saved={false} />
      </div>
    </>
  );
}
