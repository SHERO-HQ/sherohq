import { redirect } from "next/navigation";

// /products/:id → /shop/:id redirect
export default async function ProductRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/shop/${id}`);
}
