import type { Metadata } from "next";
import Link from "next/link";
import { AdminHeader } from "@/components/admin/AdminShell";
import { RoleEditor } from "@/components/admin/RoleEditor";
import { InlineArrow } from "@/components/ui/InlineArrow";
import { requireAdmin } from "@/lib/admin/auth";
import { business } from "@/lib/site";

export const metadata: Metadata = { title: "New role" };

export default async function NewRolePage() {
  await requireAdmin();
  return (
    <>
      <AdminHeader title="New role" />
      <div className="flex flex-col gap-5 px-gutter py-6">
        <Link href="/admin/careers" className="self-start text-label text-primary hover:underline">
          <InlineArrow direction="left" /> All roles
        </Link>
        <RoleEditor
          id={null}
          saved={false}
          initial={{
            title: "",
            description: "",
            howToApply: `Email your CV to ${business.email} with the role in the subject.`,
            open: true,
          }}
        />
      </div>
    </>
  );
}
