import { readLocalPhoto } from "@/lib/admin/photo-store";

// Serves listing photos stored on local disk while developing. Hosted, photos
// come from Supabase Storage and this returns 404.
export async function GET(_request: Request, { params }: { params: Promise<{ name: string }> }) {
  const photo = await readLocalPhoto((await params).name);
  if (!photo) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(photo), {
    headers: { "Content-Type": "image/webp", "Cache-Control": "public, max-age=31536000, immutable" },
  });
}
