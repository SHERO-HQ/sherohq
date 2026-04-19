import { redirect } from "next/navigation";
import { generateMetadata as sharedGenerateMetadata } from "../../shop/[id]/page";

export const generateMetadata = sharedGenerateMetadata;

// /products/:id → /shop/:id redirect
export default async function ProductRedirect({
 params,
}: {
 params: Promise<{ id: string }>;
}) {
 const { id } = await params;
 redirect(`/shop/${id}`);
}
