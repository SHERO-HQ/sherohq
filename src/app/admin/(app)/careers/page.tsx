import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { desc } from "drizzle-orm";
import { AdminHeader } from "@/components/admin/AdminShell";
import { Badge } from "@/components/admin/Badge";
import { adminCard, adminCardTitle } from "@/components/admin/parts";
import { buttonClass } from "@/components/ui/Button";
import { db } from "@/db";
import { roles } from "@/db/schema";
import { requireAdmin } from "@/lib/admin/auth";
import { formatGhanaDate } from "@/lib/dates";

export const metadata: Metadata = { title: "Careers" };

export default async function CareersAdminPage() {
  await requireAdmin();
  const rows = await db.select().from(roles).orderBy(desc(roles.updatedAt));
  const open = rows.filter((r) => r.open);
  const closed = rows.filter((r) => !r.open);

  const list = (items: typeof rows) => (
    <ul className="flex flex-col overflow-hidden rounded-md border border-border">
      {items.map((role) => (
        <li key={role.id} className="border-t border-border first:border-t-0">
          <Link href={`/admin/careers/${role.id}`} className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-surface">
            <span className="flex flex-col">
              <span className="text-body-sm font-medium text-heading">{role.title}</span>
              <span className="text-body-sm text-ink-secondary">
                {role.open
                  ? `open since ${formatGhanaDate(role.createdAt)}`
                  : `closed${role.closedAt ? ` · last open ${formatGhanaDate(role.closedAt)}` : ""}`}
              </span>
            </span>
            <Badge tone={role.open ? "done" : "none"}>{role.open ? "Open" : "Closed"}</Badge>
          </Link>
        </li>
      ))}
    </ul>
  );

  return (
    <>
      <AdminHeader title="Careers" meta={`${open.length} open`}>
        <Link href="/admin/careers/new" className={buttonClass()}>
          <Plus aria-hidden="true" size={18} strokeWidth={1.5} /> Add role
        </Link>
      </AdminHeader>
      <div className="flex max-w-3xl flex-col gap-6 px-gutter py-6">
        {open.length === 0 ? (
          <section className={adminCard}>
            <h2 className={adminCardTitle}>No open roles</h2>
            <p className="text-body-sm text-ink-secondary">
              The Careers page is showing the &ldquo;send your CV&rdquo; message. Add a role and switch it to Open to list it
              above that message.
            </p>
          </section>
        ) : (
          <section className="flex flex-col gap-3">
            <h2 className="text-label text-ink">Open, on the Careers page</h2>
            {list(open)}
          </section>
        )}
        {closed.length > 0 && (
          <section className="flex flex-col gap-3">
            <h2 className="text-label text-ink">Closed roles</h2>
            {list(closed)}
          </section>
        )}
        <p className="text-body-sm text-ink-secondary">CVs arrive by email and are kept for 12 months; delete older ones from the inbox.</p>
      </div>
    </>
  );
}
