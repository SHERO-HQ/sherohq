import { eq } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";
import { requireAdmin } from "@/lib/admin/auth";
import { waitlistFor, waitlistSteps } from "@/lib/admin/waitlists";
import { toCsv } from "@/lib/csv";
import { displayPhone } from "@/lib/phone";

/** One product's waitlist as a spreadsheet. Signed-in admin only. */
export async function GET(request: Request) {
  await requireAdmin();
  const id = new URL(request.url).searchParams.get("product") ?? "";
  if (!/^[0-9a-f-]{36}$/i.test(id)) return new Response("Not found", { status: 404 });
  const [product] = await db.select().from(products).where(eq(products.id, id)).limit(1);
  if (!product) return new Response("Not found", { status: 404 });

  const rows = await waitlistFor(id);
  const csv = toCsv(
    ["Name", product.businessLabel, "Phone", product.detailLabel, "Joined", "Status"],
    rows.map((r) => [
      r.name,
      r.business,
      displayPhone(r.phone),
      r.detail,
      r.createdAt.toISOString().slice(0, 10),
      waitlistSteps.find((s) => s.value === r.status)?.label ?? r.status,
    ]),
  );
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${product.slug}-waitlist-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
