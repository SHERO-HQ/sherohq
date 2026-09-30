import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { deleteRole } from "../actions";
import { AdminHeader } from "@/components/admin/AdminShell";
import { Badge } from "@/components/admin/Badge";
import { DangerButton } from "@/components/admin/controls";
import { RoleEditor } from "@/components/admin/RoleEditor";
import { InlineArrow } from "@/components/ui/InlineArrow";
import { db } from "@/db";
import { roles } from "@/db/schema";
import { requireAdmin } from "@/lib/admin/auth";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> };

export const metadata: Metadata = { title: "Role" };

export default async function RolePage({ params, searchParams }: Props) {
  await requireAdmin();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const [[role], { saved }] = await Promise.all([db.select().from(roles).where(eq(roles.id, id)).limit(1), searchParams]);
  if (!role) notFound();
  return (
    <>
      <AdminHeader title={role.title} badge={<Badge tone={role.open ? "done" : "none"}>{role.open ? "Open" : "Closed"}</Badge>} />
      <div className="flex flex-col gap-5 px-gutter py-6">
        <Link href="/admin/careers" className="self-start text-label text-primary hover:underline">
          <InlineArrow direction="left" /> All roles
        </Link>
        <RoleEditor
          id={role.id}
          saved={saved === "1"}
          initial={{ title: role.title, description: role.description, howToApply: role.howToApply, open: role.open }}
        />
        <div className="border-t border-border pt-5">
          <DangerButton
            label="Delete role"
            confirmText={`Delete ${role.title}? To take it off the site but keep it, switch it to closed instead.`}
            action={deleteRole.bind(null, role.id)}
            after="/admin/careers"
          />
        </div>
      </div>
    </>
  );
}
